import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  DragDropContext, 
  Droppable, 
  Draggable, 
  DropResult 
} from '@hello-pangea/dnd';
import {
  BarChart3,
  LineChart,
  PieChart,
  Table,
  Calendar,
  Filter,
  Download,
  Eye,
  Trash2,
  Plus,
  Move,
  Settings
} from 'lucide-react';

// Report Component Types
interface ReportComponent {
  id: string;
  type: 'chart' | 'table' | 'metric' | 'filter';
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  dataSource: string;
  filters: ReportFilter[];
  config: any;
}

interface ReportFilter {
  id: string;
  field: string;
  operator: 'equals' | 'contains' | 'greater' | 'less' | 'between';
  value: any;
}

interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  components: ReportComponent[];
  layout: string[];
  createdAt: string;
  updatedAt: string;
}

// Available Data Sources
const DATA_SOURCES = [
  { id: 'devices', name: 'Devices', fields: ['device_name', 'device_type', 'manufacturer', 'model', 'status', 'location'] },
  { id: 'maintenance', name: 'Maintenance Records', fields: ['device_id', 'maintenance_type', 'scheduled_date', 'completion_date', 'status', 'technician_id'] },
  { id: 'service_requests', name: 'Service Requests', fields: ['device_id', 'request_type', 'priority', 'status', 'created_at', 'resolved_at'] },
  { id: 'compliance', name: 'Compliance Records', fields: ['device_id', 'regulation_type', 'compliance_status', 'last_audit', 'next_due'] }
];

// Available Chart Types
const CHART_TYPES = [
  { id: 'bar', name: 'Bar Chart', icon: BarChart3, description: 'Compare categories' },
  { id: 'line', name: 'Line Chart', icon: LineChart, description: 'Show trends over time' },
  { id: 'pie', name: 'Pie Chart', icon: PieChart, description: 'Show proportions' },
  { id: 'table', name: 'Data Table', icon: Table, description: 'Detailed data view' }
];

// Component Palette
const COMPONENT_PALETTE = [
  { id: 'chart-bar', type: 'chart', chartType: 'bar', name: 'Bar Chart', icon: BarChart3 },
  { id: 'chart-line', type: 'chart', chartType: 'line', name: 'Line Chart', icon: LineChart },
  { id: 'chart-pie', type: 'chart', chartType: 'pie', name: 'Pie Chart', icon: PieChart },
  { id: 'table', type: 'table', name: 'Data Table', icon: Table },
  { id: 'metric', type: 'metric', name: 'Key Metric', icon: BarChart3 },
  { id: 'filter', type: 'filter', name: 'Filter Panel', icon: Filter }
];

