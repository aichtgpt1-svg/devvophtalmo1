import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Building2,
  Hospital,
  MapPin,
  Phone,
  Mail,
  Users,
  Activity,
  Plus,
  Edit,
  Eye,
  ArrowLeftRight,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Globe,
  Shield,
  Calendar
} from 'lucide-react';
import {
  facilityManagementService,
  type HealthcareNetwork,
  type HealthcareFacility,
  type NetworkDashboardMetrics
} from '@/services/facility-management';

const FACILITY_TYPES = [
  { id: 'hospital', name: 'Hospital', icon: Hospital },
  { id: 'clinic', name: 'Clinic', icon: Building2 },
  { id: 'surgery_center', name: 'Surgery Center', icon: Activity },
  { id: 'imaging_center', name: 'Imaging Center', icon: Eye },
  { id: 'specialist_office', name: 'Specialist Office', icon: Users }
];

const NETWORK_TYPES = [
  { id: 'hospital_system', name: 'Hospital System' },
  { id: 'clinic_network', name: 'Clinic Network' },
  { id: 'franchise', name: 'Franchise' },
  { id: 'management_company', name: 'Management Company' }
];

export default function FacilityManagementPage() {
  const [activeTab, setActiveTab] = useState('overview');
  const [networks, setNetworks] = useState<HealthcareNetwork[]>([]);
  const [facilities, setFacilities] = useState<HealthcareFacility[]>([]);
  const [selectedNetwork, setSelectedNetwork] = useState<HealthcareNetwork | null>(null);
  const [metrics, setMetrics] = useState<NetworkDashboardMetrics | null>(null);
  const [showNetworkDialog, setShowNetworkDialog] = useState(false);
  const [showFacilityDialog, setShowFacilityDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Initialize sample data if none exists
      await facilityManagementService.initializeSampleData();
      
      const networksData = await facilityManagementService.getNetworks();
      const facilitiesData = await facilityManagementService.getFacilities();
      
      setNetworks(networksData);
      setFacilities(facilitiesData);
      
      if (networksData.length > 0 && !selectedNetwork) {
        setSelectedNetwork(networksData[0]);
        const metricsData = await facilityManagementService.getNetworkDashboardMetrics(networksData[0].id);
        setMetrics(metricsData);
      }
    } catch (error) {
      console.error('Failed to load facility data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNetworkSelect = async (network: HealthcareNetwork) => {
    setSelectedNetwork(network);
    const metricsData = await facilityManagementService.getNetworkDashboardMetrics(network.id);
    setMetrics(metricsData);
  };

  const getFacilityIcon = (type: string) => {
    const facilityType = FACILITY_TYPES.find(ft => ft.id === type);
    return facilityType ? facilityType.icon : Building2;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'inactive': return 'bg-gray-100 text-gray-800';
      case 'maintenance': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (level: string) => {
    switch (level) {
      case 'excellent': return 'bg-green-100 text-green-800';
      case 'good': return 'bg-blue-100 text-blue-800';
      case 'needs_improvement': return 'bg-yellow-100 text-yellow-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Activity className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading facility data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Multi-Facility Management</h1>
            <p className="text-gray-600">Manage healthcare networks and facilities from a unified dashboard</p>
          </div>
          <div className="flex items-center gap-2">
            <Select
              value={selectedNetwork?.id || ''}
              onValueChange={(value) => {
                const network = networks.find(n => n.id === value);
                if (network) handleNetworkSelect(network);
              }}
            >
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent>
                {networks.map(network => (
                  <SelectItem key={network.id} value={network.id}>
                    {network.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowNetworkDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Network
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-fit grid-cols-4">
            <TabsTrigger value="overview">Network Overview</TabsTrigger>
            <TabsTrigger value="facilities">Facilities</TabsTrigger>
            <TabsTrigger value="transfers">Device Transfers</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="overview" className="h-full m-0 p-6">
            {selectedNetwork && metrics ? (
              <div className="space-y-6">
                {/* Network Summary */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Globe className="w-5 h-5 text-blue-600" />
                      {selectedNetwork.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{metrics.totalFacilities}</div>
                        <div className="text-sm text-gray-600">Total Facilities</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{metrics.activeFacilities}</div>
                        <div className="text-sm text-gray-600">Active Facilities</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{metrics.totalDevices}</div>
                        <div className="text-sm text-gray-600">Total Devices</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">{metrics.complianceScore}%</div>
                        <div className="text-sm text-gray-600">Compliance Score</div>
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-medium mb-3">Facilities by Type</h4>
                        <div className="space-y-2">
                          {Object.entries(metrics.facilitiesByType).map(([type, count]) => (
                            <div key={type} className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                {React.createElement(getFacilityIcon(type), { className: "w-4 h-4" })}
                                <span className="text-sm capitalize">{type.replace('_', ' ')}</span>
                              </div>
                              <Badge variant="outline">{count}</Badge>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="font-medium mb-3">Network Details</h4>
                        <div className="space-y-2 text-sm">
                          <div className="flex items-center gap-2">
                            <Badge className={getComplianceColor(selectedNetwork.complianceLevel)}>
                              {selectedNetwork.complianceLevel.replace('_', ' ')}
                            </Badge>
                            <span>Compliance Level</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-gray-500" />
                            <span>{selectedNetwork.headquarters.address.city}, {selectedNetwork.headquarters.address.state}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Mail className="w-4 h-4 text-gray-500" />
                            <span>{selectedNetwork.headquarters.contact.email}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-red-100 rounded-lg">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="font-medium">{metrics.devicesNeedingMaintenance} Devices</div>
                        <div className="text-sm text-gray-600">Need Maintenance</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-100 rounded-lg">
                        <Clock className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <div className="font-medium">{metrics.activeServiceRequests} Active</div>
                        <div className="text-sm text-gray-600">Service Requests</div>
                      </div>
                    </div>
                  </Card>

                  <Card className="p-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-100 rounded-lg">
                        <TrendingUp className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <div className="font-medium">{metrics.complianceScore}%</div>
                        <div className="text-sm text-gray-600">Compliance Score</div>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Network Selected</h3>
                  <p className="text-gray-500">Select a healthcare network to view overview</p>
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="facilities" className="h-full m-0 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Healthcare Facilities</h2>
              <Button onClick={() => setShowFacilityDialog(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Facility
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {facilities
                .filter(f => !selectedNetwork || f.networkId === selectedNetwork.id)
                .map(facility => (
                <Card key={facility.id} className="group hover:shadow-md transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {React.createElement(getFacilityIcon(facility.type), {
                          className: "w-5 h-5 text-gray-500"
                        })}
                        <CardTitle className="text-base">{facility.name}</CardTitle>
                      </div>
                      <Badge className={getStatusColor(facility.status)}>
                        {facility.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600 capitalize">
                      {facility.type.replace('_', ' ')}
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4 text-gray-500" />
                        <span>{facility.address.city}, {facility.address.state}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-gray-500" />
                        <span>{facility.contact.phone}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-gray-500" />
                        <span>{facility.staffCount} staff</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="w-4 h-4 text-gray-500" />
                        <span>{facility.deviceCount} devices</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1">
                      {facility.certifications.slice(0, 2).map(cert => (
                        <Badge key={cert} variant="outline" className="text-xs">
                          {cert}
                        </Badge>
                      ))}
                      {facility.certifications.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{facility.certifications.length - 2}
                        </Badge>
                      )}
                    </div>

                    <div className="mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <ArrowLeftRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="transfers" className="h-full m-0 p-6">
            <div className="text-center py-12">
              <ArrowLeftRight className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Device Transfer Management</h3>
              <p className="text-gray-500 mb-4">
                Track and manage device transfers between facilities
              </p>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Initiate Transfer
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="h-full m-0 p-6">
            <div className="text-center py-12">
              <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Cross-Facility Analytics</h3>
              <p className="text-gray-500 mb-4">
                Compare performance metrics across all network facilities
              </p>
              <Button>
                <BarChart3 className="w-4 h-4 mr-2" />
                Generate Report
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Add Network Dialog - Placeholder */}
      <Dialog open={showNetworkDialog} onOpenChange={setShowNetworkDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Healthcare Network</DialogTitle>
            <DialogDescription>
              Create a new healthcare network to manage multiple facilities
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">Network creation form will be available in the next update</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNetworkDialog(false)}>
              Cancel
            </Button>
            <Button disabled>Create Network</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Facility Dialog - Placeholder */}
      <Dialog open={showFacilityDialog} onOpenChange={setShowFacilityDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Healthcare Facility</DialogTitle>
            <DialogDescription>
              Add a new facility to the selected network
            </DialogDescription>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-gray-500">Facility creation form will be available in the next update</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFacilityDialog(false)}>
              Cancel
            </Button>
            <Button disabled>Add Facility</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}