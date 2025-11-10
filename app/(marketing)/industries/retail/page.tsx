import { ArrowRight, CheckCircle2, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Retail Staffing & Recruitment | InTime eSolutions',
  description: 'Retail talent for stores, e-commerce, merchandising, and operations. From store associates to retail executives—seasonal, permanent, and leadership roles.',
  keywords: 'retail staffing, store manager jobs, retail associate, merchandiser, visual merchandiser, e-commerce manager, retail recruitment',
};

export default function RetailPage() {
  const roles = [
    'Store Manager',
    'Assistant Store Manager',
    'Retail Associate',
    'Sales Associate',
    'Cashier',
    'Visual Merchandiser',
    'Merchandising Manager',
    'Inventory Manager',
    'Loss Prevention Specialist',
    'E-Commerce Manager',
    'Buyer / Purchasing Manager',
    'Category Manager',
    'Retail Operations Manager',
    'District Manager',
    'Regional Manager',
    'Customer Service Manager',
    'Store Supervisor',
    'POS System Administrator',
    'Retail Analyst',
    'Retail Marketing Manager',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <ShoppingBag className="h-4 w-4" />
              <span className="text-sm font-medium">Retail Staffing & Recruitment</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Retail Talent That Drives Sales & Delights Customers
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              From Black Friday surge staffing to permanent store managers—InTime delivers retail talent who understand customer service, POS systems, and merchandising. 79% of retailers report staffing shortages. We fill stores fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find Retail Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Our Retail Expertise
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
              Retail Staffing at Scale
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: 'Seasonal Surge Staffing', desc: 'Black Friday? Holiday rush? We deploy 100+ associates in 48 hours.' },
                { title: 'POS Certified', desc: 'Square, Shopify POS, Clover, NCR—our talent knows the systems.' },
                { title: 'Customer Service Focus', desc: 'Every candidate screened: customer-first mindset, conflict resolution.' },
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
                <strong className="text-trust-blue">The Retail Talent Crisis:</strong> 79% of retailers can't find qualified staff. Holiday season demands 300% more workers. Store openings delay 6+ months waiting for managers.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers retail talent fast—from seasonal associates to store managers, merchandisers to district leaders. All customer-service trained. All POS-certified. Whether you need 1 store manager or 100 holiday associates, we staff in 48 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-4 text-trust-blue text-center">
            Retail Roles We Staff
          </h2>
          <p className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto">
            From sales floors to corporate offices—store associates, managers, merchandisers, buyers, and e-commerce specialists.
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

      {/* Why Retailers Choose InTime */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Why Retailers Choose InTime
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
                    Holiday Surge Staffing
                  </h3>
                  <p className="text-wisdom-gray">
                    Black Friday? Christmas rush? We deploy 100+ trained associates in 48 hours.
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
                    Store Opening Teams
                  </h3>
                  <p className="text-wisdom-gray">
                    New location? We staff entire stores—manager, associates, stockers—day one ready.
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
                    POS System Experts
                  </h3>
                  <p className="text-wisdom-gray">
                    Square, Shopify POS, Clover, NCR, Lightspeed—our talent knows the platforms.
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
                    Multi-Store Scaling
                  </h3>
                  <p className="text-wisdom-gray">
                    Expanding 10 stores? 100 stores? We scale staffing with your growth.
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
              Retail Staffing By The Numbers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold text-trust-blue mb-2">48hrs</div>
                <div className="text-wisdom-gray-600">Average response time for seasonal staffing</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-success-green mb-2">91%</div>
                <div className="text-wisdom-gray-600">Associate retention rate (seasonal)</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-innovation-orange mb-2">$5.6T</div>
                <div className="text-wisdom-gray-600">US retail market we serve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Need Retail Talent? We Staff Fast.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Whether you need 1 store manager or 100 holiday associates—we staff in 48 hours, trained, and ready to sell.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary">
              Request Retail Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline">
              View Retail Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

