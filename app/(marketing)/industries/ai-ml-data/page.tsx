import { ArrowRight, Brain, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'AI/ML & Data Talent Staffing | InTime eSolutions',
  description: 'Build AI/ML and Data teams that turn models into outcomes. Production-grade pipelines, governance, and ROI-focused talent.',
  keywords: 'AI staffing, machine learning engineer jobs, data scientist recruitment, MLOps engineer, data engineer staffing',
};

export default function AIMLDataPage() {
  const roles = [
    'Data Scientist',
    'Machine Learning Engineer',
    'MLOps Engineer',
    'Data Engineer',
    'Business Intelligence Analyst',
    'LLM / Prompt Engineer',
    'NLP Engineer',
    'Computer Vision Engineer',
    'Data Analyst',
    'AI Product Manager',
  ];

  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">AI/ML & Data Talent</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              AI/ML Teams That Turn Models Into Outcomes
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              We build AI/ML and Data teams that turn models into outcomes—focusing on production‑grade pipelines, governance, and ROI. From classical ML to LLM applications, we rigorously evaluate problem framing, data fluency, and delivery discipline.
            </p>
            <Link href="/contact" className="btn-secondary inline-flex items-center">
              Find AI/ML Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-8 text-trust-blue text-center">
              What We Look For
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: 'Technical Depth', desc: 'Strong fundamentals in ML, statistics, and software engineering' },
                { title: 'Production Focus', desc: 'Experience shipping models to production and measuring impact' },
                { title: 'Communication', desc: 'Ability to explain trade-offs and align with stakeholders' },
              ].map((item, index) => (
                <div key={index} className="text-center p-6 bg-wisdom-gray-50 rounded-xl">
                  <h3 className="font-semibold text-trust-blue-700 mb-2">{item.title}</h3>
                  <p className="text-wisdom-gray-600">{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="text-lg text-wisdom-gray-700 text-center">
              Expect professionals who code, communicate, and collaborate: they explain trade‑offs, design reliable systems, and ship solutions that stakeholders can trust.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
            AI/ML & Data Roles We Staff
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-trust-blue transition-all duration-300"
              >
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="h-5 w-5 text-success-green" />
                  <h3 className="font-semibold text-trust-blue-700">{role}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Build Your AI/ML Team?
          </h2>
          <p className="text-xl mb-8 text-sky-blue-500 max-w-2xl mx-auto">
            Let's align your AI roadmap with the right skills to deliver measurable business value.
          </p>
          <Link href="/contact" className="btn-secondary inline-flex items-center">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}

