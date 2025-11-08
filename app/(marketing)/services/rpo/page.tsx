import { ArrowRight, UserSearch } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Recruitment Process Outsourcing (RPO) | InTime eSolutions',
  description: 'Disciplined sourcing with values‑aligned selection across portals, search engines, and networks.',
};

export default function Page() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-h1 font-heading mb-6">
              Recruitment Process Outsourcing (RPO)
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              Disciplined sourcing with values‑aligned selection across portals, search engines, and networks.
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
            <p className="text-lg text-wisdom-gray-700 leading-relaxed">Our RPO blends disciplined sourcing with values‑aligned selection. We systemically screen resumes across portals, search engines, mailboxes, and networks—curating diverse slates that fit your culture and objectives. Campus recruiting, job fairs, contingency search, managerial/executive research—expanding reach beyond traditional practices while keeping compliance central.</p>
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
