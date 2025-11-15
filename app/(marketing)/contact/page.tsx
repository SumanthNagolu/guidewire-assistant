"use client";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactFormClient from '@/components/marketing/ContactFormClient';
import { motion } from 'framer-motion';
export default function ContactPage() {
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
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-trust-blue to-success-green text-white py-20">
        <div className="section-container">
          <motion.div 
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-5xl md:text-6xl font-heading font-bold mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              Let's Start Your Transformation
            </motion.h1>
            <motion.p 
              className="text-xl md:text-2xl text-gray-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              Whether you need talent, training, or career guidance, we're here to help. Reach out and experience the InTime difference.
            </motion.p>
          </motion.div>
        </div>
      </section>
      {/* Contact Options Grid */}
      <section className="py-20 bg-wisdom-gray-50">
        <div className="section-container">
          <motion.div 
            className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {/* For Immediate Needs */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-all flex flex-col h-full card-dynamic">
              <div className="w-16 h-16 bg-innovation-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-innovation-orange" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-wisdom-gray-700 mb-3 h-14 flex items-center justify-center">
                For Immediate Needs
              </h3>
              <a href="tel:+13076502850" className="text-2xl font-mono font-bold text-trust-blue hover:text-trust-blue-600 block mb-2">
                +1 307-650-2850
              </a>
              <p className="text-sm text-wisdom-gray mb-2">🇺🇸 USA</p>
              <p className="text-sm text-success-green mt-auto">Available 24/7 for urgent requirements</p>
            </motion.div>
            {/* For Business Inquiries */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-all flex flex-col h-full card-dynamic">
              <div className="w-16 h-16 bg-trust-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-trust-blue" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-wisdom-gray-700 mb-3 h-14 flex items-center justify-center">
                For Business Inquiries
              </h3>
              <a href="mailto:enterprise@intimesolutions.com" className="text-lg text-trust-blue hover:text-trust-blue-600 font-semibold block mb-4 break-words">
                enterprise@intimesolutions.com
              </a>
              <p className="text-sm text-success-green mt-auto">Response within 2 hours during business hours</p>
            </motion.div>
            {/* For Career Support */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-all flex flex-col h-full card-dynamic">
              <div className="w-16 h-16 bg-success-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-success-green" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-wisdom-gray-700 mb-3 h-14 flex items-center justify-center">
                For Career Support
              </h3>
              <a href="mailto:careers@intimesolutions.com" className="text-lg text-success-green hover:text-success-green-600 font-semibold block mb-4 break-words">
                careers@intimesolutions.com
              </a>
              <p className="text-sm text-success-green mt-auto">Free consultation available</p>
            </motion.div>
            {/* For Training Programs */}
            <motion.div variants={fadeInUp} className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-all flex flex-col h-full card-dynamic">
              <div className="w-16 h-16 bg-innovation-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-innovation-orange" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-wisdom-gray-700 mb-3 h-14 flex items-center justify-center">
                For Training Programs
              </h3>
              <a href="mailto:academy@intimesolutions.com" className="text-lg text-innovation-orange hover:text-innovation-orange-600 font-semibold block mb-4 break-words">
                academy@intimesolutions.com
              </a>
              <p className="text-sm text-success-green mt-auto">Speak with education counselor</p>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Contact Form & Office Locations */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <motion.div 
              className="lg:col-span-2"
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <ContactFormClient />
            </motion.div>
            {/* Office Locations */}
            <motion.div 
              className="space-y-6"
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-6">
                Office Locations
              </h2>
              {/* USA Office */}
              <motion.div 
                className="bg-gradient-to-br from-success-green-50 to-trust-blue-50 rounded-2xl p-6 border-2 border-success-green card-lift"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-success-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                      🇺🇸 USA Office
                    </h3>
                    <p className="text-wisdom-gray text-sm leading-relaxed">
                      30 N Gould St Ste R<br />
                      Sheridan, WY 82801
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-wisdom-gray">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-success-green" />
                    <a href="tel:+13076502850" className="hover:text-success-green-600">+1 307-650-2850</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-success-green" />
                    <a href="mailto:info@intimeesolutions.com" className="hover:text-success-green-600">info@intimeesolutions.com</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-success-green" />
                    <span>Mon-Fri 9am-6pm EST</span>
                  </div>
                </div>
              </motion.div>
              {/* Canada Office */}
              <motion.div 
                className="bg-gradient-to-br from-trust-blue-50 to-innovation-orange-50 rounded-2xl p-6 border-2 border-innovation-orange card-lift"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-innovation-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                      🇨🇦 Canada Office
                    </h3>
                    <p className="text-wisdom-gray text-sm leading-relaxed">
                      330 Gillespie Drive<br />
                      Brantford, ON N3T 0X1
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-wisdom-gray">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-innovation-orange" />
                    <a href="tel:+12892369000" className="hover:text-innovation-orange-600">+1 289-236-9000</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-innovation-orange" />
                    <a href="mailto:canada@intimeesolutions.com" className="hover:text-innovation-orange-600">canada@intimeesolutions.com</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-innovation-orange" />
                    <span>Mon-Fri 9am-6pm EST</span>
                  </div>
                </div>
              </motion.div>
              {/* India Office */}
              <motion.div 
                className="bg-gradient-to-br from-innovation-orange-50 to-trust-blue-50 rounded-2xl p-6 border-2 border-trust-blue card-lift"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-trust-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                      🇮🇳 India Office
                    </h3>
                    <p className="text-wisdom-gray text-sm leading-relaxed">
                      606 DSL Abacus IT Park<br />
                      Uppal, Hyderabad<br />
                      Telangana 500039
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-wisdom-gray">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-trust-blue" />
                    <a href="tel:+917981666144" className="hover:text-trust-blue-600">+91 798-166-6144</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-trust-blue" />
                    <a href="mailto:india@intimeesolutions.com" className="hover:text-trust-blue-600">india@intimeesolutions.com</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-trust-blue" />
                    <span>24/7 Operations</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>
    </div>
  );
}
