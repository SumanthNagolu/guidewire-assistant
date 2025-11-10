import Link from 'next/link';
import { ArrowRight, Zap, Users, Globe, GraduationCap, Brain, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Our Solutions | InTime eSolutions - IT Staffing, Consulting, Training & More',
  description: 'Comprehensive workforce solutions: IT staffing, enterprise consulting, cross-border talent mobility, and Guidewire training. Transform your team with InTime.',
  keywords: 'IT staffing, consulting services, cross-border hiring, training solutions, workforce solutions, talent acquisition',
};

export default function SolutionsPage() {
  const solutions = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'IT Staffing',
      slug: 'it-staffing',
      description: 'Contract, contract-to-hire, and direct placement for all tech roles. 95% first-submission success. 24-hour placement guarantee.',
      features: ['24-48 hour placements', '95% first-submission success', '90-day warranty', 'All tech stacks'],
      stats: { label: 'Placements/Year', value: '2,000+' },
      color: 'from-trust-blue to-trust-blue-600'
    },
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'Consulting',
      slug: 'consulting',
      description: 'Big 4-level enterprise consulting PLUS custom AI/B2C solutions. Strategy, technology, operations, and digital transformation.',
      features: ['Enterprise transformation', 'AI & custom solutions', 'Big 4 expertise', 'SMB to Fortune 500'],
      stats: { label: 'Cost Savings', value: '40-60%' },
      color: 'from-innovation-orange to-innovation-orange-600'
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Cross-Border Solutions',
      slug: 'cross-border',
      description: 'Move talent across 50+ countries. H1B to Canada, India to USA, UK to North America—visas, compliance, and placement.',
      features: ['50+ countries covered', 'Visa & compliance handled', 'Relocation support', 'Fast processing'],
      stats: { label: 'Success Rate', value: '98%' },
      color: 'from-success-green to-success-green-600'
    },
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: 'Training & Development',
      slug: 'training',
      description: 'Guidewire certification, upskilling programs, corporate training, and custom learning paths. Build your internal talent pipeline.',
      features: ['Guidewire certification', 'Corporate training', 'Custom curriculums', 'Job placement support'],
      stats: { label: 'Certified Annually', value: '500+' },
      color: 'from-trust-blue-600 to-innovation-orange-500'
    },
  ];

  const trending = [
    { icon: '🔥', text: 'AI-Powered Custom Solutions for Schools, Restaurants & Retail', badge: 'NEW' },
    { icon: '⚡', text: 'Same-Day Guidewire Developer Placements', badge: 'HOT' },
    { icon: '🌍', text: 'H1B to Canada Express Track (3-Month Visa)', badge: 'TRENDING' },
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
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <span className="text-sm font-semibold">💼 COMPLETE WORKFORCE SOLUTIONS</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Four Solutions. One Partner. Infinite Possibilities.
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-4xl mx-auto">
              From emergency contractor placements to global talent mobility, enterprise consulting to Guidewire training—InTime delivers the full spectrum of workforce solutions. Choose one. Choose all. We scale with you.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
                <span>Discuss Your Needs</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4">
                See Our Story
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Grid */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Solutions Built for Real Business Challenges
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Whether you need one developer tomorrow or a global transformation strategy—we deliver.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 mb-16">
            {solutions.map((solution, index) => (
              <Link
                key={index}
                href={`/solutions/${solution.slug}`}
                className="group bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-trust-blue relative overflow-hidden"
              >
                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${solution.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                
                <div className="relative z-10">
                  <div className="h-16 w-16 bg-trust-blue-50 rounded-2xl flex items-center justify-center mb-6 text-trust-blue group-hover:bg-trust-blue group-hover:text-white transition-all">
                    {solution.icon}
                  </div>
                  
                  <h3 className="text-3xl font-heading font-bold text-gray-900 mb-3 group-hover:text-trust-blue transition-colors">
                    {solution.title}
                  </h3>
                  
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {solution.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 mb-6">
                    {solution.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="h-1.5 w-1.5 bg-success-green rounded-full flex-shrink-0"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="text-3xl font-bold text-trust-blue">{solution.stats.value}</div>
                    <div className="text-sm text-gray-600">{solution.stats.label}</div>
                  </div>

                  <div className="flex items-center text-trust-blue font-semibold text-sm group-hover:gap-2 transition-all">
                    Learn More
                    <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose InTime */}
      <section className="py-20 bg-gradient-to-br from-trust-blue-50 to-success-green-50">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-center text-gray-900 mb-12">
              Why Companies Choose InTime for All Their Workforce Needs
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-20 w-20 bg-trust-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="h-10 w-10 text-trust-blue" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">Lightning Fast</h3>
                <p className="text-gray-600">
                  24-48 hour placements. Same-week consulting kickoffs. 3-month visa processing. Speed is our default.
                </p>
              </div>
              <div className="text-center">
                <div className="h-20 w-20 bg-success-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <TrendingUp className="h-10 w-10 text-success-green" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">Proven Results</h3>
                <p className="text-gray-600">
                  95% placement success. 98% cross-border visa approval. 40-60% cost savings vs Big 4.
                </p>
              </div>
              <div className="text-center">
                <div className="h-20 w-20 bg-innovation-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="h-10 w-10 text-innovation-orange" />
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">One Partner, All Solutions</h3>
                <p className="text-gray-600">
                  Stop juggling 5 vendors. One relationship. One invoice. Complete workforce transformation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue-600 to-innovation-orange-500 text-white">
        <div className="section-container text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to Transform Your Workforce?
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-3xl mx-auto">
            Whether you need one contractor, enterprise consulting, global mobility, or training—let's talk. Free 30-minute consultation. No sales pitch. Just solutions.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
              <span>Schedule Free Consultation</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4">
              Explore Opportunities
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
              <div className="text-4xl font-bold mb-2">🇮🇳 India</div>
              <a href="tel:+917981666144" className="text-white/90 hover:text-white text-lg">+91 798-166-6144</a>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

