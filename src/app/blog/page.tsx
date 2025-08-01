'use client';

import { useState } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';

interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  category: 'AI Trends' | 'Case Studies' | 'Tech Insights' | 'Industry News' | 'Tutorials';
  author: string;
  date: string;
  readTime: string;
  tags: string[];
  featured: boolean;
}

const blogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'The Future of AI in Web Development: What to Expect in 2025',
    excerpt: 'Explore the emerging AI technologies that are revolutionizing web development, from automated code generation to intelligent user experience optimization.',
    content: `The landscape of web development is rapidly evolving with AI integration becoming more sophisticated and accessible. As we move into 2025, several key trends are reshaping how we build digital experiences.

**Automated Code Generation**
AI-powered tools are now capable of generating production-ready code from simple descriptions. These systems understand context, follow best practices, and can even optimize for performance automatically.

**Intelligent UX Optimization**
Machine learning algorithms analyze user behavior patterns to dynamically adjust interfaces, improving conversion rates and user satisfaction without manual intervention.

**Predictive Performance Monitoring**
AI systems can predict performance bottlenecks before they impact users, enabling proactive optimization and maintenance.

The integration of these technologies isn't just about automation—it's about amplifying human creativity and allowing developers to focus on higher-level problem-solving.`,
    category: 'AI Trends',
    author: 'Alex Morgan',
    date: '2024-12-15',
    readTime: '8 min read',
    tags: ['AI', 'Web Development', '2025 Trends', 'Automation'],
    featured: true
  },
  {
    id: '2',
    title: 'Case Study: How MedTech Solutions Achieved 40% Cost Reduction with AI',
    excerpt: 'Deep dive into our healthcare AI implementation that transformed diagnostic processes and delivered measurable ROI within 6 months.',
    content: `MedTech Solutions approached us with a challenge: their diagnostic processes were slow, expensive, and prone to human error. Through strategic AI implementation, we transformed their operations.

**The Challenge**
- 45-minute average diagnostic time
- 15% error rate in initial assessments
- High operational costs
- Staff burnout from repetitive tasks

**Our Solution**
We implemented a comprehensive AI diagnostic assistance system that analyzes medical data, suggests diagnoses, and flags potential issues for human review.

**Key Technologies Used:**
- Computer vision for medical imaging
- Natural language processing for patient records
- Machine learning for pattern recognition
- Real-time data processing pipelines

**Results Achieved:**
- 23% faster diagnosis time
- 99.2% accuracy rate
- 40% reduction in operational costs
- $1.8M annual savings

The success of this project demonstrates the transformative power of AI when properly implemented in healthcare environments.`,
    category: 'Case Studies',
    author: 'Jamie Chen',
    date: '2024-12-10',
    readTime: '12 min read',
    tags: ['Healthcare AI', 'Case Study', 'ROI', 'Diagnostics'],
    featured: true
  },
  {
    id: '3',
    title: 'Understanding Large Language Models: A Developer\'s Guide',
    excerpt: 'Learn how to effectively integrate LLMs into your applications, from API selection to prompt engineering best practices.',
    content: `Large Language Models (LLMs) have become essential tools for modern developers. This guide covers everything you need to know to get started.

**Choosing the Right Model**
Different models excel at different tasks. GPT models are great for general text generation, while specialized models like Codex excel at code generation.

**Prompt Engineering Best Practices**
- Be specific and clear in your instructions
- Provide examples when possible
- Use structured prompts for consistent outputs
- Implement error handling for edge cases

**Integration Strategies**
- API-first approach for flexibility
- Caching strategies for performance
- Rate limiting and cost management
- Security considerations for sensitive data

**Performance Optimization**
- Batch processing for efficiency
- Response streaming for better UX
- Model selection based on use case
- Monitoring and analytics implementation

Understanding these fundamentals will help you build more effective AI-powered applications.`,
    category: 'Tutorials',
    author: 'Robin Taylor',
    date: '2024-12-05',
    readTime: '15 min read',
    tags: ['LLMs', 'API Integration', 'Prompt Engineering', 'Development'],
    featured: false
  },
  {
    id: '4',
    title: 'Retail AI Revolution: Personalization at Scale',
    excerpt: 'How artificial intelligence is transforming retail experiences through advanced personalization and predictive analytics.',
    content: `The retail industry is experiencing a fundamental shift driven by AI-powered personalization technologies that deliver individualized experiences at unprecedented scale.

**The Personalization Imperative**
Modern consumers expect tailored experiences. Generic product recommendations and one-size-fits-all marketing are no longer sufficient in today's competitive landscape.

**AI-Driven Solutions**
- Recommendation engines that learn from behavior
- Dynamic pricing optimization
- Predictive inventory management
- Personalized marketing campaigns

**Implementation Challenges**
- Data quality and integration
- Privacy and security considerations
- Real-time processing requirements
- Scalability concerns

**Success Metrics**
Retailers implementing comprehensive AI personalization see:
- 47% increase in sales conversion
- 65% improvement in customer engagement
- 32% reduction in cart abandonment
- 28% better inventory turnover

The key to success lies in starting with high-quality data and building systems that can adapt and learn from customer interactions.`,
    category: 'Industry News',
    author: 'Sam Wilson',
    date: '2024-11-28',
    readTime: '10 min read',
    tags: ['Retail AI', 'Personalization', 'E-commerce', 'Customer Experience'],
    featured: false
  },
  {
    id: '5',
    title: 'Building Secure AI Applications: Security Best Practices',
    excerpt: 'Essential security considerations when developing AI-powered applications, from data protection to model security.',
    content: `As AI applications become more prevalent, security considerations become increasingly critical. This guide outlines essential practices for building secure AI systems.

**Data Security Fundamentals**
- Encryption at rest and in transit
- Access control and authentication
- Data anonymization techniques
- Compliance with regulations (GDPR, HIPAA)

**Model Security Considerations**
- Protecting against adversarial attacks
- Model poisoning prevention
- Intellectual property protection
- Secure model deployment

**Infrastructure Security**
- Container security for AI workloads
- API gateway protection
- Network segmentation
- Monitoring and logging

**Privacy-Preserving Techniques**
- Differential privacy implementation
- Federated learning approaches
- Homomorphic encryption
- Secure multi-party computation

**Compliance and Governance**
Ensure your AI systems meet industry standards and regulatory requirements through proper documentation, audit trails, and governance frameworks.

Security should be built into AI systems from the ground up, not added as an afterthought.`,
    category: 'Tech Insights',
    author: 'Lisa Rodriguez',
    date: '2024-11-20',
    readTime: '18 min read',
    tags: ['AI Security', 'Privacy', 'Compliance', 'Best Practices'],
    featured: false
  },
  {
    id: '6',
    title: 'Computer Vision in Manufacturing: Quality Control Revolution',
    excerpt: 'How computer vision technology is transforming manufacturing quality control processes with unprecedented accuracy and speed.',
    content: `Manufacturing industries are experiencing a quality control revolution driven by computer vision technologies that surpass human inspection capabilities.

**Traditional Quality Control Limitations**
- Human fatigue and inconsistency
- Limited inspection speed
- Subjective quality assessments
- High labor costs

**Computer Vision Advantages**
- 24/7 consistent operation
- Microscopic defect detection
- Real-time processing capabilities
- Objective, quantifiable results

**Implementation Technologies**
- High-resolution industrial cameras
- Deep learning image classification
- Edge computing for real-time processing
- Integration with manufacturing systems

**Case Study Results**
Our recent implementation achieved:
- 99.7% defect detection accuracy
- 25% reduction in production costs
- 85% improvement in quality scores
- ROI achieved within 8 months

**Future Developments**
- 3D inspection capabilities
- Predictive quality analytics
- Autonomous quality decision-making
- Integration with IoT sensors

Computer vision is not just improving quality control—it's enabling entirely new approaches to manufacturing excellence.`,
    category: 'Case Studies',
    author: 'David Park',
    date: '2024-11-15',
    readTime: '14 min read',
    tags: ['Computer Vision', 'Manufacturing', 'Quality Control', 'Automation'],
    featured: true
  }
];

