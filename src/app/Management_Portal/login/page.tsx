'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';

const BRAND_COLORS = {
  darkNavy: '#0B1C3D',
  darkRoyalBlue: '#1E3A8A',
  deepRed: '#B11217',
  white: '#FFFFFF',
  lightGrey: '#F4F6F8',
  softGrey: '#E5E7EB',
  darkGrey: '#1F2933',
  charcoal: '#111111',
  teal: '#14B8A6'
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    await new Promise(resolve => setTimeout(resolve, 800));

    if (email === 'nesticktech@gmail.com' && password === '123456') {
      sessionStorage.setItem('isAuthenticated', 'true');
      sessionStorage.setItem('userEmail', email);
      router.push('/Management_Portal');
    } else {
      setError('Invalid email or password');
    }
    setIsLoading(false);
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: `linear-gradient(135deg, ${BRAND_COLORS.darkNavy} 0%, ${BRAND_COLORS.darkRoyalBlue} 100%)` }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full"
      >
        <div 
          className="rounded-xl shadow-xl overflow-hidden"
          style={{ backgroundColor: BRAND_COLORS.white }}
        >
          {/* Header with Logo */}
          <motion.div 
            className="py-5 px-6 text-center"
            style={{ backgroundColor: BRAND_COLORS.deepRed }}
          >
            <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 border-2 border-white shadow-lg">
              <Image
                src="/newlogo.jpg"
                alt="Mansol Logo"
                width={64}
                height={64}
                className="w-full h-full object-cover"
              />
            </div>
            <h1 className="text-xl font-bold" style={{ color: BRAND_COLORS.white }}>Mansol LMS</h1>
            <p className="text-xs mt-0.5" style={{ color: `${BRAND_COLORS.white}cc` }}>Management Portal</p>
          </motion.div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-2 rounded-lg"
                  style={{ backgroundColor: `${BRAND_COLORS.deepRed}10`, border: `1px solid ${BRAND_COLORS.deepRed}30` }}
                >
                  <p className="text-xs text-center" style={{ color: BRAND_COLORS.deepRed }}>{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: BRAND_COLORS.charcoal }}>Email Address</label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: BRAND_COLORS.softGrey }} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-opacity-50 transition-all"
                  style={{ borderColor: BRAND_COLORS.softGrey, backgroundColor: BRAND_COLORS.white }}
                  onFocus={(e) => e.target.style.borderColor = BRAND_COLORS.deepRed}
                  onBlur={(e) => e.target.style.borderColor = BRAND_COLORS.softGrey}
                  required
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-medium mb-1" style={{ color: BRAND_COLORS.charcoal }}>Password</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: BRAND_COLORS.softGrey }} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-9 pr-9 py-1.5 text-sm border rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ borderColor: BRAND_COLORS.softGrey, backgroundColor: BRAND_COLORS.white }}
                  onFocus={(e) => e.target.style.borderColor = BRAND_COLORS.deepRed}
                  onBlur={(e) => e.target.style.borderColor = BRAND_COLORS.softGrey}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                >
                  {showPassword ? <EyeOff size={16} style={{ color: BRAND_COLORS.softGrey }} /> : <Eye size={16} style={{ color: BRAND_COLORS.softGrey }} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <motion.button
              type="submit"
              disabled={isLoading}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-2 rounded-lg text-white font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
              style={{ backgroundColor: BRAND_COLORS.deepRed }}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </>
              ) : (
                <>
                  <LogIn size={16} />
                  Login to Dashboard
                </>
              )}
            </motion.button>

            {/* Demo Credentials */}
            <div className="mt-3 p-2 rounded-lg text-center" style={{ backgroundColor: BRAND_COLORS.lightGrey }}>
              <p className="text-xs" style={{ color: BRAND_COLORS.darkGrey }}>Demo Credentials:</p>
              <p className="text-xs font-mono mt-0.5" style={{ color: BRAND_COLORS.charcoal }}>nesticktech@gmail.com / 123456</p>
            </div>
          </form>

          {/* Footer */}
          <div className="py-2 text-center border-t" style={{ borderColor: BRAND_COLORS.softGrey }}>
            <p className="text-xs" style={{ color: BRAND_COLORS.darkGrey }}>© 2024 Mansol LMS. All rights reserved.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}