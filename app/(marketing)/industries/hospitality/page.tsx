import { ArrowRight, CheckCircle2, Utensils } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Hospitality Staffing & Recruitment | InTime eSolutions',
  description: 'Hospitality talent for hotels, restaurants, events, and tourism. From front desk to executive chefs—immediate deployment for peak season.',
  keywords: 'hospitality staffing, hotel jobs, restaurant manager, executive chef, front desk, hospitality recruitment',
};

export default function HospitalityPage() {
  const roles = [
    'Hotel Manager',
    'Front Desk Manager',
    'Guest Services Manager',
    'Restaurant Manager',
    'Executive Chef',
    'Sous Chef',
    'Line Cook',
    'Bartender',
    'Server / Waiter',
    'Catering Manager',
    'Event Coordinator',
    'Banquet Manager',
    'Housekeeping Manager',
    'Concierge',
    'Revenue Manager',
    'Food & Beverage Director',
    'Hospitality IT Manager',
    'Sales Manager (Hospitality)',
    'Marketing Manager (Hotels)',
    'Operations Manager',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Utensils className="h-4 w-4" />
              <span className="text-sm font-medium">Hospitality Staffing & Recruitment</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Hospitality Talent That Delivers Excellence
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              From luxury hotels to quick-service restaurants—InTime delivers hospitality professionals who understand guest experience, food safety, and operational excellence. 83% of hospitality operators report critical staffing shortages. We fill shifts fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find Hospitality Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Our Hospitality Expertise
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
              Built for Hospitality Speed & Service
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: 'Peak Season Ready', desc: 'Holiday rush? Event season? We staff 100+ in 48 hours.' },
                { title: 'Food Safety Certified', desc: 'ServSafe, HACCP—all culinary talent certified.' },
                { title: '24/7 Operations Support', desc: 'Hotels never close. Neither do we. Staff anytime.' },
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
                <strong className="text-trust-blue">The Hospitality Talent Shortage:</strong> 83% of hotels and restaurants can't find qualified staff. Summer season hits, events ramp up, new openings delay—all waiting for talent.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers hospitality talent fast—executive chefs, hotel managers, front desk teams, event coordinators. All customer-service focused. All food-safety certified. Whether you need one manager or 50 seasonal workers, we staff in 48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-4 text-trust-blue text-center">
            Hospitality Roles We Staff
          </h2>
          <p className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto">
            From front desk to back-of-house—hotels, restaurants, events, and catering talent.
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

      {/* Why Hospitality Operators Choose InTime */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Why Hospitality Operators Choose InTime
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
                    Emergency Staffing (24-48hrs)
                  </h3>
                  <p className="text-wisdom-gray">
                    Wedding this weekend? Conference Monday? We deploy teams overnight.
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
                    Food Safety Certified
                  </h3>
                  <p className="text-wisdom-gray">
                    ServSafe, HACCP, allergen training—all culinary staff certified.
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
                    Guest Experience Focus
                  </h3>
                  <p className="text-wisdom-gray">
                    Every candidate screened: customer service attitude, conflict resolution skills.
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
                    Seasonal Scaling
                  </h3>
                  <p className="text-wisdom-gray">
                    Summer rush? Holiday season? We scale from 10 to 100 staff seamlessly.
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
              Hospitality Staffing By The Numbers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold text-trust-blue mb-2">48hrs</div>
                <div className="text-wisdom-gray-600">Average response time for emergency staffing</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-success-green mb-2">89%</div>
                <div className="text-wisdom-gray-600">Staff retention rate (seasonal)</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-innovation-orange mb-2">$1.2T</div>
                <div className="text-wisdom-gray-600">US hospitality market we serve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Need Hospitality Talent? We Staff Fast.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Whether you need one executive chef or 100 event staff—we staff in 48 hours, certified, and guest-ready.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary">
              Request Hospitality Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline">
              View Hospitality Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
