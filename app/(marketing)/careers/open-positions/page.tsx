import { ArrowRight, MapPin, Clock, DollarSign, Building2, ExternalLink } from 'lucide-react';
import Link from 'next/link';
export const metadata = {
  title: 'Open Positions | InTime eSolutions Careers',
  description: 'Browse client job openings we\'re actively recruiting for. Find your next IT, consulting, or engineering opportunity.',
  keywords: 'job openings, IT jobs, client positions, contract jobs, consulting opportunities',
};
export default function OpenPositionsPage() {
  // Mock data - replace with actual data from your database
  const clientJobs = [
    {
      id: 1,
      slug: 'senior-guidewire-developer',
      title: 'Senior Guidewire Developer (PolicyCenter)',
      client: 'Fortune 500 Insurance Client',
      location: 'Remote (US Only)',
      type: 'Contract',
      salary: '$95-115/hr on W2',
      posted: '1 day ago',
      description: 'Our Fortune 500 insurance client is seeking an experienced Guidewire PolicyCenter Developer for an immediate contract opportunity.',
      requirements: ['PolicyCenter 10.x/11.x', 'Java/Gosu', 'REST APIs', 'P&C Insurance', '5+ years'],
      hot: true,
    },
    {
      id: 2,
      slug: 'devops-engineer',
      title: 'DevOps Engineer',
      client: 'Leading Healthcare Technology Firm',
      location: 'Remote',
      type: 'Contract-to-Hire',
      salary: '$75-90/hour',
      posted: '3 days ago',
      description: 'Design and implement CI/CD pipelines, manage Kubernetes clusters, and ensure system reliability.',
      requirements: ['Kubernetes', 'Jenkins/GitLab CI', 'Terraform', 'AWS/Azure', 'Docker'],
    },
    {
      id: 3,
      slug: 'technical-recruiter',
      title: 'Technical Recruiter (Guidewire Specialist)',
      client: 'InTime eSolutions',
      location: 'Hybrid (Irving, TX) or Remote',
      type: 'Full-Time',
      salary: '$60K-80K + Commission',
      posted: '5 days ago',
      description: 'InTime eSolutions is growing rapidly and we need a talented Technical Recruiter who specializes in Guidewire and insurance technology.',
      requirements: ['2+ years recruiting', 'Technical screening', 'LinkedIn Recruiter', 'Target-driven'],
      hot: true,
    },
    {
      id: 4,
      title: 'Data Engineer',
      client: 'Financial Services Startup',
      location: 'New York, NY',
      type: 'Contract (6 months)',
      salary: '$90/hour',
      posted: '2 days ago',
      description: 'Build scalable data pipelines and ETL processes to support real-time analytics.',
      requirements: ['Python', 'Spark', 'Airflow', 'Snowflake', 'SQL'],
    },
    {
      id: 5,
      title: 'Salesforce Architect',
      client: 'Enterprise SaaS Company',
      location: 'San Francisco, CA',
      type: 'Contract-to-Hire',
      salary: '$110/hour',
      posted: '1 week ago',
      description: 'Lead Salesforce implementation and integration for a multi-cloud enterprise environment.',
      requirements: ['Salesforce certified', 'Apex/LWC', 'Integration patterns', '7+ years'],
    },
    {
      id: 6,
      title: 'QA Automation Lead',
      client: 'E-commerce Platform',
      location: 'Austin, TX',
      type: 'Contract (9 months)',
      salary: '$80/hour',
      posted: '4 days ago',
      description: 'Build and scale automated testing frameworks for high-traffic e-commerce applications.',
      requirements: ['Selenium', 'Cypress', 'Performance testing', 'CI/CD', 'Team leadership'],
    },
  ];
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-success-green via-success-green-600 to-success-green-700 text-white py-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <Link href="/careers" className="inline-flex items-center text-success-green-50 hover:text-white mb-4 transition-colors">
              ← Back to Careers
            </Link>
            <h1 className="text-h1 font-heading mb-6">
              Open Positions
            </h1>
            <p className="text-xl text-success-green-50 leading-relaxed">
              Explore client opportunities we're actively recruiting for. Connect with top companies across industries.
            </p>
          </div>
        </div>
      </section>
      {/* Quick Stats */}
      <section className="py-12 bg-success-green-50 border-b border-success-green-100">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-success-green mb-2">{clientJobs.length}</div>
              <div className="text-sm text-wisdom-gray-600">Active Openings</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success-green mb-2">15+</div>
              <div className="text-sm text-wisdom-gray-600">Fortune 500 Clients</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success-green mb-2">$85-$110</div>
              <div className="text-sm text-wisdom-gray-600">Avg. Hourly Rate</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-success-green mb-2">72%</div>
              <div className="text-sm text-wisdom-gray-600">Contract-to-Hire Rate</div>
            </div>
          </div>
        </div>
      </section>
      {/* Job Listings */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-h2 font-heading text-trust-blue mb-2">
                Client Opportunities
              </h2>
              <p className="text-wisdom-gray-600">
                {clientJobs.length} positions available • Updated daily
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select className="px-4 py-2 border border-wisdom-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-success-green">
                <option>All Types</option>
                <option>Contract</option>
                <option>Contract-to-Hire</option>
                <option>Direct Placement</option>
              </select>
              <select className="px-4 py-2 border border-wisdom-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-success-green">
                <option>All Locations</option>
                <option>Remote</option>
                <option>Hybrid</option>
                <option>On-site</option>
              </select>
            </div>
          </div>
          <div className="space-y-4">
            {clientJobs.map((job) => (
              <div
                key={job.id}
                className={`border-2 rounded-xl p-6 hover:shadow-lg transition-all duration-300 ${
                  job.hot
                    ? 'border-innovation-orange bg-innovation-orange-50 hover:bg-white'
                    : 'border-wisdom-gray-200 bg-wisdom-gray-50 hover:bg-white'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-xl font-heading font-semibold text-trust-blue">
                            {job.title}
                          </h3>
                          {job.hot && (
                            <span className="bg-innovation-orange text-white text-xs font-bold px-2 py-1 rounded-full">
                              HOT 🔥
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-success-green-600 font-medium mb-2 flex items-center gap-1">
                          <Building2 className="h-4 w-4" />
                          {job.client}
                        </p>
                        <div className="flex flex-wrap items-center gap-4 text-sm text-wisdom-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {job.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {job.type}
                          </span>
                          <span className="flex items-center gap-1 font-semibold text-success-green-700">
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
                          className="text-xs bg-success-green-50 text-success-green-700 border border-success-green-200 px-3 py-1 rounded-full"
                        >
                          {req}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex lg:flex-col gap-2">
                    <Link
                      href={`/contact?job=${job.slug || job.title}`}
                      className="bg-success-green hover:bg-success-green-600 text-white font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl text-center whitespace-nowrap inline-flex items-center justify-center"
                    >
                      Apply Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                    <button className="border-2 border-success-green text-success-green hover:bg-success-green hover:text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 text-sm">
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
      <section className="py-16 bg-success-green text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-4">
            Looking for Something Specific?
          </h2>
          <p className="text-xl text-success-green-50 mb-8 max-w-2xl mx-auto">
            Our recruiters work with 100+ companies. Tell us what you're looking for and we'll match you with the right opportunity.
          </p>
          <Link href="/contact" className="bg-white text-success-green hover:bg-wisdom-gray-50 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center">
            Contact a Recruiter
            <ExternalLink className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
