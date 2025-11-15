'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
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
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Send, Save } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NewAnnouncementPage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: 'Company News',
    priority: 'Normal',
    is_pinned: false,
    target_audience: 'all',
    expires_at: '',
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (publish: boolean = true) => {
    setLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: employee } = await supabase
        .from('employees')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const announcementData = {
        ...formData,
        created_by: employee?.id,
        published_at: publish ? new Date().toISOString() : null,
        status: publish ? 'Published' : 'Draft',
        expires_at: formData.expires_at || null,
      };

      const { error } = await supabase
        .from('announcements')
        .insert(announcementData);

      if (error) throw error;

      toast.success(
        publish
          ? 'Announcement published successfully!'
          : 'Announcement saved as draft'
      );
      
      router.push('/hr/announcements');
    } catch (error) {
            toast.error('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/hr/announcements">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">New Announcement</h1>
            <p className="text-gray-600 mt-1">Create a company-wide announcement</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Announcement Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Write your announcement here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  rows={10}
                  required
                />
                <p className="text-xs text-gray-500">
                  Tip: Use Markdown for formatting (** for bold, * for italic)
                </p>
              </div>

              {/* Category & Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Company News">Company News</SelectItem>
                      <SelectItem value="Policy Update">Policy Update</SelectItem>
                      <SelectItem value="Event">Event</SelectItem>
                      <SelectItem value="HR Update">HR Update</SelectItem>
                      <SelectItem value="System">System</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select
                    value={formData.priority}
                    onValueChange={(value) => setFormData({ ...formData, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Normal">Normal</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                      <SelectItem value="Urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publishing Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Pin to Top */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="pinned"
                  checked={formData.is_pinned}
                  onChange={(e) => setFormData({ ...formData, is_pinned: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="pinned" className="font-normal cursor-pointer">
                  Pin to top
                </Label>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select
                  value={formData.target_audience}
                  onValueChange={(value) =>
                    setFormData({ ...formData, target_audience: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Employees</SelectItem>
                    <SelectItem value="department">Specific Department</SelectItem>
                    <SelectItem value="role">Specific Role</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Expiry Date */}
              <div className="space-y-2">
                <Label htmlFor="expires">Expiry Date (Optional)</Label>
                <Input
                  id="expires"
                  type="date"
                  value={formData.expires_at}
                  onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                />
                <p className="text-xs text-gray-500">
                  Leave blank for permanent announcement
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardContent className="pt-6 space-y-3">
              <Button
                onClick={() => handleSubmit(true)}
                disabled={loading || !formData.title || !formData.content}
                className="w-full"
              >
                <Send className="h-4 w-4 mr-2" />
                {loading ? 'Publishing...' : 'Publish Now'}
              </Button>
              <Button
                onClick={() => handleSubmit(false)}
                variant="outline"
                disabled={loading}
                className="w-full"
              >
                <Save className="h-4 w-4 mr-2" />
                Save as Draft
              </Button>
              <Link href="/hr/announcements" className="block">
                <Button variant="ghost" className="w-full">
                  Cancel
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

