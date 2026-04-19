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

  const addr = referral.address ?? {};
  const poc = referral.poc ?? {};
  const dc = referral.directContact ?? {};

  await sendEmail({
    to: recipients,
    subject: `New Zenthium Referral Submitted: ${referral.title}`,
    html: `
      <div style="font-family:sans-serif;max-width:680px;margin:0 auto;color:#1a1a1a;">
        <div style="background:#1a1a1a;padding:20px 24px;border-radius:8px 8px 0 0;">
          <h1 style="margin:0;color:#f5c842;font-size:18px;">New Data Center Location Submitted</h1>
          <p style="margin:4px 0 0;color:#aaa;font-size:13px;">${referral.title}</p>
        </div>
        <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;">

          <h3 style="margin:0 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Property Details</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            <tr><td style="padding:4px 8px 4px 0;color:#555;width:40%;">Property Name</td><td><strong>${referral.propertyName ?? "—"}</strong></td></tr>
            <tr><td style="padding:4px 8px 4px 0;color:#555;">Address</td><td>${[addr.street, addr.city, addr.state, addr.zip, addr.country].filter(Boolean).join(", ") || "—"}</td></tr>
            ${referral.coordinates ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Coordinates</td><td>${referral.coordinates}</td></tr>` : ""}
            ${referral.parcelNumber ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Parcel Number</td><td>${referral.parcelNumber}</td></tr>` : ""}
            ${referral.acreage != null ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Acreage</td><td>${referral.acreage} acres</td></tr>` : ""}
            ${referral.squareFootage != null ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Square Footage</td><td>${referral.squareFootage.toLocaleString()} sq ft</td></tr>` : ""}
          </table>

          <h3 style="margin:20px 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Infrastructure</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            ${referral.powerCapacityMW != null ? `<tr><td style="padding:4px 8px 4px 0;color:#555;width:40%;">Power Capacity</td><td>${referral.powerCapacityMW} MW</td></tr>` : ""}
            ${referral.zoning ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Zoning</td><td>${referral.zoning}</td></tr>` : ""}
            ${referral.utilities ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Utilities</td><td>${referral.utilities}</td></tr>` : ""}
            ${referral.fiberAvailability ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Fiber</td><td>${referral.fiberAvailability}</td></tr>` : ""}
            ${referral.waterAvailability ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Water</td><td>${referral.waterAvailability}</td></tr>` : ""}
          </table>

          <h3 style="margin:20px 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Ownership &amp; Pricing</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            ${referral.ownership ? `<tr><td style="padding:4px 8px 4px 0;color:#555;width:40%;">Ownership</td><td>${referral.ownership}</td></tr>` : ""}
            ${referral.pricing ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Pricing</td><td>${referral.pricing}</td></tr>` : ""}
            ${referral.timeline ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Timeline</td><td>${referral.timeline}</td></tr>` : ""}
          </table>

          ${referral.description ? `
          <h3 style="margin:20px 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Description</h3>
          <p style="font-size:14px;color:#333;white-space:pre-wrap;">${referral.description}</p>` : ""}

          ${referral.environmentalNotes ? `
          <h3 style="margin:20px 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Environmental Notes</h3>
          <p style="font-size:14px;color:#333;white-space:pre-wrap;">${referral.environmentalNotes}</p>` : ""}

          <h3 style="margin:20px 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Point of Contact</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            ${poc.name ? `<tr><td style="padding:4px 8px 4px 0;color:#555;width:40%;">Name</td><td>${poc.name}</td></tr>` : ""}
            ${poc.company ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Company</td><td>${poc.company}</td></tr>` : ""}
            ${poc.email ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Email</td><td><a href="mailto:${poc.email}">${poc.email}</a></td></tr>` : ""}
            ${poc.phone ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Phone</td><td>${poc.phone}</td></tr>` : ""}
          </table>

          ${dc.name || dc.email ? `
          <h3 style="margin:20px 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Direct Contact</h3>
          <table style="width:100%;font-size:14px;border-collapse:collapse;">
            ${dc.name ? `<tr><td style="padding:4px 8px 4px 0;color:#555;width:40%;">Name</td><td>${dc.name}</td></tr>` : ""}
            ${dc.company ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Company</td><td>${dc.company}</td></tr>` : ""}
            ${dc.email ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Email</td><td><a href="mailto:${dc.email}">${dc.email}</a></td></tr>` : ""}
            ${dc.phone ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Phone</td><td>${dc.phone}</td></tr>` : ""}
          </table>` : ""}

          <div style="margin-top:24px;padding:12px 16px;background:#fffbe6;border-left:4px solid #f5c842;border-radius:4px;font-size:13px;color:#555;">
            Log in to the portal to review, edit, or update the status of this submission.
          </div>
        </div>
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

  const addr = referral.address ?? {};
  const poc = referral.poc ?? {};

  const html = `
    <div style="font-family:sans-serif;max-width:680px;margin:0 auto;color:#1a1a1a;">
      <div style="background:#1a1a1a;padding:20px 24px;border-radius:8px 8px 0 0;">
        <h1 style="margin:0;color:#f5c842;font-size:18px;">Meeting Scheduled</h1>
        <p style="margin:4px 0 0;color:#aaa;font-size:13px;">${meeting.title}</p>
      </div>
      <div style="background:#f9f9f9;padding:24px;border-radius:0 0 8px 8px;">

        <h3 style="margin:0 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Meeting Details</h3>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:4px 8px 4px 0;color:#555;width:35%;">Date</td><td><strong>${meeting.date}</strong></td></tr>
          <tr><td style="padding:4px 8px 4px 0;color:#555;">Time</td><td><strong>${meeting.time}</strong></td></tr>
          ${meeting.agenda ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Agenda</td><td>${meeting.agenda.replace(/\n/g, "<br/>")}</td></tr>` : ""}
        </table>

        <div style="background:#fff;border:2px solid #f5c842;padding:16px;border-radius:8px;margin:16px 0;">
          <p style="margin:0 0 6px 0;font-weight:bold;font-size:14px;">Zoom Meeting Link</p>
          <a href="${zoomUrl}" style="color:#2563eb;font-size:15px;word-break:break-all;">${zoomUrl}</a>
        </div>

        <h3 style="margin:20px 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Property</h3>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          <tr><td style="padding:4px 8px 4px 0;color:#555;width:35%;">Name</td><td>${referral.propertyName ?? "—"}</td></tr>
          <tr><td style="padding:4px 8px 4px 0;color:#555;">Location</td><td>${[addr.city, addr.state].filter(Boolean).join(", ") || "—"}</td></tr>
          ${addr.street ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Address</td><td>${[addr.street, addr.city, addr.state, addr.zip].filter(Boolean).join(", ")}</td></tr>` : ""}
          ${referral.acreage != null ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Acreage</td><td>${referral.acreage} acres</td></tr>` : ""}
          ${referral.squareFootage != null ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Square Footage</td><td>${referral.squareFootage.toLocaleString()} sq ft</td></tr>` : ""}
          ${referral.powerCapacityMW != null ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Power Capacity</td><td>${referral.powerCapacityMW} MW</td></tr>` : ""}
          ${referral.zoning ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Zoning</td><td>${referral.zoning}</td></tr>` : ""}
          ${referral.pricing ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Pricing</td><td>${referral.pricing}</td></tr>` : ""}
        </table>

        ${poc.name || poc.email ? `
        <h3 style="margin:20px 0 12px;border-bottom:1px solid #e5e5e5;padding-bottom:6px;">Point of Contact</h3>
        <table style="width:100%;font-size:14px;border-collapse:collapse;">
          ${poc.name ? `<tr><td style="padding:4px 8px 4px 0;color:#555;width:35%;">Name</td><td>${poc.name}</td></tr>` : ""}
          ${poc.company ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Company</td><td>${poc.company}</td></tr>` : ""}
          ${poc.email ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Email</td><td><a href="mailto:${poc.email}">${poc.email}</a></td></tr>` : ""}
          ${poc.phone ? `<tr><td style="padding:4px 8px 4px 0;color:#555;">Phone</td><td>${poc.phone}</td></tr>` : ""}
        </table>` : ""}

        <p style="color:#666;font-size:12px;margin-top:24px;">
          A calendar invite (.ics) is attached. Open it to add this meeting to your calendar.
        </p>
      </div>
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
