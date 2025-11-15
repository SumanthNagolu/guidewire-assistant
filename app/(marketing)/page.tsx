"use client";
import Link from "next/link";
import { Zap, TrendingUp, Globe, Briefcase, GraduationCap, Users, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import CountUp from "react-countup";
import { useInView } from "react-intersection-observer";
export default function HomePage() {
  const [statsRef, statsInView] = useInView({ triggerOnce: true, threshold: 0.3 });
  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };
  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  const scaleIn = {
    initial: { opacity: 0, scale: 0.9 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.5 }
  };
  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Hero Section - Full Bleed */}
      <section className="relative bg-gradient-to-br from-trust-blue via-trust-blue-600 to-success-green text-white py-32 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(30deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(150deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(30deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(150deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff)]"></div>
        </div>
        <div className="section-wide relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.h1 
              className="text-6xl md:text-7xl lg:text-display font-heading font-black mb-8 leading-none"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              Transform Your Career.<br />
              Power Your Business.<br />
              <span className="text-success-green">Do It InTime.</span>
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto leading-relaxed"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
            >
              Where Excellence Meets Opportunity - Staffing, Skill Development, and Cross-Border Solutions That Deliver Results
            </motion.p>
            <motion.div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
            >
              <Link href="/contact" className="btn-accent w-full sm:w-auto text-lg hover:scale-105 transition-transform">
                Start Your Transformation
              </Link>
              <Link href="/careers" className="btn-outline w-full sm:w-auto text-lg hover:scale-105 transition-transform">
                Explore Opportunities
              </Link>
            </motion.div>
            <motion.div 
              className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-200"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                <span>500+ Active Consultants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                <span>95% Placement Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                <span>24-Hour Response</span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
      {/* The InTime Difference */}
      <section className="py-24 bg-white">
        <div className="section-container">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <div className="inline-block bg-trust-blue-50 px-6 py-2 rounded-full mb-6">
              <span className="text-sm font-semibold text-trust-blue uppercase tracking-wider">The InTime Way</span>
            </div>
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-wisdom-gray-700 mb-4 leading-tight">
              It's Not What You Do.<br />It's <span className="text-trust-blue">HOW</span> You Do It.
            </h2>
            <p className="text-lg text-wisdom-gray-600 italic">— Sadhguru</p>
          </motion.div>
          <motion.div 
            className="grid md:grid-cols-3 gap-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Pillar 1 */}
            <motion.div variants={fadeInUp} className="text-center group card-lift bg-white p-8 rounded-2xl">
              <div className="w-24 h-24 mx-auto mb-6 bg-innovation-orange-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-12 h-12 text-innovation-orange" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Speed Without Compromise
              </h3>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                We're fast because we're prepared, not because we cut corners. Excellence at velocity is our promise.
              </p>
            </motion.div>
            {/* Pillar 2 */}
            <motion.div variants={fadeInUp} className="text-center group card-lift bg-white p-8 rounded-2xl">
              <div className="w-24 h-24 mx-auto mb-6 bg-success-green-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-12 h-12 text-success-green" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Transformation, Not Transaction
              </h3>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                Every placement is a career transformation. Every partnership is a growth catalyst. We measure success in changed lives.
              </p>
            </motion.div>
            {/* Pillar 3 */}
            <motion.div variants={fadeInUp} className="text-center group card-lift bg-white p-8 rounded-2xl">
              <div className="w-24 h-24 mx-auto mb-6 bg-trust-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-12 h-12 text-trust-blue" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Global Expertise, Local Excellence
              </h3>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                Break borders, not dreams. Your talent knows no boundaries—neither should your opportunities.
              </p>
            </motion.div>
          </motion.div>
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
          >
            <Link href="/company/about" className="inline-flex items-center text-trust-blue hover:text-trust-blue-600 font-semibold text-lg group">
              Discover Our Approach
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>
      </section>
      {/* Solutions Overview */}
      <section className="py-24 bg-wisdom-gray-50">
        <div className="section-container">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: "-100px" }}
          >
            <h2 className="text-5xl md:text-6xl font-heading font-bold text-wisdom-gray-700 mb-4 leading-tight">
              Comprehensive Solutions for<br />Every Talent Need
            </h2>
          </motion.div>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {/* Card 1 */}
            <motion.div variants={scaleIn} className="bg-white rounded-2xl p-8 card-dynamic border-t-4 border-trust-blue">
              <div className="w-14 h-14 mb-6 bg-trust-blue-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-trust-blue" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Staffing Excellence
              </h3>
              <ul className="space-y-2 mb-6 text-wisdom-gray">
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Contract, Contract-to-Hire, Direct Placement
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  All technologies, all industries
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  24-hour placement guarantee
                </li>
              </ul>
              <Link href="/solutions/it-staffing" className="inline-flex items-center text-trust-blue hover:text-trust-blue-600 font-semibold group">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            {/* Card 2 */}
            <motion.div variants={scaleIn} className="bg-white rounded-2xl p-8 card-dynamic border-t-4 border-success-green">
              <div className="w-14 h-14 mb-6 bg-success-green-50 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-success-green" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Transformative Training
              </h3>
              <ul className="space-y-2 mb-6 text-wisdom-gray">
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  8-week intensive bootcamps
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  80% placement rate
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  60% salary increase
                </li>
              </ul>
              <Link href="/solutions/training" className="inline-flex items-center text-success-green hover:text-success-green-600 font-semibold group">
                View Programs
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            {/* Card 3 */}
            <motion.div variants={scaleIn} className="bg-white rounded-2xl p-8 card-dynamic border-t-4 border-innovation-orange">
              <div className="w-14 h-14 mb-6 bg-innovation-orange-50 rounded-xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-innovation-orange" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Cross-Border Advantage
              </h3>
              <ul className="space-y-2 mb-6 text-wisdom-gray">
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  H1B to Canada transitions
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Canada to USA placement
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Complete relocation support
                </li>
              </ul>
              <Link href="/solutions/cross-border" className="inline-flex items-center text-innovation-orange hover:text-innovation-orange-600 font-semibold group">
                Explore Global
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
            {/* Card 4 */}
            <motion.div variants={scaleIn} className="bg-white rounded-2xl p-8 card-dynamic border-t-4 border-wisdom-gray">
              <div className="w-14 h-14 mb-6 bg-wisdom-gray-100 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-wisdom-gray-700" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Technology Consulting
              </h3>
              <ul className="space-y-2 mb-6 text-wisdom-gray">
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  DevOps & Cloud Transformation
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Custom Software Development
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  AI/ML & Data Analytics
                </li>
              </ul>
              <Link href="/consulting" className="inline-flex items-center text-wisdom-gray-700 hover:text-trust-blue font-semibold group">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Success Metrics with Animated Counters */}
      <section ref={statsRef} className="py-24 bg-wisdom-gray-700 text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
        </div>
        <div className="section-wide relative z-10">
          <motion.div 
            className="text-center mb-20"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-4">
              Results That Speak<br />Louder Than Words
            </h2>
          </motion.div>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-12"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-black text-success-green mb-2">
                {statsInView && <CountUp end={500} duration={2.5} suffix="+" />}
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Careers Transformed
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-black text-success-green mb-2">
                {statsInView && <CountUp end={200} duration={2.5} suffix="+" />}
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Clients Served
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-black text-success-green mb-2">
                {statsInView && <CountUp end={92} duration={2.5} suffix="%" />}
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Placement Success
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-black text-success-green mb-2">
                {statsInView && <CountUp end={24} duration={2.5} />}
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Hour Response Time
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-black text-success-green mb-2">
                ${statsInView && <CountUp end={75} duration={2.5} />}M+
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Salaries Negotiated
              </div>
            </motion.div>
            <motion.div variants={fadeInUp} className="text-center">
              <div className="text-6xl md:text-7xl font-heading font-black text-success-green mb-2">
                {statsInView && <CountUp end={3} duration={2.5} />}
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Countries Served
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Get Started CTA */}
      <section className="py-32 bg-gradient-to-r from-success-green to-trust-blue text-white">
        <div className="section-container">
          <motion.div 
            className="text-center max-w-4xl mx-auto"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-5xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              Ready to Experience<br />the InTime Difference?
            </h2>
            <p className="text-xl mb-16 text-gray-100 leading-relaxed">
              Whether you need talent, training, or career opportunities, we're here to help you succeed.
            </p>
            <motion.div 
              className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {/* For Companies */}
              <motion.div variants={scaleIn} className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 hover:bg-white/20 transition-all duration-300 card-lift">
                <h3 className="text-2xl font-heading font-semibold mb-4">For Companies</h3>
                <p className="mb-6 text-gray-100">Find exceptional talent to power your business growth</p>
                <Link href="/contact?type=company" className="inline-block bg-white text-trust-blue hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:scale-105">
                  I Need Talent
                </Link>
              </motion.div>
              {/* For Professionals */}
              <motion.div variants={scaleIn} className="bg-white/10 backdrop-blur-sm rounded-2xl p-10 hover:bg-white/20 transition-all duration-300 card-lift">
                <h3 className="text-2xl font-heading font-semibold mb-4">For Professionals</h3>
                <p className="mb-6 text-gray-100">Transform your career with the right opportunity</p>
                <Link href="/careers" className="inline-block bg-white text-trust-blue hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:scale-105">
                  I Need Opportunity
                </Link>
              </motion.div>
            </motion.div>
            <motion.div 
              className="mt-16 text-gray-200"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              viewport={{ once: true }}
            >
              Or call us: <a href="tel:+13076502850" className="font-mono font-bold text-white hover:text-success-green transition-colors">+1 307-650-2850</a>
            </motion.div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
