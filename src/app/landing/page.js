"use client"
import { useState } from 'react'
import LoginForm from '@/domains/auth/ui/LoginForm'

export default function LandingPage() {
  const [showLogin, setShowLogin] = useState(false)

  return (
    <div className="min-h-screen bg-primary-darkest">
      {/* Navigation */}
      <nav className="border-b border-primary-dark/30 bg-primary-darkest/95 backdrop-blur-sm fixed w-full z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-darkest font-bold text-lg">₿</span>
            </div>
            <span className="text-primary-light font-bold text-xl">CryptoJournal</span>
          </div>
          <button 
            onClick={() => setShowLogin(!showLogin)}
            className="px-6 py-2 bg-primary hover:bg-primary/90 text-primary-darkest font-semibold rounded-lg transition-colors"
          >
            {showLogin ? 'Close' : 'Login'}
          </button>
        </div>
      </nav>

      <div className="pt-20 flex">
        {/* Main Content */}
        <div className={`transition-all duration-300 ${showLogin ? 'w-2/3' : 'w-full'}`}>
          <div className="max-w-4xl mx-auto px-6 py-16">
            {/* Hero Section */}
            <div className="text-center mb-20">
              <h1 className="text-6xl font-bold text-primary-light mb-6">
                Track Your Crypto Journey
              </h1>
              <p className="text-2xl text-primary-light/70 mb-8 max-w-2xl mx-auto">
                Document trades, analyze patterns, and master your cryptocurrency investments with intelligent journaling.
              </p>
              <button 
                onClick={() => setShowLogin(true)}
                className="px-8 py-4 bg-primary hover:bg-primary/90 text-primary-darkest font-bold text-lg rounded-lg transition-colors shadow-lg hover:shadow-xl"
              >
                Get Started Free
              </button>
            </div>

            {/* Features Grid */}
            <div className="grid md:grid-cols-3 gap-8 mb-20">
              <div className="bg-primary-dark/50 backdrop-blur-sm border border-primary/30 rounded-xl p-6 hover:border-primary/60 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📊</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-light mb-2">Trade Logging</h3>
                <p className="text-primary-light/60">
                  Record every trade with detailed notes, emotions, and market conditions.
                </p>
              </div>

              <div className="bg-primary-dark/50 backdrop-blur-sm border border-primary/30 rounded-xl p-6 hover:border-primary/60 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">📈</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-light mb-2">Performance Analytics</h3>
                <p className="text-primary-light/60">
                  Visualize your trading patterns and identify what works best for you.
                </p>
              </div>

              <div className="bg-primary-dark/50 backdrop-blur-sm border border-primary/30 rounded-xl p-6 hover:border-primary/60 transition-colors">
                <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4">
                  <span className="text-2xl">🔒</span>
                </div>
                <h3 className="text-xl font-semibold text-primary-light mb-2">Secure & Private</h3>
                <p className="text-primary-light/60">
                  Your trading data is encrypted and accessible only to you.
                </p>
              </div>
            </div>

            {/* Stats Section */}
            <div className="bg-gradient-to-r from-primary-dark/30 to-primary/20 rounded-2xl p-12 border border-primary/30">
              <div className="grid md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-4xl font-bold text-primary-light mb-2">10K+</div>
                  <div className="text-primary-light/60">Active Traders</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-light mb-2">500K+</div>
                  <div className="text-primary-light/60">Trades Logged</div>
                </div>
                <div>
                  <div className="text-4xl font-bold text-primary-light mb-2">98%</div>
                  <div className="text-primary-light/60">Satisfaction Rate</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Login Sidebar */}
        <div className={`fixed right-0 top-0 h-full bg-primary-dark border-l border-primary/30 shadow-2xl transition-transform duration-300 ${showLogin ? 'translate-x-0' : 'translate-x-full'} w-1/3 min-w-[400px]`}>
          <div className="h-full flex flex-col p-8 pt-24">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-primary-light mb-2">Welcome Back</h2>
              <p className="text-primary-light/60">Login to continue your trading journey</p>
            </div>
            
            <div className="flex-1">
              <LoginForm />
            </div>

            <div className="mt-8 text-center">
              <p className="text-primary-light/60 text-sm">
                Don&apos;t have an account?{' '}
                <a href="/register" className="text-primary hover:text-primary-light transition-colors font-semibold">
                  Sign up free
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
