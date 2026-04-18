import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase-admin/firestore";
import { z } from "zod";

const DEFAULT_CONTACTS = [
  { name: "Brian Stitt", email: "", phone: "", company: "Strategic Value+", sortOrder: 0 },
  { name: "Nate Hallums", email: "", phone: "", company: "Strategic Value+", sortOrder: 1 },
  { name: "Roy Dickan", email: "", phone: "", company: "Strategic Value+", sortOrder: 2 },
  { name: "Nelina Varenas", email: "", phone: "", company: "Strategic Value+", sortOrder: 3 },
  { name: "Ana BlackBurn", email: "", phone: "", company: "Strategic Value+", sortOrder: 4 },
  { name: "Thealetta Monet", email: "", phone: "", company: "Strategic Value+", sortOrder: 5 },
  { name: "Katherine Harrelson", email: "", phone: "", company: "Strategic Value+", sortOrder: 6 },
];

const contactSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email().or(z.literal("")).default(""),
  phone: z.string().default(""),
  company: z.string().default(""),
  active: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});

async function seedDefaultsIfEmpty(col: FirebaseFirestore.CollectionReference) {
  const snap = await col.limit(1).get();
  if (!snap.empty) return;
  const now = Timestamp.now();
  const batch = adminDb!.batch();
  DEFAULT_CONTACTS.forEach((c) => {
    const ref = col.doc();
    batch.set(ref, { ...c, active: true, createdAt: now, updatedAt: now });
  });
  await batch.commit();
}

export async function GET() {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    const col = adminDb.collection(COLLECTIONS.ZENTHIUM_DIRECT_CONTACTS);
    await seedDefaultsIfEmpty(col);

    const snap = await col.orderBy("sortOrder", "asc").orderBy("name", "asc").get();
    const contacts = snap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }));

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("[Zenthium] GET direct-contacts error:", error);
    return NextResponse.json({ error: "Failed to fetch contacts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!adminDb) {
    return NextResponse.json({ error: "Database not initialized" }, { status: 500 });
  }

  try {
    const body: unknown = await request.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Validation failed", details: parsed.error.flatten() }, { status: 400 });
    }

    const now = Timestamp.now();
    const ref = adminDb.collection(COLLECTIONS.ZENTHIUM_DIRECT_CONTACTS).doc();
    await ref.set({ ...parsed.data, createdAt: now, updatedAt: now });

    return NextResponse.json({ id: ref.id, success: true }, { status: 201 });
  } catch (error) {
    console.error("[Zenthium] POST direct-contact error:", error);
    return NextResponse.json({ error: "Failed to create contact" }, { status: 500 });
  }
}
