"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";
import UserMenu from "./UserMenu";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // Dynamic second word based on current page
  const getSecondWord = () => {
    if (pathname?.startsWith('/academy')) return 'Academy';
    if (pathname?.startsWith('/resources')) return 'Resources';
    if (pathname?.startsWith('/careers')) return 'Careers';
    if (pathname?.startsWith('/industries')) return 'Industries';
    if (pathname?.startsWith('/solutions')) return 'Solutions';
    if (pathname?.startsWith('/consulting')) return 'Consulting';
    if (pathname?.startsWith('/company')) return 'Company';
    if (pathname?.startsWith('/contact')) return 'Contact';
    return 'eSolutions';
  };

    return (
    <nav className="bg-gradient-to-r from-trust-blue via-trust-blue-600 to-success-green sticky top-0 z-50 shadow-lg backdrop-blur-sm">
      <div className="section-container">
        <div className="flex items-center h-20">
          {/* Logo */}
                  <Link href="/" className="flex items-center gap-3">
                    <img 
                      src="/logo6.png" 
                      alt="InTime Logo" 
                      className="h-12 w-auto"
                    />
            <div className="flex items-center h-12">
              <div className="text-3xl font-heading leading-none">
                <span className="text-white font-bold">InTime</span>{" "}
                <span className="text-innovation-orange font-light">{getSecondWord()}</span>
              </div>
            </div>
          </Link>
          
          {/* Spacer to push nav to right */}
          <div className="flex-1"></div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Solutions Dropdown */}
            <div className="relative group">
              <Link href="/solutions" className="flex items-center space-x-1 text-white hover:text-innovation-orange font-bold transition-colors">
                <span>Solutions</span>
                <ChevronDown className="w-4 h-4" />
              </Link>
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-4">
                {/* Nested Staffing Menu */}
                <div className="relative group/staffing">
                  <Link href="/solutions/it-staffing" className="flex items-center justify-between px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                    <span className="font-medium">Staffing</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  {/* Staffing Flyout Menu */}
                  <div className="absolute left-full top-0 ml-1 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover/staffing:opacity-100 group-hover/staffing:visible transition-all duration-300 py-4 z-50">
                    <Link href="/solutions/it-staffing#contract" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                      Contract Staffing
                    </Link>
                    <Link href="/solutions/it-staffing#contract-to-hire" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                      Contract-to-Hire
                    </Link>
                    <Link href="/solutions/it-staffing#direct-placement" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                      Direct Placement
                    </Link>
                  </div>
                </div>
                
                {/* Nested Consulting Menu */}
                <div className="relative group/consulting">
                  <Link href="/consulting" className="flex items-center justify-between px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                    <span className="font-medium">Consulting</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                  
                  {/* Consulting Flyout Menu */}
                  <div className="absolute left-full top-0 ml-1 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover/consulting:opacity-100 group-hover/consulting:visible transition-all duration-300 py-4 z-50">
                    <Link href="/consulting/competencies" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                      Our Competencies
                    </Link>
                    <Link href="/consulting/services" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                      Our Services
                    </Link>
                  </div>
                </div>

                <Link href="/solutions/cross-border" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Cross-Border Solutions
                </Link>
                <Link href="/solutions/training" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Training & Development
                </Link>
              </div>
            </div>

            {/* Industries Dropdown */}
            <div className="relative group">
              <Link href="/industries" className="flex items-center space-x-1 text-white hover:text-innovation-orange font-bold transition-colors">
                <span>Industries</span>
                <ChevronDown className="w-4 h-4" />
              </Link>
              <div className="absolute top-full left-0 mt-2 w-72 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-4 max-h-[80vh] overflow-y-auto">
                <Link href="/industries/information-technology" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Information Technology
                </Link>
                <Link href="/industries/healthcare" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Healthcare
                </Link>
                <Link href="/industries/engineering" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Engineering
                </Link>
                <Link href="/industries/manufacturing" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Manufacturing & Production
                </Link>
                <Link href="/industries/financial-accounting" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Financial & Accounting
                </Link>
                <Link href="/industries/ai-ml-data" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  AI/ML & Data Talent
                </Link>
                <Link href="/industries/legal" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Legal
                </Link>
                <Link href="/industries/warehouse-distribution" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Warehouse & Distribution
                </Link>
                <Link href="/industries/logistics" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Logistics
                </Link>
                <Link href="/industries/hospitality" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Hospitality
                </Link>
                <Link href="/industries/human-resources" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Human Resources
                </Link>
                <Link href="/industries/telecom-technology" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Telecom / Technology / ISP
                </Link>
                <Link href="/industries/automobile" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Automobile
                </Link>
                <Link href="/industries/retail" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Retail
                </Link>
                <Link href="/industries/government-public-sector" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Government & Public Sector
                </Link>
              </div>
            </div>

            {/* Careers Dropdown */}
            <div className="relative group">
              <Link href="/careers" className="flex items-center space-x-1 text-white hover:text-innovation-orange font-bold transition-colors">
                <span>Careers</span>
                <ChevronDown className="w-4 h-4" />
              </Link>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-4 z-50">
                <Link href="/careers/join-our-team" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Join Our Team
                </Link>
                <Link href="/careers/open-positions" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Open Positions
                </Link>
                <Link href="/careers/available-talent" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Available Talent
                </Link>
              </div>
            </div>

            <Link href="/resources" className="text-white hover:text-innovation-orange font-bold transition-colors">
              Resources
            </Link>

            <Link href="/academy" className="text-white hover:text-innovation-orange font-bold transition-colors">
              Academy
            </Link>

            {/* User Menu with same spacing */}
            <UserMenu />
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-white hover:bg-white/10"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-trust-blue-700 border-t border-white/10">
          <div className="section-container py-6 space-y-4">
            <Link href="/solutions/it-staffing" className="block text-white hover:text-innovation-orange font-bold">
              IT Staffing
            </Link>
            <Link href="/solutions/consulting" className="block text-white hover:text-innovation-orange font-bold">
              Consulting
            </Link>
            <Link href="/solutions/cross-border" className="block text-white hover:text-innovation-orange font-bold">
              Cross-Border Solutions
            </Link>
            <Link href="/solutions/training" className="block text-white hover:text-innovation-orange font-bold">
              Training & Development
            </Link>
            
            <div>
              <div className="text-white font-bold mb-2 text-sm uppercase tracking-wider">Careers</div>
              <div className="pl-4 space-y-2">
                <Link href="/careers/join-our-team" className="block text-white hover:text-innovation-orange font-bold text-sm">
                  Join Our Team
                </Link>
                <Link href="/careers/open-positions" className="block text-white hover:text-innovation-orange font-bold text-sm">
                  Open Positions
                </Link>
                <Link href="/careers/available-talent" className="block text-white hover:text-innovation-orange font-bold text-sm">
                  Available Talent
                </Link>
              </div>
            </div>
            
            <Link href="/resources" className="block text-white hover:text-innovation-orange font-bold">
              Resources
            </Link>
            <Link href="/academy" className="block text-white hover:text-innovation-orange font-bold">
              Academy
            </Link>
            <Link href="/contact" className="block btn-primary text-center text-sm mt-4">
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

