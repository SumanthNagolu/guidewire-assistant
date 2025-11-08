import Link from "next/link";
import { Check, Clock, Shield, TrendingUp, Users, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "IT Staffing Services - InTime eSolutions",
  description: "From immediate contract needs to strategic permanent hires, we connect you with pre-vetted, transformation-ready IT professionals.",
};

export default function ITStaffingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-trust-blue to-trust-blue-600 text-white py-20">
        <div className="section-container">
          <div className="max-w-4xl">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              IT Staffing Solutions That Deliver Excellence, InTime
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              From immediate contract needs to strategic permanent hires, we connect you with pre-vetted, transformation-ready IT professionals.
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success-green" />
                <span>24-hour placement guarantee</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success-green" />
                <span>95% first-submission success</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success-green" />
                <span>90-day replacement warranty</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-5 h-5 text-success-green" />
                <span>All technologies, all industries</span>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/contact?type=staffing" className="btn-accent">
                Get Started Today
              </Link>
              <button className="btn-outline">
                Download Service Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Our Staffing Process */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              Our Staffing Process
            </h2>
            <p className="text-xl text-wisdom-gray max-w-3xl mx-auto">
              A proven 4-step methodology that delivers quality talent, fast
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Step 1 */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-12 h-12 bg-trust-blue text-white rounded-full flex items-center justify-center font-heading font-bold text-xl">
                1
              </div>
              <div className="pt-16">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                  Understand
                </h3>
                <ul className="space-y-2 text-wisdom-gray">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Deep-dive discovery call</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Technical requirements mapping</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Cultural fit assessment</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Budget and timeline alignment</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-12 h-12 bg-success-green text-white rounded-full flex items-center justify-center font-heading font-bold text-xl">
                2
              </div>
              <div className="pt-16">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                  Source
                </h3>
                <ul className="space-y-2 text-wisdom-gray">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>AI-powered candidate matching</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Manual vetting by experts</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Skill verification testing</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Reference validation</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-12 h-12 bg-innovation-orange text-white rounded-full flex items-center justify-center font-heading font-bold text-xl">
                3
              </div>
              <div className="pt-16">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                  Submit
                </h3>
                <ul className="space-y-2 text-wisdom-gray">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Customized candidate presentation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Detailed skill matrix</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Availability confirmation</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Rate negotiation support</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative">
              <div className="absolute top-0 left-0 w-12 h-12 bg-wisdom-gray-700 text-white rounded-full flex items-center justify-center font-heading font-bold text-xl">
                4
              </div>
              <div className="pt-16">
                <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-4">
                  Support
                </h3>
                <ul className="space-y-2 text-wisdom-gray">
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Interview coordination</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Offer management</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Onboarding assistance</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle2 className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                    <span>Ongoing relationship management</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-20 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              Service Categories
            </h2>
          </div>
          
          <div className="space-y-8">
            {/* Contract Staffing */}
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-16 h-16 bg-trust-blue-50 rounded-xl flex items-center justify-center mb-4">
                    <Clock className="w-8 h-8 text-trust-blue" />
                  </div>
                  <h3 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-4">
                    Contract Staffing
                  </h3>
                  <p className="text-wisdom-gray mb-6">
                    Perfect for project-based needs and temporary requirements.
                  </p>
                  <Link href="/contact?service=contract" className="btn-primary inline-block">
                    Request Contractors →
                  </Link>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-wisdom-gray-700 mb-3">What We Offer:</h4>
                    <ul className="grid md:grid-cols-2 gap-3">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Immediate access to pre-vetted contractors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Flexible engagement terms (3-24 months)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Complete payroll management</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Performance monitoring support</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-wisdom-gray-700 mb-3">Technologies We Staff:</h4>
                    <div className="flex flex-wrap gap-2">
                      {["Java", "Python", ".NET", "React", "Angular", "Node.js", "AWS", "Azure", "DevOps", "SQL", "NoSQL", "SAP", "Salesforce", "AI/ML", "Blockchain"].map((tech) => (
                        <span key={tech} className="px-3 py-1 bg-trust-blue-50 text-trust-blue rounded-full text-sm font-medium">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-success-green-50 rounded-xl p-6 border-l-4 border-success-green">
                    <p className="text-wisdom-gray italic">
                      "InTime provided 15 Java developers for our digital transformation project within 48 hours. Every single one exceeded expectations."
                    </p>
                    <p className="text-sm font-semibold text-wisdom-gray-700 mt-2">
                      — Fortune 500 Insurance Company
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contract-to-Hire */}
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-16 h-16 bg-success-green-50 rounded-xl flex items-center justify-center mb-4">
                    <TrendingUp className="w-8 h-8 text-success-green" />
                  </div>
                  <h3 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-4">
                    Contract-to-Hire
                  </h3>
                  <p className="text-wisdom-gray mb-6">
                    Try before you buy with zero risk.
                  </p>
                  <Link href="/contact?service=contract-to-hire" className="btn-secondary inline-block">
                    Learn More →
                  </Link>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-wisdom-gray-700 mb-3">Benefits:</h4>
                    <ul className="grid md:grid-cols-2 gap-3">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Evaluate performance before commitment</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Reduced hiring risk</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Seamless conversion process</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Competitive conversion fees</span>
                      </li>
                    </ul>
                  </div>
                  
                  <div className="bg-trust-blue-50 rounded-xl p-6">
                    <div className="text-5xl font-heading font-bold text-trust-blue mb-2">70%</div>
                    <p className="text-wisdom-gray">of our contract-to-hire placements convert to permanent roles</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Direct Placement */}
            <div className="bg-white rounded-2xl p-8 md:p-12 shadow-lg">
              <div className="grid md:grid-cols-3 gap-8">
                <div>
                  <div className="w-16 h-16 bg-innovation-orange-50 rounded-xl flex items-center justify-center mb-4">
                    <Shield className="w-8 h-8 text-innovation-orange" />
                  </div>
                  <h3 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-4">
                    Direct Placement
                  </h3>
                  <p className="text-wisdom-gray mb-6">
                    Find your next permanent team member with confidence.
                  </p>
                  <Link href="/contact?service=direct-placement" className="btn-accent inline-block">
                    Start Your Search →
                  </Link>
                </div>
                
                <div className="md:col-span-2 space-y-6">
                  <div>
                    <h4 className="font-semibold text-wisdom-gray-700 mb-3">Our Guarantee:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-heading font-bold text-innovation-orange mb-1">90</div>
                        <div className="text-sm text-wisdom-gray">Day Warranty</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-heading font-bold text-innovation-orange mb-1">15</div>
                        <div className="text-sm text-wisdom-gray">Days Avg Fill Time</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-heading font-bold text-innovation-orange mb-1">3:1</div>
                        <div className="text-sm text-wisdom-gray">Candidate Ratio</div>
                      </div>
                      <div className="text-center">
                        <div className="text-3xl font-heading font-bold text-innovation-orange mb-1">95%</div>
                        <div className="text-sm text-wisdom-gray">1-Year Retention</div>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-wisdom-gray-700 mb-3">Executive Search Capabilities:</h4>
                    <ul className="grid md:grid-cols-2 gap-3">
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>C-level technology leaders</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Vice Presidents & Directors</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Principal Engineers & Architects</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Check className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                        <span>Specialized technical roles</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to Transform Your Team?
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Let's discuss your staffing needs and find the perfect talent for your organization.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact?type=staffing" className="btn-accent bg-white text-trust-blue hover:bg-gray-100">
                Request Talent
              </Link>
              <button className="btn-outline">
                Schedule Consultation
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

