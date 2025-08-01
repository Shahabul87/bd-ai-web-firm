'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';
import ServiceConfigurator from '../components/ServiceConfigurator';

export default function ConfiguratorPage() {
  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />
        
        <main className="pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="relative overflow-hidden py-20 lg:py-32">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
              <div className="text-center">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                  <span className="block text-white">Project</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500">
                    Configurator
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
                  Build your custom AI solution step by step. Get instant pricing estimates and detailed proposals tailored to your specific needs.
                </p>
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  {[
                    { icon: '⚡', title: 'Instant Estimates', desc: 'Get pricing in real-time' },
                    { icon: '🎯', title: 'Tailored Solutions', desc: 'Customized to your needs' },
                    { icon: '📊', title: 'Transparent Pricing', desc: 'No hidden costs' },
                    { icon: '🚀', title: 'Fast Delivery', desc: 'Clear timelines provided' }
                  ].map((feature, index) => (
                    <div key={index} className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-600/30">
                      <span className="text-2xl">{feature.icon}</span>
                      <div>
                        <div className="text-sm font-medium text-white">{feature.title}</div>
                        <div className="text-xs text-slate-400">{feature.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Main Configurator */}
          <section id="configurator" className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ServiceConfigurator />
            </div>
          </section>

          {/* How It Works */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  How It <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Works</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our intelligent configurator guides you through the process of defining your perfect AI solution.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: "01",
                    title: "Choose Category",
                    description: "Select from AI & ML, Web Development, or Data Analytics based on your primary needs.",
                    icon: "🎯",
                    color: "from-cyan-400 to-purple-500"
                  },
                  {
                    step: "02", 
                    title: "Select Services",
                    description: "Pick specific services within your category. Multiple selections get automatic discounts.",
                    icon: "🛠️",
                    color: "from-purple-500 to-orange-500"
                  },
                  {
                    step: "03",
                    title: "Set Complexity",
                    description: "Choose from Basic to Enterprise level based on your requirements and budget.",
                    icon: "⚙️",
                    color: "from-orange-500 to-green-400"
                  },
                  {
                    step: "04",
                    title: "Get Proposal",
                    description: "Receive instant pricing and a detailed proposal with timeline and features.",
                    icon: "📋",
                    color: "from-green-400 to-cyan-400"
                  }
                ].map((step, index) => (
                  <div key={index} className="text-center group">
                    <div className={`w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r ${step.color} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <span className="text-3xl">{step.icon}</span>
                    </div>
                    <div className="text-sm text-cyan-400 font-bold mb-2">STEP {step.step}</div>
                    <h3 className="text-xl font-bold mb-4 text-white">{step.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Pricing Transparency */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Transparent <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Pricing</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our configurator provides accurate estimates based on industry standards and our extensive project experience.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">💡</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Smart Calculations</h3>
                  <p className="text-slate-400 mb-4">
                    Our pricing algorithm considers project complexity, service combinations, and market rates to provide accurate estimates.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Industry-standard rates</li>
                    <li>• Complexity multipliers</li>
                    <li>• Multi-service discounts</li>
                    <li>• Real-time adjustments</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">No Hidden Costs</h3>
                  <p className="text-slate-400 mb-4">
                    What you see is what you get. All estimates include development, testing, documentation, and basic support.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• All-inclusive pricing</li>
                    <li>• No surprise fees</li>
                    <li>• Clear scope definition</li>
                    <li>• Transparent timelines</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🤝</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Flexible Terms</h3>
                  <p className="text-slate-400 mb-4">
                    We offer flexible payment plans and can adjust the scope to match your budget constraints.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Milestone-based payments</li>
                    <li>• Budget-friendly options</li>
                    <li>• Scope adjustments</li>
                    <li>• Extended support plans</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* FAQ Section */}
          <section className="py-16 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Frequently Asked <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Questions</span>
                </h2>
              </div>

              <div className="space-y-6">
                {[
                  {
                    question: "How accurate are the estimates?",
                    answer: "Our estimates are typically within 10-15% of the final project cost. They're based on our extensive experience and current market rates. Final pricing is confirmed after detailed requirements analysis."
                  },
                  {
                    question: "Can I modify my configuration after generating a proposal?",
                    answer: "Absolutely! You can adjust your configuration at any time. The estimates update in real-time, and you can generate multiple proposals to compare different approaches."
                  },
                  {
                    question: "What's included in the timeline estimates?",
                    answer: "Timeline estimates include discovery, design, development, testing, and deployment phases. They account for typical project complexity and our standard development process."
                  },
                  {
                    question: "Do you offer payment plans?",
                    answer: "Yes, we offer flexible payment plans including milestone-based payments, monthly installments, and custom arrangements based on your budget and cash flow needs."
                  },
                  {
                    question: "What happens after I request a quote?",
                    answer: "Our team will contact you within 24 hours to discuss your requirements in detail, answer questions, and provide a comprehensive proposal with exact pricing and timeline."
                  }
                ].map((faq, index) => (
                  <div key={index} className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-slate-400 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Ready to Configure Your AI Solution?
              </h2>
              <p className="text-xl text-slate-400 mb-12">
                Start building your custom AI project configuration and get instant pricing estimates.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#configurator"
                  className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center gap-2"
                >
                  <span className="flex items-center gap-2">
                    Start Configuring
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </a>
                <button className="px-8 py-4 border-2 border-slate-600 rounded-full text-white font-semibold hover:border-cyan-400 hover:shadow-lg transition-all duration-300">
                  Schedule Consultation
                </button>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageBackground>
  );
}