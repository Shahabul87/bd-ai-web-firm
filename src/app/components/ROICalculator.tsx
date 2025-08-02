'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface BusinessMetrics {
  industry: string;
  companySize: string;
  currentRevenue: number;
  operatingCosts: number;
  employeeCount: number;
  processEfficiency: number;
  dataVolume: string;
  currentTechSpend: number;
}

interface AIImpact {
  revenueIncrease: number;
  costReduction: number;
  productivityGain: number;
  timeToValue: number;
  implementationCost: number;
  maintenanceCost: number;
}

interface ROIResults {
  monthlyBenefits: number;
  yearlyBenefits: number;
  totalCosts: number;
  netROI: number;
  paybackPeriod: number;
  breakEvenMonth: number;
}

const industryMultipliers = {
  'E-commerce': { revenue: 1.8, cost: 1.5, productivity: 1.4 },
  'Healthcare': { revenue: 1.3, cost: 1.7, productivity: 1.6 },
  'Finance': { revenue: 1.5, cost: 1.8, productivity: 1.7 },
  'Manufacturing': { revenue: 1.4, cost: 2.0, productivity: 1.8 },
  'Retail': { revenue: 1.6, cost: 1.4, productivity: 1.3 },
  'Technology': { revenue: 2.0, cost: 1.6, productivity: 1.5 },
  'Other': { revenue: 1.2, cost: 1.3, productivity: 1.2 }
};

const companySizeMultipliers = {
  'Startup (1-10 employees)': { base: 0.8, complexity: 0.7 },
  'Small (11-50 employees)': { base: 1.0, complexity: 1.0 },
  'Medium (51-200 employees)': { base: 1.3, complexity: 1.2 },
  'Large (201-1000 employees)': { base: 1.6, complexity: 1.5 },
  'Enterprise (1000+ employees)': { base: 2.2, complexity: 2.0 }
};

