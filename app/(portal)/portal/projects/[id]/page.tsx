"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  CheckCircle,
  Clock,
  Edit,
  FileText,
  Loader2,
  MessageSquare,
  Milestone,
  MoreVertical,
  Plus,
  Save,
  Target,
  Trash2,
  Users,
  AlertTriangle,
  Building,
  Mail,
  Phone,
} from "lucide-react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, collection, query, where, getDocs, addDoc, deleteDoc, Timestamp } from "firebase/firestore";
import { COLLECTIONS, type ProjectDoc, type TeamMemberDoc } from "@/lib/schema";
import { toast } from "sonner";

interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: Date | null;
  status: "pending" | "in-progress" | "completed";
  order: number;
}

interface ProjectNote {
  id: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: Date;
}

function getStatusBadge(status: string) {
  switch (status) {
    case "active":
      return <Badge className="bg-green-100 text-green-800">Active</Badge>;
    case "at-risk":
      return <Badge className="bg-orange-100 text-orange-800">At Risk</Badge>;
    case "completed":
      return <Badge className="bg-blue-100 text-blue-800">Completed</Badge>;
    case "on-hold":
      return <Badge className="bg-gray-100 text-gray-800">On Hold</Badge>;
    case "planning":
      return <Badge className="bg-purple-100 text-purple-800">Planning</Badge>;
    default:
      return <Badge variant="secondary">{status}</Badge>;
  }
}

