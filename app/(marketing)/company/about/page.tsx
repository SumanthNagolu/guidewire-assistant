import Link from "next/link";
import { Target, Eye, Heart, Zap, Users, Globe, TrendingUp, Award } from "lucide-react";

export const metadata = {
  title: "About Us - InTime eSolutions",
  description: "Built on Excellence. Driven by Transformation. We're not just another staffing company - we're a movement dedicated to proving that excellence scales.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-trust-blue to-success-green text-white py-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Built on Excellence.<br />Driven by Transformation.
            </h1>
            <p className="text-xl md:text-2xl text-gray-100 mb-8">
              We're not just another staffing company. We're a movement dedicated to proving that excellence scales and careers can be transformative.
            </p>
            <button className="btn-outline">
              Watch Our Story (2 min)
            </button>
          </div>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-6">
                "Every Revolution Starts With a Simple Truth"
              </h2>
            </div>
            
            <div className="prose prose-lg max-w-none text-wisdom-gray space-y-6">
              <p className="text-xl leading-relaxed">
                In 2024, our founder recognized a painful truth in the IT staffing industry: professionals were being treated as commodities, companies were struggling with quality, and the entire ecosystem had forgotten that behind every resume is a human being with dreams, a family to support, and potential waiting to be unleashed.
              </p>
              
              <p className="text-xl leading-relaxed">
                <strong className="text-trust-blue">InTime eSolutions was born not as another staffing company, but as a movement</strong> to restore dignity to work, excellence to delivery, and transformation to careers. We started with a simple but powerful philosophy:
              </p>
              
              <div className="bg-trust-blue-50 border-l-4 border-trust-blue p-8 my-8 rounded-r-xl">
                <p className="text-2xl font-heading font-semibold text-trust-blue mb-0">
                  "It's not what you do, it's HOW you do it."
                </p>
              </div>
              
              <p className="text-xl leading-relaxed">
                This isn't just a tagline—it's our DNA. It means that whether we're training a fresh graduate or placing a senior architect, whether we're serving a startup or a Fortune 500, we bring the same level of excellence, preparation, and care.
              </p>
              
              <p className="text-xl leading-relaxed">
                Because we believe that when you transform one career, you transform a family. When you transform enough families, you transform communities. And when you transform communities, you change the world.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12">
            {/* Mission */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-t-4 border-trust-blue">
              <div className="w-16 h-16 bg-trust-blue-50 rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-8 h-8 text-trust-blue" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                We started with a bold promise: <strong className="text-trust-blue">to transform 10,000 careers by 2027</strong>. Not just fill positions, but fundamentally change the trajectory of professionals' lives while delivering unprecedented value to our clients.
              </p>
            </div>
            
            {/* Vision */}
            <div className="bg-white rounded-2xl p-10 shadow-lg border-t-4 border-success-green">
              <div className="w-16 h-16 bg-success-green-50 rounded-2xl flex items-center justify-center mb-6">
                <Eye className="w-8 h-8 text-success-green" />
              </div>
              <h2 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-6">
                Our Vision
              </h2>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                To redefine professional excellence globally by creating an ecosystem where work becomes craft, careers become journeys of mastery, and every professional operates at their highest potential—<strong className="text-success-green">technically, professionally, and personally</strong>.
              </p>
            </div>
          </div>
          
          <div className="text-center mt-12">
            <p className="text-xl text-wisdom-gray max-w-3xl mx-auto">
              Today, we're not just meeting our goals—<strong className="text-trust-blue">we're exceeding them</strong>. With over 500+ placements, 200+ companies served, and training programs that consistently deliver 90% placements, we're proving that when you put transformation first, success follows.
            </p>
          </div>
        </div>
      </section>

      {/* Our Values */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              Our Values in Action
            </h2>
            <p className="text-xl text-wisdom-gray">
              The principles that guide every decision we make
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Value 1 */}
            <div className="bg-wisdom-gray-50 rounded-2xl p-8 hover:bg-trust-blue-50 transition-colors">
              <div className="w-12 h-12 bg-trust-blue text-white rounded-xl flex items-center justify-center mb-4">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-3">
                Excellence is the Baseline
              </h3>
              <p className="text-wisdom-gray mb-4">
                Good enough never is. We over-prepare, over-deliver, and over-care.
              </p>
              <p className="text-sm text-trust-blue italic">
                "When someone says 'InTime trained' or 'InTime placed,' it should mean they're in the top 10%."
              </p>
            </div>
            
            {/* Value 2 */}
            <div className="bg-wisdom-gray-50 rounded-2xl p-8 hover:bg-trust-blue-50 transition-colors">
              <div className="w-12 h-12 bg-success-green text-white rounded-xl flex items-center justify-center mb-4">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-3">
                Speed Through Systems
              </h3>
              <p className="text-wisdom-gray mb-4">
                We move fast not because we're reckless, but because we're prepared.
              </p>
              <p className="text-sm text-success-green italic">
                "Our systems enable us to deliver in 24 hours what others take weeks to accomplish."
              </p>
            </div>
            
            {/* Value 3 */}
            <div className="bg-wisdom-gray-50 rounded-2xl p-8 hover:bg-trust-blue-50 transition-colors">
              <div className="w-12 h-12 bg-innovation-orange text-white rounded-xl flex items-center justify-center mb-4">
                <Heart className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-3">
                Relationships Over Transactions
              </h3>
              <p className="text-wisdom-gray mb-4">
                Every placement is a relationship. Every student is family.
              </p>
              <p className="text-sm text-innovation-orange italic">
                "We measure success not in invoices but in impact."
              </p>
            </div>
            
            {/* Value 4 */}
            <div className="bg-wisdom-gray-50 rounded-2xl p-8 hover:bg-trust-blue-50 transition-colors">
              <div className="w-12 h-12 bg-trust-blue text-white rounded-xl flex items-center justify-center mb-4">
                <Globe className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-3">
                Global Thinking, Local Excellence
              </h3>
              <p className="text-wisdom-gray mb-4">
                Think without borders, execute with precision.
              </p>
              <p className="text-sm text-trust-blue italic">
                "We operate across three countries but deliver with local market expertise."
              </p>
            </div>
            
            {/* Value 5 */}
            <div className="bg-wisdom-gray-50 rounded-2xl p-8 hover:bg-trust-blue-50 transition-colors">
              <div className="w-12 h-12 bg-success-green text-white rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-3">
                Continuous Evolution
              </h3>
              <p className="text-wisdom-gray mb-4">
                The day you stop learning is the day you become irrelevant.
              </p>
              <p className="text-sm text-success-green italic">
                "We invest back into training, innovation, and capability building."
              </p>
            </div>
            
            {/* Value 6 */}
            <div className="bg-wisdom-gray-50 rounded-2xl p-8 hover:bg-trust-blue-50 transition-colors">
              <div className="w-12 h-12 bg-innovation-orange text-white rounded-xl flex items-center justify-center mb-4">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-heading font-semibold text-wisdom-gray-700 mb-3">
                People First, Always
              </h3>
              <p className="text-wisdom-gray mb-4">
                Behind every decision is a human impact consideration.
              </p>
              <p className="text-sm text-innovation-orange italic">
                "When profits and purpose align, everyone wins."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Leadership */}
      <section className="py-20 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              Leadership Team
            </h2>
            <p className="text-xl text-wisdom-gray">
              The people behind the transformation
            </p>
          </div>
          
          <div className="max-w-4xl mx-auto">
            {/* Sumanth's Card */}
            <div className="bg-white rounded-2xl p-10 shadow-lg">
              <div className="flex flex-col md:flex-row gap-8 items-start">
                <div className="w-48 h-48 bg-gradient-to-br from-trust-blue to-success-green rounded-2xl flex items-center justify-center flex-shrink-0">
                  <div className="text-6xl font-heading font-bold text-white">SR</div>
                </div>
                
                <div className="flex-1">
                  <h3 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-2">
                    Sumanth Reddy Nagolu
                  </h3>
                  <div className="text-trust-blue font-semibold mb-4">Founder & CEO</div>
                  
                  <p className="text-lg text-wisdom-gray leading-relaxed mb-6">
                    "Building a company where profits and purpose align - I founded InTime because I've lived both sides of the staffing equation—the struggle of being seen as 'just another resource' and the power of being recognized as exceptional."
                  </p>
                  
                  <p className="text-wisdom-gray mb-6">
                    This isn't about building a business; it's about proving that <strong className="text-trust-blue">excellence scales, values drive profits, and transformation is possible for everyone</strong>.
                  </p>
                  
                  <div className="flex gap-4">
                    <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-trust-blue hover:text-trust-blue-600 font-medium">
                      LinkedIn →
                    </a>
                    <a href="mailto:sumanth@intimesolutions.com" className="text-success-green hover:text-success-green-600 font-medium">
                      Email →
                    </a>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="mt-8 text-center text-wisdom-gray">
              <p className="italic">Additional team members will be featured as InTime continues to grow.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Global Footprint */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-heading font-bold text-wisdom-gray-700 mb-4">
              Our Global Footprint
            </h2>
            <p className="text-xl text-wisdom-gray">
              Operating across continents, delivering locally
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* India HQ */}
            <div className="bg-gradient-to-br from-innovation-orange-50 to-trust-blue-50 rounded-2xl p-8 border-2 border-trust-blue">
              <div className="text-4xl mb-4">🇮🇳</div>
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-4">
                India (Headquarters)
              </h3>
              <ul className="space-y-2 text-wisdom-gray">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-trust-blue rounded-full"></div>
                  <span>Operations center</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-trust-blue rounded-full"></div>
                  <span>25+ team members</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-trust-blue rounded-full"></div>
                  <span>24/7 delivery capability</span>
                </li>
              </ul>
            </div>
            
            {/* USA */}
            <div className="bg-gradient-to-br from-success-green-50 to-trust-blue-50 rounded-2xl p-8 border-2 border-success-green">
              <div className="text-4xl mb-4">🇺🇸</div>
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-4">
                USA
              </h3>
              <ul className="space-y-2 text-wisdom-gray">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-green rounded-full"></div>
                  <span>10 states active</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-green rounded-full"></div>
                  <span>200+ clients</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-success-green rounded-full"></div>
                  <span>300+ consultants placed</span>
                </li>
              </ul>
            </div>
            
            {/* Canada */}
            <div className="bg-gradient-to-br from-trust-blue-50 to-innovation-orange-50 rounded-2xl p-8 border-2 border-innovation-orange">
              <div className="text-4xl mb-4">🇨🇦</div>
              <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-4">
                Canada
              </h3>
              <ul className="space-y-2 text-wisdom-gray">
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-innovation-orange rounded-full"></div>
                  <span>5 provinces active</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-innovation-orange rounded-full"></div>
                  <span>100+ clients</span>
                </li>
                <li className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-innovation-orange rounded-full"></div>
                  <span>200+ consultants placed</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 text-center">
            <div className="inline-block bg-wisdom-gray-50 rounded-xl px-8 py-4">
              <p className="text-wisdom-gray">
                <span className="font-semibold text-trust-blue">Coming Soon:</span> UK, Australia, Mexico, and UAE
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-success-green text-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-heading font-bold mb-6">
              Join Our Mission to Transform 10,000 Careers
            </h2>
            <p className="text-xl mb-8 text-gray-100">
              Whether you're seeking talent, training, or career opportunities, let's transform together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/contact" className="btn-accent bg-white text-trust-blue hover:bg-gray-100">
                Get Started
              </Link>
              <Link href="/careers" className="btn-outline">
                Join Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

