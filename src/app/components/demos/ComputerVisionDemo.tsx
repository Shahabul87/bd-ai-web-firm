'use client';

import React, { useState } from 'react';

interface DetectionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  confidence: number;
}

const mockImages = [
  { name: 'Street Scene', objects: ['car', 'person', 'traffic_light', 'building'] },
  { name: 'Office Space', objects: ['person', 'laptop', 'chair', 'table'] },
  { name: 'Retail Store', objects: ['person', 'product', 'shelf', 'cart'] },
  { name: 'Factory Floor', objects: ['machine', 'worker', 'equipment', 'safety_gear'] }
];

export default function ComputerVisionDemo() {
  const [selectedImage, setSelectedImage] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [detections, setDetections] = useState<DetectionBox[]>([]);
  const [processingStep, setProcessingStep] = useState(0);

  const processImage = async () => {
    setIsProcessing(true);
    setDetections([]);
    setProcessingStep(0);

    const steps = ['Loading image...', 'Preprocessing...', 'Running inference...', 'Post-processing...'];
    
    for (let i = 0; i < steps.length; i++) {
      setProcessingStep(i);
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    // Generate mock detections based on selected image
    const imageObjects = mockImages[selectedImage].objects;
    const mockDetections: DetectionBox[] = imageObjects.map((obj, index) => ({
      x: 10 + (index * 60) + Math.random() * 40,
      y: 10 + Math.random() * 60,
      width: 40 + Math.random() * 30,
      height: 30 + Math.random() * 25,
      label: obj,
      confidence: 0.75 + Math.random() * 0.2
    }));

    setDetections(mockDetections);
    setIsProcessing(false);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50">
      <h3 className="text-xl font-bold text-white mb-4">Object Detection</h3>

      {/* Image Selection */}
      <div className="mb-4">
        <label className="block text-sm text-slate-400 mb-2">Select image to analyze:</label>
        <div className="flex gap-2 flex-wrap">
          {mockImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setSelectedImage(index)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                selectedImage === index
                  ? 'bg-cyan-400 text-slate-900'
                  : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
              }`}
            >
              {img.name}
            </button>
          ))}
        </div>
      </div>

      {/* Mock Image Canvas */}
      <div className="mb-4">
        <div className="relative bg-slate-800 rounded-lg overflow-hidden" style={{ aspectRatio: '16/9' }}>
          {/* Base Image Pattern */}
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-800" />
            {/* Grid pattern to simulate image */}
            <div className="absolute inset-0 opacity-30" 
                 style={{ 
                   backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.1) 1px, transparent 0)',
                   backgroundSize: '20px 20px'
                 }} 
            />
          </div>

          {/* Image Label */}
          <div className="absolute top-4 left-4 bg-slate-900/80 px-3 py-1 rounded-full">
            <span className="text-sm text-slate-300">{mockImages[selectedImage].name}</span>
          </div>

          {/* Detection Boxes */}
          {detections.map((detection, index) => (
            <div
              key={index}
              className="absolute border-2 border-cyan-400 bg-cyan-400/10"
              style={{
                left: `${detection.x}%`,
                top: `${detection.y}%`,
                width: `${detection.width}%`,
                height: `${detection.height}%`,
              }}
            >
              <div className="absolute -top-6 left-0 bg-cyan-400 text-slate-900 text-xs px-2 py-1 rounded whitespace-nowrap">
                {detection.label} ({(detection.confidence * 100).toFixed(0)}%)
              </div>
            </div>
          ))}

          {/* Processing Overlay */}
          {isProcessing && (
            <div className="absolute inset-0 bg-slate-900/80 flex items-center justify-center">
              <div className="text-center">
                <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <div className="text-cyan-400 font-medium">Processing...</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Process Button */}
      <button
        onClick={processImage}
        disabled={isProcessing}
        className={`w-full py-3 rounded-lg font-medium transition-all duration-300 mb-4 ${
          isProcessing
            ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
            : 'bg-gradient-to-r from-orange-500 to-green-400 text-white hover:shadow-lg'
        }`}
      >
        {isProcessing ? 'Processing...' : 'Detect Objects'}
      </button>

      {/* Processing Steps */}
      {isProcessing && (
        <div className="mb-4 bg-slate-800/50 p-4 rounded-lg">
          <div className="text-sm text-slate-400 mb-3">Processing Pipeline</div>
          <div className="space-y-2">
            {['Loading image...', 'Preprocessing...', 'Running inference...', 'Post-processing...'].map((step, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <div className={`w-2 h-2 rounded-full ${
                  index <= processingStep ? 'bg-green-400' : 'bg-slate-600'
                }`} />
                <span className={index <= processingStep ? 'text-slate-300' : 'text-slate-500'}>
                  {step}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {detections.length > 0 && (
        <div className="bg-slate-800/50 p-4 rounded-lg">
          <div className="text-sm text-slate-400 mb-3">Detection Results</div>
          <div className="space-y-2">
            {detections.map((detection, index) => (
              <div key={index} className="flex items-center justify-between bg-slate-700/50 p-3 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-400 rounded-full" />
                  <span className="text-white font-medium capitalize">
                    {detection.label.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-sm text-slate-400">Confidence:</div>
                  <div className="text-sm text-cyan-400 font-medium">
                    {(detection.confidence * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-slate-600">
            <div className="text-sm text-slate-400">
              Detected {detections.length} object{detections.length !== 1 ? 's' : ''} in {mockImages[selectedImage].name}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}