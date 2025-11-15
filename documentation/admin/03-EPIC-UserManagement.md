# EPIC 3: User Management

**Epic ID**: ADMIN-EPIC-03  
**Epic Name**: User Management & Directory  
**Priority**: P0 (Critical)  
**Estimated Stories**: 18  
**Estimated Effort**: 5-6 days  
**Command**: `/admin-03-user-management`

---

## Epic Overview

### Goal
Complete user directory and management system allowing admins to view all users, update roles, manage access, and perform bulk operations.

### Business Value
- Centralized user administration
- Role assignment and access control
- User activity monitoring
- Bulk user operations for efficiency
- Onboarding status tracking

### Technical Scope
- User directory with search and filtering
- User profile editor
- Role assignment UI
- Bulk operations (invite, role change, deactivate)
- User statistics dashboard
- User activity tracking
- Password reset functionality

### Dependencies
- Epic 1 (Authentication) completed
- `user_profiles` table with all fields
- Permissions for admin to modify users

---

## User Stories

### Story USER-001: User Directory Page Layout

**As a**: Admin  
**I want**: Clean user directory interface  
**So that**: I can easily browse and manage users

#### Acceptance Criteria
- [ ] Page renders at `/admin/users`
- [ ] Page title: "User Directory"
- [ ] Subtitle: "Manage all platform users"
- [ ] [+ Invite User] button top-right
- [ ] 4 stat cards showing user metrics
- [ ] Search and filter section
- [ ] User table or grid view
- [ ] View toggle (grid/list)
- [ ] Proper spacing and layout

#### Technical Implementation

**Files to Create**:
```
app/admin/users/page.tsx
components/admin/users/UserDirectory.tsx
```

**Page Structure**:
```typescript
export default async function UsersPage() {
  const supabase = await createClient();
  
  const { data: users } = await supabase
    .from('user_profiles')
    .select(`
      id,
      email,
      first_name,
      last_name,
      role,
      onboarding_completed,
      created_at,
      last_sign_in_at
    `)
    .order('created_at', { ascending: false });
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Directory</h1>
          <p className="text-gray-500 mt-1">Manage all platform users</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Invite User
        </Button>
      </div>
      
      <UserDirectory initialUsers={users || []} />
    </div>
  );
}
```

#### Testing Checklist
- [ ] Page loads correctly
- [ ] Layout responsive
- [ ] Button renders
- [ ] Data fetches successfully

---

### Story USER-002: User Statistics Cards

**As a**: Admin  
**I want**: Overview statistics about user base  
**So that**: I understand platform usage at a glance

#### Acceptance Criteria
- [ ] 4 cards in grid: Total Users, Admins, Recruiters, Students
- [ ] Each card shows count with icon
- [ ] Cards update when data changes
- [ ] Grid responsive (4 cols desktop, 2 cols tablet, 1 mobile)
- [ ] Icons: Users (total), Shield (admin), Briefcase (recruiter), GraduationCap (student)
- [ ] Matching colors from design system

#### Technical Implementation

