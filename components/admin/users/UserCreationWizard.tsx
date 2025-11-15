'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, Check, UserPlus } from 'lucide-react';
import { createInternalUser } from '@/modules/admin/actions/user-management';
import { useRouter } from 'next/navigation';

type Team = {
  id: string;
  name: string;
  region?: string;
  department?: string;
};

type RoleTemplate = {
  id: string;
  role_name: string;
  display_name: string;
  description?: string;
};

type PotentialManager = {
  id: string;
  full_name: string;
  email: string;
  role: string;
};

type Props = {
  teams: Team[];
  roleTemplates: RoleTemplate[];
  potentialManagers: PotentialManager[];
};

type FormData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  role: string;
  teamId: string;
  region: string;
  stream: string;
  location: string;
  jobTitle: string;
  employmentType: string;
  startDate: string;
  reportingTo: string;
  costCenter: string;
  groupName: string;
  sendWelcomeEmail: boolean;
};

const STEPS = [
  { number: 1, title: 'Basic Information', description: 'User details and contact info' },
  { number: 2, title: 'Role & Permissions', description: 'Assign role and access rights' },
  { number: 3, title: 'Organizational Details', description: 'Team, region, and reporting' },
  { number: 4, title: 'Review & Create', description: 'Confirm and create user' },
];

const REGIONS = [
  { value: 'north-america', label: 'North America' },
  { value: 'europe', label: 'Europe' },
  { value: 'asia-pacific', label: 'Asia Pacific' },
  { value: 'latin-america', label: 'Latin America' },
  { value: 'middle-east', label: 'Middle East' },
  { value: 'global', label: 'Global' },
];

const STREAMS = [
  { value: 'insurance', label: 'Insurance' },
  { value: 'healthcare', label: 'Healthcare' },
  { value: 'financial-services', label: 'Financial Services' },
  { value: 'technology', label: 'Technology' },
  { value: 'general', label: 'General' },
];

const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full-time' },
  { value: 'part-time', label: 'Part-time' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'intern', label: 'Intern' },
];

