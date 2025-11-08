import { ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Government & Public Sector (MSP & VMS) | InTime eSolutions',
  description: 'We operate effectively within MSP and VMS ecosystems for government and public sector programs.',
};

export default function Page() {
  const roles = [
    "Project Manager (Public Sector)",
    "Business Analyst (Public Sector)",
    "Software Developer",
    "QA Analyst",
    "Network Engineer",
    "Systems Administrator",
    "Service Desk Analyst",
    "Data Analyst"
];

  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Building2 className="h-4 w-4" />
              <span className="text-sm font-medium">Government & Public Sector (MSP & VMS)</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              Government & Public Sector (MSP & VMS)
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              We operate effectively within MSP and VMS ecosystems for government and public sector programs.
            </p>
            <Link href="/contact" className="btn-secondary inline-flex items-center">
              Find Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
            Roles We Staff
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-trust-blue transition-all duration-300"
              >
                <h3 className="font-semibold text-trust-blue-700">{role}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Build Your Team?
          </h2>
          <Link href="/contact" className="btn-secondary inline-flex items-center">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
