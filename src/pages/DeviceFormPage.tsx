import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService } from '@/services/database';
import { useAuthStore } from '@/store/auth-store';
import { ArrowLeft, Save, Activity } from 'lucide-react';

interface DeviceFormData {
  name: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  device_type: string;
  location: string;
  status: 'active' | 'maintenance' | 'inactive' | 'critical';
  purchase_date: string;
  warranty_expiry: string;
  last_maintenance: string;
  next_maintenance: string;
  notes: string;
}

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

const statusOptions = [
  { value: 'active', label: 'Active' },
  { value: 'maintenance', label: 'Under Maintenance' },
  { value: 'inactive', label: 'Inactive' },
  { value: 'critical', label: 'Critical Issue' }
];

export default function DeviceFormPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuthStore();
  const isEditing = id !== 'new' && id !== undefined;

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<DeviceFormData>({
    name: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    device_type: '',
    location: '',
    status: 'active',
    purchase_date: '',
    warranty_expiry: '',
    last_maintenance: '',
    next_maintenance: '',
    notes: ''
  });

  useEffect(() => {
    if (isEditing && id && id !== 'new') {
      setLoading(true);
      loadDevice(id);
    }
  }, [id, isEditing]);

  const loadDevice = async (deviceId: string) => {
    try {
      const device = await DatabaseService.getDeviceById(deviceId);
      
      if (device) {
        setFormData({
          name: `${device.manufacturer} ${device.model}`,
          manufacturer: device.manufacturer || '',
          model: device.model || '',
          serial_number: device.serial_number || '',
          device_type: device.device_type || '',
          location: device.location || '',
          status: device.status === 'Operational' ? 'active' : 
                  device.status === 'Maintenance_Required' ? 'maintenance' :
                  device.status === 'Under_Maintenance' ? 'maintenance' : 'inactive',
          purchase_date: '',
          warranty_expiry: '',
          last_maintenance: device.last_maintenance || '',
          next_maintenance: device.next_maintenance || '',
          notes: ''
        });
      } else {
        toast({
          title: "Error",
          description: "Device not found",
          variant: "destructive"
        });
        navigate('/devices');
      }
    } catch (error) {
      console.error('Error loading device:', error);
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

  const handleInputChange = (field: keyof DeviceFormData, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    const required = ['name', 'manufacturer', 'model', 'serial_number', 'device_type', 'location'];
    const missing = required.filter(field => !formData[field as keyof DeviceFormData]);
    
    if (missing.length > 0) {
      toast({
        title: "Validation Error",
        description: `Please fill in all required fields: ${missing.join(', ')}`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      setSaving(true);
      
      const deviceData = {
        ...formData,
        updated_by: user?.email || 'system'
      };

      const mappedData = {
        manufacturer: formData.manufacturer,
        model: formData.model,
        serial_number: formData.serial_number,
        device_type: formData.device_type as any,
        location: formData.location,
        status: formData.status === 'active' ? 'Operational' as const :
                formData.status === 'maintenance' ? 'Maintenance_Required' as const :
                formData.status === 'inactive' ? 'Out_of_Service' as const : 'Operational' as const,
        last_maintenance: formData.last_maintenance,
        next_maintenance: formData.next_maintenance
      };

      if (isEditing && id) {
        await DatabaseService.updateDevice(id, user?.uid || '', mappedData);
      } else {
        await DatabaseService.createDevice(mappedData);
      }

      toast({
        title: "Success",
        description: `Device ${isEditing ? 'updated' : 'created'} successfully`
      });
      navigate('/devices');
    } catch (error) {
      console.error('Error saving device:', error);
      toast({
        title: "Error",
        description: `Failed to ${isEditing ? 'update' : 'create'} device`,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Button variant="outline" onClick={() => navigate('/devices')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Devices
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {isEditing ? 'Edit Device' : 'Add New Device'}
          </h1>
          <p className="text-muted-foreground">
            {isEditing ? 'Update device information' : 'Register a new device in the system'}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-4xl">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Basic Information */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>
                Essential device identification details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Device Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="e.g., OCT Scanner Room 1"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="manufacturer">Manufacturer *</Label>
                  <Input
                    id="manufacturer"
                    value={formData.manufacturer}
                    onChange={(e) => handleInputChange('manufacturer', e.target.value)}
                    placeholder="e.g., Zeiss, Topcon"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="model">Model *</Label>
                  <Input
                    id="model"
                    value={formData.model}
                    onChange={(e) => handleInputChange('model', e.target.value)}
                    placeholder="e.g., Cirrus HD-OCT"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="serial_number">Serial Number *</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => handleInputChange('serial_number', e.target.value)}
                  placeholder="Device serial number"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="device_type">Device Type *</Label>
                  <Select value={formData.device_type} onValueChange={(value) => handleInputChange('device_type', value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select device type" />
                    </SelectTrigger>
                    <SelectContent>
                      {deviceTypes.map(type => (
                        <SelectItem key={type} value={type}>{type}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    placeholder="e.g., Room 101, Lab A"
                    required
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value as any)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dates & Maintenance */}
          <Card className="border-0 shadow-md">
            <CardHeader>
              <CardTitle>Dates & Maintenance</CardTitle>
              <CardDescription>
                Important dates and maintenance schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchase_date">Purchase Date</Label>
                  <Input
                    id="purchase_date"
                    type="date"
                    value={formData.purchase_date}
                    onChange={(e) => handleInputChange('purchase_date', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
                  <Input
                    id="warranty_expiry"
                    type="date"
                    value={formData.warranty_expiry}
                    onChange={(e) => handleInputChange('warranty_expiry', e.target.value)}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="last_maintenance">Last Maintenance</Label>
                  <Input
                    id="last_maintenance"
                    type="date"
                    value={formData.last_maintenance}
                    onChange={(e) => handleInputChange('last_maintenance', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="next_maintenance">Next Maintenance</Label>
                  <Input
                    id="next_maintenance"
                    type="date"
                    value={formData.next_maintenance}
                    onChange={(e) => handleInputChange('next_maintenance', e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Additional notes about the device..."
                  rows={6}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Actions */}
        <div className="flex gap-4 mt-8">
          <Button 
            type="submit" 
            disabled={saving}
            className="px-8"
          >
            {saving && <Activity className="w-4 h-4 mr-2 animate-spin" />}
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? 'Update Device' : 'Create Device'}
          </Button>
          
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate('/devices')}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}