export default function UserCreationWizard({ teams, roleTemplates, potentialManagers }: Props) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: '',
    teamId: '',
    region: '',
    stream: '',
    location: '',
    jobTitle: '',
    employmentType: 'full-time',
    startDate: new Date().toISOString().split('T')[0],
    reportingTo: '',
    costCenter: '',
    groupName: '',
    sendWelcomeEmail: true,
  });

  const updateFormData = (field: keyof FormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.firstName || !formData.lastName || !formData.email) {
          toast.error('Please fill in all required fields');
          return false;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
          toast.error('Please enter a valid email address');
          return false;
        }
        return true;
      case 2:
        if (!formData.role) {
          toast.error('Please select a role');
          return false;
        }
        return true;
      case 3:
        // Organizational details are optional
        return true;
      default:
        return true;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, 4));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setLoading(true);
    try {
      const result = await createInternalUser(formData);
      
      if (result.success) {
        toast.success('User created successfully!');
        router.push('/admin/users');
      } else {
        toast.error(result.error || 'Failed to create user');
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => (
            <div key={step.number} className="flex items-center flex-1">
              <div className="flex flex-col items-center flex-1">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-medium
                    ${
                      currentStep > step.number
                        ? 'bg-green-500 text-white'
                        : currentStep === step.number
                        ? 'bg-indigo-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }
                  `}
                >
                  {currentStep > step.number ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    step.number
                  )}
                </div>
                <div className="text-center mt-2">
                  <p className={`text-sm font-medium ${currentStep >= step.number ? 'text-gray-900' : 'text-gray-500'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">{step.description}</p>
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={`h-1 flex-1 mx-4 ${
                    currentStep > step.number ? 'bg-green-500' : 'bg-gray-200'
                  }`}
                />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <Card>
        <CardHeader>
          <CardTitle>{STEPS[currentStep - 1].title}</CardTitle>
          <CardDescription>{STEPS[currentStep - 1].description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    First Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="firstName"
                    value={formData.firstName}
                    onChange={(e) => updateFormData('firstName', e.target.value)}
                    placeholder="John"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    Last Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="lastName"
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  Email <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => updateFormData('email', e.target.value)}
                  placeholder="john.doe@intimesolutions.com"
                />
                <p className="text-xs text-gray-500">
                  A temporary password will be generated and sent to this email
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone (Optional)</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => updateFormData('phone', e.target.value)}
                  placeholder="+1 (555) 000-0000"
                />
              </div>
            </div>
          )}

          {/* Step 2: Role & Permissions */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="role">
                  Role <span className="text-red-500">*</span>
                </Label>
                <Select value={formData.role} onValueChange={(value) => updateFormData('role', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roleTemplates
                      .filter((rt) => !['student', 'candidate', 'client'].includes(rt.role_name))
                      .map((template) => (
                        <SelectItem key={template.id} value={template.role_name}>
                          <div>
                            <div className="font-medium">{template.display_name}</div>
                            {template.description && (
                              <div className="text-xs text-gray-500">{template.description}</div>
                            )}
                          </div>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2">Role Permissions</h4>
                <p className="text-sm text-gray-600">
                  This user will receive all permissions associated with the selected role. You can customize
                  individual permissions after creating the user.
                </p>
              </div>
            </div>
          )}

          {/* Step 3: Organizational Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="jobTitle">Job Title</Label>
                  <Input
                    id="jobTitle"
                    value={formData.jobTitle}
                    onChange={(e) => updateFormData('jobTitle', e.target.value)}
                    placeholder="Senior Recruiter"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="employmentType">Employment Type</Label>
                  <Select
                    value={formData.employmentType}
                    onValueChange={(value) => updateFormData('employmentType', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {EMPLOYMENT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="teamId">Team</Label>
                  <Select value={formData.teamId} onValueChange={(value) => updateFormData('teamId', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select team" />
                    </SelectTrigger>
                    <SelectContent>
                      {teams.map((team) => (
                        <SelectItem key={team.id} value={team.id}>
                          {team.name}
                          {team.department && ` (${team.department})`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="region">Region</Label>
                  <Select value={formData.region} onValueChange={(value) => updateFormData('region', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select region" />
                    </SelectTrigger>
                    <SelectContent>
                      {REGIONS.map((region) => (
                        <SelectItem key={region.value} value={region.value}>
                          {region.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="stream">Stream/Vertical</Label>
                  <Select value={formData.stream} onValueChange={(value) => updateFormData('stream', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stream" />
                    </SelectTrigger>
                    <SelectContent>
                      {STREAMS.map((stream) => (
                        <SelectItem key={stream.value} value={stream.value}>
                          {stream.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Office Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => updateFormData('location', e.target.value)}
                    placeholder="New York, NY"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="reportingTo">Reports To</Label>
                  <Select
                    value={formData.reportingTo}
                    onValueChange={(value) => updateFormData('reportingTo', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select manager" />
                    </SelectTrigger>
                    <SelectContent>
                      {potentialManagers
                        .filter((m) => ['admin', 'manager'].includes(m.role) || m.role.includes('manager'))
                        .map((manager) => (
                          <SelectItem key={manager.id} value={manager.id}>
                            {manager.full_name} ({manager.email})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Start Date</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => updateFormData('startDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="groupName">Group/Pod Name</Label>
                  <Input
                    id="groupName"
                    value={formData.groupName}
                    onChange={(e) => updateFormData('groupName', e.target.value)}
                    placeholder="e.g., Sales Team A"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="costCenter">Cost Center</Label>
                  <Input
                    id="costCenter"
                    value={formData.costCenter}
                    onChange={(e) => updateFormData('costCenter', e.target.value)}
                    placeholder="CC-1234"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review & Create */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-3">Basic Information</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Name:</span>{' '}
                      <span className="text-sm">{formData.firstName} {formData.lastName}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium">Email:</span>{' '}
                      <span className="text-sm">{formData.email}</span>
                    </div>
                    {formData.phone && (
                      <div>
                        <span className="text-sm font-medium">Phone:</span>{' '}
                        <span className="text-sm">{formData.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm text-gray-500 mb-3">Role & Permissions</h3>
                  <div className="space-y-2">
                    <div>
                      <span className="text-sm font-medium">Role:</span>{' '}
                      <span className="text-sm capitalize">{formData.role.replace('_', ' ')}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="border-t pt-6">
                <h3 className="font-medium text-sm text-gray-500 mb-3">Organizational Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  {formData.jobTitle && (
                    <div>
                      <span className="text-sm font-medium">Job Title:</span>{' '}
                      <span className="text-sm">{formData.jobTitle}</span>
                    </div>
                  )}
                  {formData.employmentType && (
                    <div>
                      <span className="text-sm font-medium">Employment Type:</span>{' '}
                      <span className="text-sm capitalize">{formData.employmentType.replace('-', ' ')}</span>
                    </div>
                  )}
                  {formData.teamId && (
                    <div>
                      <span className="text-sm font-medium">Team:</span>{' '}
                      <span className="text-sm">
                        {teams.find((t) => t.id === formData.teamId)?.name || formData.teamId}
                      </span>
                    </div>
                  )}
                  {formData.region && (
                    <div>
                      <span className="text-sm font-medium">Region:</span>{' '}
                      <span className="text-sm capitalize">{formData.region.replace('-', ' ')}</span>
                    </div>
                  )}
                  {formData.stream && (
                    <div>
                      <span className="text-sm font-medium">Stream:</span>{' '}
                      <span className="text-sm capitalize">{formData.stream.replace('-', ' ')}</span>
                    </div>
                  )}
                  {formData.location && (
                    <div>
                      <span className="text-sm font-medium">Location:</span>{' '}
                      <span className="text-sm">{formData.location}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-6">
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="sendWelcomeEmail"
                    checked={formData.sendWelcomeEmail}
                    onCheckedChange={(checked) =>
                      updateFormData('sendWelcomeEmail', checked as boolean)
                    }
                  />
                  <div className="space-y-1">
                    <Label
                      htmlFor="sendWelcomeEmail"
                      className="text-sm font-medium cursor-pointer"
                    >
                      Send welcome email
                    </Label>
                    <p className="text-sm text-gray-500">
                      User will receive an email with login instructions and a password reset link
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between pt-6 border-t">
            <Button
              variant="outline"
              onClick={handleBack}
              disabled={currentStep === 1 || loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            {currentStep < 4 ? (
              <Button onClick={handleNext}>
                Next
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={loading}>
                <UserPlus className="w-4 h-4 mr-2" />
                {loading ? 'Creating User...' : 'Create User'}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

