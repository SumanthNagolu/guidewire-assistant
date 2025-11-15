"use client";
import { useEffect, useState } from 'react';
import { useSupabase } from '@/providers/supabase-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Mail,
  Phone,
  MessageSquare,
  Send,
  Paperclip,
  Star,
  Archive,
  Trash2,
  Reply,
  Forward,
  MoreVertical,
  Search,
  Filter,
  Plus,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  FileText,
  Calendar,
  Video,
} from 'lucide-react';
interface Email {
  id: string;
  from: string;
  from_email: string;
  to: string;
  subject: string;
  body: string;
  timestamp: string;
  read: boolean;
  starred: boolean;
  category: 'candidate' | 'client' | 'internal' | 'system';
  attachments?: number;
  thread_id?: string;
  thread_count?: number;
}
interface CommunicationTemplate {
  id: string;
  name: string;
  category: string;
  subject: string;
  body: string;
  variables: string[];
  usage_count: number;
  last_used?: string;
}
interface Campaign {
  id: string;
  name: string;
  status: 'draft' | 'scheduled' | 'sent' | 'completed';
  recipients: number;
  sent: number;
  opened: number;
  clicked: number;
  scheduled_for?: string;
  created_at: string;
}
export default function CommunicationsPage() {
  const { supabase, user } = useSupabase();
  const [emails, setEmails] = useState<Email[]>([]);
  const [templates, setTemplates] = useState<CommunicationTemplate[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);
  const [composeOpen, setComposeOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);
  // Compose form state
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState('');
  useEffect(() => {
    fetchCommunications();
  }, []);
  const fetchCommunications = async () => {
    setLoading(true);
    try {
      // Fetch emails (simulated data)
      const emailsData: Email[] = [
        {
          id: '1',
          from: 'John Doe',
          from_email: 'john.doe@example.com',
          to: 'me@intimesolutions.com',
          subject: 'Re: Senior Developer Position',
          body: 'I am very interested in the position. When can we schedule an interview?',
          timestamp: '10:30 AM',
          read: false,
          starred: true,
          category: 'candidate',
          attachments: 2,
          thread_count: 3,
        },
        {
          id: '2',
          from: 'Sarah Smith (TechCorp)',
          from_email: 'sarah@techcorp.com',
          to: 'me@intimesolutions.com',
          subject: 'Urgent: Need 5 Java Developers',
          body: 'We have an urgent requirement for 5 senior Java developers. Can you help?',
          timestamp: '9:15 AM',
          read: true,
          starred: false,
          category: 'client',
          thread_count: 1,
        },
        {
          id: '3',
          from: 'Team Lead',
          from_email: 'lead@intimesolutions.com',
          to: 'team@intimesolutions.com',
          subject: 'Weekly Sprint Review - Friday 3 PM',
          body: 'Please join us for the weekly sprint review meeting.',
          timestamp: 'Yesterday',
          read: true,
          starred: false,
          category: 'internal',
        },
        {
          id: '4',
          from: 'System',
          from_email: 'noreply@intimesolutions.com',
          to: 'me@intimesolutions.com',
          subject: 'Daily Report: 12 new candidates added',
          body: 'Your daily activity report is ready.',
          timestamp: 'Yesterday',
          read: true,
          starred: false,
          category: 'system',
        },
      ];
      setEmails(emailsData);
      setUnreadCount(emailsData.filter(e => !e.read).length);
      // Fetch templates
      const templatesData: CommunicationTemplate[] = [
        {
          id: '1',
          name: 'Initial Candidate Outreach',
          category: 'candidate_outreach',
          subject: 'Exciting {position} Opportunity',
          body: 'Dear {candidateName},\n\nI came across your profile...',
          variables: ['candidateName', 'position'],
          usage_count: 45,
          last_used: '2 days ago',
        },
        {
          id: '2',
          name: 'Interview Schedule',
          category: 'interview',
          subject: 'Interview Scheduled - {company}',
          body: 'Your interview has been scheduled for {date} at {time}...',
          variables: ['company', 'date', 'time'],
          usage_count: 32,
          last_used: 'Today',
        },
        {
          id: '3',
          name: 'Client Update',
          category: 'client',
          subject: 'Update on {position} Requirements',
          body: 'Dear {clientName},\n\nI wanted to provide you with an update...',
          variables: ['clientName', 'position'],
          usage_count: 28,
          last_used: 'Yesterday',
        },
      ];
      setTemplates(templatesData);
      // Fetch campaigns
      const campaignsData: Campaign[] = [
        {
          id: '1',
          name: 'Q1 Developer Outreach',
          status: 'completed',
          recipients: 500,
          sent: 500,
          opened: 350,
          clicked: 120,
          created_at: '2024-01-15',
        },
        {
          id: '2',
          name: 'February Newsletter',
          status: 'sent',
          recipients: 1200,
          sent: 1200,
          opened: 450,
          clicked: 80,
          created_at: '2024-02-01',
        },
        {
          id: '3',
          name: 'Java Developer Campaign',
          status: 'scheduled',
          recipients: 300,
          sent: 0,
          opened: 0,
          clicked: 0,
          scheduled_for: '2024-02-20 10:00 AM',
          created_at: '2024-02-10',
        },
      ];
      setCampaigns(campaignsData);
    } catch (error) {
      } finally {
      setLoading(false);
    }
  };
  const sendEmail = async () => {
    // Implement send email functionality
    setComposeOpen(false);
    setComposeTo('');
    setComposeSubject('');
    setComposeBody('');
  };
  const applyTemplate = (templateId: string) => {
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setComposeSubject(template.subject);
      setComposeBody(template.body);
    }
  };
  const markAsRead = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, read: true } : e));
    setUnreadCount(prev => Math.max(0, prev - 1));
  };
  const toggleStar = (emailId: string) => {
    setEmails(emails.map(e => e.id === emailId ? { ...e, starred: !e.starred } : e));
  };
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'candidate':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'client':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'internal':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'system':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };
  const filteredEmails = emails.filter(email => {
    const matchesSearch = 
      email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.from.toLowerCase().includes(searchQuery.toLowerCase()) ||
      email.body.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || email.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Communications Center</h2>
          <p className="text-muted-foreground">
            Unified inbox for all your communication needs
          </p>
        </div>
        <Dialog open={composeOpen} onOpenChange={setComposeOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Compose
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Compose Email</DialogTitle>
              <DialogDescription>
                Create a new email or use a template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template">Template (Optional)</Label>
                <Select value={selectedTemplate} onValueChange={(value) => {
                  setSelectedTemplate(value);
                  applyTemplate(value);
                }}>
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="to">To</Label>
                <Input
                  id="to"
                  value={composeTo}
                  onChange={(e) => setComposeTo(e.target.value)}
                  placeholder="recipient@example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={composeSubject}
                  onChange={(e) => setComposeSubject(e.target.value)}
                  placeholder="Email subject"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="body">Message</Label>
                <Textarea
                  id="body"
                  value={composeBody}
                  onChange={(e) => setComposeBody(e.target.value)}
                  placeholder="Type your message here..."
                  rows={10}
                />
              </div>
              <div className="flex justify-between">
                <Button variant="outline">
                  <Paperclip className="mr-2 h-4 w-4" />
                  Attach
                </Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => setComposeOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={sendEmail}>
                    <Send className="mr-2 h-4 w-4" />
                    Send
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inbox</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{emails.length}</div>
            <p className="text-xs text-muted-foreground">
              {unreadCount} unread
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Sent Today</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">
              +12% from yesterday
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Response Rate</CardTitle>
            <Reply className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">68%</div>
            <p className="text-xs text-muted-foreground">
              Last 7 days
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Templates</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
            <p className="text-xs text-muted-foreground">
              3 used today
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Campaigns</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{campaigns.length}</div>
            <p className="text-xs text-muted-foreground">
              1 scheduled
            </p>
          </CardContent>
        </Card>
      </div>
      {/* Main Content */}
      <Tabs defaultValue="inbox" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inbox">
            Inbox
            {unreadCount > 0 && (
              <Badge className="ml-2" variant="secondary">
                {unreadCount}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>
        {/* Inbox Tab */}
        <TabsContent value="inbox">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div className="flex gap-4 flex-1">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Search emails..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="candidate">Candidates</SelectItem>
                      <SelectItem value="client">Clients</SelectItem>
                      <SelectItem value="internal">Internal</SelectItem>
                      <SelectItem value="system">System</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="icon">
                    <Archive className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {filteredEmails.map((email) => (
                  <div
                    key={email.id}
                    className={`flex items-center gap-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer ${
                      !email.read ? 'bg-blue-50 dark:bg-blue-950/20' : ''
                    }`}
                    onClick={() => {
                      setSelectedEmail(email);
                      markAsRead(email.id);
                    }}
                  >
                    <Checkbox className="rounded" />
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(email.id);
                      }}
                    >
                      <Star className={`h-4 w-4 ${email.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                    </Button>
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{email.from[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <p className={`text-sm ${!email.read ? 'font-semibold' : ''}`}>
                          {email.from}
                        </p>
                        <Badge className={getCategoryColor(email.category) + ' text-xs'}>
                          {email.category}
                        </Badge>
                        {email.thread_count && email.thread_count > 1 && (
                          <Badge variant="outline" className="text-xs">
                            {email.thread_count}
                          </Badge>
                        )}
                      </div>
                      <p className={`text-sm ${!email.read ? 'font-medium' : 'text-muted-foreground'}`}>
                        {email.subject}
                      </p>
                      <p className="text-sm text-muted-foreground truncate">
                        {email.body}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">{email.timestamp}</p>
                      {email.attachments && (
                        <div className="flex items-center justify-end gap-1 mt-1">
                          <Paperclip className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{email.attachments}</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Templates Tab */}
        <TabsContent value="templates">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Email Templates</CardTitle>
                  <CardDescription>
                    Manage and use pre-defined email templates
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Template
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Template Name</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Variables</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Last Used</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {templates.map((template) => (
                    <TableRow key={template.id}>
                      <TableCell className="font-medium">{template.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {template.category.replace('_', ' ')}
                        </Badge>
                      </TableCell>
                      <TableCell className="max-w-xs truncate">
                        {template.subject}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {template.variables.map((variable, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {variable}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{template.usage_count}</TableCell>
                      <TableCell>{template.last_used || 'Never'}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedTemplate(template.id);
                            applyTemplate(template.id);
                            setComposeOpen(true);
                          }}
                        >
                          Use
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Campaigns Tab */}
        <TabsContent value="campaigns">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Email Campaigns</CardTitle>
                  <CardDescription>
                    Manage mass email campaigns and track performance
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  New Campaign
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Campaign Name</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Open Rate</TableHead>
                    <TableHead>Click Rate</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {campaigns.map((campaign) => {
                    const openRate = campaign.sent > 0 ? ((campaign.opened / campaign.sent) * 100).toFixed(1) : '0';
                    const clickRate = campaign.opened > 0 ? ((campaign.clicked / campaign.opened) * 100).toFixed(1) : '0';
                    return (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name}</TableCell>
                        <TableCell>
                          <Badge variant={
                            campaign.status === 'completed' ? 'success' :
                            campaign.status === 'sent' ? 'default' :
                            campaign.status === 'scheduled' ? 'secondary' :
                            'outline'
                          }>
                            {campaign.status}
                          </Badge>
                        </TableCell>
                        <TableCell>{campaign.recipients}</TableCell>
                        <TableCell>{campaign.sent}</TableCell>
                        <TableCell>{openRate}%</TableCell>
                        <TableCell>{clickRate}%</TableCell>
                        <TableCell>
                          {campaign.scheduled_for || '-'}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm">
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>Communication Analytics</CardTitle>
              <CardDescription>
                Track your communication performance metrics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Email Volume</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">1,248</div>
                    <p className="text-xs text-muted-foreground">This month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Avg Response Time</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">2.4 hrs</div>
                    <p className="text-xs text-muted-foreground">-15% from last month</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">Template Usage</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">62%</div>
                    <p className="text-xs text-muted-foreground">Of all emails</p>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
