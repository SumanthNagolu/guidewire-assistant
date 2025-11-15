"use client";
import Link from 'next/link';
import { ArrowRight, Briefcase, Users, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: 'easeOut' },
};
const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};
const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: 'easeOut' },
};
const careerPaths = [
  {
    icon: <Briefcase className="h-10 w-10" />,
    title: 'Join Our Team',
    slug: 'join-our-team',
    description:
      "Build your career at InTime. We're hiring recruiters, sales, operations, and more. Be part of a high-growth, mission-driven team.",
    features: ['Competitive compensation', 'Remote-first culture', 'Growth opportunities', 'Equity for early team'],
    stats: { label: 'Open Roles', value: '12+' },
    cta: 'View Internal Jobs',
    color: 'from-trust-blue to-trust-blue-600',
    badge: '🚀 GROWING FAST',
  },
  {
    icon: <Users className="h-10 w-10" />,
    title: 'Open Positions',
    slug: 'open-positions',
    description:
      'Browse hundreds of client opportunities. Contract, contract-to-hire, and direct placements across 15+ industries.',
    features: ['Contract roles ($50-200/hr)', 'Perm placements ($80K-200K+)', 'Remote & hybrid options', 'Fast interview process'],
    stats: { label: 'Active Jobs', value: '200+' },
    cta: 'Browse Client Jobs',
    color: 'from-innovation-orange to-innovation-orange-600',
    badge: '🔥 HIRING NOW',
  },
  {
    icon: <Sparkles className="h-10 w-10" />,
    title: 'Available Talent',
    slug: 'available-talent',
    description:
      'Join our consultant bench. Get matched to projects that fit your skills, rate, and schedule. Work when you want, where you want.',
    features: ['Flexible scheduling', 'Premium rates', 'Diverse projects', 'Free Guidewire training'],
    stats: { label: 'Active Consultants', value: '500+' },
    cta: 'Join Talent Network',
    color: 'from-success-green to-success-green-600',
    badge: '💼 CONSULTANTS WANTED',
  },
];
const trending = [
  { icon: '🔥', text: 'Senior Guidewire Developers - $95-125/hr - Remote', badge: 'HOT' },
  { icon: '⚡', text: 'AI/ML Engineers - $120-160/hr - Hybrid', badge: 'NEW' },
  { icon: '🌍', text: 'Cross-Border Roles (H1B → Canada)', badge: 'TRENDING' },
];
export default function CareersPageClient() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <motion.div
            className="max-w-5xl mx-auto text-center"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.div
              className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6"
              variants={scaleIn}
              initial="initial"
              animate="animate"
            >
              <span className="text-sm font-semibold">💼 THREE PATHS. ONE DESTINATION: SUCCESS.</span>
            </motion.div>
            <motion.h1
              className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.2 }}
            >
              Your Next Opportunity Starts Here
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl mb-10 text-gray-100 max-w-4xl mx-auto"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.3 }}
            >
              Whether you want to join InTime's team, find your next client role, or become a consultant in our network—we've got you covered. Three career paths. Hundreds of opportunities. Zero BS.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              variants={fadeInUp}
              initial="initial"
              animate="animate"
              transition={{ delay: 0.4 }}
            >
              <Link href="#explore" className="btn-secondary inline-flex items-center whitespace-nowrap gap-2 text-lg px-8 py-4">
                <span>Explore Opportunities</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/contact" className="btn-outline inline-flex items-center whitespace-nowrap gap-2 text-lg px-8 py-4">
                Talk to a Recruiter
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>
      {/* Trending Jobs Banner */}
      <div className="bg-gradient-to-r from-innovation-orange-500 to-trust-blue-600 text-white py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
          {[...trending, ...trending].map((item, index) => (
            <motion.div key={index} className="inline-flex items-center gap-3" initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} transition={{ duration: 0.6 }} viewport={{ once: true }}>
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold">{item.text}</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{item.badge}</span>
            </motion.div>
          ))}
        </div>
      </div>
      {/* Career Paths */}
      <section id="explore" className="py-20 bg-white">
        <div className="section-container">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Three Ways to Work With InTime
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your path. Build your career. We support all three.
            </p>
          </motion.div>
          <motion.div
            className="grid md:grid-cols-3 gap-8 mb-16"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-100px' }}
          >
            {careerPaths.map((path, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                className="group bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-trust-blue relative overflow-hidden card-dynamic"
              >
                <div className="absolute top-4 right-4 bg-innovation-orange-100 text-innovation-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                  {path.badge}
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br ${path.color} opacity-0 group-hover:opacity-5 transition-opacity`}></div>
                <div className="relative z-10">
                  <div className="h-20 w-20 bg-trust-blue-50 rounded-2xl flex items-center justify-center mb-6 text-trust-blue group-hover:bg-trust-blue group-hover:text-white transition-all">
                    {path.icon}
                  </div>
                  <h3 className="text-3xl font-heading font-bold text-gray-900 mb-3 group-hover:text-trust-blue transition-colors">
                    {path.title}
                  </h3>
                  <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                    {path.description}
                  </p>
                  <div className="space-y-3 mb-6">
                    {path.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <div className="h-1.5 w-1.5 bg-success-green rounded-full flex-shrink-0"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="text-3xl font-bold text-trust-blue">{path.stats.value}</div>
                    <div className="text-sm text-gray-600">{path.stats.label}</div>
                  </div>
                  <Link
                    href={`/careers/${path.slug}`}
                    className="btn-primary w-full inline-flex items-center justify-center gap-2 whitespace-nowrap"
                  >
                    {path.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
      {/* Why Work With InTime */}
      <section className="py-20 bg-gradient-to-br from-trust-blue-50 to-success-green-50">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              className="text-4xl font-heading font-bold text-center text-gray-900 mb-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Why Professionals Choose InTime
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: '💰',
                  title: 'Top Market Rates',
                  description: 'Contractors earn $50-200/hr. Perm roles $80K-200K+. We negotiate for YOU.',
                },
                {
                  icon: '⚡',
                  title: 'Fast Placements',
                  description: 'Submit Monday. Interview Tuesday. Offer Wednesday. Start next week.',
                },
                {
                  icon: '🎓',
                  title: 'Free Training',
                  description: 'Guidewire certification, upskilling programs, career coaching—all free.',
                },
              ].map((item, index) => (
                <motion.div key={index} variants={fadeInUp} className="bg-white rounded-2xl p-8 shadow-lg text-center card-dynamic">
                  <div className="text-5xl mb-4">{item.icon}</div>
                  <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <motion.h2
              className="text-4xl font-heading font-bold text-center text-gray-900 mb-12"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              Real Stories. Real Results.
            </motion.h2>
            <motion.div
              className="grid md:grid-cols-3 gap-8"
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
            >
              {[
                {
                  icon: '📈',
                  quote:
                    '"InTime found me a Guidewire role at $115/hr—$40/hr more than my previous job. In 3 days."',
                  name: 'Sarah M.',
                  role: 'Senior Guidewire Developer',
                },
                {
                  icon: '🌍',
                  quote:
                    '"InTime helped me move from H1B to Canada in 3 months. Visa, job, everything. Incredible."',
                  name: 'Raj P.',
                  role: 'Data Engineer',
                },
                {
                  icon: '💼',
                  quote: '"Joined InTime\'s bench. 6 projects in 1 year. $180K total. Flexible schedule. Love it."',
                  name: 'Mike T.',
                  role: 'Full-Stack Consultant',
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  className="bg-gradient-to-br from-trust-blue-50 to-trust-blue-100 rounded-2xl p-8 card-lift"
                >
                  <div className="text-4xl mb-4">{item.icon}</div>
                  <p className="text-gray-700 mb-4 italic">{item.quote}</p>
                  <div className="font-semibold text-gray-900">{item.name}</div>
                  <div className="text-sm text-gray-600">{item.role}</div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue-600 to-innovation-orange-500 text-white">
        <div className="section-container text-center">
          <motion.h2
            className="text-4xl md:text-5xl font-heading font-bold mb-6"
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Ready to Take the Next Step?
          </motion.h2>
          <motion.p
            className="text-xl mb-10 text-white/90 max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            viewport={{ once: true }}
          >
            Whether you're looking for your dream job, want to join our team, or ready to consult—let's talk. No gatekeepers. Just real conversations with real recruiters.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            viewport={{ once: true }}
          >
            <Link href="/careers/join-our-team" className="btn-secondary inline-flex items-center whitespace-nowrap gap-2 text-lg px-8 py-4">
              <span>View Internal Roles</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center whitespace-nowrap gap-2 text-lg px-8 py-4">
              Browse Client Jobs
            </Link>
          </motion.div>
          <motion.div
            className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto"
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            {[
              { country: '🇺🇸 USA', phone: '+1 307-650-2850' },
              { country: '🇨🇦 Canada', phone: '+1 289-236-9000' },
              { country: '🇮🇳 India', phone: '+91 798-166-6144' },
            ].map((location) => (
              <motion.div key={location.country} variants={fadeInUp}>
                <div className="text-4xl font-bold mb-2">{location.country}</div>
                <a href={`tel:${location.phone.replace(/[^+\d]/g, '')}`} className="text-white/90 hover:text-white text-lg">
                  {location.phone}
                </a>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>
    </>
  );
}
