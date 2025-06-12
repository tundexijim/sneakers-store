import React, { useEffect, useState } from "react";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";
import { useIsClient } from "@/hooks/useIsClient";

const Footer = () => {
  const isClient = useIsClient();
  const [year, setYear] = useState<number | null>(null);
  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  if (!isClient) return null;

  return (
    <footer className="bg-black text-white">
      {/* Newsletter Section */}
      <div className="border-b border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="text-center max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold mb-4">Stay In The Loop</h3>
            <p className="text-gray-300 mb-6">
              Get exclusive access to new releases, limited drops, and special
              offers.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent text-white placeholder-gray-400"
              />
              <button className="px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-gray-200 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand & Contact Info */}
          <div className="lg:col-span-1">
            <h2 className="text-2xl font-bold mb-4">DTWEARS</h2>
            <p className="text-gray-300 mb-6 text-sm leading-relaxed">
              Your ultimate destination for authentic sneakers. From classic
              retros to the latest drops, we've got your feet covered.
            </p>

            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-gray-400" />
                <span className="text-gray-300">
                  30, Wendey Garba Street, Arepo, Ogun state
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-gray-400" />
                <span className="text-gray-300">08062474452</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">Quick Links</h4>
            <ul className="space-y-3 text-sm">
              {["New Arrivals", "Best Sellers", , "Brands", "Size Guide"].map(
                (link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-gray-300 hover:text-white transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                )
              )}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">Customer Service</h4>
            <ul className="space-y-3 text-sm">
              {[
                "Contact Us",
                "FAQ",
                "Shipping Info",
                "Returns & Exchanges",
                "Size Guide",
              ].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* About & Social */}
          <div>
            <h4 className="font-semibold mb-6 text-lg">About DTWEARS</h4>
            <ul className="space-y-3 text-sm mb-6">
              {["Our Story", "Press", "Privacy Policy"].map((link) => (
                <li key={link}>
                  <a
                    href="#"
                    className="text-gray-300 hover:text-white transition-colors"
                  >
                    {link}
                  </a>
                </li>
              ))}
            </ul>

            <div>
              <h5 className="font-semibold mb-4">Follow Us</h5>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, label: "Instagram" },
                  { icon: Facebook, label: "Facebook" },
                  { icon: Twitter, label: "Twitter" },
                  { icon: Youtube, label: "YouTube" },
                ].map(({ icon: Icon, label }) => (
                  <a
                    key={label}
                    href="#"
                    aria-label={label}
                    className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors"
                  >
                    <Icon size={18} />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Payment Methods & Copyright */}
      <div className="border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            {/* Payment Methods */}
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-400">We Accept:</span>
              <img src="/paystack.png" alt="Paystack" className="w-[300px]" />
            </div>

            {/* Copyright */}
            <div className="text-sm text-gray-400 text-center md:text-right">
              <p>&copy; {year} DTWEARS. All rights reserved.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
