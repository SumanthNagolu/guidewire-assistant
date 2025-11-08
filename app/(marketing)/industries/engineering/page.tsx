import { ArrowRight, CheckCircle2, Wrench } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Engineering Staffing Solutions | InTime eSolutions',
  description: 'Engineering talent that combines deep domain mastery with Day‑1 impact. Specialized staffing across Mechanical, Electrical, Civil, Automation, and more.',
  keywords: 'engineering staffing, mechanical engineer recruitment, electrical engineer jobs, civil engineering staffing, automation engineer placement',
};

export default function EngineeringPage() {
  const specialties = [
    'Aeronautical',
    'Automation',
    'Chemical',
    'Civil / Structural',
    'Designers / Drafters',
    'Electrical / Electronics',
    'Health, Safety and Environmental',
    'Instrumentation / Controls',
    'Mechanical',
    'Petroleum',
    'Plant / Facilities / MRO',
    'Project Management',
    'Quality / Lean / Six Sigma',
    'Sustainability',
    'Technical Publications / Writing',
    'Testing and Validation',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Wrench className="h-4 w-4" />
              <span className="text-sm font-medium">Engineering Staffing Solutions</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Engineering Talent That Delivers Day-1 Impact
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              InTime eSolutions | Staffing delivers engineering talent that combines deep domain mastery with Day‑1 impact. Our benchmark is excellence: candidates are rigorously vetted for technical depth, safety mindset, and problem‑solving under pressure.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find Engineering Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Learn About Our Process
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Value Proposition */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-h2 font-heading mb-6 text-trust-blue">
                Excellence as the Baseline
              </h2>
              <p className="text-lg text-wisdom-gray-600 mb-6 leading-relaxed">
                We move fast because our systems are precise—intake to interview in hours, not weeks—while safeguarding quality through structured assessments. Beyond skills, we prioritize cultural alignment, communication clarity, and the flexibility to adapt to new tools, methods, and regulatory environments.
              </p>
              <p className="text-lg text-wisdom-gray-600 leading-relaxed">
                Whether you're scaling R&D, optimizing plants, or driving sustainability initiatives, we source professionals who raise the bar and sustain results.
              </p>
            </div>
            <div className="bg-gradient-to-br from-trust-blue-50 to-sky-blue-500/10 p-8 rounded-2xl">
              <h3 className="text-h4 font-heading mb-6 text-trust-blue">Our Process</h3>
              <div className="space-y-4">
                {[
                  'Rigorous technical depth verification',
                  'Safety mindset assessment',
                  'Problem-solving under pressure evaluation',
                  'Cultural alignment screening',
                  'Communication clarity testing',
                  'Regulatory compliance verification',
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle2 className="h-6 w-6 text-success-green flex-shrink-0 mt-0.5" />
                    <span className="text-wisdom-gray-700">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialties */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading mb-4 text-trust-blue">
              Engineering Specialties We Staff
            </h2>
            <p className="text-lg text-wisdom-gray-600 max-w-3xl mx-auto">
              From aeronautical to sustainability, we deliver specialized talent across all engineering disciplines.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {specialties.map((specialty, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-trust-blue transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-success-green rounded-full"></div>
                  <h3 className="font-semibold text-trust-blue-700">{specialty}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Build Your Engineering Team?
          </h2>
          <p className="text-xl mb-8 text-sky-blue-500 max-w-2xl mx-auto">
            Let's discuss your engineering staffing needs and timeline. We'll mobilize the right specialists while maintaining strict quality standards.
          </p>
          <Link href="/contact" className="btn-secondary inline-flex items-center">
            Get Started Today
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

