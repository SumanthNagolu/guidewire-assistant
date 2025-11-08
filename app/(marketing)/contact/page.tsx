"use client";

import { useState } from "react";
import { Phone, Mail, MapPin, Clock, Send } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    location: "",
    interest: [] as string[],
    message: "",
    contactMethod: "email"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
    alert("Thank you! We'll respond within 2 hours during business hours.");
  };

  const toggleInterest = (interest: string) => {
    setFormData(prev => ({
      ...prev,
      interest: prev.interest.includes(interest)
        ? prev.interest.filter(i => i !== interest)
        : [...prev.interest, interest]
    }));
  };

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
              <a href="tel:1-800-468-4631" className="text-2xl font-mono font-bold text-trust-blue hover:text-trust-blue-600 block mb-2">
                1-800-INTIME1
              </a>
              <p className="text-sm text-wisdom-gray">(468-4631)</p>
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
              <a href="mailto:enterprise@intime-esolutions.com" className="text-trust-blue hover:text-trust-blue-600 font-semibold block mb-2">
                enterprise@intime-esolutions.com
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
              <a href="mailto:careers@intime-esolutions.com" className="text-success-green hover:text-success-green-600 font-semibold block mb-2">
                careers@intime-esolutions.com
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
              <a href="mailto:academy@intime-esolutions.com" className="text-innovation-orange hover:text-innovation-orange-600 font-semibold block mb-2">
                academy@intime-esolutions.com
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
              <div className="bg-wisdom-gray-50 rounded-2xl p-8">
                <h2 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-6">
                  Tell Us How We Can Help
                </h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name Fields */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.firstName}
                        onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-trust-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.lastName}
                        onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-trust-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Email & Phone */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-trust-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-trust-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Company & Location */}
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.company}
                        onChange={(e) => setFormData({...formData, company: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-trust-blue focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
                        Location
                      </label>
                      <input
                        type="text"
                        value={formData.location}
                        onChange={(e) => setFormData({...formData, location: e.target.value})}
                        className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-trust-blue focus:border-transparent"
                      />
                    </div>
                  </div>

                  {/* Interest Checkboxes */}
                  <div>
                    <label className="block text-sm font-medium text-wisdom-gray-700 mb-3">
                      I'm Interested In: *
                    </label>
                    <div className="grid md:grid-cols-2 gap-3">
                      {[
                        "Hiring IT Talent",
                        "Training Programs",
                        "Career Opportunities",
                        "Cross-Border Solutions",
                        "Partnership",
                        "Other"
                      ].map((interest) => (
                        <label key={interest} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={formData.interest.includes(interest)}
                            onChange={() => toggleInterest(interest)}
                            className="w-5 h-5 text-trust-blue rounded focus:ring-trust-blue"
                          />
                          <span className="text-wisdom-gray">{interest}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-medium text-wisdom-gray-700 mb-2">
                      Your Message *
                    </label>
                    <textarea
                      required
                      rows={5}
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-trust-blue focus:border-transparent"
                      placeholder="Tell us about your needs..."
                    ></textarea>
                  </div>

                  {/* Contact Method */}
                  <div>
                    <label className="block text-sm font-medium text-wisdom-gray-700 mb-3">
                      Preferred Contact Method:
                    </label>
                    <div className="flex gap-6">
                      {["Phone", "Email", "Video Call"].map((method) => (
                        <label key={method} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="radio"
                            name="contactMethod"
                            value={method.toLowerCase().replace(" ", "")}
                            checked={formData.contactMethod === method.toLowerCase().replace(" ", "")}
                            onChange={(e) => setFormData({...formData, contactMethod: e.target.value})}
                            className="w-4 h-4 text-trust-blue focus:ring-trust-blue"
                          />
                          <span className="text-wisdom-gray">{method}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    <Send className="w-5 h-5" />
                    Submit
                  </button>

                  <p className="text-sm text-center text-wisdom-gray">
                    We'll respond within <strong className="text-success-green">2 hours</strong> during business hours
                  </p>
                </form>
              </div>
            </div>

            {/* Office Locations */}
            <div className="space-y-6">
              <h2 className="text-3xl font-heading font-bold text-wisdom-gray-700 mb-6">
                Office Locations
              </h2>
              
              {/* Global Headquarters */}
              <div className="bg-gradient-to-br from-innovation-orange-50 to-trust-blue-50 rounded-2xl p-6 border-2 border-trust-blue">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-trust-blue flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-1">
                      Global Headquarters
                    </h3>
                    <p className="text-wisdom-gray text-sm">Hyderabad, India</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-wisdom-gray">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-trust-blue" />
                    <span>+91 [Phone]</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-trust-blue" />
                    <span>24/7 Operations</span>
                  </div>
                </div>
              </div>

              {/* USA Operations */}
              <div className="bg-gradient-to-br from-success-green-50 to-trust-blue-50 rounded-2xl p-6 border-2 border-success-green">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-success-green flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-1">
                      USA Operations
                    </h3>
                    <p className="text-wisdom-gray text-sm">New York, NY</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-wisdom-gray">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-success-green" />
                    <span>1-800-INTIME1</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-success-green" />
                    <span>Mon-Fri 9am-6pm EST</span>
                  </div>
                </div>
              </div>

              {/* Canada Operations */}
              <div className="bg-gradient-to-br from-trust-blue-50 to-innovation-orange-50 rounded-2xl p-6 border-2 border-innovation-orange">
                <div className="flex items-start gap-3 mb-4">
                  <MapPin className="w-6 h-6 text-innovation-orange flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-1">
                      Canada Operations
                    </h3>
                    <p className="text-wisdom-gray text-sm">Toronto, ON</p>
                  </div>
                </div>
                <div className="space-y-2 text-sm text-wisdom-gray">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-innovation-orange" />
                    <span>+1 [Phone]</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-innovation-orange" />
                    <span>Mon-Fri 9am-6pm EST</span>
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

