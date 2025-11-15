"use client";
import { ArrowRight, CheckCircle2, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
export default function FinancialAccountingPage() {
  const roles = [
    'Financial Analyst',
    'Accountant',
    'CPA / Certified Public Accountant',
    'Compliance Officer',
    'Risk Manager',
    'Quant Developer / Quantitative Analyst',
    'Trader / Investment Analyst',
    'Auditor (Internal / External)',
    'Tax Specialist',
    'Financial Controller',
    'Treasury Analyst',
    'Credit Analyst',
    'Portfolio Manager',
    'Investment Banker',
    'Actuarial Analyst',
    'RegTech Specialist',
    'FinTech Developer',
    'Blockchain / Crypto Analyst',
    'Anti-Money Laundering (AML) Specialist',
    'KYC Analyst',
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
              <DollarSign className="h-4 w-4" />
              <span className="text-sm font-medium">Financial Services & Accounting Staffing</span>
            </motion.div>
            <motion.h1 
              className="text-h1 font-heading mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Finance & Accounting Talent That Moves Markets
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 text-sky-blue-500 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              From Wall Street trading floors to Main Street CPA firms—InTime delivers finance professionals who understand compliance, risk, and the bottom line. RegTech, FinTech, audit, tax, treasury: we speak your language.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
                Find Finance Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline whitespace-nowrap">
                Our Financial Expertise
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
              Precision in Financial Staffing
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8 mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { title: 'Compliance First', desc: 'SEC, FINRA, SOX, GDPR—we vet for regulatory fluency' },
                { title: 'Speed Without Risk', desc: 'Pre-screened talent ready for audit season or M&A crunch' },
                { title: 'FinTech to Traditional', desc: 'Blockchain devs to seasoned CPAs—we cover it all' },
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
                Whether you need a forensic accountant for a fraud investigation, a quant developer for algorithmic trading, or 20 CPAs for tax season—InTime delivers talent that understands financial integrity and regulatory scrutiny.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                Our candidates are screened for Series 7/63 certifications, CPA licenses, CFA credentials, and hands-on experience with Bloomberg Terminal, SAP, Oracle Financials, and FinTech platforms.
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
            Financial & Accounting Roles We Staff
          </motion.h2>
          <motion.p 
            className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            From investment banking to tax prep, risk management to FinTech innovation—we place finance professionals who drive ROI and manage risk.
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
      {/* Why InTime for Finance */}
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
              Why Finance Leaders Choose InTime
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
                  title: 'Regulatory Expertise',
                  desc: 'Every candidate is screened for compliance knowledge—FINRA, SEC, SOX, GDPR, AML/KYC requirements.'
                },
                {
                  title: 'Audit & Tax Season Ready',
                  desc: 'Need 10 CPAs next week for Q4 close? We maintain a bench of pre-vetted accounting professionals.'
                },
                {
                  title: 'FinTech & Traditional Finance',
                  desc: 'We place blockchain developers, robo-advisory engineers, AND seasoned Wall Street analysts.'
                },
                {
                  title: 'White-Glove Service',
                  desc: 'Dedicated recruiters who understand financial modeling, derivatives, and the difference between GAAP and IFRS.'
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
              Financial Staffing By The Numbers
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { stat: '48hrs', label: 'Average time to first CPA candidate' },
                { stat: '98%', label: 'Placement accuracy for compliance roles' },
                { stat: '$26T', label: 'Market size we serve (Global Financial Services)' }
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
            Ready to Build Your Finance Team?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Whether you need a CFO, 50 tax accountants, or a quant team—we deliver finance talent fast.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
              Request Finance Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center whitespace-nowrap">
              View Finance Jobs
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
