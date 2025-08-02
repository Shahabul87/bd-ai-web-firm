'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { PageBackground } from '../../components/PageBackground';

export default function HealthcareAI() {
  const handleGetStarted = () => {
    console.log('CTA clicked: get-started');
  };
  
  const handleLearnMore = () => {
    console.log('CTA clicked: learn-more');
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
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-cyan-400 to-blue-500">
                    Healthcare
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
                  Transform patient care and operational efficiency with AI-powered healthcare solutions. From predictive diagnostics to automated workflows, we help healthcare organizations deliver better outcomes while reducing costs.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {[
                    { metric: '23%', label: 'Faster Diagnosis' },
                    { metric: '40%', label: 'Cost Reduction' },
                    { metric: '99.2%', label: 'Data Accuracy' },
                    { metric: '15%', label: 'Better Outcomes' }
                  ].map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 px-6 py-3 rounded-full border border-slate-600/30">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-400">{stat.metric}</div>
                        <div className="text-sm text-slate-400">{stat.label}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* AI Solutions for Healthcare */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">AI Solutions</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Comprehensive AI implementations designed specifically for healthcare organizations.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Predictive Diagnostics */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🩺</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Predictive Diagnostics</h3>
                  <p className="text-slate-400 mb-6">
                    AI-powered diagnostic assistance that analyzes medical data to support clinical decision-making and early disease detection.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Medical image analysis</li>
                    <li>• Risk stratification</li>
                    <li>• Early warning systems</li>
                    <li>• Treatment recommendations</li>
                  </ul>
                </div>

                {/* Patient Flow Optimization */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🏥</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Patient Flow Optimization</h3>
                  <p className="text-slate-400 mb-6">
                    Intelligent scheduling and resource allocation systems that optimize patient flow and reduce wait times.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Appointment scheduling AI</li>
                    <li>• Capacity planning</li>
                    <li>• Staff optimization</li>
                    <li>• Emergency prioritization</li>
                  </ul>
                </div>

                {/* Clinical Decision Support */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-blue-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🧠</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Clinical Decision Support</h3>
                  <p className="text-slate-400 mb-6">
                    AI-driven insights and recommendations that assist healthcare providers in making informed clinical decisions.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Evidence-based recommendations</li>
                    <li>• Drug interaction alerts</li>
                    <li>• Care pathway optimization</li>
                    <li>• Outcome prediction</li>
                  </ul>
                </div>

                {/* Medical Records Processing */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📋</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Medical Records Processing</h3>
                  <p className="text-slate-400 mb-6">
                    Automated extraction and analysis of information from medical records and clinical documents.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Document digitization</li>
                    <li>• Information extraction</li>
                    <li>• Clinical coding automation</li>
                    <li>• Compliance monitoring</li>
                  </ul>
                </div>

                {/* Remote Patient Monitoring */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-pink-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📱</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Remote Patient Monitoring</h3>
                  <p className="text-slate-400 mb-6">
                    AI-powered remote monitoring systems that track patient health metrics and provide early intervention alerts.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Vital signs monitoring</li>
                    <li>• Chronic disease management</li>
                    <li>• Medication adherence</li>
                    <li>• Emergency detection</li>
                  </ul>
                </div>

                {/* Healthcare Analytics */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-orange-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Healthcare Analytics</h3>
                  <p className="text-slate-400 mb-6">
                    Advanced analytics platforms that provide insights into patient populations, treatment effectiveness, and operational performance.
                  </p>
                  <ul className="space-y-2 text-sm text-slate-300">
                    <li>• Population health insights</li>
                    <li>• Treatment outcome analysis</li>
                    <li>• Cost effectiveness studies</li>
                    <li>• Quality metrics tracking</li>
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
                  Healthcare <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Success Story</span>
                </h2>
              </div>

              <div className="max-w-4xl mx-auto">
                <div className="bg-gradient-to-r from-green-400/20 to-cyan-400/20 p-8 rounded-2xl border border-green-400/30">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-16 h-16 bg-green-400 rounded-2xl flex items-center justify-center">
                      <span className="text-2xl">🏥</span>
                    </div>
                    <div>
                      <h3 className="text-2xl font-bold text-white">MedTech Solutions</h3>
                      <p className="text-slate-400">Regional Healthcare Network</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-400 mb-2">23%</div>
                      <div className="text-sm text-slate-400">Faster Diagnosis</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-cyan-400 mb-2">40%</div>
                      <div className="text-sm text-slate-400">Cost Reduction</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-400 mb-2">99.2%</div>
                      <div className="text-sm text-slate-400">Data Accuracy</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-purple-400 mb-2">$1.8M</div>
                      <div className="text-sm text-slate-400">Annual Savings</div>
                    </div>
                  </div>

                  <blockquote className="text-lg text-slate-300 mb-6 italic">
                    &ldquo;The AI-powered diagnostic system has revolutionized our approach to patient care. We&rsquo;re able to identify critical conditions 23% faster than before, and our diagnostic accuracy has improved dramatically. The system pays for itself through improved efficiency and better patient outcomes.&rdquo;
                  </blockquote>

                  <div className="text-right">
                    <div className="text-white font-medium">Dr. Sarah Johnson</div>
                    <div className="text-slate-400 text-sm">Chief Medical Officer, MedTech Solutions</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Implementation Process */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Healthcare AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Implementation</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our proven approach ensures safe, compliant, and effective AI deployment in healthcare environments.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    step: "01",
                    title: "Compliance Assessment",
                    description: "HIPAA, FDA, and clinical workflow compliance evaluation with security audit.",
                    icon: "🔒"
                  },
                  {
                    step: "02",
                    title: "Clinical Integration",
                    description: "Seamless integration with existing EMR systems and clinical workflows.",
                    icon: "🔗"
                  },
                  {
                    step: "03",
                    title: "Staff Training",
                    description: "Comprehensive training programs for healthcare professionals and IT staff.",
                    icon: "👨‍⚕️"
                  },
                  {
                    step: "04",
                    title: "Continuous Monitoring",
                    description: "Ongoing performance monitoring, compliance checking, and system optimization.",
                    icon: "📈"
                  }
                ].map((phase, index) => (
                  <div key={index} className="text-center">
                    <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-green-400 to-cyan-400 flex items-center justify-center hover:scale-110 transition-transform duration-300">
                      <span className="text-3xl">{phase.icon}</span>
                    </div>
                    <div className="text-sm text-green-400 font-bold mb-2">{phase.step}</div>
                    <h3 className="text-xl font-bold mb-4 text-white">{phase.title}</h3>
                    <p className="text-slate-400 text-sm leading-relaxed">{phase.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Compliance & Security */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Compliance & <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">Security</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Our healthcare AI solutions meet the highest standards for security, privacy, and regulatory compliance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🛡️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">HIPAA Compliant</h3>
                  <p className="text-slate-400 mb-4">
                    Full HIPAA compliance with encrypted data handling, access controls, and audit trails.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• End-to-end encryption</li>
                    <li>• Access logging & monitoring</li>
                    <li>• Data anonymization</li>
                    <li>• Secure data transmission</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">⚕️</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">FDA Guidelines</h3>
                  <p className="text-slate-400 mb-4">
                    AI/ML solutions developed following FDA guidelines for medical device software.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Clinical validation</li>
                    <li>• Risk management</li>
                    <li>• Quality assurance</li>
                    <li>• Documentation standards</li>
                  </ul>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🔐</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Enterprise Security</h3>
                  <p className="text-slate-400 mb-4">
                    Enterprise-grade security with SOC 2 compliance and continuous monitoring.
                  </p>
                  <ul className="text-sm text-slate-300 space-y-2">
                    <li>• Multi-factor authentication</li>
                    <li>• Network segmentation</li>
                    <li>• Vulnerability scanning</li>
                    <li>• Incident response</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Transform Healthcare with AI
              </h2>
              <p className="text-xl text-slate-400 mb-12">
                Ready to improve patient outcomes and operational efficiency with AI? Let&rsquo;s discuss your healthcare AI implementation.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button 
                  onClick={handleGetStarted}
                  className="group px-8 py-4 bg-gradient-to-r from-green-400 to-cyan-400 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-green-400/30 transition-all duration-300 transform hover:-translate-y-1"
                >
                  <span className="flex items-center gap-2">
                    Schedule Healthcare Consultation
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
                <button 
                  onClick={handleLearnMore}
                  className="px-8 py-4 border-2 border-slate-600 rounded-full text-white font-semibold hover:border-green-400 hover:shadow-lg transition-all duration-300"
                >
                  View Healthcare Case Studies
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