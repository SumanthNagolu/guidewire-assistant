"use client";
import { ArrowRight, CheckCircle2, Truck } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';
export default function LogisticsPage() {
  const roles = [
    'Supply Chain Manager',
    'Logistics Coordinator',
    'Transportation Manager',
    'Warehouse Manager',
    'Inventory Control Specialist',
    'Procurement Manager',
    'Demand Planner',
    'Supply Chain Analyst',
    'Freight Broker',
    'Distribution Manager',
    'Operations Manager',
    'Logistics Analyst',
    'Fleet Manager',
    'Import/Export Specialist',
    'Customs Compliance Specialist',
    'Supply Chain Director',
    'Logistics Supervisor',
    'Material Handler',
    'Shipping & Receiving Clerk',
    'Route Planner',
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
              <Truck className="h-4 w-4" />
              <span className="text-sm font-medium">Logistics & Supply Chain Staffing</span>
            </motion.div>
            <motion.h1 
              className="text-h1 font-heading mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              Move Goods. Move Fast. Move Right.
            </motion.h1>
            <motion.p 
              className="text-xl mb-8 text-sky-blue-500 leading-relaxed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              From warehouse floors to C-suite supply chain strategy—InTime delivers logistics talent that keeps shelves stocked and trucks moving. Peak season? Port delays? ERP migration? We staff 24/7.
            </motion.p>
            <motion.div 
              className="flex flex-wrap gap-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
                Find Logistics Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline whitespace-nowrap">
                Our Supply Chain Expertise
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
              Supply Chain Precision
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8 mb-12"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { title: 'Peak Season Ready', desc: 'Q4 surge? We staff 100+ warehouse roles in 72 hours.' },
                { title: 'WMS/TMS Certified', desc: 'SAP, Oracle, Manhattan, Blue Yonder—our talent knows the systems.' },
                { title: '24/7 Operations Support', desc: 'Night shifts, weekends, holidays—we staff around the clock.' },
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
                <strong className="text-trust-blue">The Logistics Talent Crunch:</strong> 78% of logistics firms report critical talent shortages. Peak season demand spikes 300%. Port congestion creates emergency staffing needs.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime maintains a national network of logistics professionals—warehouse managers, supply chain analysts, freight brokers, and operations specialists. We staff for normal operations AND emergency surges.
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
            Logistics Roles We Staff
          </motion.h2>
          <motion.p 
            className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            From warehouse floors to executive supply chain strategy—transportation, distribution, procurement, and more.
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
      {/* Why Logistics Companies Choose InTime */}
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
              Why Logistics Companies Choose InTime
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
                  title: 'Emergency Staffing (24-48hrs)',
                  desc: 'Port strike? Peak season surge? We deploy warehouse teams overnight.'
                },
                {
                  title: 'WMS/TMS Expertise',
                  desc: 'SAP EWM, Oracle WMS, Manhattan, Blue Yonder—our talent knows the systems.'
                },
                {
                  title: 'Compliance-Focused',
                  desc: 'OSHA, DOT, customs regulations—all candidates screened for compliance.'
                },
                {
                  title: 'Flexible Scaling',
                  desc: '1 logistics manager or 100 warehouse workers—we scale with your needs.'
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
              Logistics Staffing By The Numbers
            </motion.h2>
            <motion.div 
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                { stat: '48hrs', label: 'Average response time for emergency staffing' },
                { stat: '97%', label: 'On-time placement success rate' },
                { stat: '$1.6T', label: 'US logistics market we serve' }
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
            Need Logistics Talent? We Move Fast.
          </motion.h2>
          <motion.p 
            className="text-xl mb-8 max-w-2xl mx-auto text-white/90"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Whether you need one supply chain analyst or an entire warehouse crew—we staff fast, trained, and ready to ship.
          </motion.p>
          <motion.div 
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/contact" className="btn-secondary inline-flex items-center whitespace-nowrap">
              Request Logistics Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center whitespace-nowrap">
              View Logistics Jobs
            </Link>
          </motion.div>
        </div>
      </section>
    </>
  );
}
