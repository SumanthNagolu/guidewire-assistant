import Link from 'next/link';
import { ArrowRight, Brain, TrendingUp, Shield, Users, BarChart3, Network, Sparkles } from 'lucide-react';

export const metadata = {
  title: 'Consulting Services | InTime eSolutions - Enterprise Strategy + AI Innovation',
  description: 'Enterprise consulting: strategy, technology, operations, risk, data/AI. PLUS custom AI solutions for schools, restaurants, retail, and professional services.',
  keywords: 'consulting services, strategy consulting, technology consulting, AI solutions, digital transformation, custom software',
};

export default function ConsultingPage() {
  const enterpriseServices = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Strategy & Transformation',
      description: 'Corporate strategy, M&A advisory, market entry, and digital transformation planning.',
      features: ['Digital transformation', 'M&A due diligence', 'Market entry strategy', 'Business model innovation'],
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'Technology & Innovation',
      description: 'Cloud migration, enterprise architecture, legacy modernization, and IT strategy.',
      features: ['Cloud transformation', 'Enterprise architecture', 'Legacy modernization', 'IT strategy'],
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Risk & Compliance',
      description: 'Regulatory compliance, cybersecurity, internal audit, and risk assessment.',
      features: ['Cybersecurity assessment', 'Compliance (GDPR, SOX)', 'Risk management', 'Internal audit'],
    },
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Workforce Transformation',
      description: 'Talent strategy, organizational design, leadership development, and HR technology.',
      features: ['Organizational design', 'Talent acquisition strategy', 'Leadership development', 'HR technology'],
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      title: 'Process Optimization',
      description: 'Lean Six Sigma, process mining, RPA, and operational efficiency.',
      features: ['Process improvement', 'Robotic Process Automation', 'Supply chain optimization', 'Cost reduction'],
    },
    {
      icon: <Network className="h-8 w-8" />,
      title: 'Data & AI Strategy',
      description: 'Data strategy, AI/ML implementation, business intelligence, and predictive analytics.',
      features: ['Data strategy & governance', 'AI/ML model development', 'Business intelligence', 'Predictive analytics'],
    },
  ];

  const aiCustomSolutions = [
    {
      icon: '🎓',
      title: 'Education Platforms',
      description: 'Custom LMS, AI tutors, student tracking, assessment automation.',
    },
    {
      icon: '🏪',
      title: 'Retail & Hospitality',
      description: 'POS systems, inventory management, loyalty programs, staff scheduling.',
    },
    {
      icon: '💼',
      title: 'Professional Services',
      description: 'Practice management, client portals, billing automation, compliance tools.',
    },
    {
      icon: '✨',
      title: 'Manager Tools',
      description: 'Leadership dashboards, OKR tracking, team collaboration, performance reviews.',
    },
  ];

  const trending = [
    { icon: '🔥', text: 'AI-Powered Custom Solutions for Schools & Restaurants', badge: 'NEW' },
    { icon: '⚡', text: 'Enterprise Digital Transformation - Start to Finish', badge: 'HOT' },
    { icon: '🌍', text: 'SMB Consulting (Under $50M Revenue)', badge: 'TRENDING' },
  ];

  return (
    <>
      {/* Trending Banner */}
      <div className="bg-gradient-to-r from-innovation-orange-500 to-trust-blue-600 text-white py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
          {[...trending, ...trending].map((item, index) => (
            <div key={index} className="inline-flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold">{item.text}</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{item.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-innovation-orange-600 text-white py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <span className="text-sm font-semibold">🏆 ENTERPRISE + AI + CUSTOM SOLUTIONS</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Consulting That Moves Boardrooms & Main Streets
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-4xl mx-auto">
              From Fortune 500 strategy to corner-store POS systems—we deliver enterprise consulting excellence PLUS custom AI solutions for businesses of all sizes. No project too big. No business too small.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
                <span>Schedule Strategy Session</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/consulting/competencies" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4">
                View Our Competencies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Consulting */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <div className="inline-block bg-trust-blue-50 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold text-trust-blue">ENTERPRISE CONSULTING</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Strategy. Technology. Transformation.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We deliver the full spectrum of enterprise consulting—from C-suite strategy to hands-on implementation. Faster delivery. Better rates. Same expertise.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enterpriseServices.map((service, index) => (
              <Link
                key={index}
                href="/consulting/services"
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-trust-blue group"
              >
                <div className="h-16 w-16 bg-trust-blue-50 rounded-xl flex items-center justify-center mb-6 text-trust-blue group-hover:bg-trust-blue group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                  {service.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {service.description}
                </p>
                <div className="space-y-2">
                  {service.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                      <div className="h-1.5 w-1.5 bg-success-green rounded-full flex-shrink-0 mt-1.5"></div>
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex items-center text-trust-blue font-semibold text-sm group-hover:gap-2 transition-all">
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/consulting/services" className="btn-primary inline-flex items-center gap-2">
              View All Enterprise Services
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* AI Custom Solutions */}
      <section className="py-20 bg-gradient-to-br from-innovation-orange-50 to-trust-blue-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <div className="inline-block bg-innovation-orange-100 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold text-innovation-orange-700">🚀 OUR UNIQUE EDGE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              AI Solutions for Schools, Restaurants, Retail & More
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              While others chase billion-dollar deals, we also build custom AI-powered tools for small businesses. Big impact. Small budgets. Real solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {aiCustomSolutions.map((solution, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-innovation-orange text-center"
              >
                <div className="text-6xl mb-4">{solution.icon}</div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">
                  {solution.title}
                </h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {solution.description}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link href="/consulting/services" className="btn-secondary inline-flex items-center gap-2">
              Explore Custom Solutions
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Why InTime Consulting */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-center text-gray-900 mb-12">
              Why Choose InTime for Consulting?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-20 w-20 bg-success-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">3x Faster Delivery</h3>
                <p className="text-gray-600">
                  Enterprise projects delivered in 4 months, not 12. Same quality. Less process bloat.
                </p>
              </div>
              <div className="text-center">
                <div className="h-20 w-20 bg-trust-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">40-60% Lower Cost</h3>
                <p className="text-gray-600">
                  Enterprise-quality consulting at $150-250/hr. No $500/hr partner rates.
                </p>
              </div>
              <div className="text-center">
                <div className="h-20 w-20 bg-innovation-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">SMB to Enterprise</h3>
                <p className="text-gray-600">
                  We serve everyone—from $500K startups to Fortune 500. No minimums. No gatekeeping.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries */}
      <section className="py-20 bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Industries We Transform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From Wall Street to Main Street—we bring enterprise expertise to every industry.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {['Financial Services', 'Healthcare', 'Manufacturing', 'Retail', 'Technology', 'Education', 'Legal', 'Real Estate', 'Hospitality', 'Energy', 'Transportation', 'Government'].map((industry, i) => (
              <div key={i} className="bg-white rounded-lg px-4 py-3 text-center text-sm font-medium text-gray-700 hover:shadow-md transition-shadow">
                {industry}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue-600 to-innovation-orange-500 text-white">
        <div className="section-container text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to Transform Your Business?
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-3xl mx-auto">
            Whether you need enterprise strategy or a custom POS for your coffee shop—let's talk. Free 30-minute strategy session. No sales pitch. Just honest advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
              <span>Book Free Strategy Session</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4">
              View Consulting Roles
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold mb-2">🇺🇸 USA</div>
              <a href="tel:+13076502850" className="text-white/90 hover:text-white text-lg">+1 307-650-2850</a>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">🇨🇦 Canada</div>
              <a href="tel:+12892369000" className="text-white/90 hover:text-white text-lg">+1 289-236-9000</a>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">🇮🇸 India</div>
              <a href="tel:+917981666144" className="text-white/90 hover:text-white text-lg">+91 798-166-6144</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

