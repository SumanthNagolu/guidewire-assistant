"use client";
import { ArrowRight, CheckCircle2, Car } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
export default function AutomobilePage() {
  const roles = [
    'Automotive Engineer',
    'Mechanical Engineer (Automotive)',
    'Electrical Engineer (EV)',
    'Powertrain Engineer',
    'Battery Systems Engineer',
    'Automotive Designer',
    'CAD Designer (Automotive)',
    'Manufacturing Engineer',
    'Quality Engineer (Automotive)',
    'Test Engineer',
    'Vehicle Dynamics Engineer',
    'Safety Engineer (Automotive)',
    'Embedded Systems Engineer',
    'Software Engineer (Automotive)',
    'Autonomous Vehicle Engineer',
    'Production Manager',
    'Supply Chain Manager (Automotive)',
    'Plant Manager (Automotive)',
    'Quality Control Inspector',
    'R&D Engineer (Automotive)',
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
              <Car className="h-4 w-4" />
              <span className="text-sm font-medium">Automotive Staffing & Recruitment</span>
            </motion.div>
            <motion.h1 
              className="text-h1 font-heading mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Automotive Talent That Drives Innovation
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 text-sky-blue-500 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              From traditional OEMs to EV startups—InTime delivers automotive talent who understand vehicle dynamics, powertrain systems, and battery technology. 88% of automotive companies report critical skill shortages. We solve that fast.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
                Find Automotive Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline whitespace-nowrap">
                Our Automotive Expertise
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
              Built for Automotive Speed & Scale
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8 mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { title: 'EV & Traditional', desc: 'From combustion engines to battery systems—we staff both.' },
                { title: 'OEM to Tier 3', desc: 'Toyota to local suppliers—full automotive supply chain coverage.' },
                { title: 'Design to Production', desc: 'CAD designers to plant managers—complete lifecycle staffing.' },
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
                <strong className="text-trust-blue">The Automotive Talent Crisis:</strong> 88% of automotive companies can't find qualified engineers. EV transition demands new skills. Production lines sit idle waiting for talent.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers automotive talent fast—powertrain engineers, battery specialists, manufacturing experts, quality engineers. Whether you're launching an EV or ramping production, we staff in 72 hours.
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
            Automotive Roles We Staff
          </motion.h2>
          <motion.p 
            className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            From design studios to production floors—engineers, designers, manufacturing, and quality talent.
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
      {/* Why Automotive Companies Choose InTime */}
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
              Why Automotive Companies Choose InTime
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
                  title: 'EV & Battery Expertise',
                  desc: 'From lithium-ion to solid-state—our battery engineers know the latest tech.'
                },
                {
                  title: 'Rapid Production Staffing',
                  desc: 'New model launch? Plant expansion? We staff 50+ workers in 72 hours.'
                },
                {
                  title: 'IATF 16949 Certified',
                  desc: 'All quality engineers certified in automotive quality management standards.'
                },
                {
                  title: 'CAD/CAE Specialists',
                  desc: 'CATIA, NX, SolidWorks, ANSYS—our designers know automotive design tools.'
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
              Automotive Staffing By The Numbers
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { stat: '72hrs', label: 'Average time to deploy automotive talent' },
                { stat: '94%', label: 'Placement success rate (OEM + Tier 1)' },
                { stat: '$3.5T', label: 'Global automotive market we serve' }
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
            Ready to Accelerate Your Automotive Team?
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Whether you need EV battery engineers or production line workers—we staff fast, certified, and ready to build.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
              Request Automotive Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center whitespace-nowrap">
              View Automotive Jobs
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
