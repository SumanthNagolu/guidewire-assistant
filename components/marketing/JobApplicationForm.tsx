'use client';

import { useState } from 'react';
import { Upload, Check, AlertCircle } from 'lucide-react';

interface JobApplicationFormProps {
  jobId: string;
  jobTitle: string;
}

export default function JobApplicationForm({ jobId, jobTitle }: JobApplicationFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    linkedin: '',
    yearsExperience: '',
    currentLocation: '',
    workAuthorization: '',
    availability: '',
    expectedSalary: '',
    resumeText: '',
    coverLetter: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/applications/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          jobId,
          jobTitle
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit application');
      }

      setSubmitStatus('success');
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        linkedin: '',
        yearsExperience: '',
        currentLocation: '',
        workAuthorization: '',
        availability: '',
        expectedSalary: '',
        resumeText: '',
        coverLetter: ''
      });
    } catch (error) {
            setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'An error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
        <div className="text-center">
          <div className="w-16 h-16 bg-success-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="w-8 h-8 text-success-green-600" />
          </div>
          <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Application Submitted!
          </h3>
          <p className="text-gray-600 mb-6">
            Thank you for applying. A recruiter will review your application and reach out within 24-48 hours.
          </p>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="text-trust-blue-600 hover:text-trust-blue-700 font-medium"
          >
            Submit Another Application
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
      <h3 className="text-2xl font-heading font-bold text-gray-900 mb-2">
        Apply for This Role
      </h3>
      <p className="text-gray-600 mb-6">
        Fill out the form below and we'll get back to you within 24 hours.
      </p>

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Application Failed</p>
            <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              First Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Last Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Phone */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
            placeholder="+1 (555) 123-4567"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* LinkedIn */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            LinkedIn Profile
          </label>
          <input
            type="url"
            name="linkedin"
            value={formData.linkedin}
            onChange={handleChange}
            placeholder="https://linkedin.com/in/yourprofile"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Years of Experience */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Years of Experience <span className="text-red-500">*</span>
          </label>
          <select
            name="yearsExperience"
            value={formData.yearsExperience}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="0-1">0-1 years</option>
            <option value="1-3">1-3 years</option>
            <option value="3-5">3-5 years</option>
            <option value="5-7">5-7 years</option>
            <option value="7-10">7-10 years</option>
            <option value="10+">10+ years</option>
          </select>
        </div>

        {/* Current Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Current Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="currentLocation"
            value={formData.currentLocation}
            onChange={handleChange}
            required
            placeholder="City, State"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Work Authorization */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Work Authorization <span className="text-red-500">*</span>
          </label>
          <select
            name="workAuthorization"
            value={formData.workAuthorization}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="US Citizen">US Citizen</option>
            <option value="Green Card">Green Card</option>
            <option value="H1B">H1B Visa</option>
            <option value="EAD">EAD</option>
            <option value="Canadian Citizen">Canadian Citizen</option>
            <option value="Other">Other</option>
          </select>
        </div>

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Availability <span className="text-red-500">*</span>
          </label>
          <select
            name="availability"
            value={formData.availability}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="Immediate">Immediate</option>
            <option value="2 weeks">2 weeks notice</option>
            <option value="1 month">1 month notice</option>
            <option value="2+ months">2+ months</option>
          </select>
        </div>

        {/* Expected Salary */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Salary/Rate <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="expectedSalary"
            value={formData.expectedSalary}
            onChange={handleChange}
            required
            placeholder="e.g., $120/hr or $150K/year"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Resume/Skills */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Resume/Skills Summary <span className="text-red-500">*</span>
          </label>
          <textarea
            name="resumeText"
            value={formData.resumeText}
            onChange={handleChange}
            required
            rows={6}
            placeholder="Paste your resume or describe your relevant skills and experience..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
          <p className="text-xs text-gray-500 mt-1">
            <Upload className="w-3 h-3 inline mr-1" />
            Tip: Copy and paste your resume, or upload via email after submitting
          </p>
        </div>

        {/* Cover Letter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Why are you a great fit for this role?
          </label>
          <textarea
            name="coverLetter"
            value={formData.coverLetter}
            onChange={handleChange}
            rows={4}
            placeholder="Tell us why you're interested and what makes you a strong candidate..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-trust-blue-600 text-white rounded-lg font-semibold hover:bg-trust-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Application'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          By submitting, you agree to our terms and privacy policy.
        </p>
      </form>
    </div>
  );
}

