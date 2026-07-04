const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore, Timestamp } = require("firebase-admin/firestore");

const COLLECTION_TEAM_MEMBERS = "teamMembers";

const TEAM_MEMBER = {
  firebaseUid: "LLbWgG0cxuQ3IuJe3vB7OMWEzfr1",
  firstName: "Brian",
  lastName: "Stitt",
  emailPrimary: "bstitt@strategicvalueplus.com",
  title: "Administrator",
  company: "Strategic Value Plus",
  expertise: "",
  role: "admin",
  status: "active",
  createdAt: Timestamp.now(),
  updatedAt: Timestamp.now(),
};

function getAdminApp() {
  const apps = getApps();
  if (apps.length > 0) return apps[0];

  const projectId = process.env.FIREBASE_PROJECT_ID;
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
    .collection(COLLECTION_TEAM_MEMBERS)
    .where("emailPrimary", "==", TEAM_MEMBER.emailPrimary)
    .limit(1)
    .get();

  if (!existing.empty) {
    const docId = existing.docs[0].id;
    await db.collection(COLLECTION_TEAM_MEMBERS).doc(docId).update({
      ...TEAM_MEMBER,
      updatedAt: Timestamp.now(),
    });
    console.log(`Updated existing team member: ${docId}`);
  } else {
    const docRef = await db.collection(COLLECTION_TEAM_MEMBERS).add(TEAM_MEMBER);
    console.log(`Created team member: ${docRef.id}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
