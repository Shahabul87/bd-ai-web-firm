import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';

export default function AISolutions() {
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
                  <span className="block text-white">AI-Powered</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500">
                    Intelligent Solutions
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
                  Transform your business with cutting-edge AI solutions. From machine learning models to intelligent automation, we deliver custom AI systems that drive growth and innovation.
                </p>
              </div>
            </div>
          </section>

          {/* AI Solutions Grid */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Machine Learning */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Machine Learning</h3>
                  <p className="text-slate-400 mb-6">
                    Custom ML models for predictive analytics, pattern recognition, and intelligent decision-making systems.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Predictive Analytics</li>
                    <li>• Classification & Clustering</li>
                    <li>• Recommendation Systems</li>
                    <li>• Anomaly Detection</li>
                  </ul>
                </div>

                {/* Natural Language Processing */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">💬</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Natural Language Processing</h3>
                  <p className="text-slate-400 mb-6">
                    Advanced NLP solutions for text analysis, chatbots, and language understanding applications.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Sentiment Analysis</li>
                    <li>• Text Classification</li>
                    <li>• Chatbots & Virtual Assistants</li>
                    <li>• Document Processing</li>
                  </ul>
                </div>

                {/* Computer Vision */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-orange-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-400 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">👁️</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Computer Vision</h3>
                  <p className="text-slate-400 mb-6">
                    Visual intelligence solutions for image recognition, object detection, and automated visual analysis.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Image Classification</li>
                    <li>• Object Detection</li>
                    <li>• Facial Recognition</li>
                    <li>• Quality Control Systems</li>
                  </ul>
                </div>

                {/* Process Automation */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Intelligent Automation</h3>
                  <p className="text-slate-400 mb-6">
                    Streamline business processes with AI-powered automation and workflow optimization.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Workflow Automation</li>
                    <li>• Document Processing</li>
                    <li>• Data Pipeline Automation</li>
                    <li>• Business Process Optimization</li>
                  </ul>
                </div>

                {/* Predictive Analytics */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Predictive Analytics</h3>
                  <p className="text-slate-400 mb-6">
                    Forecast trends, predict outcomes, and make data-driven decisions with advanced analytics.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Sales Forecasting</li>
                    <li>• Risk Assessment</li>
                    <li>• Market Analysis</li>
                    <li>• Customer Behavior Prediction</li>
                  </ul>
                </div>

                {/* AI Consulting */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">AI Strategy & Consulting</h3>
                  <p className="text-slate-400 mb-6">
                    Expert guidance on AI implementation, strategy development, and technology roadmaps.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• AI Readiness Assessment</li>
                    <li>• Technology Stack Planning</li>
                    <li>• Implementation Roadmaps</li>
                    <li>• ROI Analysis & Optimization</li>
                  </ul>
                </div>

              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Ready to Transform Your Business with AI?
              </h2>
              <p className="text-xl text-slate-400 mb-12">
                Let&apos;s discuss how our AI solutions can drive innovation and growth for your organization.
              </p>
              <button className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1">
                <span className="flex items-center gap-2">
                  Get Started Today
                  <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageBackground>
  );
}