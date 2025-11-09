import { ArrowRight, MapPin, Clock, DollarSign, Building2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Join Our Team | InTime eSolutions Careers',
  description: 'Explore career opportunities at InTime eSolutions. Join a team committed to excellence, innovation, and professional growth.',
  keywords: 'InTime careers, IT jobs, join our team, job openings, employment opportunities',
};

export default function JoinOurTeamPage() {
  // Mock data - replace with actual data from your database
  const internalJobs = [
    {
      id: 1,
      title: 'Senior Guidewire Developer',
      department: 'Engineering',
      location: 'Remote',
      type: 'Full-time',
      salary: '$120,000 - $160,000',
      posted: '2 days ago',
      description: 'Lead Guidewire ClaimCenter implementations and mentor junior developers.',
      requirements: ['5+ years Guidewire experience', 'GOSU expertise', 'ClaimCenter certification'],
    },
    {
      id: 2,
      title: 'Technical Recruiter',
      department: 'Human Resources',
      location: 'Hybrid - New York, NY',
      type: 'Full-time',
      salary: '$80,000 - $100,000',
      posted: '5 days ago',
      description: 'Source and recruit top IT talent for our growing consulting practice.',
      requirements: ['3+ years technical recruiting', 'IT staffing experience', 'ATS proficiency'],
    },
    {
      id: 3,
      title: 'Sales Executive - IT Staffing',
      department: 'Sales',
      location: 'Remote',
      type: 'Full-time',
      salary: '$90,000 - $140,000 + Commission',
      posted: '1 week ago',
      description: 'Drive revenue growth by building relationships with enterprise clients.',
      requirements: ['5+ years IT staffing sales', 'Proven track record', 'Client relationship management'],
    },
    {
      id: 4,
      title: 'Quality Assurance Engineer',
      department: 'Engineering',
      location: 'San Francisco, CA',
      type: 'Full-time',
      salary: '$100,000 - $130,000',
      posted: '3 days ago',
      description: 'Build and maintain automated testing frameworks for enterprise applications.',
      requirements: ['Selenium/Cypress expertise', 'CI/CD experience', 'Agile methodology'],
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue via-trust-blue-600 to-trust-blue-700 text-white py-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <Link href="/careers" className="inline-flex items-center text-sky-blue-500 hover:text-white mb-4 transition-colors">
              ← Back to Careers
            </Link>
            <h1 className="text-h1 font-heading mb-6">
              Join Our Team
            </h1>
            <p className="text-xl text-sky-blue-500 leading-relaxed">
              Build your career with a company that values innovation, integrity, and professional growth. Explore opportunities at InTime eSolutions.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 bg-trust-blue-50 border-b border-trust-blue-100">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: '💼', title: 'Competitive Salary', desc: 'Industry-leading compensation packages' },
              { icon: '🏥', title: 'Health Benefits', desc: 'Comprehensive medical, dental, vision' },
              { icon: '🌴', title: 'Flexible PTO', desc: 'Unlimited time off policy' },
              { icon: '🎓', title: 'Learning Budget', desc: '$3,000/year for training & certs' },
            ].map((benefit, index) => (
              <div key={index} className="text-center p-4 bg-white rounded-lg shadow-sm">
                <div className="text-4xl mb-3">{benefit.icon}</div>
                <h3 className="font-semibold text-trust-blue mb-1">{benefit.title}</h3>
                <p className="text-sm text-wisdom-gray-600">{benefit.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Listings */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-h2 font-heading text-trust-blue mb-2">
                Open Positions
              </h2>
              <p className="text-wisdom-gray-600">
                {internalJobs.length} positions available
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select className="px-4 py-2 border border-wisdom-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-trust-blue">
                <option>All Departments</option>
                <option>Engineering</option>
                <option>Sales</option>
                <option>Human Resources</option>
              </select>
              <select className="px-4 py-2 border border-wisdom-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-trust-blue">
                <option>All Locations</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {internalJobs.map((job) => (
              <div
                key={job.id}
                className="border border-wisdom-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow duration-300 bg-wisdom-gray-50 hover:bg-white"
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-xl font-heading font-semibold text-trust-blue mb-1">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-wisdom-gray-600">
                          <span className="flex items-center gap-1">
                            <Building2 className="h-4 w-4" />
                            {job.department}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {job.salary}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs text-wisdom-gray-500 whitespace-nowrap">
                        Posted {job.posted}
                      </span>
                    </div>
                    
                    <p className="text-wisdom-gray-700 mb-3 mt-3">
                      {job.description}
                    </p>

                    <div className="flex flex-wrap gap-2">
                      {job.requirements.map((req, idx) => (
                        <span
                          key={idx}
                          className="text-xs bg-trust-blue-50 text-trust-blue-700 px-3 py-1 rounded-full"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex lg:flex-col gap-2">
                    <Link
                      href={`/careers/join-our-team/${job.id}`}
                      className="btn-primary text-center whitespace-nowrap inline-flex items-center justify-center"
                    >
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <button className="border-2 border-trust-blue text-trust-blue hover:bg-trust-blue hover:text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 text-sm">
                      Learn More
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-trust-blue text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-4">
            Don't See the Right Role?
          </h2>
          <p className="text-xl text-sky-blue-500 mb-8 max-w-2xl mx-auto">
            We're always looking for talented individuals. Send us your resume and we'll keep you in mind for future opportunities.
          </p>
          <Link href="/contact" className="btn-secondary inline-flex items-center">
            Submit Your Resume
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

