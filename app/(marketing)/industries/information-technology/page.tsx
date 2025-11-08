import { ArrowRight, CheckCircle2, Code2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'IT Staffing Solutions | InTime eSolutions',
  description: 'IT staffing with technical depth and communication excellence. Contract, contract-to-hire, direct-hire, and managed solutions.',
  keywords: 'IT staffing, software developer jobs, IT recruitment, technology staffing, programmer placement',
};

export default function InformationTechnologyPage() {
  const domains = [
    { name: 'Database Development & Administration', desc: 'Oracle DBA, MySQL, PostgreSQL' },
    { name: 'Enterprise Systems Analysis & Integration', desc: 'SAP, Oracle, Microsoft Dynamics' },
    { name: 'Network Design & Administration', desc: 'ITIL, ISO/IEC 27000, Cisco' },
    { name: 'Programming & Software Engineering', desc: 'Java, Python, .NET, Node.js' },
    { name: 'Project Management', desc: 'Agile, Scrum, Waterfall, PMI-certified' },
    { name: 'Software Testing & Quality Analysis', desc: 'Automation, Performance, Security' },
    { name: 'Technical Support', desc: 'L1, L2, L3 Support' },
    { name: 'Technical Writing', desc: 'Documentation, User Guides, API Docs' },
    { name: 'Web Development & Administration', desc: 'Full-stack, Frontend, Backend' },
  ];

  const services = [
    'End‑to‑end options: contract, contract‑to‑hire, direct‑hire, and managed solutions',
    'Curated network and rapid sourcing to deploy IT professionals with exact skills',
    'Multi‑channel recruitment: targeted outreach, referrals, job boards',
    'Full‑cycle support from intake, technical screening, and interviewing',
    'Tailored recruitment strategies respecting architecture and security standards',
    'Competitive rates and flexible terms to maximize value',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Code2 className="h-4 w-4" />
              <span className="text-sm font-medium">IT Staffing Solutions</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              IT Staffing That Ships Reliably and Securely
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              InTime brings speed through systems to IT staffing, pairing technical depth with communication excellence so teams ship reliably and securely.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find IT Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/solutions/it-staffing" className="btn-outline">
                View Staffing Process
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Services We Provide
            </h2>
            <div className="space-y-4">
              {services.map((service, index) => (
                <div key={index} className="flex items-start gap-4 p-6 bg-wisdom-gray-50 rounded-xl hover:bg-sky-blue-500/10 transition-colors">
                  <CheckCircle2 className="h-6 w-6 text-success-green flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-wisdom-gray-700">{service}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Domains & Expertise */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading mb-4 text-trust-blue">
              Domains & Expertise
            </h2>
            <p className="text-lg text-wisdom-gray-600 max-w-3xl mx-auto">
              We specialize across the full IT landscape, from infrastructure to applications, data to security.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {domains.map((domain, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-trust-blue transition-all duration-300 hover:shadow-lg"
              >
                <h3 className="font-semibold text-trust-blue-700 mb-2">{domain.name}</h3>
                <p className="text-sm text-wisdom-gray-600">{domain.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Java Expertise Highlight */}
      <section className="py-16 bg-trust-blue-50">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h2 font-heading mb-6 text-trust-blue">
              Deep Java Expertise
            </h2>
            <p className="text-lg text-wisdom-gray-700 mb-8 leading-relaxed">
              Our Java specialists bring mastery across Core Java, Object-Oriented Programming, Data Structures & Algorithms, and Hibernate. We vet for both theoretical understanding and practical application.
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['Core Java', 'OOP', 'Algorithms', 'Hibernate'].map((skill) => (
                <div key={skill} className="bg-white p-4 rounded-lg border-2 border-trust-blue-200">
                  <p className="font-semibold text-trust-blue">{skill}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Build Your IT Team?
          </h2>
          <p className="text-xl mb-8 text-sky-blue-500 max-w-2xl mx-auto">
            Let's discuss your technology stack, architecture, and project timeline. We'll mobilize the right specialists.
          </p>
          <Link href="/contact" className="btn-secondary inline-flex items-center">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

