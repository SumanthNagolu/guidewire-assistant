import { ArrowRight, CheckCircle2, Brain } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'AI, ML & Data Science Staffing | InTime eSolutions',
  description: 'AI, ML, data science, and analytics talent. From data scientists to ML engineers—TensorFlow, PyTorch, AWS SageMaker certified.',
  keywords: 'AI staffing, machine learning jobs, data scientist recruitment, ML engineer, data analyst, AI engineer, data engineering',
};

export default function AiMlDataPage() {
  const roles = [
    'Data Scientist',
    'Machine Learning Engineer',
    'AI Engineer',
    'Data Engineer',
    'Data Analyst',
    'Business Intelligence Analyst',
    'ML Ops Engineer',
    'Deep Learning Engineer',
    'NLP Engineer',
    'Computer Vision Engineer',
    'Data Architect',
    'Big Data Engineer',
    'AI Research Scientist',
    'Analytics Manager',
    'Data Engineering Manager',
    'AI Product Manager',
    'Quantitative Analyst',
    'Statistical Analyst',
    'MLOps Specialist',
    'Prompt Engineer',
  ];

  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-innovation-orange-600 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <Brain className="h-4 w-4" />
              <span className="text-sm font-medium">AI, ML & Data Science Staffing</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              AI Talent That Trains Models & Ships Products
            </h1>
            <p className="text-xl mb-8 text-gray-100 leading-relaxed">
              From GPT fine-tuning to computer vision pipelines—InTime delivers AI/ML talent who code in PyTorch, deploy on AWS SageMaker, and understand transformers, RAG, and LLMs. 92% of companies struggle to hire AI talent. We solve that fast.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/contact" className="btn-secondary">
                Find AI/ML Talent
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
              <Link href="/company/about" className="btn-outline">
                Our AI Expertise
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
              AI-First Staffing
            </h2>
            <div className="grid md:grid-cols-3 gap-8 mb-12">
              {[
                { title: 'Production-Ready Skills', desc: 'Not just research - our talent ships models to prod at scale.' },
                { title: 'Full Stack AI', desc: 'Data pipeline to model training to deployment to monitoring.' },
                { title: 'Latest Tech Stack', desc: 'GPT-4, Claude, Llama, RAG, LangChain, vector DBs - we hire for today AI.' },
              ].map((item, index) => (
                <div key={index} className="text-center">
                  <div className="h-16 w-16 bg-success-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="h-8 w-8 text-success-green" />
                  </div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">{item.title}</h3>
                  <p className="text-wisdom-gray">{item.desc}</p>
                </div>
              ))}
            </div>
            <div className="bg-gray-50 rounded-2xl p-8">
              <p className="text-lg text-wisdom-gray leading-relaxed mb-4">
                <strong className="text-trust-blue">The AI Talent Shortage:</strong> 92% of companies can't find qualified AI/ML talent. Data science projects stall. AI roadmaps gather dust. Competitors ship AI features first.
              </p>
              <p className="text-lg text-wisdom-gray leading-relaxed">
                InTime delivers AI/ML talent fast—data scientists who clean messy data, ML engineers who deploy models at scale, prompt engineers who fine-tune LLMs, computer vision specialists who ship real-time inference. Whether you need one data analyst or an entire AI team, we staff within 72 hours.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Roles We Staff */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-4 text-trust-blue text-center">
            AI, ML & Data Roles We Staff
          </h2>
          <p className="text-center text-wisdom-gray-600 mb-12 max-w-3xl mx-auto">
            From data pipelines to production ML—data scientists, ML engineers, AI researchers, and analytics experts.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-white rounded-lg px-4 py-3 text-center text-sm text-wisdom-gray-700 hover:shadow-md transition-shadow"
              >
                {role}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why AI Teams Choose InTime */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Why AI Teams Choose InTime
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Modern AI Stack
                  </h3>
                  <p className="text-wisdom-gray">
                    GPT-4, Claude, Llama, RAG, LangChain, Pinecone, Chroma—our talent knows the latest tools.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Production ML Experience
                  </h3>
                  <p className="text-wisdom-gray">
                    Not just Kaggle—our ML engineers deploy models at scale on AWS, GCP, Azure.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Full Stack Data
                  </h3>
                  <p className="text-wisdom-gray">
                    Data pipeline (Airflow, Spark) → training (PyTorch, TensorFlow) → serving (FastAPI, MLflow).
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0">
                  <div className="h-12 w-12 bg-success-green-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-success-green" />
                  </div>
                </div>
                <div>
                  <h3 className="font-heading font-semibold text-wisdom-gray-700 mb-2">
                    Domain Expertise
                  </h3>
                  <p className="text-wisdom-gray">
                    NLP, computer vision, recommender systems, time series—we match specialists to your use case.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Success Metrics */}
      <section className="py-16 bg-gradient-to-br from-trust-blue-50 to-innovation-orange-50">
        <div className="section-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue">
              AI Staffing By The Numbers
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-5xl font-bold text-trust-blue mb-2">72hrs</div>
                <div className="text-wisdom-gray-600">Average time to deploy AI/ML talent</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-success-green mb-2">93%</div>
                <div className="text-wisdom-gray-600">Placement success rate (production ML)</div>
              </div>
              <div>
                <div className="text-5xl font-bold text-innovation-orange mb-2">$200B</div>
                <div className="text-wisdom-gray-600">Global AI market we serve</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-trust-blue to-innovation-orange text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Ship AI? We Deliver Talent Fast.
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-white/90">
            Whether you need one prompt engineer or an entire ML team—we staff fast, production-ready, and shipping AI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary">
              Request AI/ML Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/careers/open-positions" className="btn-outline">
              View AI/ML Jobs
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}

