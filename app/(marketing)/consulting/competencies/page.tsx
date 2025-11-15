import { ArrowRight, Cog, Globe, Database, Shield, Cloud, BarChart3, HardDrive, Smartphone, Code, Brain, CloudCog, ShieldCheck, Zap, LineChart } from 'lucide-react';
import Link from 'next/link';
export const metadata = {
  title: 'Technology Competencies | InTime eSolutions - Enterprise-Grade Expertise',
  description: 'Enterprise technology consulting across Cloud, AI/ML, Digital Transformation, DevOps, Cybersecurity, and Data Engineering. Big 4 expertise, startup agility.',
  keywords: 'technology consulting, enterprise transformation, DevOps, cloud computing, AI ML, cybersecurity, data engineering, digital transformation',
};
export default function CompetenciesPage() {
  const competencies = [
    {
      icon: <Brain className="h-8 w-8" />,
      title: 'AI & Machine Learning',
      category: 'Digital Innovation',
      description: 'Enterprise AI strategy and implementation. From generative AI to predictive analytics—we architect AI solutions that drive measurable ROI and competitive advantage.',
      features: [
        'Generative AI & LLMs',
        'Predictive Analytics & Forecasting',
        'Computer Vision & NLP',
        'MLOps & Production AI',
        'AI Strategy & Roadmapping',
        'Custom AI Solutions (B2C & Enterprise)'
      ],
      useCases: ['Custom chatbots', 'Demand forecasting', 'Process automation', 'Intelligent document processing']
    },
    {
      icon: <CloudCog className="h-8 w-8" />,
      title: 'Cloud Strategy & Migration',
      category: 'Infrastructure Transformation',
      description: 'End-to-end cloud transformation: strategy, migration, optimization, and governance. Multi-cloud expertise across AWS, Azure, and GCP with proven TCO reduction.',
      features: [
        'Cloud Strategy & Roadmapping',
        'Multi-Cloud Architecture',
        'Cloud Migration & Modernization',
        'FinOps & Cost Optimization',
        'Cloud Security & Compliance',
        'Hybrid & Multi-Cloud Management'
      ],
      useCases: ['Data center migration', 'Cloud-native app development', 'Cost optimization', 'Disaster recovery']
    },
    {
      icon: <Cog className="h-8 w-8" />,
      title: 'DevOps & Site Reliability',
      category: 'Engineering Excellence',
      description: 'Accelerate delivery with enterprise DevOps. CI/CD pipelines, infrastructure as code, and SRE practices that reduce deployment time by 70% and incidents by 50%.',
      features: [
        'CI/CD Pipeline Design',
        'Infrastructure as Code (Terraform, Ansible)',
        'Container Orchestration (Kubernetes)',
        'Monitoring & Observability',
        'SRE & Incident Management',
        'DevSecOps Integration'
      ],
      useCases: ['Automated deployments', 'Infrastructure automation', 'Incident reduction', 'Release acceleration']
    },
    {
      icon: <Database className="h-8 w-8" />,
      title: 'Data Engineering & Analytics',
      category: 'Data & Insights',
      description: 'Enterprise data platforms that unify siloed data, enable real-time analytics, and power AI/ML initiatives. From data lakes to self-service BI.',
      features: [
        'Data Lake & Warehouse Architecture',
        'Real-Time Data Pipelines',
        'Master Data Management',
        'Data Governance & Quality',
        'ETL/ELT Optimization',
        'Self-Service Analytics Platforms'
      ],
      useCases: ['Unified data platform', 'Real-time dashboards', 'Predictive analytics', 'Data democratization']
    },
    {
      icon: <ShieldCheck className="h-8 w-8" />,
      title: 'Cybersecurity & Compliance',
      category: 'Risk & Security',
      description: 'Zero-trust security architecture, 24/7 SOC, and compliance frameworks (SOC 2, HIPAA, GDPR). Protect against evolving threats while maintaining business agility.',
      features: [
        'Zero-Trust Architecture',
        '24/7 Security Operations Center',
        'Penetration Testing & Red Teaming',
        'Compliance (SOC 2, HIPAA, GDPR)',
        'Identity & Access Management',
        'Security Automation & Orchestration'
      ],
      useCases: ['Zero-trust implementation', 'Compliance certification', 'Incident response', 'Threat hunting']
    },
    {
      icon: <Zap className="h-8 w-8" />,
      title: 'Digital Transformation',
      category: 'Strategic Transformation',
      description: 'End-to-end digital transformation: strategy, operating model, technology, and change management. Turn disruption into competitive advantage.',
      features: [
        'Digital Strategy & Roadmapping',
        'Operating Model Transformation',
        'Legacy Modernization',
        'API-First Architecture',
        'Digital Product Development',
        'Change Management & Enablement'
      ],
      useCases: ['Digital-first strategy', 'Legacy system modernization', 'API ecosystem', 'Agile transformation']
    },
    {
      icon: <Globe className="h-8 w-8" />,
      title: 'Web & Mobile Engineering',
      category: 'Digital Experience',
      description: 'Scalable web and mobile applications built for performance, security, and user delight. React, React Native, Next.js, Flutter—we architect for scale.',
      features: [
        'Full-Stack Web Development',
        'Native iOS & Android',
        'Progressive Web Apps (PWA)',
        'Cross-Platform (React Native, Flutter)',
        'Micro-Frontend Architecture',
        'Performance & UX Optimization'
      ],
      useCases: ['Enterprise web portals', 'Customer-facing mobile apps', 'B2C platforms', 'PWA implementation']
    },
    {
      icon: <LineChart className="h-8 w-8" />,
      title: 'Business Intelligence & Visualization',
      category: 'Data & Insights',
      description: 'Self-service BI platforms that democratize data and enable data-driven decisions. Power BI, Tableau, Looker—visual analytics that drive action.',
      features: [
        'BI Strategy & Platform Selection',
        'Interactive Dashboards',
        'Embedded Analytics',
        'Predictive & Prescriptive Analytics',
        'Self-Service Enablement',
        'Real-Time Business Metrics'
      ],
      useCases: ['Executive dashboards', 'Operational metrics', 'Customer analytics', 'Predictive insights']
    },
    {
      icon: <Shield className="h-8 w-8" />,
      title: 'Quality Engineering & Automation',
      category: 'Engineering Excellence',
      description: 'Comprehensive QA across functional, performance, security, and accessibility. Test automation that accelerates releases while improving quality.',
      features: [
        'Test Automation (Selenium, Cypress)',
        'Performance & Load Testing',
        'Security & Penetration Testing',
        'Accessibility Testing (WCAG)',
        'API & Integration Testing',
        'Mobile App Testing'
      ],
      useCases: ['Regression automation', 'Performance tuning', 'Security validation', 'Continuous testing']
    },
    {
      icon: <Code className="h-8 w-8" />,
      title: 'Enterprise Application Development',
      category: 'Custom Solutions',
      description: 'Custom enterprise applications built to your exact business process. From ERP to CRM, we architect solutions that scale with your business.',
      features: [
        'Custom ERP & CRM Solutions',
        'Workflow Automation',
        'Integration Platforms (MuleSoft, Dell Boomi)',
        'Microservices Architecture',
        'Low-Code/No-Code Platforms',
        'Legacy Application Modernization'
      ],
      useCases: ['Custom ERP systems', 'Workflow automation', 'System integration', 'Process digitization']
    },
    {
      icon: <Smartphone className="h-8 w-8" />,
      title: 'IoT & Edge Computing',
      category: 'Emerging Technology',
      description: 'Connected devices, edge analytics, and IoT platforms. From smart factories to connected products—we architect the connected future.',
      features: [
        'IoT Strategy & Architecture',
        'Edge Computing & Analytics',
        'Device Management Platforms',
        'Real-Time Data Processing',
        'Predictive Maintenance',
        'Industrial IoT (IIoT)'
      ],
      useCases: ['Smart factory', 'Predictive maintenance', 'Connected products', 'Asset tracking']
    },
    {
      icon: <HardDrive className="h-8 w-8" />,
      title: 'Database & Performance Optimization',
      category: 'Data & Insights',
      description: 'Enterprise database architecture, performance tuning, and migration. Oracle, SQL Server, PostgreSQL, MongoDB—optimized for scale and performance.',
      features: [
        'Database Design & Modeling',
        'Performance Tuning & Optimization',
        'Database Migration & Upgrades',
        'High Availability & Disaster Recovery',
        'NoSQL & NewSQL Architecture',
        'Database Security & Compliance'
      ],
      useCases: ['Database modernization', 'Performance optimization', 'Migration to cloud', 'High-availability setup']
    },
  ];
  const differentiators = [
    {
      title: 'Big 4 Expertise, Startup Agility',
      description: 'Our consultants come from Deloitte, EY, PwC, and KPMG—but we move at startup speed. Enterprise quality without enterprise bureaucracy.',
      icon: '⚡'
    },
    {
      title: '40-60% Cost Savings',
      description: 'Same caliber consultants. Same proven methodologies. 40-60% lower rates than Big 4. Better value. Better ROI.',
      icon: '💰'
    },
    {
      title: 'End-to-End Delivery',
      description: 'From strategy to implementation to support—we deliver complete solutions. No hand-offs. No gaps. One partner, start to finish.',
      icon: '🎯'
    },
    {
      title: 'AI-First Approach',
      description: 'Every engagement includes AI/automation assessment. We don\'t just deliver solutions—we deliver intelligent, self-improving solutions.',
      icon: '🤖'
    }
  ];
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block bg-white/10 backdrop-blur-sm px-6 py-3 rounded-full mb-6">
              <span className="text-sm font-semibold">🏆 ENTERPRISE TECHNOLOGY EXPERTISE</span>
            </div>
            <h1 className="text-5xl md:text-6xl font-heading font-bold mb-6 leading-tight">
              12 Core Technology Competencies
            </h1>
            <p className="text-xl mb-8 leading-relaxed text-gray-100">
              From AI to Cybersecurity, Cloud to IoT—we bring Big 4-level expertise across the complete technology stack. Enterprise-grade consulting at a fraction of the cost.
            </p>
            <Link href="/contact" className="btn-secondary inline-flex items-center">
              Discuss Your Technology Challenge
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
      {/* Why Choose InTime - Differentiators */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading mb-4 text-trust-blue">
              Why Companies Choose InTime Over Big 4
            </h2>
            <p className="text-lg text-wisdom-gray-600 max-w-3xl mx-auto">
              Same expertise. Same methodologies. Better value. Better speed.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            {differentiators.map((item, index) => (
              <div key={index} className="bg-gradient-to-br from-trust-blue-50 to-sky-blue-50 p-6 rounded-2xl text-center border border-trust-blue-100">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-h5 font-heading text-trust-blue mb-2">{item.title}</h3>
                <p className="text-sm text-wisdom-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Competencies Grid */}
      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <div className="text-center mb-12">
            <h2 className="text-h2 font-heading mb-4 text-trust-blue">
              Our Technology Competencies
            </h2>
            <p className="text-lg text-wisdom-gray-600 max-w-3xl mx-auto">
              Deep expertise across every layer of your technology stack—from infrastructure to AI, data to security.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {competencies.map((competency, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl border-2 border-transparent hover:border-trust-blue transition-all duration-300 hover:shadow-2xl group"
              >
                <div className="flex items-start gap-4 mb-6">
                  <div className="h-16 w-16 bg-trust-blue-50 rounded-xl flex items-center justify-center text-trust-blue group-hover:bg-trust-blue group-hover:text-white transition-all flex-shrink-0">
                    {competency.icon}
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-innovation-orange mb-1 uppercase tracking-wide">
                      {competency.category}
                    </div>
                    <h3 className="text-h4 font-heading text-trust-blue">
                      {competency.title}
                    </h3>
                  </div>
                </div>
                <p className="text-wisdom-gray-600 mb-6 leading-relaxed">
                  {competency.description}
                </p>
                <div className="mb-6">
                  <div className="text-sm font-semibold text-wisdom-gray-700 mb-3">Core Capabilities:</div>
                  <div className="grid grid-cols-2 gap-2">
                    {competency.features.map((feature, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-wisdom-gray-700">
                        <div className="h-1.5 w-1.5 bg-success-green rounded-full flex-shrink-0"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="border-t border-gray-200 pt-4">
                  <div className="text-xs font-semibold text-wisdom-gray-600 mb-2">Typical Use Cases:</div>
                  <div className="flex flex-wrap gap-2">
                    {competency.useCases.map((useCase, i) => (
                      <span key={i} className="text-xs bg-trust-blue-50 text-trust-blue px-3 py-1 rounded-full">
                        {useCase}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* Our Approach */}
      <section className="py-16 bg-white">
        <div className="section-container">
          <div className="max-w-5xl mx-auto">
            <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
              Our Consulting Approach
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  step: '01',
                  title: 'Discovery & Strategy', 
                  desc: 'Deep-dive assessments, stakeholder alignment, and strategic roadmapping. We understand your business before we touch technology.' 
                },
                { 
                  step: '02',
                  title: 'Design & Architecture', 
                  desc: 'Enterprise-grade architecture design, proof-of-concepts, and vendor selection. Built for scale, security, and maintainability.' 
                },
                { 
                  step: '03',
                  title: 'Delivery & Enablement', 
                  desc: 'Agile implementation, change management, and knowledge transfer. We don\'t just deliver—we enable your team for long-term success.' 
                },
              ].map((item, index) => (
                <div key={index} className="relative">
                  <div className="text-6xl font-bold text-trust-blue-100 mb-4">{item.step}</div>
                  <h3 className="text-h5 font-heading text-trust-blue mb-3">{item.title}</h3>
                  <p className="text-wisdom-gray-600 leading-relaxed">{item.desc}</p>
                  {index < 2 && (
                    <div className="hidden md:block absolute top-12 -right-4 text-trust-blue-200">
                      <ArrowRight className="h-8 w-8" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Transform Your Technology?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-100">
            Let's discuss your technology challenges and craft a solution that delivers measurable ROI. Free 30-minute consultation. No sales pitch.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/contact" className="btn-secondary inline-flex items-center">
              Schedule Free Consultation
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link href="/consulting/services" className="btn-outline inline-flex items-center">
              Explore Our Services
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
