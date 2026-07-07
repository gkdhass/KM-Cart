/**
 * @file client/src/pages/ContactUs.jsx
 * @description Contact Us page with contact info and EmailJS-powered contact form.
 * Route: /contact
 * 
 * EmailJS Configuration:
 * - Public Key: DvGqqb5LgEqqsIZF7
 * - Service ID: service_thw34pu
 * - Template ID: template_x14cx9p
 */

import { useState } from 'react';
import { Link } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import {
  FaArrowLeft, FaMapMarkerAlt, FaPhoneAlt, FaEnvelope,
  FaClock, FaPaperPlane, FaCheckCircle, FaSpinner,
} from 'react-icons/fa';

// EmailJS Configuration
const EMAILJS_PUBLIC_KEY = 'DvGqqb5LgEqqsIZF7';
const EMAILJS_SERVICE_ID = 'service_thw34pu';
const EMAILJS_TEMPLATE_ID = 'template_x14cx9p';

function ContactUs() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    // Validate form fields
    if (!form.name.trim() || !form.email.trim() || !form.subject.trim() || !form.message.trim()) {
      setError('Please fill in all fields.');
      return;
    }

    // Validate email format
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoading(true);

    try {
      // Send email via EmailJS
      // Template variables should match your EmailJS template placeholders
      const templateParams = {
        from_name: form.name,
        from_email: form.email,
        subject: form.subject,
        message: form.message,
        to_name: 'K_M_Cart Team', // Replace with your name/team name
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('EmailJS response:', response);

      if (response.status === 200) {
        setSuccess(true);
        setForm({ name: '', email: '', subject: '', message: '' });
        
        // Auto-hide success message after 5 seconds
        setTimeout(() => setSuccess(false), 5000);
      } else {
        throw new Error('Email send failed');
      }
    } catch (err) {
      console.error('EmailJS error:', err);
      setError('Failed to send message. Please try again or contact us directly at mohandhassgovind@gmail.com');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 py-10 page-enter">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Back button */}
        <Link to="/" className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 mb-6 transition-colors">
          <FaArrowLeft size={12} /> Back to Home
        </Link>

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Contact Us</h1>
          <p className="text-gray-500 max-w-lg mx-auto">
            Have a question or feedback? We'd love to hear from you. Reach out using any method below.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* ── LEFT: Contact Info ──────────────────────────────────── */}
          <div className="space-y-6">
            {/* Info cards */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Get in Touch</h2>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <FaMapMarkerAlt size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Address</h3>
                  <p className="text-sm text-gray-500">Mettuthirukkampuliyur, Thirukkampuliyur, K.R.Puram, Karur, Tamil Nadu, India</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <FaPhoneAlt size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Phone</h3>
                  <p className="text-sm text-gray-500">+91 86103 26514</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <FaEnvelope size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Email</h3>
                  <p className="text-sm text-gray-500">mohandhassgovind@gmail.com</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center flex-shrink-0">
                  <FaClock size={16} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-800">Business Hours</h3>
                  <p className="text-sm text-gray-500">Mon - Sat: 9:00 AM - 8:00 PM IST</p>
                  <p className="text-sm text-gray-500">Sun: 10:00 AM - 6:00 PM IST</p>
                </div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center">
                  <FaMapMarkerAlt className="text-3xl text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 font-medium">Map Coming Soon</p>
                  <p className="text-xs text-gray-400">K.R.Puram, Karur, Tamil Nadu, India</p>
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Contact Form ────────────────────────────────── */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
            <h2 className="text-lg font-semibold text-gray-900 mb-5">Send us a Message</h2>

            {/* Success message */}
            {success && (
              <div className="mb-5 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-3">
                <FaCheckCircle className="text-lg flex-shrink-0" />
                <div>
                  <p className="font-semibold text-sm">Message sent successfully!</p>
                  <p className="text-xs mt-0.5">We'll get back to you within 24 hours.</p>
                </div>
              </div>
            )}

            {/* Error message */}
            {error && (
              <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Your Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900
                             placeholder:text-gray-400 outline-none transition-all
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="your@email.com"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900
                             placeholder:text-gray-400 outline-none transition-all
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Subject <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  placeholder="How can we help?"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900
                             placeholder:text-gray-400 outline-none transition-all
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Message <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  rows="4"
                  placeholder="Tell us what's on your mind..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900
                             placeholder:text-gray-400 outline-none transition-all resize-none
                             focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold
                           rounded-xl transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed
                           shadow-lg shadow-indigo-200 flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <FaSpinner className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <FaPaperPlane /> Send Message
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ContactUs;
