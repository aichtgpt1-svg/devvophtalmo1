import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { DatabaseService } from '@/services/database';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import EmailDemo from '@/components/EmailDemo';
import { 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  Eye, 
  Settings, 
  Wrench,
  Users,
  BarChart3,
  Mail,
  Plus,
  Search
} from 'lucide-react';

interface DashboardStats {
  total: number;
  active: number;
  maintenance: number;
  inactive: number;
  critical: number;
}

interface DashboardDevice {
  _id: string;
  name: string;
  manufacturer: string;
  model: string;
  location: string;
  status: 'active' | 'maintenance' | 'inactive' | 'critical';
}

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const { toast } = useToast();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentDevices, setRecentDevices] = useState<DashboardDevice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      
      // Load device statistics
      const deviceStats = await DatabaseService.getDevicesByMaintenanceStatus();
      setStats({
        total: deviceStats.operational + deviceStats.maintenanceRequired + deviceStats.underMaintenance + deviceStats.outOfService,
        active: deviceStats.operational,
        maintenance: deviceStats.maintenanceRequired + deviceStats.underMaintenance,
        inactive: deviceStats.outOfService,
        critical: deviceStats.maintenanceRequired
      });

      // Load recent devices
      const devicesResult = await DatabaseService.getDevices({ limit: 5 });
      const mappedDevices = devicesResult.items.map(device => ({
        _id: device._id || '',
        name: `${device.manufacturer} ${device.model}`,
        manufacturer: device.manufacturer,
        model: device.model,
        location: device.location,
        status: device.status === 'Operational' ? 'active' as const :
                device.status === 'Maintenance_Required' ? 'critical' as const :
                device.status === 'Under_Maintenance' ? 'maintenance' as const : 
                'inactive' as const
      }));
      setRecentDevices(mappedDevices);
      
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast({
        title: 'Failed to load dashboard',
        description: 'No devices found. Add some devices to get started.',
        variant: 'default'
      });
      // Set default empty stats
      setStats({
        total: 0,
        active: 0,
        maintenance: 0,
        inactive: 0,
        critical: 0
      });
      setRecentDevices([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast({
        title: 'Logged out successfully',
        description: 'See you next time!'
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'Please try again',
        variant: 'destructive'
      });
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'active': 'bg-green-100 text-green-800',
      'maintenance': 'bg-yellow-100 text-yellow-800',
      'inactive': 'bg-gray-100 text-gray-800',
      'critical': 'bg-red-100 text-red-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-accent/20">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
                <Eye className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-primary">OphthalmoTech</h1>
                <p className="text-sm text-muted-foreground">Device Management Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium">{user?.name || user?.email}</p>
                <p className="text-xs text-muted-foreground">Medical Staff</p>
              </div>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Operational Devices</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats?.active || 0}</div>
              <p className="text-xs text-muted-foreground">Running normally</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Under Maintenance</CardTitle>
              <Clock className="h-4 w-4 text-yellow-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats?.maintenance || 0}</div>
              <p className="text-xs text-muted-foreground">Being serviced</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Inactive Devices</CardTitle>
              <Wrench className="h-4 w-4 text-gray-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats?.inactive || 0}</div>
              <p className="text-xs text-muted-foreground">Not in use</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats?.critical || 0}</div>
              <p className="text-xs text-muted-foreground">Immediate attention</p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="requests">Service Requests</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Devices */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Activity className="h-5 w-5" />
                    <span>Recent Devices</span>
                  </CardTitle>
                  <CardDescription>Latest device entries in the system</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentDevices.length > 0 ? (
                      recentDevices.map((device) => (
                        <div key={device._id} className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                          <div>
                            <p className="font-medium">{device.manufacturer} {device.model}</p>
                            <p className="text-sm text-muted-foreground">{device.manufacturer} {device.model} • {device.location || 'Location not set'}</p>
                          </div>
                          <Badge className={getStatusColor(device.status)}>
                            {device.status}
                          </Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-center text-muted-foreground py-4">No devices found</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Quick Actions</span>
                  </CardTitle>
                  <CardDescription>Common tasks and shortcuts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button asChild className="w-full">
                      <Link to="/devices/new">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Device
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/devices">
                        <Eye className="w-4 h-4 mr-2" />
                        View All Devices
                      </Link>
                    </Button>
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/maintenance">
                        <Wrench className="w-4 h-4 mr-2" />
                        Schedule Maintenance
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="devices" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Device Management</CardTitle>
                    <CardDescription>Manage your ophthalmology equipment inventory</CardDescription>
                  </div>
                  <Button asChild>
                    <Link to="/devices/new">
                      <Plus className="w-4 h-4 mr-2" />
                      Add Device
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2 mb-4">
                  <Search className="w-4 h-4 text-muted-foreground" />
                  <Input placeholder="Search devices..." className="max-w-sm" />
                </div>
                <div className="text-center py-8">
                  <Button asChild size="lg">
                    <Link to="/devices">
                      <Eye className="w-4 h-4 mr-2" />
                      Go to Device Management
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    Manage all your ophthalmology equipment in one place
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Maintenance Schedule</CardTitle>
                    <CardDescription>Track and manage device maintenance</CardDescription>
                  </div>
                  <Button asChild>
                    <Link to="/maintenance">
                      <Plus className="w-4 h-4 mr-2" />
                      Schedule Maintenance
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Button asChild size="lg">
                    <Link to="/maintenance">
                      <Wrench className="w-4 h-4 mr-2" />
                      Go to Maintenance Management
                    </Link>
                  </Button>
                  <p className="text-sm text-muted-foreground mt-4">
                    Schedule and track all device maintenance activities
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="requests" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Service Requests</CardTitle>
                    <CardDescription>Manage troubleshooting and service requests</CardDescription>
                  </div>
                  <Button asChild>
                    <Link to="/service-requests">
                      <Plus className="w-4 h-4 mr-2" />
                      New Request
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Button asChild size="lg">
                      <Link to="/service-requests">
                        <Settings className="w-4 h-4 mr-2" />
                        Manage Requests
                      </Link>
                    </Button>
                    <Button asChild variant="outline" size="lg">
                      <Link to="/service-analytics">
                        <BarChart3 className="w-4 h-4 mr-2" />
                        View Analytics
                      </Link>
                    </Button>
                  </div>
                  <p className="text-sm text-muted-foreground text-center">
                    Create and manage equipment service tickets or analyze performance trends
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Device Status Report</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive device status and utilization report
                  </p>
                  <Button variant="outline" className="w-full">
                    Generate Report
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Mail className="h-5 w-5" />
                    <span>Email Reports</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Automated daily and weekly maintenance reports
                  </p>
                  <Button variant="outline" className="w-full">
                    Configure Email
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>User Activity</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Track user actions and system usage
                  </p>
                  <Button variant="outline" className="w-full">
                    View Activity
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Service Analytics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-4">
                    Comprehensive service request performance metrics
                  </p>
                  <Button asChild variant="outline" className="w-full">
                    <Link to="/service-analytics">
                      View Analytics
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            
            {/* Email Service Demo */}
            <EmailDemo />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}