**Component**:
```typescript
function UserStatsCards({ users }: { users: UserProfile[] }) {
  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'admin').length,
    recruiters: users.filter(u => u.role === 'recruiter').length,
    students: users.filter(u => u.role === 'student').length,
  };
  
  const cards = [
    { label: 'Total Users', value: stats.total, icon: Users, color: 'text-gray-600' },
    { label: 'Admins', value: stats.admins, icon: Shield, color: 'text-red-600' },
    { label: 'Recruiters', value: stats.recruiters, icon: Briefcase, color: 'text-blue-600' },
    { label: 'Students', value: stats.students, icon: GraduationCap, color: 'text-purple-600' },
  ];
  
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => (
        <Card key={card.label}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-gray-700">
              {card.label}
            </CardTitle>
            <card.icon className={`w-4 h-4 ${card.color}`} />
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-gray-900">{card.value}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### Testing Checklist
- [ ] All cards render
- [ ] Counts accurate
- [ ] Icons display
- [ ] Responsive grid
- [ ] Updates with data

---

### Story USER-003: User Search Functionality

**As a**: Admin  
**I want**: Search users by name or email  
**So that**: I can quickly find specific users

#### Acceptance Criteria
- [ ] Search input with magnifying glass icon
- [ ] Placeholder: "Search users by name or email..."
- [ ] Real-time filtering (no debounce needed)
- [ ] Searches: first_name, last_name, email
- [ ] Case-insensitive search
- [ ] Clear button (X) appears when text entered
- [ ] Shows result count: "Showing X of Y users"
- [ ] No results shows: "No users found matching '{query}'"

#### Technical Implementation

**Component**:
```typescript
function UserSearch({ users, onFilter }: { users: User[]; onFilter: (filtered: User[]) => void }) {
  const [query, setQuery] = useState('');
  
  useEffect(() => {
    if (!query.trim()) {
      onFilter(users);
      return;
    }
    
    const lowerQuery = query.toLowerCase();
    const filtered = users.filter(user => {
      const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
      const email = user.email.toLowerCase();
      
      return fullName.includes(lowerQuery) || email.includes(lowerQuery);
    });
    
    onFilter(filtered);
  }, [query, users]);
  
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
      <Input
        type="text"
        placeholder="Search users by name or email..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="pl-10 pr-10"
      />
      {query && (
        <button
          onClick={() => setQuery('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Search works correctly
- [ ] Searches all fields
- [ ] Case-insensitive
- [ ] Clear button works
- [ ] Result count accurate
- [ ] No results state displays

---

### Story USER-004: Role Filter Dropdown

**As a**: Admin  
**I want**: Filter users by role  
**So that**: I can view specific user groups

#### Acceptance Criteria
- [ ] Dropdown shows all available roles
- [ ] "All Roles" option to clear filter
- [ ] Selected role highlighted with checkmark
- [ ] Filter applies immediately on selection
- [ ] Dropdown closes after selection
- [ ] Can combine with search filter
- [ ] Shows count for each role

#### Technical Implementation

**Component**:
```typescript
function RoleFilter({ onFilter }: { onFilter: (role: string | null) => void }) {
  const [selected, setSelected] = useState<string | null>(null);
  
  const roles = [
    { value: null, label: 'All Roles' },
    { value: 'admin', label: 'Admin' },
    { value: 'recruiter', label: 'Recruiter' },
    { value: 'sales', label: 'Sales' },
    { value: 'account_manager', label: 'Account Manager' },
    { value: 'operations', label: 'Operations' },
    { value: 'employee', label: 'Employee' },
    { value: 'student', label: 'Student' },
  ];
  
  const handleSelect = (value: string | null) => {
    setSelected(value);
    onFilter(value);
  };
  
  return (
    <Select value={selected || 'all'} onValueChange={handleSelect}>
      <SelectTrigger className="w-48">
        <SelectValue placeholder="All Roles" />
      </SelectTrigger>
      <SelectContent>
        {roles.map(role => (
          <SelectItem key={role.value || 'all'} value={role.value || 'all'}>
            {role.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
```

#### Testing Checklist
- [ ] Dropdown opens correctly
- [ ] All roles listed
- [ ] Selection works
- [ ] Filter applies
- [ ] Combines with search

---

### Story USER-005: User Table View

**As a**: Admin  
**I want**: Tabular view of all users with key information  
**So that**: I can scan user data efficiently

#### Acceptance Criteria
- [ ] Table columns: Avatar, Name, Email, Role, Joined, Actions
- [ ] Avatar shows user initials or photo
- [ ] Name shows full name or email if no name
- [ ] Role displayed as colored badge
- [ ] Joined shows formatted date (MMM DD, YYYY)
- [ ] Actions column has Edit button
- [ ] Table headers sortable (future enhancement)
- [ ] Row hover state (gray-50 background)
- [ ] Pagination if > 50 users

#### Technical Implementation

**Component**:
```typescript
function UserTable({ users }: { users: UserProfile[] }) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50 border-b border-gray-200">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              User
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Email
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Role
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Joined
            </th>
            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200">
          {users.map(user => (
            <UserTableRow key={user.id} user={user} />
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Table renders all columns
- [ ] Headers styled correctly
- [ ] Rows display data
- [ ] Hover states work
- [ ] Responsive (scrollable on mobile)

---

### Story USER-006: User Avatar Component

**As a**: Admin  
**I want**: Visual avatars for each user  
**So that**: I can recognize users quickly

#### Acceptance Criteria
- [ ] 40px × 40px circle
- [ ] Gradient background (purple-500 to indigo-500)
- [ ] Shows user initials (first char of first + last name)
- [ ] White text color
- [ ] Centered content
- [ ] Fallback to email initial if no name
- [ ] Consistent across admin portal

#### Technical Implementation

**Component**:
```typescript
function UserAvatar({ user }: { user: UserProfile }) {
  const getInitials = () => {
    if (user.first_name && user.last_name) {
      return `${user.first_name[0]}${user.last_name[0]}`.toUpperCase();
    }
    if (user.email) {
      return user.email[0].toUpperCase();
    }
    return '?';
  };
  
  return (
    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-indigo-500 flex items-center justify-center">
      <span className="text-sm font-medium text-white">
        {getInitials()}
      </span>
    </div>
  );
}
```

#### Testing Checklist
- [ ] Initials calculate correctly
- [ ] Avatar renders as circle
- [ ] Gradient displays
- [ ] Fallback works
- [ ] Size correct

---

### Story USER-007: Role Badge Component

**As a**: Admin  
**I want**: Color-coded role badges  
**So that**: I can identify user roles at a glance

#### Acceptance Criteria
- [ ] Badge displays role name
- [ ] Each role has unique color scheme
- [ ] Admin: Red-100 bg, red-700 text, red-200 border
- [ ] Recruiter: Blue-100 bg, blue-700 text, blue-200 border
- [ ] Sales: Green-100 bg, green-700 text, green-200 border
- [ ] Account Manager: Purple-100 bg, purple-700 text
- [ ] Student: Indigo-100 bg, indigo-700 text
- [ ] Padding: 4px 12px
- [ ] Border radius: 4px
- [ ] Font size: 12px, font-medium

#### Technical Implementation

**Component**:
```typescript
function RoleBadge({ role }: { role: string }) {
  const roleConfig = {
    admin: 'bg-red-100 text-red-700 border-red-200',
    recruiter: 'bg-blue-100 text-blue-700 border-blue-200',
    sales: 'bg-green-100 text-green-700 border-green-200',
    account_manager: 'bg-purple-100 text-purple-700 border-purple-200',
    operations: 'bg-yellow-100 text-yellow-700 border-yellow-200',
    employee: 'bg-gray-100 text-gray-700 border-gray-200',
    student: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  };
  
  const classes = roleConfig[role] || roleConfig.employee;
  const displayRole = role.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded border text-xs font-medium ${classes}`}>
      {displayRole}
    </span>
  );
}
```

#### Testing Checklist
- [ ] All roles have correct colors
- [ ] Badge renders correctly
- [ ] Text formatted properly
- [ ] Border shows

---

### Story USER-008: Edit User Role Dialog

**As a**: Admin  
**I want**: Modal to update user roles  
**So that**: I can change access levels easily

#### Acceptance Criteria
- [ ] Dialog opens on clicking Edit icon
- [ ] Dialog title: "Update User Role"
- [ ] Shows current user info (name, email)
- [ ] Role dropdown with all options
- [ ] Current role pre-selected
- [ ] Warning message about immediate effect
- [ ] [Cancel] and [Update Role] buttons
- [ ] Update disabled if no change
- [ ] Loading state during update
- [ ] Success toast on completion
- [ ] Table refreshes after update

#### Technical Implementation

**Component**:
```typescript
function EditRoleDialog({ user, open, onClose, onSuccess }: EditRoleDialogProps) {
  const [selectedRole, setSelectedRole] = useState(user.role);
  const [isLoading, setIsLoading] = useState(false);
  
  const handleUpdate = async () => {
    if (selectedRole === user.role) return;
    
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: selectedRole })
        .eq('id', user.id);
      
      if (error) throw error;
      
      toast.success('User role updated successfully');
      onSuccess();
      onClose();
    } catch (err) {
      toast.error('Failed to update role');
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update User Role</DialogTitle>
          <DialogDescription>
            Change the role and permissions for this user
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-700">User</label>
            <p className="text-base font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </p>
            <p className="text-sm text-gray-600">{user.email}</p>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-700">New Role</label>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="recruiter">Recruiter</SelectItem>
                <SelectItem value="sales">Sales</SelectItem>
                <SelectItem value="account_manager">Account Manager</SelectItem>
                <SelectItem value="operations">Operations</SelectItem>
                <SelectItem value="employee">Employee</SelectItem>
                <SelectItem value="student">Student</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-gray-600 mt-1">
              {getRoleDescription(selectedRole)}
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 flex gap-2">
            <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
            <p className="text-xs text-yellow-900">
              Changing a user's role will immediately affect their access permissions.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleUpdate} 
            disabled={selectedRole === user.role || isLoading}
          >
            {isLoading ? 'Updating...' : 'Update Role'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Testing Checklist
- [ ] Dialog opens/closes
- [ ] Role selection works
- [ ] Update saves correctly
- [ ] Loading state shows
- [ ] Toast notifications work
- [ ] Validation prevents no-change updates

---

### Story USER-009: User Grid View

**As a**: Admin  
**I want**: Card-based grid view of users  
**So that**: I can see more visual information

#### Acceptance Criteria
- [ ] Grid layout (3-4 columns on desktop)
- [ ] Each card shows avatar, name, email, role
- [ ] Card shows last login timestamp
- [ ] Card shows onboarding status
- [ ] Hover effect on cards
- [ ] Click card to view profile
- [ ] Edit button on card
- [ ] Responsive (1 column mobile, 2 tablet, 3-4 desktop)

#### Technical Implementation

**Component**:
```typescript
function UserGridView({ users }: { users: UserProfile[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {users.map(user => (
        <Card key={user.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-start justify-between mb-3">
              <UserAvatar user={user} />
              <Button size="sm" variant="ghost">
                <Edit2 className="w-4 h-4" />
              </Button>
            </div>
            
            <h3 className="font-medium text-gray-900">
              {user.first_name} {user.last_name}
            </h3>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
            
            <div className="mt-3">
              <RoleBadge role={user.role} />
            </div>
            
            <div className="mt-3 space-y-1 text-xs text-gray-500">
              <p>
                Joined: {format(new Date(user.created_at), 'MMM dd, yyyy')}
              </p>
              {user.last_sign_in_at && (
                <p>
                  Last login: {format(new Date(user.last_sign_in_at), 'MMM dd, yyyy')}
                </p>
              )}
            </div>
            
            {!user.onboarding_completed && (
              <Badge variant="outline" className="mt-2">
                Onboarding Incomplete
              </Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

#### Testing Checklist
- [ ] Grid displays correctly
- [ ] Cards show all info
- [ ] Hover effects work
- [ ] Edit button functional
- [ ] Responsive grid

---

### Story USER-010: View Toggle (Grid/List)

**As a**: Admin  
**I want**: Toggle between grid and list views  
**So that**: I can choose my preferred layout

#### Acceptance Criteria
- [ ] Toggle buttons in top-right of filters section
- [ ] Grid icon for grid view
- [ ] List icon for list view
- [ ] Active view highlighted
- [ ] Click toggles view
- [ ] Preference saved to localStorage
- [ ] Smooth transition between views

#### Technical Implementation

**Component**:
```typescript
function ViewToggle({ view, onViewChange }: { view: 'grid' | 'list'; onViewChange: (view: 'grid' | 'list') => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 p-1">
      <button
        onClick={() => onViewChange('grid')}
        className={`p-2 rounded ${view === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
        aria-label="Grid view"
      >
        <Grid3x3 className="w-4 h-4" />
      </button>
      <button
        onClick={() => onViewChange('list')}
        className={`p-2 rounded ${view === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
        aria-label="List view"
      >
        <List className="w-4 h-4" />
      </button>
    </div>
  );
}

// In parent component
const [view, setView] = useState<'grid' | 'list'>(() => {
  return (localStorage.getItem('userDirectoryView') as 'grid' | 'list') || 'list';
});

const handleViewChange = (newView: 'grid' | 'list') => {
  setView(newView);
  localStorage.setItem('userDirectoryView', newView);
};
```

#### Testing Checklist
- [ ] Toggle works
- [ ] Active state correct
- [ ] Preference persists
- [ ] Icons display
- [ ] Smooth transition

---

### Story USER-011: Bulk User Selection

**As a**: Admin  
**I want**: Select multiple users for bulk operations  
**So that**: I can perform actions efficiently

#### Acceptance Criteria
- [ ] Checkbox in table header selects/deselects all
- [ ] Checkbox in each row selects individual user
- [ ] Selected rows highlighted (blue-50 background)
- [ ] Selection count shown: "X users selected"
- [ ] Bulk actions bar appears when users selected
- [ ] Clear selection button
- [ ] Selection persists during search/filter
- [ ] Deselect all when changing page

#### Technical Implementation

**Component**:
```typescript
function UserTableWithSelection({ users }: { users: UserProfile[] }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  
  const toggleAll = () => {
    if (selectedIds.size === users.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(users.map(u => u.id)));
    }
  };
  
  const toggleUser = (userId: string) => {
    const newSelection = new Set(selectedIds);
    if (newSelection.has(userId)) {
      newSelection.delete(userId);
    } else {
      newSelection.add(userId);
    }
    setSelectedIds(newSelection);
  };
  
  return (
    <>
      {selectedIds.size > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center justify-between">
          <p className="text-sm font-medium text-blue-900">
            {selectedIds.size} user{selectedIds.size !== 1 ? 's' : ''} selected
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => setSelectedIds(new Set())}>
              Clear Selection
            </Button>
            <BulkActionsMenu selectedIds={selectedIds} />
          </div>
        </div>
      )}
      
      <table className="w-full">
        <thead>
          <tr>
            <th className="w-12">
              <input
                type="checkbox"
                checked={selectedIds.size === users.length && users.length > 0}
                onChange={toggleAll}
                className="rounded border-gray-300"
              />
            </th>
            {/* Other headers */}
          </tr>
        </thead>
        <tbody>
          {users.map(user => (
            <tr key={user.id} className={selectedIds.has(user.id) ? 'bg-blue-50' : ''}>
              <td>
                <input
                  type="checkbox"
                  checked={selectedIds.has(user.id)}
                  onChange={() => toggleUser(user.id)}
                />
              </td>
              {/* Other cells */}
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
```

#### Testing Checklist
- [ ] Select all works
- [ ] Individual selection works
- [ ] Selection bar appears
- [ ] Highlighted rows correct
- [ ] Clear selection works

---

### Story USER-012: Bulk Actions Menu

**As a**: Admin  
**I want**: Bulk operations on selected users  
**So that**: I can manage multiple users efficiently

#### Acceptance Criteria
- [ ] Dropdown menu with bulk actions
- [ ] Actions: Change Role, Send Email, Export, Deactivate
- [ ] Confirmation dialog for destructive actions
- [ ] Progress indicator for multi-user operations
- [ ] Success count shown after operation
- [ ] Failed operations reported
- [ ] Actions button disabled if no selection

#### Technical Implementation

**Component**:
```typescript
function BulkActionsMenu({ selectedIds }: { selectedIds: Set<string> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleBulkRoleChange = async (newRole: string) => {
    setIsProcessing(true);
    const supabase = createClient();
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ role: newRole })
        .in('id', Array.from(selectedIds));
      
      if (error) throw error;
      
      toast.success(`Updated ${selectedIds.size} users to ${newRole}`);
      router.refresh();
    } catch (err) {
      toast.error('Failed to update users');
    } finally {
      setIsProcessing(false);
      setIsOpen(false);
    }
  };
  
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button size="sm" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Bulk Actions'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => {/* Show role change dialog */}}>
          <UserCog className="mr-2 h-4 w-4" />
          Change Role
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {/* Show email dialog */}}>
          <Mail className="mr-2 h-4 w-4" />
          Send Email
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => {/* Export users */}}>
          <Download className="mr-2 h-4 w-4" />
          Export Selected
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => {/* Deactivate users */}} className="text-red-600">
          <UserX className="mr-2 h-4 w-4" />
          Deactivate Users
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

#### Testing Checklist
- [ ] Menu opens correctly
- [ ] All actions listed
- [ ] Confirmation dialogs work
- [ ] Operations execute
- [ ] Progress shown
- [ ] Success/error handling

---

### Story USER-013: Invite User Wizard

**As a**: Admin  
**I want**: Step-by-step wizard to invite new users  
**So that**: I can properly onboard team members

#### Acceptance Criteria
- [ ] Multi-step wizard (3 steps)
- [ ] Step 1: Basic Info (email, name, role)
- [ ] Step 2: Permissions & Access
- [ ] Step 3: Review & Send Invitation
- [ ] Progress indicator shows current step
- [ ] Back/Next navigation
- [ ] Final step sends invitation email
- [ ] Email contains magic link for first login
- [ ] Success message confirms invitation sent

#### Technical Implementation

**Component**:
```typescript
function InviteUserWizard({ open, onClose }: WizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    role: 'employee',
  });
  
  const handleSubmit = async () => {
    const supabase = createClient();
    
    // Create user invite
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(
      formData.email,
      {
        data: {
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
        },
        redirectTo: `${window.location.origin}/auth/callback`,
      }
    );
    
    if (error) {
      toast.error('Failed to send invitation');
      return;
    }
    
    toast.success(`Invitation sent to ${formData.email}`);
    onClose();
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Invite New User</DialogTitle>
          <div className="flex gap-2 mt-4">
            {[1, 2, 3].map(s => (
              <div
                key={s}
                className={`h-2 flex-1 rounded-full ${
                  s <= step ? 'bg-blue-600' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>
        </DialogHeader>
        
        {step === 1 && <StepBasicInfo data={formData} onChange={setFormData} />}
        {step === 2 && <StepPermissions data={formData} onChange={setFormData} />}
        {step === 3 && <StepReview data={formData} onSubmit={handleSubmit} />}
        
        <DialogFooter>
          {step > 1 && (
            <Button variant="outline" onClick={() => setStep(s => s - 1)}>
              Back
            </Button>
          )}
          {step < 3 ? (
            <Button onClick={() => setStep(s => s + 1)}>Next</Button>
          ) : (
            <Button onClick={handleSubmit}>Send Invitation</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

#### Testing Checklist
- [ ] Wizard opens correctly
- [ ] Navigation works
- [ ] Progress indicator updates
- [ ] Form validation works
- [ ] Invitation sends
- [ ] Email received

---

### Story USER-014: User Activity Indicators

**As a**: Admin  
**I want**: Visual indicators of user activity  
**So that**: I can see who is actively using the platform

#### Acceptance Criteria
- [ ] Green dot if logged in within 24 hours
- [ ] Yellow dot if logged in within 7 days
- [ ] Gray dot if inactive > 7 days
- [ ] Tooltip shows last login timestamp
- [ ] Indicator positioned on avatar
- [ ] Updates with real data

#### Technical Implementation

**Component**:
```typescript
function UserActivityIndicator({ lastSignIn }: { lastSignIn: string | null }) {
  if (!lastSignIn) {
    return (
      <div className="w-3 h-3 rounded-full bg-gray-400 border-2 border-white" 
           title="Never logged in" />
    );
  }
  
  const hoursSinceLogin = (Date.now() - new Date(lastSignIn).getTime()) / (1000 * 60 * 60);
  
  let color, title;
  if (hoursSinceLogin < 24) {
    color = 'bg-green-500';
    title = 'Active today';
  } else if (hoursSinceLogin < 168) {
    color = 'bg-yellow-500';
    title = 'Active this week';
  } else {
    color = 'bg-gray-400';
    title = `Last seen ${format(new Date(lastSignIn), 'MMM dd')}`;
  }
  
  return (
    <div 
      className={`w-3 h-3 rounded-full ${color} border-2 border-white absolute bottom-0 right-0`}
      title={title}
    />
  );
}

// In UserAvatar
<div className="relative">
  <UserAvatar user={user} />
  <UserActivityIndicator lastSignIn={user.last_sign_in_at} />
</div>
```

#### Testing Checklist
- [ ] Indicator displays correctly
- [ ] Colors based on activity
- [ ] Tooltip works
- [ ] Position correct on avatar

---

### Story USER-015: User Sorting

**As a**: Admin  
**I want**: Sort users by different criteria  
**So that**: I can find users in my preferred order

#### Acceptance Criteria
- [ ] Sort by: Name, Email, Role, Joined Date, Last Login
- [ ] Ascending/descending toggle
- [ ] Sort indicator (arrow) in table header
- [ ] Click header to sort by that column
- [ ] Second click reverses order
- [ ] Sort preference saved
- [ ] Works with search and filters

#### Technical Implementation

**Sorting Logic**:
```typescript
type SortKey = 'name' | 'email' | 'role' | 'created_at' | 'last_sign_in_at';
type SortDirection = 'asc' | 'desc';

function useSorting(users: UserProfile[]) {
  const [sortKey, setSortKey] = useState<SortKey>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  
  const sortedUsers = useMemo(() => {
    return [...users].sort((a, b) => {
      let aVal, bVal;
      
      switch (sortKey) {
        case 'name':
          aVal = `${a.first_name} ${a.last_name}`.toLowerCase();
          bVal = `${b.first_name} ${b.last_name}`.toLowerCase();
          break;
        case 'email':
          aVal = a.email.toLowerCase();
          bVal = b.email.toLowerCase();
          break;
        default:
          aVal = a[sortKey];
          bVal = b[sortKey];
      }
      
      if (aVal < bVal) return sortDirection === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });
  }, [users, sortKey, sortDirection]);
  
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDirection(d => d === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortDirection('asc');
    }
  };
  
  return { sortedUsers, sortKey, sortDirection, handleSort };
}
```

#### Testing Checklist
- [ ] Sorting works for all columns
- [ ] Direction toggles correctly
- [ ] Indicator shows current sort
- [ ] Performance good with many users

---

### Story USER-016: User Export Functionality

**As a**: Admin  
**I want**: Export user list to CSV  
**So that**: I can use data in other tools

#### Acceptance Criteria
- [ ] Export button in actions area
- [ ] Exports all filtered users (respects search/filter)
- [ ] CSV includes: Name, Email, Role, Joined Date, Status
- [ ] Filename includes date: "users-YYYY-MM-DD.csv"
- [ ] Download triggers immediately
- [ ] Progress indicator for large exports
- [ ] Success toast on completion

#### Technical Implementation

**Export Function**:
```typescript
function exportUsersToCSV(users: UserProfile[]) {
  const headers = ['Name', 'Email', 'Role', 'Joined', 'Onboarding Status'];
  
  const rows = users.map(user => [
    `${user.first_name} ${user.last_name}`,
    user.email,
    user.role,
    format(new Date(user.created_at), 'yyyy-MM-dd'),
    user.onboarding_completed ? 'Complete' : 'Pending',
  ]);
  
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(','))
  ].join('\n');
  
  const blob = new Blob([csvContent], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `users-${format(new Date(), 'yyyy-MM-dd')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
  
  toast.success(`Exported ${users.length} users`);
}
```

#### Testing Checklist
- [ ] Export downloads file
- [ ] CSV format correct
- [ ] All data included
- [ ] Filename correct
- [ ] Works with filters

---

### Story USER-017: User Detail View

**As a**: Admin  
**I want**: Detailed user profile view  
**So that**: I can see complete user information

#### Acceptance Criteria
- [ ] Click user row/card opens detail view
- [ ] Shows all profile fields
- [ ] Shows user activity history
- [ ] Shows assigned permissions
- [ ] Shows login history (last 10 logins)
- [ ] Edit button to modify details
- [ ] Resend invitation button (if not activated)
- [ ] Deactivate/Reactivate toggle
- [ ] Back button returns to directory

#### Technical Implementation

**Files to Create**:
```
app/admin/users/[id]/page.tsx
components/admin/users/UserDetailView.tsx
```

**Component Structure**:
```typescript
export default async function UserDetailPage({ params }: { params: { id: string } }) {
  const supabase = await createClient();
  
  const { data: user } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', params.id)
    .single();
  
  if (!user) {
    notFound();
  }
  
  // Fetch additional data
  const { data: activityLog } = await supabase
    .from('user_activity_log')
    .select('*')
    .eq('user_id', params.id)
    .order('created_at', { ascending: false })
    .limit(20);
  
  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link href="/admin/users">← Back to Users</Link>
      </Button>
      
      <UserDetailView user={user} activityLog={activityLog || []} />
    </div>
  );
}
```

#### Testing Checklist
- [ ] Detail page loads
- [ ] All data displays
- [ ] Edit button works
- [ ] Activity log shows
- [ ] Back navigation works

---

### Story USER-018: User Deactivation

**As a**: Admin  
**I want**: Ability to deactivate user accounts  
**So that**: I can revoke access without deleting data

#### Acceptance Criteria
- [ ] Deactivate button in user actions
- [ ] Confirmation dialog before deactivation
- [ ] Deactivation prevents login
- [ ] Deactivated users shown with special badge
- [ ] Reactivate button available
- [ ] Audit log entry created
- [ ] User notified via email (optional)
- [ ] Deactivation reason field

#### Technical Implementation

**Deactivation Logic**:
```typescript
async function deactivateUser(userId: string, reason: string) {
  const supabase = createClient();
  
  const { error } = await supabase
    .from('user_profiles')
    .update({ 
      is_active: false,
      deactivated_at: new Date().toISOString(),
      deactivation_reason: reason,
    })
    .eq('id', userId);
  
  if (error) throw error;
  
  // Create audit log
  await supabase.from('cms_audit_log').insert({
    action: 'deactivate',
    entity_type: 'user',
    entity_id: userId,
    changes: { reason },
  });
  
  // Optionally send email
  // await sendEmail({ ... });
  
  toast.success('User deactivated successfully');
  router.refresh();
}
```

#### Testing Checklist
- [ ] Deactivation works
- [ ] Login prevented
- [ ] Badge shows correctly
- [ ] Reactivation works
- [ ] Audit log created

---

## Epic Completion Criteria

### Functional Requirements
- [ ] All 18 stories implemented
- [ ] User directory fully functional
- [ ] Role management works
- [ ] Bulk operations work
- [ ] Search and filtering operational
- [ ] Export functionality works

### Technical Requirements
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] All tests passing
- [ ] Proper error handling
- [ ] Loading states everywhere

### Quality Gates
- [ ] Accessibility compliant
- [ ] Mobile responsive
- [ ] Performance optimized
- [ ] Security verified
- [ ] Code reviewed

---

**Status**: Ready for implementation  
**Prerequisites**: Epic 1 (Authentication) complete  
**Next Epic**: Epic 4 (Permissions & Audit)

