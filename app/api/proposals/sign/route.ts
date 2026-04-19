import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { sendEmail, isEmailConfigured } from "@/lib/email";
import { Timestamp } from "firebase-admin/firestore";

// Vercel redeploy trigger - Firebase Admin env vars now configured

// GET - Fetch signing request by token
export async function GET(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json({ error: "Token required" }, { status: 400 });
    }

    // Query Firestore using Admin SDK
    const snapshot = await adminDb
      .collection(COLLECTIONS.PROPOSAL_SIGNATURES)
      .where("token", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Signing request not found" }, { status: 404 });
    }

    const sigDoc = snapshot.docs[0];
    const data = sigDoc.data();

    // Check if expired
    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return NextResponse.json({ error: "This signing link has expired" }, { status: 410 });
    }

    // Check if already signed
    if (data.status === "signed") {
      return NextResponse.json({
        error: "This document has already been signed",
        alreadySigned: true,
        signedAt: data.signedAt?.toDate?.()?.toISOString() || data.signedAt,
      }, { status: 409 });
    }

    return NextResponse.json({
      id: sigDoc.id,
      proposalName: data.proposalName,
      proposalType: data.proposalType,
      proposalHtml: data.proposalHtml,
      senderName: data.senderName,
      senderEmail: data.senderEmail,
      recipientName: data.recipientName,
      recipientEmail: data.recipientEmail,
      status: data.status,
      createdAt: data.createdAt?.toDate?.()?.toISOString() || null,
      // Include hosting/payment info for Stripe integration
      hostingEnabled: data.hostingEnabled || false,
      monthlyFee: data.monthlyFee || 0,
      clientName: data.clientName || "",
    });
  } catch (error) {
    console.error("Get signing request error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    const stack = error instanceof Error ? error.stack : "";
    console.error("Error stack:", stack);
    return NextResponse.json({ 
      error: "Failed to fetch signing request", 
      details: message,
      stack: process.env.NODE_ENV === "development" ? stack : undefined
    }, { status: 500 });
  }
}

