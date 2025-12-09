import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import axios from 'axios';
import { Eye, EyeOff, ArrowRight, Loader2 } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isLogin && (!formData.name || formData.name.trim().length < 2)) {
      toast.error('Please enter your name');
      return;
    }
    if (!formData.email || !formData.email.includes('@')) {
      toast.error('Please enter a valid email');
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin 
        ? { email: formData.email, password: formData.password }
        : formData;
      
      const response = await axios.post(`${API}${endpoint}`, payload, {
        timeout: 15000
      });
      
      onLogin(response.data.token, response.data.user);
      toast.success(isLogin ? 'Welcome back!' : 'Account created!');
    } catch (error) {
      console.error('Auth error:', error);
      if (error.code === 'ECONNABORTED') {
        toast.error('Connection timeout. Please try again.');
      } else if (!error.response) {
        toast.error('Cannot reach server. Check your connection.');
      } else {
        toast.error(error.response?.data?.detail || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex">
      {/* Left Panel - Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0a0a] via-[#1a1a1a] to-[#0a0a0a]" />
        
        {/* Single subtle accent */}
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl" />
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-16 xl:px-24">
          {/* Logo/Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-6xl xl:text-7xl font-bold tracking-tight text-white mb-4">
              Growth
            </h1>
            <div className="h-1 w-20 bg-gradient-to-r from-amber-400 to-amber-600 mb-8" />
          </motion.div>

          {/* Tagline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-2xl xl:text-3xl text-gray-300 font-light leading-relaxed mb-12 max-w-lg"
          >
            Transform your habits.
            <br />
            <span className="text-white font-medium">Transform your life.</span>
          </motion.p>

          {/* Quote */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="border-l-2 border-amber-500/50 pl-6 max-w-md"
          >
            <p className="text-gray-400 text-lg italic mb-3">
              "We are what we repeatedly do. Excellence, then, is not an act, but a habit."
            </p>
            <p className="text-amber-500 text-sm font-medium">— Aristotle</p>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="mt-16 flex gap-12"
          >
            <div>
              <p className="text-3xl font-bold text-white">10K+</p>
              <p className="text-sm text-gray-500">Active Users</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">1M+</p>
              <p className="text-sm text-gray-500">Habits Tracked</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">95%</p>
              <p className="text-sm text-gray-500">Success Rate</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel - Auth Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          {/* Mobile Logo */}
          <div className="lg:hidden mb-12 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Growth</h1>
            <p className="text-gray-500">Transform your habits</p>
          </div>

          {/* Header */}
          <div className="mb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={isLogin ? 'login' : 'register'}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <h2 className="text-3xl font-semibold text-white mb-2">
                  {isLogin ? 'Welcome back' : 'Create account'}
                </h2>
                <p className="text-gray-500">
                  {isLogin 
                    ? 'Enter your credentials to continue' 
                    : 'Start your transformation journey'}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence mode="wait">
              {!isLogin && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Label htmlFor="name" className="text-gray-300 text-sm font-medium mb-2 block">
                    Name
                  </Label>
                  <Input
                    id="name"
                    type="text"
                    data-testid="name-input"
                    placeholder="Your name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="h-12 bg-[#141414] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 rounded-lg"
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <Label htmlFor="email" className="text-gray-300 text-sm font-medium mb-2 block">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                data-testid="email-input"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 bg-[#141414] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 rounded-lg"
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-gray-300 text-sm font-medium mb-2 block">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  data-testid="password-input"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="h-12 bg-[#141414] border-[#2a2a2a] text-white placeholder:text-gray-600 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/20 rounded-lg pr-12"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              data-testid="auth-submit-button"
              disabled={loading}
              className="w-full h-12 bg-amber-500 hover:bg-amber-400 text-black font-semibold rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  {isLogin ? 'Sign in' : 'Create account'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Toggle Auth Mode */}
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setFormData({ email: '', password: '', name: '' });
              }}
              data-testid="toggle-auth-mode"
              className="text-gray-500 hover:text-gray-300 transition-colors text-sm"
            >
              {isLogin ? (
                <>Don't have an account? <span className="text-amber-500 font-medium">Sign up</span></>
              ) : (
                <>Already have an account? <span className="text-amber-500 font-medium">Sign in</span></>
              )}
            </button>
          </div>

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-gray-600">
              By continuing, you agree to our Terms of Service and Privacy Policy
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AuthPage;
