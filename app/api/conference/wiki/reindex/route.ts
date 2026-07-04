import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { reindexWikiFolder } from "@/lib/conference-wiki";

export async function POST(_req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const result = await reindexWikiFolder(db);
    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error("POST /api/conference/wiki/reindex:", error);
    return NextResponse.json(
      { error: "Failed to reindex wiki folder", details: String(error) },
      { status: 500 }
    );
  }
}
