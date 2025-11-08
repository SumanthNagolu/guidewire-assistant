import { ArrowRight, Brain } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'AI and Machine Learning | InTime eSolutions',
  description: 'Integrate AI into systems and products: NLP, Deep Learning, Computer Vision, and Chatbots.',
};

export default function Page() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-h1 font-heading mb-6">
              AI and Machine Learning
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              Integrate AI into systems and products: NLP, Deep Learning, Computer Vision, and Chatbots.
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
            <p className="text-lg text-wisdom-gray-700 leading-relaxed">Leaders use AI to innovate beyond incremental gains. We integrate AI into systems and products so teams automate routine work, uncover insights, and deliver new experiences. AI Services: Natural Language Processing, Deep Learning, Computer Vision, Chatbots for HR and IT, Quality Control, and Advanced Product Technology.</p>
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
