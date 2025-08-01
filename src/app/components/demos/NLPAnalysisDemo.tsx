'use client';

import React, { useState } from 'react';

interface SentimentResult {
  text: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  confidence: number;
  entities: { text: string; type: string; }[];
}

const sampleTexts = [
  "I absolutely love this new AI technology! It's revolutionary and will change everything.",
  "The service was okay, nothing special but not terrible either.",
  "This is completely disappointing and waste of time. Very frustrated.",
  "Our company achieved 150% growth this quarter thanks to AI automation."
];

export default function NLPAnalysisDemo() {
  const [inputText, setInputText] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<SentimentResult | null>(null);

  const analyzeText = async (text: string) => {
    setIsAnalyzing(true);
    setResult(null);

    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock sentiment analysis
    const words = text.toLowerCase();
    let sentiment: 'positive' | 'negative' | 'neutral' = 'neutral';
    let confidence = 0.5;

    const positiveWords = ['love', 'great', 'amazing', 'excellent', 'revolutionary', 'growth', 'success'];
    const negativeWords = ['hate', 'terrible', 'awful', 'disappointed', 'waste', 'frustrated'];

    const positiveCount = positiveWords.filter(word => words.includes(word)).length;
    const negativeCount = negativeWords.filter(word => words.includes(word)).length;

    if (positiveCount > negativeCount) {
      sentiment = 'positive';
      confidence = Math.min(0.6 + (positiveCount * 0.1), 0.95);
    } else if (negativeCount > positiveCount) {
      sentiment = 'negative';
      confidence = Math.min(0.6 + (negativeCount * 0.1), 0.95);
    }

    // Mock entity extraction
    const entities = [];
    if (words.includes('ai') || words.includes('technology')) {
      entities.push({ text: 'AI Technology', type: 'TECHNOLOGY' });
    }
    if (words.includes('company') || words.includes('business')) {
      entities.push({ text: 'Company', type: 'ORGANIZATION' });
    }
    if (words.match(/\d+%/)) {
      entities.push({ text: text.match(/\d+%/)?.[0] || '', type: 'PERCENTAGE' });
    }

    setResult({
      text,
      sentiment,
      confidence,
      entities
    });
    setIsAnalyzing(false);
  };

  const useSampleText = (text: string) => {
    setInputText(text);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-4">NLP Sentiment Analysis</h3>

      {/* Input Section */}
      <div className="mb-6">
        <label className="block text-sm text-slate-400 mb-2">Enter text to analyze:</label>
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Type your text here..."
          className="w-full p-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-cyan-400 focus:outline-none resize-none"
          rows={3}
        />
        <div className="flex gap-2 mt-2 flex-wrap">
          {sampleTexts.map((text, index) => (
            <button
              key={index}
              onClick={() => useSampleText(text)}
              className="text-xs px-3 py-1 bg-slate-700 hover:bg-slate-600 text-slate-300 rounded-full transition-colors duration-200"
            >
              Sample {index + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Analyze Button */}
      <button
        onClick={() => analyzeText(inputText)}
        disabled={!inputText.trim() || isAnalyzing}
        className={`w-full py-3 rounded-lg font-medium transition-all duration-300 ${
          !inputText.trim() || isAnalyzing
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-purple-500 to-orange-500 text-white hover:shadow-lg'
        }`}
      >
        {isAnalyzing ? (
          <div className="flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Analyzing...
          </div>
        ) : (
          'Analyze Text'
        )}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-6 space-y-4">
          {/* Sentiment Result */}
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-slate-400">Sentiment</span>
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                result.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                result.sentiment === 'negative' ? 'bg-red-500/20 text-red-400' :
                'bg-slate-500/20 text-slate-400'
              }`}>
                {result.sentiment.toUpperCase()}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Confidence:</span>
              <div className="flex-1 bg-slate-700 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    result.sentiment === 'positive' ? 'bg-green-400' :
                    result.sentiment === 'negative' ? 'bg-red-400' :
                    'bg-slate-400'
                  }`}
                  style={{ width: `${result.confidence * 100}%` }}
                />
              </div>
              <span className="text-sm text-white font-medium">
                {(result.confidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>

          {/* Entities */}
          {result.entities.length > 0 && (
            <div className="bg-slate-800/50 p-4 rounded-lg">
              <div className="text-sm text-slate-400 mb-3">Detected Entities</div>
              <div className="flex flex-wrap gap-2">
                {result.entities.map((entity, index) => (
                  <div key={index} className="flex items-center gap-2 bg-slate-700/50 px-3 py-1 rounded-full">
                    <span className="text-cyan-400 text-sm">{entity.text}</span>
                    <span className="text-xs text-slate-400 bg-slate-600 px-2 py-0.5 rounded-full">
                      {entity.type}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Processing Steps */}
          <div className="bg-slate-800/50 p-4 rounded-lg">
            <div className="text-sm text-slate-400 mb-3">Processing Pipeline</div>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-slate-300">Text Preprocessing</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-slate-300">Tokenization</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-slate-300">Sentiment Classification</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-green-400 rounded-full" />
                <span className="text-slate-300">Entity Recognition</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}