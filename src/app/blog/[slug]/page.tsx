'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import DOMPurify from 'isomorphic-dompurify';
import { marked } from 'marked';

// This would typically come from a CMS or database
const blogPosts = [
  {
    id: 'ai-model-development-fundamentals',
    title: 'AI Model Development Fundamentals: A Complete Guide for Businesses',
    description: 'Learn the essential steps of AI model development, from data preprocessing to deployment. Complete guide for businesses looking to implement machine learning solutions.',
    content: `# AI Model Development Fundamentals: A Complete Guide for Businesses

## Introduction

Artificial Intelligence model development has become crucial for businesses seeking competitive advantages through data-driven insights. This comprehensive guide covers the fundamental steps every business should understand when implementing AI solutions.

## The AI Model Development Process

### 1. Problem Definition and Requirements Gathering
- **Business Objective Alignment**: Clearly define what business problem the AI model will solve
- **Success Metrics**: Establish measurable KPIs for model performance
- **Data Requirements**: Identify what data is needed and available
- **Resource Planning**: Determine budget, timeline, and technical requirements

### 2. Data Collection and Preprocessing
Data quality determines model success. Our preprocessing pipeline includes:

\`\`\`python
# Example data preprocessing pipeline
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split

def preprocess_data(raw_data):
    # Data cleaning
    cleaned_data = raw_data.dropna()

    # Feature engineering
    features = create_features(cleaned_data)

    # Normalization
    scaler = StandardScaler()
    normalized_features = scaler.fit_transform(features)

    return normalized_features
\`\`\`

### 3. Model Architecture Selection
Choose the right algorithm based on your problem type:
- **Classification**: Random Forest, SVM, Neural Networks
- **Regression**: Linear Regression, XGBoost, Deep Learning
- **Time Series**: ARIMA, LSTM, Prophet
- **Computer Vision**: CNN, ResNet, YOLO
- **NLP**: BERT, GPT, Transformer models

### 4. Training and Validation
Implement robust training procedures:
- **Cross-validation**: Ensure model generalizes well
- **Hyperparameter tuning**: Optimize model performance
- **Early stopping**: Prevent overfitting
- **Model versioning**: Track different model iterations

### 5. Model Evaluation
Key metrics to monitor:
- **Accuracy**: Overall correctness
- **Precision/Recall**: Class-specific performance
- **F1-Score**: Balanced metric for imbalanced datasets
- **AUC-ROC**: Classifier performance across thresholds
- **Business Impact**: ROI and actual business value

## Best Practices for Production Deployment

### MLOps Implementation
- **Automated testing**: Unit tests for model components
- **CI/CD pipelines**: Automated deployment workflows
- **Model monitoring**: Track performance degradation
- **A/B testing**: Compare model versions in production

### Scalability Considerations
- **Infrastructure**: Cloud-based solutions (AWS SageMaker, Azure ML)
- **API design**: RESTful endpoints for model serving
- **Caching**: Improve response times for frequent predictions
- **Load balancing**: Handle high-volume inference requests

## Industry-Specific Applications

### FinTech
- **Risk Assessment**: Credit scoring models
- **Fraud Detection**: Transaction anomaly detection
- **Algorithmic Trading**: Market prediction models
- **Regulatory Compliance**: Automated reporting

### Healthcare
- **Diagnostic Imaging**: Medical image analysis
- **Drug Discovery**: Molecular property prediction
- **Electronic Health Records**: Clinical decision support
- **Telemedicine**: Symptom assessment chatbots

### E-commerce
- **Recommendation Systems**: Product suggestions
- **Demand Forecasting**: Inventory optimization
- **Price Optimization**: Dynamic pricing strategies
- **Customer Service**: AI-powered chatbots

## Conclusion

AI model development requires careful planning, technical expertise, and ongoing maintenance. Partner with experienced AI developers like CraftsAI to ensure your AI initiatives deliver measurable business value.

## Next Steps

Ready to start your AI journey? Contact CraftsAI for a free consultation and custom AI model development services.

[Get Started with Your AI Project](/quote)`,
    author: 'CraftsAI AI Team',
    publishDate: '2025-08-09',
    readTime: '12 min read',
    category: 'AI Development',
    tags: ['Machine Learning', 'AI Models', 'Business Intelligence', 'MLOps', 'Data Science'],
    featured: true,
    seoKeywords: ['AI model development', 'machine learning business', 'AI implementation guide', 'MLOps best practices']
  }
];

