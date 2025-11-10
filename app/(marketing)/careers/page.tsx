import Link from 'next/link';
import { ArrowRight, Briefcase, Users, Sparkles, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Careers at InTime | Join Our Team, Find Your Next Role, or Join Our Talent Network',
  description: 'Explore careers at InTime, browse open positions from our clients, or join our consultant bench. Three paths to your next opportunity.',
  keywords: 'intime careers, tech jobs, consultant opportunities, talent network, guidewire jobs, IT staffing careers',
};

export default function CareersPage() {
  const careerPaths = [
    {
      icon: <Briefcase className="h-10 w-10" />,
      title: 'Join Our Team',
      slug: 'join-our-team',
      description: 'Build your career at InTime. We\'re hiring recruiters, sales, operations, and more. Be part of a high-growth, mission-driven team.',
      features: ['Competitive compensation', 'Remote-first culture', 'Growth opportunities', 'Equity for early team'],
      stats: { label: 'Open Roles', value: '12+' },
      cta: 'View Internal Jobs',
      color: 'from-trust-blue to-trust-blue-600',
      badge: '🚀 GROWING FAST'
    },
    {
      icon: <Users className="h-10 w-10" />,
      title: 'Open Positions',
      slug: 'open-positions',
      description: 'Browse hundreds of client opportunities. Contract, contract-to-hire, and direct placements across 15+ industries.',
      features: ['Contract roles ($50-200/hr)', 'Perm placements ($80K-200K+)', 'Remote & hybrid options', 'Fast interview process'],
      stats: { label: 'Active Jobs', value: '200+' },
      cta: 'Browse Client Jobs',
      color: 'from-innovation-orange to-innovation-orange-600',
      badge: '🔥 HIRING NOW'
    },
    {
      icon: <Sparkles className="h-10 w-10" />,
      title: 'Available Talent',
      slug: 'available-talent',
      description: 'Join our consultant bench. Get matched to projects that fit your skills, rate, and schedule. Work when you want, where you want.',
      features: ['Flexible scheduling', 'Premium rates', 'Diverse projects', 'Free Guidewire training'],
      stats: { label: 'Active Consultants', value: '500+' },
      cta: 'Join Talent Network',
      color: 'from-success-green to-success-green-600',
      badge: '💼 CONSULTANTS WANTED'
    },
  ];

  const trending = [
    { icon: '🔥', text: 'Senior Guidewire Developers - $95-125/hr - Remote', badge: 'HOT' },
    { icon: '⚡', text: 'AI/ML Engineers - $120-160/hr - Hybrid', badge: 'NEW' },
    { icon: '🌍', text: 'Cross-Border Roles (H1B → Canada)', badge: 'TRENDING' },
  ];

  return (
    <>
      {/* Trending Jobs Banner */}
      <div className="bg-gradient-to-r from-innovation-orange-500 to-trust-blue-600 text-white py-3 overflow-hidden">
        <div className="animate-marquee whitespace-nowrap flex items-center gap-12">
          {[...trending, ...trending].map((item, index) => (
            <div key={index} className="inline-flex items-center gap-3">
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold">{item.text}</span>
              <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-bold">{item.badge}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-24">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <span className="text-sm font-semibold">💼 THREE PATHS. ONE DESTINATION: SUCCESS.</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Your Next Opportunity Starts Here
            </h1>
            <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-4xl mx-auto">
              Whether you want to join InTime's team, find your next client role, or become a consultant in our network—we've got you covered. Three career paths. Hundreds of opportunities. Zero BS.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#explore" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
                <span>Explore Opportunities</span>
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link href="/contact" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4">
                Talk to a Recruiter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Career Paths */}
      <section id="explore" className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-gray-900 mb-4">
              Three Ways to Work With InTime
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Choose your path. Build your career. We support all three.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {careerPaths.map((path, index) => (
              <div
                key={index}
                className="group bg-white rounded-3xl p-10 shadow-lg hover:shadow-2xl transition-all duration-300 border-2 border-gray-100 hover:border-trust-blue relative overflow-hidden"
              >
                {/* Badge */}
                <div className="absolute top-4 right-4 bg-innovation-orange-100 text-innovation-orange-700 px-3 py-1 rounded-full text-xs font-bold">
                  {path.badge}
                </div>

                {/* Gradient Background */}
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

                  {/* Stats */}
                  <div className="bg-gray-50 rounded-xl p-4 mb-6">
                    <div className="text-3xl font-bold text-trust-blue">{path.stats.value}</div>
                    <div className="text-sm text-gray-600">{path.stats.label}</div>
                  </div>

                  <Link 
                    href={`/careers/${path.slug}`}
                    className="btn-primary w-full justify-center flex items-center gap-2"
                  >
                    {path.cta}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Work With InTime */}
      <section className="py-20 bg-gradient-to-br from-trust-blue-50 to-success-green-50">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-center text-gray-900 mb-12">
              Why Professionals Choose InTime
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-5xl mb-4">💰</div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">Top Market Rates</h3>
                <p className="text-gray-600">
                  Contractors earn $50-200/hr. Perm roles $80K-200K+. We negotiate for YOU.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-5xl mb-4">⚡</div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">Fast Placements</h3>
                <p className="text-gray-600">
                  Submit Monday. Interview Tuesday. Offer Wednesday. Start next week.
                </p>
              </div>
              <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
                <div className="text-5xl mb-4">🎓</div>
                <h3 className="text-xl font-heading font-bold text-gray-900 mb-3">Free Training</h3>
                <p className="text-gray-600">
                  Guidewire certification, upskilling programs, career coaching—all free.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-4xl font-heading font-bold text-center text-gray-900 mb-12">
              Real Stories. Real Results.
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-gradient-to-br from-trust-blue-50 to-trust-blue-100 rounded-2xl p-8">
                <div className="text-4xl mb-4">📈</div>
                <p className="text-gray-700 mb-4 italic">
                  "InTime found me a Guidewire role at $115/hr—$40/hr more than my previous job. In 3 days."
                </p>
                <div className="font-semibold text-gray-900">Sarah M.</div>
                <div className="text-sm text-gray-600">Senior Guidewire Developer</div>
              </div>
              <div className="bg-gradient-to-br from-success-green-50 to-success-green-100 rounded-2xl p-8">
                <div className="text-4xl mb-4">🌍</div>
                <p className="text-gray-700 mb-4 italic">
                  "InTime helped me move from H1B to Canada in 3 months. Visa, job, everything. Incredible."
                </p>
                <div className="font-semibold text-gray-900">Raj P.</div>
                <div className="text-sm text-gray-600">Data Engineer</div>
              </div>
              <div className="bg-gradient-to-br from-innovation-orange-50 to-innovation-orange-100 rounded-2xl p-8">
                <div className="text-4xl mb-4">💼</div>
                <p className="text-gray-700 mb-4 italic">
                  "Joined InTime's bench. 6 projects in 1 year. $180K total. Flexible schedule. Love it."
                </p>
                <div className="font-semibold text-gray-900">Mike T.</div>
                <div className="text-sm text-gray-600">Full-Stack Consultant</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue-600 to-innovation-orange-500 text-white">
        <div className="section-container text-center">
          <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl mb-10 text-white/90 max-w-3xl mx-auto">
            Whether you're looking for your dream job, want to join our team, or ready to consult—let's talk. No gatekeepers. Just real conversations with real recruiters.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/careers/join-our-team" className="btn-secondary inline-flex items-center gap-2 text-lg px-8 py-4">
              <span>View Internal Roles</span>
              <ArrowRight className="h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center gap-2 text-lg px-8 py-4">
              Browse Client Jobs
            </Link>
          </div>

          <div className="mt-16 grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div>
              <div className="text-4xl font-bold mb-2">🇺🇸 USA</div>
              <a href="tel:+13076502850" className="text-white/90 hover:text-white text-lg">+1 307-650-2850</a>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">🇨🇦 Canada</div>
              <a href="tel:+12892369000" className="text-white/90 hover:text-white text-lg">+1 289-236-9000</a>
            </div>
            <div>
              <div className="text-4xl font-bold mb-2">🇮🇳 India</div>
              <a href="tel:+917981666144" className="text-white/90 hover:text-white text-lg">+91 798-166-6144</a>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}
