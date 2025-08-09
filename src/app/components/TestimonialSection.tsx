import React from 'react';

export default function TestimonialSection() {
  return (
    <section className="py-16 relative">
      <div className="absolute top-40 left-0 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-5 dark:opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Vision</span>
          </h2>
          <p className="text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
            Building the future of AI-autonomous development. Low-cost, high-quality solutions for modern businesses.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-slate-300 dark:border-gray-800 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">
                🚀
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Ready to Launch</h3>
              <p className="text-slate-700 dark:text-gray-300 mb-6">
                Starting a new AI-powered development company with cutting-edge autonomous coding capabilities.
              </p>
              <div className="text-sm text-purple-600 dark:text-purple-400 font-medium">Coming Soon</div>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-slate-300 dark:border-gray-800 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-cyan-400 to-green-500 rounded-full flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">
                🤖
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">AI-Autonomous</h3>
              <p className="text-slate-700 dark:text-gray-300 mb-6">
                Led by AI autonomous and agentic coding for efficient, cost-effective development solutions.
              </p>
              <div className="text-sm text-cyan-600 dark:text-cyan-400 font-medium">Innovation First</div>
            </div>
          </div>
          
          <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-slate-300 dark:border-gray-800 relative">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-full flex items-center justify-center text-3xl shadow-lg mx-auto mb-4">
                💡
              </div>
              <h3 className="text-xl font-bold mb-4 text-slate-900 dark:text-white">Low-Cost Solutions</h3>
              <p className="text-slate-700 dark:text-gray-300 mb-6">
                Delivering high-quality websites and AI solutions at competitive prices through automation.
              </p>
              <div className="text-sm text-orange-600 dark:text-orange-400 font-medium">Affordable Excellence</div>
            </div>
          </div>
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-lg">
            Ready to start your AI project? 
            <a href="#contact" className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 font-medium">Contact us today.</a>
          </p>
        </div>
      </div>
    </section>
  );
}

 