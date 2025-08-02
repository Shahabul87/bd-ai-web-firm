'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PageBackground } from '../../components/PageBackground';

export default function RetailAI() {
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
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-500 to-indigo-500">
                    Retail
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
                  Transform retail operations with AI-powered personalization, inventory optimization, and customer analytics. From smart recommendations to demand forecasting, we help retailers deliver exceptional experiences while maximizing profitability.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {[
                    { metric: '47%', label: 'Sales Increase' },
                    { metric: '65%', label: 'Better Engagement' },
                    { metric: '32%', label: 'Reduced Cart Abandonment' },
                    { metric: '28%', label: 'Inventory Optimization' }
                  ].map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 px-6 py-3 rounded-full border border-slate-600/30">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-pink-400">{stat.metric}</div>
                        <div className="text-sm text-slate-400">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* AI Solutions for Retail */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Retail <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">AI Solutions</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Comprehensive AI implementations designed to revolutionize retail operations and customer experiences.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Personalized Recommendations */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-pink-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Smart Recommendations</h3>
                  <p className="text-slate-400 mb-6">
                    AI-powered recommendation engines that analyze customer behavior to suggest relevant products and increase conversion rates.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Collaborative filtering algorithms</li>
                    <li>• Real-time personalization</li>
                    <li>• Cross-selling optimization</li>
                    <li>• Behavioral pattern analysis</li>
                  </ul>
                </div>

                {/* Inventory Management */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📦</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Inventory Optimization</h3>
                  <p className="text-slate-400 mb-6">
                    Intelligent inventory management systems that predict demand, optimize stock levels, and reduce carrying costs.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Demand forecasting models</li>
                    <li>• Auto-replenishment systems</li>
                    <li>• Stock level optimization</li>
                    <li>• Seasonal trend analysis</li>
                  </ul>
                </div>

                {/* Dynamic Pricing */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-indigo-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">💰</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Dynamic Pricing</h3>
                  <p className="text-slate-400 mb-6">
                    AI-driven pricing strategies that optimize prices in real-time based on demand, competition, and market conditions.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Competitive price monitoring</li>
                    <li>• Demand-based pricing</li>
                    <li>• Margin optimization</li>
                    <li>• A/B testing automation</li>
                  </ul>
                </div>

                {/* Customer Analytics */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Customer Analytics</h3>
                  <p className="text-slate-400 mb-6">
                    Deep customer insights through advanced analytics to understand shopping patterns and predict future behavior.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Customer lifetime value</li>
                    <li>• Churn prediction models</li>
                    <li>• Segmentation algorithms</li>
                    <li>• Shopping journey analysis</li>
                  </ul>
                </div>

                {/* Visual Search */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🔍</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Visual Search</h3>
                  <p className="text-slate-400 mb-6">
                    Computer vision-powered search that allows customers to find products using images instead of text queries.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Image recognition technology</li>
                    <li>• Visual similarity matching</li>
                    <li>• Mobile app integration</li>
                    <li>• Voice search capabilities</li>
                  </ul>
                </div>

                {/* Supply Chain Optimization */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-pink-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🚚</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Supply Chain AI</h3>
                  <p className="text-slate-400 mb-6">
                    End-to-end supply chain optimization using AI to improve efficiency, reduce costs, and enhance delivery times.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Route optimization algorithms</li>
                    <li>• Supplier performance analysis</li>
                    <li>• Warehouse automation</li>
                    <li>• Delivery time prediction</li>
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
                  Retail <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Success Story</span>
                </h2>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-pink-400/20 to-purple-500/20 p-8 rounded-2xl border border-pink-400/30">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-pink-400 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🛍️</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">RetailMax Inc.</h3>
                      <p className="text-slate-400">Multi-Channel Retail Platform</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-pink-400 mb-2">47%</div>
                      <div className="text-sm text-slate-400">Sales Increase</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-2">65%</div>
                      <div className="text-sm text-slate-400">User Engagement</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-indigo-400 mb-2">32%</div>
                      <div className="text-sm text-slate-400">Cart Abandonment Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">$2.1M</div>
                      <div className="text-sm text-slate-400">Additional Revenue</div>
                    </div>
                  </div>

                  <blockquote className="text-lg text-slate-300 mb-6 italic">
                    &ldquo;The AI recommendation engine has completely transformed our customer experience. We&rsquo;re seeing 47% higher sales and 65% better engagement. Our customers love the personalized shopping experience, and we&rsquo;ve dramatically reduced cart abandonment rates.&rdquo;
                  </blockquote>

                  <div className="text-right">
                    <div className="text-white font-medium">Lisa Rodriguez</div>
                    <div className="text-slate-400 text-sm">VP of Digital Commerce, RetailMax Inc.</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Retail Technology Stack */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Retail Technology <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Stack</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our retail AI solutions integrate seamlessly with popular e-commerce platforms and retail systems.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🛒</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">E-commerce Platforms</h3>
                  <p className="text-slate-400 mb-4">
                    Seamless integration with major e-commerce platforms and custom retail systems.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Shopify & Shopify Plus</li>
                    <li>• Magento & Adobe Commerce</li>
                    <li>• WooCommerce & BigCommerce</li>
                    <li>• Custom e-commerce solutions</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">💳</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">POS & Payment Systems</h3>
                  <p className="text-slate-400 mb-4">
                    Integration with point-of-sale systems and payment processing platforms.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Square & Stripe integration</li>
                    <li>• Traditional POS systems</li>
                    <li>• Mobile payment solutions</li>
                    <li>• Loyalty program platforms</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Mobile & Omnichannel</h3>
                  <p className="text-slate-400 mb-4">
                    Multi-channel retail solutions for web, mobile, and in-store experiences.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Native mobile apps</li>
                    <li>• Progressive web apps</li>
                    <li>• In-store kiosk systems</li>
                    <li>• Social commerce integration</li>
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
                  Retail AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Implementation</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our proven methodology ensures successful AI deployment that drives immediate business results.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: "01",
                    title: "Data Analysis",
                    description: "Analysis of customer data, sales patterns, and inventory to identify opportunities.",
                    icon: "📈"
                  },
                  {
                    step: "02",
                    title: "AI Model Development",
                    description: "Custom AI model development tailored to your specific retail needs and goals.",
                    icon: "🤖"
                  },
                  {
                    step: "03",
                    title: "Platform Integration",
                    description: "Seamless integration with your existing e-commerce and retail systems.",
                    icon: "🔗"
                  },
                  {
                    step: "04",
                    title: "Performance Optimization",
                    description: "Continuous monitoring and optimization to maximize ROI and customer satisfaction.",
                    icon: "⚡"
                  }
                ].map((phase, index) => (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">{phase.icon}</span>
                    </div>
                    <div className="text-sm text-pink-400 font-bold mb-2">{phase.step}</div>
                    <h3 className="text-xl font-bold mb-4 text-white">{phase.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{phase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Retail Use Cases */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Retail <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-500">Use Cases</span>
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {[
                  {
                    title: "Fashion & Apparel",
                    cases: ["Style recommendations", "Size prediction", "Trend forecasting", "Virtual try-on"],
                    color: "from-pink-400 to-purple-500"
                  },
                  {
                    title: "Electronics & Tech",
                    cases: ["Product comparisons", "Technical support", "Warranty tracking", "Compatibility checks"],
                    color: "from-purple-500 to-indigo-500"
                  },
                  {
                    title: "Grocery & Food",
                    cases: ["Recipe suggestions", "Dietary preferences", "Expiry management", "Meal planning"],
                    color: "from-indigo-500 to-blue-500"
                  },
                  {
                    title: "Beauty & Cosmetics",
                    cases: ["Shade matching", "Skin analysis", "Routine recommendations", "Virtual makeup"],
                    color: "from-blue-500 to-cyan-500"
                  }
                ].map((useCase, index) => (
                  <div key={index} className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                    <div className={`w-16 h-16 bg-gradient-to-r ${useCase.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <span className="text-2xl">🏪</span>
                    </div>
                    <h3 className="text-xl font-bold mb-4 text-white">{useCase.title}</h3>
                    <div className="space-y-2">
                      {useCase.cases.map((caseItem, caseIndex) => (
                        <div key={caseIndex} className="flex items-center gap-2 text-sm text-slate-300">
                          <div className="w-1.5 h-1.5 bg-pink-400 rounded-full" />
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
                Transform Retail with AI
              </h2>
              <p className="text-xl text-slate-400 mb-12">
                Ready to revolutionize your retail operations with AI? Let&rsquo;s discuss your retail AI transformation strategy.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={() => handleCTAClick('get-started')}
                  className="group px-8 py-4 bg-gradient-to-r from-pink-400 to-purple-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-pink-400/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-2">
                    Schedule Retail Consultation
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
                <button 
                  onClick={() => handleCTAClick('learn-more')}
                  className="px-8 py-4 border-2 border-slate-600 rounded-full text-white font-semibold hover:border-pink-400 hover:shadow-lg transition-all duration-300"
                >
                  View Retail Case Studies
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