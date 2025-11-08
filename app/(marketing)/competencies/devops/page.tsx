import { ArrowRight, Cog } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'DevOps Services & Solutions | InTime eSolutions',
  description: 'DevOps accelerates the path from commit to customer. Faster releases, rapid incident resolution, and 20-30% IT cost savings.',
};

export default function DevOpsPage() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Cog className="h-4 w-4" />
              <span className="text-sm font-medium">DevOps Competency</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              DevOps: From Commit to Customer
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              DevOps accelerates the path from commit to customer by uniting development and operations. Benefits include trust, faster releases, rapid incident resolution, reduced unplanned work, and 20-30% savings on IT projects—delivering faster ROI.
            </p>
            <Link href="/contact" className="btn-secondary inline-flex items-center">
              Learn More
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-h2 font-heading mb-6 text-trust-blue">DevOps as a Service</h2>
              <p className="text-lg text-wisdom-gray-700 mb-6">
                Consume an integrated toolchain with visibility across SCM, builds, testing, artifact repositories, deployment/configuration, and infrastructure—fully managed by us so your teams stay focused on business applications.
              </p>
              <h3 className="text-h4 font-heading mb-4 text-trust-blue-700">Implementation Includes</h3>
              <ul className="space-y-2 text-wisdom-gray-700">
                <li>• Maturity assessment and roadmap</li>
                <li>• Process creation and change management</li>
                <li>• Tool selection with CI/CD workflows</li>
                <li>• Automated infrastructure and application deployment</li>
                <li>• Support and maintenance</li>
              </ul>
            </div>
            <div className="bg-success-green-50 p-8 rounded-2xl">
              <h3 className="text-h4 font-heading mb-6 text-trust-blue">Outcomes</h3>
              <ul className="space-y-4 text-wisdom-gray-700">
                <li>✓ Shorter cycles and reliable service delivery</li>
                <li>✓ Higher innovation velocity</li>
                <li>✓ Tighter collaboration and integration</li>
                <li>✓ Greater team efficiency and business value</li>
                <li>✓ Better management of unplanned work</li>
                <li>✓ Cost reduction through automation</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">Ready to Transform Your DevOps?</h2>
          <Link href="/contact" className="btn-secondary inline-flex items-center">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

