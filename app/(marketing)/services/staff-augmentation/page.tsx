import { ArrowRight, UserPlus } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Staff Augmentation | InTime eSolutions',
  description: 'Certified professionals who integrate on day one, supported by our knowledge base and delivery center.',
};

export default function Page() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-h1 font-heading mb-6">
              Staff Augmentation
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              Certified professionals who integrate on day one, supported by our knowledge base and delivery center.
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
            <p className="text-lg text-wisdom-gray-700 leading-relaxed">Skills gaps stall growth. We deliver certified professionals who integrate with your teams on day one—supported by our knowledge base and India delivery center. Dedicated roles: .NET, ASP.NET, Java programmers. Flexibility to switch personnel, engagements that scale, competitive pricing with measurable performance.</p>
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
