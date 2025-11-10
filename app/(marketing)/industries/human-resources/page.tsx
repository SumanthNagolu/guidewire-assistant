import { ArrowRight, CheckCircle2, Users } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'HR Staffing & Recruitment | InTime eSolutions',
  description: 'HR talent for talent acquisition, HRIS, compensation, benefits, compliance, and more. From HR coordinators to CHROs—Workday, SAP SuccessFactors certified.',
  keywords: 'HR staffing, HR recruitment, HRIS specialist, talent acquisition, HR manager, CHRO, compensation analyst, benefits administrator',
};

export default function HumanResourcesPage() {
  const roles = [
    'HR Manager',
    'HR Director',
    'Chief Human Resources Officer (CHRO)',
    'Talent Acquisition Manager',
    'Recruiter',
    'Technical Recruiter',
    'HR Business Partner',
    'Compensation & Benefits Manager',
    'Payroll Specialist',
    'HR Coordinator',
    'HRIS Analyst',
    'HR Systems Administrator',
    'Employee Relations Manager',
    'Diversity & Inclusion Manager',
    'Learning & Development Manager',
    'Training Coordinator',
    'HR Compliance Specialist',
    'Benefits Administrator',
    'Onboarding Specialist',
    'HR Generalist',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Users className="h-4 w-4" />
              <span className="text-sm font-medium">HR Staffing & Recruitment</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              HR Talent That Builds Great Teams
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              From talent acquisition to HRIS implementation—InTime delivers HR professionals who understand ATS systems, compliance, and culture. 71% of companies struggle to find HR talent. We close that gap fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find HR Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Our HR Expertise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-8 text-trust-blue text-center">
              HR Expertise That Scales
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: 'HRIS Certified', desc: 'Workday, SAP SuccessFactors, ADP—our HR talent knows the systems.' },
                { title: 'Compliance-Focused', desc: 'EEOC, FMLA, FLSA, ADA—all candidates trained in employment law.' },
                { title: 'Rapid Deployment', desc: 'HRIS down? Open req surge? We staff HR teams in 72 hours.' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="h-16 w-16 bg-success-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-success-green" />
                  </div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">{item.title}</h3>
                  <p className="text-wisdom-gray">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <p className="text-lg text-wisdom-gray leading-relaxed mb-4">
                <strong className="text-trust-blue">The HR Talent Crisis:</strong> 71% of companies report difficulty finding qualified HR professionals. HRIS implementations stall. Compliance risks mount. Talent acquisition backlogs grow.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers HR talent fast—from HR coordinators to CHROs, talent acquisition specialists to HRIS analysts. All certified. All compliance-trained. Whether you need one recruiter or an entire HR transformation team, we staff within 72 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-4 text-trust-blue text-center">
            HR Roles We Staff
          </h2>
          <p className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto">
            From HR coordinators to CHROs—talent acquisition, HRIS, compensation, benefits, compliance, and more.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-white rounded-lg px-4 py-3 text-center text-sm text-wisdom-gray-700 hover:shadow-md transition-shadow"
              >
                {role}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Companies Choose InTime for HR */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Why Companies Choose InTime for HR
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    HRIS Implementation Teams
                  </h3>
                  <p className="text-wisdom-gray">
                    Workday, SAP SuccessFactors, Oracle—we staff certified HRIS analysts and change managers.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Rapid Talent Acquisition Scaling
                  </h3>
                  <p className="text-wisdom-gray">
                    Hiring surge? We deploy 10+ technical recruiters in 72 hours—LinkedIn Recruiter certified.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Compliance Expertise
                  </h3>
                  <p className="text-wisdom-gray">
                    EEOC, FMLA, FLSA, ADA, OSHA—all HR talent trained in federal and state employment law.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Flexible Engagement Models
                  </h3>
                  <p className="text-wisdom-gray">
                    Interim CHRO? Project-based comp study? RPO? We flex with your HR needs.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 bg-gradient-to-br from-trust-blue-50 to-success-green-50">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue">
              HR Staffing By The Numbers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold text-trust-blue mb-2">72hrs</div>
                <div className="text-wisdom-gray-600">Average time to deploy HR professionals</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-success-green mb-2">94%</div>
                <div className="text-wisdom-gray-600">HR placement success rate</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-innovation-orange mb-2">$240B</div>
                <div className="text-wisdom-gray-600">US HR services market we serve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Need HR Talent? We Deliver Fast.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Whether you need one HR coordinator or an entire HRIS implementation team—we staff fast, certified, and ready to hire.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary">
              Request HR Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline">
              View HR Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

