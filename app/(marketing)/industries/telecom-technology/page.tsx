import { ArrowRight, CheckCircle2, Smartphone } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Telecom & Technology Staffing | InTime eSolutions',
  description: 'Telecom talent for 5G, network infrastructure, ISPs, and wireless. From network engineers to field technicians—immediate deployment.',
  keywords: 'telecom staffing, 5G engineer jobs, network engineer, telecommunications recruitment, ISP jobs, wireless engineer',
};

export default function TelecomTechnologyPage() {
  const roles = [
    'Network Engineer',
    '5G Network Engineer',
    'Telecommunications Engineer',
    'RF Engineer',
    'Wireless Network Engineer',
    'Network Architect',
    'NOC Engineer',
    'Field Technician',
    'Tower Technician',
    'Fiber Optic Technician',
    'VoIP Engineer',
    'Network Operations Manager',
    'Telecom Project Manager',
    'OSP Engineer (Outside Plant)',
    'ISP Operations Manager',
    'Wireless Site Acquisition',
    'Telecom Analyst',
    'Network Security Engineer',
    'Carrier Relations Manager',
    'Telecommunications Consultant',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Smartphone className="h-4 w-4" />
              <span className="text-sm font-medium">Telecom & Technology Staffing</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Telecom Talent That Keeps the World Connected
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              From 5G rollouts to fiber deployments—InTime delivers telecom professionals who understand network architecture, RF engineering, and carrier operations. 81% of telecom companies report critical skill shortages. We connect you with talent fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find Telecom Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Our Telecom Expertise
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
              Built for Telecom Scale & Speed
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: '5G Specialists', desc: 'From spectrum planning to small cell deployment—we staff 5G.' },
                { title: 'Carrier-Grade Talent', desc: 'Verizon, AT&T, T-Mobile veterans—our network knows networks.' },
                { title: 'Field & NOC', desc: 'Tower climbers to NOC engineers—complete coverage.' },
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
                <strong className="text-trust-blue">The Telecom Talent Gap:</strong> 81% of carriers and ISPs can't find qualified engineers. 5G rollouts delay. Fiber deployments slow. Network operations centers run understaffed.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers telecom talent fast—5G network engineers, RF specialists, fiber technicians, NOC operators. All carrier-trained. All safety-certified. Whether you're deploying 5G or expanding fiber, we staff in 72 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-4 text-trust-blue text-center">
            Telecom & Technology Roles We Staff
          </h2>
          <p className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto">
            From network planning to field deployment—engineers, technicians, and operations specialists.
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

      {/* Why Telecom Companies Choose InTime */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Why Telecom Companies Choose InTime
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
                    5G Deployment Teams
                  </h3>
                  <p className="text-wisdom-gray">
                    From RF planning to small cell install—complete 5G rollout staffing.
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
                    Carrier Experience
                  </h3>
                  <p className="text-wisdom-gray">
                    Our engineers have built networks for Verizon, AT&T, T-Mobile, regional carriers.
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
                    Safety-Certified Field Crews
                  </h3>
                  <p className="text-wisdom-gray">
                    OSHA 10/30, tower climbing certified, confined space trained—safety first.
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
                    24/7 NOC Coverage
                  </h3>
                  <p className="text-wisdom-gray">
                    Networks never sleep. We staff NOC engineers around the clock.
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
              Telecom Staffing By The Numbers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold text-trust-blue mb-2">72hrs</div>
                <div className="text-wisdom-gray-600">Average time to deploy telecom teams</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-success-green mb-2">96%</div>
                <div className="text-wisdom-gray-600">Engineer retention rate (projects)</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-innovation-orange mb-2">$1.7T</div>
                <div className="text-wisdom-gray-600">Global telecom market we serve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Need Telecom Talent? We Connect Fast.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Whether you need one 5G engineer or 50 field techs—we staff in 72 hours, certified, and ready to deploy.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary">
              Request Telecom Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline">
              View Telecom Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
