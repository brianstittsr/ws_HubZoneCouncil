"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  GraduationCap,
  Plus,
  Pencil,
  Trash2,
  Eye,
  EyeOff,
  Save,
  Loader2,
  BookOpen,
  Video,
  FileText,
  Users,
  Clock,
  Award,
  BarChart3,
  Settings,
  Play,
  CheckCircle2,
} from "lucide-react";
import { useUserProfile } from "@/contexts/user-profile-context";
import { db } from "@/lib/firebase";
import { collection, getDocs, doc, setDoc, deleteDoc, Timestamp, query, orderBy } from "firebase/firestore";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  level: "beginner" | "intermediate" | "advanced";
  duration: number; // in minutes
  lessons: Lesson[];
  isPublished: boolean;
  enrollmentCount: number;
  completionRate: number;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

interface Lesson {
  id: string;
  title: string;
  type: "video" | "article" | "quiz";
  content: string;
  duration: number;
  order: number;
}

const categories = [
  "Business Development",
  "Sales & Marketing",
  "Operations",
  "Technology",
  "Leadership",
  "Compliance",
  "Industry Specific",
];

export default function AcademyAdminPage() {
  const { profile } = useUserProfile();
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("courses");

  const isAdmin = profile.role === "admin" || profile.role === "superadmin";

  // Stats
  const totalEnrollments = courses.reduce((sum, c) => sum + c.enrollmentCount, 0);
  const avgCompletionRate = courses.length > 0 
    ? courses.reduce((sum, c) => sum + c.completionRate, 0) / courses.length 
    : 0;

  useEffect(() => {
    const fetchCourses = async () => {
      if (!db) return;
      setIsLoading(true);
      try {
        const coursesRef = collection(db, "academy_courses");
        const q = query(coursesRef, orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const coursesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Course[];
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
        toast.error("Failed to load courses");
      } finally {
        setIsLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleCreateCourse = async () => {
    if (!db) return;
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      title: "New Course",
      description: "",
      category: "Business Development",
      level: "beginner",
      duration: 0,
      lessons: [],
      isPublished: false,
      enrollmentCount: 0,
      completionRate: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    };
    try {
      await setDoc(doc(db, "academy_courses", newCourse.id), newCourse);
      setCourses(prev => [newCourse, ...prev]);
      setSelectedCourse(newCourse);
      setDialogOpen(true);
      toast.success("Course created");
    } catch (error) {
      console.error("Error creating course:", error);
      toast.error("Failed to create course");
    }
  };

  const handleSaveCourse = async () => {
    if (!selectedCourse || !db) return;
    setIsSaving(true);
    try {
      await setDoc(doc(db, "academy_courses", selectedCourse.id), {
        ...selectedCourse,
        updatedAt: Timestamp.now(),
      });
      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? selectedCourse : c));
      toast.success("Course saved");
      setDialogOpen(false);
    } catch (error) {
      console.error("Error saving course:", error);
      toast.error("Failed to save course");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!db || !confirm("Are you sure you want to delete this course?")) return;
    try {
      await deleteDoc(doc(db, "academy_courses", courseId));
      setCourses(prev => prev.filter(c => c.id !== courseId));
      toast.success("Course deleted");
    } catch (error) {
      console.error("Error deleting course:", error);
      toast.error("Failed to delete course");
    }
  };

  const addLesson = () => {
    if (!selectedCourse) return;
    const newLesson: Lesson = {
      id: `lesson-${Date.now()}`,
      title: "New Lesson",
      type: "video",
      content: "",
      duration: 0,
      order: selectedCourse.lessons.length,
    };
    setSelectedCourse({
      ...selectedCourse,
      lessons: [...selectedCourse.lessons, newLesson],
    });
  };

  if (!isAdmin) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-16 text-center">
            <GraduationCap className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You need admin privileges to access Academy Admin.
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
            <GraduationCap className="h-8 w-8" />
            Academy Admin
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage courses, lessons, and learning content
          </p>
        </div>
        <Button onClick={handleCreateCourse}>
          <Plus className="h-4 w-4 mr-2" />
          New Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{courses.length}</p>
                <p className="text-sm text-muted-foreground">Total Courses</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{totalEnrollments}</p>
                <p className="text-sm text-muted-foreground">Total Enrollments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{avgCompletionRate.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Avg Completion</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <Award className="h-8 w-8 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{courses.filter(c => c.isPublished).length}</p>
                <p className="text-sm text-muted-foreground">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>Courses</CardTitle>
          <CardDescription>Manage your learning content</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No courses yet</p>
              <Button onClick={handleCreateCourse}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Course
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Level</TableHead>
                  <TableHead>Lessons</TableHead>
                  <TableHead>Enrollments</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses.map(course => (
                  <TableRow key={course.id}>
                    <TableCell className="font-medium">{course.title}</TableCell>
                    <TableCell>{course.category}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {course.level}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.lessons.length}</TableCell>
                    <TableCell>{course.enrollmentCount}</TableCell>
                    <TableCell>
                      {course.isPublished ? (
                        <Badge variant="default">Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setSelectedCourse(course);
                            setDialogOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteCourse(course.id)}
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

      {/* Course Editor Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {selectedCourse?.id.startsWith("course-") ? "Edit Course" : "New Course"}
            </DialogTitle>
          </DialogHeader>
          {selectedCourse && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Title</Label>
                  <Input
                    value={selectedCourse.title}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, title: e.target.value })}
                  />
                </div>
                <div className="col-span-2">
                  <Label>Description</Label>
                  <Textarea
                    value={selectedCourse.description}
                    onChange={(e) => setSelectedCourse({ ...selectedCourse, description: e.target.value })}
                    rows={3}
                  />
                </div>
                <div>
                  <Label>Category</Label>
                  <Select
                    value={selectedCourse.category}
                    onValueChange={(value) => setSelectedCourse({ ...selectedCourse, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Level</Label>
                  <Select
                    value={selectedCourse.level}
                    onValueChange={(value: "beginner" | "intermediate" | "advanced") => 
                      setSelectedCourse({ ...selectedCourse, level: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <Switch
                    checked={selectedCourse.isPublished}
                    onCheckedChange={(checked) => 
                      setSelectedCourse({ ...selectedCourse, isPublished: checked })
                    }
                  />
                  <Label>Published</Label>
                </div>
              </div>

              {/* Lessons */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label className="text-lg">Lessons</Label>
                  <Button size="sm" onClick={addLesson}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Lesson
                  </Button>
                </div>
                {selectedCourse.lessons.length === 0 ? (
                  <div className="border-2 border-dashed rounded-lg p-8 text-center">
                    <Video className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                    <p className="text-muted-foreground">No lessons yet</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedCourse.lessons.map((lesson, index) => (
                      <div key={lesson.id} className="border rounded-lg p-4">
                        <div className="flex items-center gap-4">
                          <span className="text-muted-foreground">{index + 1}.</span>
                          <Input
                            value={lesson.title}
                            onChange={(e) => {
                              const lessons = [...selectedCourse.lessons];
                              lessons[index] = { ...lesson, title: e.target.value };
                              setSelectedCourse({ ...selectedCourse, lessons });
                            }}
                            className="flex-1"
                          />
                          <Select
                            value={lesson.type}
                            onValueChange={(value: "video" | "article" | "quiz") => {
                              const lessons = [...selectedCourse.lessons];
                              lessons[index] = { ...lesson, type: value };
                              setSelectedCourse({ ...selectedCourse, lessons });
                            }}
                          >
                            <SelectTrigger className="w-32">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="video">Video</SelectItem>
                              <SelectItem value="article">Article</SelectItem>
                              <SelectItem value="quiz">Quiz</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              const lessons = selectedCourse.lessons.filter((_, i) => i !== index);
                              setSelectedCourse({ ...selectedCourse, lessons });
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveCourse} disabled={isSaving}>
              {isSaving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Course
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
