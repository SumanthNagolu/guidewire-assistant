import Link from "next/link";
import { Zap, TrendingUp, Globe, Briefcase, GraduationCap, Users, ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue via-trust-blue-600 to-success-green text-white py-24 overflow-hidden">
        {/* Animated Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[linear-gradient(30deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(150deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(30deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff),linear-gradient(150deg,#fff_12%,transparent_12.5%,transparent_87%,#fff_87.5%,#fff)]"></div>
        </div>
        
        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-heading font-bold mb-6 leading-tight">
              Transform Your Career.<br />Power Your Business.<br />
              <span className="text-success-green">Do It InTime.</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-3xl mx-auto">
              Where Excellence Meets Opportunity - Staffing, Skill Development, and Cross-Border Solutions That Deliver Results
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <Link href="/contact" className="btn-accent w-full sm:w-auto text-lg">
                Start Your Transformation
              </Link>
              <Link href="/careers" className="btn-outline w-full sm:w-auto text-lg">
                Explore Opportunities
              </Link>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-200">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                <span>500+ Active Consultants</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                <span>95% Placement Success</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                <span>24-Hour Response</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* The InTime Difference */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              It's Not What You Do. It's <span className="text-trust-blue">HOW</span> You Do It.
            </h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-12">
            {/* Pillar 1: Speed Without Compromise */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-innovation-orange-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-10 h-10 text-innovation-orange" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Speed Without Compromise
              </h3>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                We're fast because we're prepared, not because we cut corners. Excellence at velocity is our promise.
              </p>
            </div>

            {/* Pillar 2: Transformation Not Transaction */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-success-green-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-10 h-10 text-success-green" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Transformation, Not Transaction
              </h3>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                Every placement is a career transformation. Every partnership is a growth catalyst. We measure success in changed lives.
              </p>
            </div>

            {/* Pillar 3: Global Expertise, Local Excellence */}
            <div className="text-center group">
              <div className="w-20 h-20 mx-auto mb-6 bg-trust-blue-50 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <Globe className="w-10 h-10 text-trust-blue" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Global Expertise, Local Excellence
              </h3>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                Break borders, not dreams. Your talent knows no boundaries—neither should your opportunities.
              </p>
            </div>
          </div>

          <div className="text-center mt-12">
            <Link href="/company/about" className="inline-flex items-center text-trust-blue hover:text-trust-blue-600 font-semibold text-lg group">
              Discover Our Approach
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* Solutions Overview */}
      <section className="py-20 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              Comprehensive Solutions for Every Talent Need
            </h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1: IT Staffing Excellence */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-trust-blue">
              <div className="w-14 h-14 mb-6 bg-trust-blue-50 rounded-xl flex items-center justify-center">
                <Briefcase className="w-8 h-8 text-trust-blue" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                IT Staffing Excellence
              </h3>
              <ul className="space-y-2 mb-6 text-wisdom-gray">
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Contract, Contract-to-Hire, Direct Placement
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  All technologies, all industries
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  24-hour placement guarantee
                </li>
              </ul>
              <Link href="/solutions/it-staffing" className="inline-flex items-center text-trust-blue hover:text-trust-blue-600 font-semibold group">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 2: Transformative Training */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-success-green">
              <div className="w-14 h-14 mb-6 bg-success-green-50 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-8 h-8 text-success-green" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Transformative Training
              </h3>
              <ul className="space-y-2 mb-6 text-wisdom-gray">
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  8-week intensive bootcamps
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  80% placement rate
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  60% salary increase
                </li>
              </ul>
              <Link href="/solutions/training" className="inline-flex items-center text-success-green hover:text-success-green-600 font-semibold group">
                View Programs
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 3: Cross-Border Advantage */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-innovation-orange">
              <div className="w-14 h-14 mb-6 bg-innovation-orange-50 rounded-xl flex items-center justify-center">
                <Globe className="w-8 h-8 text-innovation-orange" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Cross-Border Advantage
              </h3>
              <ul className="space-y-2 mb-6 text-wisdom-gray">
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  H1B to Canada transitions
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Canada to USA placement
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Complete relocation support
                </li>
              </ul>
              <Link href="/solutions/cross-border" className="inline-flex items-center text-innovation-orange hover:text-innovation-orange-600 font-semibold group">
                Explore Global
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            {/* Card 4: Technology Consulting */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow duration-300 border-t-4 border-wisdom-gray">
              <div className="w-14 h-14 mb-6 bg-wisdom-gray-100 rounded-xl flex items-center justify-center">
                <Users className="w-8 h-8 text-wisdom-gray-700" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                Technology Consulting
              </h3>
              <ul className="space-y-2 mb-6 text-wisdom-gray">
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  DevOps & Cloud Transformation
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  Custom Software Development
                </li>
                <li className="flex items-start">
                  <span className="text-success-green mr-2">✓</span>
                  AI/ML & Data Analytics
                </li>
              </ul>
              <Link href="/solutions/consulting" className="inline-flex items-center text-wisdom-gray-700 hover:text-trust-blue font-semibold group">
                Learn More
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-20 bg-wisdom-gray-700 text-white relative overflow-hidden">
        {/* Subtle particle background */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)]"></div>
        </div>
        
        <div className="section-container relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-4">
              Results That Speak Louder Than Words
            </h2>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-success-green mb-2">
                500+
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Careers Transformed
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-success-green mb-2">
                200+
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Clients Served
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-success-green mb-2">
                92%
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Placement Success
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-success-green mb-2">
                24
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Hour Response Time
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-success-green mb-2">
                $75M+
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Salaries Negotiated
              </div>
            </div>
            <div className="text-center">
              <div className="text-5xl md:text-6xl font-heading font-bold text-success-green mb-2">
                3
              </div>
              <div className="text-sm md:text-base text-gray-300">
                Countries Served
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Get Started CTA */}
      <section className="py-24 bg-gradient-to-r from-success-green to-trust-blue text-white">
        <div className="section-container">
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to Experience the InTime Difference?
            </h2>
            <p className="text-xl mb-12 text-gray-100">
              Whether you need talent, training, or career opportunities, we're here to help you succeed.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
              {/* For Companies */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                <h3 className="text-2xl font-heading font-semibold mb-4">For Companies</h3>
                <p className="mb-6 text-gray-100">Find exceptional talent to power your business growth</p>
                <Link href="/contact?type=company" className="inline-block bg-white text-trust-blue hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg">
                  I Need Talent
                </Link>
              </div>
              
              {/* For Professionals */}
              <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 hover:bg-white/20 transition-all duration-300">
                <h3 className="text-2xl font-heading font-semibold mb-4">For Professionals</h3>
                <p className="mb-6 text-gray-100">Transform your career with the right opportunity</p>
                <Link href="/careers" className="inline-block bg-white text-trust-blue hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-all duration-300 shadow-lg">
                  I Need Opportunity
                </Link>
              </div>
            </div>
            
            <div className="mt-12 text-gray-200">
              Or call us: <a href="tel:1-800-468-4631" className="font-mono font-bold text-white hover:text-success-green">1-800-INTIME1 (468-4631)</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

