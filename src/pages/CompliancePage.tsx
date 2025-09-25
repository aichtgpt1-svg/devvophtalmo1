import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Shield,
  FileText,
  CheckCircle,
  AlertTriangle,
  X,
  Download,
  RefreshCw,
  Calendar,
  Users,
  Clock,
  Target
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, parseISO } from 'date-fns';

interface ComplianceStandard {
  id: string;
  name: string;
  description: string;
  category: 'FDA' | 'ISO' | 'HIPAA' | 'Joint Commission' | 'State' | 'Local';
  requirements: ComplianceRequirement[];
  overallScore: number;
  lastAudit?: string;
  nextAudit?: string;
  certificationExpiry?: string;
  auditFrequency: number; // months
}

interface ComplianceRequirement {
  id: string;
  title: string;
  description: string;
  status: 'compliant' | 'partial' | 'non-compliant';
  priority: 'low' | 'medium' | 'high' | 'critical';
  lastChecked: string;
  nextCheck: string;
  responsibleParty: string;
  evidence?: string[];
  remediation?: string[];
  estimatedCost?: number;
}

const COMPLIANCE_STANDARDS: ComplianceStandard[] = [
  {
    id: 'fda-510k',
    name: 'FDA 510(k) Medical Device Requirements',
    description: 'FDA premarket notification requirements for medical devices',
    category: 'FDA',
    overallScore: 94.5,
    lastAudit: '2024-01-15T00:00:00Z',
    nextAudit: '2024-07-15T00:00:00Z',
    certificationExpiry: '2025-01-15T00:00:00Z',
    auditFrequency: 6,
    requirements: [
      {
        id: 'fda-510k-1',
        title: 'Device Classification Documentation',
        description: 'Proper classification and documentation of all medical devices',
        status: 'compliant',
        priority: 'critical',
        lastChecked: '2024-03-01T00:00:00Z',
        nextCheck: '2024-06-01T00:00:00Z',
        responsibleParty: 'Quality Assurance Manager',
        evidence: ['Device classification matrix', 'FDA correspondence'],
        estimatedCost: 0
      },
      {
        id: 'fda-510k-2',
        title: 'Quality System Documentation',
        description: 'Comprehensive quality management system documentation',
        status: 'partial',
        priority: 'high',
        lastChecked: '2024-02-15T00:00:00Z',
        nextCheck: '2024-05-15T00:00:00Z',
        responsibleParty: 'Quality Assurance Manager',
        remediation: ['Update quality manual', 'Complete staff training records'],
        estimatedCost: 5000
      }
    ]
  },
  {
    id: 'iso-13485',
    name: 'ISO 13485:2016 Medical Devices QMS',
    description: 'Quality management systems for medical devices',
    category: 'ISO',
    overallScore: 89.2,
    lastAudit: '2023-11-20T00:00:00Z',
    nextAudit: '2024-05-20T00:00:00Z',
    certificationExpiry: '2024-11-20T00:00:00Z',
    auditFrequency: 12,
    requirements: [
      {
        id: 'iso-13485-1',
        title: 'Management Responsibility',
        description: 'Top management commitment and resource allocation',
        status: 'compliant',
        priority: 'critical',
        lastChecked: '2024-02-01T00:00:00Z',
        nextCheck: '2024-08-01T00:00:00Z',
        responsibleParty: 'Chief Executive Officer',
        evidence: ['Management review minutes', 'Resource allocation records']
      },
      {
        id: 'iso-13485-2',
        title: 'Risk Management Process',
        description: 'Implementation of ISO 14971 risk management',
        status: 'non-compliant',
        priority: 'critical',
        lastChecked: '2024-01-10T00:00:00Z',
        nextCheck: '2024-04-10T00:00:00Z',
        responsibleParty: 'Risk Management Officer',
        remediation: ['Establish risk management procedure', 'Conduct risk analysis training'],
        estimatedCost: 15000
      }
    ]
  },
  {
    id: 'hipaa-security',
    name: 'HIPAA Security Rule',
    description: 'Healthcare data security and privacy requirements',
    category: 'HIPAA',
    overallScore: 96.8,
    lastAudit: '2024-02-01T00:00:00Z',
    nextAudit: '2024-08-01T00:00:00Z',
    auditFrequency: 6,
    requirements: [
      {
        id: 'hipaa-1',
        title: 'Access Control',
        description: 'Proper access controls for electronic health information',
        status: 'compliant',
        priority: 'critical',
        lastChecked: '2024-03-01T00:00:00Z',
        nextCheck: '2024-06-01T00:00:00Z',
        responsibleParty: 'IT Security Manager',
        evidence: ['Access control policies', 'Audit logs']
      },
      {
        id: 'hipaa-2',
        title: 'Encryption Standards',
        description: 'Data encryption in transit and at rest',
        status: 'compliant',
        priority: 'high',
        lastChecked: '2024-02-15T00:00:00Z',
        nextCheck: '2024-05-15T00:00:00Z',
        responsibleParty: 'IT Security Manager',
        evidence: ['Encryption implementation report']
      }
    ]
  },
  {
    id: 'joint-commission',
    name: 'Joint Commission Standards',
    description: 'Healthcare accreditation standards',
    category: 'Joint Commission',
    overallScore: 91.3,
    lastAudit: '2023-09-15T00:00:00Z',
    nextAudit: '2024-09-15T00:00:00Z',
    auditFrequency: 12,
    requirements: [
      {
        id: 'jc-1',
        title: 'Equipment Management',
        description: 'Proper management and maintenance of medical equipment',
        status: 'compliant',
        priority: 'high',
        lastChecked: '2024-02-20T00:00:00Z',
        nextCheck: '2024-05-20T00:00:00Z',
        responsibleParty: 'Biomedical Engineering Manager',
        evidence: ['Equipment inventory', 'Maintenance schedules']
      },
      {
        id: 'jc-2',
        title: 'Staff Competency',
        description: 'Staff training and competency verification',
        status: 'partial',
        priority: 'medium',
        lastChecked: '2024-01-30T00:00:00Z',
        nextCheck: '2024-04-30T00:00:00Z',
        responsibleParty: 'Human Resources Manager',
        remediation: ['Complete annual competency assessments', 'Update training records'],
        estimatedCost: 3000
      }
    ]
  }
];

