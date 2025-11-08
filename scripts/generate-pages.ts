// This script helps generate all the industry, competency, and service pages efficiently
// Run with: npx tsx scripts/generate-pages.ts

import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

const generateIndustryPage = (slug: string, title: string, icon: string, description: string, roles: string[]) => `import { ArrowRight, ${icon} } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: '${title} | InTime eSolutions',
  description: '${description}',
};

export default function Page() {
  const roles = ${JSON.stringify(roles, null, 4)};

  return (
    <>
      <section className="relative bg-gradient-to-br from-trust-blue-600 via-trust-blue to-trust-blue-700 text-white py-20">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10"></div>
        <div className="section-container relative z-10">
          <div className="max-w-4xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
              <${icon} className="h-4 w-4" />
              <span className="text-sm font-medium">${title}</span>
            </div>
            <h1 className="text-h1 font-heading mb-6">
              ${title}
            </h1>
            <p className="text-xl mb-8 text-sky-blue-500 leading-relaxed">
              ${description}
            </p>
            <Link href="/contact" className="btn-secondary inline-flex items-center">
              Find Talent
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-16 bg-wisdom-gray-50">
        <div className="section-container">
          <h2 className="text-h2 font-heading mb-12 text-trust-blue text-center">
            Roles We Staff
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {roles.map((role, index) => (
              <div
                key={index}
                className="bg-white p-6 rounded-xl border-2 border-transparent hover:border-trust-blue transition-all duration-300"
              >
                <h3 className="font-semibold text-trust-blue-700">{role}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-trust-blue to-trust-blue-600 text-white">
        <div className="section-container text-center">
          <h2 className="text-h2 font-heading mb-6">
            Ready to Build Your Team?
          </h2>
          <Link href="/contact" className="btn-secondary inline-flex items-center">
            Get Started
            <ArrowRight className="ml-2 h-5 w-5" />
          </Link>
        </div>
      </section>
    </>
  );
}
`;

// Industry pages data
const industries = [
  {
    slug: 'warehouse-distribution',
    title: 'Warehouse & Distribution Staffing',
    icon: 'Package',
    description: 'Build safe, efficient warehouse and distribution teams that keep operations moving.',
    roles: ['Forklift Operator', 'Material Handler', 'Logistics', 'Inventory Control', 'Shipping and Receiving', 'Distribution, Logistics', 'Assembly', 'Warehousing'],
  },
  {
    slug: 'financial-accounting',
    title: 'Financial & Accounting Staffing',
    icon: 'DollarSign',
    description: 'Certification‑led recruiting that targets professionals whose credentials close specific gaps—CPA, CMA, CFA, IFRS, SOX.',
    roles: ['Accountant', 'Accounting Clerk', 'Senior Accountant', 'Tax Accountant', 'Accounting Supervisor', 'Accounting Director', 'Tax Analyst', 'Tax Manager', 'Credit Analyst', 'Consumer Loan Collection Manager', 'Mortgage Underwriter', 'Mortgage Loan Officer'],
  },
  {
    slug: 'legal',
    title: 'Legal Staffing Solutions',
    icon: 'Scale',
    description: 'We make legal hiring simpler and sharper. Surface attorneys and legal staff who deliver outcomes and fit your ethos.',
    roles: ['Attorneys', 'Paralegals', 'Litigation Associate', 'In-house Counsel', 'Associate Attorney', 'Corporate Attorney', 'General Counsel', 'Employment Attorney', 'Patent and IP Counsel'],
  },
  {
    slug: 'hospitality',
    title: 'Hospitality Staffing',
    icon: 'Hotel',
    description: 'Complete hospitality recruitment lifecycle with structured, professional process that protects brand standards.',
    roles: ['Hospitality General Manager', 'Hospitality Specialist', 'Hospitality Internal Sales Support', 'Hospitality Administrator', 'VP, Hospitality Brand and Marketing', 'Director of Hospitality', 'Supervisor, Hospitality'],
  },
  {
    slug: 'human-resources',
    title: 'Human Resources Staffing',
    icon: 'Users',
    description: 'Align talent strategies to operating plans so HR becomes a strategic engine.',
    roles: ['HR Manager', 'HR Specialist', 'Talent Acquisition Specialist', 'HR Generalist', 'HR Business Partner', 'Director of HR', 'Operations of HR', 'VP of HR', 'People Operations Director'],
  },
  {
    slug: 'logistics',
    title: 'Logistics Staffing',
    icon: 'Truck',
    description: 'Professional logistics recruitment for on‑roll and off‑roll needs—short‑term surges or long‑term programs.',
    roles: ['Logistics Supervisor', 'Procurement & Logistics Analyst', 'Logistics Manager', 'Logistics Scheduler', 'VP Planning & Logistics', 'Logistics Operations Specialist', 'Supply Chain Technician', 'Logistics Operations Analyst', 'Logistics-Project Assistant'],
  },
  {
    slug: 'telecom-technology',
    title: 'Telecom / Technology / ISP Staffing',
    icon: 'Wifi',
    description: 'Telecom and ISP environments demand precision and pace. We staff for network modernization, field operations, and SLAs.',
    roles: ['Telecommunications Engineer', 'Telecommunications Project Manager', 'Telecommunications Specialist', 'Voice-Telecommunications Specialist', 'Project Coordinator III', 'Administrative Project Coordinator', 'Low Voltage Technician', 'Telecom Analyst'],
  },
  {
    slug: 'automobile',
    title: 'Automobile Industry Staffing',
    icon: 'Car',
    description: 'Automotive organizations operate at the intersection of precision, safety, and innovation.',
    roles: ['Quality Engineer (Automotive Supply Chain)', 'Data Engineer', 'Automotive Interiors - Design Engineer', 'Quality Engineer (Tier 1 Automotive / Plastics)', 'Senior QA Engineer', 'Product Development Engineer', 'Automotive Manufacturing Quality Engineer', 'Design Engineer I', 'Supplier Quality Engineer', 'Auto Cad Engineer'],
  },
  {
    slug: 'retail',
    title: 'Retail Staffing Solutions',
    icon: 'ShoppingCart',
    description: 'Retail staffing that succeeds when demand planning meets frontline excellence.',
    roles: ['Store In charge', 'Store Manager', 'Customer Support Specialist', 'Retail Sales Associates', 'Administrative Specialist', 'Retail Merchandiser', 'Retail Project Manager', 'Retail Operations Manager', 'Retail Planner', 'Area Operations Manager'],
  },
  {
    slug: 'government-public-sector',
    title: 'Government & Public Sector (MSP & VMS)',
    icon: 'Building2',
    description: 'We operate effectively within MSP and VMS ecosystems for government and public sector programs.',
    roles: ['Project Manager (Public Sector)', 'Business Analyst (Public Sector)', 'Software Developer', 'QA Analyst', 'Network Engineer', 'Systems Administrator', 'Service Desk Analyst', 'Data Analyst'],
  },
];

// Generate industry pages
industries.forEach((industry) => {
  const filePath = join(process.cwd(), 'app', '(marketing)', 'industries', industry.slug, 'page.tsx');
  const content = generateIndustryPage(industry.slug, industry.title, industry.icon, industry.description, industry.roles);
  writeFileSync(filePath, content, 'utf-8');
  console.log(`✅ Created: ${industry.slug}/page.tsx`);
});

console.log(`\n🎉 Generated ${industries.length} industry pages!`);

