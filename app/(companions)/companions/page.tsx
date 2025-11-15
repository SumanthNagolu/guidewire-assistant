'use client';
import Link from 'next/link';
import { Bot, Sparkles, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
const AGENTS = [
  {
    id: 'guidewire-guru',
    name: 'The Guidewire Guru',
    description: 'Expert in all things Guidewire - from resumes to debugging to interview prep.',
    icon: '🧙‍♂️',
    status: 'active',
    capabilities: [
      '📄 Resume Generation',
      '📁 Project Documentation',
      '💡 Q&A Assistant',
      '🐛 Code Debugging',
      '🎤 Interview Prep',
      '🤝 Personal Assistant'
    ],
    href: '/companions/guidewire-guru'
  },
  // Future agents can be added here
  {
    id: 'sales-strategist',
    name: 'The Sales Strategist',
    description: 'Your AI sales coach for client outreach, proposal writing, and deal closing.',
    icon: '💼',
    status: 'coming-soon',
    capabilities: [
      '📧 Cold Email Templates',
      '📊 Proposal Generation',
      '🎯 Account Planning',
      '💬 Pitch Practice'
    ],
    href: '#'
  },
  {
    id: 'operations-optimizer',
    name: 'The Operations Optimizer',
    description: 'Streamline your processes, automate workflows, and boost team productivity.',
    icon: '⚙️',
    status: 'coming-soon',
    capabilities: [
      '📋 Process Mapping',
      '🤖 Workflow Automation',
      '📈 Metrics Dashboards',
      '🔄 Bottleneck Analysis'
    ],
    href: '#'
  }
];
export default function CompanionsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-trust-blue-50 via-white to-success-green-50">
      {/* Header */}
      <div className="section-container py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 bg-trust-blue-100 px-4 py-2 rounded-full mb-6">
            <Sparkles className="w-5 h-5 text-trust-blue" />
            <span className="text-sm font-semibold text-trust-blue uppercase tracking-wider">
              AI Companions
            </span>
          </div>
          <h1 className="text-5xl md:text-6xl font-heading font-bold text-wisdom-gray-700 mb-6">
            Your Personal AI
            <span className="text-trust-blue"> Expert Team</span>
          </h1>
          <p className="text-xl text-wisdom-gray-600 max-w-3xl mx-auto">
            Meet your AI companions - each one a specialist in their domain, available 24/7 to help you work smarter.
          </p>
        </motion.div>
        {/* Agents Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {AGENTS.map((agent, index) => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <Link href={agent.href}>
                <div className={`
                  relative bg-white rounded-2xl p-8 shadow-lg border-2 border-gray-200
                  transition-all duration-300 h-full
                  ${agent.status === 'active' 
                    ? 'hover:border-trust-blue hover:shadow-2xl hover:-translate-y-2 cursor-pointer' 
                    : 'opacity-60 cursor-not-allowed'
                  }
                `}>
                  {/* Status Badge */}
                  {agent.status === 'coming-soon' && (
                    <div className="absolute top-4 right-4 bg-wisdom-gray-200 text-wisdom-gray-700 text-xs font-semibold px-3 py-1 rounded-full">
                      Coming Soon
                    </div>
                  )}
                  {agent.status === 'active' && (
                    <div className="absolute top-4 right-4 flex items-center gap-1">
                      <div className="w-2 h-2 bg-success-green rounded-full animate-pulse"></div>
                      <span className="text-xs font-semibold text-success-green">Active</span>
                    </div>
                  )}
                  {/* Icon */}
                  <div className="text-6xl mb-4">{agent.icon}</div>
                  {/* Name */}
                  <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-3">
                    {agent.name}
                  </h3>
                  {/* Description */}
                  <p className="text-wisdom-gray-600 mb-6">
                    {agent.description}
                  </p>
                  {/* Capabilities */}
                  <div className="space-y-2">
                    {agent.capabilities.map((capability, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-wisdom-gray-600">
                        <div className="w-1.5 h-1.5 bg-trust-blue rounded-full"></div>
                        {capability}
                      </div>
                    ))}
                  </div>
                  {/* CTA */}
                  {agent.status === 'active' && (
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center justify-between text-trust-blue font-semibold">
                        <span>Start Conversation</span>
                        <Zap className="w-5 h-5" />
                      </div>
                    </div>
                  )}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="inline-block bg-white rounded-2xl p-8 shadow-lg max-w-2xl">
            <Bot className="w-12 h-12 text-trust-blue mx-auto mb-4" />
            <h3 className="text-2xl font-heading font-bold text-wisdom-gray-700 mb-3">
              More Agents Coming Soon
            </h3>
            <p className="text-wisdom-gray-600">
              We're building a full suite of AI companions to help you with every aspect of your business.
              Have an idea for an agent? Let us know!
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
