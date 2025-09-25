import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService, Device, DeviceWithUIStatus, mapDeviceStatus } from '@/services/database';
import { useAuthStore } from '@/store/auth-store';
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2,
  Activity,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Settings2
} from 'lucide-react';

const deviceTypes = [
  'OCT Scanner',
  'Fundus Camera', 
  'Visual Field Analyzer',
  'Tonometer',
  'Slit Lamp',
  'Autorefractor',
  'Keratometer',
  'Pachymeter',
  'Specular Microscope',
  'Laser System'
];

const statusConfig = {
  'Operational': { 
    label: 'Operational', 
    color: 'bg-green-500', 
    icon: CheckCircle2,
    variant: 'default' as const
  },
  'Under_Maintenance': { 
    label: 'Under Maintenance', 
    color: 'bg-yellow-500', 
    icon: Clock,
    variant: 'secondary' as const
  },
  'Maintenance_Required': { 
    label: 'Maintenance Required', 
    color: 'bg-red-500', 
    icon: AlertTriangle,
    variant: 'destructive' as const
  },
  'Out_of_Service': { 
    label: 'Out of Service', 
    color: 'bg-gray-500', 
    icon: Activity,
    variant: 'outline' as const
  }
};

export default function DevicesPage() {
  const [devices, setDevices] = useState<DeviceWithUIStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const { toast } = useToast();
  const { user } = useAuthStore();

  useEffect(() => {
    loadDevices();
  }, []);

  const loadDevices = async () => {
    try {
      setLoading(true);
      const result = await DatabaseService.getDevices({ limit: 100 });
      // Map devices to include UI status and display name
      const devicesWithUIStatus = (result.items || []).map(device => ({
        ...device,
        uiStatus: mapDeviceStatus(device.status),
        displayName: `${device.manufacturer} ${device.model}`
      }));
      setDevices(devicesWithUIStatus);
    } catch (error) {
      console.error('Error loading devices:', error);
      toast({
        title: "Info",
        description: "No devices found. Add your first device to get started.",
        variant: "default"
      });
      setDevices([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDevice = async (deviceId: string) => {
    if (!confirm('Are you sure you want to delete this device?')) return;
    
    try {
      await DatabaseService.deleteDevice(deviceId, user?.uid || '');
      setDevices(prev => prev.filter(d => d._id !== deviceId));
      toast({
        title: "Success",
        description: "Device deleted successfully"
      });
    } catch (error) {
      console.error('Error deleting device:', error);
      toast({
        title: "Error",
        description: "Failed to delete device",
        variant: "destructive"
      });
    }
  };

  const filteredDevices = devices.filter(device => {
    const deviceName = device.displayName.toLowerCase();
    const matchesSearch = deviceName.includes(searchTerm.toLowerCase()) ||
                         device.manufacturer.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.serial_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = selectedType === 'all' || device.device_type === selectedType;
    const matchesStatus = selectedStatus === 'all' || device.uiStatus === selectedStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusInfo = (status: Device['status']) => {
    return statusConfig[status] || statusConfig['Out_of_Service'];
  };

  const isMaintenanceDue = (nextMaintenance: string | undefined) => {
    if (!nextMaintenance) return false;
    const nextDate = new Date(nextMaintenance);
    const today = new Date();
    const diffTime = nextDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7; // Due within 7 days
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Activity className="w-8 h-8 mx-auto mb-4 text-primary animate-spin" />
            <p className="text-muted-foreground">Loading devices...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">Device Management</h1>
          <p className="text-muted-foreground">
            Monitor and manage all ophthalmology equipment
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/devices/new">
            <Plus className="w-4 h-4 mr-2" />
            Add Device
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <Card className="border-0 shadow-md mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search devices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Device Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {deviceTypes.map(type => (
                  <SelectItem key={type} value={type}>{type}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedType('all');
              setSelectedStatus('all');
            }}>
              <Filter className="w-4 h-4 mr-2" />
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Devices</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{devices.length}</div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {devices.filter(d => d.status === 'Operational').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {devices.filter(d => d.status === 'Under_Maintenance' || d.status === 'Maintenance_Required').length}
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {devices.filter(d => d.status === 'Out_of_Service').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Devices Grid */}
      {filteredDevices.length === 0 ? (
        <Card className="border-0 shadow-md">
          <CardContent className="py-12">
            <div className="text-center">
              <Settings2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No devices found</h3>
              <p className="text-muted-foreground mb-4">
                {devices.length === 0 
                  ? "Start by adding your first device to the system"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {devices.length === 0 && (
                <Button asChild>
                  <Link to="/devices/new">
                    <Plus className="w-4 h-4 mr-2" />
                    Add First Device
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDevices.map((device) => {
            const statusInfo = getStatusInfo(device.status);
            const StatusIcon = statusInfo.icon;
            const maintenanceDue = isMaintenanceDue(device.next_maintenance);
            
            return (
              <Card key={device._id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-lg mb-1">{device.manufacturer} {device.model}</CardTitle>
                      <CardDescription className="text-sm">
                        {device.manufacturer} {device.model}
                      </CardDescription>
                    </div>
                    <Badge variant={statusInfo.variant} className="ml-2">
                      <StatusIcon className="w-3 h-3 mr-1" />
                      {statusInfo.label}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-muted-foreground">Type:</span>
                        <p className="text-foreground">{device.device_type}</p>
                      </div>
                      <div>
                        <span className="font-medium text-muted-foreground">Location:</span>
                        <p className="text-foreground">{device.location || 'Location not set'}</p>
                      </div>
                    </div>
                    
                    <div className="text-sm">
                      <span className="font-medium text-muted-foreground">Serial:</span>
                      <p className="text-foreground font-mono">{device.serial_number}</p>
                    </div>
                    
                    {maintenanceDue && (
                      <div className="flex items-center gap-2 p-2 bg-yellow-50 rounded-lg border border-yellow-200">
                        <Clock className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm text-yellow-800 font-medium">
                          Maintenance due soon
                        </span>
                      </div>
                    )}
                    
                    <div className="flex gap-2 pt-2">
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to={`/devices/${device._id}`}>
                          <Eye className="w-4 h-4 mr-1" />
                          View
                        </Link>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1">
                        <Link to={`/devices/${device._id}/edit`}>
                          <Edit className="w-4 h-4 mr-1" />
                          Edit
                        </Link>
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => device._id && handleDeleteDevice(device._id)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}