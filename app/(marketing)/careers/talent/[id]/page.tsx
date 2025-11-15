import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, MapPin, DollarSign, Clock, Award, GraduationCap, Briefcase, Calendar, Star, CheckCircle2 } from 'lucide-react';
import TalentInquiryForm from '@/components/marketing/TalentInquiryForm';
// Mock talent data - in production, this would come from database
const talentData: Record<string, any> = {
  'guidewire-developer-sr': {
    id: 'guidewire-developer-sr',
    name: 'Rajesh M.',
    title: 'Senior Guidewire Developer',
    photo: null, // Placeholder
    availability: 'Available Immediately',
    location: 'Dallas, TX (Open to Relocation)',
    workAuth: 'US Citizen',
    rate: '$110-130/hr',
    experience: '8 years',
    summary: `Highly skilled Guidewire developer with 8+ years of experience in PolicyCenter, ClaimCenter, and BillingCenter. Led multiple end-to-end implementations for Fortune 500 insurance carriers. Expert in Gosu, Java, and cloud migrations.`,
    skills: {
      primary: ['Guidewire PolicyCenter', 'Guidewire ClaimCenter', 'Guidewire BillingCenter', 'Gosu', 'Java', 'PCF', 'REST APIs', 'Cloud Migration'],
      secondary: ['AWS', 'Docker', 'Kubernetes', 'CI/CD', 'Agile/Scrum', 'P&C Insurance']
    },
    certifications: [
      'Guidewire ACE Certified - PolicyCenter',
      'Guidewire ACE Certified - ClaimCenter',
      'AWS Certified Solutions Architect'
    ],
    highlights: [
      'Led Guidewire Cloud migration for $5B insurance carrier',
      'Reduced claim processing time by 40% through custom workflows',
      'Mentored team of 5 junior developers',
      'Delivered 12+ successful Guidewire implementations',
      'Strong P&C insurance domain knowledge'
    ],
    education: 'Master\'s in Computer Science, University of Texas',
    recentProjects: [
      {
        title: 'PolicyCenter Cloud Migration',
        client: 'Fortune 500 Insurance',
        duration: '12 months',
        description: 'Led technical implementation of PolicyCenter 10.x to Guidewire Cloud migration for a $5B carrier.'
      },
      {
        title: 'ClaimCenter Customization',
        client: 'Regional Insurance Carrier',
        duration: '8 months',
        description: 'Designed and implemented custom claim workflows, reducing processing time by 40%.'
      }
    ]
  },
  'full-stack-developer': {
    id: 'full-stack-developer',
    name: 'Maria L.',
    title: 'Full Stack Developer (React + Node.js)',
    photo: null,
    availability: 'Available in 2 Weeks',
    location: 'Austin, TX (Remote Preferred)',
    workAuth: 'Green Card',
    rate: '$90-110/hr',
    experience: '6 years',
    summary: `Full-stack developer specializing in modern JavaScript frameworks. Strong track record building scalable web applications for fintech and e-commerce clients. Passionate about clean code and user experience.`,
    skills: {
      primary: ['React 18', 'Node.js', 'TypeScript', 'Next.js', 'GraphQL', 'PostgreSQL', 'MongoDB', 'AWS'],
      secondary: ['Docker', 'Kubernetes', 'CI/CD', 'Jest/Cypress', 'TDD', 'Microservices']
    },
    certifications: [
      'AWS Certified Developer',
      'MongoDB Certified Developer'
    ],
    highlights: [
      'Built and scaled fintech app to 1M+ users',
      'Reduced page load time by 60% through optimization',
      'Contributed to open-source projects (React, Next.js)',
      'Strong focus on accessibility (WCAG 2.1 AA)',
      'Experience leading remote teams'
    ],
    education: 'Bachelor\'s in Software Engineering, UT Austin',
    recentProjects: [
      {
        title: 'Fintech Platform Rebuild',
        client: 'Series B Fintech Startup',
        duration: '14 months',
        description: 'Rebuilt legacy platform using React, Node.js, and microservices. Scaled to 1M users.'
      },
      {
        title: 'E-commerce Marketplace',
        client: 'Enterprise Retail Client',
        duration: '10 months',
        description: 'Built marketplace platform with real-time inventory, payments, and seller dashboards.'
      }
    ]
  }
};
interface PageProps {
  params: Promise<{
    id: string;
  }>;
}
export default async function TalentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const talent = talentData[id];
  if (!talent) {
    notFound();
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="bg-white border-b border-gray-200">
        <div className="section-container py-6">
          <Link
            href="/careers/available-talent"
            className="inline-flex items-center gap-2 text-trust-blue-600 hover:text-trust-blue-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Available Talent
          </Link>
        </div>
      </div>
      {/* Talent Header */}
      <section className="bg-white border-b border-gray-200">
        <div className="section-container py-12">
          <div className="max-w-5xl">
            <div className="flex flex-col md:flex-row gap-8">
              {/* Photo */}
              <div className="flex-shrink-0">
                <div className="w-32 h-32 bg-gradient-to-br from-trust-blue-100 to-innovation-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-5xl font-bold text-trust-blue-600">
                    {talent.name.charAt(0)}
                  </span>
                </div>
              </div>
              {/* Info */}
              <div className="flex-1">
                <div className="mb-4">
                  <span className="px-3 py-1 bg-success-green-100 text-success-green-700 rounded-full text-sm font-semibold">
                    ✅ {talent.availability}
                  </span>
                </div>
                <h1 className="text-4xl font-heading font-bold text-gray-900 mb-2">
                  {talent.name}
                </h1>
                <p className="text-2xl text-gray-700 font-medium mb-6">
                  {talent.title}
                </p>
                <div className="grid md:grid-cols-2 gap-4 text-gray-600">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-trust-blue-600" />
                    <span>{talent.location}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-trust-blue-600" />
                    <span>{talent.experience} experience</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-success-green-600" />
                    <span className="font-semibold text-success-green-600">{talent.rate}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green-600" />
                    <span>{talent.workAuth}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Main Content */}
      <section className="section-container py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Column - Talent Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Summary */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Professional Summary
              </h2>
              <p className="text-gray-700 leading-relaxed">
                {talent.summary}
              </p>
            </div>
            {/* Skills */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                Technical Skills
              </h2>
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">
                    Primary Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {talent.skills.primary.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-trust-blue-100 text-trust-blue-700 rounded-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-600 uppercase mb-3">
                    Secondary Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {talent.skills.secondary.map((skill: string) => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            {/* Certifications */}
            {talent.certifications && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Award className="w-6 h-6 text-innovation-orange-600" />
                  Certifications
                </h2>
                <ul className="space-y-3">
                  {talent.certifications.map((cert: string) => (
                    <li key={cert} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-success-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{cert}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Key Highlights */}
            <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
              <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Star className="w-6 h-6 text-innovation-orange-600" />
                Key Highlights
              </h2>
              <ul className="space-y-3">
                {talent.highlights.map((highlight: string, index: number) => (
                  <li key={index} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-6 h-6 bg-innovation-orange-100 text-innovation-orange-600 rounded-full flex items-center justify-center text-sm font-semibold mt-0.5">
                      {index + 1}
                    </span>
                    <span className="text-gray-700">{highlight}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Recent Projects */}
            {talent.recentProjects && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-6">
                  Recent Projects
                </h2>
                <div className="space-y-6">
                  {talent.recentProjects.map((project: any, index: number) => (
                    <div key={index} className="pb-6 border-b border-gray-200 last:border-0 last:pb-0">
                      <h3 className="text-xl font-heading font-semibold text-gray-900 mb-2">
                        {project.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <span className="flex items-center gap-1">
                          <Briefcase className="w-4 h-4" />
                          {project.client}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {project.duration}
                        </span>
                      </div>
                      <p className="text-gray-700">
                        {project.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {/* Education */}
            {talent.education && (
              <div className="bg-white rounded-xl p-8 shadow-sm border border-gray-200">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <GraduationCap className="w-6 h-6 text-trust-blue-600" />
                  Education
                </h2>
                <p className="text-gray-700">{talent.education}</p>
              </div>
            )}
          </div>
          {/* Right Column - Inquiry Form */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <TalentInquiryForm talentId={talent.id} talentName={talent.name} talentTitle={talent.title} />
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-white border-t border-gray-200 py-12">
        <div className="section-container text-center">
          <h2 className="text-2xl font-heading font-bold text-gray-900 mb-4">
            Looking for Different Skills?
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            We have 50+ consultants available across various technologies. Tell us what you need and we'll match you with the right talent.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/careers/available-talent"
              className="inline-flex items-center gap-2 px-6 py-3 border-2 border-trust-blue-600 text-trust-blue-600 rounded-lg font-semibold hover:bg-trust-blue-50 transition-colors"
            >
              View All Available Talent
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-6 py-3 bg-trust-blue-600 text-white rounded-lg font-semibold hover:bg-trust-blue-700 transition-colors"
            >
              Request Custom Search
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
