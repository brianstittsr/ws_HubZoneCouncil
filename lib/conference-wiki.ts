import { promises as fs } from "fs";
import path from "path";
import { COLLECTIONS, type ConferenceWikiEntryDoc, type ConferenceWikiDocumentDoc } from "@/lib/schema";
import type { Firestore } from "firebase/firestore";

/** Absolute path to the local Wiki folder for seeded documents. */
export const WIKI_FOLDER_PATH = path.join(process.cwd(), "Wiki");

/** Supported text-based file extensions that can be read directly. */
const SUPPORTED_EXTENSIONS = [".md", ".txt", ".markdown"];

/** Read every text file from the Wiki folder and return its raw content. */
export async function readWikiFolderFiles(): Promise<
  { fileName: string; content: string }[]
> {
  const files: { fileName: string; content: string }[] = [];
  try {
    const entries = await fs.readdir(WIKI_FOLDER_PATH, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile()) continue;
      const ext = path.extname(entry.name).toLowerCase();
      if (!SUPPORTED_EXTENSIONS.includes(ext)) continue;
      const filePath = path.join(WIKI_FOLDER_PATH, entry.name);
      const content = await fs.readFile(filePath, "utf-8");
      files.push({ fileName: entry.name, content });
    }
  } catch (error) {
    console.error("[conference-wiki] Failed to read Wiki folder:", error);
  }
  return files;
}

/** Split a Markdown document into heading-based chunks suitable for a wiki. */
export function chunkWikiDocument(fileName: string, content: string): {
  title: string;
  content: string;
  category?: string;
}[] {
  const lines = content.split(/\r?\n/);
  const chunks: { title: string; content: string; category?: string }[] = [];
  let currentTitle = fileName.replace(/\.[^.]+$/, "");
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
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      currentTitle = title;
      if (level === 1) {
        currentCategory = title;
      }
      currentLines.push(line);
    } else {
      currentLines.push(line);
    }
  }
  flush();

  return chunks;
}

/** Build a plain-text context string from wiki entries for the LLM prompt. */
export function buildWikiContext(entries: ConferenceWikiEntryDoc[]): string {
  return entries
    .map((entry) => `## ${entry.title}\n${entry.content}`)
    .join("\n\n");
}

/** Build a system prompt for the conference assistant. */
export function buildConferenceSystemPrompt(wikiContext: string): string {
  return `You are a helpful assistant for the 2026 National HUBZone Conference.
Answer questions using ONLY the conference knowledge provided below.
If the answer is not in the context, say "I don't have that information yet. Please contact info@hubzonecouncil.org or call 240-442-1787 for help."
Be concise, friendly, and factual. Use bullet points when appropriate.

CONFERENCE KNOWLEDGE:
${wikiContext || "No conference knowledge has been loaded yet."}`;
}

/** Lazy-load firebase/firestore utilities so this file works with both client and admin SDKs. */
async function getFirestoreUtils() {
  const { collection, getDocs, query, orderBy, where, updateDoc, doc, addDoc, Timestamp, deleteDoc, writeBatch } = await import("firebase/firestore");
  return { collection, getDocs, query, orderBy, where, updateDoc, doc, addDoc, Timestamp, deleteDoc, writeBatch };
}

/** Fetch all public wiki entries from Firestore. */
export async function getPublicWikiEntries(db: Firestore): Promise<ConferenceWikiEntryDoc[]> {
  const { collection, getDocs, query, orderBy, where } = await getFirestoreUtils();
  const q = query(
    collection(db, COLLECTIONS.CONFERENCE_WIKI_ENTRIES),
    where("isPublic", "==", true),
    orderBy("displayOrder", "asc"),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ConferenceWikiEntryDoc);
}

