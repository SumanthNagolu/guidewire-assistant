import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, DollarSign, Clock, Briefcase, Calendar, Building2, Users } from 'lucide-react';
import JobApplicationForm from '@/components/marketing/JobApplicationForm';
// Mock job data - in production, this would come from database
const jobData: Record<string, any> = {
  'senior-guidewire-developer': {
    id: 'senior-guidewire-developer',
    title: 'Senior Guidewire Developer (PolicyCenter)',
    company: 'Fortune 500 Insurance Client',
    location: 'Remote (US Only)',
    type: 'Contract',
    salary: '$95-115/hr on W2',
    posted: '2025-01-15',
    urgency: 'Immediate Need',
    description: `
      <p>Our Fortune 500 insurance client is seeking an experienced Guidewire PolicyCenter Developer for an immediate contract opportunity. This is a fully remote position working on a critical cloud migration initiative.</p>
    `,
    responsibilities: [
      'Design, develop, and implement PolicyCenter solutions',
      'Lead technical discussions with business stakeholders',
      'Perform code reviews and mentor junior developers',
      'Integrate PolicyCenter with third-party systems',
      'Troubleshoot production issues and implement fixes',
      'Participate in Agile ceremonies and sprint planning'
    ],
    requirements: [
      '5+ years of Guidewire PolicyCenter development experience',
      'Strong experience with Guidewire 10.x or 11.x (Cloud preferred)',
      'Expertise in Java, Gosu, PCF, and REST APIs',
      'Experience with integration patterns (SOAP, REST, messaging)',
      'Strong understanding of P&C insurance domain',
      'Excellent communication skills',
      'Must be authorized to work in the US'
    ],
    niceToHave: [
      'Guidewire ACE certification',
      'Experience with ClaimCenter or BillingCenter',
      'Cloud platform experience (AWS, Azure, GCP)',
      'CI/CD pipeline experience',
      'Prior consulting experience'
    ],
    benefits: [
      'Competitive W2 hourly rate ($120-140/hr)',
      'Fully remote (work from anywhere in US)',
      'Contract-to-hire potential',
      'Work with cutting-edge Guidewire Cloud',
      'Direct client engagement',
      'Flexible schedule'
    ],
    hiringProcess: [
      '15-minute phone screen with InTime recruiter',
      'Technical screening (Guidewire concepts)',
      'Client interview #1 (Technical deep-dive)',
      'Client interview #2 (Final round)',
      'Offer and onboarding'
    ]
  },
  'technical-recruiter': {
    id: 'technical-recruiter',
    title: 'Technical Recruiter (Guidewire Specialist)',
    company: 'InTime eSolutions',
    location: 'Hybrid (Irving, TX) or Remote',
    type: 'Full-Time',
      salary: '$60K-80K + Commission',
    posted: '2025-01-12',
    urgency: null,
    description: `
      <p>InTime eSolutions is growing rapidly and we need a talented Technical Recruiter who specializes in Guidewire and insurance technology. This is an exciting opportunity to join a high-performing team and make a real impact.</p>
    `,
    responsibilities: [
      'Source and recruit Guidewire professionals (PolicyCenter, ClaimCenter, BillingCenter)',
      'Build and maintain a pipeline of qualified candidates',
      'Conduct technical screenings and cultural fit interviews',
      'Partner with clients to understand requirements',
      'Manage full-cycle recruitment process',
      'Achieve monthly placement targets (3-5 placements)'
    ],
    requirements: [
      '2+ years of technical recruiting experience',
      'Experience recruiting for software engineering or IT roles',
      'Strong Boolean search and LinkedIn Recruiter skills',
      'Excellent communication and negotiation skills',
      'Self-motivated and target-driven',
      'Bachelor\'s degree (preferred but not required)'
    ],
    niceToHave: [
      'Prior experience recruiting Guidewire professionals',
      'Insurance industry knowledge',
      'Bullhorn or similar ATS experience',
      'Network of Guidewire candidates',
      'Staffing agency experience'
    ],
    benefits: [
      'Base salary $70K-90K + uncapped commission',
      'Top performers earn $150K+ annually',
      'Health, dental, vision insurance',
      '401(k) with company match',
      'Flexible PTO policy',
      'Remote work options',
      'Career growth opportunities'
    ],
    hiringProcess: [
      'Application review',
      'Phone screen (30 minutes)',
      'In-person/video interview with hiring manager',
      'Final interview with CEO',
      'Offer and background check'
    ]
  }
};
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function JobDetailPage({ params }: PageProps) {
  const { id } = await params;
  const job = jobData[id];
  if (!job) {
    notFound();
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="section-container py-6">
          <Link
            href="/careers/open-positions"
            className="inline-flex items-center gap-2 text-trust-blue-600 hover:text-trust-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Open Positions
          </Link>
        </div>
      </div>
      {/* Job Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="section-container py-12">
          <div className="max-w-4xl">
            {job.urgency && (
              <div className="mb-4">
                <span className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold animate-pulse">
                  🔥 {job.urgency}
                </span>
              </div>
            )}
            <h1 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              {job.title}
            </h1>
            <div className="flex flex-wrap items-center gap-6 text-gray-600 mb-6">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5" />
                <span className="font-medium">{job.company}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5" />
                <span>{job.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                <span>{job.type}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5" />
                <span className="font-semibold text-success-green-600">{job.salary}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              Posted {new Date(job.posted).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <section className="section-container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Job Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                About the Role
              </h2>
              <div 
                className="prose prose-gray max-w-none"
                dangerouslySetInnerHTML={{ __html: job.description }}
              />
            </div>
            {/* Responsibilities */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Key Responsibilities
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-trust-blue-100 text-trust-blue-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Requirements */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Requirements
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((item: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="text-trust-blue-600 mt-1">✓</span>
                    <span className="text-gray-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Nice to Have */}
            {job.niceToHave && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                  Nice to Have
                </h2>
                <ul className="space-y-3">
                  {job.niceToHave.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-success-green-600 mt-1">+</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Benefits */}
            {job.benefits && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                  What We Offer
                </h2>
                <ul className="grid md:grid-cols-2 gap-4">
                  {job.benefits.map((item: string, index: number) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-success-green-600 mt-1 text-xl">●</span>
                      <span className="text-gray-700">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Hiring Process */}
            {job.hiringProcess && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                  Hiring Process
                </h2>
                <div className="space-y-4">
                  {job.hiringProcess.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-trust-blue-600 text-white rounded-full flex items-center justify-center font-semibold">
                        {index + 1}
                      </div>
                      <div className="flex-1 pt-1">
                        <p className="text-gray-700">{step}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <Clock className="w-4 h-4 inline mr-2" />
                    <strong>Typical Timeline:</strong> 1-2 weeks from application to offer
                  </p>
                </div>
              </div>
            )}
          </div>
          {/* Right Column - Application Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <JobApplicationForm jobId={job.id} jobTitle={job.title} />
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="section-container text-center">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
            Questions About This Role?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our recruiters are here to help. Get answers to your questions, understand the client better, or discuss your qualifications.
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-trust-blue-600 text-white rounded-lg font-semibold hover:bg-trust-blue-700 transition-colors"
          >
            <Users className="w-5 h-5" />
            Contact a Recruiter
          </Link>
        </div>
      </section>
    </div>
  );
}
