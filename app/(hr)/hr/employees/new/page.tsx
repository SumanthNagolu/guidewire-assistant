'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Upload, Check } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NewEmployeePage() {
  const router = useRouter();
  const supabase = createClient();
  
  const [currentTab, setCurrentTab] = useState('personal');
  const [loading, setLoading] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [managers, setManagers] = useState<any[]>([]);
  
  // Form data matching the documentation exactly
  const [formData, setFormData] = useState({
    // Personal Information (Step 3 from documentation)
    employee_id: '',
    first_name: '',
    middle_name: '',
    last_name: '',
    date_of_birth: '',
    gender: '',
    marital_status: '',
    nationality: '',
    
    // Employment Information (Step 4 from documentation)
    department_id: '',
    role_id: '',
    designation: '',
    employment_type: 'Full-time',
    employment_status: 'Active',
    hire_date: '',
    confirmation_date: '',
    reporting_manager_id: '',
    work_location: '',
    base_salary: '',
    
    // Contact Information (Step 5 from documentation)
    email: '',
    personal_email: '',
    phone: '',
    alternate_phone: '',
    current_address_street: '',
    current_address_city: '',
    current_address_state: '',
    current_address_zip: '',
    current_address_country: 'USA',
    emergency_contact_name: '',
    emergency_contact_relationship: '',
    emergency_contact_phone: '',
    
    // Documents (Step 6 from documentation)
    documents: [] as File[],
  });

  const [completedTabs, setCompletedTabs] = useState({
    personal: false,
    employment: false,
    contact: false,
    documents: false,
  });

  useEffect(() => {
    loadDepartments();
    loadRoles();
    loadManagers();
    generateEmployeeId();
  }, []);

  const loadDepartments = async () => {
    const { data } = await supabase
      .from('departments')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    if (data) setDepartments(data);
  };

  const loadRoles = async () => {
    const { data } = await supabase
      .from('hr_roles')
      .select('id, name')
      .eq('is_active', true)
      .order('name');
    if (data) setRoles(data);
  };

  const loadManagers = async () => {
    const { data } = await supabase
      .from('employees')
      .select('id, first_name, last_name, employee_id, designation')
      .eq('employment_status', 'Active')
      .order('first_name');
    if (data) setManagers(data);
  };

  const generateEmployeeId = () => {
    // Auto-generate employee ID: EMP-YYYY-NNN
    const year = new Date().getFullYear();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    setFormData(prev => ({ ...prev, employee_id: `EMP-${year}-${random}` }));
  };

  const validatePersonalTab = () => {
    return !!(
      formData.employee_id &&
      formData.first_name &&
      formData.last_name &&
      formData.date_of_birth &&
      formData.gender
    );
  };

  const validateEmploymentTab = () => {
    return !!(
      formData.department_id &&
      formData.role_id &&
      formData.designation &&
      formData.employment_type &&
      formData.hire_date
    );
  };

  const validateContactTab = () => {
    return !!(
      formData.email &&
      formData.phone &&
      formData.current_address_street &&
      formData.current_address_city &&
      formData.emergency_contact_name &&
      formData.emergency_contact_phone
    );
  };

  const handleTabChange = (tab: string) => {
    // Update completion status of current tab
    const updates = { ...completedTabs };
    if (currentTab === 'personal') updates.personal = validatePersonalTab();
    if (currentTab === 'employment') updates.employment = validateEmploymentTab();
    if (currentTab === 'contact') updates.contact = validateContactTab();
    setCompletedTabs(updates);
    setCurrentTab(tab);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final validation
    if (!validatePersonalTab() || !validateEmploymentTab() || !validateContactTab()) {
      toast.error('Please fill all required fields');
      return;
    }

    setLoading(true);

    try {
      // Create employee record
      const employeeData = {
        employee_id: formData.employee_id,
        first_name: formData.first_name,
        middle_name: formData.middle_name || null,
        last_name: formData.last_name,
        email: formData.email,
        personal_email: formData.personal_email || null,
        phone: formData.phone,
        alternate_phone: formData.alternate_phone || null,
        date_of_birth: formData.date_of_birth,
        gender: formData.gender,
        marital_status: formData.marital_status || null,
        nationality: formData.nationality || null,
        
        department_id: formData.department_id,
        role_id: formData.role_id,
        designation: formData.designation,
        employment_type: formData.employment_type,
        employment_status: formData.employment_status,
        hire_date: formData.hire_date,
        confirmation_date: formData.confirmation_date || null,
        reporting_manager_id: formData.reporting_manager_id || null,
        
        current_address: {
          street: formData.current_address_street,
          city: formData.current_address_city,
          state: formData.current_address_state,
          zip: formData.current_address_zip,
          country: formData.current_address_country,
        },
        
        emergency_contact: {
          name: formData.emergency_contact_name,
          relationship: formData.emergency_contact_relationship,
          phone: formData.emergency_contact_phone,
        },
        
        is_active: true,
      };

      const { data: newEmployee, error } = await supabase
        .from('employees')
        .insert(employeeData)
        .select()
        .single();

      if (error) throw error;

      // Initialize leave balances for current year
      const currentYear = new Date().getFullYear();
      const { data: leaveTypes } = await supabase
        .from('leave_types')
        .select('id, code, days_per_year')
        .eq('is_active', true);

      if (leaveTypes) {
        const balances = leaveTypes.map(lt => ({
          employee_id: newEmployee.id,
          leave_type_id: lt.id,
          year: currentYear,
          entitled_days: lt.days_per_year,
          used_days: 0,
          pending_days: 0,
        }));

        await supabase.from('leave_balances').insert(balances);
      }

      toast.success(`Employee ${formData.first_name} ${formData.last_name} created successfully!`);
      router.push('/hr/employees');
      
    } catch (error: any) {
            if (error.message?.includes('duplicate')) {
        toast.error('Employee ID or email already exists');
      } else {
        toast.error('Failed to create employee');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header - Step 1 from documentation */}
      <div className="flex items-center space-x-4">
        <Link href="/hr/employees">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Add New Employee</h1>
          <p className="text-gray-600 mt-1">Create a new employee profile</p>
        </div>
      </div>

      {/* Multi-tab Form - Step 2 from documentation */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card>
              <CardHeader>
                <CardTitle>Employee Information</CardTitle>
                <p className="text-sm text-gray-500 mt-1">
                  Complete all required fields marked with *
                </p>
              </CardHeader>
              <CardContent>
                <Tabs value={currentTab} onValueChange={handleTabChange}>
                  {/* Tab Headers */}
                  <TabsList className="grid w-full grid-cols-5">
                    <TabsTrigger value="personal" className="relative">
                      Personal Info
                      {completedTabs.personal && (
                        <Check className="h-3 w-3 text-green-600 absolute -top-1 -right-1" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="employment" className="relative">
                      Employment
                      {completedTabs.employment && (
                        <Check className="h-3 w-3 text-green-600 absolute -top-1 -right-1" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="contact" className="relative">
                      Contact
                      {completedTabs.contact && (
                        <Check className="h-3 w-3 text-green-600 absolute -top-1 -right-1" />
                      )}
                    </TabsTrigger>
                    <TabsTrigger value="documents">
                      Documents
                    </TabsTrigger>
                    <TabsTrigger value="review">
                      Review
                    </TabsTrigger>
                  </TabsList>

                  {/* Tab 1: Personal Information - Step 3 from documentation */}
                  <TabsContent value="personal" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="col-span-2">
                        <Label htmlFor="employee_id">
                          Employee ID <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="employee_id"
                          value={formData.employee_id}
                          onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                          placeholder="EMP-2024-001"
                          required
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Auto-generated, or enter custom ID
                        </p>
                      </div>

                      <div>
                        <Label htmlFor="first_name">
                          First Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="first_name"
                          value={formData.first_name}
                          onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                          placeholder="John"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="middle_name">Middle Name</Label>
                        <Input
                          id="middle_name"
                          value={formData.middle_name}
                          onChange={(e) => setFormData({ ...formData, middle_name: e.target.value })}
                          placeholder="Michael"
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="last_name">
                          Last Name <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="last_name"
                          value={formData.last_name}
                          onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                          placeholder="Doe"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="date_of_birth">
                          Date of Birth <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="date_of_birth"
                          type="date"
                          value={formData.date_of_birth}
                          onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="gender">
                          Gender <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.gender}
                          onValueChange={(value) => setFormData({ ...formData, gender: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Male">Male</SelectItem>
                            <SelectItem value="Female">Female</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                            <SelectItem value="Prefer not to say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="marital_status">Marital Status</Label>
                        <Select
                          value={formData.marital_status}
                          onValueChange={(value) => setFormData({ ...formData, marital_status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Single">Single</SelectItem>
                            <SelectItem value="Married">Married</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="nationality">Nationality</Label>
                        <Input
                          id="nationality"
                          value={formData.nationality}
                          onChange={(e) => setFormData({ ...formData, nationality: e.target.value })}
                          placeholder="American"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-4">
                      <Button
                        type="button"
                        onClick={() => {
                          if (validatePersonalTab()) {
                            setCompletedTabs({ ...completedTabs, personal: true });
                            setCurrentTab('employment');
                          } else {
                            toast.error('Please fill all required fields');
                          }
                        }}
                      >
                        Next: Employment Info →
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Tab 2: Employment Information - Step 4 from documentation */}
                  <TabsContent value="employment" className="space-y-4 mt-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="department">
                          Department <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.department_id}
                          onValueChange={(value) => setFormData({ ...formData, department_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select department" />
                          </SelectTrigger>
                          <SelectContent>
                            {departments.map((dept) => (
                              <SelectItem key={dept.id} value={dept.id}>
                                {dept.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="role">
                          Role <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.role_id}
                          onValueChange={(value) => setFormData({ ...formData, role_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select role" />
                          </SelectTrigger>
                          <SelectContent>
                            {roles.map((role) => (
                              <SelectItem key={role.id} value={role.id}>
                                {role.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="designation">
                          Designation <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="designation"
                          value={formData.designation}
                          onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                          placeholder="Senior Software Engineer"
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="employment_type">
                          Employment Type <span className="text-red-500">*</span>
                        </Label>
                        <Select
                          value={formData.employment_type}
                          onValueChange={(value) => setFormData({ ...formData, employment_type: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Full-time">Full-time</SelectItem>
                            <SelectItem value="Part-time">Part-time</SelectItem>
                            <SelectItem value="Contract">Contract</SelectItem>
                            <SelectItem value="Intern">Intern</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="employment_status">Employment Status</Label>
                        <Select
                          value={formData.employment_status}
                          onValueChange={(value) => setFormData({ ...formData, employment_status: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Active">Active</SelectItem>
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="On Leave">On Leave</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="hire_date">
                          Hire Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="hire_date"
                          type="date"
                          value={formData.hire_date}
                          onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
                          required
                        />
                      </div>

                      <div>
                        <Label htmlFor="confirmation_date">Confirmation Date</Label>
                        <Input
                          id="confirmation_date"
                          type="date"
                          value={formData.confirmation_date}
                          onChange={(e) => setFormData({ ...formData, confirmation_date: e.target.value })}
                        />
                      </div>

                      <div className="col-span-2">
                        <Label htmlFor="reporting_manager">Reporting Manager</Label>
                        <Select
                          value={formData.reporting_manager_id}
                          onValueChange={(value) => setFormData({ ...formData, reporting_manager_id: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select manager" />
                          </SelectTrigger>
                          <SelectContent>
                            {managers.map((mgr) => (
                              <SelectItem key={mgr.id} value={mgr.id}>
                                {mgr.first_name} {mgr.last_name} ({mgr.employee_id}) - {mgr.designation}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="work_location">Work Location</Label>
                        <Select
                          value={formData.work_location}
                          onValueChange={(value) => setFormData({ ...formData, work_location: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="New York Office">New York Office</SelectItem>
                            <SelectItem value="San Francisco Office">San Francisco Office</SelectItem>
                            <SelectItem value="Remote">Remote</SelectItem>
                            <SelectItem value="Hybrid">Hybrid</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label htmlFor="base_salary">Base Salary (Annual)</Label>
                        <Input
                          id="base_salary"
                          type="number"
                          value={formData.base_salary}
                          onChange={(e) => setFormData({ ...formData, base_salary: e.target.value })}
                          placeholder="95000"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentTab('personal')}
                      >
                        ← Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (validateEmploymentTab()) {
                            setCompletedTabs({ ...completedTabs, employment: true });
                            setCurrentTab('contact');
                          } else {
                            toast.error('Please fill all required employment fields');
                          }
                        }}
                      >
                        Next: Contact Info →
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Tab 3: Contact Information - Step 5 from documentation */}
                  <TabsContent value="contact" className="space-y-4 mt-6">
                    <div className="space-y-6">
                      {/* Work Email */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3">Work Contact</h3>
                        </div>
                        
                        <div className="col-span-2">
                          <Label htmlFor="email">
                            Work Email <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            placeholder="john.doe@intimesolutions.com"
                            required
                          />
                        </div>

                        <div className="col-span-2">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-4">
                            Personal Contact
                          </h3>
                        </div>

                        <div>
                          <Label htmlFor="personal_email">Personal Email</Label>
                          <Input
                            id="personal_email"
                            type="email"
                            value={formData.personal_email}
                            onChange={(e) => setFormData({ ...formData, personal_email: e.target.value })}
                            placeholder="john.m.doe@gmail.com"
                          />
                        </div>

                        <div>
                          <Label htmlFor="phone">
                            Phone <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            placeholder="+1 (555) 123-4567"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="alternate_phone">Alternate Phone</Label>
                          <Input
                            id="alternate_phone"
                            type="tel"
                            value={formData.alternate_phone}
                            onChange={(e) => setFormData({ ...formData, alternate_phone: e.target.value })}
                            placeholder="+1 (555) 987-6543"
                          />
                        </div>

                        <div className="col-span-2">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-4">
                            Current Address
                          </h3>
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor="street">
                            Street <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="street"
                            value={formData.current_address_street}
                            onChange={(e) => setFormData({ ...formData, current_address_street: e.target.value })}
                            placeholder="123 Main Street, Apt 4B"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="city">
                            City <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="city"
                            value={formData.current_address_city}
                            onChange={(e) => setFormData({ ...formData, current_address_city: e.target.value })}
                            placeholder="New York"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="state">State</Label>
                          <Input
                            id="state"
                            value={formData.current_address_state}
                            onChange={(e) => setFormData({ ...formData, current_address_state: e.target.value })}
                            placeholder="NY"
                          />
                        </div>

                        <div>
                          <Label htmlFor="zip">ZIP</Label>
                          <Input
                            id="zip"
                            value={formData.current_address_zip}
                            onChange={(e) => setFormData({ ...formData, current_address_zip: e.target.value })}
                            placeholder="10001"
                          />
                        </div>

                        <div>
                          <Label htmlFor="country">Country</Label>
                          <Input
                            id="country"
                            value={formData.current_address_country}
                            onChange={(e) => setFormData({ ...formData, current_address_country: e.target.value })}
                          />
                        </div>

                        <div className="col-span-2">
                          <h3 className="text-sm font-semibold text-gray-700 mb-3 mt-4">
                            Emergency Contact
                          </h3>
                        </div>

                        <div>
                          <Label htmlFor="emergency_name">
                            Name <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="emergency_name"
                            value={formData.emergency_contact_name}
                            onChange={(e) => setFormData({ ...formData, emergency_contact_name: e.target.value })}
                            placeholder="Jane Doe"
                            required
                          />
                        </div>

                        <div>
                          <Label htmlFor="emergency_relationship">Relationship</Label>
                          <Input
                            id="emergency_relationship"
                            value={formData.emergency_contact_relationship}
                            onChange={(e) => setFormData({ ...formData, emergency_contact_relationship: e.target.value })}
                            placeholder="Spouse"
                          />
                        </div>

                        <div className="col-span-2">
                          <Label htmlFor="emergency_phone">
                            Phone <span className="text-red-500">*</span>
                          </Label>
                          <Input
                            id="emergency_phone"
                            type="tel"
                            value={formData.emergency_contact_phone}
                            onChange={(e) => setFormData({ ...formData, emergency_contact_phone: e.target.value })}
                            placeholder="+1 (555) 234-5678"
                            required
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentTab('employment')}
                      >
                        ← Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          if (validateContactTab()) {
                            setCompletedTabs({ ...completedTabs, contact: true });
                            setCurrentTab('documents');
                          } else {
                            toast.error('Please fill all required contact fields');
                          }
                        }}
                      >
                        Next: Documents →
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Tab 4: Documents - Step 6 from documentation */}
                  <TabsContent value="documents" className="space-y-4 mt-6">
                    <div className="space-y-4">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-indigo-400 transition-colors">
                        <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm text-gray-600 mb-2">
                          Drag and drop files here, or click to browse
                        </p>
                        <input
                          type="file"
                          multiple
                          accept=".pdf,.doc,.docx,.jpg,.png"
                          className="hidden"
                          id="file-upload"
                          onChange={(e) => {
                            if (e.target.files) {
                              setFormData({
                                ...formData,
                                documents: Array.from(e.target.files),
                              });
                            }
                          }}
                        />
                        <label htmlFor="file-upload">
                          <Button type="button" variant="outline" asChild>
                            <span>
                              <Upload className="h-4 w-4 mr-2" />
                              Choose Files
                            </span>
                          </Button>
                        </label>
                        <p className="text-xs text-gray-500 mt-2">
                          Supported: PDF, DOC, DOCX, JPG, PNG (max 10MB each)
                        </p>
                      </div>

                      {formData.documents.length > 0 && (
                        <div className="space-y-2">
                          <h4 className="text-sm font-semibold">Uploaded Documents</h4>
                          {formData.documents.map((file, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="flex items-center space-x-3">
                                <div className="h-10 w-10 bg-indigo-100 rounded flex items-center justify-center">
                                  <Upload className="h-5 w-5 text-indigo-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium">{file.name}</p>
                                  <p className="text-xs text-gray-500">
                                    {(file.size / 1024 / 1024).toFixed(2)} MB
                                  </p>
                                </div>
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setFormData({
                                    ...formData,
                                    documents: formData.documents.filter((_, i) => i !== index),
                                  });
                                }}
                              >
                                Remove
                              </Button>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="bg-blue-50 p-4 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-900 mb-2">
                          Recommended Documents:
                        </h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                          <li>• Resume/CV (Required)</li>
                          <li>• ID Proof (Required)</li>
                          <li>• Education Certificates</li>
                          <li>• Previous Employment Letters</li>
                        </ul>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentTab('contact')}
                      >
                        ← Back
                      </Button>
                      <Button
                        type="button"
                        onClick={() => {
                          setCompletedTabs({ ...completedTabs, documents: true });
                          setCurrentTab('review');
                        }}
                      >
                        Next: Review →
                      </Button>
                    </div>
                  </TabsContent>

                  {/* Tab 5: Review & Submit - Step 7 from documentation */}
                  <TabsContent value="review" className="space-y-4 mt-6">
                    <div className="space-y-6">
                      {/* Personal Info Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold flex items-center">
                            {completedTabs.personal ? (
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <span className="h-4 w-4 mr-2">⚠️</span>
                            )}
                            Personal Information
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentTab('personal')}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Name:</span>{' '}
                            <span className="font-medium">
                              {formData.first_name} {formData.middle_name} {formData.last_name}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Employee ID:</span>{' '}
                            <span className="font-medium">{formData.employee_id}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Date of Birth:</span>{' '}
                            <span className="font-medium">{formData.date_of_birth}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Gender:</span>{' '}
                            <span className="font-medium">{formData.gender}</span>
                          </div>
                        </div>
                      </div>

                      {/* Employment Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold flex items-center">
                            {completedTabs.employment ? (
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <span className="h-4 w-4 mr-2">⚠️</span>
                            )}
                            Employment Details
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentTab('employment')}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Department:</span>{' '}
                            <span className="font-medium">
                              {departments.find(d => d.id === formData.department_id)?.name || 'Not selected'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Role:</span>{' '}
                            <span className="font-medium">
                              {roles.find(r => r.id === formData.role_id)?.name || 'Not selected'}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-600">Designation:</span>{' '}
                            <span className="font-medium">{formData.designation}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Type:</span>{' '}
                            <span className="font-medium">{formData.employment_type}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Hire Date:</span>{' '}
                            <span className="font-medium">{formData.hire_date}</span>
                          </div>
                        </div>
                      </div>

                      {/* Contact Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold flex items-center">
                            {completedTabs.contact ? (
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <span className="h-4 w-4 mr-2">⚠️</span>
                            )}
                            Contact Information
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentTab('contact')}
                          >
                            Edit
                          </Button>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-600">Email:</span>{' '}
                            <span className="font-medium">{formData.email}</span>
                          </div>
                          <div>
                            <span className="text-gray-600">Phone:</span>{' '}
                            <span className="font-medium">{formData.phone}</span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Address:</span>{' '}
                            <span className="font-medium">
                              {formData.current_address_street}, {formData.current_address_city}
                            </span>
                          </div>
                          <div className="col-span-2">
                            <span className="text-gray-600">Emergency Contact:</span>{' '}
                            <span className="font-medium">
                              {formData.emergency_contact_name} ({formData.emergency_contact_relationship}) - {formData.emergency_contact_phone}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Documents Summary */}
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="font-semibold flex items-center">
                            {formData.documents.length > 0 ? (
                              <Check className="h-4 w-4 text-green-600 mr-2" />
                            ) : (
                              <span className="h-4 w-4 mr-2">📎</span>
                            )}
                            Documents Uploaded
                          </h3>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => setCurrentTab('documents')}
                          >
                            Edit
                          </Button>
                        </div>
                        <p className="text-sm">
                          {formData.documents.length} file(s) uploaded
                        </p>
                      </div>

                      {/* Confirmation Checkbox */}
                      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                        <div className="flex items-start space-x-3">
                          <input
                            type="checkbox"
                            id="confirm"
                            className="mt-1 rounded"
                            required
                          />
                          <Label htmlFor="confirm" className="font-normal text-sm cursor-pointer">
                            I confirm that all information provided is accurate and I have verified 
                            all details before submission.
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between pt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setCurrentTab('documents')}
                      >
                        ← Back
                      </Button>
                      <Button
                        type="submit"
                        disabled={loading || !completedTabs.personal || !completedTabs.employment || !completedTabs.contact}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? 'Creating Employee...' : 'Create Employee'}
                      </Button>
                    </div>
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Progress Sidebar - Shows completion */}
        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="text-sm">Progress</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${completedTabs.personal ? 'bg-green-600' : 'bg-gray-300'}`} />
                <span className="text-sm">Personal Information</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${completedTabs.employment ? 'bg-green-600' : 'bg-gray-300'}`} />
                <span className="text-sm">Employment Details</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${completedTabs.contact ? 'bg-green-600' : 'bg-gray-300'}`} />
                <span className="text-sm">Contact Information</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className={`h-2 w-2 rounded-full ${completedTabs.documents ? 'bg-green-600' : 'bg-gray-300'}`} />
                <span className="text-sm">Documents</span>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle className="text-sm">Tips</CardTitle>
            </CardHeader>
            <CardContent className="text-xs text-gray-600 space-y-2">
              <p>• Employee ID is auto-generated but can be customized</p>
              <p>• Work email must use company domain</p>
              <p>• All required fields marked with *</p>
              <p>• You can navigate between tabs anytime</p>
              <p>• Upload documents in PDF format for best compatibility</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

