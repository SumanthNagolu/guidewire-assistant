import { ArrowRight, Award, BookOpen, GraduationCap, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'InTime Academy - Professional Training & Transformation | InTime eSolutions',
  description: 'World-class training in Guidewire, Quality Engineering, Project Management, Data Engineering, and AI/ML. Transform your career with Day 1, Day 100, and Year 10 preparation.',
  keywords: 'Guidewire training, IT training programs, quality engineering bootcamp, project management certification, data engineering course, AI ML training',
};

export default function AcademyPage() {
  const tracks = [
    {
      icon: <GraduationCap className="h-8 w-8" />,
      title: 'Guidewire Insurance Suite',
      desc: 'Master PolicyCenter, BillingCenter, and ClaimCenter',
      topics: ['PolicyCenter Configuration', 'BillingCenter Operations', 'ClaimCenter Workflows', 'Integration Patterns'],
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'Quality Engineering & Test Automation',
      desc: 'Automated testing, CI/CD, and quality frameworks',
      topics: ['Selenium & Appium', 'Performance Testing', 'API Testing', 'DevOps & CI/CD'],
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: 'Project Management & Agile Delivery',
      desc: 'Scrum, Kanban, and agile leadership',
      topics: ['Scrum Master Certification', 'Agile Coaching', 'Product Owner Track', 'Scaled Agile (SAFe)'],
    },
    {
      icon: <BookOpen className="h-8 w-8" />,
      title: 'Data Engineering & Analytics',
      desc: 'Build robust data pipelines and analytics platforms',
      topics: ['ETL & Data Pipelines', 'Data Warehousing', 'Big Data Technologies', 'BI & Visualization'],
    },
    {
      icon: <Award className="h-8 w-8" />,
      title: 'AI/ML Foundations and MLOps',
      desc: 'From classical ML to production LLM applications',
      topics: ['Machine Learning Fundamentals', 'Deep Learning', 'MLOps & Deployment', 'LLM Applications'],
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-innovation-orange-600 via-innovation-orange to-innovation-orange-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <GraduationCap className="h-4 w-4" />
              <span className="text-sm font-medium">InTime Academy</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Transform Your Career. Master Your Craft.
            </h1>
            <p className="text-xl mb-8 leading-relaxed">
              InTime Academy delivers world‑class training that combines technical mastery with professional excellence. We prepare people for Day 1, Day 100, and Year 10—mindset, communication, and craft.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="bg-white text-innovation-orange hover:bg-wisdom-gray-50 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center">
                Explore Programs
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/solutions/training" className="btn-outline">
                View Training Solutions
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Important Notice */}
      <section className="py-8 bg-wisdom-gray-100 border-y border-wisdom-gray-300">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-wisdom-gray-700 leading-relaxed">
              <strong>Legal Notice:</strong> InTime Academy (training) and InTime Staffing (placement) are separate entities. Training does not guarantee placement. We focus on transformation; clients hire based on merit and fit.
            </p>
          </div>
        </div>
      </section>

      {/* Training Tracks */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading mb-4 text-trust-blue">
              Our Training Tracks
            </h2>
            <p className="text-lg text-wisdom-gray-600 max-w-3xl mx-auto">
              Comprehensive programs designed to take you from fundamentals to industry-ready expertise.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tracks.map((track, index) => (
              <div
                key={index}
                className="bg-wisdom-gray-50 p-8 rounded-2xl border-2 border-transparent hover:border-innovation-orange transition-all duration-300 hover:shadow-xl"
              >
                <div className="h-16 w-16 bg-innovation-orange-50 rounded-xl flex items-center justify-center mb-6 text-innovation-orange">
                  {track.icon}
                </div>
                <h3 className="text-h4 font-heading mb-3 text-trust-blue">{track.title}</h3>
                <p className="text-wisdom-gray-600 mb-6">{track.desc}</p>
                <div className="space-y-2">
                  {track.topics.map((topic, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-wisdom-gray-700">
                      <div className="h-1.5 w-1.5 bg-success-green rounded-full"></div>
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-trust-blue-50">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              The InTime Academy Difference
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { title: 'Day 1 Ready', desc: 'Hands-on projects and real-world scenarios from day one' },
                { title: 'Day 100 Confident', desc: 'Deep mastery through progressive complexity and mentorship' },
                { title: 'Year 10 Leader', desc: 'Professional excellence, communication, and growth mindset' },
              ].map((phase, index) => (
                <div key={index} className="text-center">
                  <div className="h-16 w-16 bg-innovation-orange-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-innovation-orange">{index + 1}</span>
                  </div>
                  <h3 className="text-h5 font-heading text-trust-blue mb-3">{phase.title}</h3>
                  <p className="text-wisdom-gray-600">{phase.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Community & Excellence */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-h2 font-heading mb-6 text-trust-blue">
              Join a Community Where Excellence is the Baseline
            </h2>
            <p className="text-lg text-wisdom-gray-700 mb-8 leading-relaxed">
              Graduates join a community where excellence is the baseline and learning never stops. Connect with peers, mentors, and industry leaders who share your commitment to mastery.
            </p>
            <div className="grid md:grid-cols-3 gap-6 text-center">
              {[
                { stat: '500+', label: 'Graduates' },
                { stat: '95%', label: 'Completion Rate' },
                { stat: '4.8/5', label: 'Student Rating' },
              ].map((item, index) => (
                <div key={index} className="bg-innovation-orange-50 p-6 rounded-xl">
                  <div className="text-4xl font-bold text-innovation-orange mb-2">{item.stat}</div>
                  <div className="text-wisdom-gray-700">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-innovation-orange to-innovation-orange-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Transform Your Career?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Explore our training programs and take the first step toward mastery.
          </p>
          <Link href="/contact" className="bg-white text-innovation-orange hover:bg-wisdom-gray-50 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg hover:shadow-xl inline-flex items-center">
            Contact Us Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

