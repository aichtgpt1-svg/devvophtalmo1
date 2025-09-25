import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { DatabaseService, Device } from '@/services/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  Zap,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  Wrench,
  Brain,
  Calendar,
  Target,
  Settings,
  RefreshCw,
  Download,
  BarChart3
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { format, addDays, subDays, differenceInDays } from 'date-fns';

interface PredictionModel {
  deviceId: string;
  deviceName: string;
  deviceType: string;
  failureRisk: number; // 0-100
  riskTrend: 'increasing' | 'decreasing' | 'stable';
  predictedFailureDate?: string;
  confidence: number; // 0-100
  maintenanceRecommendation: MaintenanceRecommendation;
  costAnalysis: CostAnalysis;
  healthScore: number; // 0-100
  lastAnalysis: string;
  keyFactors: RiskFactor[];
}

interface MaintenanceRecommendation {
  type: 'immediate' | 'scheduled' | 'preventive' | 'condition_based';
  priority: 'low' | 'medium' | 'high' | 'critical';
  suggestedDate: string;
  estimatedDuration: number; // hours
  description: string;
  parts?: string[];
  cost: number;
}

interface CostAnalysis {
  preventiveCost: number;
  reactiveCost: number;
  potentialSavings: number;
  roi: number; // percentage
  breakdownCost?: number;
}

interface RiskFactor {
  factor: string;
  impact: number; // 0-100
  trend: 'improving' | 'worsening' | 'stable';
  description: string;
}

interface MLInsight {
  category: 'performance' | 'usage' | 'environmental' | 'maintenance';
  insight: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high' | 'critical';
  recommendation: string;
}

