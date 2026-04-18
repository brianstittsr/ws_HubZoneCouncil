import type { ZenthiumReferral, ZenthiumMeeting, ZenthiumReferralStatus } from "@/types/zenthium";

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

async function sendViaSendGrid(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.ZENTHIUM_EMAIL_API_KEY;
  if (!apiKey) {
    console.warn("[Zenthium Email] ZENTHIUM_EMAIL_API_KEY not set — skipping send");
    return;
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      personalizations: [{ to: [{ email: payload.to }] }],
      from: { email: process.env.ZENTHIUM_FROM_EMAIL ?? "noreply@zenthium.com", name: "Zenthium Referral Portal" },
      subject: payload.subject,
      content: [{ type: "text/html", value: payload.html }],
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("[Zenthium Email] SendGrid error:", err);
  }
}

export async function sendNewReferralEmail(referral: ZenthiumReferral): Promise<void> {
  const recipients = [referral.poc.email, referral.directContact.email].filter(Boolean);

  await Promise.all(
    recipients.map((email) =>
      sendViaSendGrid({
        to: email,
        subject: `New Zenthium Referral Submitted: ${referral.title}`,
        html: `
          <h2>New Data Center Referral Submitted</h2>
          <p><strong>Property:</strong> ${referral.propertyName}</p>
          <p><strong>Location:</strong> ${referral.address.city}, ${referral.address.state}</p>
          <p><strong>Description:</strong> ${referral.description}</p>
          <p>Log in to the portal to review the full submission.</p>
        `,
      })
    )
  );
}

export async function sendStatusUpdateEmail(
  referral: ZenthiumReferral,
  newStatus: ZenthiumReferralStatus,
  recipientEmail: string
): Promise<void> {
  await sendViaSendGrid({
    to: recipientEmail,
    subject: `Referral Status Update: ${referral.title}`,
    html: `
      <h2>Your Referral Status Has Been Updated</h2>
      <p><strong>Property:</strong> ${referral.propertyName}</p>
      <p><strong>New Status:</strong> ${newStatus}</p>
      <p>Log in to the portal to view details.</p>
    `,
  });
}

export async function sendMeetingScheduledEmail(
  referral: ZenthiumReferral,
  meeting: ZenthiumMeeting,
  recipientEmail: string
): Promise<void> {
  await sendViaSendGrid({
    to: recipientEmail,
    subject: `Meeting Scheduled: ${referral.title}`,
    html: `
      <h2>A Meeting Has Been Scheduled</h2>
      <p><strong>Property:</strong> ${referral.propertyName}</p>
      <p><strong>Meeting:</strong> ${meeting.title}</p>
      <p><strong>Date:</strong> ${meeting.date} at ${meeting.time}</p>
      ${meeting.zoomJoinUrl ? `<p><a href="${meeting.zoomJoinUrl}">Join Zoom Meeting</a></p>` : ""}
      ${meeting.agenda ? `<p><strong>Agenda:</strong> ${meeting.agenda}</p>` : ""}
    `,
  });
}
