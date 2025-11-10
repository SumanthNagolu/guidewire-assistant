import { ArrowRight, Brain, TrendingUp, Shield, Users, Code2, BarChart3, Network, Sparkles, Store, GraduationCap, Building2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Consulting Services | InTime eSolutions - Big 4 Excellence + AI Innovation',
  description: 'Enterprise consulting rivaling Deloitte, EY, PwC—strategy, technology, operations, risk. PLUS AI-powered B2C solutions: teaching platforms, POS systems, custom tools.',
  keywords: 'management consulting, strategy consulting, technology consulting, digital transformation, AI solutions, custom software, business consulting, enterprise solutions',
};

export default function ServicesPage() {
  const enterpriseServices = [
    {
      icon: <TrendingUp className="h-8 w-8" />,
      category: 'Strategy & Transformation',
      title: 'Business Strategy Consulting',
      description: 'Corporate strategy, growth planning, M&A advisory, and market entry. We help C-suite executives make decisions that move markets.',
      features: ['Digital transformation strategy', 'M&A due diligence & integration', 'Market entry & expansion', 'Business model innovation', 'Change management'],
    },
    {
      icon: <Brain className="h-8 w-8" />,
      category: 'Technology & Innovation',
      title: 'Technology Transformation',
      description: 'Cloud migration, enterprise architecture, legacy modernization, and IT strategy. From mainframes to microservices.',
      features: ['Cloud transformation (AWS, Azure, GCP)', 'Enterprise architecture design', 'Legacy system modernization', 'API strategy & integration', 'DevOps & CI/CD implementation'],
    },
    {
      icon: <Shield className="h-8 w-8" />,
      category: 'Risk & Compliance',
      title: 'Risk Management & Cybersecurity',
      description: 'Regulatory compliance (SOC 2, GDPR, HIPAA), cybersecurity, internal audit, and risk assessment.',
      features: ['Cybersecurity assessment & remediation', 'Compliance (GDPR, SOX, HIPAA)', 'Risk management frameworks', 'Internal audit services', 'Business continuity planning'],
    },
    {
      icon: <Users className="h-8 w-8" />,
      category: 'Human Capital',
      title: 'Workforce Transformation',
      description: 'Talent strategy, organizational design, leadership development, and HR technology implementation.',
      features: ['Organizational design', 'Talent acquisition strategy', 'Leadership development programs', 'HR technology (Workday, SAP SuccessFactors)', 'Change & culture transformation'],
    },
    {
      icon: <BarChart3 className="h-8 w-8" />,
      category: 'Operations Excellence',
      title: 'Process Optimization & Automation',
      description: 'Lean Six Sigma, process mining, RPA, supply chain optimization, and operational efficiency.',
      features: ['Process improvement (Lean Six Sigma)', 'Robotic Process Automation (RPA)', 'Supply chain optimization', 'Cost reduction programs', 'Performance management'],
    },
    {
      icon: <Network className="h-8 w-8" />,
      category: 'Digital & Analytics',
      title: 'Data & AI Strategy',
      description: 'Data strategy, AI/ML implementation, business intelligence, predictive analytics, and data governance.',
      features: ['Data strategy & governance', 'AI/ML model development', 'Business intelligence (Power BI, Tableau)', 'Predictive analytics', 'Big data engineering'],
    },
  ];

  const aiCustomSolutions = [
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: 'AI-Powered Education Platforms',
      description: 'Custom teaching solutions, LMS platforms, student progress tracking, AI tutors, and adaptive learning systems.',
      examples: ['K-12 learning management systems', 'Corporate training platforms', 'AI-powered tutoring bots', 'Assessment & grading automation', 'Parent-teacher portals'],
    },
    {
      icon: <Store className="h-8 w-8" />,
      title: 'Retail & Hospitality Solutions',
      description: 'POS systems, inventory management, customer loyalty programs, staff scheduling, and sales analytics.',
      examples: ['Convenience store POS systems', 'Restaurant order management', 'Inventory & supply chain tracking', 'Customer loyalty programs', 'Staff scheduling & payroll'],
    },
    {
      icon: <Building2 className="h-8 w-8" />,
      title: 'Professional Services Automation',
      description: 'Practice management, client portals, billing automation, project tracking, and compliance tools.',
      examples: ['Law firm case management', 'Accounting practice automation', 'Consulting project tracking', 'Medical practice management', 'Real estate CRM & transaction tools'],
    },
    {
      icon: <Sparkles className="h-8 w-8" />,
      title: 'Manager Workshop & Team Tools',
      description: 'Leadership dashboards, team collaboration tools, performance review systems, and goal tracking.',
      examples: ['Manager performance dashboards', 'Team OKR tracking tools', 'Employee engagement platforms', '360-degree feedback systems', 'Skills gap analysis tools'],
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-innovation-orange-600 text-white py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <span className="text-sm font-semibold">🏆 BIG 4 EXCELLENCE + AI INNOVATION</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Consulting That Moves Boardrooms & Main Streets
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-4xl mx-auto">
              From Fortune 500 strategy to corner-store POS systems—we deliver Big 4 enterprise consulting PLUS custom AI solutions for businesses of all sizes. Deloitte's rigor. Silicon Valley's speed. Your unique advantage.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-secondary inline-flex items-center gap-2">
                <span>Schedule Strategy Session</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/consulting/competencies" className="btn-outline inline-flex items-center gap-2">
                View Our Competencies
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enterprise Consulting Services (Big 4 Level) */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <div className="inline-block bg-trust-blue-50 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold text-trust-blue">ENTERPRISE CONSULTING</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Big 4 Caliber. InTime Speed.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We compete with Deloitte, EY, PwC, and KPMG—but deliver faster, at better rates, with more agility. Same depth. Less bureaucracy.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {enterpriseServices.map((service, index) => (
              <div
                key={index}
                className="bg-gray-50 rounded-2xl p-8 hover:shadow-2xl transition-all duration-300 border-2 border-transparent hover:border-trust-blue group"
              >
                <div className="h-16 w-16 bg-trust-blue-50 rounded-xl flex items-center justify-center mb-6 text-trust-blue group-hover:bg-trust-blue group-hover:text-white transition-colors">
                  {service.icon}
                </div>
                <div className="text-xs font-semibold text-innovation-orange mb-2 uppercase tracking-wider">
                  {service.category}
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
                <Link 
                  href="/contact" 
                  className="mt-6 inline-flex items-center text-trust-blue font-semibold text-sm group-hover:gap-2 transition-all"
                >
                  Learn More
                  <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AI-Powered Custom Solutions (Our Unique Edge) */}
      <section className="py-20 bg-gradient-to-br from-innovation-orange-50 to-trust-blue-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <div className="inline-block bg-innovation-orange-100 px-4 py-2 rounded-full mb-4">
              <span className="text-sm font-semibold text-innovation-orange-700">🚀 OUR UNIQUE EDGE</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              B2C AI Solutions the Big 4 Don't Touch
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              While Deloitte chases billion-dollar enterprises, we also build custom AI-powered tools for schools, restaurants, retail stores, and professional practices. Big impact. Small budgets. Real solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {aiCustomSolutions.map((solution, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border-t-4 border-innovation-orange"
              >
                <div className="h-16 w-16 bg-innovation-orange-50 rounded-xl flex items-center justify-center mb-6 text-innovation-orange">
                  {solution.icon}
                </div>
                <h3 className="text-2xl font-heading font-bold text-gray-900 mb-3">
                  {solution.title}
                </h3>
                <p className="text-gray-600 mb-6 leading-relaxed">
                  {solution.description}
                </p>
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wider">
                    Example Solutions:
                  </div>
                  <div className="space-y-2">
                    {solution.examples.map((example, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700">
                        <div className="h-1.5 w-1.5 bg-innovation-orange rounded-full flex-shrink-0 mt-1.5"></div>
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <Link 
                  href="/contact" 
                  className="mt-6 inline-flex items-center text-innovation-orange font-semibold text-sm hover:gap-2 transition-all"
                >
                  Build Your Custom Solution
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why InTime vs Big 4 */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-center text-gray-900 mb-12">
              Why InTime vs. Big 4?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="h-20 w-20 bg-success-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">⚡</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">3x Faster Delivery</h3>
                <p className="text-gray-600">
                  Big 4 takes 12 months. We deliver in 4. Same quality. Less process bloat.
                </p>
              </div>
              <div className="text-center">
                <div className="h-20 w-20 bg-trust-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">💰</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">40-60% Lower Cost</h3>
                <p className="text-gray-600">
                  $500/hr Big 4 partners? We deliver senior talent at $150-250/hr without sacrificing quality.
                </p>
              </div>
              <div className="text-center">
                <div className="h-20 w-20 bg-innovation-orange-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl">🎯</span>
                </div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">SMB to Enterprise</h3>
                <p className="text-gray-600">
                  Big 4 ignores sub-$50M companies. We serve everyone—from $500K startups to Fortune 500.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Industries We Serve */}
      <section className="py-20 bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Industries We Transform
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              From Wall Street to Main Street—we bring Big 4 expertise to every industry.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 max-w-5xl mx-auto">
            {['Financial Services', 'Healthcare', 'Manufacturing', 'Retail & E-commerce', 'Technology', 'Education', 'Legal', 'Real Estate', 'Hospitality', 'Energy & Utilities', 'Transportation', 'Government'].map((industry, i) => (
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
            Whether you need Fortune 500 strategy or a custom POS for your coffee shop—let's talk. Free 30-minute strategy session. No Big 4 sales pitch. Just honest advice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
              <span>Book Free Strategy Session</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4">
              View Open Consulting Roles
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

