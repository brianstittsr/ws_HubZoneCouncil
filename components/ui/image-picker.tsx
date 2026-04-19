"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Image as ImageIcon,
  Upload,
  Search,
  Loader2,
  Check,
  X,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, Timestamp } from "firebase/firestore";
import { toast } from "sonner";

interface ImageAsset {
  id: string;
  name: string;
  url: string;
  folder: string;
  size: number;
  mimeType: string;
}

interface ImagePickerProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  placeholder?: string;
  folder?: string;
  className?: string;
  avatarMode?: boolean;
  avatarFallback?: string;
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

export function ImagePicker({
  value,
  onChange,
  label = "Image",
  placeholder = "Select an image",
  folder = "all",
  className = "",
  avatarMode = false,
  avatarFallback = "?",
}: ImagePickerProps) {
  const [open, setOpen] = useState(false);
  const [images, setImages] = useState<ImageAsset[]>([]);
  const [filteredImages, setFilteredImages] = useState<ImageAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFolder, setSelectedFolder] = useState(folder);
  const [isUploading, setIsUploading] = useState(false);

  // Fetch images when dialog opens
  useEffect(() => {
    if (open && images.length === 0) {
      fetchImages();
    }
  }, [open]);

  // Filter images
  useEffect(() => {
    let filtered = images;
    
    if (selectedFolder !== "all") {
      filtered = filtered.filter(img => img.folder === selectedFolder);
    }
    
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(img => img.name.toLowerCase().includes(q));
    }
    
    setFilteredImages(filtered);
  }, [images, selectedFolder, searchQuery]);

  const fetchImages = async () => {
    if (!db) return;
    setIsLoading(true);
    try {
      const imagesRef = collection(db, "image_assets");
      const snapshot = await getDocs(imagesRef);
      const imagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ImageAsset[];
      // Sort client-side
      imagesData.sort((a: any, b: any) => {
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

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !db) return;

    setIsUploading(true);
    const file = files[0];
    
    try {
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file"));
        reader.readAsDataURL(file);
      });

      const newImage: ImageAsset = {
        id: `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        url: base64,
        folder: selectedFolder === "all" ? "team" : selectedFolder,
        size: file.size,
        mimeType: file.type,
      };

      await setDoc(doc(db!, "image_assets", newImage.id), {
        ...newImage,
        alt: "",
        tags: [],
        uploadedBy: "system",
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });

      setImages(prev => [newImage, ...prev]);
      onChange(base64);
      setOpen(false);
      toast.success("Image uploaded and selected");
    } catch (error) {
      console.error("Error uploading image:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSelect = (url: string) => {
    onChange(url);
    setOpen(false);
  };

  const handleClear = () => {
    onChange("");
  };

  return (
    <div className={className}>
      {label && <Label className="mb-2 block">{label}</Label>}
      
      <div className="flex items-center gap-3">
        {avatarMode ? (
          <Avatar className="h-16 w-16">
            <AvatarImage src={value} />
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {avatarFallback}
            </AvatarFallback>
          </Avatar>
        ) : value ? (
          <div className="relative w-20 h-20 rounded-lg overflow-hidden border bg-muted">
            <img src={value} alt="Selected" className="w-full h-full object-cover" />
          </div>
        ) : (
          <div className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center bg-muted/50">
            <ImageIcon className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <ImageIcon className="h-4 w-4 mr-2" />
                {value ? "Change" : "Select"} Image
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh]">
              <DialogHeader>
                <DialogTitle>Select Image</DialogTitle>
                <DialogDescription>
                  Choose an image from your library or upload a new one
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                {/* Filters */}
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search images..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={selectedFolder} onValueChange={setSelectedFolder}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {folders.map(f => (
                        <SelectItem key={f.value} value={f.value}>
                          {f.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={handleUpload}
                      className="hidden"
                      id="image-picker-upload"
                    />
                    <Button asChild variant="outline" disabled={isUploading}>
                      <label htmlFor="image-picker-upload" className="cursor-pointer">
                        {isUploading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Upload className="h-4 w-4" />
                        )}
                      </label>
                    </Button>
                  </div>
                </div>

                {/* Image Grid */}
                <div className="max-h-[400px] overflow-y-auto">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : filteredImages.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No images found</p>
                      <p className="text-sm">Upload an image to get started</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 gap-3">
                      {filteredImages.map(image => (
                        <button
                          key={image.id}
                          onClick={() => handleSelect(image.url)}
                          className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all hover:border-primary ${
                            value === image.url ? "border-primary ring-2 ring-primary/20" : "border-transparent"
                          }`}
                        >
                          <img
                            src={image.url}
                            alt={image.name}
                            className="w-full h-full object-cover"
                          />
                          {value === image.url && (
                            <div className="absolute inset-0 bg-primary/20 flex items-center justify-center">
                              <Check className="h-8 w-8 text-primary" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {value && (
            <Button variant="ghost" size="sm" onClick={handleClear} className="text-muted-foreground">
              <X className="h-4 w-4 mr-1" />
              Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
