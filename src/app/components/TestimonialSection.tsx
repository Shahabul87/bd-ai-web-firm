import React from 'react';

export default function TestimonialSection() {
  return (
    <section className="py-16 relative">
      <div className="absolute top-40 left-0 w-80 h-80 bg-purple-600 rounded-full filter blur-3xl opacity-5 dark:opacity-10"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            What Our <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500">Clients</span> Say
          </h2>
          <p className="text-slate-600 dark:text-gray-300 max-w-2xl mx-auto">
            We&apos;ve helped businesses of all sizes transform their online presence with our AI-powered web development.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <TestimonialCard 
            quote="Inshyra transformed our outdated website into a modern, high-converting digital asset in just two weeks. The AI-generated design exceeded our expectations."
            author="Sarah Johnson"
            company="TechStart Inc."
          />
          <TestimonialCard 
            quote="The AI-powered analytics have helped us understand our customers better than ever before. Our conversion rate increased by 45% in the first month alone."
            author="Michael Chen"
            company="Growth Ventures"
          />
          <TestimonialCard 
            quote="We needed an e-commerce solution fast, and Inshyra delivered in record time. The AI optimization has significantly boosted our sales performance."
            author="Emily Rodriguez"
            company="Fashion Forward"
          />
        </div>
        
        <div className="mt-12 text-center">
          <p className="text-lg">
            Ready to transform your online presence? 
            <a href="#contact" className="ml-2 text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-500 font-medium">Get in touch today.</a>
          </p>
        </div>
      </div>
    </section>
  );
}

function TestimonialCard({ quote, author, company }: { quote: string; author: string; company: string }) {
  return (
    <div className="bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm p-8 rounded-xl border border-slate-300 dark:border-gray-800 relative">
      <div className="absolute -top-5 -left-5 w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-500 rounded-full flex items-center justify-center">
        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
        </svg>
      </div>
      
      <p className="text-slate-700 dark:text-gray-300 mb-6 italic">&ldquo;{quote}&rdquo;</p>
      
      <div className="flex items-center">
        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-600 to-blue-500 flex items-center justify-center text-white font-bold text-sm">
          {author.split(' ').map(name => name[0]).join('')}
        </div>
        <div className="ml-3">
          <h4 className="font-medium text-slate-900 dark:text-white">{author}</h4>
          <p className="text-sm text-slate-600 dark:text-gray-400">{company}</p>
        </div>
      </div>
    </div>
  );
} 