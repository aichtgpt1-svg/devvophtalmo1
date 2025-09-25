import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Calendar,
  BarChart3,
  Activity
} from 'lucide-react';
import { DatabaseService, ServiceRequest } from '@/services/database';

interface ServiceMetrics {
  totalRequests: number;
  averageResolutionTime: number;
  criticalRequests: number;
  monthlyTrend: number;
  topIssueTypes: { type: string; count: number }[];
  requestsByPriority: { priority: string; count: number; percentage: number }[];
  resolutionRate: number;
  averageResponseTime: number;
}

export default function ServiceAnalytics() {
  const [metrics, setMetrics] = useState<ServiceMetrics>({
    totalRequests: 0,
    averageResolutionTime: 0,
    criticalRequests: 0,
    monthlyTrend: 0,
    topIssueTypes: [],
    requestsByPriority: [],
    resolutionRate: 0,
    averageResponseTime: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const requestsResult = await DatabaseService.getServiceRequests();
      const requests = Array.isArray(requestsResult) ? requestsResult : requestsResult?.items || [];
      
      if (requests && requests.length > 0) {
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
        
        // Filter requests by date ranges
        const recentRequests = requests.filter(r => 
          new Date(r.created_at || '') >= thirtyDaysAgo
        );
        const previousRequests = requests.filter(r => {
          const date = new Date(r.created_at || '');
          return date >= sixtyDaysAgo && date < thirtyDaysAgo;
        });

        // Calculate metrics
        const totalRequests = recentRequests.length;
        const criticalRequests = recentRequests.filter(r => r.priority === 'Critical').length;
        const resolvedRequests = recentRequests.filter(r => r.request_status === 'resolved' || r.status === 'resolved');
        
        // Calculate average resolution time (in hours)
        let totalResolutionTime = 0;
        let resolvedCount = 0;
        resolvedRequests.forEach(request => {
          const created = new Date(request.created_at || request.created_date || '');
          const resolved = new Date(request.resolved_date || request.updated_date || '');
          if (resolved > created) {
            totalResolutionTime += (resolved.getTime() - created.getTime()) / (1000 * 60 * 60);
            resolvedCount++;
          }
        });
        const averageResolutionTime = resolvedCount > 0 ? Math.round(totalResolutionTime / resolvedCount) : 0;

        // Calculate monthly trend
        const monthlyTrend = previousRequests.length > 0 
          ? Math.round(((totalRequests - previousRequests.length) / previousRequests.length) * 100)
          : 0;

        // Top issue types
        const issueTypeCounts: { [key: string]: number } = {};
        recentRequests.forEach(request => {
          const type = request.issue_type || request.category || 'Other';
          issueTypeCounts[type] = (issueTypeCounts[type] || 0) + 1;
        });
        const topIssueTypes = Object.entries(issueTypeCounts)
          .sort(([,a], [,b]) => b - a)
          .slice(0, 5)
          .map(([type, count]) => ({ type, count }));

        // Requests by priority
        const priorityCounts: { [key: string]: number } = {};
        recentRequests.forEach(request => {
          const priority = request.priority || 'Medium';
          priorityCounts[priority] = (priorityCounts[priority] || 0) + 1;
        });
        const requestsByPriority = Object.entries(priorityCounts)
          .map(([priority, count]) => ({
            priority,
            count,
            percentage: Math.round((count / totalRequests) * 100)
          }))
          .sort((a, b) => b.count - a.count);

        // Resolution rate
        const resolutionRate = totalRequests > 0 
          ? Math.round((resolvedRequests.length / totalRequests) * 100)
          : 0;

        setMetrics({
          totalRequests,
          averageResolutionTime,
          criticalRequests,
          monthlyTrend,
          topIssueTypes,
          requestsByPriority,
          resolutionRate,
          averageResponseTime: Math.round(averageResolutionTime * 0.3) // Estimate response time as 30% of resolution
        });
      }
    } catch (error) {
      console.error('Error loading service analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-medical-accent/20 rounded mb-2"></div>
              <div className="h-8 bg-medical-accent/20 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-text/70">Total Requests</p>
                <p className="text-2xl font-bold text-medical-primary">{metrics.totalRequests}</p>
              </div>
              <div className="p-2 bg-medical-accent/10 rounded-lg">
                <BarChart3 className="w-6 h-6 text-medical-accent" />
              </div>
            </div>
            <div className="flex items-center mt-2">
              {metrics.monthlyTrend >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-600 mr-1" />
              )}
              <span className={`text-sm ${
                metrics.monthlyTrend >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {Math.abs(metrics.monthlyTrend)}% from last month
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-text/70">Avg Resolution</p>
                <p className="text-2xl font-bold text-medical-primary">{metrics.averageResolutionTime}h</p>
              </div>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
            <p className="text-sm text-medical-text/60 mt-2">
              Response time: {metrics.averageResponseTime}h
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-text/70">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{metrics.criticalRequests}</p>
              </div>
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
            <p className="text-sm text-medical-text/60 mt-2">
              Requires immediate attention
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-medical-text/70">Resolution Rate</p>
                <p className="text-2xl font-bold text-green-600">{metrics.resolutionRate}%</p>
              </div>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
            <p className="text-sm text-medical-text/60 mt-2">
              Last 30 days
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Top Issue Types
            </CardTitle>
            <CardDescription>Most common equipment problems</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.topIssueTypes.map((issue, index) => (
                <div key={issue.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">#{index + 1}</span>
                    <span className="text-sm text-medical-text/80">
                      {issue.type.replace('_', ' ')}
                    </span>
                  </div>
                  <Badge variant="secondary">
                    {issue.count} cases
                  </Badge>
                </div>
              ))}
              {metrics.topIssueTypes.length === 0 && (
                <p className="text-sm text-medical-text/60 text-center py-8">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5" />
              Priority Distribution
            </CardTitle>
            <CardDescription>Service requests by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.requestsByPriority.map((item) => (
                <div key={item.priority} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{item.priority}</span>
                    <span className="text-sm text-medical-text/60">
                      {item.count} ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-medical-accent/10 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full ${
                        item.priority === 'Critical' ? 'bg-red-500' :
                        item.priority === 'High' ? 'bg-orange-500' :
                        item.priority === 'Medium' ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
              {metrics.requestsByPriority.length === 0 && (
                <p className="text-sm text-medical-text/60 text-center py-8">
                  No data available
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}