/** Fetch all wiki entries (including unpublished) from Firestore. */
export async function getAllWikiEntries(db: Firestore): Promise<ConferenceWikiEntryDoc[]> {
  const { collection, getDocs, query, orderBy } = await getFirestoreUtils();
  const q = query(
    collection(db, COLLECTIONS.CONFERENCE_WIKI_ENTRIES),
    orderBy("displayOrder", "asc"),
    orderBy("updatedAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() }) as ConferenceWikiEntryDoc);
}

/** Add or update a wiki entry in Firestore. */
export async function saveWikiEntry(
  db: Firestore,
  entry: Partial<ConferenceWikiEntryDoc> & { title: string; content: string }
): Promise<string> {
  const { collection, updateDoc, doc, addDoc, Timestamp } = await getFirestoreUtils();
  const now = Timestamp.now();
  const data = {
    title: entry.title,
    content: entry.content,
    category: entry.category || null,
    tags: entry.tags || [],
    sourceDocumentId: entry.sourceDocumentId || null,
    sourceDocumentName: entry.sourceDocumentName || null,
    sourceUrl: entry.sourceUrl || null,
    isPublic: entry.isPublic ?? true,
    displayOrder: entry.displayOrder ?? 0,
    updatedAt: now,
    createdAt: entry.id ? undefined : now,
  };
  if (entry.id) {
    await updateDoc(doc(db, COLLECTIONS.CONFERENCE_WIKI_ENTRIES, entry.id), data);
    return entry.id;
  }
  const docRef = await addDoc(collection(db, COLLECTIONS.CONFERENCE_WIKI_ENTRIES), data);
  return docRef.id;
}

/** Delete a wiki entry. */
export async function deleteWikiEntry(db: Firestore, id: string): Promise<void> {
  const { deleteDoc, doc } = await getFirestoreUtils();
  await deleteDoc(doc(db, COLLECTIONS.CONFERENCE_WIKI_ENTRIES, id));
}

/** Re-index the local Wiki folder: create/update entries from each file. */
export async function reindexWikiFolder(db: Firestore): Promise<{
  filesRead: number;
  entriesCreated: number;
  errors: string[];
}> {
  const { collection, getDocs, query, where, doc, Timestamp, writeBatch } = await getFirestoreUtils();
  const files = await readWikiFolderFiles();
  const errors: string[] = [];
  let entriesCreated = 0;
  const batch = writeBatch(db);
  const entriesCol = collection(db, COLLECTIONS.CONFERENCE_WIKI_ENTRIES);

  const existingSnap = await getDocs(
    query(entriesCol, where("sourceDocumentId", "==", "__wiki_folder__"))
  );
  existingSnap.docs.forEach((d) => batch.delete(d.ref));

  for (const file of files) {
    try {
      const chunks = chunkWikiDocument(file.fileName, file.content);
      for (const chunk of chunks) {
        const newDocRef = doc(entriesCol);
        batch.set(newDocRef, {
          title: chunk.title,
          content: chunk.content,
          category: chunk.category,
          tags: [],
          sourceDocumentId: "__wiki_folder__",
          sourceDocumentName: file.fileName,
          sourceUrl: `/Wiki/${file.fileName}`,
          isPublic: true,
          displayOrder: 0,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        });
        entriesCreated++;
      }
    } catch (error) {
      errors.push(`Failed to process ${file.fileName}: ${error}`);
    }
  }

  await batch.commit();
  return { filesRead: files.length, entriesCreated, errors };
}

/** Save a processed wiki document record. */
export async function saveWikiDocument(
  db: Firestore,
  data: Partial<ConferenceWikiDocumentDoc> & { name: string }
): Promise<string> {
  const { collection, updateDoc, doc, addDoc, Timestamp } = await getFirestoreUtils();
  const now = Timestamp.now();
  const docData = {
    name: data.name,
    fileName: data.fileName || data.name,
    contentType: data.contentType || null,
    contentText: data.contentText || null,
    storageUrl: data.storageUrl || null,
    size: data.size || null,
    status: data.status || "pending",
    processingError: data.processingError || null,
    extractedEntryCount: data.extractedEntryCount ?? null,
    updatedAt: now,
    createdAt: data.id ? undefined : now,
  };
  if (data.id) {
    await updateDoc(doc(db, COLLECTIONS.CONFERENCE_WIKI_DOCUMENTS, data.id), docData);
    return data.id;
  }
  const docRef = await addDoc(collection(db, COLLECTIONS.CONFERENCE_WIKI_DOCUMENTS), docData);
  return docRef.id;
}
