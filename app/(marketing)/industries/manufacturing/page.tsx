"use client";
import { ArrowRight, CheckCircle2, Factory } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
export default function ManufacturingPage() {
  const roles = [
    'Production Manager',
    'Plant Manager',
    'Manufacturing Engineer',
    'Quality Engineer',
    'CNC Machinist',
    'CNC Programmer',
    'Maintenance Technician',
    'Industrial Electrician',
    'Process Engineer',
    'Lean Six Sigma Specialist',
    'Production Supervisor',
    'Quality Control Inspector',
    'Assembly Line Worker',
    'Welder / Fabricator',
    'Tool & Die Maker',
    'Supply Chain Coordinator',
    'Operations Manager',
    'EHS Manager (Environmental Health & Safety)',
    'Automation Engineer',
    'Continuous Improvement Manager',
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
              <Factory className="h-4 w-4" />
              <span className="text-sm font-medium">Manufacturing Staffing & Recruitment</span>
            </motion.div>
            <motion.h1 
              className="text-h1 font-heading mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Manufacturing Talent That Keeps Lines Running
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 text-sky-blue-500 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              From CNC machinists to plant managers—InTime delivers Lean Six Sigma certified teams who understand OEE, 5S, and production deadlines. 86% of manufacturers report skill shortages. We fill that gap fast.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
                Find Manufacturing Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline whitespace-nowrap">
                Our Manufacturing Expertise
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Built for Manufacturing Scale & Speed */}
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
              Built for Manufacturing Scale & Speed
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8 mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { title: '48-Hour Staffing', desc: 'Production line down? We deploy skilled workers within 48 hours.' },
                { title: 'Lean Six Sigma Certified', desc: 'All talent trained: 5S, Kaizen, OEE, SMED—we speak manufacturing.' },
                { title: 'Multi-Shift Coverage', desc: '1st, 2nd, 3rd shift—weekends, holidays—we staff 24/7/365.' },
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
                <strong className="text-trust-blue">The Manufacturing Skills Gap:</strong> 86% of manufacturers can't find qualified workers. Production lines sit idle. Quality defects spike. Overtime costs explode.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers skilled manufacturing talent fast—CNC operators, maintenance techs, quality engineers, plant managers. All Lean Six Sigma certified. All ready to hit the floor running. Whether you need 1 machinist or 100 production workers, we staff in 48 hours.
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
            Manufacturing Roles We Staff
          </motion.h2>
          <motion.p 
            className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            From production floors to plant management—CNC, welding, quality, maintenance, engineering, and leadership.
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
      {/* Why Manufacturers Choose InTime */}
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
              Why Manufacturers Choose InTime
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
                  title: 'Emergency Production Staffing',
                  desc: 'Line down? Rush order? We deploy CNC operators, welders, and assemblers in 48 hours.'
                },
                {
                  title: 'Lean Six Sigma Teams',
                  desc: 'All talent trained: 5S, Kaizen, OEE, SMED, root cause analysis—we speak manufacturing.'
                },
                {
                  title: 'Multi-Shift Flexibility',
                  desc: '1st, 2nd, 3rd shift—weekends, holidays—we staff around the clock.'
                },
                {
                  title: 'Safety-Certified Workforce',
                  desc: 'OSHA 10/30, forklift certified, lockout/tagout trained—safety is non-negotiable.'
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
              Manufacturing Staffing By The Numbers
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { stat: '48hrs', label: 'Average time to first candidate on floor' },
                { stat: '95%', label: 'Placement retention rate (12 months)' },
                { stat: '$2.3T', label: 'US manufacturing market we serve' }
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
            Keep Your Lines Running. Staff Fast.
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Whether you need 1 CNC machinist or 100 production workers—we staff in 48 hours, trained, certified, and ready to produce.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
              Request Manufacturing Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center whitespace-nowrap">
              View Manufacturing Jobs
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
