'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';
import ROICalculator from '../components/ROICalculator';

export default function ROICalculatorPage() {
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
                  <span className="block text-white">AI Investment</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-purple-500">
                    ROI Calculator
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
                  Discover the financial impact of AI implementation on your business. Get data-driven insights on potential returns, cost savings, and payback periods tailored to your industry.
                </p>
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  {[
                    { icon: '📊', title: 'Industry-Specific', desc: 'Tailored calculations for your sector' },
                    { icon: '💰', title: 'Comprehensive ROI', desc: 'Revenue, costs, and productivity gains' },
                    { icon: '⏱️', title: 'Payback Analysis', desc: 'Know when you break even' },
                    { icon: '📈', title: 'Growth Projections', desc: '3-year benefit forecasting' }
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

          {/* Main Calculator */}
          <section id="roi-calculator" className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <ROICalculator />
            </div>
          </section>

          {/* ROI Factors */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  How AI Drives <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">ROI</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Understanding the key factors that contribute to AI return on investment across different business areas.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Revenue Growth</h3>
                  <p className="text-slate-400 mb-6">
                    AI-powered insights, personalization, and automation typically drive 8-25% revenue increases.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Improved customer targeting</li>
                    <li>• Dynamic pricing optimization</li>
                    <li>• Enhanced product recommendations</li>
                    <li>• Predictive demand forecasting</li>
                    <li>• Automated sales processes</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Cost Reduction</h3>
                  <p className="text-slate-400 mb-6">
                    Process automation and efficiency improvements reduce operating costs by 12-30%.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Automated routine tasks</li>
                    <li>• Reduced manual errors</li>
                    <li>• Optimized resource allocation</li>
                    <li>• Streamlined workflows</li>
                    <li>• Lower operational overhead</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Productivity Gains</h3>
                  <p className="text-slate-400 mb-6">
                    AI tools boost employee productivity by 20-40%, freeing time for high-value activities.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Intelligent task automation</li>
                    <li>• Enhanced decision making</li>
                    <li>• Faster data processing</li>
                    <li>• Improved collaboration</li>
                    <li>• Reduced repetitive work</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* Industry Benchmarks */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Industry <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Benchmarks</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Average ROI and payback periods across different industries based on our client data and industry research.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {[
                  { industry: 'E-commerce', roi: '180%', payback: '8 months', growth: '+47%' },
                  { industry: 'Healthcare', roi: '145%', payback: '12 months', growth: '+32%' },
                  { industry: 'Finance', roi: '165%', payback: '10 months', growth: '+38%' },
                  { industry: 'Manufacturing', roi: '155%', payback: '14 months', growth: '+41%' },
                  { industry: 'Technology', roi: '220%', payback: '6 months', growth: '+55%' },
                  { industry: 'Retail', roi: '170%', payback: '9 months', growth: '+43%' }
                ].map((benchmark, index) => (
                  <div key={index} className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50 hover:border-slate-500/50 transition-all duration-300">
                    <h3 className="text-lg font-bold text-white mb-4">{benchmark.industry}</h3>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Average ROI:</span>
                        <span className="text-green-400 font-semibold">{benchmark.roi}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Payback Period:</span>
                        <span className="text-cyan-400 font-semibold">{benchmark.payback}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400 text-sm">Revenue Growth:</span>
                        <span className="text-purple-400 font-semibold">{benchmark.growth}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-8 text-center">
                <p className="text-sm text-slate-400">
                  * Based on client implementations and industry research. Results may vary based on specific use cases and implementation quality.
                </p>
              </div>
            </div>
          </section>

          {/* Success Stories */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Real <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Success Stories</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  See how our clients achieved exceptional returns on their AI investments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-gradient-to-r from-green-400/20 to-cyan-400/20 p-8 rounded-2xl border border-green-400/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-green-400 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🛒</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">RetailMax Inc.</h3>
                      <p className="text-slate-400">E-commerce Platform</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">275%</div>
                      <div className="text-xs text-slate-400">ROI Year 1</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">6</div>
                      <div className="text-xs text-slate-400">Months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">$2.1M</div>
                      <div className="text-xs text-slate-400">Annual Savings</div>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">
                    &ldquo;AI-powered recommendation engine increased our conversion rate by 47% and reduced cart abandonment by 32%.&rdquo;
                  </p>
                </div>

                <div className="bg-gradient-to-r from-cyan-400/20 to-purple-500/20 p-8 rounded-2xl border border-cyan-400/30">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-12 h-12 bg-cyan-400 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">🏥</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">MedTech Solutions</h3>
                      <p className="text-slate-400">Healthcare Analytics</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-400">195%</div>
                      <div className="text-xs text-slate-400">ROI Year 1</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-cyan-400">11</div>
                      <div className="text-xs text-slate-400">Months</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-400">$1.8M</div>
                      <div className="text-xs text-slate-400">Annual Savings</div>
                    </div>
                  </div>
                  <p className="text-slate-300 text-sm">
                    &ldquo;Predictive analytics reduced patient readmissions by 23% and improved operational efficiency by 40%.&rdquo;
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Ready to Calculate Your AI ROI?
              </h2>
              <p className="text-xl text-slate-400 mb-12">
                Get a personalized analysis of how AI can impact your business performance and bottom line.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#roi-calculator"
                  className="group px-8 py-4 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-green-400/30 transition-all duration-300 transform hover:-translate-y-1 inline-flex items-center gap-2"
                >
                  <span className="flex items-center gap-2">
                    Calculate ROI Now
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </a>
                <button className="px-8 py-4 border-2 border-slate-600 rounded-full text-white font-semibold hover:border-cyan-400 hover:shadow-lg transition-all duration-300">
                  Schedule Expert Consultation
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