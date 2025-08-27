import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Search, Users, Zap, Shield, Mail, Phone, ArrowRight, Star, Unlock} from 'lucide-react';
import AuthModal from '../components/AuthModal';

const LandingPage: React.FC = () => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleAuthClick = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <img
                src="/logo.png"
                alt="Logo"
                className="h-10 w-auto"
              />
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => handleAuthClick('login')}
                className="text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => handleAuthClick('register')}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-7xl font-bold text-gray-900 mb-8 leading-tight">
              Get Real Contacts for Free.
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent block">
                Share Your Professional Data, Unlock a World of Opportunities.
              </span>
              Instantly
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-12 leading-relaxed">
              Join Thousands of professionals exchanging verified contacts daily. Earn points by sharing, unlock valuable leads for your business.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-6">
            <button
              onClick={() => handleAuthClick('register')}
              className="bg-gradient-to-r from-[#0b07f0] to-[#0b07f0] text-white px-8 py-4 rounded-xl font-semibold text-lg hover:scale-105 flex items-center space-x-2 shadow-md hover:shadow-lg transition-all"
            >
              <span>Start now to get free credits</span>
              <ArrowRight className="w-5 h-5" />
            </button>

            <button
              onClick={() => handleAuthClick('login')}
              className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-xl font-semibold text-lg hover:border-gray-400 hover:bg-white transition-all duration-200"
            >
              Start exchanging for free
            </button>
          </div>
        </div>
      </section>

      

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Why Choose dalilyal ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The smartest way to grow your professional network
            </p>
            <p className="text-lg text-gray-500 max-w-3xl mx-auto mt-2">
              Everything you need to find, manage, and connect with the right professionals
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-blue-50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mb-6">
                <Star className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Earn Points</h3>
              <p className="text-gray-600">
                Add verified contacts and earn points. Build your network while helping others.
              </p>
            </div>

            <div className="bg-purple-50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mb-6">
                <Unlock className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Unlock Access</h3>
              <p className="text-gray-600">
                Spend points to unlock real professional data. Get direct contact information.
              </p>
            </div>

            <div className="bg-orange-50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mb-6">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Accurate Data</h3>
              <p className="text-gray-600">
                Community-validated contacts ensure high accuracy and up-to-date information.
              </p>
            </div>

            <div className="bg-green-50 backdrop-blur-sm p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
              <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-6">
                <Zap className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Advanced Search</h3>
              <p className="text-gray-600">
                LinkedIn-style filters with AI-powered matching and boolean search operators
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-12">
            {/* Logo and Description */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img
                  src="/logo.png"
                  alt="Logo"
                  className="h-10 w-auto"
                />
              </div>
              <p className="text-gray-400 leading-relaxed">
                The most advanced B2B contact search platform with AI-powered matching and collaborative data sharing.
              </p>
            </div>

            {/* Contact Information */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Contact Us</h3>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Email Us</p>
                    <a href="mailto:support@contactpro.com" className="text-blue-400 hover:text-blue-300 transition-colors">
                      info@talentnavigator.net
                    </a>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium">Call Us</p>
                    <a href="tel:+1-555-0123" className="text-green-400 hover:text-green-300 transition-colors">
                      +201030252979
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Quick Links</h3>
              <div className="space-y-3">
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  About Us
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="block text-gray-400 hover:text-white transition-colors">
                  Help Center
                </a>
              </div>
            </div>
          </div>

          {/* Bottom Border */}
          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-gray-400">
              © 2024 dalily.ai All rights reserved.
            </p>
          </div>
        </div>
      </footer>

            {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          mode={authMode}
          onClose={() => setShowAuthModal(false)}
          onSwitchMode={(mode) => setAuthMode(mode)}
        />
      )}
    </div>
  );
};

export default LandingPage;