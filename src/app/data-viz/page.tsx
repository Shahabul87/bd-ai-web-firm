import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';

export default function DataVisualization() {
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
                  <span className="block text-white">Transform Data Into</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500">
                    Visual Intelligence
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
                  Turn complex datasets into compelling visual stories. Our advanced data visualization solutions help you discover insights, communicate findings, and make data-driven decisions with confidence.
                </p>
              </div>
            </div>
          </section>

          {/* Visualization Types */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Visualization <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Solutions</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  From interactive dashboards to real-time analytics, we create visualizations that bring your data to life.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                
                {/* Interactive Dashboards */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📊</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Interactive Dashboards</h3>
                  <p className="text-slate-400 mb-6">
                    Dynamic, real-time dashboards that allow users to explore data through interactive filters, drill-downs, and custom views.
                  </p>
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm text-slate-400">Revenue Growth</span>
                      <span className="text-green-400 text-sm font-bold">+24.5%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-2">
                      <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full" style={{width: '75%'}}></div>
                    </div>
                  </div>
                </div>

                {/* Real-time Analytics */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Real-time Analytics</h3>
                  <p className="text-slate-400 mb-6">
                    Live data streams and real-time monitoring with instant updates and alerts for critical business metrics.
                  </p>
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-sm text-slate-400">Live Data Stream</span>
                    </div>
                    <div className="text-2xl font-bold text-cyan-400">2,847 <span className="text-sm text-slate-400">req/sec</span></div>
                  </div>
                </div>

                {/* Data Storytelling */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-orange-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📖</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Data Storytelling</h3>
                  <p className="text-slate-400 mb-6">
                    Compelling visual narratives that transform complex data into clear, actionable insights and presentations.
                  </p>
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Engagement</span>
                        <span className="text-green-400">95%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Clarity</span>
                        <span className="text-cyan-400">92%</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Impact</span>
                        <span className="text-purple-400">89%</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advanced Charts */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">📈</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Advanced Charts</h3>
                  <p className="text-slate-400 mb-6">
                    Sophisticated chart types including heatmaps, treemaps, network diagrams, and custom visualizations.
                  </p>
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                    <div className="grid grid-cols-5 gap-1">
                      {Array.from({length: 25}, (_, i) => (
                        <div 
                          key={i} 
                          className="w-3 h-3 rounded-sm"
                          style={{
                            backgroundColor: `hsl(${180 + (i * 8)}, 70%, ${40 + (i * 2)}%)`
                          }}
                        ></div>
                      ))}
                    </div>
                    <div className="text-xs text-slate-400 mt-2">Heatmap Visualization</div>
                  </div>
                </div>

                {/* Geospatial Maps */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🗺️</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Geospatial Mapping</h3>
                  <p className="text-slate-400 mb-6">
                    Interactive maps with location-based data visualization, geographic analysis, and spatial intelligence.
                  </p>
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-slate-400">Global Reach</span>
                      <span className="text-cyan-400 text-sm font-bold">47 Countries</span>
                    </div>
                    <div className="flex gap-1">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-2 h-2 bg-cyan-400 rounded-full opacity-70"></div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Custom Solutions */}
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300 group">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                    <span className="text-2xl">🎨</span>
                  </div>
                  <h3 className="text-2xl font-bold mb-4">Custom Visualizations</h3>
                  <p className="text-slate-400 mb-6">
                    Bespoke visualization solutions tailored to your specific data types, use cases, and business requirements.
                  </p>
                  <div className="bg-slate-800/50 p-4 rounded-lg mb-4">
                    <div className="flex justify-center">
                      <div className="w-16 h-16 border-4 border-cyan-400 border-dashed rounded-full flex items-center justify-center">
                        <span className="text-cyan-400 text-xs">Custom</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </section>

          {/* Technologies Section */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Powered by <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Modern Technology</span>
                </h2>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8">
                {['D3.js', 'Plotly', 'Tableau', 'PowerBI', 'React', 'Python'].map((tech) => (
                  <div key={tech} className="text-center group">
                    <div className="w-16 h-16 bg-slate-800/50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-slate-700/50 transition-colors duration-300">
                      <span className="text-2xl font-bold text-slate-400 group-hover:text-cyan-400 transition-colors duration-300">
                        {tech.charAt(0)}
                      </span>
                    </div>
                    <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors duration-300">{tech}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Ready to Visualize Your Data?
              </h2>
              <p className="text-xl text-slate-400 mb-12">
                Let&apos;s transform your data into powerful visual insights that drive business decisions.
              </p>
              <button className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1">
                <span className="flex items-center gap-2">
                  Start Your Project
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