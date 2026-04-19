/**
 * Firebase Admin SDK Configuration
 * 
 * This module initializes the Firebase Admin SDK for server-side operations
 * that require elevated privileges, such as:
 * - Deleting user accounts
 * - Managing custom claims
 * - Accessing Firestore with admin privileges
 */

import { initializeApp, getApps, cert, App } from "firebase-admin/app";
import { getAuth, Auth } from "firebase-admin/auth";
import { getFirestore, Firestore } from "firebase-admin/firestore";

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function initializeFirebaseAdmin() {
  console.log("[Firebase Admin] Starting initialization...");
  console.log("[Firebase Admin] NODE_ENV:", process.env.NODE_ENV);
  console.log("[Firebase Admin] FIREBASE_PROJECT_ID exists:", !!process.env.FIREBASE_PROJECT_ID);
  console.log("[Firebase Admin] FIREBASE_CLIENT_EMAIL exists:", !!process.env.FIREBASE_CLIENT_EMAIL);
  console.log("[Firebase Admin] FIREBASE_PRIVATE_KEY exists:", !!process.env.FIREBASE_PRIVATE_KEY);
  
  // Check if already initialized
  if (getApps().length > 0) {
    console.log("[Firebase Admin] Already initialized, reusing existing app");
    adminApp = getApps()[0];
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    return;
  }

  // Get service account credentials from environment variables
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  console.log("[Firebase Admin] projectId:", projectId);
  console.log("[Firebase Admin] clientEmail:", clientEmail ? "[REDACTED]" : "MISSING");
  console.log("[Firebase Admin] privateKey length:", privateKey ? privateKey.length : 0);

  if (!projectId) {
    console.error("[Firebase Admin] Missing FIREBASE_PROJECT_ID environment variable");
    return;
  }

  try {
    // If we have service account credentials, use them
    if (clientEmail && privateKey) {
      console.log("[Firebase Admin] Initializing with service account credentials...");
      adminApp = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
      console.log("[Firebase Admin] Successfully initialized with service account");
    } else {
      // Try to initialize with default credentials (works in Google Cloud environments)
      // or with GOOGLE_APPLICATION_CREDENTIALS environment variable
      console.log("[Firebase Admin] Initializing with default credentials...");
      adminApp = initializeApp({
        projectId,
      });
      console.log("[Firebase Admin] Initialized with default credentials");
    }

    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
    console.log("[Firebase Admin] Auth and Firestore services initialized");
  } catch (error) {
    console.error("[Firebase Admin] Error initializing:", error);
    console.error("[Firebase Admin] Error message:", error instanceof Error ? error.message : "Unknown");
    console.error("[Firebase Admin] Error stack:", error instanceof Error ? error.stack : "No stack");
  }
}

// Initialize on module load
initializeFirebaseAdmin();

export { adminApp, adminAuth, adminDb };
