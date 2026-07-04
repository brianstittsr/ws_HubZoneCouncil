import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email";

interface BookingNotificationRequest {
  bookingId: string;
  teamMemberName: string;
  teamMemberEmail: string;
  clientName: string;
  clientEmail: string;
  meetingType: string;
  date: string;
  time: string;
  duration: number;
  notes?: string;
}

const ADMIN_NOTIFICATION_EMAILS = [
  "brianstittsr@gmail.com",
  "info@legacy83business.com",
];

export async function POST(request: NextRequest) {
  try {
    const body: BookingNotificationRequest = await request.json();
    const {
      bookingId,
      teamMemberName,
      teamMemberEmail,
      clientName,
      clientEmail,
      meetingType,
      date,
      time,
      duration,
      notes,
    } = body;

    console.log("=== BOOKING NOTIFICATION ===");
    console.log(`Booking ID: ${bookingId}`);
    console.log(`Team Member: ${teamMemberName} (${teamMemberEmail})`);
    console.log(`Client: ${clientName} (${clientEmail})`);
    console.log(`Meeting: ${meetingType}`);
    console.log(`Date/Time: ${date} at ${time} (${duration} min)`);
    if (notes) console.log(`Notes: ${notes}`);
    console.log("============================");

    const commonDetails = `
      <ul>
        <li><strong>Booking ID:</strong> ${bookingId}</li>
        <li><strong>Team Member:</strong> ${teamMemberName} (${teamMemberEmail})</li>
        <li><strong>Client:</strong> ${clientName} (${clientEmail})</li>
        <li><strong>Meeting Type:</strong> ${meetingType}</li>
        <li><strong>Date:</strong> ${date}</li>
        <li><strong>Time:</strong> ${time}</li>
        <li><strong>Duration:</strong> ${duration} minutes</li>
        ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
      </ul>
    `;

    // Admin notification
    const adminEmailContent = {
      to: ADMIN_NOTIFICATION_EMAILS,
      subject: `New Booking: ${meetingType} with ${clientName}`,
      html: `
        <h2>New Booking Received</h2>
        <p>A new meeting has been booked:</p>
        ${commonDetails}
        <p>View this booking in the admin portal.</p>
      `,
    };

    // Email to team member
    const teamMemberEmailContent = {
      to: teamMemberEmail,
      subject: `New Booking: ${meetingType} with ${clientName}`,
      html: `
        <h2>New Meeting Booked</h2>
        <p>You have a new meeting scheduled:</p>
        <ul>
          <li><strong>Client:</strong> ${clientName} (${clientEmail})</li>
          <li><strong>Meeting Type:</strong> ${meetingType}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Duration:</strong> ${duration} minutes</li>
          ${notes ? `<li><strong>Notes:</strong> ${notes}</li>` : ''}
        </ul>
        <p>This meeting has been added to your calendar.</p>
      `,
    };

    // Email to client
    const clientEmailContent = {
      to: clientEmail,
      subject: `Booking Confirmed: ${meetingType} with ${teamMemberName}`,
      html: `
        <h2>Your Meeting is Confirmed!</h2>
        <p>Hi ${clientName},</p>
        <p>Your meeting has been successfully scheduled:</p>
        <ul>
          <li><strong>Meeting with:</strong> ${teamMemberName}</li>
          <li><strong>Meeting Type:</strong> ${meetingType}</li>
          <li><strong>Date:</strong> ${date}</li>
          <li><strong>Time:</strong> ${time}</li>
          <li><strong>Duration:</strong> ${duration} minutes</li>
        </ul>
        <p>We look forward to speaking with you!</p>
        <p>Best regards,<br/>Strategic Value Plus Team</p>
      `,
    };

    const results = await Promise.allSettled([
      sendEmail(adminEmailContent),
      sendEmail(teamMemberEmailContent),
      sendEmail(clientEmailContent),
    ]);

    const failures = results
      .map((result, index) => ({ result, index }))
      .filter(({ result }) => result.status === "rejected" || (result.status === "fulfilled" && !result.value.success))
      .map(({ result, index }) => {
        const target = index === 0 ? "admin" : index === 1 ? "teamMember" : "client";
        const message = result.status === "rejected" ? String(result.reason) : (result.value as { error?: string }).error || "Unknown";
        return { target, message };
      });

    if (failures.length > 0) {
      console.error("Booking email failures:", failures);
    }

    return NextResponse.json({
      success: failures.length === 0,
      message: failures.length === 0 ? "Notifications sent" : "Some notifications failed",
      emails: {
        admin: adminEmailContent,
        teamMember: teamMemberEmailContent,
        client: clientEmailContent,
      },
      failures: failures.length > 0 ? failures : undefined,
    });
  } catch (error) {
    console.error("Booking notification error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send notification" },
      { status: 500 }
    );
  }
}
