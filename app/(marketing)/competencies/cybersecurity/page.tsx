import { ArrowRight, ShieldCheck } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Cybersecurity | InTime eSolutions',
  description: '24/7 security monitoring, firewall protection, vulnerability assessments, and compliance.',
};

export default function Page() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-h1 font-heading mb-6">
              Cybersecurity
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              24/7 security monitoring, firewall protection, vulnerability assessments, and compliance.
            </p>
            <Link href="/contact" className="btn-secondary inline-flex items-center">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="section-container max-w-4xl">
          <div className="mb-8">
            <p className="text-lg text-wisdom-gray-700 leading-relaxed">Threats run 24/7—your defenses should too. We combine prevention, monitoring, and governance. 24/7 Security with outsourced options, firewall protection, proactive monitoring, backups. Roadmap Service: internal/external assessments, sensitive‑data discovery, policy reviews. Security/Firewall as a Service: all‑in‑one protection with 8/5 or 24/7 support.</p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">Ready to Get Started?</h2>
          <Link href="/contact" className="btn-secondary inline-flex items-center">
            Contact Us
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
