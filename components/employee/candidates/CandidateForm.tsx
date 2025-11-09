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

interface CandidateFormProps {
  userId: string;
  candidate?: any;
}

export default function CandidateForm({ userId, candidate }: CandidateFormProps) {
  const router = useRouter();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [firstName, setFirstName] = useState(candidate?.first_name || '');
  const [lastName, setLastName] = useState(candidate?.last_name || '');
  const [email, setEmail] = useState(candidate?.email || '');
  const [phone, setPhone] = useState(candidate?.phone || '');
  const [location, setLocation] = useState(candidate?.location || '');
  const [currentTitle, setCurrentTitle] = useState(candidate?.current_title || '');
  const [yearsOfExperience, setYearsOfExperience] = useState(candidate?.years_of_experience || '');
  const [skills, setSkills] = useState<string[]>(candidate?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [certifications, setCertifications] = useState<string[]>(candidate?.certifications || []);
  const [certInput, setCertInput] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState(candidate?.linkedin_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(candidate?.portfolio_url || '');
  const [availability, setAvailability] = useState(candidate?.availability || 'within_2_weeks');
  const [workAuth, setWorkAuth] = useState(candidate?.work_authorization || 'us_citizen');
  const [desiredRateMin, setDesiredRateMin] = useState(candidate?.desired_rate_min || '');
  const [desiredRateMax, setDesiredRateMax] = useState(candidate?.desired_rate_max || '');
  const [notes, setNotes] = useState(candidate?.notes || '');

  const handleAddSkill = () => {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill: string) => {
    setSkills(skills.filter(s => s !== skill));
  };

  const handleAddCert = () => {
    if (certInput.trim() && !certifications.includes(certInput.trim())) {
      setCertifications([...certifications, certInput.trim()]);
      setCertInput('');
    }
  };

  const handleRemoveCert = (cert: string) => {
    setCertifications(certifications.filter(c => c !== cert));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const candidateData = {
        first_name: firstName,
        last_name: lastName,
        email,
        phone: phone || null,
        location: location || null,
        current_title: currentTitle || null,
        years_of_experience: yearsOfExperience ? parseInt(yearsOfExperience) : null,
        skills,
        certifications,
        linkedin_url: linkedinUrl || null,
        portfolio_url: portfolioUrl || null,
        availability,
        work_authorization: workAuth,
        desired_rate_min: desiredRateMin ? parseInt(desiredRateMin) : null,
        desired_rate_max: desiredRateMax ? parseInt(desiredRateMax) : null,
        notes: notes || null,
        status: 'active',
        owner_id: userId,
      };

      if (candidate) {
        // Update existing candidate
        const { error: updateError } = await supabase
          .from('candidates')
          .update(candidateData)
          .eq('id', candidate.id);

        if (updateError) throw updateError;
        
        setSuccess(true);
        setTimeout(() => {
          router.push(`/employee/candidates/${candidate.id}`);
        }, 1500);
      } else {
        // Create new candidate
        const { error: insertError } = await supabase
          .from('candidates')
          .insert([candidateData]);

        if (insertError) throw insertError;

        setSuccess(true);
        setTimeout(() => {
          router.push('/employee/candidates');
        }, 1500);
      }
    } catch (err: any) {
      console.error('Error saving candidate:', err);
      setError(err.message || 'Failed to save candidate. Please try again.');
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="bg-success-green-50 border-success-green-200">
        <AlertDescription className="text-success-green-700">
          ✓ Candidate {candidate ? 'updated' : 'added'} successfully! Redirecting...
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

      {/* Personal Information */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Personal Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="firstName">First Name *</Label>
            <Input
              id="firstName"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              disabled={loading}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="lastName">Last Name *</Label>
            <Input
              id="lastName"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              disabled={loading}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              className="mt-1"
              placeholder="+1-555-123-4567"
            />
          </div>
          <div className="md:col-span-2">
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
        </div>
      </div>

      {/* Professional Information */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Professional Information
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="currentTitle">Current Title</Label>
            <Input
              id="currentTitle"
              value={currentTitle}
              onChange={(e) => setCurrentTitle(e.target.value)}
              disabled={loading}
              className="mt-1"
              placeholder="e.g. Senior Guidewire Developer"
            />
          </div>
          <div>
            <Label htmlFor="yearsOfExperience">Years of Experience</Label>
            <Input
              id="yearsOfExperience"
              type="number"
              value={yearsOfExperience}
              onChange={(e) => setYearsOfExperience(e.target.value)}
              disabled={loading}
              className="mt-1"
              min="0"
            />
          </div>
        </div>

        {/* Skills */}
        <div className="mt-6">
          <Label htmlFor="skillInput">Skills</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="skillInput"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
              disabled={loading}
              placeholder="Type a skill and press Enter"
            />
            <Button
              type="button"
              onClick={handleAddSkill}
              disabled={loading || !skillInput.trim()}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {skills.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {skills.map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-sky-blue-50 text-sky-blue-700 text-sm rounded-full border border-sky-blue-200 flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="hover:text-sky-blue-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Certifications */}
        <div className="mt-6">
          <Label htmlFor="certInput">Certifications</Label>
          <div className="flex gap-2 mt-1">
            <Input
              id="certInput"
              value={certInput}
              onChange={(e) => setCertInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCert())}
              disabled={loading}
              placeholder="Type a certification and press Enter"
            />
            <Button
              type="button"
              onClick={handleAddCert}
              disabled={loading || !certInput.trim()}
              variant="outline"
            >
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          {certifications.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {certifications.map((cert, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-success-green-50 text-success-green-700 text-sm rounded-full border border-success-green-200 flex items-center gap-2"
                >
                  {cert}
                  <button
                    type="button"
                    onClick={() => handleRemoveCert(cert)}
                    className="hover:text-success-green-900"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* URLs */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              type="url"
              value={linkedinUrl}
              onChange={(e) => setLinkedinUrl(e.target.value)}
              disabled={loading}
              className="mt-1"
              placeholder="https://linkedin.com/in/..."
            />
          </div>
          <div>
            <Label htmlFor="portfolioUrl">Portfolio URL</Label>
            <Input
              id="portfolioUrl"
              type="url"
              value={portfolioUrl}
              onChange={(e) => setPortfolioUrl(e.target.value)}
              disabled={loading}
              className="mt-1"
              placeholder="https://..."
            />
          </div>
        </div>
      </div>

      {/* Availability & Compensation */}
      <div>
        <h3 className="text-lg font-heading font-semibold text-trust-blue-900 mb-4">
          Availability & Compensation
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label htmlFor="availability">Availability</Label>
            <select
              id="availability"
              value={availability}
              onChange={(e) => setAvailability(e.target.value)}
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="immediate">Immediate</option>
              <option value="within_2_weeks">Within 2 Weeks</option>
              <option value="within_1_month">Within 1 Month</option>
              <option value="not_available">Not Available</option>
            </select>
          </div>
          <div>
            <Label htmlFor="workAuth">Work Authorization</Label>
            <select
              id="workAuth"
              value={workAuth}
              onChange={(e) => setWorkAuth(e.target.value)}
              disabled={loading}
              className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-trust-blue"
            >
              <option value="us_citizen">US Citizen</option>
              <option value="green_card">Green Card</option>
              <option value="h1b">H1B</option>
              <option value="opt">OPT</option>
              <option value="ead">EAD</option>
              <option value="requires_sponsorship">Requires Sponsorship</option>
            </select>
          </div>
          <div>
            <Label htmlFor="desiredRateMin">Desired Rate Min ($/hr)</Label>
            <Input
              id="desiredRateMin"
              type="number"
              value={desiredRateMin}
              onChange={(e) => setDesiredRateMin(e.target.value)}
              disabled={loading}
              className="mt-1"
              min="0"
            />
          </div>
          <div>
            <Label htmlFor="desiredRateMax">Desired Rate Max ($/hr)</Label>
            <Input
              id="desiredRateMax"
              type="number"
              value={desiredRateMax}
              onChange={(e) => setDesiredRateMax(e.target.value)}
              disabled={loading}
              className="mt-1"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={loading}
          className="mt-1"
          rows={4}
          placeholder="Additional notes about the candidate..."
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
            <>{candidate ? 'Update' : 'Add'} Candidate</>
          )}
        </Button>
      </div>
    </form>
  );
}

