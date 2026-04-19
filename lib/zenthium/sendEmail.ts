import type { ZenthiumReferral, ZenthiumMeeting, ZenthiumReferralStatus } from "@/types/zenthium";
import { sendEmail } from "@/lib/email";

const SVP_TEAM_EMAILS = [
  "bstitt@strategicvalueplus.com",
  "nhallums@strategicvalueplus.com",
  "nelinia@strategicvalueplus.com",
  "rdickan@strategicvalueplus.com",
];

const ZOOM_LINK = "https://us06web.zoom.us/j/3089165132?pwd=LrHx577NdRlRPyoS2bba1w4qYhuMRh.1";

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

export async function sendNewReferralEmail(referral: ZenthiumReferral): Promise<void> {
  const recipients = [
    referral.poc?.email,
    referral.directContact?.email,
    ...SVP_TEAM_EMAILS,
  ].filter((e): e is string => Boolean(e));

  await sendEmail({
    to: recipients,
    subject: `New Zenthium Referral Submitted: ${referral.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>New Data Center Referral Submitted</h2>
        <p><strong>Property:</strong> ${referral.propertyName}</p>
        <p><strong>Location:</strong> ${referral.address?.city ?? ""}, ${referral.address?.state ?? ""}</p>
        <p><strong>Description:</strong> ${referral.description}</p>
        <p>Log in to the portal to review the full submission.</p>
      </div>
    `,
  });
}

export async function sendStatusUpdateEmail(
  referral: ZenthiumReferral,
  newStatus: ZenthiumReferralStatus,
  recipientEmail: string
): Promise<void> {
  await sendEmail({
    to: recipientEmail,
    subject: `Referral Status Update: ${referral.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;">
        <h2>Your Referral Status Has Been Updated</h2>
        <p><strong>Property:</strong> ${referral.propertyName}</p>
        <p><strong>New Status:</strong> ${newStatus}</p>
        <p>Log in to the portal to view details.</p>
      </div>
    `,
  });
}

export async function sendMeetingScheduledEmail(
  referral: ZenthiumReferral,
  meeting: ZenthiumMeeting,
  pocEmail: string
): Promise<void> {
  const zoomUrl = meeting.zoomJoinUrl ?? ZOOM_LINK;
  const referralTitle = referral.title ?? referral.propertyName ?? "";
  const icalContent = buildIcal(meeting, referralTitle);
  const icalBase64 = Buffer.from(icalContent).toString("base64");

  const toRecipients = [
    pocEmail,
    ...SVP_TEAM_EMAILS,
  ].filter((e): e is string => Boolean(e) && e !== "noreply@zenthium.com");

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

  await sendEmail({
    to: toRecipients,
    subject: `Meeting Scheduled: ${meeting.title} — ${referralTitle}`,
    html,
    attachments: [
      {
        name: "meeting-invite.ics",
        contentType: "text/calendar",
        contentBytes: icalBase64,
      },
    ],
  });
}
