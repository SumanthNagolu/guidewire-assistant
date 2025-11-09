import { ArrowRight, Briefcase, Users, Award } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Careers | InTime eSolutions',
  description: 'Join our team, explore open positions, or showcase your talent. Build your career with InTime eSolutions.',
  keywords: 'careers, job openings, IT jobs, consulting jobs, join our team, available talent',
};

export default function CareersPage() {
  const careerPaths = [
    {
      icon: <Briefcase className="h-12 w-12" />,
      title: 'Join Our Team',
      description: 'Build your career with InTime eSolutions. Explore internal opportunities and grow with us.',
      link: '/careers/join-our-team',
      cta: 'View Open Positions',
      color: 'trust-blue',
    },
    {
      icon: <Users className="h-12 w-12" />,
      title: 'Open Positions',
      description: 'Browse client job openings we\'re actively recruiting for. Find your next opportunity.',
      link: '/careers/open-positions',
      cta: 'Explore Opportunities',
      color: 'success-green',
    },
    {
      icon: <Award className="h-12 w-12" />,
      title: 'Available Talent',
      description: 'Showcase your skills and join our talent bench. Get matched with exciting projects.',
      link: '/careers/available-talent',
      cta: 'Join Talent Pool',
      color: 'innovation-orange',
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-h1 font-heading mb-6">
              Build Your Future InTime
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              Whether you're looking to join our team, find your next role, or showcase your expertise—we're here to connect talent with opportunity.
            </p>
          </div>
        </div>
      </section>

      {/* Three Career Paths */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="grid md:grid-cols-3 gap-8">
            {careerPaths.map((path, index) => (
              <Link
                key={index}
                href={path.link}
                className="group bg-wisdom-gray-50 p-8 rounded-2xl border-2 border-transparent hover:border-trust-blue transition-all duration-300 hover:shadow-xl"
              >
                <div className={`h-20 w-20 bg-${path.color}-50 rounded-xl flex items-center justify-center mb-6 text-${path.color} group-hover:bg-${path.color} group-hover:text-white transition-colors`}>
                  {path.icon}
                </div>
                <h2 className="text-h3 font-heading mb-4 text-trust-blue">
                  {path.title}
                </h2>
                <p className="text-wisdom-gray-600 mb-6 leading-relaxed">
                  {path.description}
                </p>
                <div className="flex items-center text-trust-blue font-semibold group-hover:gap-2 transition-all">
                  {path.cta}
                  <ArrowRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Why InTime Section */}
      <section className="py-16 bg-trust-blue-50">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-8 text-trust-blue text-center">
              Why Choose InTime eSolutions
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  title: 'Growth Opportunities', 
                  desc: 'Continuous learning, skill development, and career advancement paths.' 
                },
                { 
                  title: 'Competitive Benefits', 
                  desc: 'Industry-leading compensation, health benefits, and work-life balance.' 
                },
                { 
                  title: 'Diverse Projects', 
                  desc: 'Work with leading clients across industries on cutting-edge technology.' 
                },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="h-16 w-16 bg-trust-blue rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-white">{index + 1}</span>
                  </div>
                  <h3 className="text-h5 font-heading text-trust-blue mb-3">{item.title}</h3>
                  <p className="text-wisdom-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Take the Next Step?
          </h2>
          <p className="text-xl mb-8 text-sky-blue-500 max-w-2xl mx-auto">
            Explore opportunities, submit your resume, or get in touch with our talent team.
          </p>
          <Link href="/contact" className="btn-secondary inline-flex items-center">
            Contact Our Team
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

