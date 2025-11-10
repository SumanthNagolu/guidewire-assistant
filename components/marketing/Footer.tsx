import Link from "next/link";
import { Facebook, Twitter, Linkedin, Mail, MapPin, Phone } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-wisdom-gray-700 text-white">
      <div className="section-container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Column 1: Solutions */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Solutions</h3>
            <ul className="space-y-2">
              <li><Link href="/solutions/it-staffing" className="text-gray-300 hover:text-success-green transition-colors text-sm">IT Staffing</Link></li>
              <li><Link href="/consulting/services" className="text-gray-300 hover:text-success-green transition-colors text-sm">Consulting</Link></li>
              <li><Link href="/solutions/cross-border" className="text-gray-300 hover:text-success-green transition-colors text-sm">Cross-Border Solutions</Link></li>
              <li><Link href="/solutions/training" className="text-gray-300 hover:text-success-green transition-colors text-sm">Training & Development</Link></li>
              <li><Link href="/contact" className="text-success-green hover:text-success-green-600 font-medium transition-colors text-sm">Request Consultation →</Link></li>
            </ul>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/resources" className="text-gray-300 hover:text-success-green transition-colors text-sm">Blog & Resources</Link></li>
              <li><Link href="/careers" className="text-gray-300 hover:text-success-green transition-colors text-sm">Careers</Link></li>
              <li><Link href="/company/about" className="text-gray-300 hover:text-success-green transition-colors text-sm">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-300 hover:text-success-green transition-colors text-sm">Contact Us</Link></li>
            </ul>
          </div>

          {/* Column 3: USA Office */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              USA Office
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>30 N Gould St Ste R<br />Sheridan, WY 82801</p>
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <a href="tel:+13076502850" className="hover:text-success-green">+1 307-650-2850</a>
              </p>
              <p>
                <a href="mailto:info@intimeesolutions.com" className="hover:text-success-green">
                  info@intimeesolutions.com
                </a>
              </p>
            </div>
          </div>

          {/* Column 4: Canada Office */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              Canada Office
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>330 Gillespie Drive<br />Brantford, ON N3T 0X1</p>
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <a href="tel:+12892369000" className="hover:text-success-green">+1 289-236-9000</a>
              </p>
              <p>
                <a href="mailto:canada@intimeesolutions.com" className="hover:text-success-green">
                  canada@intimeesolutions.com
                </a>
              </p>
            </div>
          </div>

          {/* Column 5: India Office */}
          <div>
            <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              India Office
            </h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>606 DSL Abacus IT Park<br />Uppal, Hyderabad<br />Telangana 500039</p>
              <p className="flex items-center gap-2">
                <Phone className="w-3 h-3" />
                <a href="tel:+917981666144" className="hover:text-success-green">+91 798-166-6144</a>
              </p>
              <p>
                <a href="mailto:india@intimeesolutions.com" className="hover:text-success-green">
                  india@intimeesolutions.com
                </a>
              </p>
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="mt-12 pt-8 border-t border-wisdom-gray-600">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex space-x-4">
              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="bg-wisdom-gray-600 p-2 rounded-full hover:bg-trust-blue transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
              <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="bg-wisdom-gray-600 p-2 rounded-full hover:bg-trust-blue transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="bg-wisdom-gray-600 p-2 rounded-full hover:bg-trust-blue transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="mailto:info@intimeesolutions.com" className="bg-wisdom-gray-600 p-2 rounded-full hover:bg-trust-blue transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
            <div className="text-sm text-gray-400">
              <span className="text-success-green font-medium">Transform Careers. Power Business. Do It InTime.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-wisdom-gray-600">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
            <p>&copy; {new Date().getFullYear()} InTime eSolutions. All rights reserved.</p>
            <p className="mt-2 md:mt-0">
              <span className="text-success-green font-medium">Transform Careers. Power Business. Do It InTime.</span>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

