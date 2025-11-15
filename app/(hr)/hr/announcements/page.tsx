import { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Bell, Pin, Calendar } from 'lucide-react';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Announcements | HR Portal',
  description: 'Company announcements and updates',
};

interface Announcement {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: string;
  is_pinned: boolean;
  published_at: string;
  expires_at: string | null;
  created_by: string;
  created_at: string;
  employees?: {
    first_name: string;
    last_name: string;
  };
}

export default async function AnnouncementsPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/hr/login');
  }

  // Check if user is HR (can create announcements)
  const { data: employee } = await supabase
    .from('employees')
    .select('*, hr_roles(name, permissions)')
    .eq('user_id', user.id)
    .single();

  const isHR = employee?.hr_roles?.permissions?.hr || employee?.hr_roles?.permissions?.admin;

  // Fetch active announcements
  const { data: announcements } = await supabase
    .from('announcements')
    .select(`
      *,
      employees:created_by (first_name, last_name)
    `)
    .or('expires_at.is.null,expires_at.gte.' + new Date().toISOString())
    .order('is_pinned', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(20);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Announcements</h1>
          <p className="text-gray-600 mt-1">Company news and updates</p>
        </div>
        {isHR && (
          <Link href="/hr/announcements/new">
            <Button>
              <PlusCircle className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </Link>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex space-x-2">
        <Button variant="outline" size="sm">All</Button>
        <Button variant="ghost" size="sm">Company News</Button>
        <Button variant="ghost" size="sm">Policy Updates</Button>
        <Button variant="ghost" size="sm">Events</Button>
        <Button variant="ghost" size="sm">HR Updates</Button>
      </div>

      {/* Announcements List */}
      <div className="space-y-4">
        {announcements && announcements.length > 0 ? (
          announcements.map((announcement: Announcement) => (
            <Card
              key={announcement.id}
              className={`hover:shadow-md transition-shadow ${
                announcement.is_pinned ? 'border-indigo-200 bg-indigo-50' : ''
              }`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {announcement.is_pinned && (
                        <Pin className="h-4 w-4 text-indigo-600" />
                      )}
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {announcement.category}
                      </span>
                      {announcement.priority === 'High' && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Important
                        </span>
                      )}
                    </div>
                    <CardTitle className="text-xl">
                      {announcement.title}
                    </CardTitle>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {new Date(announcement.published_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </div>
                      <div>
                        By {announcement.employees?.first_name} {announcement.employees?.last_name}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div 
                  className="prose prose-sm max-w-none"
                  dangerouslySetInnerHTML={{ __html: announcement.content }}
                />
                {isHR && (
                  <div className="mt-4 pt-4 border-t flex space-x-2">
                    <Link href={`/hr/announcements/${announcement.id}/edit`}>
                      <Button variant="outline" size="sm">
                        Edit
                      </Button>
                    </Link>
                    <Button variant="outline" size="sm" className="text-red-600">
                      Delete
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No announcements at this time</p>
              {isHR && (
                <Link href="/hr/announcements/new">
                  <Button className="mt-4">
                    Create First Announcement
                  </Button>
                </Link>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}

