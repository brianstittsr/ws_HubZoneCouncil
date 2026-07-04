import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { saveWikiEntry, deleteWikiEntry } from "@/lib/conference-wiki";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const { id } = await params;
    const body = await req.json();
    await saveWikiEntry(db, {
      id,
      title: body.title,
      content: body.content,
      category: body.category,
      tags: body.tags,
      isPublic: body.isPublic,
      displayOrder: body.displayOrder,
    });
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("PATCH /api/conference/wiki/entries/[id]:", error);
    return NextResponse.json({ error: "Failed to update wiki entry" }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const { id } = await params;
    await deleteWikiEntry(db, id);
    return NextResponse.json({ data: { id } });
  } catch (error) {
    console.error("DELETE /api/conference/wiki/entries/[id]:", error);
    return NextResponse.json({ error: "Failed to delete wiki entry" }, { status: 500 });
  }
}
