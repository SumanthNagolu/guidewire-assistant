import Link from 'next/link';
import { ArrowRight, Heart, DollarSign, Factory, Briefcase, Code, Truck, ShoppingBag, Users, Building2, Scale, Wrench, Package, Brain, Car, Smartphone } from 'lucide-react';

export const metadata = {
  title: 'Industries We Serve | InTime eSolutions - 15+ Specialized Markets',
  description: 'Expert talent for Healthcare, Financial Services, Manufacturing, IT, Legal, Engineering, Logistics, Retail, and more. Industry-specific recruitment and staffing solutions.',
  keywords: 'industry staffing, healthcare recruitment, financial services staffing, manufacturing talent, IT staffing by industry',
};

export default function IndustriesPage() {
  const industries = [
    {
      icon: <Heart className="h-6 w-6" />,
      title: 'Healthcare & Life Sciences',
      slug: 'healthcare',
      description: 'HIPAA-compliant talent from RNs to health IT—Epic, Cerner, clinical trials.',
      marketSize: '$4.5T',
      color: 'bg-red-50 hover:bg-red-100'
    },
    {
      icon: <Code className="h-6 w-6" />,
      title: 'Information Technology',
      slug: 'information-technology',
      description: 'Full-stack, DevOps, cloud, AI/ML, cybersecurity—all tech stacks.',
      marketSize: '$5.2T',
      color: 'bg-blue-50 hover:bg-blue-100'
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: 'Financial Services',
      slug: 'financial-accounting',
      description: 'SEC/FINRA compliant—traders, analysts, blockchain, RegTech.',
      marketSize: '$26T',
      color: 'bg-green-50 hover:bg-green-100'
    },
    {
      icon: <Factory className="h-6 w-6" />,
      title: 'Manufacturing',
      slug: 'manufacturing',
      description: 'Lean Six Sigma certified—CNC operators to plant managers.',
      marketSize: '$2.3T',
      color: 'bg-gray-50 hover:bg-gray-100'
    },
    {
      icon: <Wrench className="h-6 w-6" />,
      title: 'Engineering',
      slug: 'engineering',
      description: 'PE-licensed engineers—mechanical, civil, electrical, aerospace.',
      marketSize: '$1.8T',
      color: 'bg-yellow-50 hover:bg-yellow-100'
    },
    {
      icon: <Scale className="h-6 w-6" />,
      title: 'Legal',
      slug: 'legal',
      description: 'Bar-certified attorneys, paralegals, eDiscovery specialists.',
      marketSize: '$350B',
      color: 'bg-purple-50 hover:bg-purple-100'
    },
    {
      icon: <Truck className="h-6 w-6" />,
      title: 'Logistics & Supply Chain',
      slug: 'logistics',
      description: 'WMS/TMS certified—supply chain managers to freight brokers.',
      marketSize: '$1.6T',
      color: 'bg-orange-50 hover:bg-orange-100'
    },
    {
      icon: <Package className="h-6 w-6" />,
      title: 'Warehouse & Distribution',
      slug: 'warehouse-distribution',
      description: 'OSHA certified, forklift trained—surge staffing specialists.',
      marketSize: '$450B',
      color: 'bg-amber-50 hover:bg-amber-100'
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: 'Human Resources',
      slug: 'human-resources',
      description: 'HRIS certified—Workday, SAP SuccessFactors, talent acquisition.',
      marketSize: '$240B',
      color: 'bg-pink-50 hover:bg-pink-100'
    },
    {
      icon: <ShoppingBag className="h-6 w-6" />,
      title: 'Retail & E-Commerce',
      slug: 'retail',
      description: 'POS certified, seasonal surge staffing—store to corporate.',
      marketSize: '$5.6T',
      color: 'bg-rose-50 hover:bg-rose-100'
    },
    {
      icon: <Brain className="h-6 w-6" />,
      title: 'AI, ML & Data Science',
      slug: 'ai-ml-data',
      description: 'Production ML engineers—PyTorch, TensorFlow, LLMs, RAG.',
      marketSize: '$200B',
      color: 'bg-indigo-50 hover:bg-indigo-100'
    },
    {
      icon: <Building2 className="h-6 w-6" />,
      title: 'Hospitality',
      slug: 'hospitality',
      description: 'Hotel management, restaurant operations, event coordinators.',
      marketSize: '$1.2T',
      color: 'bg-teal-50 hover:bg-teal-100'
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: 'Telecom & Technology',
      slug: 'telecom-technology',
      description: '5G engineers, network architects, ISP operations specialists.',
      marketSize: '$1.7T',
      color: 'bg-cyan-50 hover:bg-cyan-100'
    },
    {
      icon: <Car className="h-6 w-6" />,
      title: 'Automobile',
      slug: 'automobile',
      description: 'Automotive engineers, EV specialists, manufacturing talent.',
      marketSize: '$3.5T',
      color: 'bg-slate-50 hover:bg-slate-100'
    },
    {
      icon: <Briefcase className="h-6 w-6" />,
      title: 'Government & Public Sector',
      slug: 'government-public-sector',
      description: 'Security-cleared talent for federal, state, municipal projects.',
      marketSize: '$2.1T',
      color: 'bg-stone-50 hover:bg-stone-100'
    },
  ];

  const trending = [
    { icon: '🔥', text: 'Healthcare IT - Epic & Cerner Certified Talent', badge: 'HOT' },
    { icon: '⚡', text: 'AI/ML Engineers - 72-Hour Placements', badge: 'NEW' },
    { icon: '🌍', text: 'Manufacturing - Lean Six Sigma Teams', badge: 'TRENDING' },
  ];

  return (
    <>
      {/* Trending Banner */}
      <div className="bg-gradient-to-r from-trust-blue-600 to-innovation-orange-500 text-white py-3 overflow-hidden">
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
              <span className="text-sm font-semibold">🏢 15+ SPECIALIZED INDUSTRIES</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Industry Experts. Not General Recruiters.
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-4xl mx-auto">
              We don't just find candidates. We speak your industry's language—from HIPAA to FINRA, Lean Six Sigma to PE licenses, WMS to bar certifications. Deep expertise. Fast delivery. Every time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
                <span>Find Industry Talent</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/solutions" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4">
                View Our Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              15 Industries. Deep Expertise in Each.
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't dabble. Every industry team includes former practitioners who understand your unique challenges, compliance requirements, and talent needs.
            </p>
          </div>

          <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-6">
            {industries.map((industry, index) => (
              <Link
                key={index}
                href={`/industries/${industry.slug}`}
                className={`group ${industry.color} rounded-2xl p-6 transition-all duration-300 hover:shadow-xl border-2 border-transparent hover:border-trust-blue`}
              >
                <div className="h-12 w-12 bg-white rounded-xl flex items-center justify-center mb-4 text-trust-blue shadow-sm group-hover:scale-110 transition-transform">
                  {industry.icon}
                </div>
                
                <h3 className="text-lg font-heading font-bold text-gray-900 mb-2 group-hover:text-trust-blue transition-colors">
                  {industry.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 leading-relaxed line-clamp-2">
                  {industry.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-xs font-semibold text-gray-500">
                    {industry.marketSize} Market
                  </div>
                  <ArrowRight className="h-4 w-4 text-trust-blue opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* What Makes Us Different */}
      <section className="py-20 bg-gradient-to-br from-trust-blue-50 to-success-green-50">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-center text-gray-900 mb-12">
              Industry-Specific Recruiting Done Right
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-5xl mb-4">🎯</div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">Compliance Built-In</h3>
                <p className="text-gray-600">
                  HIPAA, SOX, FINRA, OSHA, PE licenses, bar certifications—we verify everything your industry requires.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">48-72 Hour Placements</h3>
                <p className="text-gray-600">
                  Emergency staffing? Peak season surge? We deploy industry-certified talent in 48-72 hours.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg">
                <div className="text-5xl mb-4">💼</div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">Former Practitioners</h3>
                <p className="text-gray-600">
                  Our recruiters aren't generalists. They're former engineers, nurses, lawyers, accountants.
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
            Your Industry. Our Expertise. Perfect Match.
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-3xl mx-auto">
            Stop working with generalist recruiters who don't understand your world. Partner with industry specialists who speak your language.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
              <span>Discuss Your Industry Needs</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4">
              Browse Jobs by Industry
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

