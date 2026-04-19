export interface ZoomMeetingResult {
  meetingId: string;
  joinUrl: string;
  startUrl: string;
  password: string;
}

interface CreateMeetingOptions {
  topic: string;
  startTime: string;
  durationMinutes?: number;
  agenda?: string;
}

export async function createZoomMeeting(
  options: CreateMeetingOptions
): Promise<ZoomMeetingResult> {
  const apiKey = process.env.ZENTHIUM_ZOOM_API_KEY;

  if (!apiKey) {
    console.warn("[Zenthium Zoom] ZENTHIUM_ZOOM_API_KEY not set — returning mock meeting");
    return mockMeeting(options);
  }

  try {
    const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: options.topic,
        type: 2,
        start_time: options.startTime,
        duration: options.durationMinutes ?? 60,
        agenda: options.agenda ?? "",
        settings: {
          host_video: true,
          participant_video: true,
          join_before_host: false,
          waiting_room: true,
        },
      }),
    });

    if (!res.ok) {
      console.error("[Zenthium Zoom] API error:", await res.text());
      return mockMeeting(options);
    }

    const data = await res.json();
    return {
      meetingId: String(data.id),
      joinUrl: data.join_url,
      startUrl: data.start_url,
      password: data.password ?? "",
    };
  } catch (err) {
    console.error("[Zenthium Zoom] Fetch failed:", err);
    return mockMeeting(options);
  }
}

export async function getZoomMeetingDetails(
  meetingId: string
): Promise<ZoomMeetingResult | null> {
  const apiKey = process.env.ZENTHIUM_ZOOM_API_KEY;
  if (!apiKey) return null;

  try {
    const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return {
      meetingId: String(data.id),
      joinUrl: data.join_url,
      startUrl: data.start_url,
      password: data.password ?? "",
    };
  } catch {
    return null;
  }
}

const FIXED_ZOOM_JOIN_URL = "https://us06web.zoom.us/j/3089165132?pwd=LrHx577NdRlRPyoS2bba1w4qYhuMRh.1";
const FIXED_ZOOM_MEETING_ID = "3089165132";

function mockMeeting(_options: CreateMeetingOptions): ZoomMeetingResult {
  return {
    meetingId: FIXED_ZOOM_MEETING_ID,
    joinUrl: FIXED_ZOOM_JOIN_URL,
    startUrl: FIXED_ZOOM_JOIN_URL,
    password: "",
  };
}
