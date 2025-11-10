import { Phone, Mail, MapPin, Clock } from "lucide-react";
import ContactFormClient from '@/components/marketing/ContactFormClient';

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-trust-blue to-success-green text-white py-20">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6">
              Let's Start Your Transformation
            </h1>
            <p className="text-xl md:text-2xl text-gray-100">
              Whether you need talent, training, or career guidance, we're here to help. Reach out and experience the InTime difference.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Options Grid */}
      <section className="py-20 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {/* For Immediate Needs */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-innovation-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-innovation-orange" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-wisdom-gray-700 mb-2">
                For Immediate Needs
              </h3>
              <a href="tel:+13076502850" className="text-2xl font-mono font-bold text-trust-blue hover:text-trust-blue-600 block mb-2">
                +1 307-650-2850
              </a>
              <p className="text-sm text-wisdom-gray">🇺🇸 USA</p>
              <p className="text-sm text-success-green mt-2">Available 24/7 for urgent requirements</p>
            </div>

            {/* For Business Inquiries */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-trust-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-trust-blue" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-wisdom-gray-700 mb-2">
                For Business Inquiries
              </h3>
              <a href="mailto:enterprise@intimesolutions.com" className="text-trust-blue hover:text-trust-blue-600 font-semibold block mb-2">
                enterprise@intimesolutions.com
              </a>
              <p className="text-sm text-success-green mt-2">Response within 2 hours during business hours</p>
            </div>

            {/* For Career Support */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-success-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-success-green" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-wisdom-gray-700 mb-2">
                For Career Support
              </h3>
              <a href="mailto:careers@intimesolutions.com" className="text-success-green hover:text-success-green-600 font-semibold block mb-2">
                careers@intimesolutions.com
              </a>
              <p className="text-sm text-success-green mt-2">Free consultation available</p>
            </div>

            {/* For Training Programs */}
            <div className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-2xl transition-shadow">
              <div className="w-16 h-16 bg-innovation-orange-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-innovation-orange" />
              </div>
              <h3 className="text-xl font-heading font-semibold text-wisdom-gray-700 mb-2">
                For Training Programs
              </h3>
              <a href="mailto:academy@intimesolutions.com" className="text-innovation-orange hover:text-innovation-orange-600 font-semibold block mb-2">
                academy@intimesolutions.com
              </a>
              <p className="text-sm text-success-green mt-2">Speak with education counselor</p>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Form & Office Locations */}
      <section className="py-20 bg-white">
        <div className="section-container">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <ContactFormClient />
            </div>

            {/* Office Locations */}
            <div className="space-y-6">
              <h2 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-6">
                Office Locations
              </h2>
              
              {/* USA Office */}
              <div className="bg-gradient-to-br from-success-green-50 to-trust-blue-50 rounded-2xl p-6 border-2 border-success-green">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-success-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                      🇺🇸 USA Office
                    </h3>
                    <p className="text-wisdom-gray text-sm leading-relaxed">
                      30 N Gould St Ste R<br />
                      Sheridan, WY 82801
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-wisdom-gray">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-success-green" />
                    <a href="tel:+13076502850" className="hover:text-success-green-600">+1 307-650-2850</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-success-green" />
                    <a href="mailto:info@intimeesolutions.com" className="hover:text-success-green-600">info@intimeesolutions.com</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-success-green" />
                    <span>Mon-Fri 9am-6pm EST</span>
                  </div>
                </div>
              </div>

              {/* Canada Office */}
              <div className="bg-gradient-to-br from-trust-blue-50 to-innovation-orange-50 rounded-2xl p-6 border-2 border-innovation-orange">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-innovation-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                      🇨🇦 Canada Office
                    </h3>
                    <p className="text-wisdom-gray text-sm leading-relaxed">
                      330 Gillespie Drive<br />
                      Brantford, ON N3T 0X1
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-wisdom-gray">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-innovation-orange" />
                    <a href="tel:+12892369000" className="hover:text-innovation-orange-600">+1 289-236-9000</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-innovation-orange" />
                    <a href="mailto:canada@intimeesolutions.com" className="hover:text-innovation-orange-600">canada@intimeesolutions.com</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-innovation-orange" />
                    <span>Mon-Fri 9am-6pm EST</span>
                  </div>
                </div>
              </div>

              {/* India Office (Global HQ) */}
              <div className="bg-gradient-to-br from-innovation-orange-50 to-trust-blue-50 rounded-2xl p-6 border-2 border-trust-blue">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-trust-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                      🇮🇳 India Office (Global HQ)
                    </h3>
                    <p className="text-wisdom-gray text-sm leading-relaxed">
                      606 DSL Abacus IT Park<br />
                      Uppal, Hyderabad<br />
                      Telangana 500039
                    </p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-wisdom-gray">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-trust-blue" />
                    <a href="tel:+917981666144" className="hover:text-trust-blue-600">+91 798-166-6144</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-trust-blue" />
                    <a href="mailto:india@intimeesolutions.com" className="hover:text-trust-blue-600">india@intimeesolutions.com</a>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-trust-blue" />
                    <span>24/7 Operations</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
