import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService, Device, MaintenanceRecord } from '@/services/database';
import { useAuthStore } from '@/store/auth-store';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Activity,
  Calendar,
  MapPin,
  Tag,
  Hash,
  Building2,
  AlertCircle,
  CheckCircle2,
  Clock,
  FileText,
  Wrench,
  Shield
} from 'lucide-react';

const statusConfig = {
  'Operational': { 
    label: 'Operational', 
    color: 'bg-green-500', 
    icon: CheckCircle2,
    variant: 'default' as const,
    description: 'Device is operational and in use'
  },
  'Under_Maintenance': { 
    label: 'Under Maintenance', 
    color: 'bg-yellow-500', 
    icon: Clock,
    variant: 'secondary' as const,
    description: 'Device is currently being serviced'
  },
  'Maintenance_Required': { 
    label: 'Maintenance Required', 
    color: 'bg-red-500', 
    icon: AlertCircle,
    variant: 'destructive' as const,
    description: 'Device requires immediate attention'
  },
  'Out_of_Service': { 
    label: 'Out of Service', 
    color: 'bg-gray-500', 
    icon: Activity,
    variant: 'outline' as const,
    description: 'Device is not currently in use'
  }
};

export default function DeviceDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();

  const [device, setDevice] = useState<Device | null>(null);
  const [maintenanceRecords, setMaintenanceRecords] = useState<MaintenanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadDeviceDetails(id);
    }
  }, [id]);

  const loadDeviceDetails = async (deviceId: string) => {
    try {
      setLoading(true);
      
      // Load device details - get by querying for the specific ID
      const foundDevice = await DatabaseService.getDeviceById(deviceId);
      
      if (foundDevice) {
        setDevice(foundDevice);
      } else {
        toast({
          title: "Error",
          description: "Device not found",
          variant: "destructive"
        });
        navigate('/devices');
        return;
      }

      // Load maintenance records
      const maintenanceResult = await DatabaseService.getMaintenanceRecords({ 
        deviceId: deviceId,
        limit: 50
      });
      setMaintenanceRecords(maintenanceResult.items || []);
    } catch (error) {
      console.error('Error loading device details:', error);
      toast({
        title: "Error",
        description: "Failed to load device details",
        variant: "destructive"
      });
      navigate('/devices');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async () => {
    if (!device || !confirm('Are you sure you want to delete this device? This action cannot be undone.')) {
      return;
    }
    
    try {
      await DatabaseService.deleteDevice(device._id!, user?.uid || '');
      toast({
        title: "Success",
        description: "Device deleted successfully"
      });
      navigate('/devices');
    } catch (error) {
      console.error('Error deleting device:', error);
      toast({
        title: "Error",
        description: "Failed to delete device",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const isWarrantyExpired = (warrantyDate: string) => {
    if (!warrantyDate) return false;
    return new Date(warrantyDate) < new Date();
  };

  const isMaintenanceDue = (nextMaintenance: string | undefined) => {
    if (!nextMaintenance) return false;
    const nextDate = new Date(nextMaintenance);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading device details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!device) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Device Not Found</h1>
          <Button asChild>
            <Link to="/devices">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Devices
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const statusInfo = statusConfig[device.status] || statusConfig['Out_of_Service'];
  const StatusIcon = statusInfo.icon;
  const warrantyExpired = false; // warranty_expiry field not available in current schema
  const maintenanceDue = isMaintenanceDue(device.next_maintenance);

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => navigate('/devices')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Devices
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-primary">{device.manufacturer} {device.model}</h1>
            <p className="text-muted-foreground">
              {device.manufacturer} {device.model}
            </p>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link to={`/devices/${device._id}/edit`}>
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Link>
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDeleteDevice}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {(maintenanceDue || warrantyExpired) && (
        <div className="mb-6 space-y-3">
          {maintenanceDue && (
            <Card className="border-yellow-200 bg-yellow-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <div>
                    <p className="font-medium text-yellow-800">Maintenance Due Soon</p>
                    <p className="text-sm text-yellow-700">
                      Next maintenance scheduled for {device.next_maintenance ? formatDate(device.next_maintenance) : 'Not scheduled'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {warrantyExpired && (
            <Card className="border-red-200 bg-red-50">
              <CardContent className="py-4">
                <div className="flex items-center gap-3">
                  <Shield className="w-5 h-5 text-red-600" />
                  <div>
                    <p className="font-medium text-red-800">Warranty Expired</p>
                    <p className="text-sm text-red-700">
                      Warranty information not available
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Details */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Device Information</CardTitle>
                <Badge variant={statusInfo.variant}>
                  <StatusIcon className="w-3 h-3 mr-1" />
                  {statusInfo.label}
                </Badge>
              </div>
              <CardDescription>{statusInfo.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Manufacturer</span>
                  </div>
                  <p className="text-lg font-semibold">{device.manufacturer}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Model</span>
                  </div>
                  <p className="text-lg font-semibold">{device.model}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Hash className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Serial Number</span>
                  </div>
                  <p className="text-lg font-mono">{device.serial_number}</p>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-medium text-muted-foreground">Location</span>
                  </div>
                  <p className="text-lg font-semibold">{device.location || 'Location not set'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Tag className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium text-muted-foreground">Device Type</span>
                </div>
                <Badge variant="outline" className="text-base px-3 py-1">
                  {device.device_type}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {/* Device Info - Using available fields */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Device Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p><strong>Type:</strong> {device.device_type}</p>
                <p><strong>Serial Number:</strong> {device.serial_number}</p>
                <p><strong>Location:</strong> {device.location || 'Not specified'}</p>
              </div>
            </CardContent>
          </Card>

          {/* Recent Maintenance */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wrench className="w-5 h-5" />
                Recent Maintenance
              </CardTitle>
              <CardDescription>
                Latest maintenance activities for this device
              </CardDescription>
            </CardHeader>
            <CardContent>
              {maintenanceRecords.length === 0 ? (
                <div className="text-center py-8">
                  <Wrench className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">No maintenance records found</p>
                  <Button asChild variant="outline" className="mt-4">
                    <Link to={`/maintenance/new?device_id=${device._id}`}>
                      Add Maintenance Record
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {maintenanceRecords.slice(0, 3).map((record) => (
                    <div key={record._id} className="border rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-medium">{record.maintenance_type}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {formatDate(record.maintenance_date)} • {record.technician_name}
                          </p>
                          <p className="text-sm">{record.description}</p>
                        </div>
                        <Badge variant="outline">{record.after_status}</Badge>
                      </div>
                    </div>
                  ))}
                  {maintenanceRecords.length > 3 && (
                    <Button asChild variant="outline" className="w-full">
                      <Link to={`/maintenance?device_id=${device._id}`}>
                        View All Maintenance Records ({maintenanceRecords.length})
                      </Link>
                    </Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Important Dates */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Important Dates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Created Date</p>
                <p className="text-lg">{formatDate(device.created_at)}</p>
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Warranty Expiry</p>
                <p className={`text-lg ${warrantyExpired ? 'text-red-600 font-semibold' : ''}`}>
                  Not available
                </p>
                {warrantyExpired && (
                  <p className="text-xs text-red-600 mt-1">Expired</p>
                )}
              </div>
              
              <Separator />
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Last Maintenance</p>
                <p className="text-lg">{device.last_maintenance ? formatDate(device.last_maintenance) : 'Not recorded'}</p>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Next Maintenance</p>
                <p className={`text-lg ${maintenanceDue ? 'text-yellow-600 font-semibold' : ''}`}>
                  {device.next_maintenance ? formatDate(device.next_maintenance) : 'Not scheduled'}
                </p>
                {maintenanceDue && (
                  <p className="text-xs text-yellow-600 mt-1">Due soon</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link to={`/maintenance/new?device_id=${device._id}`}>
                  <Wrench className="w-4 h-4 mr-2" />
                  Schedule Maintenance
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to={`/service-requests/new?device_id=${device._id}`}>
                  <AlertCircle className="w-4 h-4 mr-2" />
                  Report Issue
                </Link>
              </Button>
              
              <Button asChild variant="outline" className="w-full">
                <Link to={`/devices/${device._id}/edit`}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Device
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}