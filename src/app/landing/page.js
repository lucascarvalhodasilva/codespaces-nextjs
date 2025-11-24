"use client"

import { useState } from 'react'
import Link from 'next/link'
import LoginForm from '@/domains/auth/ui/LoginForm'
import RegisterForm from '@/domains/auth/ui/RegisterForm'

const howItWorksSteps = [
  {
    title: 'Log your trades',
    description: 'Add your entry, stop, screenshots, and quick notes in seconds.'
  },
  {
    title: 'Tag & organize',
    description: 'Label strategy, setup quality, emotions, and market conditions.'
  },
  {
    title: 'Review patterns',
    description: 'See what works, what fails, and where you can improve next.'
  }
]

const featureHighlights = [
  {
    icon: '📝',
    title: 'Trade Journal',
    description: 'Keep all trade details, screenshots, and mistakes in one clean place.'
  },
  {
    icon: '🏷️',
    title: 'Strategy Tagging',
    description: 'Understand which setups actually make you money.'
  },
  {
    icon: '📊',
    title: 'Performance Dashboard',
    description: 'See win rate, best setups, R-multiples, and recurring patterns.'
  },
  {
    icon: '🔍',
    title: 'Pattern Insights',
    description: 'Spot strengths and weaknesses you can’t see in Excel.'
  }
]

const beginnerBullets = [
  'Pre-built templates for trade notes',
  'Example entries to learn from',
  'Easy-to-understand performance metrics',
  'Gentle guidance on risk and psychology'
]

const learnLinks = [
  'How to review your trades weekly',
  'What creates a trading edge',
  'Simple risk management for beginners'
]

const faqItems = [
  {
    question: 'Do I need to be profitable already?',
    answer: 'Not at all. The journal is designed to help you build consistency while you learn.'
  },
  {
    question: 'Can I use this for crypto, stocks, or forex?',
    answer: 'Yes. Log any market—spot, futures, options—and tag it however you prefer.'
  },
  {
    question: 'What if I skip journaling sometimes?',
    answer: 'No worries. Pick up where you left off. The app nudges you with gentle reminders.'
  },
  {
    question: 'How is my data stored and secured?',
    answer: 'Your data is encrypted in transit and at rest. Only you can access your account.'
  }
]

const comparisonRows = [
  { tool: 'Excel', goodAt: 'Numbers', lacks: 'No pattern detection' },
  { tool: 'Screenshots', goodAt: 'Visuals', lacks: 'No structure or stats' },
  { tool: 'Notes app', goodAt: 'Quick ideas', lacks: 'No tracking or filtering' },
  { tool: 'SimpleTrade', goodAt: 'Journaling & insights', lacks: 'Built for traders, not accountants' }
]

function PrimaryButton({ href, onClick, children }) {
  const className = "inline-flex items-center justify-center px-6 py-3 rounded-xl bg-primary text-primary-darkest font-semibold shadow-lg shadow-primary/30 hover:bg-primary/90 transition-colors"

  if (href) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    )
  }

  return (
    <button type="button" onClick={onClick} className={className}>
      {children}
    </button>
  )
}

function SecondaryButton({ href, children }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-primary/40 text-primary-light hover:border-primary/80 hover:text-primary transition-colors"
    >
      {children}
    </Link>
  )
}

