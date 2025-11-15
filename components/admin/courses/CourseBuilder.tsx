'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Plus,
  Search,
  GraduationCap,
  BookOpen,
  Clock,
  Users,
  Target,
  Edit2,
  Trash2,
  Copy,
  Sparkles,
  ArrowUp,
  ArrowDown,
  PlayCircle,
  FileText,
  CheckCircle,
  Award,
  BarChart3
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Progress } from '@/components/ui/progress';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface Course {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  ai_generated: boolean;
  target_role: string | null;
  estimated_hours: number | null;
  topics_sequence: string[] | null;
  metadata: any;
  status: 'draft' | 'active' | 'completed' | 'archived';
  created_at: string;
  updated_at: string;
  user?: {
    id: string;
    email: string;
    first_name: string | null;
    last_name: string | null;
  };
}

interface Topic {
  id: string;
  title: string;
  description: string | null;
  duration_minutes: number | null;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | null;
  products: {
    name: string;
    code: string;
  } | null;
}

interface CourseBuilderProps {
  initialCourses: Course[];
  availableTopics: Topic[];
}

export default function CourseBuilder({ initialCourses, availableTopics }: CourseBuilderProps) {
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deleteCourseId, setDeleteCourseId] = useState<string | null>(null);
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [aiPrompt, setAIPrompt] = useState('');
  const [generating, setGenerating] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Filter courses
  const filteredCourses = useMemo(() => {
    return courses.filter(course => {
      const matchesSearch = 
        course.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.target_role?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'all' || course.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [courses, searchTerm, statusFilter]);

  // Get statistics
  const stats = useMemo(() => {
    const active = courses.filter(c => c.status === 'active').length;
    const aiGenerated = courses.filter(c => c.ai_generated).length;
    const totalEstimatedHours = courses.reduce((sum, c) => sum + (c.estimated_hours || 0), 0);

    return {
      total: courses.length,
      active,
      aiGenerated,
      totalEstimatedHours
    };
  }, [courses]);

  // Handle course deletion
  const handleDelete = async (courseId: string) => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('learning_paths')
        .delete()
        .eq('id', courseId);

      if (error) throw error;

      setCourses(courses.filter(c => c.id !== courseId));
      toast.success('Course deleted successfully');
    } catch (error) {
            toast.error('Failed to delete course');
    } finally {
      setLoading(false);
      setDeleteCourseId(null);
    }
  };

  // Duplicate course
  const duplicateCourse = async (course: Course) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .insert({
          user_id: course.user_id,
          name: `${course.name} (Copy)`,
          description: course.description,
          ai_generated: false,
          target_role: course.target_role,
          estimated_hours: course.estimated_hours,
          topics_sequence: course.topics_sequence,
          metadata: course.metadata,
          status: 'draft'
        })
        .select()
        .single();

      if (error) throw error;

      setCourses([data, ...courses]);
      toast.success('Course duplicated successfully');
    } catch (error) {
            toast.error('Failed to duplicate course');
    } finally {
      setLoading(false);
    }
  };

  // Generate course with AI
  const handleAIGenerate = async () => {
    if (!aiPrompt.trim()) {
      toast.error('Please describe the course you want to create');
      return;
    }

    setGenerating(true);
    try {
      // In production, call OpenAI API to generate course structure
      toast.info('AI course generation will be implemented with OpenAI integration');
      
      // Mock AI generation
      setTimeout(() => {
        toast.success('AI course generation coming soon!');
        setShowAIDialog(false);
        setAIPrompt('');
        setGenerating(false);
      }, 2000);
    } catch (error) {
            toast.error('Failed to generate course');
      setGenerating(false);
    }
  };

  // Toggle course status
  const toggleCourseStatus = async (course: Course) => {
    setLoading(true);
    try {
      const newStatus = course.status === 'active' ? 'draft' : 'active';
      const { error } = await supabase
        .from('learning_paths')
        .update({ status: newStatus })
        .eq('id', course.id);

      if (error) throw error;

      setCourses(courses.map(c => 
        c.id === course.id ? { ...c, status: newStatus } : c
      ));
      
      toast.success(`Course ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } catch (error) {
            toast.error('Failed to update course status');
    } finally {
      setLoading(false);
    }
  };

  // Get status color
  const getStatusColor = (status: Course['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'draft':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      case 'completed':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'archived':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Get topic count for a course
  const getTopicCount = (course: Course) => {
    return course.topics_sequence?.length || 0;
  };

  return (
    <>
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">
              {stats.active} active
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEstimatedHours}</div>
            <p className="text-xs text-muted-foreground">learning content</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">AI Generated</CardTitle>
            <Sparkles className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.aiGenerated}</div>
            <p className="text-xs text-muted-foreground">courses</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Topics</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {courses.length > 0 
                ? Math.round(courses.reduce((sum, c) => sum + getTopicCount(c), 0) / courses.length)
                : 0
              }
            </div>
            <p className="text-xs text-muted-foreground">per course</p>
          </CardContent>
        </Card>
      </div>

      {/* Actions Bar */}
      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search courses..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setShowAIDialog(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
              <Button asChild>
                <Link href="/admin/courses/new">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Course
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses List */}
      <div className="space-y-4">
        {filteredCourses.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <GraduationCap className="w-12 h-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No courses found</h3>
              <p className="text-gray-500 mb-4">
                Create your first learning path or let AI generate one for you
              </p>
              <div className="flex gap-2">
                <Button onClick={() => setShowAIDialog(true)}>
                  <Sparkles className="w-4 h-4 mr-2" />
                  AI Generate
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/admin/courses/new">
                    Create Manually
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filteredCourses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Header */}
                    <div className="flex items-start gap-3 mb-3">
                      <div className="h-12 w-12 rounded-lg bg-gradient-to-r from-purple-500 to-indigo-500 text-white flex items-center justify-center flex-shrink-0">
                        <GraduationCap className="w-6 h-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-bold text-gray-900 truncate">
                            {course.name}
                          </h3>
                          <Badge variant="secondary" className={getStatusColor(course.status)}>
                            {course.status}
                          </Badge>
                          {course.ai_generated && (
                            <Badge variant="outline" className="border-purple-300 text-purple-700">
                              <Sparkles className="w-3 h-3 mr-1" />
                              AI
                            </Badge>
                          )}
                        </div>
                        {course.description && (
                          <p className="text-gray-600 text-sm line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Meta Information */}
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                      {course.target_role && (
                        <div className="flex items-center gap-1">
                          <Target className="w-4 h-4" />
                          {course.target_role}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <BookOpen className="w-4 h-4" />
                        {getTopicCount(course)} topics
                      </div>
                      {course.estimated_hours && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.estimated_hours} hours
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        Created {format(new Date(course.created_at), 'MMM d, yyyy')}
                      </div>
                    </div>

                    {/* Progress Bar (if topics assigned) */}
                    {getTopicCount(course) > 0 && (
                      <div className="mb-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Course Progress</span>
                          <span className="font-medium">{getTopicCount(course)} modules</span>
                        </div>
                        <Progress value={(getTopicCount(course) / 10) * 100} className="h-2" />
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 ml-4">
                    <Button variant="outline" size="sm" asChild>
                      <Link href={`/admin/courses/${course.id}/edit`}>
                        <Edit2 className="w-4 h-4 mr-1" />
                        Edit
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => duplicateCourse(course)}
                      disabled={loading}
                    >
                      <Copy className="w-4 h-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      variant={course.status === 'active' ? 'outline' : 'default'}
                      size="sm"
                      onClick={() => toggleCourseStatus(course)}
                      disabled={loading}
                    >
                      {course.status === 'active' ? 'Deactivate' : 'Activate'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => setDeleteCourseId(course.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* AI Generation Dialog */}
      <Dialog open={showAIDialog} onOpenChange={setShowAIDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Course Generator</DialogTitle>
            <DialogDescription>
              Describe what kind of course you want to create and AI will generate the curriculum
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <textarea
                value={aiPrompt}
                onChange={(e) => setAIPrompt(e.target.value)}
                placeholder="Example: Create a beginner-friendly course for Guidewire ClaimCenter covering basics, configuration, and simple GOSU scripting. Target audience is new developers with 0-1 years experience."
                className="w-full h-32 p-3 border rounded-lg resize-none"
              />
            </div>

            <div className="grid gap-3">
              <p className="text-sm font-medium">Quick Templates:</p>
              <div className="grid gap-2 sm:grid-cols-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => setAIPrompt('Create a beginner course for Guidewire ClaimCenter covering FNOL, claims processing, and basic configuration')}
                >
                  ClaimCenter Basics
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => setAIPrompt('Create an advanced course for Guidewire PolicyCenter focusing on rating, underwriting rules, and complex integrations')}
                >
                  PolicyCenter Advanced
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => setAIPrompt('Create a comprehensive GOSU programming course from basics to advanced patterns')}
                >
                  GOSU Programming
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="justify-start"
                  onClick={() => setAIPrompt('Create a course for Guidewire Integration Hub covering REST APIs, message queues, and data transformation')}
                >
                  Integration Hub
                </Button>
              </div>
            </div>

            <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
              <div className="flex gap-2">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-purple-900">
                  <p className="font-medium mb-1">AI will create:</p>
                  <ul className="list-disc list-inside space-y-1 text-purple-700">
                    <li>Course title and description</li>
                    <li>Recommended learning path</li>
                    <li>Topic sequence and prerequisites</li>
                    <li>Estimated duration</li>
                    <li>Difficulty levels for each module</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAIDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAIGenerate} disabled={generating}>
              {generating ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Course
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteCourseId} onOpenChange={() => setDeleteCourseId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Course</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this course? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={() => deleteCourseId && handleDelete(deleteCourseId)}
              disabled={loading}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}


