import { ArrowRight, Smartphone } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Native App Development (iOS/Android) | InTime eSolutions',
  description: 'Production-ready mobile solutions using Agile for iOS and Android platforms.',
};

export default function Page() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-h1 font-heading mb-6">
              Native App Development (iOS/Android)
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              Production-ready mobile solutions using Agile for iOS and Android platforms.
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
            <p className="text-lg text-wisdom-gray-700 leading-relaxed">We translate business requirements into production‑ready mobile solutions. Custom Systems: Mobile, Core Business Apps, Back‑Office IT. Engineering Services: Architecture consulting, Software development, Performance engineering, QA and testing, Support and maintenance. Using Agile sprints for incremental value and constant feedback.</p>
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
