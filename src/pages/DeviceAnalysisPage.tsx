import React, { useState } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { DatabaseService, Device } from '@/services/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Brain,
  Upload,
  FileText,
  Image,
  FileSpreadsheet,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Download,
  Eye,
  Zap,
  Settings
} from 'lucide-react';

interface AnalysisResult {
  id: string;
  fileName: string;
  fileType: string;
  processingTime: number;
  confidence: number;
  extractedDevices: ExtractedDevice[];
  insights: string[];
  recommendations: string[];
}

interface ExtractedDevice {
  name: string;
  manufacturer?: string;
  model?: string;
  serialNumber?: string;
  type?: string;
  location?: string;
  installationDate?: string;
  warrantyExpiry?: string;
  status?: string;
  confidence: number;
}

export default function DeviceAnalysisPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [selectedResult, setSelectedResult] = useState<AnalysisResult | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const handleFiles = async (files: File[]) => {
    setUploading(true);
    setProgress(0);
    
    try {
      for (const file of files) {
        await processFile(file);
      }
    } catch (error) {
      console.error('Error processing files:', error);
      toast({
        title: "Processing Failed",
        description: "Failed to process uploaded files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const processFile = async (file: File) => {
    setAnalyzing(true);
    
    // Simulate file upload progress
    for (let i = 0; i <= 100; i += 10) {
      setProgress(i);
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Simulate AI analysis
    const analysisTime = 2000 + Math.random() * 3000;
    await new Promise(resolve => setTimeout(resolve, analysisTime));

    // Generate mock analysis results based on file type
    const mockResult: AnalysisResult = {
      id: crypto.randomUUID(),
      fileName: file.name,
      fileType: file.type,
      processingTime: analysisTime / 1000,
      confidence: 85 + Math.random() * 10,
      extractedDevices: generateMockDevices(file.name),
      insights: generateMockInsights(),
      recommendations: generateMockRecommendations()
    };

    setAnalysisResults(prev => [mockResult, ...prev]);
    setAnalyzing(false);

    toast({
      title: "Analysis Complete",
      description: `Successfully analyzed ${file.name} and extracted ${mockResult.extractedDevices.length} devices.`,
    });
  };

  const generateMockDevices = (fileName: string): ExtractedDevice[] => {
    const deviceTypes = ['OCT Machine', 'Fundus Camera', 'Visual Field Analyzer', 'Slit Lamp', 'Autorefractor'];
    const manufacturers = ['Carl Zeiss Meditec', 'Topcon', 'Haag-Streit', 'Heidelberg Engineering', 'Alcon'];
    
    const deviceCount = Math.floor(Math.random() * 5) + 1;
    
    return Array.from({ length: deviceCount }, (_, index) => ({
      name: `${deviceTypes[index % deviceTypes.length]} ${index + 1}`,
      manufacturer: manufacturers[Math.floor(Math.random() * manufacturers.length)],
      model: `Model ${String.fromCharCode(65 + index)}${Math.floor(Math.random() * 1000)}`,
      serialNumber: `SN${Math.random().toString(36).substring(2, 10).toUpperCase()}`,
      type: deviceTypes[index % deviceTypes.length],
      location: `Lab Room ${index + 1}`,
      installationDate: new Date(2020 + Math.random() * 4, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
      warrantyExpiry: new Date(2024 + Math.random() * 3, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28)).toISOString(),
      status: ['Operational', 'Needs Maintenance', 'Under Repair'][Math.floor(Math.random() * 3)],
      confidence: 75 + Math.random() * 20
    }));
  };

  const generateMockInsights = (): string[] => {
    const insights = [
      'Multiple devices from the same manufacturer detected - potential bulk maintenance opportunities',
      'Several devices approaching warranty expiry - consider renewal planning',
      'Detected devices with similar installation dates - synchronized maintenance scheduling recommended',
      'High-value equipment identified - prioritize preventive maintenance',
      'Location data suggests equipment clustering - optimize service routes'
    ];
    
    return insights.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const generateMockRecommendations = (): string[] => {
    const recommendations = [
      'Schedule quarterly maintenance reviews for high-usage equipment',
      'Implement predictive maintenance for critical devices',
      'Consider service contracts for warranty-expired equipment',
      'Establish equipment replacement timeline based on age analysis',
      'Create location-based maintenance routing for efficiency'
    ];
    
    return recommendations.slice(0, Math.floor(Math.random() * 3) + 2);
  };

  const handleSaveDevices = async (result: AnalysisResult) => {
    if (!user) return;
    
    try {
      for (const device of result.extractedDevices) {
        await DatabaseService.createDevice({
          manufacturer: device.manufacturer || '',
          model: device.model || '',
          serial_number: device.serialNumber || '',
          device_type: (device.type === 'OCT Machine' ? 'OCT' :
                       device.type === 'Fundus Camera' ? 'Fundus_Camera' :
                       device.type === 'Visual Field Analyzer' ? 'Visual_Field' :
                       device.type === 'Slit Lamp' ? 'Slit_Lamp' :
                       'OCT') as Device['device_type'],
          location: device.location || '',
          status: (device.status === 'Under Repair' ? 'Under_Maintenance' : 
                  device.status === 'Needs Maintenance' ? 'Maintenance_Required' : 
                  'Operational') as Device['status'],
          name: device.name || '',
          installation_date: device.installationDate || '',
          warranty_expiry: device.warrantyExpiry || ''
        });
      }

      toast({
        title: "Devices Saved",
        description: `Successfully saved ${result.extractedDevices.length} devices to inventory.`,
      });
    } catch (error) {
      console.error('Error saving devices:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save devices to inventory. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.includes('image')) return <Image className="h-6 w-6" />;
    if (fileType.includes('pdf')) return <FileText className="h-6 w-6" />;
    if (fileType.includes('sheet') || fileType.includes('excel')) return <FileSpreadsheet className="h-6 w-6" />;
    return <FileText className="h-6 w-6" />;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'operational': return 'default';
      case 'needs maintenance': return 'secondary';
      case 'under repair': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">AI Device Analysis</h1>
          <p className="text-gray-600 mt-1">Upload files for intelligent device extraction and analysis</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="flex items-center space-x-2">
            <Brain className="h-4 w-4" />
            <span>AI Powered</span>
          </Badge>
        </div>
      </div>

      {/* Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Files for Analysis</CardTitle>
          <CardDescription>
            Drag and drop files or click to browse. Supports PDFs, images, spreadsheets, and more.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragActive
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            {uploading || analyzing ? (
              <div className="space-y-4">
                {analyzing ? (
                  <>
                    <Brain className="h-12 w-12 mx-auto text-blue-500 animate-pulse" />
                    <div>
                      <p className="text-lg font-medium">Analyzing with AI...</p>
                      <p className="text-sm text-gray-600">Extracting device information</p>
                    </div>
                  </>
                ) : (
                  <>
                    <Upload className="h-12 w-12 mx-auto text-blue-500" />
                    <div>
                      <p className="text-lg font-medium">Uploading...</p>
                      <Progress value={progress} className="w-64 mx-auto mt-2" />
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 mx-auto text-gray-400" />
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    Drop files here or click to browse
                  </p>
                  <p className="text-sm text-gray-600">
                    PDF, Excel, Word, Images - All file types supported
                  </p>
                </div>
                <input
                  type="file"
                  multiple
                  onChange={handleFileInput}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.csv,.txt"
                />
                <Button asChild>
                  <label htmlFor="file-upload" className="cursor-pointer">
                    <Upload className="h-4 w-4 mr-2" />
                    Select Files
                  </label>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Analysis Results */}
      {analysisResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Results</CardTitle>
            <CardDescription>AI-extracted device information from uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisResults.map((result) => (
                <div key={result.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      {getFileIcon(result.fileType)}
                      <div>
                        <h4 className="font-semibold">{result.fileName}</h4>
                        <p className="text-sm text-gray-600">
                          Processed in {result.processingTime.toFixed(1)}s • {result.confidence.toFixed(1)}% confidence
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        {result.extractedDevices.length} device{result.extractedDevices.length === 1 ? '' : 's'}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedResult(result)}
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        Details
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveDevices(result)}
                      >
                        <Download className="h-3 w-3 mr-1" />
                        Save to Inventory
                      </Button>
                    </div>
                  </div>

                  {/* Quick Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="font-medium text-gray-700">Extracted Devices</p>
                      <div className="mt-1 space-y-1">
                        {result.extractedDevices.slice(0, 3).map((device, index) => (
                          <div key={index} className="flex items-center justify-between">
                            <span className="truncate">{device.name}</span>
                            <Badge variant={getStatusColor(device.status || 'operational')} className="text-xs">
                              {device.status || 'Operational'}
                            </Badge>
                          </div>
                        ))}
                        {result.extractedDevices.length > 3 && (
                          <p className="text-gray-500">+{result.extractedDevices.length - 3} more</p>
                        )}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">AI Insights</p>
                      <div className="mt-1 space-y-1">
                        {result.insights.slice(0, 2).map((insight, index) => (
                          <p key={index} className="text-gray-600 text-xs">• {insight}</p>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-700">Recommendations</p>
                      <div className="mt-1 space-y-1">
                        {result.recommendations.slice(0, 2).map((rec, index) => (
                          <p key={index} className="text-gray-600 text-xs">• {rec}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Results Modal */}
      {selectedResult && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Analysis Details: {selectedResult.fileName}</h2>
                <Button variant="ghost" onClick={() => setSelectedResult(null)}>
                  ×
                </Button>
              </div>

              {/* Extracted Devices */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Extracted Devices</h3>
                <div className="grid gap-4">
                  {selectedResult.extractedDevices.map((device, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{device.name}</h4>
                        <div className="flex items-center space-x-2">
                          <Badge variant={getStatusColor(device.status || 'operational')}>
                            {device.status || 'Operational'}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {device.confidence.toFixed(1)}% confidence
                          </Badge>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Manufacturer</p>
                          <p className="font-medium">{device.manufacturer || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Model</p>
                          <p className="font-medium">{device.model || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Serial Number</p>
                          <p className="font-medium">{device.serialNumber || 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Location</p>
                          <p className="font-medium">{device.location || 'N/A'}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* AI Insights */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">AI Insights</h3>
                <div className="space-y-2">
                  {selectedResult.insights.map((insight, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <Zap className="h-4 w-4 text-yellow-500 mt-0.5" />
                      <p className="text-sm">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recommendations */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-4">Recommendations</h3>
                <div className="space-y-2">
                  {selectedResult.recommendations.map((rec, index) => (
                    <div key={index} className="flex items-start space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                      <p className="text-sm">{rec}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setSelectedResult(null)}>
                  Close
                </Button>
                <Button onClick={() => handleSaveDevices(selectedResult)}>
                  <Download className="h-4 w-4 mr-2" />
                  Save to Inventory
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Getting Started */}
      {analysisResults.length === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Getting Started with AI Analysis</CardTitle>
            <CardDescription>Learn how to get the most out of our AI-powered device analysis</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <Upload className="h-12 w-12 mx-auto text-blue-500 mb-4" />
                <h3 className="font-semibold mb-2">1. Upload Files</h3>
                <p className="text-sm text-gray-600">
                  Upload any documents containing device information - PDFs, spreadsheets, images, or text files.
                </p>
              </div>
              <div className="text-center">
                <Brain className="h-12 w-12 mx-auto text-purple-500 mb-4" />
                <h3 className="font-semibold mb-2">2. AI Analysis</h3>
                <p className="text-sm text-gray-600">
                  Our AI automatically extracts device information, specifications, and maintenance data.
                </p>
              </div>
              <div className="text-center">
                <Settings className="h-12 w-12 mx-auto text-green-500 mb-4" />
                <h3 className="font-semibold mb-2">3. Save to Inventory</h3>
                <p className="text-sm text-gray-600">
                  Review extracted data and save devices directly to your inventory management system.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}