export default function BlogPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = ['all', ...Array.from(new Set(blogPosts.map(post => post.category)))];
  
  const filteredPosts = blogPosts.filter(post => {
    const matchesCategory = selectedCategory === 'all' || post.category === selectedCategory;
    const matchesSearch = searchQuery === '' || 
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  const featuredPosts = blogPosts.filter(post => post.featured);

  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />
        
        <main className="pt-16 md:pt-20">
          {/* Hero Section */}
          <section className="py-20 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-8">
                  <span className="block text-white">AI Insights & </span>
                  <span className="block text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-orange-500">
                    Resources
                  </span>
                </h1>
                <p className="text-lg sm:text-xl text-slate-400 max-w-3xl mx-auto mb-6 sm:mb-8">
                  Stay ahead of the AI revolution with expert insights, case studies, and practical guides from our team of AI specialists.
                </p>
                
                {/* Search Bar */}
                <div className="max-w-sm sm:max-w-md mx-auto">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search articles..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full px-3 sm:px-4 py-2 sm:py-3 pl-10 sm:pl-12 bg-slate-800/50 border border-slate-600/50 rounded-full text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50 text-sm sm:text-base"
                    />
                    <svg className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 w-4 h-4 sm:w-5 sm:h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Featured Posts */}
          {searchQuery === '' && selectedCategory === 'all' && (
            <section className="py-16 relative">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <h2 className="text-3xl font-bold mb-12 text-center">
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-500">
                    Featured Articles
                  </span>
                </h2>
                
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8 mb-12 lg:mb-16">
                  {featuredPosts.slice(0, 2).map((post) => (
                    <article key={post.id} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:border-purple-400/30 transition-all duration-300 group">
                      <div className="p-4 sm:p-6 lg:p-8">
                        <div className="flex items-center gap-2 mb-4">
                          <span className="px-3 py-1 bg-purple-500/20 text-purple-300 rounded-full text-sm font-medium">
                            {post.category}
                          </span>
                          <span className="text-slate-400 text-sm">•</span>
                          <span className="text-slate-400 text-sm">{post.readTime}</span>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl lg:text-2xl font-bold mb-3 lg:mb-4 text-white group-hover:text-purple-300 transition-colors duration-300">
                          {post.title}
                        </h3>
                        
                        <p className="text-slate-400 mb-4 lg:mb-6 leading-relaxed text-sm sm:text-base">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-400 to-pink-500 rounded-full flex items-center justify-center">
                              <span className="text-sm font-bold">
                                {post.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="text-white font-medium">{post.author}</div>
                              <div className="text-slate-400 text-sm">{post.date}</div>
                            </div>
                          </div>
                          
                          <button className="px-3 sm:px-4 py-2 bg-purple-500/20 text-purple-300 rounded-lg hover:bg-purple-500/30 transition-colors duration-200 text-sm sm:text-base">
                            Read More
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>
          )}

          {/* Category Filter */}
          <section className="py-8 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-wrap gap-2 justify-center">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-3 sm:px-4 py-2 rounded-full font-medium transition-all duration-200 text-sm sm:text-base ${
                      selectedCategory === category
                        ? 'bg-gradient-to-r from-purple-400 to-pink-500 text-white'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                    }`}
                  >
                    {category === 'all' ? 'All Articles' : category}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* All Posts */}
          <section className="py-16 relative">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              {filteredPosts.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">🔍</div>
                  <h3 className="text-2xl font-bold mb-4 text-white">No articles found</h3>
                  <p className="text-slate-400">Try adjusting your search terms or category filter.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {filteredPosts.map((post) => (
                    <article key={post.id} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600/50 transition-all duration-300 group">
                      <div className="p-4 sm:p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            post.category === 'AI Trends' ? 'bg-blue-500/20 text-blue-300' :
                            post.category === 'Case Studies' ? 'bg-green-500/20 text-green-300' :
                            post.category === 'Tech Insights' ? 'bg-purple-500/20 text-purple-300' :
                            post.category === 'Industry News' ? 'bg-orange-500/20 text-orange-300' :
                            'bg-cyan-500/20 text-cyan-300'
                          }`}>
                            {post.category}
                          </span>
                          <span className="text-slate-400 text-sm">•</span>
                          <span className="text-slate-400 text-sm">{post.readTime}</span>
                        </div>
                        
                        <h3 className="text-lg sm:text-xl font-bold mb-3 text-white group-hover:text-slate-300 transition-colors duration-300 leading-tight">
                          {post.title}
                        </h3>
                        
                        <p className="text-slate-400 mb-4 text-xs sm:text-sm leading-relaxed line-clamp-3">
                          {post.excerpt}
                        </p>
                        
                        <div className="flex flex-wrap gap-1 mb-4">
                          {post.tags.slice(0, 3).map((tag) => (
                            <span key={tag} className="px-2 py-1 bg-slate-700/50 text-slate-400 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-gradient-to-r from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                              <span className="text-xs font-bold">
                                {post.author.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div>
                              <div className="text-white text-sm font-medium">{post.author}</div>
                              <div className="text-slate-400 text-xs">{post.date}</div>
                            </div>
                          </div>
                          
                          <button className="text-slate-400 hover:text-white transition-colors duration-200">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </div>
          </section>

          {/* Newsletter Signup */}
          <section className="py-20 relative">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 p-12 rounded-2xl border border-purple-400/30">
                <h2 className="text-3xl md:text-4xl font-bold mb-6">
                  Stay Updated with AI Insights
                </h2>
                <p className="text-xl text-slate-400 mb-8">
                  Get the latest AI trends, case studies, and expert insights delivered to your inbox.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="flex-1 px-4 py-3 bg-slate-800/50 border border-slate-600/50 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-purple-400/50 focus:ring-1 focus:ring-purple-400/50"
                  />
                  <button className="px-6 py-3 bg-gradient-to-r from-purple-400 to-pink-500 rounded-lg text-white font-semibold hover:shadow-xl hover:shadow-purple-400/30 transition-all duration-300 transform hover:-translate-y-1">
                    Subscribe
                  </button>
                </div>
                
                <p className="text-slate-500 text-sm mt-4">
                  No spam, unsubscribe at any time.
                </p>
              </div>
            </div>
          </section>
        </main>
        
        <Footer />
      </div>
    </PageBackground>
  );
}