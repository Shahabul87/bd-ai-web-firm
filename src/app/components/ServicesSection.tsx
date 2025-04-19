import React from 'react';

export default function ServicesSection() {
  return (
    <section className="py-16 relative">
      <div className="absolute top-20 -right-60 w-96 h-96 bg-indigo-600 rounded-full filter blur-3xl opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">AI-Powered</span> Services
          </h2>
          <p className="text-gray-300 max-w-2xl mx-auto">
            We leverage advanced AI technology to create websites that not only look amazing but also convert visitors into customers.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <ServiceCard 
            title="Custom Web Design"
            description="AI-generated designs that perfectly match your brand identity and business goals."
            icon="✨"
          />
          <ServiceCard 
            title="E-Commerce Solutions"
            description="Smart online stores that learn from customer behavior to maximize sales."
            icon="🛒"
          />
          <ServiceCard 
            title="Web Applications"
            description="Powerful, scalable applications with intelligent features to automate your business."
            icon="⚙️"
          />
          <ServiceCard 
            title="SEO Optimization"
            description="AI-driven SEO strategies that help your website rank higher in search results."
            icon="📈"
          />
          <ServiceCard 
            title="Content Generation"
            description="High-quality, engaging content created using advanced language models."
            icon="📝"
          />
          <ServiceCard 
            title="Support & Maintenance"
            description="Intelligent systems monitoring and updating your website 24/7."
            icon="🔧"
          />
        </div>
      </div>
    </section>
  );
}

function ServiceCard({ title, description, icon }: { title: string; description: string; icon: string }) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border border-gray-800 hover:border-purple-500/50 transition-all hover:translate-y-[-5px] hover:shadow-lg hover:shadow-purple-600/10">
      <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-500 rounded-lg flex items-center justify-center mb-4 text-2xl">
        {icon}
      </div>
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-400">{description}</p>
    </div>
  );
} 