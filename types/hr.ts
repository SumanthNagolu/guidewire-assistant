// HR System Type Definitions

export interface Department {
  id: string;
  name: string;
  code: string;
  parent_id?: string;
  manager_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HRRole {
  id: string;
  name: string;
  code: string;
  description?: string;
  permissions: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Employee {
  id: string;
  user_id: string;
  employee_id: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  email: string;
  personal_email?: string;
  phone?: string;
  alternate_phone?: string;
  date_of_birth?: string;
  gender?: string;
  marital_status?: string;
  nationality?: string;
  
  // Employment Details
  department_id?: string;
  department?: Department;
  role_id?: string;
  hr_roles?: HRRole;
  designation?: string;
  employment_type?: 'Full-time' | 'Part-time' | 'Contract' | 'Intern';
  employment_status?: 'Active' | 'On Leave' | 'Terminated';
  hire_date: string;
  confirmation_date?: string;
  termination_date?: string;
  reporting_manager_id?: string;
  reporting_manager?: Employee;
  
  // Address
  current_address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  permanent_address?: {
    street?: string;
    city?: string;
    state?: string;
    country?: string;
    postal_code?: string;
  };
  
  // Emergency Contact
  emergency_contact?: {
    name?: string;
    relationship?: string;
    phone?: string;
    email?: string;
  };
  
  // Documents
  profile_photo_url?: string;
  documents?: Array<{
    type: string;
    url: string;
    uploaded_at: string;
  }>;
  
  // Metadata
  custom_fields?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
}

export interface WorkShift {
  id: string;
  name: string;
  code: string;
  start_time: string;
  end_time: string;
  break_duration: number;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Timesheet {
  id: string;
  employee_id: string;
  employee?: Employee;
  date: string;
  shift_id?: string;
  shift?: WorkShift;
  clock_in?: string;
  clock_out?: string;
  break_duration: number;
  total_hours?: number;
  overtime_hours?: number;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
  notes?: string;
  approved_by?: string;
  approver?: Employee;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface LeaveType {
  id: string;
  name: string;
  code: string;
  days_per_year: number;
  carryover_allowed: boolean;
  max_carryover_days: number;
  requires_approval: boolean;
  requires_document: boolean;
  min_notice_days: number;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface LeaveBalance {
  id: string;
  employee_id: string;
  employee?: Employee;
  leave_type_id: string;
  leave_type?: LeaveType;
  year: number;
  entitled_days: number;
  used_days: number;
  pending_days: number;
  balance_days: number;
  created_at: string;
  updated_at: string;
}

export interface LeaveRequest {
  id: string;
  employee_id: string;
  employee?: Employee;
  leave_type_id: string;
  leave_type?: LeaveType;
  from_date: string;
  to_date: string;
  total_days: number;
  reason?: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Cancelled';
  documents?: Array<{
    name: string;
    url: string;
    uploaded_at: string;
  }>;
  approved_by?: string;
  approver?: Employee;
  approved_at?: string;
  rejection_reason?: string;
  created_at: string;
  updated_at: string;
}

export interface ExpenseCategory {
  id: string;
  name: string;
  code: string;
  description?: string;
  requires_receipt: boolean;
  max_amount?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExpenseClaim {
  id: string;
  employee_id: string;
  employee?: Employee;
  claim_number: string;
  claim_date: string;
  total_amount: number;
  currency: string;
  description?: string;
  status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected' | 'Paid';
  approved_by?: string;
  approver?: Employee;
  approved_at?: string;
  rejection_reason?: string;
  paid_at?: string;
  payment_reference?: string;
  created_at: string;
  updated_at: string;
  expense_items?: ExpenseItem[];
}

export interface ExpenseItem {
  id: string;
  expense_claim_id: string;
  expense_category_id?: string;
  expense_category?: ExpenseCategory;
  expense_date: string;
  amount: number;
  description?: string;
  receipt_url?: string;
  receipt_data?: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface WorkflowTemplate {
  id: string;
  name: string;
  type: 'Leave' | 'Expense' | 'Timesheet' | 'Document';
  steps: Array<{
    step: number;
    name: string;
    approver_role?: string;
    approver_id?: string;
    conditions?: Record<string, any>;
  }>;
  conditions?: Record<string, any>;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  code: string;
  type: 'Letter' | 'Certificate' | 'Report';
  template_content: string;
  variables: string[];
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HRNotification {
  id: string;
  recipient_id: string;
  recipient?: Employee;
  type: 'Email' | 'SMS' | 'In-app';
  subject?: string;
  message: string;
  data?: Record<string, any>;
  is_read: boolean;
  read_at?: string;
  created_at: string;
}

export interface AuditLog {
  id: string;
  user_id: string;
  action: string;
  entity_type?: string;
  entity_id?: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

// Permission types for role-based access
export interface Permissions {
  // Module level permissions
  employees?: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    delete?: boolean;
  };
  timesheets?: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    approve?: boolean;
  };
  leaves?: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    approve?: boolean;
  };
  expenses?: {
    view?: boolean;
    create?: boolean;
    edit?: boolean;
    approve?: boolean;
  };
  reports?: {
    view?: boolean;
    export?: boolean;
  };
  settings?: {
    view?: boolean;
    edit?: boolean;
  };
  // Global permissions
  all?: boolean;
  hr?: boolean;
  team?: boolean;
  self?: boolean;
}


