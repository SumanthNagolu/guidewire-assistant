"use client";
import { ArrowRight, CheckCircle2, Code2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
export default function InformationTechnologyPage() {
  const domains = [
    { name: 'Database Development & Administration', desc: 'Oracle DBA, MySQL, PostgreSQL' },
    { name: 'Enterprise Systems Analysis & Integration', desc: 'SAP, Oracle, Microsoft Dynamics' },
    { name: 'Network Design & Administration', desc: 'ITIL, ISO/IEC 27000, Cisco' },
    { name: 'Programming & Software Engineering', desc: 'Java, Python, .NET, Node.js' },
    { name: 'Project Management', desc: 'Agile, Scrum, Waterfall, PMI-certified' },
    { name: 'Software Testing & Quality Analysis', desc: 'Automation, Performance, Security' },
    { name: 'Technical Support', desc: 'L1, L2, L3 Support' },
    { name: 'Technical Writing', desc: 'Documentation, User Guides, API Docs' },
    { name: 'Web Development & Administration', desc: 'Full-stack, Frontend, Backend' },
  ];
  const services = [
    'End‑to‑end options: contract, contract‑to‑hire, direct‑hire, and managed solutions',
    'Curated network and rapid sourcing to deploy IT professionals with exact skills',
    'Multi‑channel recruitment: targeted outreach, referrals, job boards',
    'Full‑cycle support from intake, technical screening, and interviewing',
    'Tailored recruitment strategies respecting architecture and security standards',
    'Competitive rates and flexible terms to maximize value',
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
              <Code2 className="h-4 w-4" />
              <span className="text-sm font-medium">IT Staffing Solutions</span>
            </motion.div>
            <motion.h1 
              className="text-h1 font-heading mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              IT Staffing That Ships Reliably and Securely
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 text-sky-blue-500 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              InTime brings speed through systems to IT staffing, pairing technical depth with communication excellence so teams ship reliably and securely.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
                Find IT Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/solutions/it-staffing" className="btn-outline whitespace-nowrap">
                View Staffing Process
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Services */}
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
              Services We Provide
            </motion.h2>
            <motion.div 
              className="space-y-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {services.map((service, index) => (
                <motion.div 
                  key={index} 
                  variants={fadeInUp}
                  className="flex items-start gap-4 p-6 bg-wisdom-gray-50 rounded-xl hover:bg-sky-blue-500/10 transition-colors card-lift"
                >
                  <CheckCircle2 className="h-6 w-6 text-success-green flex-shrink-0 mt-0.5" />
                  <p className="text-lg text-wisdom-gray-700">{service}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      {/* Domains & Expertise */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <motion.h2 
              className="text-h2 font-heading mb-4 text-trust-blue"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Domains & Expertise
            </motion.h2>
            <motion.p 
              className="text-lg text-wisdom-gray-600 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              We specialize across the full IT landscape, from infrastructure to applications, data to security.
            </motion.p>
          </div>
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: "-100px" }}
          >
            {domains.map((domain, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-trust-blue transition-all duration-300 hover:shadow-lg card-dynamic"
              >
                <h3 className="font-semibold text-trust-blue-700 mb-2">{domain.name}</h3>
                <p className="text-sm text-wisdom-gray-600">{domain.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Java Expertise Highlight */}
      <section className="py-16 bg-trust-blue-50">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <motion.h2 
              className="text-h2 font-heading mb-6 text-trust-blue"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Deep Java Expertise
            </motion.h2>
            <motion.p 
              className="text-lg text-wisdom-gray-700 mb-8 leading-relaxed"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              viewport={{ once: true }}
            >
              Our Java specialists bring mastery across Core Java, Object-Oriented Programming, Data Structures & Algorithms, and Hibernate. We vet for both theoretical understanding and practical application.
            </motion.p>
            <motion.div 
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {['Core Java', 'OOP', 'Algorithms', 'Hibernate'].map((skill) => (
                <motion.div 
                  key={skill} 
                  variants={fadeInUp}
                  className="bg-white p-4 rounded-lg border-2 border-trust-blue-200 card-lift"
                >
                  <p className="font-semibold text-trust-blue">{skill}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <motion.h2 
            className="text-h2 font-heading mb-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Build Your IT Team?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 text-sky-blue-500 max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Let's discuss your technology stack, architecture, and project timeline. We'll mobilize the right specialists.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
              Get Started Today
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
