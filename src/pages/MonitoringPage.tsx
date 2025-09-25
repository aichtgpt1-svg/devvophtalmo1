import React, { useState, useEffect, useMemo } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { DatabaseService, Device } from '@/services/database';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import {
  Activity,
  AlertTriangle,
  CheckCircle,
  Clock,
  Cpu,
  Eye,
  Gauge,
  Heart,
  Monitor,
  RefreshCw,
  Settings,
  Thermometer,
  TrendingDown,
  TrendingUp,
  Wifi,
  WifiOff
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { format, subHours, subMinutes } from 'date-fns';

interface DeviceMetrics {
  deviceId: string;
  deviceName: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastPing: string;
  uptime: number; // percentage
  cpuUsage: number;
  memoryUsage: number;
  temperature: number;
  networkLatency: number;
  errorCount: number;
  performanceScore: number;
  alerts: Alert[];
  powerStatus: 'normal' | 'low' | 'critical';
  calibrationStatus: 'valid' | 'expired' | 'required';
}

interface Alert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

interface SystemHealth {
  overall: number;
  network: number;
  storage: number;
  performance: number;
  security: number;
}

export default function MonitoringPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [devices, setDevices] = useState<Device[]>([]);
  const [deviceMetrics, setDeviceMetrics] = useState<DeviceMetrics[]>([]);
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    overall: 92,
    network: 95,
    storage: 87,
    performance: 94,
    security: 96
  });
  const [loading, setLoading] = useState(true);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    loadMonitoringData();
    
    if (autoRefresh) {
      const interval = setInterval(loadMonitoringData, 30000); // 30 seconds
      return () => clearInterval(interval);
    }
  }, [autoRefresh]);

  const loadMonitoringData = async () => {
    if (!user) return;
    
    try {
      const devicesResponse = await DatabaseService.getDevices();
      const devicesData = Array.isArray(devicesResponse) ? devicesResponse : devicesResponse.items || [];
      setDevices(devicesData);

      // Generate realistic monitoring data
      const metrics: DeviceMetrics[] = devicesData.map((device: any, index: number) => ({
        deviceId: device._id || '',
        deviceName: device.name || 'Unknown Device',
        status: ['online', 'online', 'online', 'maintenance', 'error'][Math.floor(Math.random() * 5)] as any,
        lastPing: new Date(Date.now() - Math.random() * 60000).toISOString(),
        uptime: 95 + Math.random() * 5,
        cpuUsage: 20 + Math.random() * 60,
        memoryUsage: 30 + Math.random() * 50,
        temperature: 20 + Math.random() * 15,
        networkLatency: Math.random() * 50,
        errorCount: Math.floor(Math.random() * 3),
        performanceScore: 85 + Math.random() * 15,
        powerStatus: ['normal', 'normal', 'normal', 'low'][Math.floor(Math.random() * 4)] as any,
        calibrationStatus: ['valid', 'valid', 'expired'][Math.floor(Math.random() * 3)] as any,
        alerts: generateAlerts(device._id || '', Math.floor(Math.random() * 3))
      }));

      setDeviceMetrics(metrics);
    } catch (error) {
      console.error('Error loading monitoring data:', error);
      toast({
        title: "Error",
        description: "Failed to load monitoring data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const generateAlerts = (deviceId: string, count: number): Alert[] => {
    const alertMessages = [
      'High temperature detected',
      'Memory usage above threshold',
      'Network connectivity issues',
      'Calibration required',
      'Performance degradation detected',
      'Power supply voltage low'
    ];

    return Array.from({ length: count }, (_, index) => ({
      id: `alert-${deviceId}-${index}`,
      severity: ['low', 'medium', 'high', 'critical'][Math.floor(Math.random() * 4)] as any,
      message: alertMessages[Math.floor(Math.random() * alertMessages.length)],
      timestamp: new Date(Date.now() - Math.random() * 3600000).toISOString(),
      acknowledged: Math.random() > 0.5
    }));
  };

  const performanceData = useMemo(() => {
    const data = [];
    for (let i = 23; i >= 0; i--) {
      const hour = subHours(new Date(), i);
      data.push({
        time: format(hour, 'HH:mm'),
        performance: 85 + Math.random() * 15,
        uptime: 90 + Math.random() * 10,
        errors: Math.floor(Math.random() * 5)
      });
    }
    return data;
  }, []);

  const statusDistribution = useMemo(() => {
    const distribution = deviceMetrics.reduce((acc, device) => {
      acc[device.status] = (acc[device.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return [
      { name: 'Online', value: distribution.online || 0, color: '#16a34a' },
      { name: 'Maintenance', value: distribution.maintenance || 0, color: '#d97706' },
      { name: 'Error', value: distribution.error || 0, color: '#dc2626' },
      { name: 'Offline', value: distribution.offline || 0, color: '#6b7280' }
    ];
  }, [deviceMetrics]);

  const criticalAlerts = useMemo(() => {
    return deviceMetrics
      .flatMap(device => device.alerts.filter(alert => alert.severity === 'critical' && !alert.acknowledged))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5);
  }, [deviceMetrics]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'maintenance': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      case 'offline': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'maintenance': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case 'offline': return <WifiOff className="h-4 w-4 text-gray-500" />;
      default: return <Monitor className="h-4 w-4 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading monitoring data...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Real-time Monitoring</h1>
          <p className="text-gray-600 mt-1">Live device performance tracking and system health monitoring</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant={autoRefresh ? "default" : "secondary"} className="flex items-center space-x-2">
            <Activity className="h-4 w-4" />
            <span>{autoRefresh ? 'Live' : 'Paused'}</span>
          </Badge>
          <Button
            variant="outline"
            onClick={() => setAutoRefresh(!autoRefresh)}
          >
            {autoRefresh ? 'Pause' : 'Resume'}
          </Button>
          <Button onClick={loadMonitoringData} disabled={loading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Critical Alerts */}
      {criticalAlerts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Critical Alerts:</strong> {criticalAlerts.length} device{criticalAlerts.length === 1 ? '' : 's'} require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      {/* System Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overall Health</p>
                <p className="text-2xl font-bold">{systemHealth.overall}%</p>
              </div>
              <Heart className="h-8 w-8 text-red-500" />
            </div>
            <Progress value={systemHealth.overall} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Network</p>
                <p className="text-2xl font-bold">{systemHealth.network}%</p>
              </div>
              <Wifi className="h-8 w-8 text-blue-500" />
            </div>
            <Progress value={systemHealth.network} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Performance</p>
                <p className="text-2xl font-bold">{systemHealth.performance}%</p>
              </div>
              <Gauge className="h-8 w-8 text-green-500" />
            </div>
            <Progress value={systemHealth.performance} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Storage</p>
                <p className="text-2xl font-bold">{systemHealth.storage}%</p>
              </div>
              <Monitor className="h-8 w-8 text-purple-500" />
            </div>
            <Progress value={systemHealth.storage} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Security</p>
                <p className="text-2xl font-bold">{systemHealth.security}%</p>
              </div>
              <Eye className="h-8 w-8 text-orange-500" />
            </div>
            <Progress value={systemHealth.security} className="mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Performance Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>System Performance (24h)</CardTitle>
            <CardDescription>Performance metrics over the last 24 hours</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="performance" stroke="#2563eb" strokeWidth={2} />
                <Line type="monotone" dataKey="uptime" stroke="#16a34a" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Device Status Distribution</CardTitle>
            <CardDescription>Current status of all monitored devices</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={statusDistribution}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {statusDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Device Monitoring Grid */}
      <Card>
        <CardHeader>
          <CardTitle>Device Monitoring Dashboard</CardTitle>
          <CardDescription>Real-time status and metrics for all devices</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            {deviceMetrics.map((device) => (
              <Card key={device.deviceId} className="relative">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold truncate">{device.deviceName}</h4>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(device.status)}
                      <Badge variant="outline" className={getStatusColor(device.status)}>
                        {device.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Performance Score */}
                    <div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Performance</span>
                        <span className="font-medium">{device.performanceScore.toFixed(1)}%</span>
                      </div>
                      <Progress value={device.performanceScore} className="mt-1" />
                    </div>

                    {/* System Metrics */}
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center space-x-2">
                        <Cpu className="h-4 w-4 text-blue-500" />
                        <span className="text-gray-600">CPU:</span>
                        <span className="font-medium">{device.cpuUsage.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Monitor className="h-4 w-4 text-green-500" />
                        <span className="text-gray-600">Memory:</span>
                        <span className="font-medium">{device.memoryUsage.toFixed(1)}%</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Thermometer className="h-4 w-4 text-orange-500" />
                        <span className="text-gray-600">Temp:</span>
                        <span className="font-medium">{device.temperature.toFixed(1)}°C</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Wifi className="h-4 w-4 text-purple-500" />
                        <span className="text-gray-600">Latency:</span>
                        <span className="font-medium">{device.networkLatency.toFixed(0)}ms</span>
                      </div>
                    </div>

                    {/* Status Indicators */}
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-1">
                        <div className={`w-2 h-2 rounded-full ${
                          device.uptime > 95 ? 'bg-green-500' : 
                          device.uptime > 90 ? 'bg-yellow-500' : 'bg-red-500'
                        }`} />
                        <span className="text-gray-600">Uptime: {device.uptime.toFixed(1)}%</span>
                      </div>
                      <span className="text-gray-500">
                        {format(new Date(device.lastPing), 'HH:mm:ss')}
                      </span>
                    </div>

                    {/* Alerts */}
                    {device.alerts.length > 0 && (
                      <div className="border-t pt-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-gray-700">Active Alerts</span>
                          <Badge variant="destructive" className="text-xs">
                            {device.alerts.filter(a => !a.acknowledged).length}
                          </Badge>
                        </div>
                        <div className="mt-1 space-y-1">
                          {device.alerts.slice(0, 2).map((alert) => (
                            <div key={alert.id} className="text-xs p-2 bg-red-50 rounded border-l-2 border-red-500">
                              <span className="font-medium">{alert.severity.toUpperCase()}:</span> {alert.message}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts Detail */}
      {criticalAlerts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span>Critical Alerts</span>
            </CardTitle>
            <CardDescription>Alerts requiring immediate attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {criticalAlerts.map((alert) => (
                <div key={alert.id} className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded">
                  <div>
                    <p className="font-medium text-red-800">{alert.message}</p>
                    <p className="text-sm text-red-600">
                      {format(new Date(alert.timestamp), 'MMM dd, HH:mm:ss')}
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Acknowledge
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}