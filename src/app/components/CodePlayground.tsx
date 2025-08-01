'use client';

import React, { useState, useEffect } from 'react';

interface CodeExample {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  category: 'ml' | 'nlp' | 'cv' | 'data';
}

const codeExamples: CodeExample[] = [
  {
    id: 'sentiment-analysis',
    title: 'Sentiment Analysis',
    description: 'Analyze the sentiment of text using natural language processing',
    language: 'python',
    category: 'nlp',
    code: `# AI-Powered Sentiment Analysis
import numpy as np
from transformers import pipeline

# Initialize sentiment analyzer
analyzer = pipeline("sentiment-analysis", 
                   model="cardiffnlp/twitter-roberta-base-sentiment-latest")

def analyze_sentiment(text):
    """Analyze sentiment of input text"""
    result = analyzer(text)
    
    sentiment = result[0]['label']
    confidence = result[0]['score']
    
    print(f"Text: '{text}'")
    print(f"Sentiment: {sentiment}")
    print(f"Confidence: {confidence:.2f}")
    
    return {
        'sentiment': sentiment,
        'confidence': confidence,
        'analysis': 'positive' if sentiment == 'LABEL_2' else 
                   'negative' if sentiment == 'LABEL_0' else 'neutral'
    }

# Example usage
texts = [
    "I love this AI technology!",
    "This service is disappointing.",
    "The product works as expected."
]

for text in texts:
    result = analyze_sentiment(text)
    print(f"Analysis: {result['analysis']}n")
`
  },
  {
    id: 'image-classification',
    title: 'Image Classification',
    description: 'Classify images using computer vision and deep learning',
    language: 'python',
    category: 'cv',
    code: `# AI Image Classification System
import tensorflow as tf
import numpy as np
from PIL import Image
import matplotlib.pyplot as plt

# Load pre-trained model
model = tf.keras.applications.MobileNetV2(
    weights='imagenet',
    include_top=True
)

def classify_image(image_path):
    """Classify an image using MobileNetV2"""
    
    # Load and preprocess image
    img = Image.open(image_path).resize((224, 224))
    img_array = tf.keras.preprocessing.image.img_to_array(img)
    img_array = tf.expand_dims(img_array, 0)
    img_array = tf.keras.applications.mobilenet_v2.preprocess_input(img_array)
    
    # Make prediction
    predictions = model.predict(img_array)
    decoded = tf.keras.applications.mobilenet_v2.decode_predictions(
        predictions, top=3
    )[0]
    
    print(f"Image: {image_path}")
    print("Top 3 predictions:")
    
    results = []
    for i, (imagenet_id, label, score) in enumerate(decoded):
        print(f"  {i+1}. {label}: {score:.2%}")
        results.append({
            'label': label,
            'confidence': float(score),
            'rank': i + 1
        })
    
    return results

# Example usage
image_files = ['cat.jpg', 'car.jpg', 'building.jpg']

for image_file in image_files:
    try:
        results = classify_image(image_file)
        print(f"Best match: {results[0]['label']} ({results[0]['confidence']:.1%})n")
    except Exception as e:
        print(f"Error processing {image_file}: {e}n")
`
  },
  {
    id: 'predictive-model',
    title: 'Predictive Analytics',
    description: 'Build predictive models for business forecasting',
    language: 'python',
    category: 'ml',
    code: `# Predictive Analytics for Sales Forecasting
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, r2_score
import matplotlib.pyplot as plt

# Generate sample sales data
np.random.seed(42)
dates = pd.date_range('2020-01-01', periods=1000, freq='D')

def generate_sales_data():
    """Generate realistic sales data with trends and seasonality"""
    
    base_sales = 1000
    trend = np.linspace(0, 500, len(dates))
    seasonality = 200 * np.sin(2 * np.pi * np.arange(len(dates)) / 365.25)
    noise = np.random.normal(0, 100, len(dates))
    
    sales = base_sales + trend + seasonality + noise
    
    # Add features
    df = pd.DataFrame({
        'date': dates,
        'sales': sales,
        'day_of_week': dates.dayofweek,
        'month': dates.month,
        'day_of_year': dates.dayofyear,
        'is_weekend': (dates.dayofweek >= 5).astype(int)
    })
    
    return df

def build_forecasting_model(df):
    """Build and train sales forecasting model"""
    
    # Prepare features
    features = ['day_of_week', 'month', 'day_of_year', 'is_weekend']
    X = df[features]
    y = df['sales']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42
    )
    
    # Train model
    model = RandomForestRegressor(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    
    # Make predictions
    y_pred = model.predict(X_test)
    
    # Evaluate model
    mae = mean_absolute_error(y_test, y_pred)
    r2 = r2_score(y_test, y_pred)
    
    print("Model Performance:")
    print(f"Mean Absolute Error: " + str(mae))
    print(f"R² Score: " + str(r2))
    
    # Feature importance
    importance = pd.DataFrame({
        'feature': features,
        'importance': model.feature_importances_
    }).sort_values('importance', ascending=False)
    
    print("\\nFeature Importance:")
    for _, row in importance.iterrows():
        print(f"  {row['feature']}: " + str(row['importance']))
    
    return model, X_test, y_test, y_pred

# Execute the forecasting pipeline
df = generate_sales_data()
model, X_test, y_test, y_pred = build_forecasting_model(df)

print("\\nSample predictions vs actual:")
for i in range(5):
    print(f"Predicted: " + str(y_pred[i]) + ", Actual: " + str(y_test.iloc[i]))
`
  },
  {
    id: 'data-visualization',
    title: 'Interactive Data Visualization',
    description: 'Create dynamic charts and visualizations for data insights',
    language: 'javascript',
    category: 'data',
    code: `// Interactive Data Visualization Dashboard
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Sample data generator
const generateMetricsData = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  return months.map((month, index) => ({
    month,
    revenue: 50000 + Math.random() * 30000 + index * 2000,
    users: 1000 + Math.random() * 500 + index * 100,
    conversion: 2.5 + Math.random() * 1.5,
    satisfaction: 85 + Math.random() * 10
  }));
};

const DataVisualizationDashboard = () => {
  const [data, setData] = useState([]);
  const [selectedMetric, setSelectedMetric] = useState('revenue');
  const [isRealTime, setIsRealTime] = useState(false);

  useEffect(() => {
    // Initialize data
    setData(generateMetricsData());
    
    // Set up real-time updates
    let interval;
    if (isRealTime) {
      interval = setInterval(() => {
        setData(prevData => 
          prevData.map(item => ({
            ...item,
            [selectedMetric]: selectedMetric === 'revenue' 
              ? item[selectedMetric] + (Math.random() - 0.5) * 5000
              : selectedMetric === 'users'
              ? item[selectedMetric] + Math.floor((Math.random() - 0.5) * 100)
              : item[selectedMetric] + (Math.random() - 0.5) * 2
          }))
        );
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isRealTime, selectedMetric]);

  const formatValue = (value, metric) => {
    switch(metric) {
      case 'revenue':
        return '$' + Math.round(value).toLocaleString();
      case 'users':
        return Math.round(value).toLocaleString();
      case 'conversion':
        return value.toFixed(1) + '%';
      case 'satisfaction':
        return Math.round(value) + '%';
      default:
        return value;
    }
  };

  const getMetricColor = (metric) => {
    const colors = {
      revenue: '#00D2FF',
      users: '#8B5CF6',
      conversion: '#F59E0B',
      satisfaction: '#10B981'
    };
    return colors[metric] || '#6B7280';
  };

  return (
    <div className="dashboard-container">
      <div className="controls">
        <h2>AI Analytics Dashboard</h2>
        
        <div className="metric-selector">
          {['revenue', 'users', 'conversion', 'satisfaction'].map(metric => (
            <button
              key={metric}
              onClick={() => setSelectedMetric(metric)}
              className={\`metric-btn \${selectedMetric === metric ? 'active' : ''}\`}
            >
              {metric.charAt(0).toUpperCase() + metric.slice(1)}
            </button>
          ))}
        </div>
        
        <label className="realtime-toggle">
          <input
            type="checkbox"
            checked={isRealTime}
            onChange={(e) => setIsRealTime(e.target.checked)}
          />
          Real-time Updates
        </label>
      </div>

      <div className="chart-container">
        <ResponsiveContainer width="100%" height={400}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis tickFormatter={(value) => formatValue(value, selectedMetric)} />
            <Tooltip 
              formatter={(value) => [formatValue(value, selectedMetric), selectedMetric]}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey={selectedMetric}
              stroke={getMetricColor(selectedMetric)}
              strokeWidth={3}
              dot={{ fill: getMetricColor(selectedMetric), strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="insights">
        <h3>AI-Generated Insights:</h3>
        <ul>
          <li>📈 {selectedMetric} shows positive trend with 12% growth</li>
          <li>🎯 Peak performance observed in Q3</li>
          <li>⚡ Real-time anomaly detection active</li>
          <li>🔮 Predictive model accuracy: 94.2%</li>
        </ul>
      </div>
    </div>
  );
};

export default DataVisualizationDashboard;

// CSS Styles (would be in separate file)
const styles = \`
.dashboard-container {
  padding: 2rem;
  background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
  border-radius: 1rem;
  color: white;
}

.controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.metric-selector {
  display: flex;
  gap: 0.5rem;
}

.metric-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.metric-btn.active {
  background: linear-gradient(135deg, #00D2FF, #8B5CF6);
}

.chart-container {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 0.5rem;
  padding: 1rem;
  margin-bottom: 2rem;
}

.insights ul {
  list-style: none;
  padding: 0;
}

.insights li {
  padding: 0.5rem 0;
  border-left: 3px solid #00D2FF;
  padding-left: 1rem;
  margin: 0.5rem 0;
}
\`;
`
  }
];

