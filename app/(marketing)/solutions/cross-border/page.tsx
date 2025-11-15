import Link from "next/link";
import { Globe, Plane, FileText, Home, TrendingUp, Users, CheckCircle2, ArrowRight, MapPin, Clock, Shield } from "lucide-react";
export const metadata = {
  title: "Global Mobility & Cross-Border Solutions - InTime eSolutions",
  description: "Complete cross-border talent solutions. H1B to Canada, India to North America, intra-company transfers, and global mobility consulting.",
};
export default function CrossBorderPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-innovation-orange via-trust-blue to-success-green text-white py-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-semibold mb-6">
              🌍 GLOBAL MOBILITY SOLUTIONS
            </div>
            <h1 className="text-5xl md:text-7xl font-heading font-bold mb-6 leading-tight">
              Break Borders, Not Dreams.
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 max-w-4xl">
              Your talent knows no boundaries—neither should your opportunities. Move skilled professionals across 50+ countries with complete visa, compliance, and relocation support. When borders can't slow your business down, you call InTime.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-8 max-w-3xl mx-auto">
              <p className="text-lg">
                <strong>Our Promise:</strong> Speed, Transparency, End-to-End Support.<br />
                We handle immigration, job placement, relocation—so you can focus on your career or business.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact?type=crossborder" className="btn-secondary inline-flex items-center gap-2">
                Start Your Journey
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link href="/resources" className="btn-outline inline-flex items-center gap-2">
                Download Immigration Guides
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Our Cross-Border Services */}
      <section className="py-20 bg-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Comprehensive Global Mobility Solutions
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We don't just fill positions. We build bridges between countries, careers, and opportunities.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* H1B to Canada */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-success-green">
              <div className="w-12 h-12 bg-success-green-100 rounded-xl flex items-center justify-center mb-6">
                <Plane className="w-6 h-6 text-success-green-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                H1B to Canada Fast Track
              </h3>
              <p className="text-gray-600 mb-6">
                Escape H1B lottery stress. Secure Canadian PR + job placement in 6-12 months.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-success-green-600 flex-shrink-0 mt-0.5" />
                  <span>Pre-arrival job placement</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-success-green-600 flex-shrink-0 mt-0.5" />
                  <span>Express Entry support</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-success-green-600 flex-shrink-0 mt-0.5" />
                  <span>Relocation assistance</span>
                </li>
              </ul>
              <Link href="/resources/h1b-to-canada-complete-guide" className="text-success-green-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Learn More <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Canada to USA */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-trust-blue-600">
              <div className="w-12 h-12 bg-trust-blue-100 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6 text-trust-blue-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Canada to USA Placement
              </h3>
              <p className="text-gray-600 mb-6">
                Leverage Canadian experience for higher-paying US roles. TN visa, H1B, or L1 support.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-trust-blue-600 flex-shrink-0 mt-0.5" />
                  <span>TN visa sponsorship</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-trust-blue-600 flex-shrink-0 mt-0.5" />
                  <span>30-50% salary increase</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-trust-blue-600 flex-shrink-0 mt-0.5" />
                  <span>H1B lottery support</span>
                </li>
              </ul>
              <Link href="/contact" className="text-trust-blue-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Explore Opportunities <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* India to USA */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-innovation-orange">
              <div className="w-12 h-12 bg-innovation-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-innovation-orange-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                India to USA (H1B Sponsorship)
              </h3>
              <p className="text-gray-600 mb-6">
                Direct H1B sponsorship for qualified IT professionals. We handle cap-subject, cap-exempt, and transfers.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-innovation-orange-600 flex-shrink-0 mt-0.5" />
                  <span>H1B cap filing (April 2025)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-innovation-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Cap-exempt options (universities)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-innovation-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Post-placement support</span>
                </li>
              </ul>
              <Link href="/contact" className="text-innovation-orange-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Apply Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* India to Canada */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-success-green">
              <div className="w-12 h-12 bg-success-green-100 rounded-xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-success-green-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                India to Canada (Express Entry)
              </h3>
              <p className="text-gray-600 mb-6">
                Skip the H1B lottery. Move directly to Canada with PR pathway and job placement.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-success-green-600 flex-shrink-0 mt-0.5" />
                  <span>Express Entry profile optimization</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-success-green-600 flex-shrink-0 mt-0.5" />
                  <span>Job offer to boost CRS score</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-success-green-600 flex-shrink-0 mt-0.5" />
                  <span>Faster than US green card</span>
                </li>
              </ul>
              <Link href="/contact" className="text-success-green-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Start Application <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* UK/Europe to North America */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-trust-blue-600">
              <div className="w-12 h-12 bg-trust-blue-100 rounded-xl flex items-center justify-center mb-6">
                <Plane className="w-6 h-6 text-trust-blue-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                UK/Europe to North America
              </h3>
              <p className="text-gray-600 mb-6">
                Transition from UK/EU markets to USA or Canada. Visa sponsorship + job matching.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-trust-blue-600 flex-shrink-0 mt-0.5" />
                  <span>H1B/TN visa support (USA)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-trust-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Express Entry (Canada)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-trust-blue-600 flex-shrink-0 mt-0.5" />
                  <span>Pre-vetted job opportunities</span>
                </li>
              </ul>
              <Link href="/contact" className="text-trust-blue-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Get Started <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
            {/* Intra-Company Transfers */}
            <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-shadow border-t-4 border-innovation-orange">
              <div className="w-12 h-12 bg-innovation-orange-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-innovation-orange-600" />
              </div>
              <h3 className="text-2xl font-heading font-bold text-gray-900 mb-4">
                Intra-Company Transfers (L1/ICT)
              </h3>
              <p className="text-gray-600 mb-6">
                Move key employees across borders. L1 (USA) or ICT (Canada) visa consulting.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-innovation-orange-600 flex-shrink-0 mt-0.5" />
                  <span>L1A (managers) & L1B (specialists)</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-innovation-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Canadian ICT work permits</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle2 className="w-5 h-5 text-innovation-orange-600 flex-shrink-0 mt-0.5" />
                  <span>Compliance & documentation</span>
                </li>
              </ul>
              <Link href="/contact" className="text-innovation-orange-600 font-semibold flex items-center gap-2 hover:gap-3 transition-all">
                Consult Now <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Why InTime for Cross-Border */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-heading font-bold text-gray-900 mb-4">
              Why Choose InTime for Global Mobility?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              We're not just recruiters. We're immigration-savvy talent strategists with offices in USA, Canada, and India.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-success-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="w-8 h-8 text-success-green-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Speed</h3>
              <p className="text-gray-600">
                Average 60-90 days from application to job offer. Competitors take 6+ months.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-trust-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-trust-blue-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">Compliance</h3>
              <p className="text-gray-600">
                100% immigration compliance. We work with licensed attorneys in USA, Canada, and India.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-innovation-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-innovation-orange-600" />
              </div>
              <h3 className="text-xl font-heading font-bold text-gray-900 mb-2">End-to-End Support</h3>
              <p className="text-gray-600">
                From visa filing to first paycheck—housing, schools, banking, we handle it all.
              </p>
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue-600 to-innovation-orange-500 text-white">
        <div className="section-container text-center">
          <h2 className="text-4xl font-heading font-bold mb-6">
            Ready to Make Your Global Move?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Schedule a free 30-minute consultation with our immigration-certified recruitment specialists.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact?type=crossborder" className="btn-secondary inline-flex items-center gap-2">
              Book Free Consultation
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline inline-flex items-center gap-2">
              View Open Positions
            </Link>
          </div>
          <div className="mt-12 grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <div>
              <div className="text-3xl font-bold mb-2">🇺🇸 USA</div>
              <a href="tel:+13076502850" className="text-white/90 hover:text-white">+1 307-650-2850</a>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">🇨🇦 Canada</div>
              <a href="tel:+12892369000" className="text-white/90 hover:text-white">+1 289-236-9000</a>
            </div>
            <div>
              <div className="text-3xl font-bold mb-2">🇮🇳 India</div>
              <a href="tel:+917981666144" className="text-white/90 hover:text-white">+91 798-166-6144</a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