export default function LandingPage() {
  const [activePanel, setActivePanel] = useState(null)

  const openLoginPanel = () => setActivePanel('login')
  const openRegisterPanel = () => setActivePanel('register')
  const closePanel = () => setActivePanel(null)

  const panelContent = activePanel === 'login'
    ? {
        label: 'Login',
        title: 'Access SimpleTrade',
        description: 'Pick up where you left off. Your trades are waiting.',
        body: <LoginForm onSwitchToRegister={() => setActivePanel('register')} />
      }
    : activePanel === 'register'
    ? {
        label: 'Register',
        title: 'Create your SimpleTrade journal',
        description: 'Start journaling today. You can always come back and finish later.',
        body: <RegisterForm onSwitchToLogin={() => setActivePanel('login')} />
      }
    : null
  const isSidebarOpen = Boolean(panelContent)

  return (
    <div className="bg-slate-950 text-primary-light">
      <header className="relative overflow-hidden bg-gradient-to-b from-primary-darkest via-slate-950 to-slate-950">
        <div className="max-w-6xl mx-auto px-6 pt-10">
          <nav className="flex items-center justify-between text-sm text-primary-light/70">
            <span className="text-lg font-semibold text-primary-light">SimpleTrade</span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={openLoginPanel}
                className="px-4 py-2 rounded-xl border border-transparent text-primary-light hover:text-primary transition-colors"
              >
                Login
              </button>
              <SecondaryButton href="/demo">Watch Demo</SecondaryButton>
              <PrimaryButton onClick={openRegisterPanel}>Get Started</PrimaryButton>
            </div>
          </nav>
        </div>
        <div className="max-w-6xl mx-auto px-6 py-12 lg:py-16 flex flex-col gap-12 lg:flex-row lg:items-center">
          <div className="space-y-6 lg:w-1/2">
            <p className="text-primary/80 uppercase tracking-[0.3em] text-xs">Trading Journal for Beginners</p>
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              SimpleTrade helps you master your trades with smart journaling
            </h1>
            <p className="text-lg text-primary-light/80">
              Document trades, analyze patterns, and grow with clarity — even if you’re just starting out.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <PrimaryButton onClick={openRegisterPanel}>Start Journaling</PrimaryButton>
              <SecondaryButton href="/demo">Watch Demo</SecondaryButton>
            </div>
            <p className="text-sm text-primary-light/50">No credit card required · Works for stocks, crypto, and forex</p>
          </div>

          <div className="lg:w-1/2">
            <div className="relative rounded-3xl bg-slate-900/70 border border-primary/30 p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="text-sm text-primary-light/60">Weekly Equity Curve</p>
                  <p className="text-xl font-semibold">+$1,420</p>
                </div>
                <span className="px-3 py-1 text-xs rounded-full bg-primary/10 text-primary">
                  Demo
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                {['Win rate', 'Best setup', 'Avg R'].map((label, index) => (
                  <div key={label} className="rounded-2xl border border-primary/20 bg-slate-950/40 p-3">
                    <p className="text-xs uppercase tracking-[0.25em] text-primary-light/40 mb-1">{label}</p>
                    <p className="text-lg font-semibold">
                      {index === 0 && '62%'}
                      {index === 1 && 'London Break'}
                      {index === 2 && '1.8R'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 h-36 rounded-2xl bg-gradient-to-r from-primary/20 via-primary/5 to-primary/30 flex items-end gap-1 p-4">
                {[50, 90, 120, 80, 140, 160, 110].map((height, idx) => (
                  <div key={idx} style={{ height }} className="flex-1 bg-primary/60 rounded-t-full" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="space-y-20 py-16">
        <section className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900/70 border border-slate-800 rounded-3xl p-10">
            <div className="space-y-4">
              <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">
                Why you need structure
              </p>
              <h2 className="text-3xl font-bold mb-2">
                Trading without structure = inconsistent results
              </h2>
              <p className="text-primary-light/75">
                When you skip journaling, you fly blind. That’s why beginner traders struggle to improve week after week.
              </p>
              <ul className="space-y-2 text-primary-light/80 list-disc pl-5">
                {[
                  'You forget why you entered a trade',
                  'You repeat the same mistakes',
                  'You jump between strategies',
                  'Screenshots and notes are scattered everywhere'
                ].map((pain) => (
                  <li key={pain}>{pain}</li>
                ))}
              </ul>
              <p className="text-lg font-semibold text-primary mt-4">
                Your trading improves the moment you start tracking it.
              </p>
            </div>
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-between gap-4 mb-10 flex-wrap">
            <div>
              <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">Process</p>
              <h2 className="text-3xl font-bold">How it works</h2>
            </div>
            <PrimaryButton onClick={openRegisterPanel}>Start Journaling</PrimaryButton>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {howItWorksSteps.map((step, index) => (
              <div key={step.title} className="rounded-3xl border border-slate-800 bg-slate-900/70 p-6">
                <div className="w-10 h-10 rounded-full bg-primary/15 text-primary font-semibold flex items-center justify-center mb-4">
                  {index + 1}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-primary-light/75">{step.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">Highlights</p>
            <h2 className="text-3xl font-bold">Everything beginners need to stay consistent</h2>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {featureHighlights.map((feature) => (
              <div key={feature.title} className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 flex gap-4">
                <span className="text-3xl" aria-hidden="true">{feature.icon}</span>
                <div>
                  <h3 className="text-xl font-semibold">{feature.title}</h3>
                  <p className="text-primary-light/70">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="bg-slate-900/70 py-16">
          <div className="max-w-5xl mx-auto px-6 grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">Designed for you</p>
              <h2 className="text-3xl font-bold mb-4">No experience needed. Just consistency.</h2>
              <p className="text-primary-light/70">
                SimpleTrade walks you through every entry so you can focus on learning, not wrestling with spreadsheets.
              </p>
            </div>
            <ul className="space-y-3 text-primary-light/80">
              {beginnerBullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="text-primary">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6">
          <div className="rounded-3xl border border-primary/30 bg-primary-darkest/40 p-8">
            <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">Founder note</p>
            <h2 className="text-2xl font-bold mb-4">Built by traders — for traders</h2>
            <p className="text-primary-light/80 text-lg">
              This journal started as a personal tool to stop repeating the same mistakes. Now it helps new traders build discipline, one trade at a time.
            </p>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">Compare</p>
            <h2 className="text-3xl font-bold">Why not just use Excel or screenshots?</h2>
          </div>
          <div className="overflow-x-auto rounded-3xl border border-slate-800">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-900/70 text-primary-light/70 uppercase tracking-[0.2em] text-xs">
                <tr>
                  <th className="px-4 py-3">Tool</th>
                  <th className="px-4 py-3">Good at</th>
                  <th className="px-4 py-3">Lacks</th>
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row) => (
                  <tr key={row.tool} className="border-t border-slate-800">
                    <td className="px-4 py-4 font-semibold">{row.tool}</td>
                    <td className="px-4 py-4 text-primary-light/75">{row.goodAt}</td>
                    <td className="px-4 py-4 text-primary-light/75">{row.lacks}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6">
          <div className="bg-slate-900/60 rounded-3xl border border-slate-800 p-8">
            <div className="mb-6">
              <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">Education</p>
              <h2 className="text-2xl font-bold">Learn while you journal</h2>
            </div>
            <div className="grid gap-4 md:grid-cols-3">
              {learnLinks.map((text) => (
                <Link
                  key={text}
                  href="/resources"
                  className="rounded-2xl border border-slate-800 bg-slate-950/40 p-4 hover:border-primary/40 transition-colors"
                >
                  {text}
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className="max-w-5xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-10 items-center">
            <div>
              <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">Fast onboarding</p>
              <h2 className="text-3xl font-bold mb-4">Start your first journal entry in minutes</h2>
              <p className="text-primary-light/75 mb-6">
                Simple, beginner-friendly onboarding that gets you to your first logged trade immediately.
              </p>
              <PrimaryButton onClick={openRegisterPanel}>Create free account</PrimaryButton>
            </div>
            <ul className="space-y-3 text-primary-light/80">
              {[
                'No credit card needed',
                'Free starter plan (text-only for now)',
                'Pre-filled sample trades to explore the app'
              ].map((bullet) => (
                <li key={bullet} className="flex items-start gap-3">
                  <span className="text-primary">✓</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-8">
            <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">FAQ</p>
            <h2 className="text-3xl font-bold">Questions from new traders</h2>
          </div>
          <div className="space-y-4">
            {faqItems.map((item) => (
              <details key={item.question} className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5">
                <summary className="cursor-pointer text-lg font-semibold">
                  {item.question}
                </summary>
                <p className="mt-2 text-primary-light/75">{item.answer}</p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <section className="bg-gradient-to-b from-slate-900 via-slate-950 to-black py-16">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <p className="text-primary/70 uppercase tracking-[0.3em] text-xs">Ready?</p>
          <h2 className="text-3xl md:text-4xl font-bold">
            Start your next 100 trades with a plan.
          </h2>
          <PrimaryButton onClick={openRegisterPanel}>Create My Journal</PrimaryButton>
          <p className="text-primary-light/60">It takes less than 3 minutes to start.</p>
        </div>
      </section>

      <div className={`fixed inset-0 z-40 transition-all duration-300 ${isSidebarOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        <div
          className={`absolute inset-0 bg-black/60 transition-opacity duration-300 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={closePanel}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}
          aria-label={`${panelContent?.label ?? 'Auth'} sidebar`}
        >
          {panelContent && (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-primary/70">{panelContent.label}</p>
                  <p className="text-lg font-semibold text-primary-light">{panelContent.title}</p>
                </div>
                <button
                  type="button"
                  onClick={closePanel}
                  className="text-primary-light/60 hover:text-primary"
                  aria-label={`Close ${panelContent.label} sidebar`}
                >
                  ✕
                </button>
              </div>
              <div className="px-6 py-6 overflow-y-auto h-full">
                <p className="text-sm text-primary-light/70 mb-4">
                  {panelContent.description}
                </p>
                {panelContent.body}
              </div>
            </>
          )}
        </aside>
      </div>
    </div>
  )
}
