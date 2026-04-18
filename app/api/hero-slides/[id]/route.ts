import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  writeBatch,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

// GET - Get a single hero slide
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const docRef = doc(db, COLLECTIONS.HERO_SLIDES, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      slide: { id: docSnap.id, ...docSnap.data() },
    });
  } catch (error) {
    console.error("Error fetching hero slide:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero slide" },
      { status: 500 }
    );
  }
}

// PATCH - Update a hero slide
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const docRef = doc(db, COLLECTIONS.HERO_SLIDES, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updatedAt: Timestamp.now(),
    };

    // Only update provided fields
    if (body.badge !== undefined) updateData.badge = body.badge;
    if (body.headline !== undefined) updateData.headline = body.headline;
    if (body.highlightedText !== undefined) updateData.highlightedText = body.highlightedText;
    if (body.subheadline !== undefined) updateData.subheadline = body.subheadline;
    if (body.benefits !== undefined) updateData.benefits = body.benefits;
    if (body.primaryCta !== undefined) updateData.primaryCta = body.primaryCta;
    if (body.secondaryCta !== undefined) updateData.secondaryCta = body.secondaryCta;
    if (body.isPublished !== undefined) updateData.isPublished = body.isPublished;
    if (body.order !== undefined) updateData.order = body.order;
    if (body.backgroundImage !== undefined) updateData.backgroundImage = body.backgroundImage;

    await updateDoc(docRef, updateData);

    // Fetch updated document
    const updatedSnap = await getDoc(docRef);

    return NextResponse.json({
      success: true,
      slide: { id: updatedSnap.id, ...updatedSnap.data() },
    });
  } catch (error) {
    console.error("Error updating hero slide:", error);
    return NextResponse.json(
      { error: "Failed to update hero slide" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a hero slide
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const docRef = doc(db, COLLECTIONS.HERO_SLIDES, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return NextResponse.json(
        { error: "Hero slide not found" },
        { status: 404 }
      );
    }

    await deleteDoc(docRef);

    return NextResponse.json({
      success: true,
      message: "Hero slide deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting hero slide:", error);
    return NextResponse.json(
      { error: "Failed to delete hero slide" },
      { status: 500 }
    );
  }
}
