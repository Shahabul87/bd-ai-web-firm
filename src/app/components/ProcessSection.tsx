import React from 'react';

export default function ProcessSection() {
  return (
    <section className="py-16 bg-gradient-to-b from-black to-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">AI-Powered</span> Process
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We've streamlined the web development process using artificial intelligence to deliver exceptional results faster.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <ProcessStep 
            number="01"
            title="Discovery"
            description="We analyze your business needs and goals to understand your target audience and competition."
          />
          <ProcessStep 
            number="02"
            title="AI Design"
            description="Our AI systems generate multiple design concepts based on your requirements and brand identity."
          />
          <ProcessStep 
            number="03"
            title="Development"
            description="AI-assisted coding accelerates the development process without compromising quality."
          />
          <ProcessStep 
            number="04"
            title="Launch"
            description="We deploy your website with comprehensive testing and provide ongoing support."
          />
        </div>
        
        <div className="mt-16 text-center">
          <button className="px-8 py-3 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 text-white font-medium hover:opacity-90 transition-opacity">
            Start Your Project
          </button>
        </div>
      </div>
    </section>
  );
}

function ProcessStep({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="flex flex-col items-center text-center p-6">
      <div className="relative mb-6">
        <div className="w-16 h-16 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-xl font-bold">
          {number}
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full blur-xl opacity-30 -z-10"></div>
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
      
      {number !== "04" && (
        <div className="hidden md:block w-full h-0.5 bg-gradient-to-r from-transparent via-purple-500/30 to-transparent mt-12 relative">
          <div className="absolute top-1/2 right-0 transform translate-x-1/2 -translate-y-1/2 w-3 h-3 bg-purple-500 rounded-full"></div>
        </div>
      )}
    </div>
  );
} 