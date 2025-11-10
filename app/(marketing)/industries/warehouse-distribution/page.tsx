import { ArrowRight, CheckCircle2, Package } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Warehouse & Distribution Staffing | InTime eSolutions',
  description: 'Warehouse, distribution, and fulfillment talent. From warehouse associates to distribution managers—WMS certified, forklift trained, ready for peak season.',
  keywords: 'warehouse staffing, distribution jobs, forklift operator, warehouse manager, fulfillment center, order picker, warehouse associate',
};

export default function WarehouseDistributionPage() {
  const roles = [
    'Warehouse Manager',
    'Distribution Manager',
    'Warehouse Supervisor',
    'Forklift Operator',
    'Order Picker / Packer',
    'Shipping & Receiving Clerk',
    'Warehouse Associate',
    'Material Handler',
    'Inventory Control Specialist',
    'Warehouse Coordinator',
    'Distribution Coordinator',
    'Fulfillment Manager',
    'Dock Supervisor',
    'Logistics Coordinator',
    'WMS Administrator',
    'Cycle Counter',
    'Quality Control Inspector',
    'Warehouse Safety Coordinator',
    'Returns Processor',
    'Cross-Dock Coordinator',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Package className="h-4 w-4" />
              <span className="text-sm font-medium">Warehouse & Distribution Staffing</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Warehouse Talent That Ships On Time
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              From forklift operators to distribution managers—InTime delivers WMS-certified, safety-trained warehouse teams ready for peak season, same-day fulfillment, and 24/7 operations. 84% of warehouses report staffing shortages. We solve that overnight.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find Warehouse Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Our Warehouse Expertise
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
              Built for Warehouse Speed & Scale
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: 'Peak Season Surge Staffing', desc: 'Q4 rush? We deploy 100+ warehouse workers in 48 hours.' },
                { title: 'Safety & Certification', desc: 'OSHA 10, forklift certified, RF scanner trained—day one ready.' },
                { title: '24/7 Operations Support', desc: 'Night shifts, weekends, holidays—we staff around the clock.' },
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
                <strong className="text-trust-blue">The Warehouse Talent Shortage:</strong> 84% of warehouses can't find qualified workers. Peak season demand spikes 400%. Same-day shipping requires 24/7 staffing.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers warehouse teams fast—forklift operators, order pickers, distribution managers, fulfillment coordinators. All safety-certified. All WMS-trained. Whether you need 1 warehouse manager or 100 seasonal pickers, we staff in 48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-4 text-trust-blue text-center">
            Warehouse & Distribution Roles We Staff
          </h2>
          <p className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto">
            From warehouse floors to distribution management—forklift operators, order pickers, inventory specialists, and more.
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

      {/* Why Warehouse Operators Choose InTime */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Why Warehouse Operators Choose InTime
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
                    Emergency Surge Staffing
                  </h3>
                  <p className="text-wisdom-gray">
                    Black Friday rush? Prime Day surge? We deploy 100+ warehouse workers in 48 hours.
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
                    WMS Certified Teams
                  </h3>
                  <p className="text-wisdom-gray">
                    SAP EWM, Manhattan, Blue Yonder, Oracle—our teams know the systems.
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
                    Safety-First Culture
                  </h3>
                  <p className="text-wisdom-gray">
                    OSHA 10/30, forklift certified, RF scanner trained—all workers safety-cleared.
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
                    Multi-Shift Coverage
                  </h3>
                  <p className="text-wisdom-gray">
                    1st, 2nd, 3rd shift—weekends, holidays—we staff 24/7/365.
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
              Warehouse Staffing By The Numbers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold text-trust-blue mb-2">48hrs</div>
                <div className="text-wisdom-gray-600">Average response time for surge staffing</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-success-green mb-2">96%</div>
                <div className="text-wisdom-gray-600">Worker safety record (no incidents)</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-innovation-orange mb-2">$450B</div>
                <div className="text-wisdom-gray-600">US warehousing market we serve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Need Warehouse Talent? We Deliver Fast.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Whether you need 1 warehouse manager or 100 seasonal pickers—we staff in 48 hours, certified, and ready to ship.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary">
              Request Warehouse Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline">
              View Warehouse Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

