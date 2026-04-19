import { NextRequest, NextResponse } from "next/server";
import { sendEmail, isEmailConfigured, getFromAddress } from "@/lib/email";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (!isEmailConfigured()) {
    return NextResponse.json({
      error: "SMTP not configured. Check SMTP_HOST, SMTP_USER, and SMTP_PASSWORD in .env.local",
    }, { status: 500 });
  }

  const { searchParams } = new URL(request.url);
  const fromAddress = getFromAddress();
  const to = searchParams.get("to") || process.env.SMTP_USER || "admin@hubzonecouncil.org";

  const result = await sendEmail({
    to,
    subject: "HubZone Council — SMTP Test Email",
    html: `
      <div style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:500px;margin:0 auto;padding:32px;background:#f8fafc;border-radius:12px;">
        <div style="text-align:center;padding:24px;background:linear-gradient(135deg,#1e293b,#334155);border-radius:8px;">
          <h1 style="margin:0;color:#C8A951;font-size:20px;">HubZone Council</h1>
          <p style="margin:8px 0 0;color:#94a3b8;font-size:13px;">Email Configuration Test</p>
        </div>
        <div style="padding:24px 0;text-align:center;">
          <p style="color:#22c55e;font-size:18px;font-weight:600;">&#10003; SMTP is working!</p>
          <p style="color:#475569;font-size:14px;">This test email was sent from the HubZone Council Platform.</p>
          <p style="color:#94a3b8;font-size:12px;margin-top:16px;">From: ${fromAddress}<br/>Sent at: ${new Date().toLocaleString()}</p>
        </div>
      </div>
    `,
    text: "HubZone Council SMTP Test — If you received this, your email settings are working correctly.",
  });

  if (result.success) {
    return NextResponse.json({
      success: true,
      message: `Test email sent to ${to}`,
      messageId: result.messageId,
    });
  }

  return NextResponse.json({
    success: false,
    error: result.error,
  }, { status: 500 });
}
