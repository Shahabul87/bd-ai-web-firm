'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { PageBackground } from '../components/PageBackground';

// Mock data for demonstration - replace with real data from analytics APIs
const mockData = {
  organicTraffic: {
    current: 2450,
    previous: 1890,
    growth: 29.6
  },
  keywords: {
    ranking: 127,
    topTen: 23,
    growth: 15.2
  },
  backlinks: {
    total: 89,
    newThisMonth: 12,
    quality: 8.7
  },
  pageSpeed: {
    desktop: 94,
    mobile: 87,
    improvement: 12
  }
};

const keywordData = [
  { keyword: 'AI model development', position: 4, volume: 1200, difficulty: 65 },
  { keyword: 'machine learning consulting', position: 7, volume: 800, difficulty: 58 },
  { keyword: 'autonomous coding', position: 2, volume: 450, difficulty: 42 },
  { keyword: 'data preprocessing pipeline', position: 6, volume: 600, difficulty: 55 },
  { keyword: 'MLOps services', position: 9, volume: 350, difficulty: 48 }
];

const backlinksData = [
  { domain: 'techcrunch.com', authority: 92, type: 'Editorial', status: 'Live' },
  { domain: 'kdnuggets.com', authority: 76, type: 'Guest Post', status: 'Live' },
  { domain: 'towardsdatascience.com', authority: 71, type: 'Resource', status: 'Live' },
  { domain: 'analyticsvidhya.com', authority: 68, type: 'Directory', status: 'Live' },
  { domain: 'clutch.co', authority: 84, type: 'Profile', status: 'Live' }
];

