'use client';

import { useState } from 'react';
import { Check, AlertCircle, Briefcase } from 'lucide-react';

interface TalentInquiryFormProps {
  talentId: string;
  talentName: string;
  talentTitle: string;
}

export default function TalentInquiryForm({ talentId, talentName, talentTitle }: TalentInquiryFormProps) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    position: '',
    projectType: '',
    startDate: '',
    duration: '',
    budget: '',
    message: ''
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
      const response = await fetch('/api/talent/inquire', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          talentId,
          talentName,
          talentTitle
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to submit inquiry');
      }

      setSubmitStatus('success');
      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        company: '',
        position: '',
        projectType: '',
        startDate: '',
        duration: '',
        budget: '',
        message: ''
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
            Inquiry Sent!
          </h3>
          <p className="text-gray-600 mb-6">
            Our team will review your request and get back to you within 24 hours with next steps.
          </p>
          <button
            onClick={() => setSubmitStatus('idle')}
            className="text-trust-blue-600 hover:text-trust-blue-700 font-medium"
          >
            Send Another Inquiry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-200">
      <div className="flex items-center gap-2 mb-4">
        <Briefcase className="w-6 h-6 text-trust-blue-600" />
        <h3 className="text-2xl font-heading font-bold text-gray-900">
          Hire This Talent
        </h3>
      </div>
      
      <p className="text-gray-600 mb-6">
        Interested in <strong>{talentName}</strong>? Fill out the form and we'll arrange an interview within 48 hours.
      </p>

      {submitStatus === 'error' && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-900">Submission Failed</p>
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

        {/* Company */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Company <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="company"
            value={formData.company}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Position */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Your Position
          </label>
          <input
            type="text"
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="e.g., Hiring Manager"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Type <span className="text-red-500">*</span>
          </label>
          <select
            name="projectType"
            value={formData.projectType}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="Contract">Contract</option>
            <option value="Contract-to-Hire">Contract-to-Hire</option>
            <option value="Direct Hire">Direct Hire</option>
            <option value="Project-Based">Project-Based</option>
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Desired Start Date <span className="text-red-500">*</span>
          </label>
          <select
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          >
            <option value="">Select...</option>
            <option value="Immediate">Immediate</option>
            <option value="Within 2 weeks">Within 2 weeks</option>
            <option value="Within 1 month">Within 1 month</option>
            <option value="1-2 months">1-2 months</option>
            <option value="Flexible">Flexible</option>
          </select>
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Expected Duration
          </label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 6 months, 1 year"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Budget */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Budget Range
          </label>
          <input
            type="text"
            name="budget"
            value={formData.budget}
            onChange={handleChange}
            placeholder="e.g., $100-120/hr"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Project Details <span className="text-red-500">*</span>
          </label>
          <textarea
            name="message"
            value={formData.message}
            onChange={handleChange}
            required
            rows={4}
            placeholder="Tell us about your project, requirements, and why this consultant is a good fit..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-trust-blue-500 focus:border-transparent"
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full py-3 bg-trust-blue-600 text-white rounded-lg font-semibold hover:bg-trust-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? 'Submitting...' : 'Request Interview'}
        </button>

        <p className="text-xs text-gray-500 text-center">
          We'll get back to you within 24 hours
        </p>
      </form>
    </div>
  );
}

