'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft,
  Save,
  GraduationCap,
  Plus,
  X,
  GripVertical,
  BookOpen,
  Clock,
  Target,
  Sparkles,
  ChevronDown,
  ChevronRight,
  PlayCircle,
  FileText,
  CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

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

interface Module {
  id: string;
  name: string;
  description: string;
  topics: string[]; // topic IDs
  order: number;
}

interface Course {
  id?: string;
  name: string;
  description: string;
  target_role: string;
  estimated_hours: number;
  status: 'draft' | 'active' | 'completed' | 'archived';
  ai_generated: boolean;
  modules: Module[];
  topics_sequence: string[];
}

interface CourseEditorProps {
  courseId?: string;
  availableTopics: Topic[];
}

export default function CourseEditor({ courseId, availableTopics }: CourseEditorProps) {
  const [course, setCourse] = useState<Course>({
    name: '',
    description: '',
    target_role: '',
    estimated_hours: 0,
    status: 'draft',
    ai_generated: false,
    modules: [],
    topics_sequence: []
  });

  const [showTopicSelector, setShowTopicSelector] = useState(false);
  const [selectedModuleId, setSelectedModuleId] = useState<string | null>(null);
  const [topicSearch, setTopicSearch] = useState('');
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const router = useRouter();
  const supabase = useMemo(() => createClient(), []);

  // Load existing course if editing
  useEffect(() => {
    if (courseId) {
      loadCourse();
    }
  }, [courseId]);

  const loadCourse = async () => {
    if (!courseId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('learning_paths')
        .select('*')
        .eq('id', courseId)
        .single();

      if (error) throw error;

      // Convert flat topics_sequence to modules structure
      const modules: Module[] = data.metadata?.modules || [{
        id: 'default',
        name: 'Main Module',
        description: '',
        topics: data.topics_sequence || [],
        order: 0
      }];

      setCourse({
        ...data,
        modules,
        topics_sequence: data.topics_sequence || []
      });
    } catch (error) {
            toast.error('Failed to load course');
      router.push('/admin/courses');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total duration
  const totalDuration = useMemo(() => {
    const topicIds = course.modules.flatMap(m => m.topics);
    return topicIds.reduce((sum, topicId) => {
      const topic = availableTopics.find(t => t.id === topicId);
      return sum + (topic?.duration_minutes || 0);
    }, 0);
  }, [course.modules, availableTopics]);

  // Auto-calculate estimated hours
  useEffect(() => {
    const hours = Math.ceil(totalDuration / 60);
    setCourse(prev => ({ ...prev, estimated_hours: hours }));
  }, [totalDuration]);

  // Add new module
  const addModule = () => {
    const newModule: Module = {
      id: Date.now().toString(),
      name: `Module ${course.modules.length + 1}`,
      description: '',
      topics: [],
      order: course.modules.length
    };
    setCourse(prev => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
  };

  // Delete module
  const deleteModule = (moduleId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.filter(m => m.id !== moduleId)
    }));
  };

  // Update module
  const updateModule = (moduleId: string, updates: Partial<Module>) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId ? { ...m, ...updates } : m
      )
    }));
  };

  // Add topic to module
  const addTopicToModule = (moduleId: string, topicId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { ...m, topics: [...m.topics, topicId] }
          : m
      )
    }));
    
    // Update flat topics_sequence
    const allTopics = course.modules.flatMap(m => 
      m.id === moduleId ? [...m.topics, topicId] : m.topics
    );
    setCourse(prev => ({ ...prev, topics_sequence: allTopics }));
  };

  // Remove topic from module
  const removeTopicFromModule = (moduleId: string, topicId: string) => {
    setCourse(prev => ({
      ...prev,
      modules: prev.modules.map(m => 
        m.id === moduleId 
          ? { ...m, topics: m.topics.filter(id => id !== topicId) }
          : m
      )
    }));
  };

  // Move module up/down
  const moveModule = (moduleId: string, direction: 'up' | 'down') => {
    const index = course.modules.findIndex(m => m.id === moduleId);
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === course.modules.length - 1)
    ) {
      return;
    }

    const newModules = [...course.modules];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    [newModules[index], newModules[targetIndex]] = [newModules[targetIndex], newModules[index]];
    
    // Update order
    newModules.forEach((module, idx) => {
      module.order = idx;
    });

    setCourse(prev => ({ ...prev, modules: newModules }));
  };

  // Filter available topics
  const filteredTopics = useMemo(() => {
    return availableTopics.filter(topic => {
      const matchesSearch = topic.title.toLowerCase().includes(topicSearch.toLowerCase());
      const notAlreadyAdded = !course.modules
        .flatMap(m => m.topics)
        .includes(topic.id);
      return matchesSearch && notAlreadyAdded;
    });
  }, [availableTopics, topicSearch, course.modules]);

  // Get topic by ID
  const getTopicById = (topicId: string) => {
    return availableTopics.find(t => t.id === topicId);
  };

  // Toggle module expansion
  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  // Handle save
  const handleSave = async () => {
    if (!course.name || !course.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setSaving(true);
    try {
      // Flatten topics_sequence from modules
      const topicsSequence = course.modules.flatMap(m => m.topics);

      const saveData: any = {
        name: course.name,
        description: course.description,
        target_role: course.target_role || null,
        estimated_hours: course.estimated_hours,
        status: course.status,
        ai_generated: course.ai_generated,
        topics_sequence: topicsSequence,
        metadata: {
          modules: course.modules
        }
      };

      if (courseId) {
        // Update existing course
        const { error } = await supabase
          .from('learning_paths')
          .update(saveData)
          .eq('id', courseId);

        if (error) throw error;
        toast.success('Course updated successfully');
      } else {
        // Create new course
        const { data, error } = await supabase
          .from('learning_paths')
          .insert(saveData)
          .select()
          .single();

        if (error) throw error;
        toast.success('Course created successfully');
        router.push(`/admin/courses/${data.id}/edit`);
      }
    } catch (error) {
            toast.error('Failed to save course');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/admin/courses">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Courses
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">
            {courseId ? 'Edit Course' : 'Create New Course'}
          </h1>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Saving...' : 'Save Course'}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content - 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Course Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Course Name *</Label>
                <Input
                  id="name"
                  value={course.name}
                  onChange={(e) => setCourse({ ...course, name: e.target.value })}
                  placeholder="e.g., ClaimCenter Fundamentals"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={course.description}
                  onChange={(e) => setCourse({ ...course, description: e.target.value })}
                  placeholder="Describe what students will learn..."
                  rows={4}
                />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="target-role">Target Role</Label>
                  <Input
                    id="target-role"
                    value={course.target_role}
                    onChange={(e) => setCourse({ ...course, target_role: e.target.value })}
                    placeholder="e.g., Junior Developer"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    value={course.status}
                    onValueChange={(value: any) => setCourse({ ...course, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Module Builder */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Course Modules</CardTitle>
                  <CardDescription>
                    Organize topics into modules and chapters
                  </CardDescription>
                </div>
                <Button onClick={addModule} size="sm">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Module
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {course.modules.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed rounded-lg">
                  <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No modules yet</p>
                  <Button onClick={addModule}>
                    <Plus className="w-4 h-4 mr-2" />
                    Create First Module
                  </Button>
                </div>
              ) : (
                <Accordion type="multiple" className="space-y-4">
                  {course.modules.map((module, moduleIndex) => (
                    <AccordionItem key={module.id} value={module.id} className="border rounded-lg p-4">
                      <div className="flex items-center gap-2">
                        <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                        
                        <div className="flex-1">
                          <AccordionTrigger className="hover:no-underline">
                            <div className="flex items-center gap-3 text-left">
                              <span className="font-mono text-sm text-gray-500">
                                #{module.order + 1}
                              </span>
                              <div>
                                <h4 className="font-semibold">{module.name}</h4>
                                <p className="text-sm text-gray-600">
                                  {module.topics.length} topics • {
                                    module.topics.reduce((sum, topicId) => {
                                      const topic = getTopicById(topicId);
                                      return sum + (topic?.duration_minutes || 0);
                                    }, 0)
                                  } minutes
                                </p>
                              </div>
                            </div>
                          </AccordionTrigger>
                        </div>

                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveModule(module.id, 'up')}
                            disabled={moduleIndex === 0}
                          >
                            <ChevronRight className="w-4 h-4 rotate-[-90deg]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveModule(module.id, 'down')}
                            disabled={moduleIndex === course.modules.length - 1}
                          >
                            <ChevronRight className="w-4 h-4 rotate-90" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-red-600"
                            onClick={() => deleteModule(module.id)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      <AccordionContent>
                        <div className="space-y-4 pt-4">
                          {/* Module Details */}
                          <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                              <Label>Module Name</Label>
                              <Input
                                value={module.name}
                                onChange={(e) => updateModule(module.id, { name: e.target.value })}
                                placeholder="Module name..."
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>Description</Label>
                              <Input
                                value={module.description}
                                onChange={(e) => updateModule(module.id, { description: e.target.value })}
                                placeholder="Brief description..."
                              />
                            </div>
                          </div>

                          {/* Topics in Module */}
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <Label>Topics in this Module</Label>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedModuleId(module.id);
                                  setShowTopicSelector(true);
                                }}
                              >
                                <Plus className="w-4 h-4 mr-1" />
                                Add Topic
                              </Button>
                            </div>

                            {module.topics.length === 0 ? (
                              <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <p className="text-gray-500">No topics yet</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {module.topics.map((topicId, topicIndex) => {
                                  const topic = getTopicById(topicId);
                                  if (!topic) return null;

                                  return (
                                    <div
                                      key={topicId}
                                      className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg border"
                                    >
                                      <GripVertical className="w-4 h-4 text-gray-400" />
                                      <span className="font-mono text-xs text-gray-500 w-8">
                                        {topicIndex + 1}
                                      </span>
                                      <div className="flex-1">
                                        <p className="font-medium text-sm">{topic.title}</p>
                                        <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                                          <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" />
                                            {topic.duration_minutes} min
                                          </span>
                                          {topic.difficulty && (
                                            <Badge variant="outline" className="text-xs">
                                              {topic.difficulty}
                                            </Badge>
                                          )}
                                          {topic.products && (
                                            <Badge variant="outline" className="text-xs">
                                              {topic.products.code}
                                            </Badge>
                                          )}
                                        </div>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-600"
                                        onClick={() => removeTopicFromModule(module.id, topicId)}
                                      >
                                        <X className="w-4 h-4" />
                                      </Button>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 1 column */}
        <div className="space-y-6">
          {/* Course Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Course Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Status</span>
                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Modules</span>
                  <span className="font-medium">{course.modules.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Total Topics</span>
                  <span className="font-medium">
                    {course.modules.reduce((sum, m) => sum + m.topics.length, 0)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Est. Duration</span>
                  <span className="font-medium">{Math.floor(totalDuration / 60)}h {totalDuration % 60}m</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button className="w-full" variant="outline" asChild>
                <Link href="/admin/training-content/topics">
                  <BookOpen className="w-4 h-4 mr-2" />
                  Manage Topics
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/admin/training-content/content-upload">
                  <FileText className="w-4 h-4 mr-2" />
                  Upload Content
                </Link>
              </Button>
              <Button className="w-full" variant="outline" asChild>
                <Link href="/admin/training-content/analytics">
                  <Target className="w-4 h-4 mr-2" />
                  View Analytics
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Topic Selector Dialog */}
      <Dialog open={showTopicSelector} onOpenChange={setShowTopicSelector}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Topics to Module</DialogTitle>
            <DialogDescription>
              Select topics to add to this module
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search topics..."
                value={topicSearch}
                onChange={(e) => setTopicSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="max-h-96 overflow-y-auto space-y-2">
              {filteredTopics.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  {topicSearch ? 'No matching topics found' : 'All topics have been added'}
                </p>
              ) : (
                filteredTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      if (selectedModuleId) {
                        addTopicToModule(selectedModuleId, topic.id);
                        toast.success(`Added ${topic.title}`);
                      }
                    }}
                  >
                    <div className="flex-1">
                      <p className="font-medium">{topic.title}</p>
                      <div className="flex items-center gap-3 text-xs text-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {topic.duration_minutes} min
                        </span>
                        {topic.difficulty && (
                          <Badge variant="outline" className="text-xs">
                            {topic.difficulty}
                          </Badge>
                        )}
                        {topic.products && (
                          <Badge variant="outline" className="text-xs">
                            {topic.products.name}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))
              )}
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTopicSelector(false)}>
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


