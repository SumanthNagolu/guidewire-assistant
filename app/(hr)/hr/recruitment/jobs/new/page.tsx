'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { createClient } from '@/lib/supabase/client';
import { ArrowLeft, Save, Eye, Send, Plus, X } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

export default function NewJobPostingPage() {
  const router = useRouter();
  const supabase = createClient();

  const [loading, setLoading] = useState(false);
  const [currentTab, setCurrentTab] = useState('basic');
  const [departments, setDepartments] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    job_title: '',
    department_id: '',
    location: '',
    employment_type: 'Full-time',
    remote_policy: 'On-site',
    salary_min: '',
    salary_max: '',
    show_salary: false,
    description: '',
    responsibilities: '',
    requirements: '',
    benefits: '',
    experience_level: 'Mid',
    job_category: '',
    positions_available: 1,
    application_deadline: '',
  });

  const [requiredSkills, setRequiredSkills] = useState<string[]>([]);
  const [preferredSkills, setPreferredSkills] = useState<string[]>([]);
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadDepartments();
  }, []);

  const loadDepartments = async () => {
    const { data } = await supabase
      .from('departments')
      .select('*')
      .eq('is_active', true)
      .order('name');
    setDepartments(data || []);
  };

  const addSkill = (type: 'required' | 'preferred') => {
    if (!skillInput.trim()) return;
    
    if (type === 'required') {
      if (!requiredSkills.includes(skillInput.trim())) {
        setRequiredSkills([...requiredSkills, skillInput.trim()]);
      }
    } else {
      if (!preferredSkills.includes(skillInput.trim())) {
        setPreferredSkills([...preferredSkills, skillInput.trim()]);
      }
    }
    setSkillInput('');
  };

  const removeSkill = (skill: string, type: 'required' | 'preferred') => {
    if (type === 'required') {
      setRequiredSkills(requiredSkills.filter(s => s !== skill));
    } else {
      setPreferredSkills(preferredSkills.filter(s => s !== skill));
    }
  };

  const handleSaveDraft = async () => {
    // TC-REC-009
    await handleSubmit('Draft');
  };

  const handlePublish = async () => {
    // TC-REC-010
    await handleSubmit('Active');
  };

  const handleSubmit = async (status: 'Draft' | 'Active') => {
    // Validation
    if (!formData.job_title || !formData.department_id || !formData.description) {
      toast.error('Please fill all required fields (Title, Department, Description)');
      return;
    }

    if (formData.salary_min && formData.salary_max && Number(formData.salary_max) < Number(formData.salary_min)) {
      toast.error('Maximum salary must be greater than minimum salary');
      return;
    }

    setLoading(true);

    try {
      // Generate job number
      const year = new Date().getFullYear();
      const { count } = await supabase
        .from('job_postings')
        .select('*', { count: 'exact', head: true });
      const jobNumber = `JOB-${year}-${String((count || 0) + 1).padStart(3, '0')}`;

      const jobData = {
        job_number: jobNumber,
        job_title: formData.job_title,
        department_id: formData.department_id || null,
        location: formData.location || null,
        employment_type: formData.employment_type,
        remote_policy: formData.remote_policy,
        salary_min: formData.salary_min ? Number(formData.salary_min) : null,
        salary_max: formData.salary_max ? Number(formData.salary_max) : null,
        show_salary: formData.show_salary,
        description: formData.description,
        responsibilities: formData.responsibilities || null,
        requirements: formData.requirements || null,
        required_skills: requiredSkills,
        preferred_skills: preferredSkills,
        benefits: formData.benefits || null,
        experience_level: formData.experience_level,
        job_category: formData.job_category || null,
        positions_available: formData.positions_available || 1,
        application_deadline: formData.application_deadline || null,
        status,
        posted_date: status === 'Active' ? new Date().toISOString() : null,
        is_public: status === 'Active',
      };

      const { data: newJob, error } = await supabase
        .from('job_postings')
        .insert(jobData)
        .select()
        .single();

      if (error) throw error;

      toast.success(status === 'Active' ? 'Job published successfully!' : 'Job saved as draft');
      router.push(`/hr/recruitment/jobs/${newJob.id}`);
    } catch (error) {
      toast.error('Failed to create job posting');
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'basic', name: 'Basic Info' },
    { id: 'description', name: 'Description' },
    { id: 'requirements', name: 'Requirements' },
    { id: 'preview', name: 'Preview' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link href="/hr/recruitment">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Post New Job Opening</h1>
          <p className="text-gray-600 mt-1">Create a new job posting to attract candidates</p>
        </div>
      </div>

      {/* Tab Navigation - TC-REC-004 */}
      <div className="border-b">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                currentTab === tab.id
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.name}
            </button>
          ))}
        </nav>
      </div>

      {/* Form Content */}
      <Card>
        <CardContent className="pt-6">
          {/* BASIC INFO TAB - TC-REC-005 */}
          {currentTab === 'basic' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="job_title">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="job_title"
                  value={formData.job_title}
                  onChange={(e) => setFormData({ ...formData, job_title: e.target.value })}
                  placeholder="e.g., Senior Software Engineer"
                  required
                  className="mt-2"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department">
                    Department <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="department"
                    value={formData.department_id}
                    onChange={(e) => setFormData({ ...formData, department_id: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-2"
                    required
                  >
                    <option value="">Select department</option>
                    {departments.map((dept) => (
                      <option key={dept.id} value={dept.id}>
                        {dept.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="employment_type">
                    Employment Type <span className="text-red-500">*</span>
                  </Label>
                  <select
                    id="employment_type"
                    value={formData.employment_type}
                    onChange={(e) => setFormData({ ...formData, employment_type: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-2"
                  >
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                    <option value="Temporary">Temporary</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    placeholder="e.g., New York, NY"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Remote Policy</Label>
                  <div className="flex space-x-4 mt-2">
                    {['On-site', 'Hybrid', 'Remote'].map((policy) => (
                      <label key={policy} className="flex items-center space-x-2">
                        <input
                          type="radio"
                          name="remote_policy"
                          value={policy}
                          checked={formData.remote_policy === policy}
                          onChange={(e) => setFormData({ ...formData, remote_policy: e.target.value })}
                          className="rounded"
                        />
                        <span className="text-sm">{policy}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="salary_min">Minimum Salary ($)</Label>
                  <Input
                    id="salary_min"
                    type="number"
                    value={formData.salary_min}
                    onChange={(e) => setFormData({ ...formData, salary_min: e.target.value })}
                    placeholder="120000"
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label htmlFor="salary_max">Maximum Salary ($)</Label>
                  <Input
                    id="salary_max"
                    type="number"
                    value={formData.salary_max}
                    onChange={(e) => setFormData({ ...formData, salary_max: e.target.value })}
                    placeholder="150000"
                    className="mt-2"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="show_salary"
                  checked={formData.show_salary}
                  onChange={(e) => setFormData({ ...formData, show_salary: e.target.checked })}
                  className="rounded"
                />
                <Label htmlFor="show_salary" className="font-normal cursor-pointer">
                  Show salary range in job posting
                </Label>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="experience_level">Experience Level</Label>
                  <select
                    id="experience_level"
                    value={formData.experience_level}
                    onChange={(e) => setFormData({ ...formData, experience_level: e.target.value })}
                    className="w-full border rounded-md px-3 py-2 mt-2"
                  >
                    <option value="Entry">Entry Level</option>
                    <option value="Mid">Mid Level</option>
                    <option value="Senior">Senior Level</option>
                    <option value="Lead">Lead/Principal</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div>
                  <Label htmlFor="positions">Positions Available</Label>
                  <Input
                    id="positions"
                    type="number"
                    min="1"
                    value={formData.positions_available}
                    onChange={(e) => setFormData({ ...formData, positions_available: Number(e.target.value) })}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="deadline">Application Deadline</Label>
                <Input
                  id="deadline"
                  type="date"
                  value={formData.application_deadline}
                  onChange={(e) => setFormData({ ...formData, application_deadline: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* DESCRIPTION TAB - TC-REC-006 */}
          {currentTab === 'description' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="description">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Provide a comprehensive description of the role..."
                  rows={8}
                  required
                  className="mt-2"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {formData.description.length} characters
                </p>
              </div>

              <div>
                <Label htmlFor="responsibilities">Key Responsibilities</Label>
                <Textarea
                  id="responsibilities"
                  value={formData.responsibilities}
                  onChange={(e) => setFormData({ ...formData, responsibilities: e.target.value })}
                  placeholder="• Lead development of new features&#10;• Mentor junior developers&#10;• Collaborate with product team"
                  rows={6}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="benefits">Benefits & Perks</Label>
                <Textarea
                  id="benefits"
                  value={formData.benefits}
                  onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
                  placeholder="• Health insurance&#10;• 401(k) matching&#10;• Flexible PTO"
                  rows={5}
                  className="mt-2"
                />
              </div>
            </div>
          )}

          {/* REQUIREMENTS TAB - TC-REC-007 */}
          {currentTab === 'requirements' && (
            <div className="space-y-6">
              <div>
                <Label htmlFor="requirements">Qualifications & Requirements</Label>
                <Textarea
                  id="requirements"
                  value={formData.requirements}
                  onChange={(e) => setFormData({ ...formData, requirements: e.target.value })}
                  placeholder="• Bachelor's degree in Computer Science or related field&#10;• 5+ years of software development experience&#10;• Strong knowledge of React and Node.js"
                  rows={8}
                  className="mt-2"
                />
              </div>

              <div>
                <Label>Required Skills</Label>
                <div className="mt-2 flex items-center space-x-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill('required');
                      }
                    }}
                    placeholder="Type skill and press Enter"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addSkill('required')}
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {requiredSkills.map((skill) => (
                    <Badge key={skill} className="bg-indigo-100 text-indigo-800">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill, 'required')}
                        className="ml-2 hover:text-indigo-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <Label>Preferred Skills (Nice to Have)</Label>
                <div className="mt-2 flex items-center space-x-2">
                  <Input
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addSkill('preferred');
                      }
                    }}
                    placeholder="Type skill and press Enter"
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => addSkill('preferred')}
                  >
                    Add
                  </Button>
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {preferredSkills.map((skill) => (
                    <Badge key={skill} className="bg-gray-100 text-gray-800">
                      {skill}
                      <button
                        onClick={() => removeSkill(skill, 'preferred')}
                        className="ml-2 hover:text-gray-900"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* PREVIEW TAB - TC-REC-008 */}
          {currentTab === 'preview' && (
            <div className="space-y-6">
              <div className="bg-gray-50 border rounded-lg p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{formData.job_title || 'Job Title'}</h2>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mb-4">
                  <span>📍 {formData.location || 'Location not specified'}</span>
                  <span>•</span>
                  <span>{formData.employment_type}</span>
                  <span>•</span>
                  <span>{formData.remote_policy}</span>
                  {formData.show_salary && formData.salary_min && formData.salary_max && (
                    <>
                      <span>•</span>
                      <span className="font-medium text-green-600">
                        ${Number(formData.salary_min).toLocaleString()} - ${Number(formData.salary_max).toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                <div className="prose max-w-none">
                  <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">About the Role</h3>
                  <p className="whitespace-pre-wrap">{formData.description || 'No description provided'}</p>

                  {formData.responsibilities && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Key Responsibilities</h3>
                      <p className="whitespace-pre-wrap">{formData.responsibilities}</p>
                    </>
                  )}

                  {formData.requirements && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Requirements</h3>
                      <p className="whitespace-pre-wrap">{formData.requirements}</p>
                    </>
                  )}

                  {requiredSkills.length > 0 && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Required Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {requiredSkills.map((skill) => (
                          <Badge key={skill} className="bg-indigo-100 text-indigo-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}

                  {preferredSkills.length > 0 && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Preferred Skills</h3>
                      <div className="flex flex-wrap gap-2">
                        {preferredSkills.map((skill) => (
                          <Badge key={skill} className="bg-gray-100 text-gray-800">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                    </>
                  )}

                  {formData.benefits && (
                    <>
                      <h3 className="text-lg font-semibold text-gray-900 mt-6 mb-2">Benefits</h3>
                      <p className="whitespace-pre-wrap">{formData.benefits}</p>
                    </>
                  )}
                </div>

                <div className="mt-8 pt-6 border-t">
                  <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                    Apply for This Position
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-between">
        <Link href="/hr/recruitment">
          <Button variant="outline">
            Cancel
          </Button>
        </Link>
        <div className="flex space-x-3">
          <Button 
            variant="outline" 
            onClick={handleSaveDraft}
            disabled={loading}
          >
            <Save className="h-4 w-4 mr-2" />
            Save as Draft
          </Button>
          <Button
            onClick={handlePublish}
            disabled={loading}
          >
            <Send className="h-4 w-4 mr-2" />
            {loading ? 'Publishing...' : 'Publish Job'}
          </Button>
        </div>
      </div>
    </div>
  );
}

