import { ArrowRight, CheckCircle2, Factory } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Manufacturing Staffing & Recruitment | InTime eSolutions',
  description: 'Manufacturing talent for production, quality, engineering, and operations. From CNC operators to plant managers—Lean Six Sigma certified teams.',
  keywords: 'manufacturing staffing, production jobs, CNC machinist, quality engineer, plant manager, manufacturing recruitment, lean six sigma',
};

export default function ManufacturingPage() {
  const roles = [
    'Production Manager',
    'Plant Manager',
    'Manufacturing Engineer',
    'Quality Engineer',
    'CNC Machinist',
    'CNC Programmer',
    'Maintenance Technician',
    'Industrial Electrician',
    'Process Engineer',
    'Lean Six Sigma Specialist',
    'Production Supervisor',
    'Quality Control Inspector',
    'Assembly Line Worker',
    'Welder / Fabricator',
    'Tool & Die Maker',
    'Supply Chain Coordinator',
    'Operations Manager',
    'EHS Manager (Environmental Health & Safety)',
    'Automation Engineer',
    'Continuous Improvement Manager',
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
              <span className="text-sm font-medium">Manufacturing Staffing & Recruitment</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Manufacturing Talent That Keeps Lines Running
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              From CNC machinists to plant managers—InTime delivers Lean Six Sigma certified teams who understand OEE, 5S, and production deadlines. 86% of manufacturers report skill shortages. We fill that gap fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find Manufacturing Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Our Manufacturing Expertise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Built for Manufacturing Scale & Speed */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-8 text-trust-blue text-center">
              Built for Manufacturing Scale & Speed
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: '48-Hour Staffing', desc: 'Production line down? We deploy skilled workers within 48 hours.' },
                { title: 'Lean Six Sigma Certified', desc: 'All talent trained: 5S, Kaizen, OEE, SMED—we speak manufacturing.' },
                { title: 'Multi-Shift Coverage', desc: '1st, 2nd, 3rd shift—weekends, holidays—we staff 24/7/365.' },
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
                <strong className="text-trust-blue">The Manufacturing Skills Gap:</strong> 86% of manufacturers can't find qualified workers. Production lines sit idle. Quality defects spike. Overtime costs explode.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers skilled manufacturing talent fast—CNC operators, maintenance techs, quality engineers, plant managers. All Lean Six Sigma certified. All ready to hit the floor running. Whether you need 1 machinist or 100 production workers, we staff in 48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-4 text-trust-blue text-center">
            Manufacturing Roles We Staff
          </h2>
          <p className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto">
            From production floors to plant management—CNC, welding, quality, maintenance, engineering, and leadership.
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

      {/* Why Manufacturers Choose InTime */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Why Manufacturers Choose InTime
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
                    Emergency Production Staffing
                  </h3>
                  <p className="text-wisdom-gray">
                    Line down? Rush order? We deploy CNC operators, welders, and assemblers in 48 hours.
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
                    Lean Six Sigma Teams
                  </h3>
                  <p className="text-wisdom-gray">
                    All talent trained: 5S, Kaizen, OEE, SMED, root cause analysis—we speak manufacturing.
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
                    Multi-Shift Flexibility
                  </h3>
                  <p className="text-wisdom-gray">
                    1st, 2nd, 3rd shift—weekends, holidays—we staff around the clock.
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
                    Safety-Certified Workforce
                  </h3>
                  <p className="text-wisdom-gray">
                    OSHA 10/30, forklift certified, lockout/tagout trained—safety is non-negotiable.
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
              Manufacturing Staffing By The Numbers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold text-trust-blue mb-2">48hrs</div>
                <div className="text-wisdom-gray-600">Average time to first candidate on floor</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-success-green mb-2">95%</div>
                <div className="text-wisdom-gray-600">Placement retention rate (12 months)</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-innovation-orange mb-2">$2.3T</div>
                <div className="text-wisdom-gray-600">US manufacturing market we serve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Keep Your Lines Running. Staff Fast.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Whether you need 1 CNC machinist or 100 production workers—we staff in 48 hours, trained, certified, and ready to produce.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary">
              Request Manufacturing Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline">
              View Manufacturing Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