interface BlogPostPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const [post, setPost] = useState<typeof blogPosts[0] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    params.then(resolvedParams => {
      const foundPost = blogPosts.find(p => p.id === resolvedParams.slug);
      if (foundPost) {
        setPost(foundPost);
      }
      setLoading(false);
    });
  }, [params]);

  if (loading) {
    return (
      <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
        <Header />
        <div className="pt-20 flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-500"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!post) {
    notFound();
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
      <Header />

      <main className="pt-20 pb-16">
        <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <nav className="flex items-center space-x-2 text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>
            <Link href="/blog" className="hover:text-indigo-500 dark:hover:text-indigo-400 transition-colors">
              Blog
            </Link>
            <span>/</span>
            <span style={{ color: 'var(--foreground)' }}>{post.title}</span>
          </nav>

          {/* Article Header */}
          <header className="mb-12">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <span className="px-3 py-1 bg-indigo-500/10 rounded-full text-sm text-indigo-500 dark:text-indigo-400 border border-indigo-500/20">
                  {post.category}
                </span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{post.readTime}</span>
                <span style={{ color: 'var(--text-secondary)' }}>&bull;</span>
                <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>{post.publishDate}</span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight" style={{ color: 'var(--foreground)' }}>
                {post.title}
              </h1>

              <p className="text-xl mb-8 leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                {post.description}
              </p>

              <div className="flex items-center gap-4 pb-8 border-b" style={{ borderColor: 'var(--border-default)' }}>
                <div>
                  <p className="font-medium" style={{ color: 'var(--foreground)' }}>{post.author}</p>
                  <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>AI Development Expert</p>
                </div>
              </div>
            </motion.div>
          </header>

          {/* Article Content */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-bold prose-h2:text-3xl prose-h3:text-2xl prose-h4:text-xl prose-p:leading-relaxed prose-a:text-indigo-500 dark:prose-a:text-indigo-400 prose-a:no-underline hover:prose-a:underline prose-code:text-indigo-500 dark:prose-code:text-indigo-400 prose-pre:border"
            style={{ '--tw-prose-body': 'var(--text-secondary)', '--tw-prose-headings': 'var(--foreground)', '--tw-prose-bold': 'var(--foreground)', '--tw-prose-pre-bg': 'var(--surface-elevated)', '--tw-prose-pre-border': 'var(--border-default)' } as React.CSSProperties}
          >
            <div dangerouslySetInnerHTML={{ __html: convertMarkdownToHtml(post.content) }} />
          </motion.div>

          {/* Tags */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-12 pt-8 border-t"
            style={{ borderColor: 'var(--border-default)' }}
          >
            <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--foreground)' }}>Tags</h3>
            <div className="flex flex-wrap gap-2">
              {post.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 rounded-full text-sm cursor-pointer transition-colors"
                  style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)', border: '1px solid var(--border-default)' }}
                >
                  {tag}
                </span>
              ))}
            </div>
          </motion.div>

          {/* CTA Section */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-16 p-8 rounded-2xl text-center border"
            style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
          >
            <h3 className="text-2xl font-bold mb-4" style={{ color: 'var(--foreground)' }}>
              Ready to Build Your Next Project?
            </h3>
            <p className="mb-6 max-w-2xl mx-auto" style={{ color: 'var(--text-secondary)' }}>
              Get expert guidance on AI-powered web and app development
              tailored to your business needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/quote"
                className="px-8 py-3 bg-gradient-to-r from-indigo-500 to-violet-500 text-white font-semibold rounded-lg hover:shadow-xl hover:shadow-indigo-500/25 transition-all duration-300 transform hover:scale-105"
              >
                Get Free Consultation
              </Link>
              <Link
                href="/services"
                className="px-8 py-3 font-semibold rounded-lg transition-all duration-300 border"
                style={{ background: 'var(--surface-elevated)', color: 'var(--foreground)', borderColor: 'var(--border-default)' }}
              >
                Explore Our Services
              </Link>
            </div>
          </motion.div>
        </article>

        {/* Related Articles */}
        <section className="mt-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12" style={{ color: 'var(--foreground)' }}>Related Articles</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((relatedPost, index) => (
                <motion.div
                  key={relatedPost.id}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="group"
                >
                  <Link href={`/blog/${relatedPost.id}`}>
                    <div
                      className="rounded-xl p-6 backdrop-blur-sm border hover:border-indigo-500/30 transition-all duration-300 h-full"
                      style={{ background: 'var(--card-bg)', borderColor: 'var(--card-border)' }}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        <span
                          className="px-3 py-1 rounded-full text-xs"
                          style={{ background: 'var(--surface-elevated)', color: 'var(--text-secondary)' }}
                        >
                          {relatedPost.category}
                        </span>
                        <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>{relatedPost.readTime}</span>
                      </div>

                      <h3 className="text-lg font-semibold mb-3 group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors line-clamp-2" style={{ color: 'var(--foreground)' }}>
                        {relatedPost.title}
                      </h3>

                      <p className="text-sm line-clamp-2" style={{ color: 'var(--text-secondary)' }}>
                        {relatedPost.description}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

// Secure markdown to HTML conversion with XSS protection
function convertMarkdownToHtml(markdown: string): string {
  marked.setOptions({
    breaks: true,
    gfm: true
  });

  const rawHtml = marked.parse(markdown) as string;

  const sanitizedHtml = DOMPurify.sanitize(rawHtml, {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'a', 'code', 'pre', 'blockquote',
      'strong', 'em', 'ul', 'ol', 'li', 'br',
      'img', 'table', 'thead', 'tbody', 'tr', 'td', 'th'
    ],
    ALLOWED_ATTR: [
      'href', 'class', 'id', 'target', 'rel',
      'src', 'alt', 'width', 'height'
    ],
    FORCE_BODY: true,
    ADD_ATTR: ['target', 'rel'],
    ADD_TAGS: ['article', 'section']
  });

  return sanitizedHtml;
}
