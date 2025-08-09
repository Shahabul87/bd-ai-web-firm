"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useInView } from 'framer-motion';

export default function ServicesSection() {
  const [activeCapability, setActiveCapability] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true });

  const capabilities = [
    {
      id: 'ai-model-training',
      title: 'AI Model Development',
      description: 'End-to-end AI model training, validation, and deployment. From data preprocessing to production-ready models.',
      icon: '🧠',
      gradient: 'from-cyan-400 to-purple-500',
      component: MachineLearningDemo
    },
    {
      id: 'data-pipelines',
      title: 'Data Processing Pipelines',
      description: 'Automated data preprocessing, ETL workflows, and real-time data streaming for AI applications.',
      icon: '🔄',
      gradient: 'from-purple-500 to-orange-500',
      component: DataVisualizationDemo
    },
    {
      id: 'web-development',
      title: 'Autonomous Web Development',
      description: 'Low-cost, high-quality websites and web applications built with AI-powered autonomous coding.',
      icon: '🌐',
      gradient: 'from-orange-500 to-green-400',
      component: AIAutomationDemo
    },
    {
      id: 'fintech-analysis',
      title: 'FinTech Data Analysis',
      description: 'Financial data visualization, risk analysis, trading insights, and compliance reporting solutions.',
      icon: '💹',
      gradient: 'from-green-400 to-cyan-400',
      component: PredictiveAnalyticsDemo
    },
    {
      id: 'healthcare-analytics',
      title: 'Healthcare Analytics',
      description: 'Medical data analysis, patient insights, diagnostic support, and healthcare workflow optimization.',
      icon: '🏥',
      gradient: 'from-cyan-400 to-orange-500',
      component: ComputerVisionDemo
    },
    {
      id: 'customer-intelligence',
      title: 'Customer Analysis',
      description: 'Customer behavior analysis, segmentation, lifetime value prediction, and personalization engines.',
      icon: '👥',
      gradient: 'from-purple-500 to-green-400',
      component: NLPDemo
    }
  ];

  // Auto-cycle through capabilities with optimized requestAnimationFrame
  useEffect(() => {
    if (!isInView) return;
    
    let isActive = true;
    let currentTimeout: NodeJS.Timeout;
    let animationFrame: number;
    
    const cycleCapabilities = () => {
      if (!isActive) return;
      
      setIsTransitioning(true);
      currentTimeout = setTimeout(() => {
        if (!isActive) return;
        setActiveCapability((prev) => (prev + 1) % capabilities.length);
        currentTimeout = setTimeout(() => {
          if (!isActive) return;
          setIsTransitioning(false);
          // Schedule next cycle using requestAnimationFrame for better performance
          animationFrame = requestAnimationFrame(() => {
            currentTimeout = setTimeout(cycleCapabilities, 9500); // 10s total cycle
          });
        }, 500);
      }, 300);
    };
    
    // Initial delay before starting
    currentTimeout = setTimeout(cycleCapabilities, 10000);
    
    return () => {
      isActive = false;
      if (currentTimeout) clearTimeout(currentTimeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isInView, capabilities.length]);

  // Handle manual capability switching with smooth transitions
  const handleCapabilityClick = (index: number) => {
    if (index === activeCapability || isTransitioning) return;
    
    setIsTransitioning(true);
    setTimeout(() => {
      setActiveCapability(index);
      setTimeout(() => {
        setIsTransitioning(false);
      }, 400);
    }, 200);
  };

  return (
    <section ref={ref} className="py-20 relative overflow-hidden bg-gradient-to-b from-slate-100 via-slate-200 to-slate-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background Effects */}
      <div className="absolute inset-0">
        <div className="absolute top-20 -right-40 w-80 h-80 bg-purple-500 rounded-full filter blur-3xl opacity-5 dark:opacity-10"></div>
        <div className="absolute bottom-20 -left-40 w-80 h-80 bg-cyan-500 rounded-full filter blur-3xl opacity-5 dark:opacity-10"></div>
      </div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-500 animate-gradient">Development</span> Services
          </h2>
          <p className="text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto">
            Autonomous AI development, model training, data pipelines, and low-cost web solutions. 
            Experience agentic coding that delivers results fast.
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {capabilities.map((capability, index) => (
            <button
              key={capability.id}
              onClick={() => handleCapabilityClick(index)}
              disabled={isTransitioning}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-600 ease-out transform smooth-click layout-stable ${
                activeCapability === index
                  ? `bg-gradient-to-r ${capability.gradient} text-white shadow-lg scale-105`
                  : 'bg-slate-300/50 dark:bg-slate-800/50 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-400/50 dark:hover:bg-slate-700/50 hover:scale-105'
              } ${isTransitioning ? 'opacity-70' : 'opacity-100'}`}
            >
              <span className="mr-2">{capability.icon}</span>
              <span className="hidden sm:inline">{capability.title}</span>
              <span className="sm:hidden">{capability.title.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* Active Capability Display */}
        <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center transition-opacity duration-500 ease-out ${
          isTransitioning ? 'opacity-70' : 'opacity-100'
        }`}>
          {/* Info Panel */}
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 bg-gradient-to-br ${capabilities[activeCapability].gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg`}>
                {capabilities[activeCapability].icon}
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white mb-2">
                  {capabilities[activeCapability].title}
                </h3>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-green-400 text-sm font-medium">AI Powered</span>
                </div>
              </div>
            </div>
            
            <p className="text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
              {capabilities[activeCapability].description}
            </p>
            
            {/* Features List */}
            <FeaturesList capabilityId={capabilities[activeCapability].id} />
            
            {/* CTA */}
            <div className="pt-4">
              <button className={`group px-6 py-3 rounded-full bg-gradient-to-r ${capabilities[activeCapability].gradient} text-white font-semibold hover:shadow-xl transition-all duration-500 ease-out transform hover:-translate-y-1 smooth-click active:scale-95`}>
                <span className="flex items-center gap-2">
                  Explore {capabilities[activeCapability].title}
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </span>
              </button>
            </div>
          </div>

          {/* Interactive Demo Panel */}
          <div className="bg-white/90 dark:bg-slate-900/90 rounded-3xl border border-slate-300/50 dark:border-slate-700/50 p-8 backdrop-blur-sm neural-glow transition-all duration-500 ease-out">
            {React.createElement(capabilities[activeCapability].component, { 
              isActive: true
            })}
          </div>
        </div>

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2 mt-12">
          {capabilities.map((_, index) => (
            <div
              key={index}
              className={`h-1 rounded-full transition-all duration-500 ${
                index === activeCapability ? 'w-12 bg-cyan-400' : 'w-3 bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeaturesList({ capabilityId }: { capabilityId: string }) {
  const features = {
    'ai-model-training': [
      'Model Training & Validation',
      'Hyperparameter Optimization',
      'Performance Testing',
      'Production Deployment'
    ],
    'data-pipelines': [
      'ETL Workflow Design',
      'Real-time Data Processing',
      'Data Quality Monitoring',
      'Automated Preprocessing'
    ],
    'web-development': [
      'Autonomous Code Generation',
      'Responsive Design',
      'Low-Cost Solutions',
      'Fast Delivery'
    ],
    'fintech-analysis': [
      'Financial Data Visualization',
      'Risk Assessment Models',
      'Trading Analytics',
      'Compliance Reporting'
    ],
    'healthcare-analytics': [
      'Medical Data Processing',
      'Patient Journey Analysis',
      'Diagnostic Support',
      'Workflow Optimization'
    ],
    'customer-intelligence': [
      'Behavior Analysis',
      'Customer Segmentation',
      'Lifetime Value Prediction',
      'Personalization Engines'
    ]
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      {features[capabilityId as keyof typeof features]?.map((feature, index) => (
        <div key={index} className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full flex-shrink-0"></div>
          <span className="text-sm text-slate-600 dark:text-slate-400">{feature}</span>
        </div>
      ))}
    </div>
  );
}

// Individual Demo Components
function DataVisualizationDemo({ isActive }: { isActive: boolean }) {
  const [data, setData] = useState([65, 75, 85, 70, 90, 95, 88]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Initialize mounted state
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let updateTimeout: NodeJS.Timeout;
    let animationFrame: number;
    
    const updateData = () => {
      if (!isComponentActive) return;
      
      setIsProcessing(true);
      updateTimeout = setTimeout(() => {
        if (!isComponentActive) return;
        setData(prev => prev.map(() => Math.floor(Math.random() * 40) + 60));
        updateTimeout = setTimeout(() => {
          if (!isComponentActive) return;
          setIsProcessing(false);
          // Schedule next update using requestAnimationFrame
          animationFrame = requestAnimationFrame(() => {
            updateTimeout = setTimeout(updateData, 4800); // 5s total cycle
          });
        }, 800);
      }, 1200);
    };
    
    // Initial update
    updateTimeout = setTimeout(updateData, 5000);
    
    return () => {
      isComponentActive = false;
      if (updateTimeout) clearTimeout(updateTimeout);
      if (animationFrame) cancelAnimationFrame(animationFrame);
    };
  }, [isActive]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Live Data Dashboard</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isProcessing ? 'bg-orange-400/20 text-orange-400' : 'bg-green-400/20 text-green-400'
        }`}>
          {isProcessing ? 'Processing...' : 'Live'}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="space-y-4">
        <div className="flex items-end gap-2 h-32 justify-center">
          {data.map((value, index) => (
            <div
              key={index}
              className="bg-gradient-to-t from-cyan-400 to-purple-500 rounded-t transition-all duration-1000 ease-out"
              style={{ 
                height: `${(value / 100) * 100}%`,
                width: '20px',
                animationDelay: `${index * 100}ms`
              }}
            />
          ))}
        </div>
        
        {/* Chart Labels */}
        <div className="flex justify-center gap-2">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <span key={day} className="text-xs text-slate-600 dark:text-slate-500 w-[20px] text-center">{day}</span>
          ))}
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="text-center">
          <div className="text-lg font-bold text-cyan-400">
            {mounted ? Math.round(data.reduce((a, b) => a + b) / data.length) : 82}%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Avg Performance</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-purple-400">
            {mounted ? Math.max(...data) : 95}%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Peak Value</div>
        </div>
        <div className="text-center">
          <div className="text-lg font-bold text-orange-400">
            +12%
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-400">Growth</div>
        </div>
      </div>
    </div>
  );
}

function MachineLearningDemo({ isActive }: { isActive: boolean }) {
  const [epoch, setEpoch] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [loss, setLoss] = useState(1.0);
  const [isTraining, setIsTraining] = useState(false);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let trainingFrame: number;
    let restartTimeout: NodeJS.Timeout;
    
    const startTraining = () => {
      if (!isComponentActive) return;
      
      setIsTraining(true);
      setEpoch(0);
      setAccuracy(0);
      setLoss(1.0);
      
      let lastTime = 0;
      const trainingSpeed = 80; // ms between epochs
      
      const trainEpoch = (currentTime: number) => {
        if (!isComponentActive) return;
        
        if (currentTime - lastTime >= trainingSpeed) {
          setEpoch(prev => {
            const newEpoch = prev + 1;
            if (newEpoch >= 100) {
              setIsTraining(false);
              restartTimeout = setTimeout(startTraining, 3000);
              return 100;
            }
            
            // Simulate learning curve
            const progress = newEpoch / 100;
            setAccuracy(Math.min(99.5, 60 + progress * 35 + Math.random() * 5));
            setLoss(Math.max(0.01, 1.0 - progress * 0.95 + Math.random() * 0.1));
            
            return newEpoch;
          });
          lastTime = currentTime;
        }
        
        trainingFrame = requestAnimationFrame(trainEpoch);
      };
      
      trainingFrame = requestAnimationFrame(trainEpoch);
    };
    
    startTraining();
    
    return () => {
      isComponentActive = false;
      if (trainingFrame) cancelAnimationFrame(trainingFrame);
      if (restartTimeout) clearTimeout(restartTimeout);
    };
  }, [isActive]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Model Training Progress</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isTraining ? 'bg-orange-400/20 text-orange-400 animate-pulse' : 'bg-green-400/20 text-green-400'
        }`}>
          {isTraining ? 'Training...' : 'Complete'}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600 dark:text-slate-400">Epoch {epoch}/100</span>
          <span className="text-slate-600 dark:text-slate-400">{Math.round((epoch / 100) * 100)}%</span>
        </div>
        <div className="w-full bg-slate-300 dark:bg-slate-800 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-purple-500 to-orange-500 h-2 rounded-full transition-all duration-100"
            style={{ width: `${(epoch / 100) * 100}%` }}
          />
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-200/50 dark:bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Accuracy</div>
          <div className="text-xl font-bold text-green-400">{accuracy.toFixed(2)}%</div>
        </div>
        <div className="bg-slate-200/50 dark:bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-1">Loss</div>
          <div className="text-xl font-bold text-red-400">{loss.toFixed(3)}</div>
        </div>
      </div>

      {/* Neural Network Visualization */}
      <div className="flex justify-center">
        <div className="grid grid-cols-4 gap-2">
          {Array.from({ length: 16 }, (_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all duration-300 ${
                isTraining && (i + epoch) % 4 === 0
                  ? 'bg-purple-400 animate-pulse'
                  : 'bg-slate-400 dark:bg-slate-600'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function NLPDemo({ isActive }: { isActive: boolean }) {
  const [currentText, setCurrentText] = useState('');
  const [sentiment, setSentiment] = useState({ score: 0, label: 'Neutral' });
  const [entities, setEntities] = useState<string[]>([]);
  
  const sampleTexts = useMemo(() => [
    "I absolutely love this new AI technology! It's revolutionary and will change everything.",
    "The customer service was disappointing and slow. Not satisfied with the experience.",
    "Apple announced new iPhone features. Microsoft and Google are also competing in AI space.",
    "The quarterly earnings exceeded expectations. Revenue grew by 25% this quarter."
  ], []);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let textIndex = 0;
    let typeFrame: number;
    let analysisTimeout: NodeJS.Timeout;
    let nextTextTimeout: NodeJS.Timeout;
    
    const analyzeText = () => {
      if (!isComponentActive) return;
      
      const text = sampleTexts[textIndex];
      setCurrentText('');
      
      // Optimized typing animation using requestAnimationFrame
      let charIndex = 0;
      let lastTime = 0;
      const typingSpeed = 50; // ms between characters
      
      const typeChar = (currentTime: number) => {
        if (!isComponentActive) return;
        
        if (currentTime - lastTime >= typingSpeed) {
          setCurrentText(text.substring(0, charIndex + 1));
          charIndex++;
          lastTime = currentTime;
          
          if (charIndex > text.length) {
            // Simulate analysis after typing completes
            analysisTimeout = setTimeout(() => {
              if (!isComponentActive) return;
              
              // Mock sentiment analysis
              const sentimentScore = Math.random() * 2 - 1; // -1 to 1
              setSentiment({
                score: sentimentScore,
                label: sentimentScore > 0.1 ? 'Positive' : sentimentScore < -0.1 ? 'Negative' : 'Neutral'
              });
              
              // Mock entity extraction
              const words = text.split(' ');
              const mockEntities = words.filter(word => 
                word.length > 5 || ['Apple', 'Microsoft', 'Google', 'iPhone'].includes(word)
              );
              setEntities(mockEntities.slice(0, 3));
            }, 1000);
            return;
          }
        }
        
        if (charIndex <= text.length) {
          typeFrame = requestAnimationFrame(typeChar);
        }
      };
      
      typeFrame = requestAnimationFrame(typeChar);
      textIndex = (textIndex + 1) % sampleTexts.length;
    };
    
    const scheduleNextText = () => {
      if (isComponentActive) {
        nextTextTimeout = setTimeout(() => {
          analyzeText();
          scheduleNextText();
        }, 5000);
      }
    };
    
    analyzeText(); // Start immediately
    scheduleNextText();
    
    return () => {
      isComponentActive = false;
      if (typeFrame) cancelAnimationFrame(typeFrame);
      if (analysisTimeout) clearTimeout(analysisTimeout);
      if (nextTextTimeout) clearTimeout(nextTextTimeout);
    };
  }, [isActive, sampleTexts]);

  return (
    <div className="space-y-6">
      <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Text Analysis Engine</h4>
      
      {/* Input Text */}
      <div className="bg-slate-800/50 rounded-lg p-4 min-h-[80px]">
        <div className="text-sm text-slate-600 dark:text-slate-400 mb-2">Processing Text:</div>
        <div className="text-slate-800 dark:text-slate-200 font-mono text-sm leading-relaxed">
          {currentText}
          <span className="animate-pulse">|</span>
        </div>
      </div>

      {/* Analysis Results */}
      <div className="grid grid-cols-1 gap-4">
        {/* Sentiment */}
        <div className="bg-slate-200/30 dark:bg-slate-800/30 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-slate-300">Sentiment Analysis</span>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              sentiment.label === 'Positive' ? 'bg-green-400/20 text-green-400' :
              sentiment.label === 'Negative' ? 'bg-red-400/20 text-red-400' :
              'bg-slate-400/20 text-slate-400'
            }`}>
              {sentiment.label}
            </span>
          </div>
          <div className="w-full bg-slate-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-1000 ${
                sentiment.score > 0 ? 'bg-green-400' : 'bg-red-400'
              }`}
              style={{ width: `${Math.abs(sentiment.score) * 50 + 50}%` }}
            />
          </div>
        </div>

        {/* Entities */}
        <div className="bg-slate-200/30 dark:bg-slate-800/30 rounded-lg p-4">
          <div className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Detected Entities</div>
          <div className="flex flex-wrap gap-2">
            {entities.map((entity, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-orange-400/20 text-orange-400 rounded text-xs font-medium"
              >
                {entity}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ComputerVisionDemo({ isActive }: { isActive: boolean }) {
  const [isScanning, setIsScanning] = useState(false);
  const [detections, setDetections] = useState<Array<{x: number, y: number, label: string, confidence: number}>>([]);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let detectionTimeout: NodeJS.Timeout;
    let nextDetectionTimeout: NodeJS.Timeout;
    
    const runDetection = () => {
      if (!isComponentActive) return;
      
      setIsScanning(true);
      setDetections([]);
      
      detectionTimeout = setTimeout(() => {
        if (!isComponentActive) return;
        
        // Simulate object detection
        const mockDetections = [
          { x: 20, y: 15, label: 'Person', confidence: 0.94 },
          { x: 60, y: 25, label: 'Car', confidence: 0.87 },
          { x: 75, y: 50, label: 'Building', confidence: 0.91 }
        ];
        setDetections(mockDetections);
        setIsScanning(false);
        
        // Schedule next detection
        nextDetectionTimeout = setTimeout(runDetection, 6000);
      }, 2000);
    };
    
    runDetection(); // Start immediately
    
    return () => {
      isComponentActive = false;
      if (detectionTimeout) clearTimeout(detectionTimeout);
      if (nextDetectionTimeout) clearTimeout(nextDetectionTimeout);
    };
  }, [isActive]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Object Detection</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isScanning ? 'bg-blue-400/20 text-blue-400 animate-pulse' : 'bg-green-400/20 text-green-400'
        }`}>
          {isScanning ? 'Scanning...' : 'Complete'}
        </div>
      </div>

      {/* Image Canvas */}
      <div className="relative bg-gradient-to-br from-slate-700 to-slate-800 rounded-lg h-48 overflow-hidden">
        {/* Scanning Effect */}
        {isScanning && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-full h-0.5 bg-cyan-400 animate-pulse"></div>
            <div className="absolute w-0.5 h-full bg-cyan-400 animate-pulse"></div>
          </div>
        )}
        
        {/* Detection Boxes */}
        {detections.map((detection, index) => (
          <div
            key={index}
            className="absolute border-2 border-green-400 rounded animate-pulse"
            style={{
              left: `${detection.x}%`,
              top: `${detection.y}%`,
              width: '60px',
              height: '40px'
            }}
          >
            <div className="absolute -top-6 left-0 bg-green-400 text-black px-2 py-1 rounded text-xs font-medium">
              {detection.label} {Math.round(detection.confidence * 100)}%
            </div>
          </div>
        ))}
        
        {/* Mock Image Elements */}
        <div className="absolute inset-0 flex items-center justify-center opacity-30">
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 9 }, (_, i) => (
              <div key={i} className="w-8 h-8 bg-slate-500 rounded"></div>
            ))}
          </div>
        </div>
      </div>

      {/* Detection Results */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-slate-300">Detected Objects</div>
        {detections.map((detection, index) => (
          <div key={index} className="flex items-center justify-between bg-slate-800/50 rounded p-2">
            <span className="text-sm text-slate-300">{detection.label}</span>
            <span className="text-xs text-green-400 font-medium">
              {Math.round(detection.confidence * 100)}% confidence
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PredictiveAnalyticsDemo({ isActive }: { isActive: boolean }) {
  const [forecastData, setForecastData] = useState([45, 52, 48, 61, 55, 67, 59, 74]);
  const [isForecasting, setIsForecasting] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [randomMetrics, setRandomMetrics] = useState({ growth: 15, accuracy: 87, peak: 2 });

  // Initialize mounted state and random metrics
  useEffect(() => {
    setMounted(true);
    setRandomMetrics({
      growth: Math.round(Math.random() * 20 + 10),
      accuracy: Math.round(Math.random() * 10 + 85),
      peak: Math.ceil(Math.random() * 4)
    });
  }, []);

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let forecastTimeout: NodeJS.Timeout;
    let nextForecastTimeout: NodeJS.Timeout;
    
    const runForecast = () => {
      if (!isComponentActive) return;
      
      setIsForecasting(true);
      
      forecastTimeout = setTimeout(() => {
        if (!isComponentActive) return;
        
        // Generate new forecast data
        const baseValue = 50;
        const trend = Math.random() * 10 - 5; // -5 to +5 trend
        const newData = Array.from({ length: 8 }, (_, i) => {
          const trendValue = baseValue + (trend * i / 4);
          const noise = (Math.random() - 0.5) * 10;
          return Math.max(20, Math.min(100, trendValue + noise));
        });
        
        setForecastData(newData);
        setIsForecasting(false);
        
        // Schedule next forecast
        nextForecastTimeout = setTimeout(runForecast, 5000);
      }, 2000);
    };
    
    runForecast();
    
    return () => {
      isComponentActive = false;
      if (forecastTimeout) clearTimeout(forecastTimeout);
      if (nextForecastTimeout) clearTimeout(nextForecastTimeout);
    };
  }, [isActive]);

  const futureData = [78, 82, 85, 89]; // Mock future predictions

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Sales Forecasting</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isForecasting ? 'bg-purple-400/20 text-purple-400 animate-pulse' : 'bg-green-400/20 text-green-400'
        }`}>
          {isForecasting ? 'Analyzing...' : 'Predicted'}
        </div>
      </div>

      {/* Forecast Chart */}
      <div className="space-y-4">
        <div className="flex items-end gap-1 h-32">
          {/* Historical Data */}
          {forecastData.map((value, index) => (
            <div key={index} className="flex flex-col items-center flex-1">
              <div
                className="bg-gradient-to-t from-cyan-400 to-purple-500 rounded-t transition-all duration-1000"
                style={{ height: `${(value / 100) * 100}%` }}
              />
            </div>
          ))}
          
          {/* Predicted Data */}
          {futureData.map((value, index) => (
            <div key={`future-${index}`} className="flex flex-col items-center flex-1">
              <div
                className="bg-gradient-to-t from-orange-400 to-red-500 rounded-t transition-all duration-1000 opacity-70 border-2 border-dashed border-orange-400"
                style={{ height: `${(value / 100) * 100}%` }}
              />
            </div>
          ))}
        </div>
        
        {/* Timeline */}
        <div className="flex gap-1">
          {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((month, index) => (
            <div key={month} className="flex-1 text-center">
              <span className={`text-xs ${index >= 8 ? 'text-orange-400' : 'text-slate-500'}`}>
                {month}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Forecast Metrics */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-sm text-green-400 font-bold">+{mounted ? randomMetrics.growth : 15}%</div>
          <div className="text-xs text-slate-400">Growth</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-sm text-cyan-400 font-bold">{mounted ? randomMetrics.accuracy : 87}%</div>
          <div className="text-xs text-slate-400">Accuracy</div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3 text-center">
          <div className="text-sm text-purple-400 font-bold">Q{mounted ? randomMetrics.peak : 2}</div>
          <div className="text-xs text-slate-400">Peak</div>
        </div>
      </div>
    </div>
  );
}

function AIAutomationDemo({ isActive }: { isActive: boolean }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [randomStats, setRandomStats] = useState({ tasks: 147, time: 23 });

  // Initialize mounted state and random stats
  useEffect(() => {
    setMounted(true);
    setRandomStats({
      tasks: Math.floor(Math.random() * 50) + 100,
      time: Math.floor(Math.random() * 10) + 15
    });
  }, []);

  const workflowSteps = [
    { name: 'Data Ingestion', status: 'completed', duration: 2 },
    { name: 'Processing', status: 'active', duration: 3 },
    { name: 'Analysis', status: 'pending', duration: 2 },
    { name: 'Decision', status: 'pending', duration: 1 },
    { name: 'Action', status: 'pending', duration: 2 }
  ];

  useEffect(() => {
    if (!isActive) return;
    
    let isComponentActive = true;
    let stepTimeout: NodeJS.Timeout;
    let completeTimeout: NodeJS.Timeout;
    let restartTimeout: NodeJS.Timeout;
    
    const runWorkflow = () => {
      if (!isComponentActive) return;
      
      setIsRunning(true);
      setCurrentStep(0);
      
      let currentStepIndex = 0;
      
      const processNextStep = () => {
        if (!isComponentActive) return;
        
        if (currentStepIndex >= workflowSteps.length - 1) {
          completeTimeout = setTimeout(() => {
            if (!isComponentActive) return;
            setIsRunning(false);
            restartTimeout = setTimeout(runWorkflow, 2000);
          }, 1000);
          return;
        }
        
        currentStepIndex++;
        setCurrentStep(currentStepIndex);
        stepTimeout = setTimeout(processNextStep, 1500);
      };
      
      stepTimeout = setTimeout(processNextStep, 1500);
    };
    
    runWorkflow();
    
    return () => {
      isComponentActive = false;
      if (stepTimeout) clearTimeout(stepTimeout);
      if (completeTimeout) clearTimeout(completeTimeout);
      if (restartTimeout) clearTimeout(restartTimeout);
    };
  }, [isActive, workflowSteps.length]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-200">AI Workflow Engine</h4>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          isRunning ? 'bg-blue-400/20 text-blue-400 animate-pulse' : 'bg-green-400/20 text-green-400'
        }`}>
          {isRunning ? 'Processing...' : 'Complete'}
        </div>
      </div>

      {/* Workflow Steps */}
      <div className="space-y-3">
        {workflowSteps.map((step, index) => (
          <div key={step.name} className="flex items-center gap-3">
            {/* Status Indicator */}
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
              index < currentStep ? 'bg-green-400 text-black' :
              index === currentStep ? 'bg-blue-400 text-black animate-pulse' :
              'bg-slate-600 text-slate-400'
            }`}>
              {index < currentStep ? '✓' : index + 1}
            </div>
            
            {/* Step Info */}
            <div className="flex-1">
              <div className={`font-medium ${
                index <= currentStep ? 'text-slate-200' : 'text-slate-500'
              }`}>
                {step.name}
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-slate-700 rounded-full h-1 mt-1">
                <div 
                  className={`h-1 rounded-full transition-all duration-1000 ${
                    index < currentStep ? 'bg-green-400 w-full' :
                    index === currentStep ? 'bg-blue-400' :
                    'bg-transparent w-0'
                  }`}
                  style={{ 
                    width: index === currentStep ? '100%' : undefined
                  }}
                />
              </div>
            </div>
            
            {/* Duration */}
            <div className="text-xs text-slate-500">
              {step.duration}s
            </div>
          </div>
        ))}
      </div>

      {/* Process Statistics */}
      <div className="grid grid-cols-2 gap-4 pt-4">
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Tasks Automated</div>
          <div className="text-lg font-bold text-green-400">
            {isRunning ? 125 : (mounted ? randomStats.tasks : 147)}
          </div>
        </div>
        <div className="bg-slate-800/50 rounded-lg p-3">
          <div className="text-xs text-slate-400 mb-1">Time Saved</div>
          <div className="text-lg font-bold text-purple-400">
            {isRunning ? 18 : (mounted ? randomStats.time : 23)}h
          </div>
        </div>
      </div>
    </div>
  );
}