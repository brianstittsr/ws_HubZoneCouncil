import type { ZenthiumReferral, ZenthiumMeeting, ZenthiumReferralStatus } from "@/types/zenthium";

const SVP_TEAM = [
  { email: "bstitt@strategicvalueplus.com",  name: "Brian Stitt" },
  { email: "nhallums@strategicvalueplus.com", name: "Nate Hallums" },
  { email: "nelinia@strategicvalueplus.com",  name: "Nelenia Varinas" },
  { email: "rdickan@strategicvalueplus.com",  name: "Roy Dickan" },
];

const ZOOM_LINK = "https://us06web.zoom.us/j/3089165132?pwd=LrHx577NdRlRPyoS2bba1w4qYhuMRh.1";

interface EmailPayload {
  to: string;
  cc?: { email: string; name?: string }[];
  subject: string;
  html: string;
  attachments?: { content: string; filename: string; type: string; disposition: string }[];
}

function buildIcal(meeting: ZenthiumMeeting, referralTitle: string): string {
  const dtStamp = new Date().toISOString().replace(/[-:.]/g, "").slice(0, 15) + "Z";
  const [year, month, day] = meeting.date.split("-");
  const [hour, minute] = meeting.time.split(":");
  const dtStart = `${year}${month}${day}T${hour}${minute}00`;
  const endHour = String(Number(hour) + 1).padStart(2, "0");
  const dtEnd = `${year}${month}${day}T${endHour}${minute}00`;
  const uid = `zenthium-${meeting.id ?? dtStamp}@strategicvalueplus.com`;
  const zoomUrl = meeting.zoomJoinUrl ?? ZOOM_LINK;

  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Strategic Value Plus//Zenthium Referral Portal//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:REQUEST",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${meeting.title} — ${referralTitle}`,
    `DESCRIPTION:Join Zoom Meeting: ${zoomUrl}${meeting.agenda ? `\\n\\nAgenda: ${meeting.agenda}` : ""}`,
    `LOCATION:${zoomUrl}`,
    `URL:${zoomUrl}`,
    "STATUS:CONFIRMED",
    "SEQUENCE:0",
    "BEGIN:VALARM",
    "TRIGGER:-PT15M",
    "ACTION:DISPLAY",
    "DESCRIPTION:Meeting reminder",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

async function sendViaSendGrid(payload: EmailPayload): Promise<void> {
  const apiKey = process.env.ZENTHIUM_EMAIL_API_KEY;
  if (!apiKey) {
    console.warn("[Zenthium Email] ZENTHIUM_EMAIL_API_KEY not set — skipping send");
    return;
  }

  const body: Record<string, unknown> = {
    personalizations: [
      {
        to: [{ email: payload.to }],
        ...(payload.cc?.length ? { cc: payload.cc } : {}),
      },
    ],
    from: { email: process.env.ZENTHIUM_FROM_EMAIL ?? "noreply@zenthium.com", name: "Zenthium Referral Portal" },
    subject: payload.subject,
    content: [{ type: "text/html", value: payload.html }],
  };

  if (payload.attachments?.length) {
    body.attachments = payload.attachments;
  }

  const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
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
  pocEmail: string
): Promise<void> {
  const zoomUrl = meeting.zoomJoinUrl ?? ZOOM_LINK;
  const icalContent = buildIcal(meeting, referral.title ?? referral.propertyName ?? "");
  const icalBase64 = Buffer.from(icalContent).toString("base64");

  const ccRecipients = SVP_TEAM.map((m) => ({ email: m.email, name: m.name }));

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
      <h2 style="color:#1a1a1a;">Meeting Scheduled: ${meeting.title}</h2>
      <p><strong>Property:</strong> ${referral.propertyName ?? "—"}</p>
      <p><strong>Date:</strong> ${meeting.date}</p>
      <p><strong>Time:</strong> ${meeting.time}</p>
      <br/>
      <div style="background:#f5f5f5;padding:16px;border-radius:8px;margin:16px 0;">
        <p style="margin:0 0 8px 0;font-weight:bold;">Zoom Meeting Link</p>
        <a href="${zoomUrl}" style="color:#2563eb;font-size:16px;">${zoomUrl}</a>
      </div>
      ${meeting.agenda ? `<p><strong>Agenda:</strong><br/>${meeting.agenda.replace(/\n/g, "<br/>")}</p>` : ""}
      <p style="color:#666;font-size:12px;margin-top:24px;">
        A calendar invite (.ics) is attached. Open it to add this meeting to your calendar.
      </p>
    </div>
  `;

  await sendViaSendGrid({
    to: pocEmail,
    cc: ccRecipients,
    subject: `Meeting Scheduled: ${meeting.title} — ${referral.propertyName ?? referral.title ?? ""}`,
    html,
    attachments: [
      {
        content: icalBase64,
        filename: "meeting-invite.ics",
        type: "text/calendar; method=REQUEST",
        disposition: "attachment",
      },
    ],
  });
}
