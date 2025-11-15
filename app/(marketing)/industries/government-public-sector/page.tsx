"use client";
import { ArrowRight, CheckCircle2, Building2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
export default function GovernmentPublicSectorPage() {
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
  const roles = [
    'IT Systems Administrator',
    'Cybersecurity Analyst',
    'Network Engineer',
    'Software Developer (Gov)',
    'Data Analyst',
    'Business Analyst',
    'Program Manager',
    'Project Manager (PMI)',
    'Scrum Master',
    'DevSecOps Engineer',
    'Cloud Architect (Gov Cloud)',
    'Database Administrator',
    'GIS Specialist',
    'Technical Writer',
    'Quality Assurance Analyst',
    'IT Security Specialist',
    'Systems Engineer',
    'Infrastructure Engineer',
    'Help Desk Support',
    'Compliance Specialist',
  ];
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
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Government & Public Sector Staffing</span>
            </motion.div>
            <motion.h1 
              className="text-h1 font-heading mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Security-Cleared Talent for Public Service
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 text-sky-blue-500 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              From federal agencies to municipal projects—InTime delivers security-cleared professionals who understand government compliance, procurement, and mission-critical systems. 76% of agencies report critical talent shortages. We fill that gap.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
                Find Government Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline whitespace-nowrap">
                Our Gov Sector Expertise
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
              Mission-Critical Staffing
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8 mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { title: 'Security Clearances', desc: 'Active Secret, Top Secret, TS/SCI—verified and current.' },
                { title: 'Federal Compliance', desc: 'FISMA, FedRAMP, NIST—all talent compliance-trained.' },
                { title: 'Rapid Deployment', desc: 'Contract awarded Friday? We staff Monday.' },
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
                <strong className="text-trust-blue">The Government Talent Gap:</strong> 76% of agencies can't find security-cleared talent. Critical IT projects delay. Cybersecurity positions sit unfilled for 6+ months.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime maintains a national network of security-cleared professionals ready for immediate deployment—IT specialists, cybersecurity analysts, program managers, data scientists. Whether you're a prime contractor or sub, we staff federal, state, and local projects fast.
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
            Government & Public Sector Roles We Staff
          </motion.h2>
          <motion.p 
            className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            From federal IT to municipal systems—security-cleared professionals for mission-critical projects.
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
      {/* Why Government Contractors Choose InTime */}
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
              Why Government Contractors Choose InTime
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-2 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInUp} className="flex gap-4 card-lift p-4 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Active Clearances Verified
                  </h3>
                  <p className="text-wisdom-gray">
                    Secret, Top Secret, TS/SCI—all clearances verified through JPAS/DISS.
                  </p>
                </div>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex gap-4 card-lift p-4 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Federal IT Compliance
                  </h3>
                  <p className="text-wisdom-gray">
                    FISMA, FedRAMP, NIST 800-53, CMMC—our talent knows federal requirements.
                  </p>
                </div>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex gap-4 card-lift p-4 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Contract-Ready Talent
                  </h3>
                  <p className="text-wisdom-gray">
                    Contract awarded? We deploy cleared talent in 48-72 hours.
                  </p>
                </div>
              </motion.div>
              <motion.div variants={fadeInUp} className="flex gap-4 card-lift p-4 rounded-xl">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Prime & Sub Support
                  </h3>
                  <p className="text-wisdom-gray">
                    Large primes to small businesses—we support all tiers of government contractors.
                  </p>
                </div>
              </motion.div>
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
              Government Staffing By The Numbers
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              <motion.div variants={fadeInUp} className="card-dynamic p-6 bg-white rounded-2xl">
                <div className="text-5xl font-bold text-trust-blue mb-2">72hrs</div>
                <div className="text-wisdom-gray-600">Average time to deploy cleared talent</div>
              </motion.div>
              <motion.div variants={fadeInUp} className="card-dynamic p-6 bg-white rounded-2xl">
                <div className="text-5xl font-bold text-success-green mb-2">97%</div>
                <div className="text-wisdom-gray-600">Clearance verification success rate</div>
              </motion.div>
              <motion.div variants={fadeInUp} className="card-dynamic p-6 bg-white rounded-2xl">
                <div className="text-5xl font-bold text-innovation-orange mb-2">$2.1T</div>
                <div className="text-wisdom-gray-600">US government IT market we serve</div>
              </motion.div>
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
            Need Security-Cleared Talent? We Deliver.
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Whether you need one cleared analyst or an entire project team—we staff fast, verified, and mission-ready.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
              Request Government Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center whitespace-nowrap">
              View Government Jobs
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