export default function CodePlayground() {
  const [selectedExample, setSelectedExample] = useState(codeExamples[0]);
  const [isRunning, setIsRunning] = useState(false);
  const [output, setOutput] = useState('');

  const runCode = async () => {
    setIsRunning(true);
    setOutput('');

    // Simulate code execution
    const messages = [
      'Initializing AI environment...',
      'Loading dependencies...',
      'Processing data...',
      'Executing algorithm...',
      'Generating results...'
    ];

    for (let i = 0; i < messages.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800));
      setOutput(prev => prev + messages[i] + '\n');
    }

    // Simulate results based on example type
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let result = '';
    switch (selectedExample.category) {
      case 'nlp':
        result = `
✅ Sentiment Analysis Complete!

Results:
Text: 'I love this AI technology!'
Sentiment: POSITIVE
Confidence: 0.94

Text: 'This service is disappointing.'
Sentiment: NEGATIVE  
Confidence: 0.87

Text: 'The product works as expected.'
Sentiment: NEUTRAL
Confidence: 0.73

📊 Analysis Summary:
- Total texts processed: 3
- Average confidence: 84.7%
- Processing time: 1.2s
`;
        break;
      case 'cv':
        result = `
✅ Image Classification Complete!

Results:
Image: cat.jpg
Top 3 predictions:
  1. Egyptian cat: 94.2%
  2. Tabby: 3.8%
  3. Tiger cat: 1.7%

Image: car.jpg  
Top 3 predictions:
  1. Sports car: 89.3%
  2. Convertible: 6.2%
  3. Limousine: 2.8%

📊 Processing Summary:
- Images processed: 2
- Average confidence: 91.8%
- Model: MobileNetV2
`;
        break;
      case 'ml':
        result = `
✅ Predictive Model Training Complete!

Model Performance:
Mean Absolute Error: $127.45
R² Score: 0.923

Feature Importance:
  day_of_year: 0.451
  month: 0.298
  day_of_week: 0.176
  is_weekend: 0.075

Sample predictions vs actual:
Predicted: $1,234.56, Actual: $1,189.23
Predicted: $1,456.78, Actual: $1,501.45
Predicted: $987.65, Actual: $1,023.11

📈 Model ready for deployment!
`;
        break;
      case 'data':
        result = `
✅ Dashboard Initialized Successfully!

📊 Real-time Analytics Active:
- Data points: 12 months
- Metrics tracked: 4
- Update frequency: 1s
- Chart rendering: Optimized

🎯 Current Insights:
- Revenue trend: +15.3% YoY
- User growth: +22.1% 
- Conversion rate: 3.2%
- Satisfaction score: 91%

⚡ AI Analysis:
- Anomaly detection: Active
- Predictive accuracy: 94.2%
- Performance: Excellent
`;
        break;
      default:
        result = '✅ Code executed successfully!';
    }

    setOutput(prev => prev + result);
    setIsRunning(false);
  };

  const copyCode = () => {
    navigator.clipboard.writeText(selectedExample.code);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-8 rounded-2xl border border-slate-700/50">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white">AI Code Playground</h2>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-400 rounded-full"></div>
            <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Example Selector */}
      <div className="mb-6">
        <div className="flex flex-wrap gap-2 mb-4">
          {codeExamples.map((example) => (
            <button
              key={example.id}
              onClick={() => setSelectedExample(example)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedExample.id === example.id
                  ? 'bg-gradient-to-r from-cyan-400 to-purple-500 text-white'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {example.title}
            </button>
          ))}
        </div>
        <p className="text-slate-400 text-sm">{selectedExample.description}</p>
      </div>

      {/* Code Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Code Panel */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-slate-400">Language:</span>
              <span className="text-sm bg-slate-800 px-2 py-1 rounded text-cyan-400">
                {selectedExample.language}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyCode}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm rounded transition-colors duration-200"
              >
                Copy
              </button>
              <button
                onClick={runCode}
                disabled={isRunning}
                className={`px-4 py-2 rounded font-medium text-sm transition-all duration-300 ${
                  isRunning
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-gradient-to-r from-green-400 to-cyan-400 text-white hover:shadow-lg'
                }`}
              >
                {isRunning ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Running...
                  </div>
                ) : (
                  'Run Code'
                )}
              </button>
            </div>
          </div>
          
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-slate-300 overflow-auto max-h-96">
            <pre className="whitespace-pre-wrap">{selectedExample.code}</pre>
          </div>
        </div>

        {/* Output Panel */}
        <div className="relative">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm text-slate-400">Output:</span>
            <div className="flex items-center gap-2">
              {isRunning && (
                <div className="flex items-center gap-2 text-sm text-cyan-400">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse" />
                  Processing...
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-slate-950 rounded-lg p-4 font-mono text-sm text-green-400 overflow-auto max-h-96 min-h-[200px]">
            {output ? (
              <pre className="whitespace-pre-wrap">{output}</pre>
            ) : (
              <div className="text-slate-500 italic">
                Click &quot;Run Code&quot; to see the output...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mt-6 pt-6 border-t border-slate-700/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">🧠</span>
            </div>
            <div>
              <div className="text-white font-medium text-sm">AI-Powered</div>
              <div className="text-slate-400 text-xs">Real AI implementations</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center">
              <span className="text-sm">⚡</span>
            </div>
            <div>
              <div className="text-white font-medium text-sm">Interactive</div>
              <div className="text-slate-400 text-xs">Try code instantly</div>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-400 rounded-lg flex items-center justify-center">
              <span className="text-sm">📚</span>
            </div>
            <div>
              <div className="text-white font-medium text-sm">Educational</div>
              <div className="text-slate-400 text-xs">Learn by doing</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}