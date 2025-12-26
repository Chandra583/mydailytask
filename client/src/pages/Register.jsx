import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import Particles from '../components/Particles';

/**
 * Modern Register Page with 3D Ballpit Animation
 */
const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const { register, googleLogin } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    const result = await register(formData.username, formData.email, formData.password);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }

    setLoading(false);
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    const result = await googleLogin(credentialResponse);

    if (result.success) {
      toast.success('Account created successfully!');
      navigate('/dashboard');
    } else {
      toast.error(result.message);
    }
    setLoading(false);
  };

  const handleGoogleError = () => {
    toast.error('Google signup failed. Please try again.');
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0e27]">
      
      {/* Animated Particles Background */}
      <div className="absolute inset-0 z-0">
        <Particles
          particleColors={['#ff1744', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5']}
          particleCount={200}
          particleSpread={10}
          speed={0.1}
          particleBaseSize={100}
          moveParticlesOnHover={true}
          alphaParticles={false}
          disableRotation={false}
        />
      </div>

      {/* Overlay for better readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#0a0e27]/60 via-[#0a0e27]/80 to-[#0a0e27]/90 z-10" />

      {/* Register Content */}
      <div className="relative z-20 min-h-screen flex items-center justify-center p-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-8">
            <motion.h1
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-5xl font-bold mb-3 bg-gradient-to-r from-pink-500 via-rose-500 to-purple-600 bg-clip-text text-transparent"
            >
              Daily Task Tracker
            </motion.h1>
            <motion.h2
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-3xl font-bold text-white mb-2"
            >
              Create Account
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-gray-400"
            >
              Start your productivity journey today
            </motion.p>
          </div>

          {/* Glassmorphism Card */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5 }}
            className="relative backdrop-blur-xl bg-white/5 rounded-3xl p-8 border border-white/10 shadow-2xl"
          >
            {/* Decorative gradient orbs */}
            <div className="absolute -top-20 -left-20 w-40 h-40 bg-pink-500/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Google Sign Up */}
              <div className="flex justify-center mb-6">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  theme="filled_black"
                  size="large"
                  text="signup_with"
                  shape="rectangular"
                  width="100%"
                />
              </div>

              {/* Divider */}
              <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-white/20" />
                <span className="flex-shrink mx-4 text-gray-400 text-sm font-medium">
                  OR
                </span>
                <div className="flex-grow border-t border-white/20" />
              </div>

              {/* Register Form */}
              <form onSubmit={handleSubmit}>
                {/* Username Input */}
                <div className="mb-4">
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <User size={16} className="text-pink-400" />
                    Username
                  </label>
                  <div className="relative mt-2">
                    <input
                      type="text"
                      name="username"
                      placeholder="Choose a username"
                      value={formData.username}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                {/* Email Input */}
                <div className="mb-4">
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Mail size={16} className="text-pink-400" />
                    Email Address
                  </label>
                  <div className="relative mt-2">
                    <input
                      type="email"
                      name="email"
                      placeholder="Enter your email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all duration-200 backdrop-blur-sm"
                      required
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="mb-4">
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-pink-400" />
                    Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      placeholder="Create a password (min 6 characters)"
                      value={formData.password}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all duration-200 backdrop-blur-sm pr-12"
                      required
                      minLength={6}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password Input */}
                <div className="mb-6">
                  <label className="text-white text-sm font-semibold mb-2 flex items-center gap-2">
                    <Lock size={16} className="text-pink-400" />
                    Confirm Password
                  </label>
                  <div className="relative mt-2">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      placeholder="Confirm your password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="w-full px-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-pink-500 focus:bg-white/10 transition-all duration-200 backdrop-blur-sm pr-12"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                {/* Create Account Button */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold py-4 rounded-xl transition-all duration-200 shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </span>
                  ) : (
                    'Create Account'
                  )}
                </motion.button>

                {/* Sign In Link */}
                <p className="text-center text-gray-400 mt-6">
                  Already have an account?{' '}
                  <Link 
                    to="/login" 
                    className="text-pink-400 hover:text-pink-300 font-semibold transition-colors"
                  >
                    Sign in
                  </Link>
                </p>
              </form>
            </div>
          </motion.div>

          {/* Footer */}
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center text-gray-500 text-sm mt-8"
          >
            © 2025 Daily Task Tracker. All rights reserved.
          </motion.p>
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