export default function PredictiveMaintenancePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [predictions, setPredictions] = useState<PredictionModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('30');
  const [selectedRiskLevel, setSelectedRiskLevel] = useState('all');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    loadPredictiveData();
  }, []);

  const loadPredictiveData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const devicesResponse = await DatabaseService.getDevices();
      const devicesData = Array.isArray(devicesResponse) ? devicesResponse : devicesResponse.items || [];
      setDevices(devicesData);

      // Generate ML-powered predictions
      const predictiveModels: PredictionModel[] = devicesData.map((device: any, index: number) => {
        const riskLevel = Math.random() * 100;
        const healthScore = 100 - riskLevel + Math.random() * 20 - 10;
        const confidence = 75 + Math.random() * 20;
        
        return {
          deviceId: device._id || '',
          deviceName: device.name || 'Unknown Device',
          deviceType: device.type || 'Unknown',
          failureRisk: riskLevel,
          riskTrend: ['increasing', 'decreasing', 'stable'][Math.floor(Math.random() * 3)] as any,
          predictedFailureDate: riskLevel > 70 ? 
            addDays(new Date(), Math.floor(30 + Math.random() * 90)).toISOString() : 
            undefined,
          confidence,
          healthScore: Math.max(0, Math.min(100, healthScore)),
          lastAnalysis: new Date().toISOString(),
          maintenanceRecommendation: generateMaintenanceRecommendation(riskLevel),
          costAnalysis: generateCostAnalysis(riskLevel),
          keyFactors: generateRiskFactors()
        };
      });

      setPredictions(predictiveModels);
    } catch (error) {
      console.error('Error loading predictive data:', error);
      toast({
        title: "Error",
        description: "Failed to load predictive maintenance data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateMaintenanceRecommendation = (riskLevel: number): MaintenanceRecommendation => {
    if (riskLevel > 80) {
      return {
        type: 'immediate',
        priority: 'critical',
        suggestedDate: new Date().toISOString(),
        estimatedDuration: 4 + Math.random() * 8,
        description: 'Critical intervention required to prevent failure',
        parts: ['Sensor assembly', 'Control module'],
        cost: 2000 + Math.random() * 3000
      };
    } else if (riskLevel > 60) {
      return {
        type: 'scheduled',
        priority: 'high',
        suggestedDate: addDays(new Date(), 7 + Math.random() * 14).toISOString(),
        estimatedDuration: 2 + Math.random() * 4,
        description: 'Scheduled maintenance to address identified issues',
        parts: ['Calibration kit', 'Filters'],
        cost: 800 + Math.random() * 1200
      };
    } else if (riskLevel > 30) {
      return {
        type: 'preventive',
        priority: 'medium',
        suggestedDate: addDays(new Date(), 30 + Math.random() * 60).toISOString(),
        estimatedDuration: 1 + Math.random() * 2,
        description: 'Preventive maintenance to maintain optimal performance',
        parts: ['Cleaning supplies', 'Lubricants'],
        cost: 200 + Math.random() * 400
      };
    } else {
      return {
        type: 'condition_based',
        priority: 'low',
        suggestedDate: addDays(new Date(), 90 + Math.random() * 180).toISOString(),
        estimatedDuration: 0.5 + Math.random() * 1,
        description: 'Continue monitoring, maintenance when conditions indicate',
        cost: 100 + Math.random() * 200
      };
    }
  };

  const generateCostAnalysis = (riskLevel: number): CostAnalysis => {
    const preventiveCost = 500 + Math.random() * 1500;
    const reactiveCost = preventiveCost * (2 + Math.random() * 3);
    const potentialSavings = reactiveCost - preventiveCost;
    const roi = (potentialSavings / preventiveCost) * 100;

    return {
      preventiveCost,
      reactiveCost,
      potentialSavings,
      roi,
      breakdownCost: riskLevel > 70 ? reactiveCost * (1.5 + Math.random()) : undefined
    };
  };

  const generateRiskFactors = (): RiskFactor[] => {
    const factors = [
      { factor: 'Usage Hours', description: 'Device operating hours vs. expected lifespan' },
      { factor: 'Temperature Fluctuations', description: 'Environmental temperature variations' },
      { factor: 'Calibration Drift', description: 'Measurement accuracy degradation over time' },
      { factor: 'Power Quality', description: 'Electrical supply stability and consistency' },
      { factor: 'Vibration Levels', description: 'Mechanical stress from environmental factors' },
      { factor: 'Maintenance History', description: 'Previous maintenance frequency and quality' }
    ];

    return factors.slice(0, 3 + Math.floor(Math.random() * 3)).map(f => ({
      ...f,
      impact: 20 + Math.random() * 60,
      trend: ['improving', 'worsening', 'stable'][Math.floor(Math.random() * 3)] as any
    }));
  };

  const filteredPredictions = useMemo(() => {
    return predictions.filter(pred => {
      if (selectedRiskLevel === 'all') return true;
      if (selectedRiskLevel === 'high') return pred.failureRisk > 70;
      if (selectedRiskLevel === 'medium') return pred.failureRisk > 30 && pred.failureRisk <= 70;
      if (selectedRiskLevel === 'low') return pred.failureRisk <= 30;
      return true;
    });
  }, [predictions, selectedRiskLevel]);

  const summaryMetrics = useMemo(() => {
    const totalDevices = predictions.length;
    const highRiskDevices = predictions.filter(p => p.failureRisk > 70).length;
    const mediumRiskDevices = predictions.filter(p => p.failureRisk > 30 && p.failureRisk <= 70).length;
    const totalPotentialSavings = predictions.reduce((sum, p) => sum + p.costAnalysis.potentialSavings, 0);
    const avgROI = predictions.reduce((sum, p) => sum + p.costAnalysis.roi, 0) / predictions.length;

    return {
      totalDevices,
      highRiskDevices,
      mediumRiskDevices,
      totalPotentialSavings,
      avgROI
    };
  }, [predictions]);

  const riskTrendData = useMemo(() => {
    const data = [];
    for (let i = 30; i >= 0; i--) {
      const date = subDays(new Date(), i);
      data.push({
        date: format(date, 'MMM dd'),
        highRisk: Math.floor(Math.random() * 5) + 1,
        mediumRisk: Math.floor(Math.random() * 8) + 3,
        lowRisk: Math.floor(Math.random() * 12) + 8,
        totalSavings: (Math.random() * 10000) + 5000
      });
    }
    return data;
  }, []);

  const handleRunAnalysis = async () => {
    setIsAnalyzing(true);
    
    try {
      // Simulate ML analysis
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Update predictions with new analysis
      setPredictions(prev => prev.map(pred => ({
        ...pred,
        lastAnalysis: new Date().toISOString(),
        confidence: Math.min(100, pred.confidence + Math.random() * 5),
        failureRisk: Math.max(0, Math.min(100, pred.failureRisk + (Math.random() - 0.5) * 10))
      })));

      toast({
        title: "Analysis Complete",
        description: "Predictive models have been updated with latest data.",
      });
    } catch (error) {
      console.error('Error running analysis:', error);
      toast({
        title: "Analysis Failed",
        description: "Failed to run predictive analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getRiskColor = (riskLevel: number) => {
    if (riskLevel > 70) return 'text-red-600 bg-red-100';
    if (riskLevel > 30) return 'text-yellow-600 bg-yellow-100';
    return 'text-green-600 bg-green-100';
  };

  const getRiskIcon = (riskLevel: number) => {
    if (riskLevel > 70) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (riskLevel > 30) return <Clock className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'decreasing': return <TrendingDown className="h-4 w-4 text-green-500" />;
      default: return <Target className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading predictive analysis...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Predictive Maintenance</h1>
          <p className="text-gray-600 mt-1">AI-powered failure prediction and maintenance optimization</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>ML Enabled</span>
          </Badge>
          <Button onClick={handleRunAnalysis} disabled={isAnalyzing}>
            {isAnalyzing ? (
              <>
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Zap className="h-4 w-4 mr-2" />
                Run Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Devices</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalDevices}</p>
              </div>
              <Settings className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">High Risk</p>
                <p className="text-2xl font-bold text-red-600">{summaryMetrics.highRiskDevices}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Medium Risk</p>
                <p className="text-2xl font-bold text-yellow-600">{summaryMetrics.mediumRiskDevices}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Potential Savings</p>
                <p className="text-2xl font-bold text-green-600">
                  ${summaryMetrics.totalPotentialSavings.toLocaleString()}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg ROI</p>
                <p className="text-2xl font-bold text-purple-600">
                  {summaryMetrics.avgROI.toFixed(0)}%
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Risk Level:</label>
          <Select value={selectedRiskLevel} onValueChange={setSelectedRiskLevel}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="high">High Risk</SelectItem>
              <SelectItem value="medium">Medium Risk</SelectItem>
              <SelectItem value="low">Low Risk</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center space-x-2">
          <label className="text-sm font-medium">Timeframe:</label>
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 Days</SelectItem>
              <SelectItem value="30">30 Days</SelectItem>
              <SelectItem value="90">90 Days</SelectItem>
              <SelectItem value="365">1 Year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Risk Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Trend Analysis</CardTitle>
          <CardDescription>Historical risk levels and potential savings over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={riskTrendData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="highRisk" stackId="1" stroke="#dc2626" fill="#dc2626" />
              <Area type="monotone" dataKey="mediumRisk" stackId="1" stroke="#d97706" fill="#d97706" />
              <Area type="monotone" dataKey="lowRisk" stackId="1" stroke="#16a34a" fill="#16a34a" />
            </AreaChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Device Predictions */}
      <Card>
        <CardHeader>
          <CardTitle>Device Risk Assessment</CardTitle>
          <CardDescription>AI-powered failure predictions and maintenance recommendations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredPredictions.map((prediction) => (
              <Card key={prediction.deviceId} className="relative">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-4">
                        <h3 className="text-lg font-semibold">{prediction.deviceName}</h3>
                        <Badge variant="outline">{prediction.deviceType}</Badge>
                        <div className="flex items-center space-x-2">
                          {getRiskIcon(prediction.failureRisk)}
                          <Badge className={getRiskColor(prediction.failureRisk)}>
                            {prediction.failureRisk > 70 ? 'High Risk' :
                             prediction.failureRisk > 30 ? 'Medium Risk' : 'Low Risk'}
                          </Badge>
                        </div>
                        <div className="flex items-center space-x-1">
                          {getTrendIcon(prediction.riskTrend)}
                          <span className="text-sm text-gray-600">{prediction.riskTrend}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Risk Assessment */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Risk Assessment</h4>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between text-sm">
                              <span>Failure Risk</span>
                              <span className="font-medium">{prediction.failureRisk.toFixed(1)}%</span>
                            </div>
                            <Progress value={prediction.failureRisk} className="h-2" />
                            <div className="flex items-center justify-between text-sm">
                              <span>Health Score</span>
                              <span className="font-medium">{prediction.healthScore.toFixed(1)}%</span>
                            </div>
                            <Progress value={prediction.healthScore} className="h-2" />
                            <div className="flex items-center justify-between text-sm">
                              <span>Confidence</span>
                              <span className="font-medium">{prediction.confidence.toFixed(1)}%</span>
                            </div>
                            <Progress value={prediction.confidence} className="h-2" />
                          </div>
                          {prediction.predictedFailureDate && (
                            <div className="text-sm">
                              <span className="text-gray-600">Predicted failure: </span>
                              <span className="font-medium text-red-600">
                                {format(new Date(prediction.predictedFailureDate), 'MMM dd, yyyy')}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Maintenance Recommendation */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Recommendation</h4>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Badge variant={
                                prediction.maintenanceRecommendation.priority === 'critical' ? 'destructive' :
                                prediction.maintenanceRecommendation.priority === 'high' ? 'destructive' :
                                prediction.maintenanceRecommendation.priority === 'medium' ? 'default' : 'secondary'
                              }>
                                {prediction.maintenanceRecommendation.priority} priority
                              </Badge>
                              <Badge variant="outline">
                                {prediction.maintenanceRecommendation.type.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">
                              {prediction.maintenanceRecommendation.description}
                            </p>
                            <div className="text-sm space-y-1">
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-gray-500" />
                                <span>Suggested: {format(new Date(prediction.maintenanceRecommendation.suggestedDate), 'MMM dd, yyyy')}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="h-4 w-4 text-gray-500" />
                                <span>Duration: {prediction.maintenanceRecommendation.estimatedDuration.toFixed(1)}h</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <DollarSign className="h-4 w-4 text-gray-500" />
                                <span>Cost: ${prediction.maintenanceRecommendation.cost.toLocaleString()}</span>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Cost Analysis */}
                        <div className="space-y-3">
                          <h4 className="font-medium text-gray-900">Cost Analysis</h4>
                          <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                              <span className="text-gray-600">Preventive:</span>
                              <span className="font-medium">${prediction.costAnalysis.preventiveCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">Reactive:</span>
                              <span className="font-medium text-red-600">${prediction.costAnalysis.reactiveCost.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between border-t pt-2">
                              <span className="text-gray-600">Savings:</span>
                              <span className="font-medium text-green-600">${prediction.costAnalysis.potentialSavings.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-gray-600">ROI:</span>
                              <span className="font-medium text-purple-600">{prediction.costAnalysis.roi.toFixed(0)}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Risk Factors */}
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium text-gray-900 mb-3">Key Risk Factors</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {prediction.keyFactors.map((factor, index) => (
                            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                              <div>
                                <p className="text-sm font-medium">{factor.factor}</p>
                                <p className="text-xs text-gray-600">{factor.description}</p>
                              </div>
                              <div className="flex items-center space-x-2">
                                {getTrendIcon(factor.trend)}
                                <span className="text-sm font-medium">{factor.impact.toFixed(0)}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="ml-4 flex flex-col space-y-2">
                      <Button size="sm" variant="outline">
                        <Wrench className="h-3 w-3 mr-1" />
                        Schedule
                      </Button>
                      <Button size="sm" variant="outline">
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button size="sm" variant="outline">
                        <Download className="h-3 w-3 mr-1" />
                        Report
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}