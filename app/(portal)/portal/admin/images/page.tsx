"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Download,
  Copy,
  Search,
  Filter,
  Grid,
  List,
  MoreVertical,
  Loader2,
  FolderOpen,
  Plus,
  X,
  Check,
  Eye,
} from "lucide-react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { toast } from "sonner";

const MAX_BASE64_SIZE = 900 * 1024; // 900KB max for Firestore (leaving buffer under 1MB limit)
const TARGET_QUALITY = 0.8; // JPEG quality for compression
const MAX_DIMENSION = 1920; // Max width/height in pixels

// Compress image using canvas
const compressImage = (file: File): Promise<{ blob: Blob; width: number; height: number }> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    img.onload = () => {
      let { width, height } = img;
      
      // Scale down if larger than max dimension
      if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
        if (width > height) {
          height = Math.round((height * MAX_DIMENSION) / width);
          width = MAX_DIMENSION;
        } else {
          width = Math.round((width * MAX_DIMENSION) / height);
          height = MAX_DIMENSION;
        }
      }
      
      canvas.width = width;
      canvas.height = height;
      ctx?.drawImage(img, 0, 0, width, height);
      
      // Try to compress to fit under size limit
      const tryCompress = (quality: number): void => {
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Failed to compress image"));
              return;
            }
            
            // If still too large and quality can be reduced, try again
            if (blob.size > MAX_BASE64_SIZE && quality > 0.3) {
              tryCompress(quality - 0.1);
            } else {
              resolve({ blob, width, height });
            }
          },
          "image/jpeg",
          quality
        );
      };
      
      // Start compression - use original format for small files, JPEG for compression
      if (file.size <= MAX_BASE64_SIZE) {
        // File is already small enough, just resize if needed
        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve({ blob, width, height });
            } else {
              reject(new Error("Failed to process image"));
            }
          },
          file.type.includes("png") ? "image/png" : "image/jpeg",
          TARGET_QUALITY
        );
      } else {
        // Compress to JPEG
        tryCompress(TARGET_QUALITY);
      }
    };
    
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = URL.createObjectURL(file);
  });
};

