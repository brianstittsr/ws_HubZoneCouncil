import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { saveWikiDocument } from "@/lib/conference-wiki";
import { COLLECTIONS } from "@/lib/schema";
import { doc, updateDoc, Timestamp } from "firebase/firestore";

interface WikiEntryProposal {
  title: string;
  content: string;
  category?: string;
}

async function extractEntriesWithAI(content: string, documentName: string): Promise<WikiEntryProposal[]> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    // Fallback: chunk by headings if no AI key
    const chunks: WikiEntryProposal[] = [];
    const lines = content.split(/\r?\n/);
    let currentTitle = documentName;
    let currentCategory: string | undefined;
    let currentLines: string[] = [];
    const flush = () => {
      const trimmed = currentLines.join("\n").trim();
      if (trimmed) {
        chunks.push({ title: currentTitle, content: trimmed, category: currentCategory });
      }
      currentLines = [];
    };
    for (const line of lines) {
      const headingMatch = line.match(/^(#{1,3})\s+(.+)$/);
      if (headingMatch) {
        flush();
        currentTitle = headingMatch[2].trim();
        if (headingMatch[1].length === 1) currentCategory = currentTitle;
        currentLines.push(line);
      } else {
        currentLines.push(line);
      }
    }
    flush();
    return chunks;
  }

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `You are a knowledge-base curator for a conference. Given a document, extract a list of concise wiki entries (title + content) that answer common attendee questions. Return JSON only: { "entries": [{ "title": "...", "content": "...", "category": "..." }] }.`,
        },
        {
          role: "user",
          content: `Document: ${documentName}\n\n${content.slice(0, 12000)}`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    throw new Error(`OpenAI API error ${response.status}`);
  }

  const data = await response.json();
  const raw = data.choices[0]?.message?.content || "{\"entries\":[]}";
  const parsed = JSON.parse(raw) as { entries?: WikiEntryProposal[] };
  return parsed.entries || [];
}

export async function POST(req: NextRequest) {
  try {
    if (!db) return NextResponse.json({ error: "DB not initialized" }, { status: 500 });
    const body = await req.json();
    const { documentId, contentText, documentName } = body;

    if (!documentId || !contentText || typeof contentText !== "string") {
      return NextResponse.json({ error: "documentId and contentText are required" }, { status: 400 });
    }

    await updateDoc(doc(db, COLLECTIONS.CONFERENCE_WIKI_DOCUMENTS, documentId), {
      status: "processing",
      contentText,
      updatedAt: Timestamp.now(),
    });

    const entries = await extractEntriesWithAI(contentText, documentName || "Uploaded document");

    const { saveWikiEntry } = await import("@/lib/conference-wiki");
    for (const entry of entries) {
      await saveWikiEntry(db, {
        title: entry.title,
        content: entry.content,
        category: entry.category,
        sourceDocumentId: documentId,
        sourceDocumentName: documentName || "Uploaded document",
        isPublic: true,
      });
    }

    await updateDoc(doc(db, COLLECTIONS.CONFERENCE_WIKI_DOCUMENTS, documentId), {
      status: "processed",
      extractedEntryCount: entries.length,
      updatedAt: Timestamp.now(),
    });

    await saveWikiDocument(db, {
      id: documentId,
      name: documentName || "Uploaded document",
      contentText,
      status: "processed",
      extractedEntryCount: entries.length,
    });

    return NextResponse.json({ success: true, data: { entriesCreated: entries.length } });
  } catch (error) {
    console.error("POST /api/conference/wiki/process-document:", error);
    return NextResponse.json(
      { error: "Failed to process document", details: String(error) },
      { status: 500 }
    );
  }
}
