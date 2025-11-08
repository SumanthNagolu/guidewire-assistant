import Link from "next/link";
import { Globe, Plane, FileText, Home, TrendingUp, Users, CheckCircle2, ArrowRight } from "lucide-react";

export const metadata = {
  title: "Cross-Border Solutions - InTime eSolutions",
  description: "Your Bridge Between USA and Canada Talent Markets - Specialized expertise in H1B to Canada transitions and cross-border placements.",
};

export default function CrossBorderPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-innovation-orange to-trust-blue text-white py-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Your Bridge Between USA and Canada Talent Markets
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Specialized expertise in H1B to Canada transitions and cross-border placements. Navigate immigration, maximize opportunity.
            </p>
            
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
              <p className="text-lg italic">
                "The only staffing firm with dedicated cross-border specialists and partnerships on both sides of the border."
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact?type=crossborder" className="btn-accent bg-white text-innovation-orange hover:bg-gray-100">
                Get Cross-Border Support
              </Link>
              <button className="btn-outline">
                Download Immigration Guide
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* H1B to Canada Fast Track */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-block bg-success-green text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                MOST POPULAR SERVICE
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-6">
                H1B to Canada Fast Track
              </h2>
              <p className="text-xl text-wisdom-gray mb-8">
                For H1B visa holders seeking Canadian permanent residence and career opportunities
              </p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Plane className="w-6 h-6 text-success-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wisdom-gray-700 mb-2">Pre-arrival job placement</h3>
                    <p className="text-wisdom-gray">Secure your position before you arrive in Canada</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <FileText className="w-6 h-6 text-success-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wisdom-gray-700 mb-2">Work permit sponsorship</h3>
                    <p className="text-wisdom-gray">Complete LMIA and work permit support</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Home className="w-6 h-6 text-success-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wisdom-gray-700 mb-2">Relocation assistance</h3>
                    <p className="text-wisdom-gray">Housing, schooling, and settlement support</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-success-green-50 rounded-xl flex items-center justify-center flex-shrink-0">
                    <TrendingUp className="w-6 h-6 text-success-green" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-wisdom-gray-700 mb-2">PR pathway guidance</h3>
                    <p className="text-wisdom-gray">Express Entry and Provincial Nominee support</p>
                  </div>
                </div>
              </div>
              
              <Link href="/contact?service=h1b-canada" className="btn-secondary">
                Start Your Journey to Canada →
              </Link>
            </div>
            
            <div className="bg-gradient-to-br from-success-green-50 to-trust-blue-50 rounded-3xl p-8">
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-6">
                Process Timeline
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-success-green text-white rounded-full flex items-center justify-center font-semibold">1</div>
                    <div className="w-0.5 h-full bg-success-green-200 mt-2"></div>
                  </div>
                  <div className="pb-6">
                    <div className="font-semibold text-wisdom-gray-700">Month 1</div>
                    <div className="text-wisdom-gray">Job matching and offer letter</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-success-green text-white rounded-full flex items-center justify-center font-semibold">2</div>
                    <div className="w-0.5 h-full bg-success-green-200 mt-2"></div>
                  </div>
                  <div className="pb-6">
                    <div className="font-semibold text-wisdom-gray-700">Month 2</div>
                    <div className="text-wisdom-gray">Work permit application processing</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-success-green text-white rounded-full flex items-center justify-center font-semibold">3-4</div>
                    <div className="w-0.5 h-full bg-success-green-200 mt-2"></div>
                  </div>
                  <div className="pb-6">
                    <div className="font-semibold text-wisdom-gray-700">Month 3-4</div>
                    <div className="text-wisdom-gray">Approval and relocation to Canada</div>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 bg-success-green text-white rounded-full flex items-center justify-center font-semibold">5+</div>
                  </div>
                  <div>
                    <div className="font-semibold text-wisdom-gray-700">Month 5+</div>
                    <div className="text-wisdom-gray">Begin PR process (Express Entry)</div>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 bg-white rounded-xl p-6 border-2 border-success-green">
                <div className="text-center">
                  <div className="text-4xl font-heading font-bold text-success-green mb-2">90%</div>
                  <div className="text-wisdom-gray">Placement within 60 days</div>
                </div>
              </div>
              
              <div className="mt-6 bg-innovation-orange-50 rounded-xl p-4 border-l-4 border-innovation-orange">
                <p className="text-sm font-semibold text-wisdom-gray-700 mb-1">Special Program</p>
                <p className="text-sm text-wisdom-gray">
                  Canada has allocated special work permits for H1B holders. We help you leverage this opportunity.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Canada to USA Placement */}
      <section className="py-20 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="bg-gradient-to-br from-trust-blue-50 to-innovation-orange-50 rounded-3xl p-8">
                <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-6">
                  Top Demand Skills
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-8">
                  {[
                    "Software Development",
                    "Data Science",
                    "Healthcare IT",
                    "Cloud Architecture",
                    "Cybersecurity",
                    "AI/ML Engineering"
                  ].map((skill) => (
                    <div key={skill} className="bg-white rounded-xl p-4 border-l-4 border-trust-blue">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-5 h-5 text-success-green flex-shrink-0" />
                        <span className="text-sm font-medium text-wisdom-gray-700">{skill}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="bg-white rounded-xl p-6 border-2 border-trust-blue text-center">
                  <div className="text-4xl font-heading font-bold text-trust-blue mb-2">35-50%</div>
                  <div className="text-wisdom-gray">Average salary increase</div>
                </div>
              </div>
            </div>
            
            <div className="order-1 lg:order-2">
              <div className="inline-block bg-trust-blue text-white px-4 py-2 rounded-full text-sm font-semibold mb-6">
                HIGH SALARY POTENTIAL
              </div>
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-6">
                Canada to USA Placement
              </h2>
              <p className="text-xl text-wisdom-gray mb-8">
                For Canadian professionals seeking US opportunities with higher compensation
              </p>
              
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-trust-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-wisdom-gray-700">TN visa sponsorship</span>
                    <p className="text-wisdom-gray text-sm">Fast-track work authorization under NAFTA/USMCA</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-trust-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-wisdom-gray-700">H1B lottery preparation</span>
                    <p className="text-wisdom-gray text-sm">Strategic timing and documentation support</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-trust-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-wisdom-gray-700">L1 transfer facilitation</span>
                    <p className="text-wisdom-gray text-sm">For professionals with qualifying experience</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-trust-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-wisdom-gray-700">Job matching with visa sponsors</span>
                    <p className="text-wisdom-gray text-sm">Access to our network of US employers</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-trust-blue mt-0.5 flex-shrink-0" />
                  <div>
                    <span className="font-semibold text-wisdom-gray-700">Immigration attorney network</span>
                    <p className="text-wisdom-gray text-sm">Pre-vetted legal experts in US immigration</p>
                  </div>
                </div>
              </div>
              
              <Link href="/contact?service=canada-usa" className="btn-primary">
                Explore USA Opportunities →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Global Mobility Consulting */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              Global Mobility Consulting
            </h2>
            <p className="text-xl text-wisdom-gray">
              Complete cross-border workforce solutions for companies and professionals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* For Companies */}
            <div className="bg-trust-blue-50 rounded-2xl p-8 border-2 border-trust-blue">
              <div className="w-16 h-16 bg-trust-blue text-white rounded-2xl flex items-center justify-center mb-6">
                <Users className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-6">
                For Companies
              </h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-trust-blue mt-0.5 flex-shrink-0" />
                  <span>Build distributed teams across borders</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-trust-blue mt-0.5 flex-shrink-0" />
                  <span>Access global talent pools efficiently</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-trust-blue mt-0.5 flex-shrink-0" />
                  <span>Manage compliance and immigration</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-trust-blue mt-0.5 flex-shrink-0" />
                  <span>Optimize costs with strategic placements</span>
                </li>
              </ul>
              <Link href="/contact?type=company-mobility" className="btn-primary">
                Book Consultation →
              </Link>
            </div>
            
            {/* For Professionals */}
            <div className="bg-success-green-50 rounded-2xl p-8 border-2 border-success-green">
              <div className="w-16 h-16 bg-success-green text-white rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-8 h-8" />
              </div>
              <h3 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-6">
                For Professionals
              </h3>
              <ul className="space-y-4 mb-8">
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                  <span>Career strategy and pathway planning</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                  <span>Market comparison and analysis</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                  <span>Compensation benchmarking</span>
                </li>
                <li className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-success-green mt-0.5 flex-shrink-0" />
                  <span>Cultural preparation and integration</span>
                </li>
              </ul>
              <Link href="/contact?type=professional-mobility" className="btn-secondary">
                Book Consultation →
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-innovation-orange to-trust-blue text-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Ready to Cross Borders and Expand Opportunities?
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Let our cross-border specialists guide you through the entire process, from job placement to settlement.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact?type=crossborder" className="btn-accent bg-white text-innovation-orange hover:bg-gray-100">
                Get Started Today
              </Link>
              <button className="btn-outline">
                Schedule Free Assessment
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

