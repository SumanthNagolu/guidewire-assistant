import { ArrowRight, Cloud } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Cloud Computing | InTime eSolutions',
  description: 'Cloud consulting and support for AWS, Azure, Rackspace, DigitalOcean, and Salesforce.',
};

export default function Page() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-h1 font-heading mb-6">
              Cloud Computing
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              Cloud consulting and support for AWS, Azure, Rackspace, DigitalOcean, and Salesforce.
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
            <p className="text-lg text-wisdom-gray-700 leading-relaxed">Transform to a demand‑driven IT organization. We provide app development software, data access and analysis, consulting for AWS/Azure/Rackspace, information management, integration middleware, quality tools, enterprise portals, and system management. Cloud adoption, product engineering, porting, and governance services.</p>
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
