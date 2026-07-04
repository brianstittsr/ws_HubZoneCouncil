import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { saveWikiDocument } from "@/lib/conference-wiki";
import { COLLECTIONS } from "@/lib/schema";
import { collection, getDocs, query, orderBy } from "firebase/firestore";

export async function GET() {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const q = query(collection(db, COLLECTIONS.CONFERENCE_WIKI_DOCUMENTS), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);
    const data = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/conference/wiki/documents:", error);
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const body = await req.json();
    const id = await saveWikiDocument(db, {
      name: body.name,
      fileName: body.fileName,
      contentType: body.contentType,
      contentText: body.contentText,
      storageUrl: body.storageUrl,
      size: body.size,
      status: body.status || "pending",
    });
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conference/wiki/documents:", error);
    return NextResponse.json({ error: "Failed to save document" }, { status: 500 });
  }
}
