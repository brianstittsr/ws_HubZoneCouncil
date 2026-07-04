"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Loader2, Plus, RefreshCw, Upload, FileText, Trash2, Edit, BookOpen, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface WikiEntry {
  id: string;
  title: string;
  content: string;
  category?: string;
  tags?: string[];
  isPublic: boolean;
  displayOrder?: number;
  sourceDocumentName?: string;
  updatedAt?: { seconds: number; nanoseconds: number };
}

interface WikiDocument {
  id: string;
  name: string;
  fileName?: string;
  contentType?: string;
  status: "pending" | "processing" | "processed" | "error";
  processingError?: string;
  extractedEntryCount?: number;
  createdAt?: { seconds: number; nanoseconds: number };
}

interface ChatLog {
  id: string;
  question: string;
  answer: string;
  model?: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

const WIKI_CATEGORIES = [
  "General",
  "Agenda",
  "Speakers",
  "Sponsors",
  "Tickets",
  "Venue",
  "Travel",
  "FAQ",
  "Policy",
  "Other",
];

export default function ConferenceWikiAdminPage() {
  const [activeTab, setActiveTab] = useState("entries");
  const [entries, setEntries] = useState<WikiEntry[]>([]);
  const [documents, setDocuments] = useState<WikiDocument[]>([]);
  const [chatLogs, setChatLogs] = useState<ChatLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [entryDialogOpen, setEntryDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<WikiEntry | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadText, setUploadText] = useState("");
  const [uploadName, setUploadName] = useState("");
  const [processingDocId, setProcessingDocId] = useState<string | null>(null);
  const [reindexing, setReindexing] = useState(false);

  const [formTitle, setFormTitle] = useState("");
  const [formContent, setFormContent] = useState("");
  const [formCategory, setFormCategory] = useState("General");
  const [formPublic, setFormPublic] = useState(true);
  const [formOrder, setFormOrder] = useState(0);

  const fetchEntries = useCallback(async () => {
    try {
      const res = await fetch("/api/conference/wiki/entries");
      const data = await res.json();
      if (data.data) setEntries(data.data);
    } catch (error) {
      console.error("Failed to fetch entries:", error);
      toast.error("Failed to load wiki entries");
    }
  }, []);

  const fetchDocuments = useCallback(async () => {
    try {
      const res = await fetch("/api/conference/wiki/documents");
      const data = await res.json();
      if (data.data) setDocuments(data.data);
    } catch (error) {
      console.error("Failed to fetch documents:", error);
      toast.error("Failed to load documents");
    }
  }, []);

  const fetchChatLogs = useCallback(async () => {
    try {
      const res = await fetch("/api/conference/wiki/chat-logs");
      const data = await res.json();
      if (data.data) setChatLogs(data.data);
    } catch (error) {
      console.error("Failed to fetch chat logs:", error);
      toast.error("Failed to load chat logs");
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([fetchEntries(), fetchDocuments(), fetchChatLogs()]).finally(() => setLoading(false));
  }, [fetchEntries, fetchDocuments, fetchChatLogs]);

  const openEntryDialog = (entry?: WikiEntry) => {
    if (entry) {
      setEditingEntry(entry);
      setFormTitle(entry.title);
      setFormContent(entry.content);
      setFormCategory(entry.category || "General");
      setFormPublic(entry.isPublic);
      setFormOrder(entry.displayOrder ?? 0);
    } else {
      setEditingEntry(null);
      setFormTitle("");
      setFormContent("");
      setFormCategory("General");
      setFormPublic(true);
      setFormOrder(0);
    }
    setEntryDialogOpen(true);
  };

  const handleSaveEntry = async () => {
    if (!formTitle.trim() || !formContent.trim()) {
      toast.error("Title and content are required");
      return;
    }
    try {
      const url = editingEntry ? `/api/conference/wiki/entries/${editingEntry.id}` : "/api/conference/wiki/entries";
      const method = editingEntry ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          content: formContent,
          category: formCategory,
          isPublic: formPublic,
          displayOrder: formOrder,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      toast.success(editingEntry ? "Entry updated" : "Entry created");
      setEntryDialogOpen(false);
      fetchEntries();
    } catch (error) {
      console.error("Save entry error:", error);
      toast.error("Failed to save entry");
    }
  };

  const handleDeleteEntry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this wiki entry?")) return;
    try {
      const res = await fetch(`/api/conference/wiki/entries/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      toast.success("Entry deleted");
      fetchEntries();
    } catch (error) {
      console.error("Delete entry error:", error);
      toast.error("Failed to delete entry");
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setUploadFile(file);
    if (file) {
      setUploadName(file.name);
      if (file.type === "text/plain" || file.name.endsWith(".md") || file.name.endsWith(".txt")) {
        const reader = new FileReader();
        reader.onload = (event) => {
          setUploadText(String(event.target?.result || ""));
        };
        reader.readAsText(file);
      } else {
        setUploadText("");
        toast.info("Text files are processed automatically. For PDF/DOCX, paste extracted text below.");
      }
    }
  };

  const handleUploadDocument = async () => {
    if (!uploadName.trim()) {
      toast.error("Document name is required");
      return;
    }
    try {
      const saveRes = await fetch("/api/conference/wiki/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: uploadName,
          fileName: uploadFile?.name || uploadName,
          contentType: uploadFile?.type || "text/plain",
          size: uploadFile?.size || 0,
          contentText: uploadText || null,
          status: "pending",
        }),
      });
      const saveData = await saveRes.json();
      if (!saveRes.ok || !saveData.data?.id) throw new Error("Failed to save document");
      const docId = saveData.data.id;

      if (uploadText.trim()) {
        setProcessingDocId(docId);
        const processRes = await fetch("/api/conference/wiki/process-document", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            documentId: docId,
            contentText: uploadText,
            documentName: uploadName,
          }),
        });
        if (!processRes.ok) throw new Error("Failed to process document");
        const processData = await processRes.json();
        toast.success(`Created ${processData.data?.entriesCreated || 0} wiki entries from document`);
      } else {
        toast.success("Document uploaded. Add extracted text to process it into wiki entries.");
      }

      setUploadDialogOpen(false);
      setUploadFile(null);
      setUploadText("");
      setUploadName("");
      fetchDocuments();
      fetchEntries();
    } catch (error) {
      console.error("Upload document error:", error);
      toast.error("Failed to upload document");
    } finally {
      setProcessingDocId(null);
    }
  };

  const handleReindex = async () => {
    setReindexing(true);
    try {
      const res = await fetch("/api/conference/wiki/reindex", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to reindex");
      toast.success(`Reindexed ${data.data?.filesRead || 0} files, ${data.data?.entriesCreated || 0} entries`);
      fetchEntries();
      fetchDocuments();
    } catch (error) {
      console.error("Reindex error:", error);
      toast.error("Failed to reindex wiki folder");
    } finally {
      setReindexing(false);
    }
  };

  const handleProcessDocument = async (docId: string, contentText: string, name: string) => {
    if (!contentText.trim()) {
      toast.error("No text content available for this document");
      return;
    }
    setProcessingDocId(docId);
    try {
      const res = await fetch("/api/conference/wiki/process-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: docId, contentText, documentName: name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to process");
      toast.success(`Created ${data.data?.entriesCreated || 0} entries`);
      fetchDocuments();
      fetchEntries();
    } catch (error) {
      console.error("Process document error:", error);
      toast.error("Failed to process document");
    } finally {
      setProcessingDocId(null);
    }
  };

  const formatDate = (timestamp?: { seconds: number; nanoseconds: number }) => {
    if (!timestamp) return "—";
    return new Date(timestamp.seconds * 1000).toLocaleString();
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-7xl">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold">Conference Wiki</h1>
          <p className="text-muted-foreground">
            Manage AI knowledge for the home-page conference assistant.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleReindex} disabled={reindexing}>
            {reindexing ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <RefreshCw className="h-4 w-4 mr-2" />}
            Reindex Wiki Folder
          </Button>
          <Button onClick={() => openEntryDialog()}>
            <Plus className="h-4 w-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="entries">
            <BookOpen className="h-4 w-4 mr-2" />
            Wiki Entries
          </TabsTrigger>
          <TabsTrigger value="documents">
            <FileText className="h-4 w-4 mr-2" />
            Documents
          </TabsTrigger>
          <TabsTrigger value="chatLogs">
            <MessageSquare className="h-4 w-4 mr-2" />
            Chat Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entries">
          <Card>
            <CardHeader>
              <CardTitle>Wiki Entries</CardTitle>
              <CardDescription>Knowledge entries shown to the conference assistant.</CardDescription>
            </CardHeader>
            <CardContent>
              {loading && entries.length === 0 ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-[#C8A951]" />
                </div>
              ) : entries.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No wiki entries yet. Add entries manually or reindex the Wiki folder.
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{entry.title}</h3>
                          {!entry.isPublic && <Badge variant="secondary">Draft</Badge>}
                          {entry.category && <Badge variant="outline">{entry.category}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground line-clamp-2">{entry.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Updated {formatDate(entry.updatedAt)}
                          {entry.sourceDocumentName && ` · Source: ${entry.sourceDocumentName}`}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button variant="ghost" size="icon" onClick={() => openEntryDialog(entry)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteEntry(entry.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle>Wiki Documents</CardTitle>
                <CardDescription>Upload documents or reindex the /Wiki folder to feed the knowledge base.</CardDescription>
              </div>
              <Button onClick={() => setUploadDialogOpen(true)}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </CardHeader>
            <CardContent>
              {documents.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  No uploaded documents. Reindex the Wiki folder or upload a new document.
                </div>
              ) : (
                <div className="space-y-3">
                  {documents.map((doc) => (
                    <div
                      key={doc.id}
                      className="flex items-start justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{doc.name}</h3>
                          <Badge variant={doc.status === "processed" ? "default" : "secondary"}>{doc.status}</Badge>
                          {doc.contentType && <Badge variant="outline">{doc.contentType}</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {doc.extractedEntryCount !== undefined && `${doc.extractedEntryCount} entries extracted · `}
                          Uploaded {formatDate(doc.createdAt)}
                        </p>
                        {doc.processingError && (
                          <p className="text-sm text-destructive mt-1">{doc.processingError}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          disabled={processingDocId === doc.id || doc.status === "processed"}
                          onClick={() => handleProcessDocument(doc.id, doc.contentType || "", doc.name)}
                        >
                          {processingDocId === doc.id ? (
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          ) : (
                            <RefreshCw className="h-4 w-4 mr-2" />
                          )}
                          Process
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chatLogs">
          <Card>
            <CardHeader>
              <CardTitle>Chat Logs</CardTitle>
              <CardDescription>Questions asked by visitors and the assistant responses.</CardDescription>
            </CardHeader>
            <CardContent>
              {chatLogs.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">No chat logs yet.</div>
              ) : (
                <div className="space-y-4">
                  {chatLogs.map((log) => (
                    <div key={log.id} className="rounded-lg border p-4">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-muted-foreground uppercase">Question</span>
                        <p className="font-medium">{log.question}</p>
                      </div>
                      <Separator className="my-2" />
                      <div>
                        <span className="text-xs font-medium text-muted-foreground uppercase">Answer</span>
                        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{log.answer}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        {log.model} · {formatDate(log.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Entry Dialog */}
      <Dialog open={entryDialogOpen} onOpenChange={setEntryDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingEntry ? "Edit Wiki Entry" : "New Wiki Entry"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formCategory} onValueChange={setFormCategory}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WIKI_CATEGORIES.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Content</Label>
              <Textarea
                id="content"
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                rows={10}
              />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Switch id="public" checked={formPublic} onCheckedChange={setFormPublic} />
                <Label htmlFor="public">Published</Label>
              </div>
              <div className="flex items-center gap-2">
                <Label htmlFor="order">Order</Label>
                <Input
                  id="order"
                  type="number"
                  value={formOrder}
                  onChange={(e) => setFormOrder(Number(e.target.value))}
                  className="w-24"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEntryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEntry}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Wiki Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="file">Select file</Label>
              <Input id="file" type="file" accept=".md,.txt,.pdf,.docx" onChange={handleFileSelect} />
              <p className="text-xs text-muted-foreground">
                Text files (.md, .txt) are processed automatically. For PDF/DOCX, paste extracted text below.
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="docName">Document name</Label>
              <Input id="docName" value={uploadName} onChange={(e) => setUploadName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="docText">Extracted text (optional)</Label>
              <Textarea
                id="docText"
                value={uploadText}
                onChange={(e) => setUploadText(e.target.value)}
                rows={8}
                placeholder="Paste document text here to generate wiki entries automatically..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setUploadDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUploadDocument} disabled={processingDocId !== null}>
              {processingDocId !== null ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Upload & Process
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
