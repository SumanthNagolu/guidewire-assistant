import Link from "next/link";
import { GraduationCap, Users, TrendingUp, Award, Clock, DollarSign, CheckCircle2, Star } from "lucide-react";
export const metadata = {
  title: "Training Programs - InTime eSolutions",
  description: "Transform Your Career in 8 Weeks - Industry-aligned bootcamps that combine technical mastery with professional excellence.",
};
export default function TrainingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-success-green to-trust-blue text-white py-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Transform Your Career in 8 Weeks
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Industry-aligned bootcamps that combine technical mastery with professional excellence. Graduate job-ready, not just certified.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8 mb-8 text-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-6 h-6" />
                <span>80% Placement Rate</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-6 h-6" />
                <span>60% Salary Increase</span>
              </div>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6" />
                <span>500+ Alumni</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6" />
                <span>95% Satisfaction</span>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="#programs" className="btn-accent bg-white text-success-green hover:bg-gray-100">
                View Programs
              </Link>
              <button className="btn-outline">
                Speak to Advisor
              </button>
            </div>
          </div>
        </div>
      </section>
      {/* Featured Program: Guidewire */}
      <section id="programs" className="py-20 bg-white">
        <div className="section-container">
          <div className="bg-gradient-to-br from-trust-blue-50 to-success-green-50 rounded-3xl p-8 md:p-12 border-2 border-trust-blue">
            <div className="flex items-center gap-3 mb-6">
              <span className="bg-innovation-orange text-white px-4 py-1 rounded-full text-sm font-semibold">
                FEATURED PROGRAM
              </span>
              <span className="bg-success-green text-white px-4 py-1 rounded-full text-sm font-semibold">
                HIGH DEMAND
              </span>
            </div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
                  Guidewire Certification Bootcamp
                </h2>
                <p className="text-xl text-wisdom-gray mb-6">
                  Master the #1 insurance software platform and launch your career in InsuranceTech
                </p>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="flex items-center gap-3">
                    <Clock className="w-6 h-6 text-trust-blue" />
                    <div>
                      <div className="font-semibold text-wisdom-gray-700">Duration</div>
                      <div className="text-wisdom-gray">8 weeks (320 hours)</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-6 h-6 text-trust-blue" />
                    <div>
                      <div className="font-semibold text-wisdom-gray-700">Format</div>
                      <div className="text-wisdom-gray">Live online + self-paced</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-6 h-6 text-success-green" />
                    <div>
                      <div className="font-semibold text-wisdom-gray-700">Avg Salary</div>
                      <div className="text-wisdom-gray">$120K - $140K</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-6 h-6 text-success-green" />
                    <div>
                      <div className="font-semibold text-wisdom-gray-700">Cohort Size</div>
                      <div className="text-wisdom-gray">Max 20 students</div>
                    </div>
                  </div>
                </div>
                <div className="bg-white rounded-xl p-6 mb-6">
                  <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                    What You'll Learn (Week by Week)
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="font-semibold text-trust-blue mb-2">Week 1-2: Guidewire Fundamentals</div>
                      <div className="text-wisdom-gray text-sm">Platform architecture • PolicyCenter configuration • Data model understanding</div>
                    </div>
                    <div>
                      <div className="font-semibold text-trust-blue mb-2">Week 3-4: Core Applications</div>
                      <div className="text-wisdom-gray text-sm">ClaimCenter configuration • BillingCenter basics • Integration patterns</div>
                    </div>
                    <div>
                      <div className="font-semibold text-trust-blue mb-2">Week 5-6: Advanced Topics</div>
                      <div className="text-wisdom-gray text-sm">Business rules • UI configuration • Gosu programming</div>
                    </div>
                    <div>
                      <div className="font-semibold text-trust-blue mb-2">Week 7: Real-World Projects</div>
                      <div className="text-wisdom-gray text-sm">Build complete solutions • Industry case studies • Best practices</div>
                    </div>
                    <div>
                      <div className="font-semibold text-trust-blue mb-2">Week 8: Career Preparation</div>
                      <div className="text-wisdom-gray text-sm">Resume optimization • Interview prep • Placement support</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Link href="/contact?program=guidewire" className="btn-primary">
                    Enroll Now
                  </Link>
                  <button className="btn-outline border-trust-blue text-trust-blue hover:bg-trust-blue hover:text-white">
                    Download Syllabus
                  </button>
                  <button className="btn-outline border-success-green text-success-green hover:bg-success-green hover:text-white">
                    Speak to Alumni
                  </button>
                </div>
              </div>
              <div className="bg-white rounded-xl p-6">
                <div className="bg-innovation-orange text-white text-center py-3 rounded-lg mb-6">
                  <div className="text-sm font-semibold">Next Cohort Starts</div>
                  <div className="text-2xl font-heading font-bold">December 1, 2024</div>
                  <div className="text-sm mt-1">Only 5 Seats Left!</div>
                </div>
                <h4 className="font-heading font-semibold text-wisdom-gray-700 mb-4">Outcomes:</h4>
                <ul className="space-y-3 mb-6">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Guidewire Certified Professional</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm">3 real-world projects in portfolio</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Job-ready from day one</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span className="text-sm">Lifetime career support</span>
                  </li>
                </ul>
                <div className="border-t pt-6">
                  <div className="text-center mb-2">
                    <div className="text-3xl font-heading font-bold text-trust-blue">$1,695</div>
                    <div className="text-sm text-wisdom-gray">Payment plans available</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Other Programs */}
      <section className="py-20 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              Other Programs
            </h2>
            <p className="text-xl text-wisdom-gray">
              Choose your path to career transformation
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Full Stack Development */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700">
                  Full Stack Development
                </h3>
                <GraduationCap className="w-8 h-8 text-trust-blue" />
              </div>
              <p className="text-wisdom-gray mb-4">React + Node.js + MongoDB</p>
              <div className="space-y-2 mb-6 text-sm text-wisdom-gray">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">8 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-semibold">December 15</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment:</span>
                  <span className="font-semibold">$1,695</span>
                </div>
              </div>
              <Link href="/contact?program=fullstack" className="block text-center btn-primary">
                Learn More
              </Link>
            </div>
            {/* Cloud Architecture */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700">
                  Cloud Architecture (AWS)
                </h3>
                <GraduationCap className="w-8 h-8 text-trust-blue" />
              </div>
              <p className="text-wisdom-gray mb-4">Solutions Architect path</p>
              <div className="space-y-2 mb-6 text-sm text-wisdom-gray">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">8 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-semibold">January 5</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment:</span>
                  <span className="font-semibold">$1,795</span>
                </div>
              </div>
              <Link href="/contact?program=cloud" className="block text-center btn-primary">
                Learn More
              </Link>
            </div>
            {/* Data Science */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700">
                  Data Science & Analytics
                </h3>
                <GraduationCap className="w-8 h-8 text-trust-blue" />
              </div>
              <p className="text-wisdom-gray mb-4">Python + ML + Visualization</p>
              <div className="space-y-2 mb-6 text-sm text-wisdom-gray">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">10 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-semibold">January 10</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment:</span>
                  <span className="font-semibold">$1,995</span>
                </div>
              </div>
              <Link href="/contact?program=datascience" className="block text-center btn-primary">
                Learn More
              </Link>
            </div>
            {/* Salesforce */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700">
                  Salesforce Administration
                </h3>
                <GraduationCap className="w-8 h-8 text-trust-blue" />
              </div>
              <p className="text-wisdom-gray mb-4">Admin + Platform App Builder</p>
              <div className="space-y-2 mb-6 text-sm text-wisdom-gray">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">6 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-semibold">December 20</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment:</span>
                  <span className="font-semibold">$1,495</span>
                </div>
              </div>
              <Link href="/contact?program=salesforce" className="block text-center btn-primary">
                Learn More
              </Link>
            </div>
            {/* DevOps */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700">
                  DevOps Engineering
                </h3>
                <GraduationCap className="w-8 h-8 text-trust-blue" />
              </div>
              <p className="text-wisdom-gray mb-4">CI/CD + Kubernetes + Terraform</p>
              <div className="space-y-2 mb-6 text-sm text-wisdom-gray">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">8 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-semibold">January 15</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment:</span>
                  <span className="font-semibold">$1,795</span>
                </div>
              </div>
              <Link href="/contact?program=devops" className="block text-center btn-primary">
                Learn More
              </Link>
            </div>
            {/* Cybersecurity */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700">
                  Cybersecurity Fundamentals
                </h3>
                <GraduationCap className="w-8 h-8 text-trust-blue" />
              </div>
              <p className="text-wisdom-gray mb-4">Security+ preparation</p>
              <div className="space-y-2 mb-6 text-sm text-wisdom-gray">
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span className="font-semibold">8 weeks</span>
                </div>
                <div className="flex justify-between">
                  <span>Start Date:</span>
                  <span className="font-semibold">January 20</span>
                </div>
                <div className="flex justify-between">
                  <span>Investment:</span>
                  <span className="font-semibold">$1,695</span>
                </div>
              </div>
              <Link href="/contact?program=cybersecurity" className="block text-center btn-primary">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Why InTime Academy */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              Why InTime Academy?
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Industry-Designed Curriculum",
                description: "Created by practitioners with 10+ years experience, not academics",
                icon: "👨‍💼"
              },
              {
                title: "Job Guarantee",
                description: "Get placed or get refunded - we're confident in our results",
                icon: "✅"
              },
              {
                title: "Lifetime Support",
                description: "Career services forever, not just post-graduation",
                icon: "♾️"
              },
              {
                title: "Real Projects",
                description: "Build portfolio pieces employers want to see",
                icon: "💼"
              },
              {
                title: "Expert Instructors",
                description: "Learn from professionals working in Fortune 500 companies",
                icon: "🎓"
              },
              {
                title: "Flexible Learning",
                description: "Live sessions + self-paced + recordings for your schedule",
                icon: "⏰"
              }
            ].map((item, index) => (
              <div key={index} className="bg-wisdom-gray-50 rounded-xl p-8 hover:bg-trust-blue-50 transition-colors">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-heading font-semibold text-wisdom-gray-700 mb-3">
                  {item.title}
                </h3>
                <p className="text-wisdom-gray">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-success-green to-trust-blue text-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to Transform Your Career?
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Join hundreds of successful professionals who launched their tech careers with InTime Academy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact?type=training" className="btn-accent bg-white text-success-green hover:bg-gray-100">
                Start Your Journey Today
              </Link>
              <button className="btn-outline">
                Schedule a Free Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
