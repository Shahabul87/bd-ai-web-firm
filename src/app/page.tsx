import Header from './components/Header';
import ParticleBackground from './components/ParticleBackground';

export default function Home() {
  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <ParticleBackground />
      
      <main className="pt-24 md:pt-32">
        {/* Hero Section */}
        <section className="relative overflow-hidden pb-16">
          {/* Background Effects */}
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-20"></div>
          <div className="absolute top-60 -left-40 w-80 h-80 bg-blue-600 rounded-full filter blur-3xl opacity-20"></div>
          
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
              <div className="space-y-8">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold leading-tight">
                  <span className="block">AI-Powered</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-blue-500 to-cyan-400">
                    Web Development
                  </span>
                  <span className="block">For The Future</span>
                </h1>
                
                <p className="text-lg text-gray-300 max-w-lg">
                  We combine cutting-edge AI technology with expert web development to create stunning, intelligent websites in a fraction of the time.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4">
                  <button className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity">
                    Get Started
                  </button>
                  <button className="px-8 py-3 rounded-full border border-gray-600 text-white font-medium hover:bg-white/5 transition-colors">
                    View Portfolio
                  </button>
                </div>
                
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex -space-x-2">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`w-10 h-10 rounded-full border-2 border-black flex items-center justify-center bg-gradient-to-r ${
                        i === 1 ? 'from-purple-600 to-blue-500' : 
                        i === 2 ? 'from-blue-500 to-cyan-400' : 
                        i === 3 ? 'from-cyan-400 to-teal-300' :
                        'from-teal-300 to-green-400'
                      }`}>
                        <span className="text-xs font-bold">AI</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-gray-300">
                    <span className="font-semibold">100+</span> websites launched
                  </p>
                </div>
              </div>
              
              <div className="relative">
                {/* Animated Code Block */}
                <div className="bg-gray-900 rounded-lg p-5 border border-gray-800 shadow-xl max-w-md mx-auto">
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  </div>
                  
                  <div className="font-mono text-sm space-y-2 overflow-hidden">
                    <p><span className="text-cyan-400">const</span> <span className="text-green-400">website</span> = <span className="text-purple-400">AI</span>.<span className="text-yellow-400">create</span>({`{`}</p>
                    <p className="pl-4"><span className="text-pink-400">design</span>: <span className="text-orange-400">&apos;modern&apos;</span>,</p>
                    <p className="pl-4"><span className="text-pink-400">features</span>: [<span className="text-orange-400">&apos;responsive&apos;</span>, <span className="text-orange-400">&apos;fast&apos;</span>, <span className="text-orange-400">&apos;seo-optimized&apos;</span>],</p>
                    <p className="pl-4"><span className="text-pink-400">timeline</span>: <span className="text-purple-400">Days</span>.<span className="text-yellow-400">not</span>(<span className="text-orange-400">&apos;months&apos;</span>)</p>
                    <p>{`}`});</p>
                    <p className="text-gray-400">{/* Your dream website, built with AI magic... */}</p>
                    <p className="text-cyan-400 flex items-center">
                      <span className="inline-block w-2 h-4 bg-cyan-400 mr-1 animate-pulse"></span>
                    </p>
                  </div>
                </div>
                
                {/* Glow Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/20 via-blue-500/20 to-cyan-400/20 blur-xl rounded-full -z-10 animate-pulse"></div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
