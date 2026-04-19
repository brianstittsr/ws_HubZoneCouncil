import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

// POST - Reorder hero slides
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { slides } = body;

    if (!slides || !Array.isArray(slides)) {
      return NextResponse.json(
        { error: "Slides array is required" },
        { status: 400 }
      );
    }

    // Batch update all slide orders
    const batch = writeBatch(db);

    slides.forEach((slide: { id: string; order: number }) => {
      const docRef = doc(db!, COLLECTIONS.HERO_SLIDES, slide.id);
      batch.update(docRef, {
        order: slide.order,
        updatedAt: Timestamp.now(),
      });
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: "Slides reordered successfully",
    });
  } catch (error) {
    console.error("Error reordering hero slides:", error);
    return NextResponse.json(
      { error: "Failed to reorder hero slides" },
      { status: 500 }
    );
  }
}