// POST - Submit signature
export async function POST(request: NextRequest) {
  try {
    if (!adminDb) {
      return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
    }

    const body = await request.json();
    const { token, signerName, signerTitle, signerCompany, signatureData } = body;

    if (!token || !signerName || !signatureData) {
      return NextResponse.json(
        { error: "Missing required fields: token, signerName, signatureData" },
        { status: 400 }
      );
    }

    // Find the signing request using Admin SDK
    const snapshot = await adminDb
      .collection(COLLECTIONS.PROPOSAL_SIGNATURES)
      .where("token", "==", token)
      .limit(1)
      .get();

    if (snapshot.empty) {
      return NextResponse.json({ error: "Signing request not found" }, { status: 404 });
    }

    const sigDoc = snapshot.docs[0];
    const data = sigDoc.data();

    if (data.status === "signed") {
      return NextResponse.json({ error: "Document already signed" }, { status: 409 });
    }

    if (data.expiresAt && new Date(data.expiresAt) < new Date()) {
      return NextResponse.json({ error: "Signing link has expired" }, { status: 410 });
    }

    // Generate Nelinia Varenas' signature (CEO auto-sign)
    const neliniaSignature = generateNeliniaSignature();

    // Generate the signed PDF HTML with both signatures embedded
    const signedPdfHtml = generateSignedPdfHtml({
      proposalHtml: data.proposalHtml,
      signerName,
      signerTitle: signerTitle || "",
      signerCompany: signerCompany || "",
      signatureData,
      signedAt: new Date().toISOString(),
      proposalName: data.proposalName,
      neliniaSignature,
    });

    // Convert HTML to base64 for storage
    const signedPdfBase64 = Buffer.from(signedPdfHtml, "utf-8").toString("base64");

    const signedAtTimestamp = Timestamp.now();

    // Update the signing request in Firestore using Admin SDK
    await sigDoc.ref.update({
      status: "signed_countersigned",
      signedAt: signedAtTimestamp,
      signerName,
      signerTitle: signerTitle || "",
      signerCompany: signerCompany || "",
      signatureData,
      signedPdfBase64,
      signedPdfGeneratedAt: Timestamp.now(),
      signerIp: request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown",
      countersignedBy: "Nelinia Varenas",
      countersignedAt: signedAtTimestamp,
    });

    // Update the original proposal document with signature data and signatureId for download link
    if (data.proposalId) {
      try {
        const proposalRef = adminDb.collection(COLLECTIONS.PROPOSALS).doc(data.proposalId);
        await proposalRef.update({
          status: "signed_countersigned",
          signedAt: signedAtTimestamp,
          signerName,
          signerTitle: signerTitle || "",
          signerCompany: signerCompany || "",
          signatureData,
          signatureId: sigDoc.id,
          countersignedBy: "Nelinia Varenas",
          countersignedAt: signedAtTimestamp,
          updatedAt: Timestamp.now(),
        });
        console.log(`Proposal ${data.proposalId} updated with signatureId ${sigDoc.id}`);
      } catch (proposalUpdateError) {
        console.error("Failed to update proposal document:", proposalUpdateError);
        // Don't fail the signing process if proposal update fails
      }
    } else {
      console.warn(`Sign route: no proposalId on signing request ${sigDoc.id} — proposal document will NOT be updated. The signing record was stored but the proposal list won't show the signed status.`);
    }

    // Send confirmation email with signed PDF link to the signer
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://strategicvalueplus.com";
    const downloadUrl = `${baseUrl}/api/proposals/download-signed?id=${sigDoc.id}`;

    if (isEmailConfigured()) {
      // Email to signer
      const signerEmailHtml = generateSignerConfirmationEmail({
        signerName,
        proposalName: data.proposalName,
        proposalType: data.proposalType,
        senderName: data.senderName,
        downloadUrl,
      });

      await sendEmail({
        to: data.recipientEmail,
        subject: `Signed: ${data.proposalName} — Your Copy`,
        html: signerEmailHtml,
        attachments: [
          {
            name: `${data.proposalName.replace(/[^a-z0-9]/gi, "_")}_Signed.html`,
            contentType: "text/html",
            contentBytes: signedPdfBase64,
          },
        ],
      });

      // Email notification to sender
      const senderEmailHtml = generateSenderNotificationEmail({
        signerName,
        signerCompany: signerCompany || "",
        proposalName: data.proposalName,
        proposalType: data.proposalType,
        downloadUrl,
      });

      if (data.senderEmail) {
        await sendEmail({
          to: data.senderEmail,
          subject: `Document Signed: ${data.proposalName} — by ${signerName}`,
          html: senderEmailHtml,
        });
      }
    } else {
      console.warn("SMTP not configured. Download URL:", downloadUrl);
    }

    return NextResponse.json({
      success: true,
      message: "Document signed successfully",
      downloadUrl,
      // Include hosting info so frontend can redirect to payment if needed
      hostingEnabled: data.hostingEnabled || false,
      monthlyFee: data.monthlyFee || 0,
      clientName: data.clientName || "",
      signatureId: sigDoc.id,
    });
  } catch (error) {
    console.error("Sign proposal error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: "Failed to process signature", details: message }, { status: 500 });
  }
}

function generateNeliniaSignature(): string {
  // Generate Nelinia Varenas' signature as a typed signature
  const canvas = {
    width: 400,
    height: 100,
  };
  
  // Create a simple SVG signature for Nelinia Varenas
  const svg = `
    <svg width="${canvas.width}" height="${canvas.height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="white"/>
      <text x="20" y="60" font-family="Georgia, Times New Roman, serif" font-size="36" font-style="italic" fill="#1e293b">Nelinia Varenas</text>
    </svg>
  `;
  
  // Convert SVG to base64 data URL
  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

function generateSignedPdfHtml(params: {
  proposalHtml: string;
  signerName: string;
  signerTitle: string;
  signerCompany: string;
  signatureData: string;
  signedAt: string;
  proposalName: string;
  neliniaSignature: string;
}): string {
  const signedDate = new Date(params.signedAt).toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });
  const signedTime = new Date(params.signedAt).toLocaleTimeString("en-US", {
    hour: "2-digit", minute: "2-digit",
  });

  // Inject signature block into the proposal HTML before closing </body>
  const signatureBlock = `
    <div style="margin-top:48px;padding-top:24px;border-top:2px solid #C8A951;">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:48px;">
        <div>
          <div style="font-size:9pt;color:#64748b;margin-bottom:2px;">For Strategic Value+</div>
          <div style="margin-bottom:4px;">
            <img src="${params.neliniaSignature}" alt="Nelinia Varenas Signature" style="max-height:50px;max-width:200px;" />
          </div>
          <div style="font-size:9pt;color:#1e293b;font-weight:600;">Nelinia Varenas, CEO</div>
          <div style="font-size:9pt;color:#64748b;">Date: ${signedDate}</div>
          <div style="font-size:8pt;color:#94a3b8;">Signed: ${signedDate} at ${signedTime} EST</div>
        </div>
        <div>
          <div style="font-size:9pt;color:#64748b;margin-bottom:2px;">For ${params.signerCompany || "Client"}</div>
          <div style="margin-bottom:4px;">
            <img src="${params.signatureData}" alt="Signature" style="max-height:50px;max-width:200px;" />
          </div>
          <div style="font-size:9pt;color:#1e293b;font-weight:600;">${params.signerName}${params.signerTitle ? `, ${params.signerTitle}` : ""}</div>
          <div style="font-size:9pt;color:#64748b;">Date: ${signedDate}</div>
          <div style="font-size:8pt;color:#94a3b8;">Signed: ${signedDate} at ${signedTime} EST</div>
        </div>
      </div>
      <div style="margin-top:24px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:8pt;color:#166534;">
        <strong>Electronically Signed</strong> — This document was signed electronically on ${signedDate} at ${signedTime} EST via Strategic Value+ secure signing platform. This electronic signature is legally binding under the ESIGN Act and UETA.
      </div>
    </div>
  `;

  // Replace the existing signature block placeholder or insert before </body>
  let html = params.proposalHtml;

  // Remove the existing unsigned signature block if present
  html = html.replace(/<div class="signature-block[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/g, "");

  // Insert signed signature block before footer or before </body>
  if (html.includes('<div class="footer">')) {
    html = html.replace('<div class="footer">', `${signatureBlock}\n<div class="footer">`);
  } else {
    html = html.replace("</body>", `${signatureBlock}\n</body>`);
  }

  return html;
}

function generateSignerConfirmationEmail(params: {
  signerName: string;
  proposalName: string;
  proposalType: string;
  senderName: string;
  downloadUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:40px 40px 20px 40px;text-align:center;background:linear-gradient(135deg,#1e293b 0%,#334155 100%);border-radius:12px 12px 0 0;">
              <img src="https://hubzonecouncil.org/logo.jpg" alt="HubZone Council" style="height:60px;width:auto;margin-bottom:16px;" />
              <h1 style="margin:0;color:#22c55e;font-size:22px;font-weight:600;">Document Signed Successfully</h1>
              <p style="margin:8px 0 0 0;color:#94a3b8;font-size:14px;">Your signed copy is ready</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px 0;font-size:16px;color:#1e293b;">Dear ${params.signerName},</p>
              <p style="margin:0 0 16px 0;font-size:14px;color:#475569;">
                Thank you for signing <strong>${params.proposalName}</strong>. Your electronic signature has been recorded.
              </p>
              <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:20px;margin:0 0 24px 0;">
                <table style="width:100%;font-size:14px;">
                  <tr><td style="color:#166534;padding:4px 0;width:120px;">Document:</td><td style="color:#1e293b;font-weight:600;padding:4px 0;">${params.proposalName}</td></tr>
                  <tr><td style="color:#166534;padding:4px 0;">Type:</td><td style="color:#1e293b;padding:4px 0;">${params.proposalType}</td></tr>
                  <tr><td style="color:#166534;padding:4px 0;">Status:</td><td style="color:#22c55e;font-weight:600;padding:4px 0;">&#10003; Signed</td></tr>
                  <tr><td style="color:#166534;padding:4px 0;">Signed:</td><td style="color:#1e293b;padding:4px 0;">${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</td></tr>
                </table>
              </div>
              <div style="text-align:center;margin:0 0 24px 0;">
                <a href="${params.downloadUrl}" style="display:inline-block;background:#C8A951;color:#000;padding:16px 40px;text-decoration:none;border-radius:8px;font-weight:700;font-size:16px;">
                  Download Signed PDF
                </a>
              </div>
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                This link will remain active. You can download your signed copy at any time.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                Strategic Value+ &bull; strategicvalueplus.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function generateSenderNotificationEmail(params: {
  signerName: string;
  signerCompany: string;
  proposalName: string;
  proposalType: string;
  downloadUrl: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;background-color:#f4f4f5;">
  <table role="presentation" style="width:100%;border-collapse:collapse;">
    <tr>
      <td align="center" style="padding:40px 0;">
        <table role="presentation" style="width:600px;max-width:100%;border-collapse:collapse;background-color:#ffffff;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);">
          <tr>
            <td style="padding:40px 40px 20px 40px;text-align:center;background:linear-gradient(135deg,#1e293b 0%,#334155 100%);border-radius:12px 12px 0 0;">
              <img src="https://strategicvalueplus.com/VPlus_logo.webp" alt="Strategic Value+" style="height:60px;width:auto;margin-bottom:16px;" />
              <h1 style="margin:0;color:#22c55e;font-size:22px;font-weight:600;">Document Has Been Signed</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 40px;">
              <p style="margin:0 0 16px 0;font-size:14px;color:#475569;">
                <strong>${params.signerName}</strong>${params.signerCompany ? ` from <strong>${params.signerCompany}</strong>` : ""} has signed <strong>${params.proposalName}</strong>.
              </p>
              <div style="text-align:center;margin:0 0 24px 0;">
                <a href="${params.downloadUrl}" style="display:inline-block;background:#C8A951;color:#000;padding:14px 32px;text-decoration:none;border-radius:8px;font-weight:700;font-size:14px;">
                  Download Signed Document
                </a>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;border-radius:0 0 12px 12px;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">Strategic Value+ &bull; strategicvalueplus.com</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
