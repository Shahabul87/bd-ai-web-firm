'use client';

import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';
import CodePlayground from '../components/CodePlayground';

export default function PlaygroundPage() {
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
                  <span className="block text-white">AI Code</span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500">
                    Playground
                  </span>
                </h1>
                <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12">
                  Experiment with real AI algorithms and see them in action. Try machine learning, natural language processing, computer vision, and data visualization code examples.
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-8">
                  {[
                    { name: 'Machine Learning', icon: '🧠' },
                    { name: 'Natural Language Processing', icon: '💬' },
                    { name: 'Computer Vision', icon: '👁️' },
                    { name: 'Data Visualization', icon: '📊' }
                  ].map((tech, index) => (
                    <div key={index} className="flex items-center gap-2 px-4 py-2 bg-slate-800/50 rounded-full border border-slate-600/30">
                      <span className="text-lg">{tech.icon}</span>
                      <span className="text-sm text-slate-300">{tech.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Main Playground */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <CodePlayground />
            </div>
          </section>

          {/* Features Section */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  Why Use Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Playground</span>?
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Experience the power of AI development with our interactive learning environment.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Instant Execution</h3>
                  <p className="text-slate-400">
                    Run AI algorithms instantly in your browser without any setup or installation required.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">📚</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Learn by Doing</h3>
                  <p className="text-slate-400">
                    Hands-on learning with real AI implementations covering machine learning, NLP, and computer vision.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-orange-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-green-400 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🔧</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Customizable</h3>
                  <p className="text-slate-400">
                    Modify code examples, experiment with parameters, and see immediate results in the output panel.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-green-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-cyan-400 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🎯</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Real-World Examples</h3>
                  <p className="text-slate-400">
                    Production-ready code examples that demonstrate actual AI applications used in business.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">⚡</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Performance Optimized</h3>
                  <p className="text-slate-400">
                    Efficient algorithms and optimized code examples that demonstrate best practices in AI development.
                  </p>
                </div>

                <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50 hover:border-purple-400/30 transition-all duration-300">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6">
                    <span className="text-2xl">🌐</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4 text-white">Multi-Language Support</h3>
                  <p className="text-slate-400">
                    Examples in Python, JavaScript, and other popular languages for AI and web development.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Learning Path */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold mb-4">
                  AI Learning <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-500">Pathway</span>
                </h2>
                <p className="text-slate-400 max-w-2xl mx-auto">
                  Follow a structured path from beginner to advanced AI development skills.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                  {
                    level: "Beginner",
                    title: "Data Processing",
                    description: "Learn data manipulation, cleaning, and preprocessing techniques.",
                    topics: ["Pandas", "NumPy", "Data Cleaning", "Visualization"],
                    color: "from-green-400 to-cyan-400"
                  },
                  {
                    level: "Intermediate",
                    title: "Machine Learning",
                    description: "Build predictive models and understand ML algorithms.",
                    topics: ["Scikit-learn", "Classification", "Regression", "Clustering"],
                    color: "from-cyan-400 to-purple-500"
                  },
                  {
                    level: "Advanced",
                    title: "Deep Learning",
                    description: "Neural networks, computer vision, and NLP applications.",
                    topics: ["TensorFlow", "PyTorch", "CNNs", "RNNs"],
                    color: "from-purple-500 to-orange-500"
                  },
                  {
                    level: "Expert",
                    title: "AI Deployment",
                    description: "Deploy and scale AI models in production environments.",
                    topics: ["MLOps", "Docker", "Cloud AI", "Monitoring"],
                    color: "from-orange-500 to-green-400"
                  }
                ].map((path, index) => (
                  <div key={index} className="relative">
                    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 hover:border-slate-600/50 transition-all duration-300">
                      <div className={`w-12 h-12 bg-gradient-to-r ${path.color} rounded-xl flex items-center justify-center mb-4`}>
                        <span className="text-white font-bold">{index + 1}</span>
                      </div>
                      
                      <div className="text-sm text-slate-400 mb-2">{path.level}</div>
                      <h3 className="text-xl font-bold mb-3 text-white">{path.title}</h3>
                      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{path.description}</p>
                      
                      <div className="space-y-2">
                        {path.topics.map((topic, topicIndex) => (
                          <div key={topicIndex} className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 bg-slate-500 rounded-full" />
                            <span className="text-xs text-slate-300">{topic}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {index < 3 && (
                      <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-slate-600 to-slate-700" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* CTA Section */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-8">
                Ready to Build AI Solutions?
              </h2>
              <p className="text-xl text-slate-400 mb-12">
                Take your AI skills to the next level with our professional development services and consulting.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button className="group px-8 py-4 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full text-white font-semibold hover:shadow-xl hover:shadow-cyan-400/30 transition-all duration-300 transform hover:-translate-y-1">
                  <span className="flex items-center gap-2">
                    Get Professional Help
                    <svg className="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </span>
                </button>
                <button className="px-8 py-4 border-2 border-slate-600 rounded-full text-white font-semibold hover:border-cyan-400 hover:shadow-lg transition-all duration-300">
                  View Our Portfolio
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