export default function SEODashboard() {
  const [timeframe, setTimeframe] = useState('30d');
  const [loading, setLoading] = useState(false);

  const refreshData = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
  };

  return (
    <PageBackground>
      <div className="min-h-screen text-white">
        <Header />
        
        <main className="pt-20 pb-16">
          {/* Dashboard Header */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500">
                      SEO Performance
                    </span>{' '}
                    <span className="text-white">Dashboard</span>
                  </h1>
                  <p className="text-slate-400">
                    Track your search engine optimization progress and performance metrics
                  </p>
                </div>
                
                <div className="flex items-center gap-4">
                  <select 
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="px-4 py-2 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white focus:outline-none focus:border-cyan-400/50"
                  >
                    <option value="7d">Last 7 days</option>
                    <option value="30d">Last 30 days</option>
                    <option value="90d">Last 90 days</option>
                    <option value="1y">Last year</option>
                  </select>
                  
                  <button
                    onClick={refreshData}
                    disabled={loading}
                    className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-semibold rounded-lg hover:from-cyan-600 hover:to-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Updating...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Refresh Data
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Key Metrics */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Organic Traffic"
                  value={mockData.organicTraffic.current.toLocaleString()}
                  change={mockData.organicTraffic.growth}
                  trend="up"
                  icon="📈"
                  color="from-green-400 to-emerald-500"
                />
                
                <MetricCard
                  title="Keywords Ranking"
                  value={mockData.keywords.ranking}
                  change={mockData.keywords.growth}
                  trend="up"
                  icon="🔍"
                  color="from-blue-400 to-cyan-500"
                />
                
                <MetricCard
                  title="Quality Backlinks"
                  value={mockData.backlinks.total}
                  change={mockData.backlinks.newThisMonth}
                  trend="up"
                  icon="🔗"
                  color="from-purple-400 to-pink-500"
                />
                
                <MetricCard
                  title="Page Speed Score"
                  value={mockData.pageSpeed.desktop}
                  change={mockData.pageSpeed.improvement}
                  trend="up"
                  icon="⚡"
                  color="from-orange-400 to-red-500"
                />
              </div>
            </div>
          </section>

          {/* Detailed Sections */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Keywords Performance */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50"
                >
                  <h3 className="text-2xl font-bold mb-6 text-white">Top Keywords Performance</h3>
                  
                  <div className="space-y-4">
                    {keywordData.map((keyword, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-white">{keyword.keyword}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                            <span>Vol: {keyword.volume.toLocaleString()}</span>
                            <span>KD: {keyword.difficulty}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <span className="text-2xl font-bold text-cyan-400">#{keyword.position}</span>
                            <div className="flex items-center text-green-400">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>

                {/* Backlinks Quality */}
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.1 }}
                  className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50"
                >
                  <h3 className="text-2xl font-bold mb-6 text-white">Recent Backlinks</h3>
                  
                  <div className="space-y-4">
                    {backlinksData.map((link, index) => (
                      <div key={index} className="flex items-center justify-between py-3 border-b border-slate-700/30 last:border-b-0">
                        <div className="flex-1">
                          <p className="font-medium text-white">{link.domain}</p>
                          <div className="flex items-center gap-4 text-sm text-slate-400 mt-1">
                            <span>DA: {link.authority}</span>
                            <span className="px-2 py-1 bg-slate-700/50 rounded text-xs">{link.type}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                            link.status === 'Live' 
                              ? 'bg-green-400/20 text-green-400' 
                              : 'bg-yellow-400/20 text-yellow-400'
                          }`}>
                            {link.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>
            </div>
          </section>

          {/* Traffic Chart Placeholder */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50"
              >
                <h3 className="text-2xl font-bold mb-6 text-white">Organic Traffic Trend</h3>
                
                {/* Placeholder for chart - would integrate with Chart.js or similar */}
                <div className="h-64 bg-slate-700/30 rounded-lg flex items-center justify-center">
                  <div className="text-center text-slate-400">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                    <p className="text-lg">Interactive Chart Component</p>
                    <p className="text-sm">Connect to Google Analytics API for real-time data</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>

          {/* Action Items */}
          <section className="py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                className="bg-gradient-to-r from-slate-800/50 to-slate-700/50 backdrop-blur-sm border border-slate-600/30 rounded-2xl p-8"
              >
                <h3 className="text-2xl font-bold mb-6 text-white">Recommended Actions</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <ActionCard
                    title="Content Optimization"
                    description="Update 3 blog posts with better keyword targeting"
                    priority="High"
                    icon="📝"
                  />
                  
                  <ActionCard
                    title="Technical SEO"
                    description="Fix 5 pages with slow loading speeds"
                    priority="Medium"
                    icon="⚙️"
                  />
                  
                  <ActionCard
                    title="Link Building"
                    description="Reach out to 10 potential link partners"
                    priority="High"
                    icon="🔗"
                  />
                </div>
              </motion.div>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </PageBackground>
  );
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: string;
  color: string;
}

function MetricCard({ title, value, change, trend, icon, color }: MetricCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="bg-slate-800/50 rounded-2xl p-6 backdrop-blur-sm border border-slate-700/50 hover:border-cyan-400/30 transition-all duration-300"
    >
      <div className="flex items-center justify-between mb-4">
        <div className="text-2xl">{icon}</div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r ${color} text-white`}>
          {trend === 'up' ? '+' : ''}{change}%
        </div>
      </div>
      
      <div className="mb-2">
        <h3 className="text-sm font-medium text-slate-400">{title}</h3>
        <p className="text-3xl font-bold text-white">{value}</p>
      </div>
      
      <div className="flex items-center text-sm">
        <svg 
          className={`w-4 h-4 mr-1 ${trend === 'up' ? 'text-green-400' : 'text-red-400'}`} 
          fill="currentColor" 
          viewBox="0 0 20 20"
        >
          <path 
            fillRule="evenodd" 
            d={trend === 'up' 
              ? "M3.293 9.707a1 1 0 010-1.414l6-6a1 1 0 011.414 0l6 6a1 1 0 01-1.414 1.414L11 5.414V17a1 1 0 11-2 0V5.414L4.707 9.707a1 1 0 01-1.414 0z"
              : "M16.707 10.293a1 1 0 010 1.414l-6 6a1 1 0 01-1.414 0l-6-6a1 1 0 111.414-1.414L9 14.586V3a1 1 0 112 0v11.586l4.293-4.293a1 1 0 011.414 0z"
            } 
            clipRule="evenodd" 
          />
        </svg>
        <span className={`${trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
          {change}% vs last period
        </span>
      </div>
    </motion.div>
  );
}

interface ActionCardProps {
  title: string;
  description: string;
  priority: 'High' | 'Medium' | 'Low';
  icon: string;
}

function ActionCard({ title, description, priority, icon }: ActionCardProps) {
  const priorityColor = {
    High: 'bg-red-400/20 text-red-400',
    Medium: 'bg-yellow-400/20 text-yellow-400',
    Low: 'bg-green-400/20 text-green-400'
  };

  return (
    <div className="bg-slate-800/30 rounded-lg p-4 border border-slate-700/30">
      <div className="flex items-center justify-between mb-3">
        <div className="text-xl">{icon}</div>
        <span className={`px-2 py-1 rounded text-xs font-medium ${priorityColor[priority]}`}>
          {priority}
        </span>
      </div>
      
      <h4 className="font-semibold text-white mb-2">{title}</h4>
      <p className="text-sm text-slate-400">{description}</p>
      
      <button className="mt-3 text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
        View Details →
      </button>
    </div>
  );
}