"use client";

import Link from "next/link";
import { useState } from "react";
import { ChevronDown, Menu, X } from "lucide-react";

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="section-container">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="text-2xl font-heading font-bold text-trust-blue">
              InTime <span className="font-light">eSolutions</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center space-x-8">
            {/* Solutions Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-wisdom-gray hover:text-trust-blue font-medium transition-colors">
                <span>Solutions</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-4">
                <Link href="/solutions/it-staffing" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  IT Staffing
                </Link>
                <Link href="/solutions/consulting" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Consulting
                </Link>
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
              <button className="flex items-center space-x-1 text-wisdom-gray hover:text-trust-blue font-medium transition-colors">
                <span>Industries</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-4">
                <Link href="/industries/information-technology" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Information Technology
                </Link>
                <Link href="/industries/healthcare" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Healthcare
                </Link>
                <Link href="/industries/financial-services" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Financial Services
                </Link>
                <Link href="/industries" className="block px-6 py-2 text-sm font-medium text-trust-blue hover:bg-gray-50">
                  View All Industries →
                </Link>
              </div>
            </div>

            <Link href="/academy" className="text-wisdom-gray hover:text-trust-blue font-medium transition-colors">
              Academy
            </Link>

            {/* Resources Dropdown */}
            <div className="relative group">
              <button className="flex items-center space-x-1 text-wisdom-gray hover:text-trust-blue font-medium transition-colors">
                <span>Resources</span>
                <ChevronDown className="w-4 h-4" />
              </button>
              <div className="absolute top-full left-0 mt-2 w-64 bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 py-4">
                <Link href="/resources/blog" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Blog
                </Link>
                <Link href="/resources/salary-guides" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Salary Guides
                </Link>
                <Link href="/resources/success-stories" className="block px-6 py-2 text-sm text-wisdom-gray hover:bg-gray-50 hover:text-trust-blue">
                  Success Stories
                </Link>
              </div>
            </div>

            <Link href="/company/about" className="text-wisdom-gray hover:text-trust-blue font-medium transition-colors">
              Company
            </Link>

            <Link href="/careers" className="text-wisdom-gray hover:text-trust-blue font-medium transition-colors">
              Careers
            </Link>
          </div>

          {/* CTA Button */}
          <div className="hidden lg:block">
            <Link href="/contact" className="btn-primary text-sm">
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-md text-wisdom-gray hover:bg-gray-100"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-200">
          <div className="section-container py-6 space-y-4">
            <Link href="/solutions/it-staffing" className="block text-wisdom-gray hover:text-trust-blue font-medium">
              IT Staffing
            </Link>
            <Link href="/solutions/consulting" className="block text-wisdom-gray hover:text-trust-blue font-medium">
              Consulting
            </Link>
            <Link href="/solutions/cross-border" className="block text-wisdom-gray hover:text-trust-blue font-medium">
              Cross-Border Solutions
            </Link>
            <Link href="/solutions/training" className="block text-wisdom-gray hover:text-trust-blue font-medium">
              Training & Development
            </Link>
            <Link href="/academy" className="block text-wisdom-gray hover:text-trust-blue font-medium">
              Academy
            </Link>
            <Link href="/careers" className="block text-wisdom-gray hover:text-trust-blue font-medium">
              Careers
            </Link>
            <Link href="/company/about" className="block text-wisdom-gray hover:text-trust-blue font-medium">
              About Us
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