export default function CompliancePage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [selectedStandard, setSelectedStandard] = useState<string | null>(null);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [loading, setLoading] = useState(false);

  const complianceMetrics = useMemo(() => {
    const totalRequirements = COMPLIANCE_STANDARDS.reduce((sum, std) => sum + std.requirements.length, 0);
    const compliantRequirements = COMPLIANCE_STANDARDS.reduce(
      (sum, std) => sum + std.requirements.filter(req => req.status === 'compliant').length, 0
    );
    const partialRequirements = COMPLIANCE_STANDARDS.reduce(
      (sum, std) => sum + std.requirements.filter(req => req.status === 'partial').length, 0
    );
    const nonCompliantRequirements = COMPLIANCE_STANDARDS.reduce(
      (sum, std) => sum + std.requirements.filter(req => req.status === 'non-compliant').length, 0
    );
    const criticalIssues = COMPLIANCE_STANDARDS.reduce(
      (sum, std) => sum + std.requirements.filter(req => 
        (req.status === 'non-compliant' || req.status === 'partial') && req.priority === 'critical'
      ).length, 0
    );
    
    const overallScore = (compliantRequirements / totalRequirements) * 100;
    const estimatedRemediationCost = COMPLIANCE_STANDARDS.reduce(
      (sum, std) => sum + std.requirements.reduce(
        (reqSum, req) => reqSum + (req.estimatedCost || 0), 0
      ), 0
    );

    return {
      totalRequirements,
      compliantRequirements,
      partialRequirements,
      nonCompliantRequirements,
      criticalIssues,
      overallScore,
      estimatedRemediationCost
    };
  }, []);

  const chartData = useMemo(() => {
    // Standards compliance scores
    const standardsData = COMPLIANCE_STANDARDS.map(std => ({
      name: std.name.split(' ')[0], // Shortened name for chart
      score: std.overallScore,
      category: std.category
    }));

    // Status distribution
    const statusData = [
      { name: 'Compliant', value: complianceMetrics.compliantRequirements, color: '#16a34a' },
      { name: 'Partial', value: complianceMetrics.partialRequirements, color: '#d97706' },
      { name: 'Non-Compliant', value: complianceMetrics.nonCompliantRequirements, color: '#dc2626' }
    ];

    return { standardsData, statusData };
  }, [complianceMetrics]);

  const selectedStandardData = selectedStandard ? 
    COMPLIANCE_STANDARDS.find(std => std.id === selectedStandard) : null;

  const generateComplianceReport = async (standardId: string) => {
    setGeneratingReport(true);
    
    try {
      // Simulate report generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const standard = COMPLIANCE_STANDARDS.find(s => s.id === standardId);
      toast({
        title: "Report Generated",
        description: `Compliance report for ${standard?.name} has been generated and downloaded.`,
      });
    } catch (error) {
      console.error('Error generating report:', error);
      toast({
        title: "Report Generation Failed",
        description: "Failed to generate compliance report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setGeneratingReport(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Compliance Management</h1>
          <p className="text-gray-600 mt-1">Automated regulatory compliance monitoring and reporting</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>Multi-Standard</span>
          </Badge>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export All
          </Button>
        </div>
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Score</p>
                <p className="text-2xl font-bold">{complianceMetrics.overallScore.toFixed(1)}%</p>
              </div>
              <Target className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={complianceMetrics.overallScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Compliant</p>
                <p className="text-2xl font-bold text-green-600">{complianceMetrics.compliantRequirements}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Partial</p>
                <p className="text-2xl font-bold text-yellow-600">{complianceMetrics.partialRequirements}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Non-Compliant</p>
                <p className="text-2xl font-bold text-red-600">{complianceMetrics.nonCompliantRequirements}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Critical Issues</p>
                <p className="text-2xl font-bold text-red-600">{complianceMetrics.criticalIssues}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Est. Cost</p>
                <p className="text-xl font-bold">${(complianceMetrics.estimatedRemediationCost / 1000).toFixed(0)}K</p>
              </div>
              <div className="mt-2">
                <Badge variant="outline" className="text-xs">
                  Estimated total
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Compliance by Standard */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Scores by Standard</CardTitle>
            <CardDescription>Current compliance status across all standards</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.standardsData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis domain={[0, 100]} />
                <Tooltip formatter={(value: any) => [`${value.toFixed(1)}%`, 'Score']} />
                <Bar dataKey="score" fill="#2563eb" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Status Distribution</CardTitle>
            <CardDescription>Overall compliance requirement status</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.statusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {chartData.statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Standards Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Compliance Standards</CardTitle>
            <CardDescription>Click on a standard to view detailed requirements</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {COMPLIANCE_STANDARDS.map((standard) => (
                <div
                  key={standard.id}
                  className={`border-l-4 p-3 bg-gray-50 rounded-r cursor-pointer transition-colors ${
                    selectedStandard === standard.id ? 'bg-blue-50' : 'hover:bg-gray-100'
                  }`}
                  style={{
                    borderLeftColor: standard.overallScore > 90 ? '#16a34a' :
                                    standard.overallScore > 80 ? '#d97706' : '#dc2626'
                  }}
                  onClick={() => setSelectedStandard(standard.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{standard.name}</h4>
                      <p className="text-sm text-gray-600">{standard.category}</p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        standard.overallScore > 90 ? 'default' :
                        standard.overallScore > 80 ? 'secondary' : 'destructive'
                      }>
                        {standard.overallScore.toFixed(1)}%
                      </Badge>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mt-1">{standard.description}</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-gray-600">
                      {standard.requirements.length} requirements
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        generateComplianceReport(standard.id);
                      }}
                      disabled={generatingReport}
                    >
                      {generatingReport ? (
                        <RefreshCw className="h-3 w-3 animate-spin mr-1" />
                      ) : (
                        <Download className="h-3 w-3 mr-1" />
                      )}
                      Report
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Detailed Requirements */}
        {selectedStandardData && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                <span>{selectedStandardData.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedStandard(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
              <CardDescription>{selectedStandardData.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Overall Score</span>
                  <Badge variant={
                    selectedStandardData.overallScore > 90 ? 'default' :
                    selectedStandardData.overallScore > 80 ? 'secondary' : 'destructive'
                  }>
                    {selectedStandardData.overallScore.toFixed(1)}%
                  </Badge>
                </div>
                <Progress value={selectedStandardData.overallScore} />

                <Separator />

                <div className="space-y-3 max-h-64 overflow-y-auto">
                  {selectedStandardData.requirements.map((requirement) => (
                    <div
                      key={requirement.id}
                      className="border rounded-lg p-3 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-sm">{requirement.title}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={
                            requirement.priority === 'critical' ? 'destructive' :
                            requirement.priority === 'high' ? 'destructive' :
                            requirement.priority === 'medium' ? 'default' : 'secondary'
                          } className="text-xs">
                            {requirement.priority}
                          </Badge>
                          <Badge variant={
                            requirement.status === 'compliant' ? 'default' :
                            requirement.status === 'partial' ? 'secondary' : 'destructive'
                          } className="text-xs">
                            {requirement.status === 'non-compliant' ? 'non-compliant' : requirement.status}
                          </Badge>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600">{requirement.description}</p>
                      
                      <div className="flex items-center justify-between text-xs text-gray-500">
                        <span>Last checked: {format(parseISO(requirement.lastChecked), 'MMM dd, yyyy')}</span>
                        <span>Next: {format(parseISO(requirement.nextCheck), 'MMM dd, yyyy')}</span>
                      </div>

                      <div className="text-xs">
                        <span className="text-gray-600">Responsible: </span>
                        <span className="font-medium">{requirement.responsibleParty}</span>
                      </div>

                      {requirement.remediation && (
                        <div className="bg-yellow-50 p-2 rounded text-xs">
                          <p className="font-medium text-yellow-800">Remediation Required:</p>
                          <ul className="mt-1 space-y-1">
                            {requirement.remediation.map((item, index) => (
                              <li key={index} className="text-yellow-700">• {item}</li>
                            ))}
                          </ul>
                          {requirement.estimatedCost && (
                            <p className="mt-1 font-medium text-yellow-800">
                              Estimated Cost: ${requirement.estimatedCost.toLocaleString()}
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Critical Issues Alert */}
      {complianceMetrics.criticalIssues > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Compliance Issues Detected:</strong> {complianceMetrics.criticalIssues} critical 
            requirement{complianceMetrics.criticalIssues === 1 ? '' : 's'} need immediate attention. 
            Review the requirements above and schedule remediation activities.
          </AlertDescription>
        </Alert>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common compliance management tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <FileText className="h-6 w-6 mb-2" />
              <span>Generate All Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>Schedule Audit</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Assign Responsibilities</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}