"use client";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Upload,
  Search,
  FileText,
  FileSpreadsheet,
  FileImage,
  File,
  Folder,
  MoreHorizontal,
  Download,
  Eye,
  Trash2,
  Share2,
  Clock,
  User,
  Loader2,
  FolderOpen,
  Plus,
  Pencil,
  X,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, orderBy, deleteDoc, doc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { useUserProfile } from "@/contexts/user-profile-context";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  type: string;
  size: string;
  sizeBytes: number;
  folder: string;
  category: string;
  description: string;
  version: string;
  uploadedBy: string;
  uploadedAt: string;
  shared: boolean;
  storagePath?: string;
  downloadUrl?: string;
  base64Data?: string;
}

interface DocumentFormData {
  name: string;
  category: string;
  description: string;
  version: string;
  folder: string;
  shared: boolean;
}

const DOCUMENT_CATEGORIES = [
  "Proposal",
  "Contract",
  "Agreement",
  "Template",
  "Report",
  "Presentation",
  "Training Material",
  "Policy",
  "Procedure",
  "Other",
];

const DOCUMENT_FOLDERS = [
  "Proposals",
  "Contracts",
  "Templates",
  "Reports",
  "Training",
  "Policies",
  "Marketing",
  "Projects",
  "Uncategorized",
];

interface FolderCount {
  name: string;
  count: number;
}

function getFileIcon(type: string) {
  switch (type) {
    case "pdf":
      return <FileText className="h-5 w-5 text-red-500" />;
    case "spreadsheet":
      return <FileSpreadsheet className="h-5 w-5 text-green-500" />;
    case "document":
      return <FileText className="h-5 w-5 text-blue-500" />;
    case "presentation":
      return <FileText className="h-5 w-5 text-orange-500" />;
    case "image":
      return <FileImage className="h-5 w-5 text-purple-500" />;
    default:
      return <File className="h-5 w-5 text-gray-500" />;
  }
}

function formatDate(dateString: string) {
  if (!dateString) return "Unknown";
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}

function getFileType(fileName: string): string {
  const ext = fileName.split(".").pop()?.toLowerCase() || "";
  if (["pdf"].includes(ext)) return "pdf";
  if (["xlsx", "xls", "csv"].includes(ext)) return "spreadsheet";
  if (["doc", "docx", "txt", "md"].includes(ext)) return "document";
  if (["ppt", "pptx"].includes(ext)) return "presentation";
  if (["jpg", "jpeg", "png", "gif", "svg", "webp"].includes(ext)) return "image";
  if (["zip", "rar", "7z", "tar", "gz"].includes(ext)) return "archive";
  return "other";
}

const emptyFormData: DocumentFormData = {
  name: "",
  category: "Other",
  description: "",
  version: "1.0",
  folder: "Uncategorized",
  shared: false,
};

