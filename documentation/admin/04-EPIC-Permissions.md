# EPIC 4: Permissions & Audit System

**Epic ID**: ADMIN-EPIC-04  
**Epic Name**: Permissions & Audit Logging  
**Priority**: P0 (Critical - Security)  
**Estimated Stories**: 14  
**Estimated Effort**: 4-5 days  
**Command**: `/admin-04-permissions`

---

## Epic Overview

### Goal
Implement comprehensive role-based permission system with complete audit trail for all administrative actions.

### Business Value
- Security compliance and accountability
- Track all changes for audit purposes
- Clear permission matrix for each role
- Forensic capability for security incidents
- Compliance with data protection regulations

### Technical Scope
- Permission matrix visualization
- Role definitions with capabilities
- Audit log viewer with filtering
- Audit log detail views
- Real-time audit logging
- IP address tracking
- Change history (before/after)

### Dependencies
- Epic 1 (Authentication) completed
- Epic 3 (User Management) completed
- `cms_audit_log` table created
- User profile with role permissions

---

## User Stories

### Story PERM-001: Permissions Page Tab Navigation

**As a**: Admin  
**I want**: Tabbed interface for permissions management  
**So that**: I can navigate between roles, users, and audit logs

#### Acceptance Criteria
- [ ] Page renders at `/admin/permissions`
- [ ] 3 tabs: "Roles & Permissions", "User Management", "Audit Log"
- [ ] Default tab: "Roles & Permissions"
- [ ] Tab switching smooth (no page reload)
- [ ] Active tab highlighted (blue-600 border bottom)
- [ ] Inactive tabs have hover state
- [ ] Tab content loads based on selection
- [ ] URL updates with tab param (optional)

#### Technical Implementation

**Files to Modify**:
```
app/admin/permissions/page.tsx (enhance existing)
components/admin/permissions/PermissionManagement.tsx (enhance existing)
```

**Component Structure**:
```typescript
'use client';

export default function PermissionManagement({ initialUsers, initialAuditLogs }) {
  const [activeTab, setActiveTab] = useState<'roles' | 'users' | 'audit'>('roles');
  
  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <TabButton
            active={activeTab === 'roles'}
            onClick={() => setActiveTab('roles')}
            label="Roles & Permissions"
          />
          <TabButton
            active={activeTab === 'users'}
            onClick={() => setActiveTab('users')}
            label="User Management"
          />
          <TabButton
            active={activeTab === 'audit'}
            onClick={() => setActiveTab('audit')}
            label="Audit Log"
          />
        </nav>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'roles' && <RolesTab />}
      {activeTab === 'users' && <UserManagementTab users={initialUsers} />}
      {activeTab === 'audit' && <AuditLogTab logs={initialAuditLogs} />}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Tabs render correctly
- [ ] Tab switching works
- [ ] Active state correct
- [ ] Content changes per tab
- [ ] Smooth transitions

---

### Story PERM-002: Role Definitions Display

**As a**: Admin  
**I want**: Clear description of each role  
**So that**: I understand what permissions each role has

#### Acceptance Criteria
- [ ] Card for each role (7 total)
- [ ] Role badge with color coding
- [ ] User count per role
- [ ] Permission description text
- [ ] List of key capabilities
- [ ] Expandable for full permissions list
- [ ] Consistent card styling

#### Technical Implementation

**Component**:
```typescript
const roleDefinitions = [
  {
    role: 'admin',
    label: 'Administrator',
    color: 'red',
    description: 'Full access to all features and settings',
    capabilities: [
      'Manage all users and roles',
      'Access all admin features',
      'Configure system settings',
      'View all audit logs',
      'Manage content and data',
    ],
  },
  {
    role: 'recruiter',
    label: 'Recruiter',
    color: 'blue',
    description: 'Manage jobs, candidates, and placements',
    capabilities: [
      'Post and manage job listings',
      'Add and manage candidates',
      'Track placements and pipeline',
      'View recruiting analytics',
      'Access talent database',
    ],
  },
  // ... other roles
];

