import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  addDoc,
  query,
  orderBy,
  Timestamp,
} from "firebase/firestore";
import { COLLECTIONS, type HeroSlideDoc } from "@/lib/schema";

// GET - List all hero slides
export async function GET() {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const slidesRef = collection(db, COLLECTIONS.HERO_SLIDES);
    const q = query(slidesRef, orderBy("order", "asc"));
    const snapshot = await getDocs(q);

    const slides = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ slides });
  } catch (error) {
    console.error("Error fetching hero slides:", error);
    return NextResponse.json(
      { error: "Failed to fetch hero slides" },
      { status: 500 }
    );
  }
}

// POST - Create a new hero slide
export async function POST(request: NextRequest) {
  try {
    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const {
      badge,
      headline,
      highlightedText,
      subheadline,
      benefits,
      primaryCta,
      secondaryCta,
      isPublished = false,
      order,
      backgroundImage,
    } = body;

    // Validate required fields
    if (!headline || !highlightedText) {
      return NextResponse.json(
        { error: "Headline and highlighted text are required" },
        { status: 400 }
      );
    }

    // Get current max order if not provided
    let slideOrder = order;
    if (slideOrder === undefined) {
      const slidesRef = collection(db, COLLECTIONS.HERO_SLIDES);
      const snapshot = await getDocs(slidesRef);
      slideOrder = snapshot.size + 1;
    }

    const slideData: Omit<HeroSlideDoc, "id"> = {
      badge: badge || "",
      headline,
      highlightedText,
      subheadline: subheadline || "",
      benefits: benefits || [],
      primaryCta: primaryCta || { text: "", href: "" },
      secondaryCta: secondaryCta || { text: "", href: "" },
      isPublished,
      order: slideOrder,
      ...(backgroundImage ? { backgroundImage } : {}),
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };

    const docRef = await addDoc(
      collection(db, COLLECTIONS.HERO_SLIDES),
      slideData
    );

    return NextResponse.json({
      success: true,
      slide: { id: docRef.id, ...slideData },
    });
  } catch (error) {
    console.error("Error creating hero slide:", error);
    return NextResponse.json(
      { error: "Failed to create hero slide" },
      { status: 500 }
    );
  }
}
