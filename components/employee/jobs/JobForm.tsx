'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Plus, X } from 'lucide-react';

interface JobFormProps {
  userId: string;
  clients: Array<{ id: string; name: string }>;
  job?: any;
}

export default function JobForm({ userId, clients, job }: JobFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [title, setTitle] = useState(job?.title || '');
  const [description, setDescription] = useState(job?.description || '');
  const [clientId, setClientId] = useState(job?.client_id || '');
  const [location, setLocation] = useState(job?.location || '');
  const [remotePolicy, setRemotePolicy] = useState(job?.remote_policy || 'hybrid');
  const [employmentType, setEmploymentType] = useState(job?.employment_type || 'contract');
  const [durationMonths, setDurationMonths] = useState(job?.duration_months || '');
  const [rateType, setRateType] = useState(job?.rate_type || 'hourly');
  const [rateMin, setRateMin] = useState(job?.rate_min || '');
  const [rateMax, setRateMax] = useState(job?.rate_max || '');
  const [openings, setOpenings] = useState(job?.openings || '1');
  const [priority, setPriority] = useState(job?.priority || 'warm');
  const [status, setStatus] = useState(job?.status || 'draft');
  const [requiredSkills, setRequiredSkills] = useState<string[]>(job?.required_skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>(job?.nice_to_have_skills || []);
  const [niceSkillInput, setNiceSkillInput] = useState('');
  const [targetFillDate, setTargetFillDate] = useState(
    job?.target_fill_date ? new Date(job.target_fill_date).toISOString().split('T')[0] : ''
  );
  const [notes, setNotes] = useState(job?.notes || '');

  const handleAddRequiredSkill = () => {
    if (skillInput.trim() && !requiredSkills.includes(skillInput.trim())) {
      setRequiredSkills([...requiredSkills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill));
  };

  const handleAddNiceSkill = () => {
    if (niceSkillInput.trim() && !niceToHaveSkills.includes(niceSkillInput.trim())) {
      setNiceToHaveSkills([...niceToHaveSkills, niceSkillInput.trim()]);
      setNiceSkillInput('');
    }
  };

  const handleRemoveNiceSkill = (skill: string) => {
    setNiceToHaveSkills(niceToHaveSkills.filter(s => s !== skill));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const jobData = {
        title,
        description: description || null,
        client_id: clientId || null,
        location: location || null,
        remote_policy: remotePolicy,
        employment_type: employmentType,
        duration_months: durationMonths ? parseInt(durationMonths) : null,
        rate_type: rateType,
        rate_min: rateMin ? parseInt(rateMin) : null,
        rate_max: rateMax ? parseInt(rateMax) : null,
        openings: parseInt(openings),
        filled: job?.filled || 0,
        priority,
        status,
        required_skills: requiredSkills,
        nice_to_have_skills: niceToHaveSkills,
        target_fill_date: targetFillDate || null,
        notes: notes || null,
        owner_id: userId,
        posted_date: status === 'open' && !job ? new Date().toISOString() : job?.posted_date,
      };

      if (job) {
        // Update existing job
        const { error: updateError } = await supabase
          .from('jobs')
          .update(jobData)
          .eq('id', job.id);

        if (updateError) throw updateError;
        
        setSuccess(true);
        setTimeout(() => {
          router.push(`/employee/jobs/${job.id}`);
        }, 1500);
      } else {
        // Create new job
        const { error: insertError } = await supabase
          .from('jobs')
          .insert([jobData]);

        if (insertError) throw insertError;

        setSuccess(true);
        setTimeout(() => {
          router.push('/employee/jobs');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error saving job:', err);
      setError(err.message || 'Failed to save job. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-success-green-50 border-success-green-200">
        <AlertDescription className="text-success-green-700">
          ✓ Job {job ? 'updated' : 'created'} successfully! Redirecting...
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Basic Information
        </h3>
        <div className="space-y-6">
          <div>
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              disabled={loading}
              className="mt-1"
              placeholder="e.g. Senior Guidewire Developer"
            />
          </div>

          <div>
            <Label htmlFor="description">Job Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={loading}
              className="mt-1"
              rows={6}
              placeholder="Full job description, responsibilities, qualifications..."
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="clientId">Client</Label>
              <select
                id="clientId"
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                disabled={loading}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
              >
                <option value="">Select a client</option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <Label htmlFor="status">Status *</Label>
              <select
                id="status"
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                required
                disabled={loading}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
              >
                <option value="draft">Draft</option>
                <option value="open">Open</option>
                <option value="on_hold">On Hold</option>
                <option value="filled">Filled</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Location & Work Setup */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Location & Work Setup
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              disabled={loading}
              className="mt-1"
              placeholder="City, State"
            />
          </div>

          <div>
            <Label htmlFor="remotePolicy">Remote Policy *</Label>
            <select
              id="remotePolicy"
              value={remotePolicy}
              onChange={(e) => setRemotePolicy(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
          </div>
        </div>
      </div>

      {/* Employment Details */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Employment Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="employmentType">Employment Type *</Label>
            <select
              id="employmentType"
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="contract">Contract</option>
              <option value="contract_to_hire">Contract-to-Hire</option>
              <option value="direct_placement">Direct Placement</option>
              <option value="temporary">Temporary</option>
            </select>
          </div>

          <div>
            <Label htmlFor="durationMonths">Duration (Months)</Label>
            <Input
              id="durationMonths"
              type="number"
              value={durationMonths}
              onChange={(e) => setDurationMonths(e.target.value)}
              disabled={loading}
              className="mt-1"
              min="1"
              placeholder="e.g. 12"
            />
          </div>

          <div>
            <Label htmlFor="rateType">Rate Type *</Label>
            <select
              id="rateType"
              value={rateType}
              onChange={(e) => setRateType(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="hourly">Hourly</option>
              <option value="annual">Annual</option>
            </select>
          </div>

          <div>
            <Label htmlFor="openings">Number of Openings *</Label>
            <Input
              id="openings"
              type="number"
              value={openings}
              onChange={(e) => setOpenings(e.target.value)}
              required
              disabled={loading}
              className="mt-1"
              min="1"
            />
          </div>

          <div>
            <Label htmlFor="rateMin">Rate Min ($)</Label>
            <Input
              id="rateMin"
              type="number"
              value={rateMin}
              onChange={(e) => setRateMin(e.target.value)}
              disabled={loading}
              className="mt-1"
              min="0"
            />
          </div>

          <div>
            <Label htmlFor="rateMax">Rate Max ($)</Label>
            <Input
              id="rateMax"
              type="number"
              value={rateMax}
              onChange={(e) => setRateMax(e.target.value)}
              disabled={loading}
              className="mt-1"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Priority & Timeline */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Priority & Timeline
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="priority">Priority *</Label>
            <select
              id="priority"
              value={priority}
              onChange={(e) => setPriority(e.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="hot">🔥 Hot</option>
              <option value="warm">Warm</option>
              <option value="cold">Cold</option>
            </select>
          </div>

          <div>
            <Label htmlFor="targetFillDate">Target Fill Date</Label>
            <Input
              id="targetFillDate"
              type="date"
              value={targetFillDate}
              onChange={(e) => setTargetFillDate(e.target.value)}
              disabled={loading}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Skills */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Required Skills
        </h3>
        <div className="flex gap-2 mt-1">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequiredSkill())}
            disabled={loading}
            placeholder="Type a skill and press Enter"
          />
          <Button
            type="button"
            onClick={handleAddRequiredSkill}
            disabled={loading || !skillInput.trim()}
            variant="outline"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {requiredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {requiredSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-sky-blue-50 text-sky-blue-700 text-sm rounded-full border border-sky-blue-200 flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveRequiredSkill(skill)}
                  className="hover:text-sky-blue-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}

        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4 mt-6">
          Nice-to-Have Skills
        </h3>
        <div className="flex gap-2 mt-1">
          <Input
            value={niceSkillInput}
            onChange={(e) => setNiceSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddNiceSkill())}
            disabled={loading}
            placeholder="Type a skill and press Enter"
          />
          <Button
            type="button"
            onClick={handleAddNiceSkill}
            disabled={loading || !niceSkillInput.trim()}
            variant="outline"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {niceToHaveSkills.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-3">
            {niceToHaveSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-wisdom-gray-50 text-wisdom-gray-700 text-sm rounded-full border border-wisdom-gray-200 flex items-center gap-2"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveNiceSkill(skill)}
                  className="hover:text-wisdom-gray-900"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Internal Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
          className="mt-1"
          rows={4}
          placeholder="Internal notes about this job requisition..."
        />
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={loading}
          className="bg-trust-blue hover:bg-trust-blue-700"
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>{job ? 'Update' : 'Create'} Job</>
          )}
        </Button>
      </div>
    </form>
  );
}