interface ImageAsset {
  id: string;
  name: string;
  url: string;
  thumbnailUrl?: string;
  folder: string;
  size: number;
  mimeType: string;
  width?: number;
  height?: number;
  storageRef?: string;
  alt?: string;
  tags: string[];
  uploadedBy: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

const folders = [
  { value: "all", label: "All Images" },
  { value: "heroes", label: "Hero Images" },
  { value: "logos", label: "Logos" },
  { value: "team", label: "Team Photos" },
  { value: "products", label: "Products" },
  { value: "blog", label: "Blog" },
  { value: "misc", label: "Miscellaneous" },
];

export default function ImageManagerPage() {
  const { profile } = useUserProfile();
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedImage, setSelectedImage] = useState<ImageAsset | null>(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const isAdmin = profile.role === "admin" || profile.role === "superadmin";

  // Fetch images from Firestore
  useEffect(() => {
    const fetchImages = async () => {
      if (!db) {
        console.log("Firebase db not initialized");
        setIsLoading(false);
        return;
      }
      setIsLoading(true);
      try {
        const imagesRef = collection(db, "image_assets");
        // Try without orderBy first to avoid index requirement
        const snapshot = await getDocs(imagesRef);
        console.log("Fetched images count:", snapshot.docs.length);
        const imagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ImageAsset[];
        // Sort client-side instead
        imagesData.sort((a, b) => {
          const aTime = a.createdAt?.toMillis?.() || 0;
          const bTime = b.createdAt?.toMillis?.() || 0;
          return bTime - aTime;
        });
        setImages(imagesData);
        setFilteredImages(imagesData);
      } catch (error) {
        console.error("Error fetching images:", error);
        toast.error("Failed to load images");
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  // Filter images based on search and folder
  useEffect(() => {
    let filtered = images;
    
    if (selectedFolder !== "all") {
      filtered = filtered.filter(img => img.folder === selectedFolder);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(img =>
        img.name.toLowerCase().includes(query) ||
        img.alt?.toLowerCase().includes(query) ||
        img.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    setFilteredImages(filtered);
  }, [images, selectedFolder, searchQuery]);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !db) return;

    setIsUploading(true);
    
    const uploadPromises = Array.from(files).map(async (file) => {
      const imageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const folder = selectedFolder === "all" ? "misc" : selectedFolder;
      
      // Compress image to fit within Firestore limits
      const { blob: compressedBlob, width, height } = await compressImage(file);
      
      // Convert compressed blob to Base64
      const imageUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error(`Failed to read file: ${file.name}`));
        reader.readAsDataURL(compressedBlob);
      });
      
      const newImage: ImageAsset = {
        id: imageId,
        name: file.name,
        url: imageUrl,
        folder: folder,
        size: compressedBlob.size,
        mimeType: compressedBlob.type,
        width,
        height,
        alt: "",
        tags: [],
        uploadedBy: profile.id,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      };

      await setDoc(doc(db!, "image_assets", newImage.id), newImage);
      return newImage;
    });

    try {
      const uploadedImages = await Promise.all(uploadPromises);
      setImages(prev => [...uploadedImages, ...prev]);
      toast.success(`${uploadedImages.length} image(s) uploaded and compressed successfully`);
      setUploadDialogOpen(false);
    } catch (error) {
      console.error("Error uploading images:", error);
      toast.error("Failed to upload images. Please try smaller images.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!db || !confirm("Are you sure you want to delete this image?")) return;
    try {
      // Delete from Firestore (images are stored as Base64, no external storage)
      await deleteDoc(doc(db, "image_assets", imageId));
      setImages(prev => prev.filter(img => img.id !== imageId));
      toast.success("Image deleted");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success("URL copied to clipboard");
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin privileges to access the Image Manager.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <ImageIcon className="h-8 w-8" />
            Image Manager
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage and organize your platform images
          </p>
        </div>
        <Button onClick={() => setUploadDialogOpen(true)}>
          <Upload className="h-4 w-4 mr-2" />
          Upload Images
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search images..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedFolder} onValueChange={setSelectedFolder}>
              <SelectTrigger className="w-48">
                <FolderOpen className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {folders.map(folder => (
                  <SelectItem key={folder.value} value={folder.value}>
                    {folder.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Images Grid/List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : filteredImages.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <ImageIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">No Images Found</h2>
            <p className="text-muted-foreground mb-4">
              {searchQuery || selectedFolder !== "all"
                ? "Try adjusting your filters"
                : "Upload your first image to get started"}
            </p>
            <Button onClick={() => setUploadDialogOpen(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Images
            </Button>
          </CardContent>
        </Card>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredImages.map(image => (
            <Card key={image.id} className="overflow-hidden group">
              <div className="aspect-square relative bg-muted">
                <img
                  src={image.url}
                  alt={image.alt || image.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => {
                      setSelectedImage(image);
                      setPreviewDialogOpen(true);
                    }}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="secondary"
                    onClick={() => copyToClipboard(image.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="destructive"
                    onClick={() => handleDelete(image.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <CardContent className="p-2">
                <p className="text-xs font-medium truncate">{image.name}</p>
                <p className="text-xs text-muted-foreground">{formatFileSize(image.size)}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full">
              <thead className="border-b">
                <tr>
                  <th className="text-left p-4">Image</th>
                  <th className="text-left p-4">Name</th>
                  <th className="text-left p-4">Folder</th>
                  <th className="text-left p-4">Size</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredImages.map(image => (
                  <tr key={image.id} className="border-b hover:bg-muted/50">
                    <td className="p-4">
                      <img
                        src={image.url}
                        alt={image.alt || image.name}
                        className="w-12 h-12 object-cover rounded"
                      />
                    </td>
                    <td className="p-4">{image.name}</td>
                    <td className="p-4">
                      <Badge variant="outline">{image.folder}</Badge>
                    </td>
                    <td className="p-4">{formatFileSize(image.size)}</td>
                    <td className="p-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => {
                            setSelectedImage(image);
                            setPreviewDialogOpen(true);
                          }}>
                            <Eye className="h-4 w-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => copyToClipboard(image.url)}>
                            <Copy className="h-4 w-4 mr-2" />
                            Copy URL
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(image.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Upload Images</DialogTitle>
            <DialogDescription>
              Select images to upload to your library
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Folder</Label>
              <Select value={selectedFolder === "all" ? "misc" : selectedFolder} onValueChange={setSelectedFolder}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {folders.filter(f => f.value !== "all").map(folder => (
                    <SelectItem key={folder.value} value={folder.value}>
                      {folder.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="border-2 border-dashed rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground mb-4">
                Drag and drop images here, or click to select
              </p>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={handleUpload}
                className="hidden"
                id="image-upload"
              />
              <Button asChild disabled={isUploading}>
                <label htmlFor="image-upload" className="cursor-pointer">
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Upload className="h-4 w-4 mr-2" />
                  )}
                  Select Images
                </label>
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedImage?.name}</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg overflow-hidden">
                <img
                  src={selectedImage.url}
                  alt={selectedImage.alt || selectedImage.name}
                  className="w-full h-auto max-h-[60vh] object-contain"
                />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-muted-foreground">Size</Label>
                  <p>{formatFileSize(selectedImage.size)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p>{selectedImage.mimeType}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Folder</Label>
                  <p>{selectedImage.folder}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={() => copyToClipboard(selectedImage.url)} className="flex-1">
                  <Copy className="h-4 w-4 mr-2" />
                  Copy URL
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => {
                    handleDelete(selectedImage.id);
                    setPreviewDialogOpen(false);
                  }}
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
