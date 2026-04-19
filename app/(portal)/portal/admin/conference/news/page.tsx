"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, Newspaper, Star } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import type { ConferenceNewsDoc } from "@/lib/schema";

type NewsCategory = "announcement" | "update" | "speaker-spotlight" | "sponsor-news" | "logistics" | "general";

type FormData = {
  conferenceId: string;
  title: string;
  content: string;
  excerpt: string;
  imageUrl: string;
  category: NewsCategory;
  authorName: string;
  isPublished: boolean;
  isFeatured: boolean;
  tags: string;
  slug: string;
};

const defaultForm: FormData = {
  conferenceId: "",
  title: "",
  content: "",
  excerpt: "",
  imageUrl: "",
  category: "announcement",
  authorName: "",
  isPublished: false,
  isFeatured: false,
  tags: "",
  slug: "",
};

const catColors: Record<NewsCategory, string> = {
  announcement: "bg-blue-100 text-blue-800",
  update: "bg-green-100 text-green-800",
  "speaker-spotlight": "bg-purple-100 text-purple-800",
  "sponsor-news": "bg-yellow-100 text-yellow-800",
  logistics: "bg-orange-100 text-orange-800",
  general: "bg-gray-100 text-gray-800",
};

export default function NewsPage() {
  const [items, setItems] = useState<ConferenceNewsDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editItem, setEditItem] = useState<ConferenceNewsDoc | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(defaultForm);

  async function fetchItems() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/news");
      const json = await res.json();
      setItems(json.data ?? []);
    } catch {
      toast.error("Failed to load news");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { fetchItems(); }, []);

  function openCreate() {
    setEditItem(null);
    setForm(defaultForm);
    setDialogOpen(true);
  }

  function openEdit(item: ConferenceNewsDoc) {
    setEditItem(item);
    setForm({
      conferenceId: item.conferenceId,
      title: item.title,
      content: item.content,
      excerpt: item.excerpt ?? "",
      imageUrl: item.imageUrl ?? "",
      category: item.category,
      authorName: item.authorName,
      isPublished: item.isPublished,
      isFeatured: item.isFeatured,
      tags: (item.tags ?? []).join(", "),
      slug: item.slug ?? "",
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.title || !form.content || !form.authorName) {
      toast.error("Title, content, and author name are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(",").map((s) => s.trim()).filter(Boolean) : [],
      };
      if (editItem) {
        await fetch(`/api/conference/news/${editItem.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Article updated");
      } else {
        await fetch("/api/conference/news", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        toast.success("Article created");
      }
      setDialogOpen(false);
      fetchItems();
    } catch {
      toast.error("Failed to save");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    try {
      await fetch(`/api/conference/news/${deleteId}`, { method: "DELETE" });
      toast.success("Article deleted");
      setDeleteId(null);
      fetchItems();
    } catch {
      toast.error("Failed to delete");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/portal/admin/conference">
          <Button variant="ghost" size="icon"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">Event News</h1>
          <p className="text-muted-foreground text-sm">Publish announcements and updates</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Article</Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <Newspaper className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-muted-foreground">No articles yet.</p>
            <Button className="mt-4" onClick={openCreate}><Plus className="h-4 w-4 mr-2" />New Article</Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {items.map((item) => (
            <Card key={item.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <CardTitle className="text-base">{item.title}</CardTitle>
                      {item.isFeatured && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500" />}
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${catColors[item.category]}`}>{item.category.replace(/-/g, " ")}</span>
                      {item.isPublished
                        ? <Badge className="bg-green-100 text-green-800 text-xs border-0">Published</Badge>
                        : <Badge variant="outline" className="text-xs">Draft</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">By {item.authorName}</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="outline" size="icon" onClick={() => openEdit(item)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" className="text-destructive hover:text-destructive" onClick={() => setDeleteId(item.id)}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              </CardHeader>
              {item.excerpt && (
                <CardContent className="pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-2">{item.excerpt}</p>
                </CardContent>
              )}
            </Card>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editItem ? "Edit Article" : "New Article"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Conference ID</Label>
              <Input value={form.conferenceId} onChange={(e) => setForm({ ...form, conferenceId: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-2">
                <Label>Title *</Label>
                <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as NewsCategory })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="announcement">Announcement</SelectItem>
                    <SelectItem value="update">Update</SelectItem>
                    <SelectItem value="speaker-spotlight">Speaker Spotlight</SelectItem>
                    <SelectItem value="sponsor-news">Sponsor News</SelectItem>
                    <SelectItem value="logistics">Logistics</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Author Name *</Label>
                <Input value={form.authorName} onChange={(e) => setForm({ ...form, authorName: e.target.value })} />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Excerpt</Label>
                <Input value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary shown in listings" />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Content *</Label>
              <Textarea rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} placeholder="Full article content..." />
            </div>
            <div className="space-y-2">
              <Label>Image URL</Label>
              <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://..." />
            </div>
            <div className="space-y-2">
              <Label>Tags (comma-separated)</Label>
              <Input value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Slug (URL-friendly identifier)</Label>
              <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="my-article-title" />
            </div>
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Switch checked={form.isPublished} onCheckedChange={(v) => setForm({ ...form, isPublished: v })} />
                <Label>Published</Label>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={form.isFeatured} onCheckedChange={(v) => setForm({ ...form, isFeatured: v })} />
                <Label>Featured</Label>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editItem ? "Save Changes" : "Publish Article"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => { if (!o) setDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Article?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
