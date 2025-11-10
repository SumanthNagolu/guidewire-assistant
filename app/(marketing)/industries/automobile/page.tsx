import { ArrowRight, CheckCircle2, Car } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Automotive Staffing & Recruitment | InTime eSolutions',
  description: 'Automotive talent for OEMs, suppliers, and EV companies. From automotive engineers to manufacturing—design, production, and quality.',
  keywords: 'automotive staffing, automotive engineer jobs, EV engineer recruitment, car manufacturing jobs, automotive designer',
};

export default function AutomobilePage() {
  const roles = [
    'Automotive Engineer',
    'Mechanical Engineer (Automotive)',
    'Electrical Engineer (EV)',
    'Powertrain Engineer',
    'Battery Systems Engineer',
    'Automotive Designer',
    'CAD Designer (Automotive)',
    'Manufacturing Engineer',
    'Quality Engineer (Automotive)',
    'Test Engineer',
    'Vehicle Dynamics Engineer',
    'Safety Engineer (Automotive)',
    'Embedded Systems Engineer',
    'Software Engineer (Automotive)',
    'Autonomous Vehicle Engineer',
    'Production Manager',
    'Supply Chain Manager (Automotive)',
    'Plant Manager (Automotive)',
    'Quality Control Inspector',
    'R&D Engineer (Automotive)',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Car className="h-4 w-4" />
              <span className="text-sm font-medium">Automotive Staffing & Recruitment</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Automotive Talent That Drives Innovation
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              From traditional OEMs to EV startups—InTime delivers automotive talent who understand vehicle dynamics, powertrain systems, and battery technology. 88% of automotive companies report critical skill shortages. We solve that fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find Automotive Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Our Automotive Expertise
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
              Built for Automotive Speed & Scale
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: 'EV & Traditional', desc: 'From combustion engines to battery systems—we staff both.' },
                { title: 'OEM to Tier 3', desc: 'Toyota to local suppliers—full automotive supply chain coverage.' },
                { title: 'Design to Production', desc: 'CAD designers to plant managers—complete lifecycle staffing.' },
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
                <strong className="text-trust-blue">The Automotive Talent Crisis:</strong> 88% of automotive companies can't find qualified engineers. EV transition demands new skills. Production lines sit idle waiting for talent.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers automotive talent fast—powertrain engineers, battery specialists, manufacturing experts, quality engineers. Whether you're launching an EV or ramping production, we staff in 72 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-4 text-trust-blue text-center">
            Automotive Roles We Staff
          </h2>
          <p className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto">
            From design studios to production floors—engineers, designers, manufacturing, and quality talent.
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

      {/* Why Automotive Companies Choose InTime */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Why Automotive Companies Choose InTime
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
                    EV & Battery Expertise
                  </h3>
                  <p className="text-wisdom-gray">
                    From lithium-ion to solid-state—our battery engineers know the latest tech.
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
                    Rapid Production Staffing
                  </h3>
                  <p className="text-wisdom-gray">
                    New model launch? Plant expansion? We staff 50+ workers in 72 hours.
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
                    IATF 16949 Certified
                  </h3>
                  <p className="text-wisdom-gray">
                    All quality engineers certified in automotive quality management standards.
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
                    CAD/CAE Specialists
                  </h3>
                  <p className="text-wisdom-gray">
                    CATIA, NX, SolidWorks, ANSYS—our designers know automotive design tools.
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
              Automotive Staffing By The Numbers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold text-trust-blue mb-2">72hrs</div>
                <div className="text-wisdom-gray-600">Average time to deploy automotive talent</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-success-green mb-2">94%</div>
                <div className="text-wisdom-gray-600">Placement success rate (OEM + Tier 1)</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-innovation-orange mb-2">$3.5T</div>
                <div className="text-wisdom-gray-600">Global automotive market we serve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Accelerate Your Automotive Team?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Whether you need EV battery engineers or production line workers—we staff fast, certified, and ready to build.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary">
              Request Automotive Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline">
              View Automotive Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