export default function ReportBuilder() {
  const [currentReport, setCurrentReport] = useState<ReportTemplate | null>(null);
  const [components, setComponents] = useState<ReportComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const [reportName, setReportName] = useState('');
  const [isPreviewMode, setIsPreviewMode] = useState(false);

  // Handle drag and drop
  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const { source, destination } = result;
    
    if (source.droppableId === 'palette' && destination.droppableId === 'canvas') {
      // Add new component from palette to canvas
      const paletteItem = COMPONENT_PALETTE[source.index];
      const newComponent: ReportComponent = {
        id: `component-${Date.now()}`,
        type: paletteItem.type as any,
        chartType: paletteItem.chartType as any,
        title: `New ${paletteItem.name}`,
        dataSource: 'devices',
        filters: [],
        config: {}
      };
      
      const newComponents = [...components];
      newComponents.splice(destination.index, 0, newComponent);
      setComponents(newComponents);
    } else if (source.droppableId === 'canvas' && destination.droppableId === 'canvas') {
      // Reorder components in canvas
      const newComponents = Array.from(components);
      const [reorderedItem] = newComponents.splice(source.index, 1);
      newComponents.splice(destination.index, 0, reorderedItem);
      setComponents(newComponents);
    }
  };

  // Remove component
  const removeComponent = (componentId: string) => {
    setComponents(components.filter(c => c.id !== componentId));
    if (selectedComponent === componentId) {
      setSelectedComponent(null);
    }
  };

  // Update component
  const updateComponent = (componentId: string, updates: Partial<ReportComponent>) => {
    setComponents(components.map(c => 
      c.id === componentId ? { ...c, ...updates } : c
    ));
  };

  // Save report
  const saveReport = () => {
    if (!reportName.trim()) {
      alert('Please enter a report name');
      return;
    }

    const reportTemplate: ReportTemplate = {
      id: `report-${Date.now()}`,
      name: reportName,
      description: `Custom report with ${components.length} components`,
      components,
      layout: components.map(c => c.id),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to localStorage (in real app, save to database)
    const savedReports = JSON.parse(localStorage.getItem('custom-reports') || '[]');
    savedReports.push(reportTemplate);
    localStorage.setItem('custom-reports', JSON.stringify(savedReports));

    alert('Report saved successfully!');
    setCurrentReport(reportTemplate);
  };

  // Export report
  const exportReport = () => {
    const reportData = {
      name: reportName,
      components,
      exportedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.replace(/\s+/g, '_')}_report.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-full flex">
      {/* Component Palette */}
      <div className="w-80 border-r bg-gray-50 p-4">
        <div className="mb-6">
          <h3 className="font-semibold text-lg mb-2">Report Builder</h3>
          <p className="text-sm text-gray-600">Drag components to canvas to build your custom report</p>
        </div>

        {/* Report Settings */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-sm">Report Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="reportName">Report Name</Label>
              <Input
                id="reportName"
                value={reportName}
                onChange={(e) => setReportName(e.target.value)}
                placeholder="Enter report name"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={saveReport} size="sm" disabled={!reportName.trim()}>
                Save Report
              </Button>
              <Button onClick={exportReport} variant="outline" size="sm" disabled={components.length === 0}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Component Palette */}
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Components</CardTitle>
          </CardHeader>
          <CardContent>
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="palette">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-2">
                    {COMPONENT_PALETTE.map((item, index) => (
                      <Draggable key={item.id} draggableId={item.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className={`p-3 border rounded-lg cursor-move transition-colors ${
                              snapshot.isDragging 
                                ? 'border-blue-300 bg-blue-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              <item.icon className="w-4 h-4 text-gray-500" />
                              <span className="text-sm font-medium">{item.name}</span>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          </CardContent>
        </Card>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 flex flex-col">
        {/* Toolbar */}
        <div className="border-b p-4 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="font-semibold">
                {reportName || 'Untitled Report'}
              </h2>
              <Badge variant="outline">
                {components.length} component{components.length !== 1 ? 's' : ''}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={isPreviewMode ? 'default' : 'outline'}
                size="sm"
                onClick={() => setIsPreviewMode(!isPreviewMode)}
              >
                <Eye className="w-4 h-4 mr-1" />
                {isPreviewMode ? 'Edit' : 'Preview'}
              </Button>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <div className="flex-1 p-6">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="canvas">
              {(provided, snapshot) => (
                <div
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                  className={`min-h-full rounded-lg border-2 border-dashed transition-colors ${
                    snapshot.isDraggingOver
                      ? 'border-blue-300 bg-blue-50'
                      : components.length === 0
                      ? 'border-gray-300 bg-gray-50'
                      : 'border-transparent bg-transparent'
                  }`}
                >
                  {components.length === 0 ? (
                    <div className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Move className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">
                          Start Building Your Report
                        </h3>
                        <p className="text-gray-500">
                          Drag components from the left panel to create your custom report
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {components.map((component, index) => (
                        <Draggable
                          key={component.id}
                          draggableId={component.id}
                          index={index}
                          isDragDisabled={isPreviewMode}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              className={`transition-all ${
                                snapshot.isDragging ? 'rotate-2 scale-105' : ''
                              }`}
                            >
                              <Card className={`relative ${
                                selectedComponent === component.id ? 'ring-2 ring-blue-500' : ''
                              }`}>
                                {!isPreviewMode && (
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => setSelectedComponent(component.id)}
                                      className="h-8 w-8 p-0"
                                    >
                                      <Settings className="w-4 h-4" />
                                    </Button>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => removeComponent(component.id)}
                                      className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </div>
                                )}
                                
                                <div {...provided.dragHandleProps} className="group">
                                  <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                      {component.type === 'chart' && component.chartType === 'bar' && <BarChart3 className="w-5 h-5" />}
                                      {component.type === 'chart' && component.chartType === 'line' && <LineChart className="w-5 h-5" />}
                                      {component.type === 'chart' && component.chartType === 'pie' && <PieChart className="w-5 h-5" />}
                                      {component.type === 'table' && <Table className="w-5 h-5" />}
                                      {component.title}
                                    </CardTitle>
                                  </CardHeader>
                                  <CardContent>
                                    <div className="h-48 bg-gray-100 rounded flex items-center justify-center">
                                      <div className="text-center">
                                        <div className="text-sm text-gray-500 mb-2">
                                          Data Source: {DATA_SOURCES.find(ds => ds.id === component.dataSource)?.name}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                          Component preview will render here
                                        </div>
                                      </div>
                                    </div>
                                  </CardContent>
                                </div>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    </div>
                  )}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      </div>

      {/* Properties Panel */}
      {selectedComponent && !isPreviewMode && (
        <div className="w-80 border-l bg-gray-50 p-4">
          <h3 className="font-semibold text-lg mb-4">Component Properties</h3>
          
          {(() => {
            const component = components.find(c => c.id === selectedComponent);
            if (!component) return null;

            return (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={component.title}
                    onChange={(e) => updateComponent(component.id, { title: e.target.value })}
                  />
                </div>

                <div>
                  <Label htmlFor="dataSource">Data Source</Label>
                  <Select
                    value={component.dataSource}
                    onValueChange={(value) => updateComponent(component.id, { dataSource: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_SOURCES.map(ds => (
                        <SelectItem key={ds.id} value={ds.id}>{ds.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {component.type === 'chart' && (
                  <div>
                    <Label htmlFor="chartType">Chart Type</Label>
                    <Select
                      value={component.chartType || 'bar'}
                      onValueChange={(value) => updateComponent(component.id, { chartType: value as any })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CHART_TYPES.map(ct => (
                          <SelectItem key={ct.id} value={ct.id}>{ct.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div>
                  <Label>Available Fields</Label>
                  <div className="mt-2 space-y-1">
                    {DATA_SOURCES.find(ds => ds.id === component.dataSource)?.fields.map(field => (
                      <Badge key={field} variant="outline" className="mr-1 mb-1">
                        {field}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
}