import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import ReportBuilder from '@/components/ReportBuilder';
import {
  FileText,
  Plus,
  Eye,
  Download,
  Edit,
  Trash2,
  Copy,
  Calendar,
  BarChart3,
  Users,
  Clock,
  Zap
} from 'lucide-react';

interface SavedReport {
  id: string;
  name: string;
  description: string;
  components: any[];
  layout: string[];
  createdAt: string;
  updatedAt: string;
  category: 'devices' | 'maintenance' | 'service' | 'compliance' | 'custom';
  tags: string[];
}

const TEMPLATE_REPORTS = [
  {
    id: 'device-overview',
    name: 'Device Overview Dashboard',
    description: 'Comprehensive view of all medical devices with status metrics',
    category: 'devices' as const,
    tags: ['overview', 'devices', 'status'],
    components: 4,
    estimatedTime: '2 min'
  },
  {
    id: 'maintenance-schedule',
    name: 'Maintenance Schedule Report',
    description: 'Upcoming and overdue maintenance tasks with priority indicators',
    category: 'maintenance' as const,
    tags: ['maintenance', 'scheduling', 'calendar'],
    components: 3,
    estimatedTime: '1 min'
  },
  {
    id: 'service-analytics',
    name: 'Service Request Analytics',
    description: 'Service request trends, response times, and technician performance',
    category: 'service' as const,
    tags: ['service', 'analytics', 'performance'],
    components: 5,
    estimatedTime: '3 min'
  },
  {
    id: 'compliance-summary',
    name: 'Compliance Summary',
    description: 'Regulatory compliance status across all devices and facilities',
    category: 'compliance' as const,
    tags: ['compliance', 'regulatory', 'audit'],
    components: 3,
    estimatedTime: '2 min'
  }
];

export default function ReportBuilderPage() {
  const [activeTab, setActiveTab] = useState('builder');
  const [savedReports, setSavedReports] = useState<SavedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<SavedReport | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [reportToDelete, setReportToDelete] = useState<SavedReport | null>(null);

  // Load saved reports from localStorage
  useEffect(() => {
    const reports = JSON.parse(localStorage.getItem('custom-reports') || '[]');
    setSavedReports(reports);
  }, []);

  // Delete report
  const deleteReport = (report: SavedReport) => {
    const updatedReports = savedReports.filter(r => r.id !== report.id);
    setSavedReports(updatedReports);
    localStorage.setItem('custom-reports', JSON.stringify(updatedReports));
    setShowDeleteDialog(false);
    setReportToDelete(null);
  };

  // Duplicate report
  const duplicateReport = (report: SavedReport) => {
    const newReport = {
      ...report,
      id: `report-${Date.now()}`,
      name: `${report.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    const updatedReports = [...savedReports, newReport];
    setSavedReports(updatedReports);
    localStorage.setItem('custom-reports', JSON.stringify(updatedReports));
  };

  // Create from template
  const createFromTemplate = (template: any) => {
    // Switch to builder tab with template pre-loaded
    setActiveTab('builder');
    // In a real implementation, you would pass the template data to the ReportBuilder
    alert(`Creating report from template: ${template.name}`);
  };

  // Get category icon
  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'devices': return BarChart3;
      case 'maintenance': return Calendar;
      case 'service': return Users;
      case 'compliance': return FileText;
      default: return FileText;
    }
  };

  // Get category color
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'devices': return 'bg-blue-100 text-blue-800';
      case 'maintenance': return 'bg-green-100 text-green-800';
      case 'service': return 'bg-purple-100 text-purple-800';
      case 'compliance': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
        <div className="border-b bg-white p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Report Builder</h1>
              <p className="text-gray-600">Create custom reports with drag-and-drop components</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-blue-600 border-blue-200">
                <Zap className="w-3 h-3 mr-1" />
                Pro Feature
              </Badge>
            </div>
          </div>
          
          <TabsList className="grid w-fit grid-cols-3">
            <TabsTrigger value="builder" className="flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Build Report
            </TabsTrigger>
            <TabsTrigger value="saved" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              My Reports ({savedReports.length})
            </TabsTrigger>
            <TabsTrigger value="templates" className="flex items-center gap-2">
              <Copy className="w-4 h-4" />
              Templates
            </TabsTrigger>
          </TabsList>
        </div>

        <div className="flex-1 overflow-hidden">
          <TabsContent value="builder" className="h-full m-0 p-0">
            <ReportBuilder />
          </TabsContent>

          <TabsContent value="saved" className="h-full m-0 p-6">
            <div className="h-full overflow-y-auto">
              {savedReports.length === 0 ? (
                <div className="flex items-center justify-center h-64">
                  <div className="text-center">
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      No Saved Reports
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Create your first custom report using the Report Builder
                    </p>
                    <Button onClick={() => setActiveTab('builder')}>
                      <Plus className="w-4 h-4 mr-2" />
                      Create New Report
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {savedReports.map((report) => (
                    <Card key={report.id} className="group hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-2">
                            {React.createElement(getCategoryIcon(report.category), {
                              className: "w-5 h-5 text-gray-500"
                            })}
                            <CardTitle className="text-base truncate">{report.name}</CardTitle>
                          </div>
                          <Badge variant="secondary" className={`text-xs ${getCategoryColor(report.category)}`}>
                            {report.category}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {report.description}
                        </p>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          <span>{report.components.length} components</span>
                          <span>{new Date(report.updatedAt).toLocaleDateString()}</span>
                        </div>
                        
                        <div className="flex items-center gap-1 mb-4">
                          {report.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {report.tags?.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{report.tags.length - 2}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 px-2">
                            <Download className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 px-2"
                            onClick={() => duplicateReport(report)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-8 px-2 text-red-600 hover:text-red-700"
                            onClick={() => {
                              setReportToDelete(report);
                              setShowDeleteDialog(true);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="h-full m-0 p-6">
            <div className="h-full overflow-y-auto">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Report Templates</h2>
                <p className="text-gray-600">Start with pre-built report templates and customize as needed</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {TEMPLATE_REPORTS.map((template) => (
                  <Card key={template.id} className="group hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-2">
                          {React.createElement(getCategoryIcon(template.category), {
                            className: "w-5 h-5 text-gray-500"
                          })}
                          <CardTitle className="text-base">{template.name}</CardTitle>
                        </div>
                        <Badge variant="secondary" className={`text-xs ${getCategoryColor(template.category)}`}>
                          {template.category}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600">
                        {template.description}
                      </p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <BarChart3 className="w-4 h-4" />
                            {template.components} components
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {template.estimatedTime}
                          </span>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 mb-4">
                        {template.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>

                      <Button 
                        className="w-full" 
                        onClick={() => createFromTemplate(template)}
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Use Template
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>
        </div>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Report</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{reportToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => reportToDelete && deleteReport(reportToDelete)}
            >
              Delete Report
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}