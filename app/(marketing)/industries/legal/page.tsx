"use client";
import { ArrowRight, CheckCircle2, Scale } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
export default function LegalPage() {
  const roles = [
    'Attorney / Lawyer',
    'Paralegal',
    'Legal Assistant',
    'Contract Attorney',
    'eDiscovery Specialist',
    'Document Review Attorney',
    'Litigation Support Specialist',
    'Legal Secretary',
    'In-House Counsel',
    'General Counsel',
    'Associate Attorney',
    'Partner-Track Attorney',
    'Legal Operations Manager',
    'Compliance Attorney',
    'Intellectual Property Attorney',
    'Corporate Attorney',
    'Trial Attorney',
    'Appellate Attorney',
    'Legal Researcher',
    'Law Clerk',
  ];
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
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <motion.div 
            className="max-w-4xl"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div 
              className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Scale className="h-4 w-4" />
              <span className="text-sm font-medium">Legal Staffing & Recruitment</span>
            </motion.div>
            <motion.h1 
              className="text-h1 font-heading mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Legal Talent That Wins Cases & Closes Deals
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 text-sky-blue-500 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              From BigLaw partner tracks to document review marathons—InTime delivers legal professionals who understand billable hours, court deadlines, and client demands. 73% of law firms report critical talent shortages. We solve that.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
                Find Legal Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline whitespace-nowrap">
                Our Legal Expertise
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Our Approach */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              className="text-h2 font-heading mb-8 text-trust-blue text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Precision in Legal Staffing
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8 mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { title: '24-48 Hour Turnaround', desc: 'Emergency doc review? Trial next week? We staff overnight.' },
                { title: 'Bar-Certified Vetted', desc: 'Every attorney verified: bar license, malpractice insurance, ethics.' },
                { title: 'BigLaw to Boutique', desc: 'Am Law 100 veterans to solo practitioners—we cover all tiers.' },
              ].map((item, index) => (
                <motion.div key={index} variants={fadeInUp} className="text-center card-lift">
                  <div className="h-16 w-16 bg-success-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-success-green" />
                  </div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">{item.title}</h3>
                  <p className="text-wisdom-gray">{item.desc}</p>
                </motion.div>
              ))}
            </motion.div>
            <motion.div 
              className="bg-gray-50 rounded-2xl p-8"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              viewport={{ once: true }}
            >
              <p className="text-lg text-wisdom-gray leading-relaxed mb-4">
                <strong className="text-trust-blue">The Legal Talent Crisis:</strong> 73% of law firms report difficulty finding qualified litigation support. Class actions demand 50+ doc review attorneys in 48 hours. M&A deals need corporate counsel immediately.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime maintains a national network of bar-certified attorneys, paralegals, and legal support staff ready to deploy—whether you need one contract attorney or an entire eDiscovery team.
              </p>
            </motion.div>
          </div>
        </div>
      </section>
      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <motion.h2 
            className="text-h2 font-heading mb-4 text-trust-blue text-center"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Legal Roles We Staff
          </motion.h2>
          <motion.p 
            className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            From entry-level paralegals to equity partners—litigation, corporate, IP, compliance, and more.
          </motion.p>
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {roles.map((role, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-lg px-4 py-3 text-center text-sm text-wisdom-gray-700 hover:shadow-md transition-shadow card-lift"
              >
                {role}
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Why Law Firms Choose InTime */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <motion.h2 
              className="text-h2 font-heading mb-12 text-trust-blue text-center"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Why Law Firms Choose InTime
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  title: 'Emergency Response (24-48hrs)',
                  desc: 'Class action filed Friday? We staff 20 doc review attorneys by Monday 9am.'
                },
                {
                  title: 'Bar-Certified & Insured',
                  desc: 'Every attorney vetted: active bar license, malpractice coverage, ethics clearance.'
                },
                {
                  title: 'eDiscovery Expertise',
                  desc: 'Relativity, Nuix, Brainspace—our specialists know the platforms and case law.'
                },
                {
                  title: 'Flexible Engagement Models',
                  desc: 'Hourly, project-based, temp-to-perm—whatever the case demands.'
                }
              ].map((item, index) => (
                <motion.div key={index} variants={fadeInUp} className="flex gap-4 card-lift p-4 rounded-xl">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="h-6 w-6 text-success-green" />
                    </div>
                  </div>
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                      {item.title}
                    </h3>
                    <p className="text-wisdom-gray">
                      {item.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      {/* Success Metrics */}
      <section className="py-16 bg-gradient-to-br from-trust-blue-50 to-success-green-50">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2 
              className="text-h2 font-heading mb-12 text-trust-blue"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Legal Staffing By The Numbers
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { stat: '24hrs', label: 'Average response time for urgent requests' },
                { stat: '98%', label: 'Attorney placement success rate' },
                { stat: '$350B', label: 'US legal services market we serve' }
              ].map((item, index) => (
                <motion.div key={index} variants={fadeInUp} className="card-dynamic p-6 bg-white rounded-2xl">
                  <div className="text-5xl font-bold text-trust-blue mb-2">{item.stat}</div>
                  <div className="text-wisdom-gray-600">{item.label}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container text-center">
          <motion.h2 
            className="text-h2 font-heading mb-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Need Legal Talent? We Deliver.
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Whether you need one paralegal or 50 contract attorneys—we staff fast, vetted, and ready to bill.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
              Request Legal Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center whitespace-nowrap">
              View Legal Jobs
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
