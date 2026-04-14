import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router-dom';
import { Mail, Globe, Clock, Send, CheckCircle } from 'lucide-react';
import Footer from '../../components/Footer';
import { tickets as ticketsApi } from '../../lib/api';

const CONTACT_INFO = [
  { icon: Mail, title: 'Email', detail: 'support@pathwise.fit', href: 'mailto:support@pathwise.fit' },
  { icon: Globe, title: 'Website', detail: 'pathwise.fit', href: 'https://pathwise.fit' },
  { icon: Clock, title: 'Response Time', detail: 'Within 24 hours', href: '' },
];

export default function ContactPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', subject: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.message) return;
    setSending(true);
    setError('');
    try {
      await ticketsApi.submit({
        name: `${form.firstName} ${form.lastName}`.trim(),
        email: form.email,
        subject: form.subject || undefined,
        message: form.message,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <section className="bg-[var(--surface)] min-h-screen">
        <div className="max-w-6xl mx-auto px-6 pt-[calc(72px+3rem)] pb-20">

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-start">

            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="pt-2"
            >
              <motion.span
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 }}
                className="inline-block text-xs font-semibold uppercase tracking-[0.15em] text-[#6245a4] bg-[#6245a4]/8 px-4 py-1.5 rounded-full mb-5 border border-[#6245a4]/10"
              >
                Get in Touch
              </motion.span>

              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="font-[var(--font-display)] text-4xl sm:text-5xl font-bold text-gray-900 tracking-tight leading-tight mb-4"
              >
                Contact Us
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="text-base text-gray-500 leading-relaxed mb-10 max-w-[440px]"
              >
                Have a question, feedback, or partnership opportunity? We'd love to hear from you. Reach out and we'll respond promptly.
              </motion.p>

              {/* Contact details */}
              <div className="space-y-4">
                {CONTACT_INFO.map((info, i) => {
                  const Icon = info.icon;
                  const content = (
                    <motion.div
                      key={info.title}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                      className="flex items-center gap-4 p-4 rounded-xl border border-gray-200 bg-white hover:border-[#6245a4]/20 transition-all duration-200 group"
                    >
                      <div className="w-11 h-11 rounded-xl bg-[#6245a4]/8 border border-[#6245a4]/10 flex items-center justify-center flex-shrink-0 group-hover:bg-[#6245a4] group-hover:text-white transition-colors duration-200">
                        <Icon size={18} className="text-[#6245a4] group-hover:text-white" />
                      </div>
                      <div>
                        <div className="text-[11px] font-medium text-gray-400 uppercase tracking-[0.12em] mb-0.5">
                          {info.title}
                        </div>
                        <div className="text-sm font-medium text-gray-800 group-hover:text-[#6245a4] transition-colors duration-200">
                          {info.detail}
                        </div>
                      </div>
                    </motion.div>
                  );

                  return info.href ? (
                    <a key={info.title} href={info.href} className="block no-underline">
                      {content}
                    </a>
                  ) : (
                    <div key={info.title}>{content}</div>
                  );
                })}
              </div>

              {/* Decorative accent */}
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="origin-left h-px w-full max-w-[200px] bg-gradient-to-r from-[#6245a4]/20 to-transparent mt-10"
              />
            </motion.div>

            {/* Right: Form card */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="bg-white border border-gray-200 rounded-2xl p-8 sm:p-10 shadow-lg shadow-gray-900/5"
            >
              <AnimatePresence mode="wait">
                {submitted ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="text-center py-14"
                  >
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.15 }}
                      className="w-18 h-18 rounded-full bg-emerald-50 border border-emerald-100 flex items-center justify-center mx-auto mb-6"
                    >
                      <CheckCircle size={36} className="text-emerald-500" />
                    </motion.div>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.35, duration: 0.4 }}
                    >
                      <h2 className="font-[var(--font-display)] text-2xl font-bold text-gray-900 mb-2">
                        Message Sent!
                      </h2>
                      <p className="text-sm text-gray-500 mb-6 max-w-[280px] mx-auto leading-relaxed">
                        Thanks for reaching out. We'll get back to you within 24 hours.
                      </p>
                      <Link
                        to="/"
                        className="inline-flex items-center gap-1.5 text-sm text-[#6245a4] font-semibold no-underline hover:underline transition-all"
                      >
                        Back to Home
                      </Link>
                    </motion.div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <h2 className="font-[var(--font-display)] text-xl font-bold text-gray-900 mb-1">
                      Send Us a Message
                    </h2>
                    <p className="text-sm text-gray-400 mb-8">
                      Fill out the form and we'll get back to you within 24 hours.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">First Name</label>
                          <input
                            type="text"
                            value={form.firstName}
                            onChange={set('firstName')}
                            placeholder="John"
                            className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6245a4] focus:ring-2 focus:ring-[#6245a4]/10 focus:bg-white transition-all duration-200 placeholder:text-gray-300"
                          />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-sm font-medium text-gray-700">Last Name</label>
                          <input
                            type="text"
                            value={form.lastName}
                            onChange={set('lastName')}
                            placeholder="Doe"
                            className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6245a4] focus:ring-2 focus:ring-[#6245a4]/10 focus:bg-white transition-all duration-200 placeholder:text-gray-300"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          Email <span className="text-red-400">*</span>
                        </label>
                        <input
                          type="email"
                          value={form.email}
                          onChange={set('email')}
                          placeholder="john@example.com"
                          required
                          className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6245a4] focus:ring-2 focus:ring-[#6245a4]/10 focus:bg-white transition-all duration-200 placeholder:text-gray-300"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">Subject</label>
                        <input
                          type="text"
                          value={form.subject}
                          onChange={set('subject')}
                          placeholder="How can we help?"
                          className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6245a4] focus:ring-2 focus:ring-[#6245a4]/10 focus:bg-white transition-all duration-200 placeholder:text-gray-300"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-sm font-medium text-gray-700">
                          Message <span className="text-red-400">*</span>
                        </label>
                        <textarea
                          value={form.message}
                          onChange={set('message')}
                          placeholder="Tell us more about your question or feedback..."
                          required
                          rows={5}
                          className="w-full px-4 py-2.5 bg-gray-50/80 border border-gray-200 rounded-xl text-sm text-gray-900 outline-none focus:border-[#6245a4] focus:ring-2 focus:ring-[#6245a4]/10 focus:bg-white transition-all duration-200 resize-y min-h-[120px] placeholder:text-gray-300"
                        />
                      </div>

                      <AnimatePresence>
                        {error && (
                          <motion.div
                            initial={{ opacity: 0, y: -8, height: 0 }}
                            animate={{ opacity: 1, y: 0, height: 'auto' }}
                            exit={{ opacity: 0, y: -8, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-4 py-3 bg-red-50 border border-red-200/80 rounded-xl text-sm text-red-600 font-medium"
                          >
                            {error}
                          </motion.div>
                        )}
                      </AnimatePresence>

                      <motion.button
                        type="submit"
                        disabled={sending}
                        whileHover={{ scale: sending ? 1 : 1.01 }}
                        whileTap={{ scale: sending ? 1 : 0.98 }}
                        className="btn btn-primary w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      >
                        {sending ? (
                          <span className="flex items-center gap-2">
                            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          <>
                            <Send size={15} />
                            Send Message
                          </>
                        )}
                      </motion.button>
                    </form>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        </div>
      </section>
      <Footer />
    </>
  );
}
