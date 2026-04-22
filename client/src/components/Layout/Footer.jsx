/**
 * @file client/src/components/Layout/Footer.jsx
 * @description Premium footer component with brand info, quick links, legal links, and contact info.
 * Uses React Router Link for all internal navigation (no page reloads).
 * Theme: Indigo Blue (#7C8BF2) + Lavender (#DFE1F2)
 */

import { Link } from 'react-router-dom';
import {
  FaFacebook, FaTwitter, FaInstagram, FaYoutube,
  FaEnvelope, FaPhoneAlt, FaMapMarkerAlt,
} from 'react-icons/fa';

function Footer() {
  return (
    <footer className="bg-[#F0F1FE] text-gray-700 mt-16">
      {/* Main footer grid */}
      <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

        {/* Column 1: Brand */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <img src="/logo.png" alt="K_M_Cart" className="w-8 h-8 rounded-lg shadow-sm" />
            <h3 className="text-gray-900 font-bold text-xl">K_M_Cart</h3>
          </div>
          <p className="text-sm text-gray-600 mb-4 leading-relaxed">
            Your AI-powered smart shopping destination. Find the best products at the best prices with our intelligent assistant.
          </p>
          {/* Social media icons */}
          <div className="flex gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 bg-[#7C8BF2] hover:bg-blue-600 text-white rounded-full flex items-center justify-center transition-colors">
              <FaFacebook size={16} />
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 bg-[#7C8BF2] hover:bg-sky-500 text-white rounded-full flex items-center justify-center transition-colors">
              <FaTwitter size={16} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 bg-[#7C8BF2] hover:bg-pink-600 text-white rounded-full flex items-center justify-center transition-colors">
              <FaInstagram size={16} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer"
               className="w-9 h-9 bg-[#7C8BF2] hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors">
              <FaYoutube size={16} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h4 className="text-gray-900 font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/" className="text-gray-600 hover:text-[#7C8BF2] hover:underline transition-colors">Home</Link></li>
            <li><Link to="/products" className="text-gray-600 hover:text-[#7C8BF2] hover:underline transition-colors">All Products</Link></li>
            <li><Link to="/orders" className="text-gray-600 hover:text-[#7C8BF2] hover:underline transition-colors">My Orders</Link></li>
            <li><Link to="/contact" className="text-gray-600 hover:text-[#7C8BF2] hover:underline transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        {/* Column 3: Legal */}
        <div>
          <h4 className="text-gray-900 font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <Link to="/privacy-policy" className="text-gray-600 hover:text-[#7C8BF2] hover:underline transition-colors">
                Privacy Policy
              </Link>
            </li>
            <li>
              <Link to="/terms-of-service" className="text-gray-600 hover:text-[#7C8BF2] hover:underline transition-colors">
                Terms of Service
              </Link>
            </li>
            <li>
              <Link to="/contact" className="text-gray-600 hover:text-[#7C8BF2] hover:underline transition-colors">
                Contact Us
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Contact Info */}
        <div>
          <h4 className="text-gray-900 font-semibold mb-4">Contact</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-start gap-2">
              <FaMapMarkerAlt className="mt-0.5 text-[#7C8BF2] flex-shrink-0" size={14} />
              <span className="text-gray-600">Mettuthirukkampuliyur, Thirukkampuliyur, K.R.Puram, Karur</span>
            </li>
            <li className="flex items-center gap-2">
              <FaPhoneAlt className="text-[#7C8BF2] flex-shrink-0" size={14} />
              <span className="text-gray-600">+91 86103 26514</span>
            </li>
            <li className="flex items-center gap-2">
              <FaEnvelope className="text-[#7C8BF2] flex-shrink-0" size={14} />
              <span className="text-gray-600">mohandhassgovind@gmail.com</span>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-[#DFE1F2] py-4 text-center text-xs text-gray-500">
        <p>© {new Date().getFullYear()} K_M_Cart. All rights reserved. | Made with care in India 🇮🇳</p>
      </div>
    </footer>
  );
}

export default Footer;
