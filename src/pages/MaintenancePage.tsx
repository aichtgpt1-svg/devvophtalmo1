import React, { useState, useEffect } from 'react';
import { Calendar, Clock, Plus, Search, Filter, CheckCircle2, AlertTriangle, Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService, MaintenanceRecord as DBMaintenanceRecord, Device, DeviceWithUIStatus, mapDeviceStatus } from '@/services/database';
import { EmailService } from '@/services/email';
import { useAuthStore } from '@/store/auth-store';

// Extended maintenance record with UI-specific fields
interface MaintenanceRecord extends DBMaintenanceRecord {
  device_name?: string; // This will be populated from device data
  device_model?: string;
  device_manufacturer?: string;
  // Map database fields to UI fields
  status?: 'scheduled' | 'in_progress' | 'completed' | 'overdue';
  scheduled_date?: string;
  completed_date?: string;
  priority?: 'low' | 'medium' | 'high' | 'critical';
  estimated_duration?: number;
  actual_duration?: number;
}

interface MaintenanceTemplate {
  id: string;
  name: string;
  type: string;
  checklist: string[];
  estimated_duration: number;
  frequency_days: number;
}

export default function MaintenancePage() {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRecord, setSelectedRecord] = useState<MaintenanceRecord | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [currentView, setCurrentView] = useState<'list' | 'calendar'>('list');
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Remove the db instance since we're using static methods

  const maintenanceTemplates: MaintenanceTemplate[] = [
    {
      id: 'oct_preventive',
      name: 'OCT Preventive Maintenance',
      type: 'preventive',
      checklist: [
        'Clean optical surfaces',
        'Check laser alignment',
        'Verify software calibration',
        'Test image quality',
        'Check cooling system',
        'Update software if needed'
      ],
      estimated_duration: 2,
      frequency_days: 180
    },
    {
      id: 'fundus_inspection',
      name: 'Fundus Camera Inspection',
      type: 'inspection',
      checklist: [
        'Check flash bulb intensity',
        'Clean camera lens',
        'Test autofocus system',
        'Verify color balance',
        'Check patient positioning system'
      ],
      estimated_duration: 1,
      frequency_days: 90
    },
    {
      id: 'vf_calibration',
      name: 'Visual Field Analyzer Calibration',
      type: 'calibration',
      checklist: [
        'Calibrate light intensity',
        'Check button response timing',
        'Verify screen uniformity',
        'Test sound system',
        'Validate test patterns'
      ],
      estimated_duration: 1.5,
      frequency_days: 365
    }
  ];

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [maintenanceData, deviceData] = await Promise.all([
        DatabaseService.getMaintenanceRecords(),
        DatabaseService.getDevices()
      ]);
      
      // Enrich maintenance records with device information
      const enrichedRecords = await Promise.all(
        (maintenanceData.items || []).map(async (record) => {
          const device = deviceData.items.find(d => d._id === record.device_id);
          const enrichedRecord: MaintenanceRecord = {
            ...record,
            device_name: device ? `${device.manufacturer} ${device.model}` : 'Unknown Device',
            device_model: device?.model,
            device_manufacturer: device?.manufacturer,
            status: mapMaintenanceStatus(record.after_status),
            scheduled_date: record.maintenance_date,
            estimated_duration: record.duration_hours || 2
          };
          return enrichedRecord;
        })
      );
      
      setRecords(enrichedRecords);
      setDevices(deviceData.items || []);
      
      // Check for overdue maintenance
      checkOverdueMaintenance(enrichedRecords);
    } catch (error) {
      console.error('Error loading maintenance data:', error);
      toast({
        title: "Error",
        description: "Failed to load maintenance data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const checkOverdueMaintenance = async (maintenanceRecords: MaintenanceRecord[]) => {
    const now = new Date();
    const overdueRecords = maintenanceRecords.filter(record => {
      if (!record.scheduled_date) return false;
      const scheduledDate = new Date(record.scheduled_date);
      return scheduledDate < now && record.status === 'scheduled';
    });

    // Update overdue records
    for (const record of overdueRecords) {
      if (record._id) {
        await updateMaintenanceStatus(record._id, 'overdue');
      }
      
      // Send overdue notification (optional - can be enabled when EmailService is properly configured)
      /*
      await EmailService.sendMaintenanceReminder(
        'technician@example.com',
        record.technician_name,
        {
          deviceName: record.device_name || 'Unknown Device',
          manufacturer: record.device_manufacturer || 'Unknown',
          model: record.device_model || 'Unknown',
          location: 'Unknown',
          dueDate: record.scheduled_date || record.maintenance_date,
          maintenanceType: record.maintenance_type
        }
      );
      */
    }

    if (overdueRecords.length > 0) {
      toast({
        title: "Overdue Maintenance Alert",
        description: `${overdueRecords.length} maintenance task(s) are overdue`,
        variant: "destructive"
      });
    }
  };

  const updateMaintenanceStatus = async (recordId: string, status: string) => {
    try {
      await DatabaseService.updateMaintenanceRecord(recordId, user?.uid || '', { after_status: status, notes: `Status updated to ${status}` });
      await loadData();
      toast({
        title: "Success",
        description: "Maintenance status updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update maintenance status",
        variant: "destructive"
      });
    }
  };

  const completeMaintenance = async (record: MaintenanceRecord) => {
    try {
      const completedData = {
        after_status: 'completed',
        notes: `Completed on ${new Date().toISOString()}`,
        duration_hours: record.estimated_duration // This would come from a form in a real app
      };
      
      await DatabaseService.updateMaintenanceRecord(record._id!, user?.uid || '', completedData);
      
      // Send completion notification (optional - can be enabled when EmailService is properly configured)
      /*
      await EmailService.sendMaintenanceCompletionNotification(
        ['manager@example.com'],
        {
          deviceName: record.device_name || 'Unknown Device',
          maintenanceType: record.maintenance_type,
          technicianName: record.technician_name,
          completionDate: new Date().toISOString(),
          status: 'Completed',
          summary: record.notes || 'Maintenance completed successfully'
        }
      );
      */
      
      await loadData();
      toast({
        title: "Success",
        description: "Maintenance marked as completed"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to complete maintenance",
        variant: "destructive"
      });
    }
  };

  const schedulePreventiveMaintenance = async (deviceId: string, template: MaintenanceTemplate) => {
    try {
      const device = devices.find(d => d._id === deviceId);
      if (!device) return;

      const scheduledDate = new Date();
      scheduledDate.setDate(scheduledDate.getDate() + template.frequency_days);

      const newRecord: Omit<DBMaintenanceRecord, '_id' | '_uid' | '_tid'> = {
        device_id: deviceId,
        maintenance_type: template.type as DBMaintenanceRecord['maintenance_type'],
        maintenance_date: scheduledDate.toISOString(),
        technician_id: 'auto-001',
        technician_name: 'Auto-assigned',
        description: `Scheduled ${template.name}`,
        before_status: 'Operational',
        after_status: 'Scheduled',
        notes: `Scheduled ${template.name} - Checklist: ${template.checklist.join(', ')}`,
        cost: 0,
        duration_hours: template.estimated_duration
      };

      await DatabaseService.createMaintenanceRecord(newRecord);
      await loadData();
      
      toast({
        title: "Success",
        description: `Preventive maintenance scheduled for ${device.manufacturer} ${device.model}`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to schedule maintenance",
        variant: "destructive"
      });
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = (record.device_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.technician_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (record.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Helper function to map database status to UI status
  const mapMaintenanceStatus = (dbStatus: string): 'scheduled' | 'in_progress' | 'completed' | 'overdue' => {
    switch (dbStatus.toLowerCase()) {
      case 'scheduled':
      case 'pending':
        return 'scheduled';
      case 'in_progress':
      case 'active':
        return 'in_progress';
      case 'completed':
      case 'done':
        return 'completed';
      case 'overdue':
        return 'overdue';
      default:
        return 'scheduled';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'overdue': return 'bg-red-500';
      case 'scheduled': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="w-4 h-4" />;
      case 'in_progress': return <Wrench className="w-4 h-4" />;
      case 'overdue': return <AlertTriangle className="w-4 h-4" />;
      case 'scheduled': return <Clock className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-medical-primary">Maintenance Management</h1>
          <p className="text-medical-text/70 mt-2">Schedule and track equipment maintenance</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => setCurrentView(currentView === 'list' ? 'calendar' : 'list')}
          >
            <Calendar className="w-4 h-4 mr-2" />
            {currentView === 'list' ? 'Calendar View' : 'List View'}
          </Button>
          <Button onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Schedule Maintenance
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-medical-text/70">Completed</p>
                <p className="text-2xl font-bold text-medical-primary">
                  {records.filter(r => r.status === 'completed').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-medical-text/70">In Progress</p>
                <p className="text-2xl font-bold text-medical-primary">
                  {records.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-medical-text/70">Scheduled</p>
                <p className="text-2xl font-bold text-medical-primary">
                  {records.filter(r => r.status === 'scheduled').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-medical-text/70">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {records.filter(r => r.status === 'overdue').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-text/50 w-4 h-4" />
            <Input
              placeholder="Search by device or technician..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Maintenance Templates Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Schedule Templates</CardTitle>
          <CardDescription>
            Schedule common maintenance tasks for your devices
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {maintenanceTemplates.map((template) => (
              <Card key={template.id} className="border-2 hover:border-medical-primary/50 transition-colors">
                <CardContent className="p-4">
                  <h4 className="font-semibold text-medical-primary">{template.name}</h4>
                  <p className="text-sm text-medical-text/70 mb-2">
                    Every {template.frequency_days} days • {template.estimated_duration}h duration
                  </p>
                  <Select onValueChange={(deviceId) => schedulePreventiveMaintenance(deviceId, template)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select device" />
                    </SelectTrigger>
                    <SelectContent>
                      {devices.map((device) => (
                        <SelectItem key={device._id} value={device._id || ''}>
                          {device.manufacturer} {device.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Records */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Records</CardTitle>
          <CardDescription>
            Track all scheduled and completed maintenance activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRecords.length === 0 ? (
              <div className="text-center py-12">
                <Wrench className="w-12 h-12 text-medical-text/30 mx-auto mb-4" />
                <p className="text-medical-text/70 mb-4">No maintenance records found</p>
                <p className="text-sm text-medical-text/50">
                  Use the quick schedule templates above to create your first maintenance record
                </p>
              </div>
            ) : (
              filteredRecords.map((record) => (
                <Card key={record._id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {record.status && getStatusIcon(record.status)}
                          <h3 className="font-semibold text-medical-primary">
                            {record.device_name}
                          </h3>
                          <Badge className={`${record.status ? getStatusColor(record.status) : 'bg-gray-500'} text-white`}>
                            {record.status ? record.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                          </Badge>
                          <Badge variant="outline">
                            {record.maintenance_type.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-medical-text/70 space-y-1">
                          <p><strong>Scheduled:</strong> {record.scheduled_date ? new Date(record.scheduled_date).toLocaleDateString() : 'Not scheduled'}</p>
                          <p><strong>Technician:</strong> {record.technician_name}</p>
                          <p><strong>Duration:</strong> {record.estimated_duration}h estimated</p>
                          {record.notes && <p><strong>Notes:</strong> {record.notes}</p>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        {record.status === 'scheduled' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => record._id && updateMaintenanceStatus(record._id, 'in_progress')}
                          >
                            Start
                          </Button>
                        )}
                        {record.status === 'in_progress' && (
                          <Button
                            size="sm"
                            onClick={() => completeMaintenance(record)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Complete
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}