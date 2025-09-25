import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { DatabaseService, Device } from '@/services/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import {
  BarChart3,
  Download,
  FileText,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Settings,
  RefreshCw,
  Filter,
  Eye
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
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subDays, subMonths, addDays } from 'date-fns';

interface ReportData {
  deviceUtilization: Array<{
    name: string;
    utilization: number;
    downtime: number;
    efficiency: number;
  }>;
  maintenanceCosts: Array<{
    month: string;
    preventive: number;
    corrective: number;
    emergency: number;
  }>;
  serviceMetrics: Array<{
    month: string;
    requests: number;
    resolved: number;
    avgResolution: number;
  }>;
  complianceScores: Array<{
    standard: string;
    score: number;
    trend: 'up' | 'down' | 'stable';
  }>;
}

export default function ReportsPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState('6months');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    loadReportData();
  }, [selectedTimeframe]);

  const loadReportData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const devicesResponse = await DatabaseService.getDevices();
      const devicesData = Array.isArray(devicesResponse) ? devicesResponse : devicesResponse.items || [];
      setDevices(devicesData);

      // Generate comprehensive report data
      const months = parseInt(selectedTimeframe.replace('months', ''));
      const reportData: ReportData = {
        deviceUtilization: devicesData.map((device: any) => ({
          name: device.name || 'Unknown Device',
          utilization: 75 + Math.random() * 20,
          downtime: Math.random() * 10,
          efficiency: 80 + Math.random() * 15
        })),
        maintenanceCosts: Array.from({ length: months }, (_, i) => {
          const date = subMonths(new Date(), months - i - 1);
          return {
            month: format(date, 'MMM yyyy'),
            preventive: Math.floor(Math.random() * 5000) + 2000,
            corrective: Math.floor(Math.random() * 8000) + 3000,
            emergency: Math.floor(Math.random() * 3000) + 500
          };
        }),
        serviceMetrics: Array.from({ length: months }, (_, i) => {
          const date = subMonths(new Date(), months - i - 1);
          const requests = Math.floor(Math.random() * 20) + 10;
          return {
            month: format(date, 'MMM yyyy'),
            requests,
            resolved: requests - Math.floor(Math.random() * 3),
            avgResolution: Math.random() * 24 + 12 // hours
          };
        }),
        complianceScores: [
          { standard: 'FDA 510(k)', score: 94.5, trend: 'up' },
          { standard: 'ISO 13485', score: 89.2, trend: 'stable' },
          { standard: 'HIPAA', score: 96.8, trend: 'up' },
          { standard: 'Joint Commission', score: 91.3, trend: 'down' }
        ]
      };

      setReportData(reportData);
    } catch (error) {
      console.error('Error loading report data:', error);
      toast({
        title: "Error",
        description: "Failed to load report data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const summaryMetrics = useMemo(() => {
    if (!reportData) return null;

    const totalMaintenanceCost = reportData.maintenanceCosts.reduce(
      (sum, month) => sum + month.preventive + month.corrective + month.emergency, 0
    );
    
    const avgUtilization = reportData.deviceUtilization.reduce(
      (sum, device) => sum + device.utilization, 0
    ) / reportData.deviceUtilization.length;

    const totalServiceRequests = reportData.serviceMetrics.reduce(
      (sum, month) => sum + month.requests, 0
    );

    const avgResolutionTime = reportData.serviceMetrics.reduce(
      (sum, month) => sum + month.avgResolution, 0
    ) / reportData.serviceMetrics.length;

    const avgComplianceScore = reportData.complianceScores.reduce(
      (sum, standard) => sum + standard.score, 0
    ) / reportData.complianceScores.length;

    return {
      totalMaintenanceCost,
      avgUtilization,
      totalServiceRequests,
      avgResolutionTime,
      avgComplianceScore
    };
  }, [reportData]);

  const handleGenerateReport = async (type: string) => {
    setGeneratingReport(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast({
        title: "Report Generated",
        description: `${type} report has been generated and downloaded.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading reports...</span>
        </div>
      </div>
    );
  }

  if (!reportData || !summaryMetrics) {
    return <div>Error loading report data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Reports & Analytics</h1>
          <p className="text-gray-600 mt-1">Comprehensive reporting and data analytics dashboard</p>
        </div>
        <div className="flex items-center space-x-3">
          <Select value={selectedTimeframe} onValueChange={setSelectedTimeframe}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="3months">3 Months</SelectItem>
              <SelectItem value="6months">6 Months</SelectItem>
              <SelectItem value="12months">1 Year</SelectItem>
              <SelectItem value="24months">2 Years</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="h-4 w-4 mr-2" />
            Filters
          </Button>
          <Button>
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Maintenance Cost</p>
                <p className="text-2xl font-bold">${summaryMetrics.totalMaintenanceCost.toLocaleString()}</p>
              </div>
              <DollarSign className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-bold">{summaryMetrics.avgUtilization.toFixed(1)}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Service Requests</p>
                <p className="text-2xl font-bold">{summaryMetrics.totalServiceRequests}</p>
              </div>
              <Settings className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Resolution</p>
                <p className="text-2xl font-bold">{summaryMetrics.avgResolutionTime.toFixed(1)}h</p>
              </div>
              <Calendar className="h-8 w-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliance Score</p>
                <p className="text-2xl font-bold">{summaryMetrics.avgComplianceScore.toFixed(1)}%</p>
              </div>
              <BarChart3 className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Utilization */}
        <Card>
          <CardHeader>
            <CardTitle>Device Utilization</CardTitle>
            <CardDescription>Utilization rates across all devices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.deviceUtilization}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip />
                <Bar dataKey="utilization" fill="#2563eb" />
                <Bar dataKey="efficiency" fill="#16a34a" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Maintenance Costs */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Costs Trend</CardTitle>
            <CardDescription>Monthly maintenance expenditure breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={reportData.maintenanceCosts}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value: any) => [`$${value.toLocaleString()}`, '']} />
                <Legend />
                <Area type="monotone" dataKey="preventive" stackId="1" stroke="#16a34a" fill="#16a34a" />
                <Area type="monotone" dataKey="corrective" stackId="1" stroke="#d97706" fill="#d97706" />
                <Area type="monotone" dataKey="emergency" stackId="1" stroke="#dc2626" fill="#dc2626" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Service Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>Service Request Metrics</CardTitle>
            <CardDescription>Monthly service request volume and resolution</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.serviceMetrics}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="requests" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="resolved" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Compliance Scores */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance Scores</CardTitle>
            <CardDescription>Current compliance status by standard</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {reportData.complianceScores.map((standard, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium">{standard.standard}</p>
                    <p className="text-sm text-gray-600">{standard.score.toFixed(1)}% compliant</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {standard.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : standard.trend === 'down' ? (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    <Badge variant={standard.score > 90 ? 'default' : standard.score > 80 ? 'secondary' : 'destructive'}>
                      {standard.score > 90 ? 'Excellent' : standard.score > 80 ? 'Good' : 'Needs Attention'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Report Generation */}
      <Card>
        <CardHeader>
          <CardTitle>Generate Reports</CardTitle>
          <CardDescription>Create detailed reports for specific areas</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleGenerateReport('Maintenance')}
              disabled={generatingReport}
            >
              {generatingReport ? (
                <RefreshCw className="h-6 w-6 mb-2 animate-spin" />
              ) : (
                <Settings className="h-6 w-6 mb-2" />
              )}
              <span>Maintenance Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleGenerateReport('Utilization')}
              disabled={generatingReport}
            >
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>Utilization Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleGenerateReport('Financial')}
              disabled={generatingReport}
            >
              <DollarSign className="h-6 w-6 mb-2" />
              <span>Financial Report</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-20 flex-col"
              onClick={() => handleGenerateReport('Compliance')}
              disabled={generatingReport}
            >
              <FileText className="h-6 w-6 mb-2" />
              <span>Compliance Report</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}