export default function DocumentsPage() {
  const { getDisplayName } = useUserProfile();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<FolderCount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedFolder, setSelectedFolder] = useState("All Documents");
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [sortBy, setSortBy] = useState("recent");
  
  // Upload/Edit dialog state
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [formData, setFormData] = useState<DocumentFormData>(emptyFormData);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileBase64, setFileBase64] = useState<string>("");
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents from Firestore
  useEffect(() => {
    const fetchDocuments = async () => {
      if (!db) {
        setIsLoading(false);
        return;
      }

      try {
        const docsRef = collection(db, "documents");
        const q = query(docsRef, orderBy("uploadedAt", "desc"));
        const snapshot = await getDocs(q);
        
        const docs: Document[] = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          return {
            id: docSnap.id,
            name: data.name || "Untitled",
            type: data.type || getFileType(data.name || ""),
            size: data.size || formatFileSize(data.sizeBytes || 0),
            sizeBytes: data.sizeBytes || 0,
            folder: data.folder || "Uncategorized",
            category: data.category || "Other",
            description: data.description || "",
            version: data.version || "1.0",
            uploadedBy: data.uploadedBy || "Unknown",
            uploadedAt: data.uploadedAt?.toDate?.()?.toISOString() || data.uploadedAt || "",
            shared: data.shared || false,
            storagePath: data.storagePath,
            downloadUrl: data.downloadUrl,
            base64Data: data.base64Data,
          };
        });

        setDocuments(docs);

        // Calculate folder counts
        const folderCounts: Record<string, number> = {};
        docs.forEach((doc) => {
          folderCounts[doc.folder] = (folderCounts[doc.folder] || 0) + 1;
        });

        const folderList: FolderCount[] = [
          { name: "All Documents", count: docs.length },
          ...Object.entries(folderCounts).map(([name, count]) => ({ name, count })),
        ];
        setFolders(folderList);
      } catch (error) {
        console.error("Error fetching documents:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDocuments();
  }, []);

  // Filter and sort documents
  const filteredDocuments = documents
    .filter((doc) => {
      if (selectedFolder !== "All Documents" && doc.folder !== selectedFolder) return false;
      if (typeFilter !== "all" && doc.type !== typeFilter) return false;
      if (searchQuery && !doc.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name);
      if (sortBy === "size") return b.sizeBytes - a.sizeBytes;
      return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
    });

  // Delete document
  const handleDelete = async (docId: string) => {
    if (!db) return;
    if (!confirm("Are you sure you want to delete this document?")) return;

    try {
      await deleteDoc(doc(db, "documents", docId));
      setDocuments((prev) => prev.filter((d) => d.id !== docId));
      toast.success("Document deleted successfully");
    } catch (error) {
      console.error("Error deleting document:", error);
      toast.error("Failed to delete document");
    }
  };

  // Download document (base64 or URL)
  const handleDownload = (document: Document) => {
    if (document.base64Data) {
      // Create download link from base64
      const link = window.document.createElement("a");
      link.href = document.base64Data;
      link.download = document.name;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
    } else if (document.downloadUrl) {
      window.open(document.downloadUrl, "_blank");
    } else {
      toast.error("No download available for this document");
    }
  };

  // Handle file selection
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 10MB for base64)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("File size must be less than 10MB");
      return;
    }

    setSelectedFile(file);
    setFormData(prev => ({
      ...prev,
      name: prev.name || file.name,
    }));

    // Convert to base64
    const reader = new FileReader();
    reader.onload = () => {
      setFileBase64(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Open dialog for editing
  const handleEdit = (document: Document) => {
    setEditingDocument(document);
    setFormData({
      name: document.name,
      category: document.category,
      description: document.description,
      version: document.version,
      folder: document.folder,
      shared: document.shared,
    });
    setFileBase64(document.base64Data || "");
    setUploadDialogOpen(true);
  };

  // Reset dialog state
  const resetDialog = () => {
    setUploadDialogOpen(false);
    setEditingDocument(null);
    setFormData(emptyFormData);
    setSelectedFile(null);
    setFileBase64("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Save document (create or update)
  const handleSave = async () => {
    if (!db) return;
    if (!formData.name.trim()) {
      toast.error("Please enter a document name");
      return;
    }
    if (!editingDocument && !fileBase64) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsSaving(true);
    try {
      const documentData = {
        name: formData.name.trim(),
        type: selectedFile ? getFileType(selectedFile.name) : (editingDocument?.type || "other"),
        sizeBytes: selectedFile?.size || editingDocument?.sizeBytes || 0,
        size: selectedFile ? formatFileSize(selectedFile.size) : (editingDocument?.size || "0 Bytes"),
        folder: formData.folder,
        category: formData.category,
        description: formData.description,
        version: formData.version,
        shared: formData.shared,
        uploadedBy: getDisplayName(),
        updatedAt: Timestamp.now(),
        ...(fileBase64 && { base64Data: fileBase64 }),
      };

      if (editingDocument) {
        // Update existing document
        await updateDoc(doc(db, "documents", editingDocument.id), documentData);
        setDocuments(prev => prev.map(d => 
          d.id === editingDocument.id 
            ? { ...d, ...documentData, uploadedAt: d.uploadedAt }
            : d
        ));
        toast.success("Document updated successfully");
      } else {
        // Create new document
        const docRef = await addDoc(collection(db, "documents"), {
          ...documentData,
          uploadedAt: Timestamp.now(),
        });
        const newDoc: Document = {
          id: docRef.id,
          ...documentData,
          uploadedAt: new Date().toISOString(),
        };
        setDocuments(prev => [newDoc, ...prev]);
        toast.success("Document uploaded successfully");
      }

      resetDialog();
    } catch (error) {
      console.error("Error saving document:", error);
      toast.error("Failed to save document");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Documents</h1>
          <p className="text-muted-foreground">
            Manage proposals, templates, and project documents
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="mr-2 h-4 w-4" />
          Upload Document
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-4">
        {/* Sidebar - Folders */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-base">Folders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 p-2">
              {folders.length === 0 ? (
                <p className="text-sm text-muted-foreground p-2">No folders yet</p>
              ) : (
                folders.map((folder) => (
                  <Button
                    key={folder.name}
                    variant={selectedFolder === folder.name ? "secondary" : "ghost"}
                    className="w-full justify-between"
                    onClick={() => setSelectedFolder(folder.name)}
                  >
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4" />
                      {folder.name}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {folder.count}
                    </Badge>
                  </Button>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="lg:col-span-3 space-y-4">
          {/* Search & Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input 
                    placeholder="Search documents..." 
                    className="pl-9" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                    <SelectItem value="spreadsheet">Spreadsheet</SelectItem>
                    <SelectItem value="document">Document</SelectItem>
                    <SelectItem value="presentation">Presentation</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-full md:w-[150px]">
                    <SelectValue placeholder="Sort" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="name">Name</SelectItem>
                    <SelectItem value="size">Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Documents Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Folder</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Uploaded</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                        <p className="text-muted-foreground mt-2">Loading documents...</p>
                      </TableCell>
                    </TableRow>
                  ) : filteredDocuments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8">
                        <FolderOpen className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
                        <p className="text-muted-foreground">No documents found</p>
                        <p className="text-sm text-muted-foreground">Upload documents to get started</p>
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredDocuments.map((doc) => (
                    <TableRow key={doc.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {getFileIcon(doc.type)}
                          <div>
                            <p className="font-medium">{doc.name}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <User className="h-3 w-3" />
                              {doc.uploadedBy}
                              {doc.shared && (
                                <Badge variant="outline" className="text-xs">
                                  <Share2 className="h-3 w-3 mr-1" />
                                  Shared
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{doc.folder}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">{doc.size}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {formatDate(doc.uploadedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(doc)}>
                              <Pencil className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => doc.base64Data && window.open(doc.base64Data, "_blank")}>
                              <Eye className="mr-2 h-4 w-4" />
                              View
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDownload(doc)}>
                              <Download className="mr-2 h-4 w-4" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              onClick={() => handleDelete(doc.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Upload/Edit Document Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingDocument ? "Edit Document" : "Upload Document"}</DialogTitle>
            <DialogDescription>
              {editingDocument 
                ? "Update the document details below."
                : "Upload a new document with metadata."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* File Upload */}
            {!editingDocument && (
              <div className="space-y-2">
                <Label>File</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  {selectedFile ? (
                    <div className="flex items-center justify-center gap-2">
                      {getFileIcon(getFileType(selectedFile.name))}
                      <span className="font-medium">{selectedFile.name}</span>
                      <span className="text-muted-foreground">({formatFileSize(selectedFile.size)})</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setSelectedFile(null);
                          setFileBase64("");
                          if (fileInputRef.current) fileInputRef.current.value = "";
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <label htmlFor="file-upload" className="cursor-pointer">
                      <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">
                        Click to select a file (max 10MB)
                      </p>
                    </label>
                  )}
                </div>
              </div>
            )}

            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="doc-name">Document Name *</Label>
              <Input
                id="doc-name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter document name"
              />
            </div>

            {/* Category & Folder */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Folder</Label>
                <Select
                  value={formData.folder}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, folder: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DOCUMENT_FOLDERS.map((folder) => (
                      <SelectItem key={folder} value={folder}>{folder}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Version */}
            <div className="space-y-2">
              <Label htmlFor="doc-version">Version</Label>
              <Input
                id="doc-version"
                value={formData.version}
                onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                placeholder="e.g., 1.0, 2.1"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="doc-description">Description</Label>
              <Textarea
                id="doc-description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Brief description of the document"
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={resetDialog}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {editingDocument ? "Save Changes" : "Upload"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
