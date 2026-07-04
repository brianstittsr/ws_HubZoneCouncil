"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Loader2, CheckCircle, XCircle, Clock, ArrowLeft, Mic2 } from "lucide-react";
import Link from "next/link";
import type { ConferenceSpeakerApplicationDoc } from "@/lib/schema";

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
  waitlisted: "bg-blue-100 text-blue-800",
};

export default function SpeakerApplicationsPage() {
  const [applications, setApplications] = useState<ConferenceSpeakerApplicationDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<ConferenceSpeakerApplicationDoc | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [updating, setUpdating] = useState(false);

  async function fetchApplications() {
    setLoading(true);
    try {
      const res = await fetch("/api/conference/speaker-applications");
      const json = await res.json();
      setApplications(json.data ?? []);
    } catch {
      toast.error("Failed to load speaker applications");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchApplications();
  }, []);

  async function updateStatus(status: ConferenceSpeakerApplicationDoc["status"]) {
    if (!selected) return;
    setUpdating(true);
    try {
      const res = await fetch(`/api/conference/speaker-applications/${selected.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, adminNotes }),
      });
      if (!res.ok) throw new Error("Update failed");
      toast.success(`Application ${status}`);
      setSelected(null);
      fetchApplications();
    } catch {
      toast.error("Failed to update application");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="container py-8">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/admin/conference">
            <ArrowLeft className="h-4 w-4 mr-1" /> Back
          </Link>
        </Button>
        <h1 className="text-2xl font-bold">Speaker Applications</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mic2 className="h-5 w-5" />
            Pending Speaker Applications
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : applications.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No speaker applications yet.</p>
          ) : (
            <div className="divide-y">
              {applications.map((app) => (
                <div key={app.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {app.firstName} {app.lastName}
                      </h3>
                      <Badge className={statusStyles[app.status]}>{app.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {app.title} at {app.organization}
                    </p>
                    <p className="text-sm text-muted-foreground">{app.email}</p>
                    <p className="text-sm mt-1">
                      <span className="font-medium">Session:</span> {app.proposedSessionTitle}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium">Track:</span> {app.preferredTrack || "Not specified"}
                    </p>
                  </div>
                  <Button size="sm" onClick={() => { setSelected(app); setAdminNotes(app.adminNotes || ""); }}>
                    Review
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={() => setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Review Application</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground">Name</p>
                  <p className="font-medium">{selected.firstName} {selected.lastName}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Email</p>
                  <p className="font-medium">{selected.email}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Title</p>
                  <p className="font-medium">{selected.title}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Organization</p>
                  <p className="font-medium">{selected.organization}</p>
                </div>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Bio</p>
                <p className="text-sm">{selected.bio}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Session Title</p>
                <p className="font-medium">{selected.proposedSessionTitle}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Description</p>
                <p className="text-sm">{selected.proposedSessionDescription}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Admin Notes</p>
                <Textarea
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="Add private notes here..."
                  rows={3}
                />
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" onClick={() => setSelected(null)}>Cancel</Button>
                <Button
                  variant="destructive"
                  onClick={() => updateStatus("rejected")}
                  disabled={updating}
                >
                  <XCircle className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => updateStatus("waitlisted")}
                  disabled={updating}
                >
                  <Clock className="h-4 w-4 mr-1" /> Waitlist
                </Button>
                <Button
                  className="bg-green-600 hover:bg-green-700 text-white"
                  onClick={() => updateStatus("approved")}
                  disabled={updating}
                >
                  <CheckCircle className="h-4 w-4 mr-1" /> Approve
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
