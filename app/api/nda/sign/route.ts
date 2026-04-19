import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS } from "@/lib/schema";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { token, signerName, signerTitle, signatureData } = body;

    if (!token || !signerName || !signatureData) {
      return NextResponse.json(
        { error: "Missing required fields: token, signerName, signatureData" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // Find the NDA document by public access token
    // In production, you'd query by token. For now, we'll use a simple approach
    // This would be: query(collection(db, COLLECTIONS.NDA_DOCUMENTS), where("publicAccessToken", "==", token))
    
    // For demo purposes, extract document ID from token or use a lookup
    // In production, implement proper token-based lookup
    
    const clientIP = request.headers.get("x-forwarded-for") || 
                     request.headers.get("x-real-ip") || 
                     "unknown";

    const signatureInfo = {
      signedBy: signerName,
      signedAt: Timestamp.now(),
      ipAddress: clientIP,
      signatureImage: signatureData,
      timestamp: new Date().toISOString(),
    };

    // Update the NDA document
    // In production, you'd find the document by token first
    // const docRef = doc(db, COLLECTIONS.NDA_DOCUMENTS, documentId);
    // await updateDoc(docRef, {
    //   status: "pending_countersign",
    //   signerSignature: signatureInfo,
    //   signedAt: Timestamp.now(),
    //   updatedAt: Timestamp.now(),
    // });

    // For now, return success (mock response)
    return NextResponse.json({
      success: true,
      message: "Signature submitted successfully",
      data: {
        signedBy: signerName,
        signedAt: new Date().toISOString(),
        status: "pending_countersign",
      },
    });
  } catch (error) {
    console.error("Error processing NDA signature:", error);
    return NextResponse.json(
      { error: "Failed to process signature" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Missing token parameter" },
        { status: 400 }
      );
    }

    if (!db) {
      return NextResponse.json(
        { error: "Database not initialized" },
        { status: 500 }
      );
    }

    // In production, query by token to get the NDA document
    // const q = query(collection(db, COLLECTIONS.NDA_DOCUMENTS), where("publicAccessToken", "==", token));
    // const snapshot = await getDocs(q);
    
    // For demo, return mock data
    const mockNDA = {
      id: "demo",
      name: "NDA - Demo Company",
      status: "pending_signature",
      disclosingParty: {
        name: "Nelinia Varenas",
        title: "CEO",
        company: "Strategic Value Plus",
      },
      receivingParty: {
        name: "Demo User",
        company: "Demo Company",
        email: "demo@example.com",
      },
      effectiveDate: new Date().toISOString().split("T")[0],
      sections: [
        {
          id: "1",
          title: "Parties",
          content: "This Non-Disclosure Agreement is entered into...",
        },
      ],
    };

    return NextResponse.json({
      success: true,
      data: mockNDA,
    });
  } catch (error) {
    console.error("Error fetching NDA:", error);
    return NextResponse.json(
      { error: "Failed to fetch NDA document" },
      { status: 500 }
    );
  }
}
