// Generate all competency and service pages
import { writeFileSync } from 'fs';
import { join } from 'path';

const generatePage = (title: string, icon: string, description: string, content: string[]) => `import { ArrowRight, ${icon} } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: '${title} | InTime eSolutions',
  description: '${description}',
};

export default function Page() {
  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <h1 className="text-h1 font-heading mb-6">
              ${title}
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              ${description}
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
          ${content.map(c => `<div className="mb-8">
            <p className="text-lg text-wisdom-gray-700 leading-relaxed">${c}</p>
          </div>`).join('\n          ')}
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
`;

const competencies = [
  {
    slug: 'web-technologies',
    title: 'Web Technologies',
    icon: 'Globe',
    description: 'Custom web applications built with modern frameworks that reflect your unique workflows.',
    content: ['We blend years of engineering experience with modern frameworks to deliver custom applications. Microsoft .NET Platform, J2EE / PHP Technologies, IBM WebSphere / WebLogic. Microsoft‑certified professionals provide specialized support and early experience with new product releases.'],
  },
  {
    slug: 'data-warehousing-bi',
    title: 'Data Warehousing / Business Intelligence',
    icon: 'Database',
    description: 'Enterprise data warehousing and BI solutions using Cognos, Informatica, Business Objects, and more.',
    content: ['We support Cognos, Informatica, Business Objects, IBM DataStage, Microsoft Reporting Services, and Hyperion. We start with a narrowly defined business area to prove value quickly, then scale. Our approach includes requirement gathering, gap analysis, functional design, ETL tool evaluation, and OLAP tooling guidance.'],
  },
  {
    slug: 'quality-assurance',
    title: 'Quality Assurance',
    icon: 'Shield',
    description: 'Comprehensive QA services across the SDLC—feature verification, automation, performance, and security testing.',
    content: ['We plan and test across the SDLC: feature verification, black/white box, usability, component, load, compatibility—backed by rigorous defect reporting. Testing services include Performance, Regression, Functionality, Interoperability, Integration, API, Configuration, Usability, Test Automation, and Requirements Validation.'],
  },
  {
    slug: 'cloud-computing',
    title: 'Cloud Computing',
    icon: 'Cloud',
    description: 'Cloud consulting and support for AWS, Azure, Rackspace, DigitalOcean, and Salesforce.',
    content: ['Transform to a demand‑driven IT organization. We provide app development software, data access and analysis, consulting for AWS/Azure/Rackspace, information management, integration middleware, quality tools, enterprise portals, and system management. Cloud adoption, product engineering, porting, and governance services.'],
  },
  {
    slug: 'analytics',
    title: 'Analytics',
    icon: 'BarChart3',
    description: 'Collate unstructured data, correlate with KPIs, and enable self-service analytics.',
    content: ['Collate unstructured social data, correlate with traditional KPIs, unified dashboards for self‑service analytics, discover cross‑silo relationships. Strategy & consulting, information management, data visualization, predictive analytics. Partnerships with leading platforms, experience across market stacks, and web/mobile reporting.'],
  },
  {
    slug: 'databases',
    title: 'Databases',
    icon: 'HardDrive',
    description: 'Data modeling, design, development, and performance tuning across Oracle, SQL Server, DB2, and more.',
    content: ['We deliver data modeling, logical/physical design, development, and performance tuning across Oracle, Microsoft SQL Server, Microsoft Access, Sybase, UDB/DB2. Services include assessment, software selection, application development, data conversion, and production support.'],
  },
  {
    slug: 'enterprise-mobility',
    title: 'Enterprise Mobility',
    icon: 'Smartphone',
    description: 'iOS and Android mobile solutions with MapKit, Push Notifications, social integration, and more.',
    content: ['iOS: MapKit, AV Foundation, Core Graphics, Apple Push Notification, Facebook/Twitter integration, Cocoa Touch, Core Data. Android: Location‑based Services, Facebook APIs, Android media APIs, Wi‑Fi APIs, SQLite, MySQL. In‑house framework for rich client/server mobility, unbiased technology competence, and dedicated UX teams.'],
  },
  {
    slug: 'web-native-app-development',
    title: 'Web and Native App Development',
    icon: 'Code',
    description: 'Signature apps built for scalability, performance, security, and portability using hybrid sourcing.',
    content: ['Create signature apps using Native (iOS, Android), Web‑Based (HTML5, PhoneGap, Cordova, AngularJS, Bootstrap, Ionic), and Hybrid (Xamarin, Flutter) approaches. Built for scalability, performance, security, and portability with local PM, transparency, and real‑time communication.'],
  },
  {
    slug: 'data-engineering-analytics',
    title: 'Data Engineering and Analytics',
    icon: 'Database',
    description: 'Enterprise Data Lake, Master Data Management, Data Virtualization, and Data Governance.',
    content: ['Data is advantage—if engineered for access and action. We design strategies and platforms that manage, organize, and analyze data for faster, smarter decisions—augmented by AI and ML. Solutions include Enterprise Data Lake, Master Data Management, Data Virtualization, and Enterprise Data Governance.'],
  },
  {
    slug: 'ai-machine-learning',
    title: 'AI and Machine Learning',
    icon: 'Brain',
    description: 'Integrate AI into systems and products: NLP, Deep Learning, Computer Vision, and Chatbots.',
    content: ['Leaders use AI to innovate beyond incremental gains. We integrate AI into systems and products so teams automate routine work, uncover insights, and deliver new experiences. AI Services: Natural Language Processing, Deep Learning, Computer Vision, Chatbots for HR and IT, Quality Control, and Advanced Product Technology.'],
  },
  {
    slug: 'native-cloud-development',
    title: 'Native Cloud Development',
    icon: 'CloudCog',
    description: 'Cloud-native architectures and hybrid environment management for resiliency and economics.',
    content: ['Whether migrating or optimizing, we design cloud‑native architectures and manage complex hybrid environments. As a cloud MSP, we manage multi‑environment estates. Cloud Backup Services protect data against ransomware and outages. Cloud Readiness Consultation assesses your estate and recommends the best‑fit migration approach.'],
  },
  {
    slug: 'native-app-development',
    title: 'Native App Development (iOS/Android)',
    icon: 'Smartphone',
    description: 'Production-ready mobile solutions using Agile for iOS and Android platforms.',
    content: ['We translate business requirements into production‑ready mobile solutions. Custom Systems: Mobile, Core Business Apps, Back‑Office IT. Engineering Services: Architecture consulting, Software development, Performance engineering, QA and testing, Support and maintenance. Using Agile sprints for incremental value and constant feedback.'],
  },
  {
    slug: 'cybersecurity',
    title: 'Cybersecurity',
    icon: 'ShieldCheck',
    description: '24/7 security monitoring, firewall protection, vulnerability assessments, and compliance.',
    content: ['Threats run 24/7—your defenses should too. We combine prevention, monitoring, and governance. 24/7 Security with outsourced options, firewall protection, proactive monitoring, backups. Roadmap Service: internal/external assessments, sensitive‑data discovery, policy reviews. Security/Firewall as a Service: all‑in‑one protection with 8/5 or 24/7 support.'],
  },
];

