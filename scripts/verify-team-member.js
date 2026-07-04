const { initializeApp, cert, getApps } = require("firebase-admin/app");
const { getFirestore } = require("firebase-admin/firestore");

const COLLECTION_TEAM_MEMBERS = "teamMembers";
const EMAIL = "bstitt@strategicvalueplus.com";
const UID = "LLbWgG0cxuQ3IuJe3vB7OMWEzfr1";

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

  console.log("Project ID:", app.options.projectId);

  // Query by email
  const emailSnapshot = await db
    .collection(COLLECTION_TEAM_MEMBERS)
    .where("emailPrimary", "==", EMAIL)
    .get();

  console.log(`\nTeam members with emailPrimary == ${EMAIL}: ${emailSnapshot.size}`);
  emailSnapshot.forEach((doc) => {
    console.log(`  ${doc.id}:`, JSON.stringify(doc.data(), null, 2));
  });

  // Query by UID
  const uidSnapshot = await db
    .collection(COLLECTION_TEAM_MEMBERS)
    .where("firebaseUid", "==", UID)
    .get();

  console.log(`\nTeam members with firebaseUid == ${UID}: ${uidSnapshot.size}`);
  uidSnapshot.forEach((doc) => {
    console.log(`  ${doc.id}:`, JSON.stringify(doc.data(), null, 2));
  });
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
