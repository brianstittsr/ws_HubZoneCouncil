import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/firebase";
import { adminDb } from "@/lib/firebase-admin";
import { COLLECTIONS } from "@/lib/schema";
import { Timestamp } from "firebase/firestore";
import {
  getPublicWikiEntries,
  buildWikiContext,
  buildConferenceSystemPrompt,
} from "@/lib/conference-wiki";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface AskRequest {
  question: string;
  history?: ChatMessage[];
  sessionId?: string;
}

async function callOpenAI(
  apiKey: string,
  messages: { role: string; content: string }[]
): Promise<string> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.3,
      max_tokens: 1500,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`OpenAI API error ${response.status}: ${text}`);
  }

  const data = await response.json();
  return data.choices[0]?.message?.content || "No response generated";
}

function generateFallbackResponse(): string {
  return "I don't have that information yet. Please contact info@hubzonecouncil.org or call 240-442-1787 for help.";
}

export async function POST(request: NextRequest) {
  try {
    const body: AskRequest = await request.json();
    const { question, history = [], sessionId } = body;

    if (!question || typeof question !== "string") {
      return NextResponse.json({ error: "Question is required" }, { status: 400 });
    }

    const entries = db ? await getPublicWikiEntries(db) : [];
    const wikiContext = buildWikiContext(entries);
    const systemPrompt = buildConferenceSystemPrompt(wikiContext);

    const messages = [
      { role: "system", content: systemPrompt },
      ...history.map((msg) => ({ role: msg.role, content: msg.content })),
      { role: "user", content: question },
    ];

    const apiKey = process.env.OPENAI_API_KEY;
    let answer: string;
    let model = "none";

    if (apiKey) {
      answer = await callOpenAI(apiKey, messages);
      model = "gpt-4o-mini";
    } else {
      answer = generateFallbackResponse();
    }

    const sources = entries.slice(0, 5).map((entry) => entry.title);

    // Log the question and answer
    const logData = {
      sessionId: sessionId || null,
      question,
      answer,
      model,
      sources,
      wasHelpful: null,
      ipAddress: request.headers.get("x-forwarded-for") || undefined,
      userAgent: request.headers.get("user-agent") || undefined,
      createdAt: Timestamp.now(),
    };

    if (adminDb) {
      try {
        await adminDb.collection(COLLECTIONS.CONFERENCE_CHAT_LOGS).add(logData);
      } catch (logError) {
        console.error("[conference/ask] Failed to log chat:", logError);
      }
    }

    return NextResponse.json({ answer, sources, model });
  } catch (error) {
    console.error("Conference ask error:", error);
    return NextResponse.json(
      { error: "Failed to answer question" },
      { status: 500 }
    );
  }
}
