import { ArrowRight, MapPin, Award, Star, Code, Briefcase, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export const metadata = {
  title: 'Available Talent | InTime eSolutions',
  description: 'Browse our bench of pre-vetted, certified IT professionals ready for immediate placement. Top consultants available now.',
  keywords: 'available talent, IT consultants, Guidewire developers, contract consultants, bench talent',
};

export default function AvailableTalentPage() {
  // Mock data - replace with actual data from your database
  const availableTalent = [
    {
      id: 1,
      name: 'Rajesh K.',
      title: 'Senior Guidewire Developer',
      location: 'Jersey City, NJ',
      availability: 'Immediate',
      rate: '$95 - $110/hour',
      yearsExp: 8,
      skills: ['ClaimCenter', 'PolicyCenter', 'GOSU', 'Integration Hub', 'Java'],
      certifications: ['Guidewire Certified', 'AWS Solutions Architect'],
      summary: 'Expert in Guidewire suite with 8+ years insurance domain experience. Led 5+ full-cycle implementations.',
      featured: true,
    },
    {
      id: 2,
      name: 'Maria S.',
      title: 'Full Stack Developer',
      location: 'Austin, TX',
      availability: '2 weeks',
      rate: '$80 - $95/hour',
      yearsExp: 6,
      skills: ['React', 'Node.js', 'TypeScript', 'AWS', 'PostgreSQL'],
      certifications: ['AWS Certified Developer'],
      summary: 'Full-stack engineer specializing in React/Node.js microservices. Built scalable applications serving 1M+ users.',
    },
    {
      id: 3,
      name: 'David L.',
      title: 'DevOps Engineer',
      location: 'Remote',
      availability: 'Immediate',
      rate: '$85 - $100/hour',
      yearsExp: 7,
      skills: ['Kubernetes', 'Terraform', 'AWS', 'Jenkins', 'Docker'],
      certifications: ['CKA', 'AWS Solutions Architect'],
      summary: 'DevOps specialist with expertise in cloud infrastructure automation and CI/CD pipeline optimization.',
      featured: true,
    },
    {
      id: 4,
      name: 'Priya M.',
      title: 'QA Automation Engineer',
      location: 'San Francisco, CA',
      availability: '1 week',
      rate: '$75 - $90/hour',
      yearsExp: 5,
      skills: ['Selenium', 'Cypress', 'REST API Testing', 'JIRA', 'TestRail'],
      certifications: ['ISTQB Advanced'],
      summary: 'QA automation expert with strong focus on test strategy and framework development for enterprise apps.',
    },
    {
      id: 5,
      name: 'Ahmed R.',
      title: 'Data Engineer',
      location: 'Chicago, IL',
      availability: 'Immediate',
      rate: '$90 - $105/hour',
      yearsExp: 6,
      skills: ['Python', 'Spark', 'Snowflake', 'Airflow', 'Kafka'],
      certifications: ['Snowflake Certified', 'Databricks Certified'],
      summary: 'Data engineering specialist building scalable ETL pipelines and real-time data processing systems.',
    },
    {
      id: 6,
      name: 'Sarah T.',
      title: 'Salesforce Architect',
      location: 'New York, NY',
      availability: '2 weeks',
      rate: '$100 - $120/hour',
      yearsExp: 9,
      skills: ['Salesforce', 'Apex', 'LWC', 'Integration', 'Heroku'],
      certifications: ['Salesforce Certified Architect', 'Platform Developer II'],
      summary: '9 years of Salesforce expertise across Sales Cloud, Service Cloud, and custom app development.',
      featured: true,
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-innovation-orange via-innovation-orange-600 to-innovation-orange-700 text-white py-20">
        <div className="section-container">
          <div className="max-w-3xl">
            <Link href="/careers" className="inline-flex items-center text-innovation-orange-50 hover:text-white mb-4 transition-colors">
              ← Back to Careers
            </Link>
            <h1 className="text-h1 font-heading mb-6">
              Available Talent
            </h1>
            <p className="text-xl text-innovation-orange-50 leading-relaxed">
              Browse our bench of pre-vetted, certified professionals ready for immediate placement. Hire today, start tomorrow.
            </p>
          </div>
        </div>
      </section>

      {/* Quick Stats */}
      <section className="py-12 bg-innovation-orange-50 border-b border-innovation-orange-100">
        <div className="section-container">
          <div className="grid md:grid-cols-4 gap-6 text-center">
            <div>
              <div className="text-4xl font-bold text-innovation-orange mb-2">{availableTalent.length}</div>
              <div className="text-sm text-wisdom-gray-600">Available Now</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-innovation-orange mb-2">100%</div>
              <div className="text-sm text-wisdom-gray-600">Pre-Vetted</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-innovation-orange mb-2">7.5</div>
              <div className="text-sm text-wisdom-gray-600">Avg. Years Experience</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-innovation-orange mb-2">24hrs</div>
              <div className="text-sm text-wisdom-gray-600">Avg. Response Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Talent Listings */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h2 className="text-h2 font-heading text-trust-blue mb-2">
                Pre-Vetted Consultants
              </h2>
              <p className="text-wisdom-gray-600">
                {availableTalent.length} professionals available • All backgrounds verified
              </p>
            </div>
            <div className="flex items-center gap-2">
              <select className="px-4 py-2 border border-wisdom-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-innovation-orange">
                <option>All Skills</option>
                <option>Guidewire</option>
                <option>Full Stack</option>
                <option>DevOps</option>
                <option>QA</option>
                <option>Data Engineering</option>
              </select>
              <select className="px-4 py-2 border border-wisdom-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-innovation-orange">
                <option>All Availability</option>
                <option>Immediate</option>
                <option>Within 2 weeks</option>
              </select>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {availableTalent.map((talent) => (
              <div
                key={talent.id}
                className={`border-2 rounded-xl p-6 hover:shadow-xl transition-all duration-300 ${
                  talent.featured
                    ? 'border-innovation-orange bg-innovation-orange-50'
                    : 'border-wisdom-gray-200 bg-white'
                }`}
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-3">
                    <div className="h-16 w-16 rounded-full bg-trust-blue text-white flex items-center justify-center text-2xl font-bold">
                      {talent.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xl font-heading font-semibold text-trust-blue">
                          {talent.name}
                        </h3>
                        {talent.featured && (
                          <Star className="h-5 w-5 fill-innovation-orange text-innovation-orange" />
                        )}
                      </div>
                      <p className="text-success-green-600 font-medium">{talent.title}</p>
                      <div className="flex items-center gap-3 text-sm text-wisdom-gray-600 mt-1">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {talent.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Briefcase className="h-3 w-3" />
                          {talent.yearsExp} years
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Availability & Rate */}
                <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border border-wisdom-gray-200">
                  <div>
                    <div className="text-xs text-wisdom-gray-600 mb-1">Availability</div>
                    <div className="font-semibold text-success-green flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      {talent.availability}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-wisdom-gray-600 mb-1">Rate</div>
                    <div className="font-semibold text-trust-blue">{talent.rate}</div>
                  </div>
                </div>

                {/* Summary */}
                <p className="text-sm text-wisdom-gray-700 mb-4 leading-relaxed">
                  {talent.summary}
                </p>

                {/* Skills */}
                <div className="mb-4">
                  <div className="text-xs text-wisdom-gray-600 mb-2 flex items-center gap-1">
                    <Code className="h-3 w-3" />
                    Core Skills
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {talent.skills.map((skill, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-trust-blue-50 text-trust-blue-700 px-2 py-1 rounded"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Certifications */}
                <div className="mb-4">
                  <div className="text-xs text-wisdom-gray-600 mb-2 flex items-center gap-1">
                    <Award className="h-3 w-3" />
                    Certifications
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {talent.certifications.map((cert, idx) => (
                      <span
                        key={idx}
                        className="text-xs bg-success-green-50 text-success-green-700 border border-success-green-200 px-2 py-1 rounded"
                      >
                        {cert}
                      </span>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <div className="flex gap-2 pt-4 border-t border-wisdom-gray-200">
                  <Link
                    href={`/contact?talent=${talent.id}`}
                    className="flex-1 bg-innovation-orange hover:bg-innovation-orange-600 text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 text-center text-sm"
                  >
                    Request Interview
                  </Link>
                  <button className="flex-1 border-2 border-innovation-orange text-innovation-orange hover:bg-innovation-orange hover:text-white font-semibold py-3 px-6 rounded-full transition-all duration-300 text-sm">
                    View Full Profile
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading text-trust-blue text-center mb-12">
            How Our Talent Placement Works
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: 'Browse Talent', desc: 'Review our available consultants and their skills.' },
              { step: '2', title: 'Request Interview', desc: 'Schedule a technical interview within 24 hours.' },
              { step: '3', title: 'Evaluate Fit', desc: 'Conduct your own assessment and due diligence.' },
              { step: '4', title: 'Start Fast', desc: 'Onboard in days, not weeks. We handle all paperwork.' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="h-16 w-16 bg-innovation-orange rounded-full flex items-center justify-center mx-auto mb-4 text-2xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="text-h5 font-heading text-trust-blue mb-2">{item.title}</h3>
                <p className="text-sm text-wisdom-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-innovation-orange text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-4">
            Need Talent for Your Next Project?
          </h2>
          <p className="text-xl text-innovation-orange-50 mb-8 max-w-2xl mx-auto">
            Our consultants are ready to hit the ground running. Contact us today to discuss your requirements.
          </p>
          <Link href="/contact" className="bg-white text-innovation-orange hover:bg-wisdom-gray-50 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center">
            Schedule a Consultation
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

