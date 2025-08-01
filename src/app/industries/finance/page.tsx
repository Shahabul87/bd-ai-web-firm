'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PageBackground } from '../../components/PageBackground';

export default function FinanceAI() {
  const handleCTAClick = (action: string) => {
    console.log('CTA clicked:', action);
  };
  
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
                  <span className="block text-white">AI Solutions for</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500">
                    Finance
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-8 lg:mb-12">
                  Revolutionize financial services with AI-powered risk management, fraud detection, and algorithmic trading. From robo-advisors to regulatory compliance, we help financial institutions stay competitive and secure.
                </p>
                <div className="flex flex-wrap justify-center gap-3 sm:gap-4 mb-8">
                  {[
                    { metric: '87%', label: 'Fraud Detection' },
                    { metric: '45%', label: 'Faster Processing' },
                    { metric: '60%', label: 'Risk Reduction' },
                    { metric: '2.3x', label: 'ROI Increase' }
                  ].map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded-full border border-slate-600/30">
                      <div className="text-center">
                        <div className="text-lg sm:text-xl lg:text-2xl font-bold text-yellow-400">{stat.metric}</div>
                        <div className="text-xs sm:text-sm text-slate-400">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* AI Solutions for Finance */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">AI Solutions</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Comprehensive AI implementations designed to transform financial services and operations.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                
                {/* Algorithmic Trading */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-700/50 hover:border-yellow-400/30 transition-all duration-300 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl sm:text-2xl">📈</span>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Algorithmic Trading</h3>
                  <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
                    AI-powered trading algorithms that analyze market data, identify patterns, and execute trades with precision and speed.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <li>• High-frequency trading systems</li>
                    <li>• Market sentiment analysis</li>
                    <li>• Risk-adjusted portfolio optimization</li>
                    <li>• Real-time market monitoring</li>
                  </ul>
                </div>

                {/* Fraud Detection */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-700/50 hover:border-orange-400/30 transition-all duration-300 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl sm:text-2xl">🛡️</span>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">Fraud Detection</h3>
                  <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
                    Advanced machine learning models that detect fraudulent transactions and suspicious activities in real-time.
                  </p>
                  <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
                    <li>• Real-time transaction monitoring</li>
                    <li>• Anomaly detection algorithms</li>
                    <li>• Behavioral pattern analysis</li>
                    <li>• Multi-layer security validation</li>
                  </ul>
                </div>

                {/* Credit Scoring */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-700/50 hover:border-red-400/30 transition-all duration-300 group">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-xl sm:text-2xl">💳</span>
                  </div>
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 sm:mb-4">AI Credit Scoring</h3>
                  <p className="text-slate-400 mb-4 sm:mb-6 text-sm sm:text-base">
                    Intelligent credit assessment using alternative data sources and machine learning for more accurate risk evaluation.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Alternative data analysis</li>
                    <li>• Dynamic risk modeling</li>
                    <li>• Automated underwriting</li>
                    <li>• Default probability prediction</li>
                  </ul>
                </div>

                {/* Robo-Advisory */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-pink-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🤖</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Robo-Advisory</h3>
                  <p className="text-slate-400 mb-6">
                    Automated investment advisory services that provide personalized portfolio management and financial planning.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Personalized investment strategies</li>
                    <li>• Portfolio rebalancing</li>
                    <li>• Risk tolerance assessment</li>
                    <li>• Goal-based planning</li>
                  </ul>
                </div>

                {/* Regulatory Compliance */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Regulatory Compliance</h3>
                  <p className="text-slate-400 mb-6">
                    AI-powered compliance monitoring that ensures adherence to financial regulations and identifies potential violations.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Automated compliance reporting</li>
                    <li>• AML transaction monitoring</li>
                    <li>• KYC process automation</li>
                    <li>• Regulatory change tracking</li>
                  </ul>
                </div>

                {/* Customer Analytics */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-yellow-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">👥</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Customer Analytics</h3>
                  <p className="text-slate-400 mb-6">
                    Advanced analytics to understand customer behavior, predict churn, and personalize financial services.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Customer lifetime value</li>
                    <li>• Churn prediction models</li>
                    <li>• Product recommendation engines</li>
                    <li>• Behavioral segmentation</li>
                  </ul>
                </div>

              </div>
            </div>
          </section>

          {/* Success Story */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Finance <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Success Story</span>
                </h2>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 p-8 rounded-2xl border border-yellow-400/30">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">InvestPro Capital</h3>
                      <p className="text-slate-400">Digital Investment Platform</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-yellow-400 mb-2">87%</div>
                      <div className="text-sm text-slate-400">Fraud Detection Rate</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-400 mb-2">200ms</div>
                      <div className="text-sm text-slate-400">Trade Execution</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-400 mb-2">23%</div>
                      <div className="text-sm text-slate-400">Risk Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-400 mb-2">$3.2M</div>
                      <div className="text-sm text-slate-400">Annual Savings</div>
                    </div>
                  </div>

                  <blockquote className="text-lg text-slate-300 mb-6 italic">
                    "The AI-powered trading platform has transformed our operations. We're executing trades 45% faster with 87% fraud detection accuracy. Our clients benefit from better returns while we've significantly reduced operational risks and costs."
                  </blockquote>

                  <div className="text-right">
                    <div className="text-white font-medium">Michael Chen</div>
                    <div className="text-slate-400 text-sm">CTO, InvestPro Capital</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Financial Regulations & Compliance */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Regulatory <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Compliance</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our financial AI solutions are built with compliance at their core, meeting the strictest regulatory requirements.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🏛️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Banking Regulations</h3>
                  <p className="text-slate-400 mb-4">
                    Full compliance with Basel III, Dodd-Frank, and other major banking regulations.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Basel III capital requirements</li>
                    <li>• Dodd-Frank compliance</li>
                    <li>• GDPR data protection</li>
                    <li>• SOX financial reporting</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">AML & KYC</h3>
                  <p className="text-slate-400 mb-4">
                    Advanced anti-money laundering and know-your-customer compliance systems.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Automated AML monitoring</li>
                    <li>• Digital identity verification</li>
                    <li>• Suspicious activity reporting</li>
                    <li>• Customer due diligence</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-red-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Data Security</h3>
                  <p className="text-slate-400 mb-4">
                    Bank-grade security with PCI DSS compliance and advanced encryption.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• PCI DSS compliance</li>
                    <li>• End-to-end encryption</li>
                    <li>• Multi-factor authentication</li>
                    <li>• Secure API architecture</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Implementation Process */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Financial AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Implementation</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our structured approach ensures secure, compliant, and effective AI deployment in financial environments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: "01",
                    title: "Risk Assessment",
                    description: "Comprehensive risk analysis and regulatory compliance evaluation.",
                    icon: "⚖️"
                  },
                  {
                    step: "02",
                    title: "System Integration",
                    description: "Seamless integration with existing trading platforms and banking systems.",
                    icon: "🔗"
                  },
                  {
                    step: "03",
                    title: "Model Validation",
                    description: "Rigorous backtesting and validation of AI models with historical data.",
                    icon: "✅"
                  },
                  {
                    step: "04",
                    title: "Performance Monitoring",
                    description: "Continuous monitoring and optimization of AI system performance.",
                    icon: "📊"
                  }
                ].map((phase, index) => (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-yellow-400 to-orange-500 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">{phase.icon}</span>
                    </div>
                    <div className="text-sm text-yellow-400 font-bold mb-2">{phase.step}</div>
                    <h3 className="text-xl font-bold mb-4 text-white">{phase.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{phase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Financial <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-500">Use Cases</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Investment Banks",
                    cases: ["Algorithmic trading", "Risk management", "Portfolio optimization", "Market analysis"],
                    color: "from-yellow-400 to-orange-500"
                  },
                  {
                    title: "Retail Banks",
                    cases: ["Fraud detection", "Credit scoring", "Customer service", "Process automation"],
                    color: "from-orange-500 to-red-500"
                  },
                  {
                    title: "Insurance Companies",
                    cases: ["Claims processing", "Risk assessment", "Underwriting", "Customer analytics"],
                    color: "from-red-500 to-pink-500"
                  },
                  {
                    title: "Fintech Startups",
                    cases: ["Robo-advisory", "Digital payments", "Alternative lending", "Regulatory compliance"],
                    color: "from-pink-500 to-purple-500"
                  }
                ].map((useCase, index) => (
                  <div key={index} className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    <div className={`w-16 h-16 bg-gradient-to-r ${useCase.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <span className="text-2xl">🏦</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white">{useCase.title}</h3>
                    <div className="space-y-2">
                      {useCase.cases.map((caseItem, caseIndex) => (
                        <div key={caseIndex} className="flex items-center gap-2 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 bg-yellow-400 rounded-full" />
                          {caseItem}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Revolutionize Finance with AI
              </h2>
              <p className="text-xl text-slate-400 mb-12">
                Ready to enhance your financial services with cutting-edge AI? Let's discuss your fintech AI implementation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => handleCTAClick('get-started')}
                  className="group px-8 py-4 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-yellow-400/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-2">
                    Schedule Finance Consultation
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
                <button 
                  onClick={() => handleCTAClick('learn-more')}
                  className="px-8 py-4 border-2 border-slate-600 rounded-full text-white font-semibold hover:border-yellow-400 hover:shadow-lg transition-all duration-300"
                >
                  View Finance Case Studies
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