const services = [
  {
    slug: 'custom-software-development',
    title: 'Custom Software Development',
    icon: 'Code2',
    description: 'Tailored software solutions from modern UIs to complex platforms, aligned to your budget and timeline.',
    content: ['From modern UIs to complex platforms, we design and deliver software aligned to your budget, timelines, and scale. Technology selection grounded in business goals, prototypes to de‑risk early, comprehensive documentation. Through our global offshore services (GOS), clients accelerate timelines and reduce costs while we assume end‑to‑end accountability.'],
  },
  {
    slug: 'system-integration',
    title: 'Solutions & System Integration',
    icon: 'Network',
    description: 'Build secure applications and integrate them seamlessly with your existing systems.',
    content: ['We build secure, reliable applications for internal networks and the internet—and integrate them seamlessly. Our specialty is interconnecting internal and external systems to enable secure, real‑time flows. Design and implement business processes, migrate legacy apps to web, enhance mission‑critical applications, provide comprehensive QA.'],
  },
  {
    slug: 'quality-assurance',
    title: 'Quality Assurance Services',
    icon: 'CheckCircle2',
    description: 'Ship with confidence: Functional, Regression, Performance, Automation, and Environment Management.',
    content: ['Ship with confidence. Our QA services span Functional, Regression, Performance, Test Automation, and Test Environment Management. QA best practices, automation with Selenium Grid and major tools, executive reporting, dedicated performance lab, staff augmentation of QA Leads and Engineers.'],
  },
  {
    slug: 'staff-augmentation',
    title: 'Staff Augmentation',
    icon: 'UserPlus',
    description: 'Certified professionals who integrate on day one, supported by our knowledge base and delivery center.',
    content: ['Skills gaps stall growth. We deliver certified professionals who integrate with your teams on day one—supported by our knowledge base and India delivery center. Dedicated roles: .NET, ASP.NET, Java programmers. Flexibility to switch personnel, engagements that scale, competitive pricing with measurable performance.'],
  },
  {
    slug: 'rpo',
    title: 'Recruitment Process Outsourcing (RPO)',
    icon: 'UserSearch',
    description: 'Disciplined sourcing with values‑aligned selection across portals, search engines, and networks.',
    content: ['Our RPO blends disciplined sourcing with values‑aligned selection. We systemically screen resumes across portals, search engines, mailboxes, and networks—curating diverse slates that fit your culture and objectives. Campus recruiting, job fairs, contingency search, managerial/executive research—expanding reach beyond traditional practices while keeping compliance central.'],
  },
  {
    slug: 'hr-outsourcing',
    title: 'HR Outsourcing',
    icon: 'Users',
    description: 'Reduce overhead and focus on core operations with comprehensive HR outsourcing services.',
    content: ['We reduce overhead so you can focus on core operations. Establish hiring procedures, payroll processing and taxes, create job descriptions and handbooks, benefits administration, employee safety programs and OSHA compliance, managed offboarding and terminations. Attract, onboard, retain, and develop top performers while ensuring compliance.'],
  },
  {
    slug: 'consulting',
    title: 'IT Consulting',
    icon: 'Lightbulb',
    description: 'Turn IT savings into business advantage with pragmatic modernization and outcome-driven engineering.',
    content: ['We turn IT savings into business advantage. With deep industry knowledge and pragmatic innovation, we stabilize applications, reduce run costs by 20-50%, optimize operations, and convert your app portfolio into an engine for growth. Our advisors modernize apps, platforms, and architectures. Technology is now a source of value—we help you pivot decisively to a modern operating model.'],
  },
];

// Generate competency pages
competencies.forEach((comp) => {
  const filePath = join(process.cwd(), 'app', '(marketing)', 'competencies', comp.slug, 'page.tsx');
  const content = generatePage(comp.title, comp.icon, comp.description, comp.content);
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Created: competencies/${comp.slug}/page.tsx`);
});

// Generate service pages
services.forEach((service) => {
  const filePath = join(process.cwd(), 'app', '(marketing)', 'services', service.slug, 'page.tsx');
  const content = generatePage(service.title, service.icon, service.description, service.content);
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Created: services/${service.slug}/page.tsx`);
});

console.log(`\n🎉 Generated ${competencies.length} competency pages and ${services.length} service pages!`);