function RoleDefinitionCard({ definition, userCount }: { definition: RoleDef; userCount: number }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <RoleBadge role={definition.role} />
          <span className="text-sm text-gray-600">
            {userCount} {userCount === 1 ? 'user' : 'users'}
          </span>
        </div>
        <p className="text-sm text-gray-700 mb-3">{definition.description}</p>
        <ul className="space-y-1">
          {definition.capabilities.map((cap, i) => (
            <li key={i} className="text-sm text-gray-600 flex items-start gap-2">
              <Check className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
              <span>{cap}</span>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
```

#### Testing Checklist
- [ ] All roles displayed
- [ ] User counts accurate
- [ ] Descriptions clear
- [ ] Capabilities listed
- [ ] Cards styled correctly

---

### Story PERM-003: Permission Matrix Table

**As a**: Admin  
**I want**: Visual matrix of permissions by role  
**So that**: I can see access levels across features

#### Acceptance Criteria
- [ ] Table with features as rows, roles as columns
- [ ] Icons: ✓ (full access), 👁️ (read-only), ✗ (no access)
- [ ] Green for full access
- [ ] Blue for read-only
- [ ] Gray for no access
- [ ] Table headers: Feature names and role names
- [ ] Tooltips explain permission levels
- [ ] Legend below table
- [ ] Responsive (scrollable on mobile)

#### Technical Implementation

**Component**:
```typescript
const permissionMatrix = [
  { feature: 'Blog Management', admin: 'write', recruiter: 'none', sales: 'none', operations: 'read' },
  { feature: 'Job Posting', admin: 'write', recruiter: 'write', sales: 'write', operations: 'read' },
  { feature: 'Talent Management', admin: 'write', recruiter: 'write', sales: 'read', operations: 'read' },
  { feature: 'Course Builder', admin: 'write', recruiter: 'none', sales: 'none', operations: 'none' },
  { feature: 'Analytics', admin: 'write', recruiter: 'read', sales: 'read', operations: 'read' },
  { feature: 'User Permissions', admin: 'write', recruiter: 'none', sales: 'none', operations: 'none' },
];

function PermissionIcon({ permission }: { permission: 'write' | 'read' | 'none' }) {
  if (permission === 'write') {
    return <CheckCircle className="w-5 h-5 text-green-600" title="Full Access" />;
  }
  if (permission === 'read') {
    return <Eye className="w-5 h-5 text-blue-600" title="Read Only" />;
  }
  return <XCircle className="w-5 h-5 text-gray-300" title="No Access" />;
}

function PermissionMatrix() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Permission Matrix</CardTitle>
        <CardDescription>Access levels by role and feature</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">
                  Feature
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Admin
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Recruiter
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Sales
                </th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700">
                  Operations
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {permissionMatrix.map((row, i) => (
                <tr key={i}>
                  <td className="px-4 py-3 text-sm text-gray-900">{row.feature}</td>
                  <td className="px-4 py-3 text-center"><PermissionIcon permission={row.admin} /></td>
                  <td className="px-4 py-3 text-center"><PermissionIcon permission={row.recruiter} /></td>
                  <td className="px-4 py-3 text-center"><PermissionIcon permission={row.sales} /></td>
                  <td className="px-4 py-3 text-center"><PermissionIcon permission={row.operations} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-4 flex gap-4 text-sm text-gray-600">
          <span className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-600" />
            Full Access
          </span>
          <span className="flex items-center gap-2">
            <Eye className="w-4 h-4 text-blue-600" />
            Read Only
          </span>
          <span className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-gray-300" />
            No Access
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Testing Checklist
- [ ] Matrix displays correctly
- [ ] Icons render properly
- [ ] Colors correct
- [ ] Tooltips work
- [ ] Legend displays
- [ ] Responsive on mobile

---

### Story PERM-004: Audit Log List View

**As a**: Admin  
**I want**: Chronological list of all admin actions  
**So that**: I can track what changes were made

#### Acceptance Criteria
- [ ] List shows last 100 audit entries
- [ ] Each entry shows: Action icon, Action type, Entity type, Entity title, User, Timestamp
- [ ] Action icons color-coded (green=create, blue=update, red=delete)
- [ ] Entries in reverse chronological order
- [ ] Click entry to see details
- [ ] Infinite scroll or pagination
- [ ] Real-time updates (new entries appear)
- [ ] Empty state if no logs

#### Technical Implementation

**Component**:
```typescript
function AuditLogList({ logs }: { logs: AuditLogEntry[] }) {
  if (logs.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No audit logs yet"
        description="Admin actions will be tracked here"
      />
    );
  }
  
  return (
    <div className="space-y-2">
      {logs.map(log => (
        <AuditLogItem key={log.id} log={log} />
      ))}
    </div>
  );
}

function AuditLogItem({ log }: { log: AuditLogEntry }) {
  const actionIcons = {
    create: <PlusCircle className="w-5 h-5 text-green-600" />,
    update: <Edit className="w-5 h-5 text-blue-600" />,
    delete: <Trash2 className="w-5 h-5 text-red-600" />,
    publish: <Send className="w-5 h-5 text-purple-600" />,
  };
  
  return (
    <div 
      className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
      onClick={() => {/* Open details dialog */}}
    >
      <div className="flex gap-3">
        <div className="flex-shrink-0 mt-1">
          {actionIcons[log.action]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex gap-2 mb-2">
            <Badge variant="outline" className="text-xs">
              {log.action}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {log.entity_type.replace(/_/g, ' ')}
            </Badge>
          </div>
          <p className="text-sm font-medium text-gray-900 truncate">
            {log.entity_title || `Unnamed ${log.entity_type}`}
          </p>
          <div className="flex gap-3 mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {log.user_email}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {format(new Date(log.created_at), 'MMM dd, yyyy HH:mm')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
```

#### Testing Checklist
- [ ] List renders correctly
- [ ] Icons display properly
- [ ] Click opens details
- [ ] Timestamps formatted
- [ ] Empty state works
- [ ] Pagination works

---

### Story PERM-005: Audit Log Filters

**As a**: Admin  
**I want**: Filter audit logs by action and entity type  
**So that**: I can find specific changes quickly

#### Acceptance Criteria
- [ ] Filter by action: All, Create, Update, Delete, Publish
- [ ] Filter by entity type: All, Blog Post, Resource, Job, User, etc.
- [ ] Search by entity title or user email
- [ ] Date range filter (last 24h, 7d, 30d, custom)
- [ ] Filters combine with AND logic
- [ ] Clear all filters button
- [ ] Result count updates with filters

#### Technical Implementation

**Component**:
```typescript
function AuditLogFilters({ logs, onFilter }: AuditLogFiltersProps) {
  const [actionFilter, setActionFilter] = useState<string | null>(null);
  const [entityFilter, setEntityFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateRange, setDateRange] = useState('all');
  
  useEffect(() => {
    let filtered = logs;
    
    if (actionFilter) {
      filtered = filtered.filter(l => l.action === actionFilter);
    }
    
    if (entityFilter) {
      filtered = filtered.filter(l => l.entity_type === entityFilter);
    }
    
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(l => 
        l.entity_title?.toLowerCase().includes(query) ||
        l.user_email.toLowerCase().includes(query)
      );
    }
    
    if (dateRange !== 'all') {
      const cutoff = getDateCutoff(dateRange);
      filtered = filtered.filter(l => new Date(l.created_at) >= cutoff);
    }
    
    onFilter(filtered);
  }, [actionFilter, entityFilter, searchQuery, dateRange, logs]);
  
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <div className="flex flex-wrap gap-3">
        <Input
          placeholder="Search logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-xs"
        />
        
        <Select value={actionFilter || 'all'} onValueChange={v => setActionFilter(v === 'all' ? null : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Actions" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Actions</SelectItem>
            <SelectItem value="create">Create</SelectItem>
            <SelectItem value="update">Update</SelectItem>
            <SelectItem value="delete">Delete</SelectItem>
            <SelectItem value="publish">Publish</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={entityFilter || 'all'} onValueChange={v => setEntityFilter(v === 'all' ? null : v)}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="blog_post">Blog Post</SelectItem>
            <SelectItem value="resource">Resource</SelectItem>
            <SelectItem value="job">Job</SelectItem>
            <SelectItem value="user">User</SelectItem>
            <SelectItem value="banner">Banner</SelectItem>
          </SelectContent>
        </Select>
        
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="24h">Last 24 Hours</SelectItem>
            <SelectItem value="7d">Last 7 Days</SelectItem>
            <SelectItem value="30d">Last 30 Days</SelectItem>
          </SelectContent>
        </Select>
        
        {(actionFilter || entityFilter || searchQuery || dateRange !== 'all') && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setActionFilter(null);
              setEntityFilter(null);
              setSearchQuery('');
              setDateRange('all');
            }}
          >
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  );
}
```

#### Testing Checklist
- [ ] All filters work
- [ ] Filters combine correctly
- [ ] Clear filters works
- [ ] Result count accurate
- [ ] Performance good

---

### Story PERM-006: Audit Log Detail Dialog

**As a**: Admin  
**I want**: Detailed view of each audit entry  
**So that**: I can see exactly what changed

#### Acceptance Criteria
- [ ] Dialog shows all audit entry fields
- [ ] Action and entity type highlighted
- [ ] Entity title/name displayed
- [ ] User who made change shown
- [ ] Timestamp in full format
- [ ] IP address displayed (if captured)
- [ ] Before/after changes shown (if available)
- [ ] JSON diff visualization for complex changes
- [ ] Close button to dismiss

#### Technical Implementation

**Component**:
```typescript
function AuditLogDetailDialog({ log, open, onClose }: DetailDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Audit Log Details</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-600">Action</label>
            <div className="flex gap-2 mt-1">
              <Badge>{log.action}</Badge>
              <Badge variant="outline">{log.entity_type}</Badge>
            </div>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Entity</label>
            <p className="text-sm text-gray-900 mt-1">
              {log.entity_title || `Unnamed ${log.entity_type}`}
            </p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">User</label>
            <p className="text-sm text-gray-900 mt-1">{log.user_email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-600">Timestamp</label>
            <p className="text-sm text-gray-900 mt-1">
              {format(new Date(log.created_at), 'MMMM dd, yyyy, HH:mm:ss a')}
            </p>
          </div>
          
          {log.ip_address && (
            <div>
              <label className="text-sm font-medium text-gray-600">IP Address</label>
              <p className="text-sm text-gray-900 mt-1">{log.ip_address}</p>
            </div>
          )}
          
          {log.changes && (
            <div>
              <label className="text-sm font-medium text-gray-600">Changes</label>
              <pre className="mt-1 bg-gray-100 border border-gray-200 rounded-lg p-3 text-xs overflow-x-auto max-h-64">
                {JSON.stringify(log.changes, null, 2)}
              </pre>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Testing Checklist
- [ ] Dialog opens correctly
- [ ] All fields display
- [ ] JSON formatted properly
- [ ] Close works
- [ ] Responsive layout

---

### Story PERM-007: Audit Log Statistics

**As a**: Admin  
**I want**: Summary statistics of audit activity  
**So that**: I can monitor system usage

#### Acceptance Criteria
- [ ] 4 stat cards: Last 24h, Creates, Updates, Deletes
- [ ] Card shows count for each metric
- [ ] Cards update when filters applied
- [ ] Grid layout (4 columns)
- [ ] Icons for each card type
- [ ] Consistent styling with other stat cards

#### Technical Implementation

**Component**:
```typescript
function AuditLogStats({ logs }: { logs: AuditLogEntry[] }) {
  const stats = useMemo(() => {
    const now = Date.now();
    const last24h = logs.filter(l => 
      now - new Date(l.created_at).getTime() < 24 * 60 * 60 * 1000
    ).length;
    
    return {
      last24h,
      creates: logs.filter(l => l.action === 'create').length,
      updates: logs.filter(l => l.action === 'update').length,
      deletes: logs.filter(l => l.action === 'delete').length,
    };
  }, [logs]);
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard label="Last 24 Hours" value={stats.last24h} icon={Clock} />
      <StatCard label="Creates" value={stats.creates} icon={PlusCircle} color="green" />
      <StatCard label="Updates" value={stats.updates} icon={Edit} color="blue" />
      <StatCard label="Deletes" value={stats.deletes} icon={Trash2} color="red" />
    </div>
  );
}
```

#### Testing Checklist
- [ ] Stats calculate correctly
- [ ] Cards render properly
- [ ] Updates with filters
- [ ] Grid responsive

---

### Story PERM-008: Automatic Audit Logging Triggers

**As a**: System  
**I want**: Automatic logging of all CMS changes  
**So that**: No actions go untracked

#### Acceptance Criteria
- [ ] Database trigger on blog_posts table
- [ ] Database trigger on resources table
- [ ] Database trigger on banners table
- [ ] Database trigger on jobs table
- [ ] Trigger captures: action, entity_id, entity_title, user_id, changes
- [ ] Trigger fires on INSERT, UPDATE, DELETE
- [ ] Changes field contains before/after JSON
- [ ] User context captured from auth

#### Technical Implementation

**Database Migration**:
```sql
-- Create audit log function
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
  user_email TEXT;
  entity_title TEXT;
BEGIN
  -- Get user email from auth
  SELECT email INTO user_email
  FROM auth.users
  WHERE id = auth.uid();
  
  -- Get entity title based on table
  IF TG_TABLE_NAME = 'blog_posts' THEN
    entity_title := COALESCE(NEW.title, OLD.title);
  ELSIF TG_TABLE_NAME = 'resources' THEN
    entity_title := COALESCE(NEW.title, OLD.title);
  ELSIF TG_TABLE_NAME = 'jobs' THEN
    entity_title := COALESCE(NEW.title, OLD.title);
  END IF;
  
  -- Insert audit log
  INSERT INTO cms_audit_log (
    action,
    entity_type,
    entity_id,
    entity_title,
    changes,
    user_id,
    user_email
  ) VALUES (
    LOWER(TG_OP), -- 'insert', 'update', 'delete'
    TG_TABLE_NAME,
    COALESCE(NEW.id, OLD.id),
    entity_title,
    jsonb_build_object('before', to_jsonb(OLD), 'after', to_jsonb(NEW)),
    auth.uid(),
    user_email
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create triggers
CREATE TRIGGER blog_posts_audit
  AFTER INSERT OR UPDATE OR DELETE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER resources_audit
  AFTER INSERT OR UPDATE OR DELETE ON resources
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER banners_audit
  AFTER INSERT OR UPDATE OR DELETE ON banners
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

CREATE TRIGGER jobs_audit
  AFTER INSERT OR UPDATE OR DELETE ON jobs
  FOR EACH ROW EXECUTE FUNCTION audit_log_changes();
```

#### Testing Checklist
- [ ] Triggers created successfully
- [ ] Insert actions logged
- [ ] Update actions logged
- [ ] Delete actions logged
- [ ] User captured correctly
- [ ] Changes JSON populated
- [ ] No performance impact

---

### Story PERM-009: Manual Audit Log Creation

**As a**: Application  
**I want**: Function to manually create audit logs  
**So that**: Client-side actions can be logged

#### Acceptance Criteria
- [ ] Function accepts action, entity details, changes
- [ ] Function creates audit log entry
- [ ] Function captures current user automatically
- [ ] Function captures IP address
- [ ] Function handles errors gracefully
- [ ] Function returns success/failure
- [ ] TypeScript typed properly

#### Technical Implementation

**Module**:
```typescript
// modules/audit/create-log.ts
export async function createAuditLog(params: {
  action: 'create' | 'update' | 'delete' | 'publish' | 'archive';
  entityType: string;
  entityId: string;
  entityTitle?: string;
  changes?: Record<string, any>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient();
    
    // Get current user
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }
    
    // Get user email
    const { data: profile } = await supabase
      .from('user_profiles')
      .select('email')
      .eq('id', user.id)
      .single();
    
    // Create log entry
    const { error } = await supabase
      .from('cms_audit_log')
      .insert({
        action: params.action,
        entity_type: params.entityType,
        entity_id: params.entityId,
        entity_title: params.entityTitle,
        changes: params.changes,
        user_id: user.id,
        user_email: profile?.email || user.email,
      });
    
    if (error) {
      throw error;
    }
    
    return { success: true };
  } catch (err) {
    console.error('[Audit Log]', err);
    return { 
      success: false, 
      error: err instanceof Error ? err.message : 'Failed to create log'
    };
  }
}
```

#### Testing Checklist
- [ ] Function creates log correctly
- [ ] User captured automatically
- [ ] Error handling works
- [ ] TypeScript types correct
- [ ] Can be called from any component

---

### Story PERM-010: Audit Log Export

**As a**: Compliance officer  
**I want**: Export audit logs to CSV  
**So that**: I can archive for compliance

#### Acceptance Criteria
- [ ] Export button in audit log tab
- [ ] Exports all filtered logs
- [ ] CSV includes all log fields
- [ ] Filename includes date range
- [ ] Large exports show progress
- [ ] Success toast on completion
- [ ] Export includes changes JSON (stringified)

#### Technical Implementation

**Export Function**:
```typescript
function exportAuditLogs(logs: AuditLogEntry[]) {
  const headers = ['Timestamp', 'Action', 'Entity Type', 'Entity Title', 'User', 'IP Address', 'Changes'];
  
  const rows = logs.map(log => [
    format(new Date(log.created_at), 'yyyy-MM-dd HH:mm:ss'),
    log.action,
    log.entity_type,
    log.entity_title || '',
    log.user_email,
    log.ip_address || '',
    log.changes ? JSON.stringify(log.changes) : '',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `audit-logs-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  toast.success(`Exported ${logs.length} audit entries`);
}
```

#### Testing Checklist
- [ ] Export downloads file
- [ ] CSV format correct
- [ ] All data included
- [ ] Filename correct
- [ ] Works with filters

---

### Story PERM-011: Role Permission Checks

**As a**: System  
**I want**: Helper functions to check permissions  
**So that**: Components can conditionally render based on role

#### Acceptance Criteria
- [ ] Function `canAccess(feature, role)` returns boolean
- [ ] Function `hasWriteAccess(feature, role)` returns boolean
- [ ] Function `hasReadAccess(feature, role)` returns boolean
- [ ] Works for all features and roles
- [ ] Centralized permission definitions
- [ ] TypeScript typed
- [ ] Used across admin portal

#### Technical Implementation

**Module**:
```typescript
// lib/permissions/checks.ts

type Feature = 
  | 'blog'
  | 'resources'
  | 'jobs'
  | 'talent'
  | 'banners'
  | 'media'
  | 'courses'
  | 'analytics'
  | 'users'
  | 'permissions';

type Role = 
  | 'admin'
  | 'recruiter'
  | 'sales'
  | 'account_manager'
  | 'operations'
  | 'employee'
  | 'student';

type Permission = 'write' | 'read' | 'none';

const permissionMap: Record<Feature, Record<Role, Permission>> = {
  blog: {
    admin: 'write',
    recruiter: 'none',
    sales: 'none',
    account_manager: 'none',
    operations: 'read',
    employee: 'none',
    student: 'none',
  },
  jobs: {
    admin: 'write',
    recruiter: 'write',
    sales: 'write',
    account_manager: 'read',
    operations: 'read',
    employee: 'none',
    student: 'none',
  },
  // ... other features
};

export function canAccess(feature: Feature, role: Role): boolean {
  return permissionMap[feature]?.[role] !== 'none';
}

export function hasWriteAccess(feature: Feature, role: Role): boolean {
  return permissionMap[feature]?.[role] === 'write';
}

export function hasReadAccess(feature: Feature, role: Role): boolean {
  const permission = permissionMap[feature]?.[role];
  return permission === 'read' || permission === 'write';
}
```

#### Testing Checklist
- [ ] All functions work correctly
- [ ] Returns correct booleans
- [ ] Used in components
- [ ] TypeScript types enforced
- [ ] Unit tests passing

---

### Story PERM-012: Permission-Based UI Rendering

**As a**: UI component  
**I want**: Conditional rendering based on permissions  
**So that**: Users only see what they can access

#### Acceptance Criteria
- [ ] Edit buttons hidden if no write access
- [ ] Delete buttons hidden if no write access
- [ ] Create buttons hidden if no write access
- [ ] Read-only badges shown for read-only access
- [ ] Navigation items filtered by permissions
- [ ] Graceful error if accessing unauthorized feature
- [ ] Consistent across all admin pages

#### Technical Implementation

**Usage Example**:
```typescript
import { hasWriteAccess } from '@/lib/permissions/checks';

function BlogManagement({ userRole }: { userRole: Role }) {
  const canWrite = hasWriteAccess('blog', userRole);
  
  return (
    <div>
      {canWrite && (
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          New Post
        </Button>
      )}
      
      <BlogList showEditButtons={canWrite} />
      
      {!canWrite && (
        <Badge variant="outline">Read Only Access</Badge>
      )}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Conditional rendering works
- [ ] Permissions enforced
- [ ] UI consistent
- [ ] No unauthorized actions visible

---

### Story PERM-013: IP Address Capture

**As a**: Security system  
**I want**: Capture IP addresses for all audit logs  
**So that**: We can track access origins

#### Acceptance Criteria
- [ ] IP address captured on client-side actions
- [ ] IP address captured from request headers
- [ ] IPv4 and IPv6 supported
- [ ] Proxy headers checked (X-Forwarded-For, X-Real-IP)
- [ ] IP stored in audit log
- [ ] IP displayed in audit log details
- [ ] Privacy compliance (hash/anonymize if needed)

#### Technical Implementation

**Helper Function**:
```typescript
// lib/utils/get-ip-address.ts
export function getClientIP(request: Request): string | null {
  // Check various headers for IP
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  
  const realIP = request.headers.get('x-real-ip');
  if (realIP) {
    return realIP;
  }
  
  const cfConnectingIP = request.headers.get('cf-connecting-ip');
  if (cfConnectingIP) {
    return cfConnectingIP;
  }
  
  return null;
}

// Usage in API route
export async function POST(request: Request) {
  const ipAddress = getClientIP(request);
  
  await createAuditLog({
    ...params,
    ip_address: ipAddress,
  });
}
```

#### Testing Checklist
- [ ] IP captured correctly
- [ ] Proxy headers work
- [ ] Stored in database
- [ ] Displayed in UI
- [ ] Privacy compliant

---

### Story PERM-014: Audit Log Real-time Updates

**As a**: Admin monitoring system  
**I want**: Real-time audit log updates  
**So that**: I see changes as they happen

#### Acceptance Criteria
- [ ] New audit entries appear without refresh
- [ ] Uses Supabase real-time subscriptions
- [ ] Updates only when audit tab active
- [ ] Smooth animation for new entries
- [ ] Notification badge when new entries arrive
- [ ] Auto-scroll to new entries (optional)
- [ ] Performance: No lag with high frequency

#### Technical Implementation

**Real-time Subscription**:
```typescript
function AuditLogTab({ initialLogs }: { initialLogs: AuditLogEntry[] }) {
  const [logs, setLogs] = useState(initialLogs);
  
  useEffect(() => {
    const supabase = createClient();
    
    const subscription = supabase
      .channel('audit-logs')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'cms_audit_log',
        },
        (payload) => {
          setLogs(prev => [payload.new as AuditLogEntry, ...prev]);
          
          // Show notification
          toast.info('New audit entry recorded');
        }
      )
      .subscribe();
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);
  
  return <AuditLogList logs={logs} />;
}
```

#### Testing Checklist
- [ ] Real-time updates work
- [ ] New entries appear
- [ ] Notification shows
- [ ] Performance good
- [ ] Cleanup on unmount

---

## Epic Completion Criteria

### Functional Requirements
- [ ] All 14 stories implemented
- [ ] Permission system works
- [ ] Audit logging comprehensive
- [ ] Real-time updates functional
- [ ] Export capabilities working

### Security Requirements
- [ ] All admin actions logged
- [ ] IP addresses captured
- [ ] User attribution correct
- [ ] No way to bypass logging
- [ ] Audit logs immutable

### Quality Requirements
- [ ] TypeScript strict passing
- [ ] No console errors
- [ ] Tests comprehensive
- [ ] Documentation complete
- [ ] Code reviewed

---

**Status**: Ready for implementation  
**Prerequisites**: Epic 1 & 3 complete  
**Next Epic**: Epic 5 (Training Content)

