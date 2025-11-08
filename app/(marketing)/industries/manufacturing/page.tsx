import { ArrowRight, CheckCircle2, Factory } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Manufacturing & Production Staffing | InTime eSolutions',
  description: 'Manufacturing and production staffing across discrete, process, and industrial operations. Build line stability and reduce downtime.',
  keywords: 'manufacturing staffing, production jobs, quality control staffing, maintenance technician recruitment, assembly jobs',
};

export default function ManufacturingPage() {
  const roles = [
    'Production Specialist',
    'Assembler/Installer',
    'Welder',
    'General Laborer',
    'Quality Control Technician',
    'Production and Warehouse Laborer',
    'Maintenance Technician - Industrial',
    'Automotive Technician',
    'HVAC Technician',
    'Maintenance Technician - Facilities',
    'Quality Control Manager',
  ];

  const services = [
    'Recruiting and screening candidates',
    'Comprehensive background checks',
    'Behavioral and skills assessments',
    'Structured interviews and offer support',
    'Onboarding assistance',
    'Ongoing performance support and guidance',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Factory className="h-4 w-4" />
              <span className="text-sm font-medium">Manufacturing & Production Staffing</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Manufacturing Staffing That Improves Line Stability
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              We specialize in manufacturing and production staffing across discrete, process, and industrial operations. Our recruiters understand takt time, throughput, quality gates, and EHS requirements, building shortlists that improve line stability and reduce downtime.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find Manufacturing Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/solutions/it-staffing" className="btn-outline">
                View All Staffing Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* The InTime Way */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-h2 font-heading mb-6 text-trust-blue">
                The InTime Way
              </h2>
              <p className="text-lg text-wisdom-gray-600 mb-6 leading-relaxed">
                Every search is anchored in The InTime Way—excellence as the baseline, preparation that prevents panic, and relationships that endure.
              </p>
              <p className="text-lg text-wisdom-gray-600 mb-6 leading-relaxed">
                From greenfield ramp‑ups to continuous improvement programs, we align skills and certifications with your SOPs, shifts, and KPIs. Expect fast, compliant onboarding and candidates screened for reliability, craftsmanship, and lean thinking—so productivity rises without sacrificing safety or quality.
              </p>
              <p className="text-lg text-wisdom-gray-700 font-semibold">
                Our commitment is integrity, speed, and measurable impact.
              </p>
            </div>
            <div className="bg-gradient-to-br from-success-green-50 to-success-green-500/10 p-8 rounded-2xl">
              <h3 className="text-h4 font-heading mb-6 text-trust-blue">Services We Provide</h3>
              <div className="space-y-4">
                {services.map((service, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-success-green flex-shrink-0 mt-0.5" />
                    <span className="text-wisdom-gray-700">{service}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading mb-4 text-trust-blue">
              Manufacturing Roles We Staff
            </h2>
            <p className="text-lg text-wisdom-gray-600 max-w-3xl mx-auto">
              From production specialists to quality control managers, we deliver skilled talent for every manufacturing role.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-success-green transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-success-green-50 rounded-lg flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success-green" />
                  </div>
                  <h3 className="font-semibold text-trust-blue-700">{role}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-success-green to-success-green-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Build Your Manufacturing Team?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Talk to us about your plant goals and we'll align the right team to deliver them.
          </p>
          <Link href="/contact" className="btn-primary inline-flex items-center">
            Start Your Search
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

