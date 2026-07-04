const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

const COLLECTION_CONFERENCE_ABOUT = "conferenceAbout";

const CONFERENCE_ID = "hubzone-rise-2026";

const CONFERENCE = {
  id: CONFERENCE_ID,
  eventName: "HUBZone on the Rise",
  tagline: "Empowering HUBZone businesses to grow, connect, and win federal contracts.",
  description:
    "HUBZone on the Rise is the premier conference for Historically Underutilized Business Zone (HUBZone) certified companies, government contractors, and federal stakeholders. Join us for keynotes, workshops, matchmaking, and actionable strategies to accelerate your GovCon success.",
  shortDescription:
    "The premier HUBZone conference for federal contracting success.",
  startDate: Timestamp.fromDate(new Date("2026-05-15T09:00:00-04:00")),
  endDate: Timestamp.fromDate(new Date("2026-05-17T17:00:00-04:00")),
  timezone: "America/New_York",
  locationType: "in-person",
  venue: "TBD - Washington, DC Metro Area",
  address: "",
  city: "Washington",
  state: "DC",
  country: "United States",
  virtualLink: "",
  bannerImageUrl: "",
  logoUrl: "/logo.jpg",
  websiteUrl: "https://hubzonecouncil.org/conference",
  theme: "Growth Through Federal Contracting",
  expectedAttendees: 300,
  status: "draft",
  isFeatured: true,
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

function getAdminApp() {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error("Missing FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, or FIREBASE_PRIVATE_KEY");
  }

  return initializeApp({
    credential: cert({
      projectId,
      clientEmail,
      privateKey: privateKey.replace(/\\n/g, "\n"),
    }),
  });
}

async function main() {
  const app = getAdminApp();
  const db = getFirestore(app);

  const existing = await db
    .collection(COLLECTION_CONFERENCE_ABOUT)
    .where("eventName", "==", CONFERENCE.eventName)
    .limit(1)
    .get();

  if (!existing.empty) {
    const docId = existing.docs[0].id;
    await db.collection(COLLECTION_CONFERENCE_ABOUT).doc(docId).update({
      ...CONFERENCE,
      updatedAt: Timestamp.now(),
    });
    console.log(`Updated existing conference: ${docId}`);
  } else {
    const docRef = await db.collection(COLLECTION_CONFERENCE_ABOUT).add(CONFERENCE);
    console.log(`Created conference: ${docRef.id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
