"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import {
  ArrowLeft,
  Search,
  Loader2,
  Trash2,
  Eye,
  MapPin,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

interface Submission {
  id: string;
  submitterName: string;
  submitterEmail: string;
  submitterCompany: string;
  propertyName: string;
  city: string;
  state: string;
  propertyType: string;
  squareFootage: number;
  powerAvailableMW: number;
  status: string;
  createdAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  Submitted: "bg-blue-100 text-blue-700",
  "Under Review": "bg-yellow-100 text-yellow-700",
  Accepted: "bg-green-100 text-green-700",
  Declined: "bg-red-100 text-red-700",
  Closed: "bg-gray-100 text-gray-600",
};

const PROPERTY_TYPE_LABELS: Record<string, string> = {
  vacant_land: "Vacant Land",
  warehouse: "Warehouse",
  industrial: "Industrial",
  office: "Office",
  data_center: "Data Center",
  power_plant: "Power Plant",
  other: "Other",
};

export default function LocationSubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<Submission | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/zenthium/location-submissions");
      if (res.ok) {
        const data = await res.json();
        setSubmissions(data.submissions ?? []);
      }
    } catch (err) {
      console.error("Failed to fetch submissions:", err);
      toast.error("Failed to load submissions");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSubmissions(); }, [fetchSubmissions]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/zenthium/location-submissions/${deleteTarget.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Submission deleted");
      setDeleteTarget(null);
      fetchSubmissions();
    } catch {
      toast.error("Failed to delete submission");
    } finally {
      setIsDeleting(false);
    }
  };

  const filtered = submissions.filter((s) => {
    const matchStatus = statusFilter === "all" || s.status === statusFilter;
    const q = search.toLowerCase();
    const matchSearch = !q || [s.submitterName, s.submitterEmail, s.propertyName, s.city, s.state]
      .some((v) => v?.toLowerCase().includes(q));
    return matchStatus && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/portal/admin/zenthium-referrals">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Dashboard
          </Link>
        </Button>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <MapPin className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Public Location Submissions</h1>
            <p className="text-sm text-muted-foreground">
              Properties submitted via the /zenthium public form
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm px-3 py-1">
          {submissions.length} total
        </Badge>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Submissions</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 mt-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by name, email, property..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="Submitted">Submitted</SelectItem>
                <SelectItem value="Under Review">Under Review</SelectItem>
                <SelectItem value="Accepted">Accepted</SelectItem>
                <SelectItem value="Declined">Declined</SelectItem>
                <SelectItem value="Closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center gap-3 py-12 text-center">
              <MapPin className="h-10 w-10 text-muted-foreground" />
              <p className="text-muted-foreground">No submissions found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Property</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>
                    <span className="flex items-center gap-1"><Zap className="h-3.5 w-3.5" />MW</span>
                  </TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Submitted</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell>
                      <div className="font-medium text-sm">{s.submitterName}</div>
                      <div className="text-xs text-muted-foreground">{s.submitterEmail}</div>
                      {s.submitterCompany && (
                        <div className="text-xs text-muted-foreground">{s.submitterCompany}</div>
                      )}
                    </TableCell>
                    <TableCell className="font-medium text-sm max-w-[160px] truncate">
                      {s.propertyName}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {s.city}, {s.state}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {PROPERTY_TYPE_LABELS[s.propertyType] ?? s.propertyType}
                    </TableCell>
                    <TableCell className="text-sm font-medium">
                      {s.powerAvailableMW ?? "—"}
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STATUS_COLORS[s.status] ?? "bg-muted text-muted-foreground"}`}>
                        {s.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button size="sm" variant="ghost" asChild>
                          <Link href={`/portal/admin/zenthium-referrals/submissions/${s.id}`}>
                            <Eye className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => setDeleteTarget(s)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Submission</AlertDialogTitle>
            <AlertDialogDescription>
              Permanently delete the submission from{" "}
              <span className="font-semibold">{deleteTarget?.submitterName}</span> for{" "}
              <span className="font-semibold">{deleteTarget?.propertyName}</span>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</> : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
