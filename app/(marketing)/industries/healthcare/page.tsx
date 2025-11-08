import { ArrowRight, CheckCircle2, Heart } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Healthcare & Life Sciences Staffing | InTime eSolutions',
  description: 'Healthcare staffing focused on data integrity, patient outcomes, and regulatory compliance. Laboratories, clinical research, and medical devices.',
  keywords: 'healthcare staffing, medical laboratory jobs, clinical research recruitment, pharmaceutical staffing, life sciences jobs',
};

export default function HealthcarePage() {
  const roles = [
    'Biologist',
    'Chemical Engineer',
    'Environmental Scientist',
    'Histology',
    'Laboratory',
    'Laboratory Technician',
    'Medical Laboratory Technologist',
    'Medical Records',
    'Microbiologist',
    'Pharmaceuticals',
    'Medical Devices',
    'Life Sciences and Clinical Research',
    'Specialty Chemicals/Chemicals',
    'Agro & Seeds',
    'Quality Assurance',
    'Quality Control',
    'Regulatory Affairs',
    'Research Associate',
    'Scientist',
    'Specimen Processor',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Heart className="h-4 w-4" />
              <span className="text-sm font-medium">Healthcare & Life Sciences Staffing</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Healthcare Staffing That Protects Quality and Speed
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              InTime supports healthcare and life sciences organizations facing critical talent shortages. We understand the stakes: data integrity, patient outcomes, and regulatory compliance.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find Healthcare Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Our Healthcare Expertise
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Our Approach */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-8 text-trust-blue text-center">
              Precision in Healthcare Staffing
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: 'Values Alignment', desc: 'Ensuring cultural fit and patient-first mindset' },
                { title: 'Compliance First', desc: 'Strict adherence to regulatory requirements' },
                { title: 'Quality Pipeline', desc: 'Vetted specialists ready to mobilize' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="h-16 w-16 bg-success-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-success-green" />
                  </div>
                  <h3 className="font-semibold text-trust-blue-700 mb-2">{item.title}</h3>
                  <p className="text-wisdom-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-wisdom-gray-700 leading-relaxed text-center">
              Our process matches specialized professionals to precise roles while ensuring values alignment and clear communication. From laboratories to clinical research and medical devices, we maintain a vetted pipeline and provide onboarding support that protects quality and speed.
            </p>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading mb-4 text-trust-blue">
              Healthcare Roles We Staff
            </h2>
            <p className="text-lg text-wisdom-gray-600 max-w-3xl mx-auto">
              From biologists to regulatory affairs specialists, we deliver healthcare talent that elevates standards.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-white p-4 rounded-xl border-2 border-transparent hover:border-success-green transition-all duration-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-3">
                  <div className="h-2 w-2 bg-success-green rounded-full"></div>
                  <h3 className="font-medium text-trust-blue-700 text-sm">{role}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Focus Areas */}
      <section className="py-16 bg-trust-blue-50">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-8 text-trust-blue text-center">
              Our Healthcare Focus Areas
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {[
                { title: 'Laboratories', desc: 'Clinical, research, and diagnostic lab staffing' },
                { title: 'Clinical Research', desc: 'CRA, CRC, and clinical trial specialists' },
                { title: 'Medical Devices', desc: 'R&D, quality, and regulatory talent' },
                { title: 'Pharmaceuticals', desc: 'Drug development and manufacturing experts' },
                { title: 'Life Sciences', desc: 'Biotech, genomics, and translational research' },
                { title: 'Specialty Chemicals', desc: 'Formulation, scale-up, and quality teams' },
              ].map((area, index) => (
                <div key={index} className="bg-white p-6 rounded-xl border-l-4 border-success-green">
                  <h3 className="font-semibold text-trust-blue-700 mb-2">{area.title}</h3>
                  <p className="text-wisdom-gray-600">{area.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-success-green to-success-green-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Build Your Healthcare Team?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed">
            Tell us your focus area and timelines—we'll mobilize the right specialists while maintaining strict compliance.
          </p>
          <Link href="/contact" className="btn-primary inline-flex items-center">
            Start Your Search
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

