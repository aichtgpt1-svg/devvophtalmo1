import React from 'react';
import { ArrowLeft, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useNavigate } from 'react-router-dom';
import ServiceAnalytics from '@/components/ServiceAnalytics';

export default function ServiceAnalyticsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-medical-bg">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard')}
              className="hover:bg-medical-accent/10"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-medical-primary flex items-center gap-3">
                <BarChart3 className="w-8 h-8" />
                Service Analytics
              </h1>
              <p className="text-medical-text/70 mt-1">
                Comprehensive insights into service request performance and trends
              </p>
            </div>
          </div>
        </div>

        {/* Analytics Dashboard */}
        <ServiceAnalytics />

        {/* Additional Insights */}
        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance Insights</CardTitle>
              <CardDescription>Key performance indicators and recommendations</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded-r-lg">
                  <h4 className="font-semibold text-blue-900">Response Time Optimization</h4>
                  <p className="text-sm text-blue-800 mt-1">
                    Consider implementing automated triage for faster initial response to critical issues.
                  </p>
                </div>
                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg">
                  <h4 className="font-semibold text-green-900">Preventive Maintenance</h4>
                  <p className="text-sm text-green-800 mt-1">
                    Regular maintenance reduces emergency service requests by up to 60%.
                  </p>
                </div>
                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded-r-lg">
                  <h4 className="font-semibold text-yellow-900">Staff Training</h4>
                  <p className="text-sm text-yellow-800 mt-1">
                    User error issues can be reduced through targeted equipment training programs.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>System Health</CardTitle>
              <CardDescription>Overall equipment performance assessment</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Equipment Reliability</span>
                    <span className="text-sm text-green-600 font-semibold">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '92%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Maintenance Compliance</span>
                    <span className="text-sm text-blue-600 font-semibold">87%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '87%' }}></div>
                  </div>
                </div>
                
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium">Service Satisfaction</span>
                    <span className="text-sm text-green-600 font-semibold">95%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '95%' }}></div>
                  </div>
                </div>
                
                <div className="pt-4 border-t">
                  <p className="text-sm text-medical-text/70">
                    Last updated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}