function formatDate(date: Date | Timestamp | null | undefined): string {
  if (!date) return "Not set";
  const d = date instanceof Timestamp ? date.toDate() : date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function ProjectDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ProjectDoc | null>(null);
  const [teamMembers, setTeamMembers] = useState<TeamMemberDoc[]>([]);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProject, setEditedProject] = useState<Partial<ProjectDoc>>({});
  const [newNote, setNewNote] = useState("");
  const [milestoneDialogOpen, setMilestoneDialogOpen] = useState(false);
  const [newMilestone, setNewMilestone] = useState({ title: "", description: "", dueDate: "" });

  useEffect(() => {
    async function fetchProjectData() {
      if (!db || !projectId) return;

      setIsLoading(true);
      try {
        // Fetch project
        const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
        const projectSnap = await getDoc(projectRef);

        if (!projectSnap.exists()) {
          toast.error("Project not found");
          router.push("/portal/projects");
          return;
        }

        const projectData = { id: projectSnap.id, ...projectSnap.data() } as ProjectDoc;
        setProject(projectData);
        setEditedProject(projectData);

        // Fetch team members assigned to this project
        if (projectData.teamIds && projectData.teamIds.length > 0) {
          const teamMembersRef = collection(db, COLLECTIONS.TEAM_MEMBERS);
          const teamSnapshot = await getDocs(teamMembersRef);
          const assignedMembers = teamSnapshot.docs
            .filter(doc => projectData.teamIds?.includes(doc.id))
            .map(doc => ({ id: doc.id, ...doc.data() } as TeamMemberDoc));
          setTeamMembers(assignedMembers);
        }

        // Fetch milestones
        const milestonesRef = collection(db, COLLECTIONS.PROJECTS, projectId, "milestones");
        const milestonesSnap = await getDocs(milestonesRef);
        const milestonesData = milestonesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate?.toDate() || null,
        })) as Milestone[];
        setMilestones(milestonesData.sort((a, b) => a.order - b.order));

        // Fetch notes
        const notesRef = collection(db, COLLECTIONS.PROJECTS, projectId, "notes");
        const notesSnap = await getDocs(notesRef);
        const notesData = notesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as ProjectNote[];
        setNotes(notesData.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()));

      } catch (error) {
        console.error("Error fetching project:", error);
        toast.error("Failed to load project");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProjectData();
  }, [projectId, router]);

  const handleSaveProject = async () => {
    if (!db || !projectId || !editedProject) return;

    setIsSaving(true);
    try {
      const projectRef = doc(db, COLLECTIONS.PROJECTS, projectId);
      await updateDoc(projectRef, {
        ...editedProject,
        updatedAt: Timestamp.now(),
      });
      setProject({ ...project, ...editedProject } as ProjectDoc);
      setIsEditing(false);
      toast.success("Project updated successfully");
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("Failed to save project");
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!db || !projectId || !newNote.trim()) return;

    try {
      const notesRef = collection(db, COLLECTIONS.PROJECTS, projectId, "notes");
      const noteData = {
        content: newNote,
        authorId: "current-user", // TODO: Get from auth context
        authorName: "Current User", // TODO: Get from auth context
        createdAt: Timestamp.now(),
      };
      const docRef = await addDoc(notesRef, noteData);
      setNotes([{ id: docRef.id, ...noteData, createdAt: new Date() }, ...notes]);
      setNewNote("");
      toast.success("Note added");
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    }
  };

  const handleAddMilestone = async () => {
    if (!db || !projectId || !newMilestone.title.trim()) return;

    try {
      const milestonesRef = collection(db, COLLECTIONS.PROJECTS, projectId, "milestones");
      const milestoneData = {
        title: newMilestone.title,
        description: newMilestone.description,
        dueDate: newMilestone.dueDate ? Timestamp.fromDate(new Date(newMilestone.dueDate)) : null,
        status: "pending" as const,
        order: milestones.length,
      };
      const docRef = await addDoc(milestonesRef, milestoneData);
      setMilestones([...milestones, { 
        id: docRef.id, 
        ...milestoneData, 
        dueDate: newMilestone.dueDate ? new Date(newMilestone.dueDate) : null 
      }]);
      setNewMilestone({ title: "", description: "", dueDate: "" });
      setMilestoneDialogOpen(false);
      toast.success("Milestone added");
    } catch (error) {
      console.error("Error adding milestone:", error);
      toast.error("Failed to add milestone");
    }
  };

  const handleUpdateMilestoneStatus = async (milestoneId: string, newStatus: Milestone["status"]) => {
    if (!db || !projectId) return;

    try {
      const milestoneRef = doc(db, COLLECTIONS.PROJECTS, projectId, "milestones", milestoneId);
      await updateDoc(milestoneRef, { status: newStatus });
      setMilestones(milestones.map(m => 
        m.id === milestoneId ? { ...m, status: newStatus } : m
      ));
      toast.success("Milestone updated");
    } catch (error) {
      console.error("Error updating milestone:", error);
      toast.error("Failed to update milestone");
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Project Not Found</h2>
            <p className="text-muted-foreground mb-4">
              The project you're looking for doesn't exist or has been deleted.
            </p>
            <Button asChild>
              <Link href="/portal/projects">Back to Projects</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedMilestones = milestones.filter(m => m.status === "completed").length;
  const progressPercent = milestones.length > 0 
    ? Math.round((completedMilestones / milestones.length) * 100) 
    : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/portal/projects">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold">{project.name}</h1>
              {getStatusBadge(project.status || "active")}
            </div>
            <p className="text-muted-foreground flex items-center gap-2 mt-1">
              <Building className="h-4 w-4" />
              {project.organizationId || "No client"}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          {isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsEditing(false)}>
                Cancel
              </Button>
              <Button onClick={handleSaveProject} disabled={isSaving}>
                {isSaving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </>
          ) : (
            <Button onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Edit Project
            </Button>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Target className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{progressPercent}%</p>
                <p className="text-sm text-muted-foreground">Progress</p>
              </div>
            </div>
            <Progress value={progressPercent} className="mt-3" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Milestone className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{completedMilestones}/{milestones.length}</p>
                <p className="text-sm text-muted-foreground">Milestones</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{teamMembers.length}</p>
                <p className="text-sm text-muted-foreground">Team Members</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-2xl font-bold">{formatDate(project.endDate)}</p>
                <p className="text-sm text-muted-foreground">Due Date</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="milestones">Milestones</TabsTrigger>
          <TabsTrigger value="team">Team</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Project Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {isEditing ? (
                  <>
                    <div className="space-y-2">
                      <Label>Project Name</Label>
                      <Input
                        value={editedProject.name || ""}
                        onChange={(e) => setEditedProject({ ...editedProject, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization ID</Label>
                      <Input
                        value={editedProject.organizationId || ""}
                        onChange={(e) => setEditedProject({ ...editedProject, organizationId: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Status</Label>
                      <Select
                        value={editedProject.status || "active"}
                        onValueChange={(value: "planning" | "active" | "at-risk" | "on-hold" | "completed") => setEditedProject({ ...editedProject, status: value as any })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="planning">Planning</SelectItem>
                          <SelectItem value="active">Active</SelectItem>
                          <SelectItem value="at-risk">At Risk</SelectItem>
                          <SelectItem value="on-hold">On Hold</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-muted-foreground">Start Date</Label>
                        <p className="mt-1">{formatDate(project.startDate)}</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">End Date</Label>
                        <p className="mt-1">{formatDate(project.endDate)}</p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                {notes.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">No recent activity</p>
                ) : (
                  <div className="space-y-4">
                    {notes.slice(0, 3).map((note) => (
                      <div key={note.id} className="border-l-2 border-primary pl-4">
                        <p className="text-sm">{note.content}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {note.authorName} • {formatDate(note.createdAt)}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Milestones Tab */}
        <TabsContent value="milestones" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Milestones</CardTitle>
              <Button onClick={() => setMilestoneDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Milestone
              </Button>
            </CardHeader>
            <CardContent>
              {milestones.length === 0 ? (
                <div className="text-center py-8">
                  <Milestone className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No milestones yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {milestones.map((milestone) => (
                    <div key={milestone.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-full ${
                          milestone.status === "completed" ? "bg-green-100" :
                          milestone.status === "in-progress" ? "bg-blue-100" : "bg-gray-100"
                        }`}>
                          {milestone.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-gray-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">{milestone.title}</p>
                          {milestone.description && (
                            <p className="text-sm text-muted-foreground">{milestone.description}</p>
                          )}
                          {milestone.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Due: {formatDate(milestone.dueDate)}
                            </p>
                          )}
                        </div>
                      </div>
                      <Select
                        value={milestone.status}
                        onValueChange={(value: Milestone["status"]) => 
                          handleUpdateMilestoneStatus(milestone.id, value)
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in-progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Team Tab */}
        <TabsContent value="team" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>People assigned to this project</CardDescription>
            </CardHeader>
            <CardContent>
              {teamMembers.length === 0 ? (
                <div className="text-center py-8">
                  <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No team members assigned</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {teamMembers.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg">
                      <Avatar>
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>
                          {member.firstName?.[0]}{member.lastName?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <p className="font-medium">{member.firstName} {member.lastName}</p>
                        <p className="text-sm text-muted-foreground">{member.expertise}</p>
                        <div className="flex items-center gap-4 mt-1">
                          {member.emailPrimary && (
                            <a href={`mailto:${member.emailPrimary}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              Email
                            </a>
                          )}
                          {member.mobile && (
                            <a href={`tel:${member.mobile}`} className="text-xs text-primary hover:underline flex items-center gap-1">
                              <Phone className="h-3 w-3" />
                              Call
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notes Tab */}
        <TabsContent value="notes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Notes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Add a note..."
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  rows={2}
                  className="flex-1"
                />
                <Button onClick={handleAddNote} disabled={!newNote.trim()}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {notes.length === 0 ? (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground">No notes yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="p-4 border rounded-lg">
                      <p>{note.content}</p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {note.authorName} • {formatDate(note.createdAt)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Milestone Dialog */}
      <Dialog open={milestoneDialogOpen} onOpenChange={setMilestoneDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
            <DialogDescription>Create a new milestone for this project</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Title</Label>
              <Input
                value={newMilestone.title}
                onChange={(e) => setNewMilestone({ ...newMilestone, title: e.target.value })}
                placeholder="Milestone title"
              />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                value={newMilestone.description}
                onChange={(e) => setNewMilestone({ ...newMilestone, description: e.target.value })}
                placeholder="Optional description"
              />
            </div>
            <div className="space-y-2">
              <Label>Due Date</Label>
              <Input
                type="date"
                value={newMilestone.dueDate}
                onChange={(e) => setNewMilestone({ ...newMilestone, dueDate: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setMilestoneDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddMilestone} disabled={!newMilestone.title.trim()}>
              Add Milestone
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
