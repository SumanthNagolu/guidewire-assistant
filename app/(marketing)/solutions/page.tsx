"use client";
import Link from 'next/link';
import { ArrowRight, Zap, Users, Globe, GraduationCap, Brain, TrendingUp, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
export default function SolutionsPage() {
  const solutions = [
    {
      icon: <Users className="h-8 w-8" />,
      title: 'Staffing',
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
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };
  return (
    <>
      {/* Hero Section - Full Bleed */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-32 overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-wide relative z-10">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div 
              className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-8"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
            >
              <span className="text-sm font-semibold">💼 COMPLETE WORKFORCE SOLUTIONS</span>
            </motion.div>
            <motion.h1 
              className="text-6xl md:text-7xl lg:text-display font-heading font-black mb-8 leading-none"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              One Partner.<br />Infinite Possibilities.
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-12 text-gray-100 max-w-4xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              From emergency contractor placements to global talent mobility, enterprise consulting to training programs—InTime delivers the full spectrum of workforce solutions. No scope limitations. We scale with you.
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4 hover:scale-105 transition-transform">
                <span>Discuss Your Needs</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4 hover:scale-105 transition-transform">
                See Our Story
              </Link>
            </motion.div>
          </div>
        </div>
      </section>
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
      {/* Solutions Grid */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-wisdom-gray-700 mb-6 leading-tight">
              Four Solutions.<br />Endless Possibilities.
            </h2>
            <p className="text-xl text-wisdom-gray-600 max-w-3xl mx-auto">
              Everything you need to build, scale, and transform your workforce—all from one trusted partner.
            </p>
          </motion.div>
          <motion.div 
            className="space-y-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {solutions.map((solution, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className={`group relative overflow-hidden rounded-3xl bg-gradient-to-br ${solution.color} p-12 text-white card-lift`}
              >
                <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500"></div>
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                      {solution.icon}
                    </div>
                  </div>
                  <div className="flex-1 text-center lg:text-left">
                    <h3 className="text-4xl font-heading font-bold mb-4">
                      {solution.title}
                    </h3>
                    <p className="text-lg mb-6 text-white/90 leading-relaxed">
                      {solution.description}
                    </p>
                    <div className="grid sm:grid-cols-2 gap-3 mb-6">
                      {solution.features.map((feature, i) => (
                        <div key={i} className="flex items-center gap-2">
                          <CheckCircle className="w-5 h-5 flex-shrink-0" />
                          <span className="text-sm">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="flex-shrink-0 text-center">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6">
                      <div className="text-5xl font-heading font-black mb-2">
                        {solution.stats.value}
                      </div>
                      <div className="text-sm text-white/80">
                        {solution.stats.label}
                      </div>
                    </div>
                    <Link 
                      href={solution.slug === 'consulting' ? '/consulting' : `/solutions/${solution.slug}`}
                      className="inline-flex items-center gap-2 bg-white text-trust-blue hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:scale-105"
                    >
                      Learn More
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Why Choose InTime */}
      <section className="py-24 bg-wisdom-gray-50">
        <div className="section-container">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-wisdom-gray-700 mb-6">
              Why InTime?
            </h2>
            <p className="text-xl text-wisdom-gray-600 max-w-3xl mx-auto">
              We're not just a vendor—we're a strategic partner invested in your success.
            </p>
          </motion.div>
          <motion.div 
            className="grid md:grid-cols-3 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 card-dynamic">
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-4">
                Speed That Matters
              </h3>
              <p className="text-wisdom-gray-600 leading-relaxed">
                24-48 hour placements. Same-day responses. We move at your speed—without cutting corners.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 card-dynamic">
              <div className="text-5xl mb-6">🎯</div>
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-4">
                Precision Matching
              </h3>
              <p className="text-wisdom-gray-600 leading-relaxed">
                95% first-submission success. Our AI-powered matching finds the perfect fit, not just any fit.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 card-dynamic">
              <div className="text-5xl mb-6">🌍</div>
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-4">
                Global Reach
              </h3>
              <p className="text-wisdom-gray-600 leading-relaxed">
                50+ countries. 3 continents. One seamless experience. Break borders, not dreams.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 card-dynamic">
              <div className="text-5xl mb-6">💼</div>
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-4">
                Full-Spectrum Solutions
              </h3>
              <p className="text-wisdom-gray-600 leading-relaxed">
                Staffing, consulting, training, cross-border—everything you need from one trusted partner.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 card-dynamic">
              <div className="text-5xl mb-6">🤝</div>
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-4">
                Partnership Mindset
              </h3>
              <p className="text-wisdom-gray-600 leading-relaxed">
                We're invested in your long-term success. 90-day warranties and lifetime support included.
              </p>
            </motion.div>
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 card-dynamic">
              <div className="text-5xl mb-6">📈</div>
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-4">
                Proven Results
              </h3>
              <p className="text-wisdom-gray-600 leading-relaxed">
                2,000+ placements. 200+ clients. 92% success rate. Numbers that speak for themselves.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-32 bg-gradient-to-r from-trust-blue-600 to-innovation-orange-500 text-white">
        <div className="section-container text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              Ready to Transform<br />Your Workforce?
            </h2>
            <p className="text-xl mb-12 text-white/90 max-w-3xl mx-auto leading-relaxed">
              Let's discuss your unique challenges and build a custom solution that delivers results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4 hover:scale-105 transition-transform">
                <span>Schedule a Consultation</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/careers/open-positions" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4 hover:scale-105 transition-transform">
                Browse Open Roles
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
          </motion.div>
        </div>
      </section>
    </>
  );
}
