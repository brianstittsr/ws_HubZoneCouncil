import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

// Validation schema for NDA email request
const NDAEmailRequestSchema = z.object({
  documentId: z.string(),
  recipientEmail: z.string().email(),
  recipientName: z.string().optional(),
  recipientCompany: z.string().optional(),
  ndaTitle: z.string(),
  effectiveDate: z.string(),
  selfServeMode: z.boolean().default(false),
  signingUrl: z.string(),
  disclosingParty: z.object({
    name: z.string(),
    title: z.string(),
    company: z.string(),
    email: z.string().email(),
  }),
  receivingParty: z.object({
    name: z.string().optional(),
    title: z.string().optional(),
    company: z.string().optional(),
    email: z.string().email(),
    phone: z.string().optional(),
    address: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    zip: z.string().optional(),
  }),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request body
    const validation = NDAEmailRequestSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: "Invalid request data", details: validation.error.issues },
        { status: 400 }
      );
    }
    
    const data = validation.data;

    // In production:
    // 1. Update the NDA document status to pending_signature
    // 2. Send email with signing link using email service (SendGrid, etc.)

    // Generate email content based on mode
    const emailContent = data.selfServeMode
      ? generateSelfServeEmail(data)
      : generateDirectSendEmail(data);

    // In production, send via email service:
    // await sendEmail({
    //   to: data.recipientEmail,
    //   from: "nel@strategicvalueplus.com",
    //   subject: emailContent.subject,
    //   html: emailContent.html,
    // });

    console.log("NDA email would be sent:", {
      to: data.recipientEmail,
      subject: emailContent.subject,
      selfServeMode: data.selfServeMode,
      signingUrl: data.signingUrl,
    });

    return NextResponse.json({
      success: true,
      message: data.selfServeMode
        ? "Self-serve NDA link sent successfully"
        : "NDA sent for signature successfully",
      data: {
        sentTo: data.recipientEmail,
        sentAt: new Date().toISOString(),
        signingUrl: data.signingUrl,
        selfServeMode: data.selfServeMode,
      },
    });
  } catch (error) {
    console.error("Error sending NDA:", error);
    return NextResponse.json(
      { error: "Failed to send NDA" },
      { status: 500 }
    );
  }
}

/**
 * Generate email content for self-serve mode
 */
function generateSelfServeEmail(data: z.infer<typeof NDAEmailRequestSchema>) {
  const subject = `Action Required: Please Complete NDA - ${data.ndaTitle}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NDA Signature Request</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #2c5282; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; }
    .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #3182ce; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Non-Disclosure Agreement</h1>
    <p>Action Required from ${data.disclosingParty.company}</p>
  </div>

  <div class="content">
    <p>Hello,</p>

    <p>You have been invited to review and sign a Non-disclosure Agreement with <strong>${data.disclosingParty.company}</strong>.</p>

    <div class="info-box">
      <strong>NDA Details:</strong><br>
      Title: ${data.ndaTitle}<br>
      Effective Date: ${data.effectiveDate}<br>
      From: ${data.disclosingParty.name}, ${data.disclosingParty.title}
    </div>

    <p><strong>What you'll do:</strong></p>
    <ol>
      <li>Click the button below to access the secure signing portal</li>
      <li>Fill in your information (name, title, company, contact details)</li>
      <li>Review the complete NDA document</li>
      <li>Sign electronically using your mouse or touch screen</li>
      <li>Submit your signature</li>
    </ol>

    <p style="text-align: center;">
      <a href="${data.signingUrl}" class="button">Complete NDA & Sign</a>
    </p>

    <p style="font-size: 14px; color: #718096;">
      Or copy and paste this link: <a href="${data.signingUrl}">${data.signingUrl}</a>
    </p>

    <div class="info-box" style="border-left-color: #f6ad55;">
      <strong>Important:</strong> This link is unique to you and will expire in 7 days.
      Once you sign, ${data.disclosingParty.name} will countersign and you'll receive a completed copy via email.
    </div>

    <div class="footer">
      <p><strong>${data.disclosingParty.company}</strong><br>
      ${data.disclosingParty.name}, ${data.disclosingParty.title}<br>
      Email: ${data.disclosingParty.email}</p>

      <p>This is an automated message from the Strategic Value Plus document management system.</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}

/**
 * Generate email content for direct send mode
 */
function generateDirectSendEmail(data: z.infer<typeof NDAEmailRequestSchema>) {
  const subject = `Action Required: Please Sign NDA - ${data.ndaTitle}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>NDA Signature Request</title>
  <style>
    body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { background: #1a365d; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
    .content { background: #f8fafc; padding: 30px; border-radius: 0 0 8px 8px; }
    .button { display: inline-block; background: #3182ce; color: white; padding: 15px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 20px 0; }
    .button:hover { background: #2c5282; }
    .footer { margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 12px; color: #718096; }
    .info-box { background: white; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 4px solid #3182ce; }
    .party-info { display: flex; justify-content: space-between; margin: 15px 0; }
    .party-box { flex: 1; padding: 15px; background: white; border-radius: 6px; margin: 0 5px; }
  </style>
</head>
<body>
  <div class="header">
    <h1>Non-Disclosure Agreement</h1>
    <p>Signature Request from ${data.disclosingParty.company}</p>
  </div>

  <div class="content">
    <p>Dear ${data.recipientName || "Valued Partner"},</p>

    <p>Please review and sign the attached Non-disclosure Agreement with <strong>${data.disclosingParty.company}</strong>.</p>

    <div class="party-info">
      <div class="party-box">
        <strong>Disclosing Party:</strong><br>
        ${data.disclosingParty.name}<br>
        ${data.disclosingParty.title}<br>
        ${data.disclosingParty.company}
      </div>
      <div class="party-box">
        <strong>Receiving Party:</strong><br>
        ${data.recipientName || "[To be confirmed upon signing]"}<br>
        ${data.receivingParty?.title || ""}<br>
        ${data.recipientCompany || data.receivingParty?.company || ""}
      </div>
    </div>

    <div class="info-box">
      <strong>NDA Details:</strong><br>
      Title: ${data.ndaTitle}<br>
      Effective Date: ${data.effectiveDate}
    </div>

    <p style="text-align: center;">
      <a href="${data.signingUrl}" class="button">Review & Sign NDA</a>
    </p>

    <p style="font-size: 14px; color: #718096;">
      Or copy and paste this link: <a href="${data.signingUrl}">${data.signingUrl}</a>
    </p>

    <div class="info-box" style="border-left-color: #48bb78;">
      <strong>What happens next:</strong>
      <ol>
        <li>You review and sign the NDA electronically</li>
        <li>${data.disclosingParty.name} receives notification and countersigns</li>
        <li>You receive a fully executed PDF copy via email</li>
      </ol>
    </div>

    <div class="footer">
      <p><strong>${data.disclosingParty.company}</strong><br>
      ${data.disclosingParty.name}, ${data.disclosingParty.title}<br>
      Email: ${data.disclosingParty.email}</p>

      <p>This is an automated message from the Strategic Value Plus document management system.<br>
      The link expires in 7 days.</p>
    </div>
  </div>
</body>
</html>
  `;

  return { subject, html };
}
