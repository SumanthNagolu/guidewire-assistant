import { ArrowRight, Network } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Solutions & System Integration | InTime eSolutions',
  description: 'Build secure applications and integrate them seamlessly with your existing systems.',
};

export default function Page() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-h1 font-heading mb-6">
              Solutions & System Integration
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              Build secure applications and integrate them seamlessly with your existing systems.
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
            <p className="text-lg text-wisdom-gray-700 leading-relaxed">We build secure, reliable applications for internal networks and the internet—and integrate them seamlessly. Our specialty is interconnecting internal and external systems to enable secure, real‑time flows. Design and implement business processes, migrate legacy apps to web, enhance mission‑critical applications, provide comprehensive QA.</p>
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
