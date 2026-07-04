import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { getAllWikiEntries, saveWikiEntry } from "@/lib/conference-wiki";

export async function GET() {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const entries = await getAllWikiEntries(db);
    return NextResponse.json({ data: entries });
  } catch (error) {
    console.error("GET /api/conference/wiki/entries:", error);
    return NextResponse.json({ error: "Failed to fetch wiki entries" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const body = await req.json();
    const id = await saveWikiEntry(db, {
      title: body.title,
      content: body.content,
      category: body.category,
      tags: body.tags || [],
      isPublic: body.isPublic ?? true,
      displayOrder: body.displayOrder ?? 0,
    });
    return NextResponse.json({ data: { id } }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conference/wiki/entries:", error);
    return NextResponse.json({ error: "Failed to save wiki entry" }, { status: 500 });
  }
}