export default function ROICalculator() {
  const [metrics, setMetrics] = useState<BusinessMetrics>({
    industry: '',
    companySize: '',
    currentRevenue: 0,
    operatingCosts: 0,
    employeeCount: 0,
    processEfficiency: 70,
    dataVolume: '',
    currentTechSpend: 0
  });

  const [results, setResults] = useState<ROIResults | null>(null);
  const [showResults, setShowResults] = useState(false);

  const isFormValid = useCallback(() => {
    return metrics.industry && 
           metrics.companySize && 
           metrics.currentRevenue > 0 && 
           metrics.operatingCosts > 0 &&
           metrics.employeeCount > 0;
  }, [metrics]);

  const calculateROI = useCallback(() => {
    if (!isFormValid()) return;

    const industryMult = industryMultipliers[metrics.industry as keyof typeof industryMultipliers] || industryMultipliers['Other'];
    const sizeMult = companySizeMultipliers[metrics.companySize as keyof typeof companySizeMultipliers];

    // Calculate AI impact based on industry and company size
    const impact: AIImpact = {
      revenueIncrease: metrics.currentRevenue * 0.12 * industryMult.revenue * sizeMult.base,
      costReduction: metrics.operatingCosts * 0.18 * industryMult.cost * sizeMult.base,
      productivityGain: (metrics.employeeCount * 65000 * 0.25) * industryMult.productivity * sizeMult.base, // Average salary * productivity improvement
      timeToValue: sizeMult.complexity * 3, // months
      implementationCost: 15000 + (metrics.employeeCount * 150) * sizeMult.complexity,
      maintenanceCost: (15000 + (metrics.employeeCount * 150)) * 0.2 * sizeMult.complexity // 20% of implementation cost annually
    };

    // Calculate ROI
    const monthlyRevenueBenefit = impact.revenueIncrease / 12;
    const monthlyCostSavings = impact.costReduction / 12;
    const monthlyProductivityBenefit = impact.productivityGain / 12;
    const monthlyBenefits = monthlyRevenueBenefit + monthlyCostSavings + monthlyProductivityBenefit;
    
    const yearlyBenefits = monthlyBenefits * 12;
    const totalFirstYearCosts = impact.implementationCost + impact.maintenanceCost;
    
    const netROI = ((yearlyBenefits - totalFirstYearCosts) / totalFirstYearCosts) * 100;
    const paybackPeriod = impact.implementationCost / monthlyBenefits;
    const breakEvenMonth = Math.ceil(paybackPeriod);

    setResults({
      monthlyBenefits,
      yearlyBenefits,
      totalCosts: totalFirstYearCosts,
      netROI,
      paybackPeriod,
      breakEvenMonth
    });
  }, [metrics, isFormValid]);

  useEffect(() => {
    if (isFormValid()) {
      calculateROI();
    }
  }, [metrics, isFormValid, calculateROI]);

  const handleInputChange = (field: keyof BusinessMetrics, value: string | number) => {
    setMetrics(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const generateReport = () => {
    setShowResults(true);
  };

  return (
    <div className="bg-slate-900/50 backdrop-blur-sm p-4 sm:p-6 lg:p-8 rounded-2xl border border-slate-700/50">
      <div className="mb-6 lg:mb-8">
        <h2 className="text-2xl sm:text-3xl font-bold mb-4">
          <span className="text-white">AI ROI </span>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-cyan-400">
            Calculator
          </span>
        </h2>
        <p className="text-slate-400 text-sm sm:text-base">
          Calculate the potential return on investment for implementing AI solutions in your business.
        </p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 lg:gap-8">
        {/* Input Panel */}
        <div className="space-y-4 lg:space-y-6">
          {/* Company Information */}
          <div>
            <h3 className="text-lg sm:text-xl font-semibold text-white mb-4">Company Information</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Industry</label>
                <select
                  value={metrics.industry}
                  onChange={(e) => handleInputChange('industry', e.target.value)}
                  className="w-full p-2 sm:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
                >
                  <option value="">Select your industry</option>
                  {Object.keys(industryMultipliers).map(industry => (
                    <option key={industry} value={industry}>{industry}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Company Size</label>
                <select
                  value={metrics.companySize}
                  onChange={(e) => handleInputChange('companySize', e.target.value)}
                  className="w-full p-2 sm:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
                >
                  <option value="">Select company size</option>
                  {Object.keys(companySizeMultipliers).map(size => (
                    <option key={size} value={size}>{size}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Employee Count</label>
                  <input
                    type="number"
                    value={metrics.employeeCount || ''}
                    onChange={(e) => handleInputChange('employeeCount', parseInt(e.target.value) || 0)}
                    className="w-full p-2 sm:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
                    placeholder="50"
                  />
                </div>

                <div>
                  <label className="block text-xs sm:text-sm font-medium text-slate-300 mb-2">Data Volume</label>
                  <select
                    value={metrics.dataVolume}
                    onChange={(e) => handleInputChange('dataVolume', e.target.value)}
                    className="w-full p-2 sm:p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none text-sm sm:text-base"
                  >
                    <option value="">Select volume</option>
                    <option value="Low">Low (&lt; 1GB/day)</option>
                    <option value="Medium">Medium (1-10GB/day)</option>
                    <option value="High">High (&gt; 10GB/day)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Information */}
          <div>
            <h3 className="text-xl font-semibold text-white mb-4">Financial Metrics</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Annual Revenue ($)</label>
                <input
                  type="number"
                  value={metrics.currentRevenue || ''}
                  onChange={(e) => handleInputChange('currentRevenue', parseInt(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="1000000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Annual Operating Costs ($)</label>
                <input
                  type="number"
                  value={metrics.operatingCosts || ''}
                  onChange={(e) => handleInputChange('operatingCosts', parseInt(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="750000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Current Tech Spending ($)</label>
                <input
                  type="number"
                  value={metrics.currentTechSpend || ''}
                  onChange={(e) => handleInputChange('currentTechSpend', parseInt(e.target.value) || 0)}
                  className="w-full p-3 bg-slate-800 border border-slate-600 rounded-lg text-white focus:border-cyan-400 focus:outline-none"
                  placeholder="50000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Current Process Efficiency: {metrics.processEfficiency}%
                </label>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={metrics.processEfficiency}
                  onChange={(e) => handleInputChange('processEfficiency', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer slider"
                />
                <div className="flex justify-between text-xs text-slate-400 mt-1">
                  <span>Low Efficiency</span>
                  <span>High Efficiency</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Panel */}
        <div className="space-y-6">
          {/* ROI Preview */}
          {results && (
            <div className="bg-gradient-to-r from-green-400/20 to-cyan-400/20 p-6 rounded-xl border border-green-400/30">
              <h3 className="text-xl font-semibold text-white mb-4">ROI Summary</h3>
              
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-400 mb-1">
                    {results.netROI > 0 ? '+' : ''}{results.netROI.toFixed(1)}%
                  </div>
                  <div className="text-sm text-slate-400">Net ROI (Year 1)</div>
                </div>
                
                <div className="text-center">
                  <div className="text-3xl font-bold text-cyan-400 mb-1">
                    {results.breakEvenMonth}
                  </div>
                  <div className="text-sm text-slate-400">Months to Break Even</div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Monthly Benefits:</span>
                  <span className="text-green-400 font-semibold">
                    +${results.monthlyBenefits.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Yearly Benefits:</span>
                  <span className="text-green-400 font-semibold">
                    +${results.yearlyBenefits.toLocaleString()}
                  </span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-slate-300">Implementation Cost:</span>
                  <span className="text-orange-400 font-semibold">
                    -${results.totalCosts.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Calculation Factors */}
          <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50">
            <h3 className="text-lg font-semibold text-white mb-4">What We Calculate</h3>
            
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">📈</span>
                </div>
                <div>
                  <div className="text-white font-medium">Revenue Increase</div>
                  <div className="text-sm text-slate-400">Better insights, automation, and customer experience typically increase revenue by 8-15%</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-cyan-400 to-purple-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">💰</span>
                </div>
                <div>
                  <div className="text-white font-medium">Cost Reduction</div>
                  <div className="text-sm text-slate-400">Process automation and efficiency gains reduce operating costs by 12-20%</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">⚡</span>
                </div>
                <div>
                  <div className="text-white font-medium">Productivity Gains</div>
                  <div className="text-sm text-slate-400">AI tools boost employee productivity by 20-30%, reducing time spent on repetitive tasks</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-green-400 rounded-lg flex items-center justify-center flex-shrink-0">
                  <span className="text-sm">🎯</span>
                </div>
                <div>
                  <div className="text-white font-medium">Industry-Specific</div>
                  <div className="text-sm text-slate-400">Calculations adjusted for your industry and company size for accurate estimates</div>
                </div>
              </div>
            </div>
          </div>

          {/* Generate Report Button */}
          {results && (
            <button
              onClick={generateReport}
              className="w-full py-4 bg-gradient-to-r from-green-400 to-cyan-400 rounded-xl text-white font-semibold hover:shadow-xl hover:shadow-green-400/30 transition-all duration-300 transform hover:-translate-y-1"
            >
              Generate Detailed ROI Report
            </button>
          )}
        </div>
      </div>

      {/* Detailed Results Modal */}
      {showResults && results && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 p-8 rounded-2xl border border-slate-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold text-white">AI ROI Analysis Report</h3>
              <button
                onClick={() => setShowResults(false)}
                className="w-8 h-8 bg-slate-800 hover:bg-slate-700 rounded-full flex items-center justify-center text-slate-400 hover:text-white transition-colors"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Executive Summary */}
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-green-400/20 to-cyan-400/20 p-6 rounded-xl border border-green-400/30">
                  <h4 className="text-xl font-bold text-white mb-4">Executive Summary</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Total ROI (Year 1):</span>
                      <span className="text-green-400 font-bold text-lg">
                        {results.netROI > 0 ? '+' : ''}{results.netROI.toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Payback Period:</span>
                      <span className="text-cyan-400 font-bold">
                        {results.paybackPeriod.toFixed(1)} months
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Break-even Point:</span>
                      <span className="text-purple-400 font-bold">Month {results.breakEvenMonth}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Investment Breakdown</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Implementation Cost:</span>
                      <span className="text-orange-400">${(results.totalCosts * 0.8).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Annual Maintenance:</span>
                      <span className="text-orange-400">${(results.totalCosts * 0.2).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-white">Total First Year:</span>
                        <span className="text-orange-400">${results.totalCosts.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Benefits Breakdown */}
              <div className="space-y-6">
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Annual Benefits</h4>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-slate-300">Revenue Increase:</span>
                      <span className="text-green-400">+${(results.yearlyBenefits * 0.4).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Cost Reduction:</span>
                      <span className="text-green-400">+${(results.yearlyBenefits * 0.35).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Productivity Gains:</span>
                      <span className="text-green-400">+${(results.yearlyBenefits * 0.25).toLocaleString()}</span>
                    </div>
                    <div className="border-t border-slate-600 pt-2">
                      <div className="flex justify-between font-semibold">
                        <span className="text-white">Total Benefits:</span>
                        <span className="text-green-400">+${results.yearlyBenefits.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-600/50">
                  <h4 className="text-lg font-semibold text-white mb-4">Key Assumptions</h4>
                  <div className="space-y-2 text-sm text-slate-300">
                    <div>• Industry: {metrics.industry}</div>
                    <div>• Company Size: {metrics.companySize}</div>
                    <div>• Current Efficiency: {metrics.processEfficiency}%</div>
                    <div>• Implementation Timeline: 3-6 months</div>
                    <div>• AI Adoption Rate: 80% within first year</div>
                    <div>• Market conditions remain stable</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-700">
              <div className="flex gap-4">
                <button
                  onClick={() => setShowResults(false)}
                  className="flex-1 py-3 border border-slate-600 rounded-lg text-slate-300 hover:border-slate-500 transition-colors"
                >
                  Close Report
                </button>
                <button className="flex-1 py-3 bg-gradient-to-r from-green-400 to-cyan-400 rounded-lg text-white font-semibold hover:shadow-lg transition-all duration-300">
                  Schedule Consultation
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}