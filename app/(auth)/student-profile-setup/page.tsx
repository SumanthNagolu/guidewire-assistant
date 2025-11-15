'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { completeStudentProfile } from '@/modules/auth/actions';
import { useRouter } from 'next/navigation';
import { GraduationCap } from 'lucide-react';

const COUNTRIES = [
  { value: 'us', label: 'United States' },
  { value: 'ca', label: 'Canada' },
  { value: 'uk', label: 'United Kingdom' },
  { value: 'au', label: 'Australia' },
  { value: 'in', label: 'India' },
  { value: 'other', label: 'Other' },
];

const US_STATES = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware',
  'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky',
  'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi',
  'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico',
  'New York', 'North Carolina', 'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania',
  'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

const JOB_ROLES = [
  'Developer',
  'Business Analyst',
  'QA/Tester',
  'Implementation Consultant',
  'Technical Architect',
  'Project Manager',
  'Product Manager',
  'System Administrator',
  'Data Analyst',
  'Other'
];

const TECHNOLOGIES = [
  'PolicyCenter',
  'BillingCenter',
  'ClaimCenter',
  'InsuranceSuite',
  'Rating & Underwriting',
  'Configuration',
  'Integration',
  'Cloud Platform',
  'Other'
];

export default function StudentProfileSetupPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [country, setCountry] = useState('');
  const [state, setState] = useState('');
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedTechnologies, setSelectedTechnologies] = useState<string[]>([]);

  const toggleRole = (role: string) => {
    setSelectedRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const toggleTechnology = (tech: string) => {
    setSelectedTechnologies(prev =>
      prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech]
    );
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    
    // Add multi-select values
    formData.set('interestedRoles', JSON.stringify(selectedRoles));
    formData.set('interestedTechnologies', JSON.stringify(selectedTechnologies));

    try {
      const result = await completeStudentProfile(formData);
      
      if (result.success) {
        toast.success('Profile completed! Welcome to the Academy!');
        router.push('/academy');
      } else {
        toast.error(result.error || 'Failed to complete profile');
        setLoading(false);
      }
    } catch (error) {
      toast.error('An unexpected error occurred');
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-3xl">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-indigo-100 rounded-full">
              <GraduationCap className="w-8 h-8 text-indigo-600" />
            </div>
          </div>
          <CardTitle className="text-3xl font-bold">Complete Your Profile</CardTitle>
          <CardDescription className="text-base">
            Help us personalize your learning experience
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* Personal Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Personal Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    placeholder="John"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    placeholder="Doe"
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn Profile</Label>
                  <Input
                    id="linkedin"
                    name="linkedin"
                    type="url"
                    placeholder="https://linkedin.com/in/yourprofile"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Location */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Location</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="country">Country *</Label>
                  <Select value={country} onValueChange={setCountry} required disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select country" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(c => (
                        <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input type="hidden" name="country" value={country} />
                </div>
                {country === 'us' && (
                  <div className="space-y-2">
                    <Label htmlFor="state">State *</Label>
                    <Select value={state} onValueChange={setState} required disabled={loading}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select state" />
                      </SelectTrigger>
                      <SelectContent>
                        {US_STATES.map(s => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input type="hidden" name="state" value={state} />
                  </div>
                )}
                {country && country !== 'us' && (
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      name="state"
                      placeholder="Enter state or province"
                      disabled={loading}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Professional Background */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Professional Background</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentTitle">Current Job Title</Label>
                  <Input
                    id="currentTitle"
                    name="currentTitle"
                    placeholder="e.g., Software Developer"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Current Company</Label>
                  <Input
                    id="company"
                    name="company"
                    placeholder="e.g., Acme Corp"
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                  <Select name="yearsOfExperience" disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0-1">0-1 years</SelectItem>
                      <SelectItem value="2-3">2-3 years</SelectItem>
                      <SelectItem value="4-6">4-6 years</SelectItem>
                      <SelectItem value="7-10">7-10 years</SelectItem>
                      <SelectItem value="10+">10+ years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="education">Highest Education</Label>
                  <Select name="education" disabled={loading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select education level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high-school">High School</SelectItem>
                      <SelectItem value="bachelors">Bachelor's Degree</SelectItem>
                      <SelectItem value="masters">Master's Degree</SelectItem>
                      <SelectItem value="phd">PhD</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Learning Interests */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Learning Interests</h3>
              
              <div className="space-y-4">
                <div>
                  <Label className="text-base">Interested Job Roles *</Label>
                  <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {JOB_ROLES.map(role => (
                      <div key={role} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`role-${role}`}
                          checked={selectedRoles.includes(role)}
                          onChange={() => toggleRole(role)}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          disabled={loading}
                        />
                        <label htmlFor={`role-${role}`} className="text-sm cursor-pointer">
                          {role}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedRoles.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">Please select at least one role</p>
                  )}
                </div>

                <div>
                  <Label className="text-base">Interested Technologies *</Label>
                  <p className="text-sm text-gray-500 mb-3">Select all that apply</p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {TECHNOLOGIES.map(tech => (
                      <div key={tech} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`tech-${tech}`}
                          checked={selectedTechnologies.includes(tech)}
                          onChange={() => toggleTechnology(tech)}
                          className="w-4 h-4 text-indigo-600 rounded border-gray-300 focus:ring-indigo-500"
                          disabled={loading}
                        />
                        <label htmlFor={`tech-${tech}`} className="text-sm cursor-pointer">
                          {tech}
                        </label>
                      </div>
                    ))}
                  </div>
                  {selectedTechnologies.length === 0 && (
                    <p className="text-sm text-red-500 mt-2">Please select at least one technology</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="learningGoals">Learning Goals</Label>
                  <Textarea
                    id="learningGoals"
                    name="learningGoals"
                    placeholder="Tell us about your learning goals and what you hope to achieve..."
                    rows={4}
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter>
            <Button
              type="submit"
              className="w-full"
              disabled={loading || selectedRoles.length === 0 || selectedTechnologies.length === 0}
            >
              {loading ? 'Saving Profile...' : 'Complete Registration'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}

