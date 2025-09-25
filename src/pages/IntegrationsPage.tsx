import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings, 
  Wifi, 
  WifiOff, 
  AlertCircle, 
  CheckCircle, 
  RefreshCw, 
  Plus,
  Activity,
  Clock,
  Database,
  Zap
} from 'lucide-react';
import {
  ManufacturerIntegrationService,
  ManufacturerIntegration,
  ManufacturerDevice
} from '@/services/manufacturer-integrations';

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<ManufacturerIntegration[]>([]);
  const [selectedDevices, setSelectedDevices] = useState<ManufacturerDevice[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState<Record<string, boolean>>({});
  const [testingConnection, setTestingConnection] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  useEffect(() => {
    loadIntegrations();
  }, []);

  const loadIntegrations = async () => {
    try {
      setLoading(true);
      const data = await ManufacturerIntegrationService.getIntegrations();
      setIntegrations(data);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load manufacturer integrations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSync = async (manufacturerId: string) => {
    try {
      setSyncing(prev => ({ ...prev, [manufacturerId]: true }));
      const result = await ManufacturerIntegrationService.syncManufacturerData(manufacturerId);
      
      if (result.success) {
        toast({
          title: "Sync Successful",
          description: `Synced ${result.syncedDevices} devices from manufacturer`
        });
        await loadIntegrations();
      } else {
        toast({
          title: "Sync Failed",
          description: result.errors.join(', '),
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to sync manufacturer data",
        variant: "destructive"
      });
    } finally {
      setSyncing(prev => ({ ...prev, [manufacturerId]: false }));
    }
  };

  const handleTestConnection = async (manufacturerId: string) => {
    try {
      setTestingConnection(prev => ({ ...prev, [manufacturerId]: true }));
      const result = await ManufacturerIntegrationService.testConnection(manufacturerId);
      
      if (result.success) {
        toast({
          title: "Connection Test Successful",
          description: `Connected in ${result.latency}ms`
        });
        await loadIntegrations();
      } else {
        toast({
          title: "Connection Test Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to test connection",
        variant: "destructive"
      });
    } finally {
      setTestingConnection(prev => ({ ...prev, [manufacturerId]: false }));
    }
  };

  const loadDevices = async (manufacturerId: string) => {
    try {
      const devices = await ManufacturerIntegrationService.getDevicesByManufacturer(manufacturerId);
      setSelectedDevices(devices);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load manufacturer devices",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'bg-green-500 hover:bg-green-600';
      case 'disconnected': return 'bg-gray-500 hover:bg-gray-600';
      case 'error': return 'bg-red-500 hover:bg-red-600';
      default: return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-4 w-4" />;
      case 'disconnected': return <WifiOff className="h-4 w-4" />;
      case 'error': return <AlertCircle className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const formatLastSync = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
    return `${Math.floor(diffMinutes / 1440)}d ago`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Manufacturer Integrations</h1>
            <p className="text-muted-foreground">Connect and sync with medical device manufacturer APIs</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manufacturer Integrations</h1>
          <p className="text-muted-foreground">Connect and sync with medical device manufacturer APIs</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Integration
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Integration</DialogTitle>
              <DialogDescription>
                Configure a new manufacturer API integration
              </DialogDescription>
            </DialogHeader>
            <IntegrationForm />
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="devices">Device Data</TabsTrigger>
          <TabsTrigger value="sync-logs">Sync Logs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Integrations</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{integrations.length}</div>
                <p className="text-xs text-muted-foreground">
                  {integrations.filter(i => i.status === 'connected').length} active
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Connected Devices</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {integrations.reduce((sum, i) => sum + i.deviceCount, 0)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all manufacturers
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Last Sync</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {Math.min(...integrations.map(i => 
                    Math.floor((Date.now() - new Date(i.lastSync).getTime()) / (1000 * 60))
                  ))}m
                </div>
                <p className="text-xs text-muted-foreground">
                  Most recent sync
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Sync Status</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {integrations.filter(i => i.status === 'connected').length}/
                  {integrations.length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Online integrations
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {integrations.map((integration) => (
              <Card key={integration.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{integration.name}</CardTitle>
                    <Badge className={getStatusColor(integration.status)}>
                      {getStatusIcon(integration.status)}
                      <span className="ml-1 capitalize">{integration.status}</span>
                    </Badge>
                  </div>
                  <CardDescription>
                    API v{integration.apiVersion} • {integration.deviceCount} devices
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Last sync:</span>
                    <span>{formatLastSync(integration.lastSync)}</span>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleTestConnection(integration.id)}
                      disabled={testingConnection[integration.id]}
                    >
                      {testingConnection[integration.id] ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <Wifi className="h-3 w-3 mr-1" />
                      )}
                      Test
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => handleSync(integration.id)}
                      disabled={syncing[integration.id] || integration.status !== 'connected'}
                    >
                      {syncing[integration.id] ? (
                        <RefreshCw className="h-3 w-3 mr-1 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3 mr-1" />
                      )}
                      Sync
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadDevices(integration.id)}
                    >
                      <Settings className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          {selectedDevices.length > 0 ? (
            <div className="grid gap-4">
              {selectedDevices.map((device) => (
                <Card key={device.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle>{device.model}</CardTitle>
                        <CardDescription>S/N: {device.serialNumber}</CardDescription>
                      </div>
                      <Badge className={getStatusColor(device.status)}>
                        {device.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Firmware:</span>
                        <span>{device.firmwareVersion || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Warranty:</span>
                        <span>{device.warrantyStatus || 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Last Sync:</span>
                        <span>{formatLastSync(device.lastSync)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Device Data Selected</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Select a manufacturer integration to view device data
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="sync-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>Recent synchronization activities</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {integrations.map((integration) => (
                  <div key={integration.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      {getStatusIcon(integration.status)}
                      <div>
                        <p className="font-medium">{integration.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {integration.deviceCount} devices synchronized
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium">{formatLastSync(integration.lastSync)}</p>
                      <p className="text-xs text-muted-foreground">Last sync</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function IntegrationForm() {
  const [manufacturer, setManufacturer] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [endpoint, setEndpoint] = useState('');
  const [configuring, setConfiguring] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!manufacturer || !apiKey || !apiSecret) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setConfiguring(true);
      const result = await ManufacturerIntegrationService.configureIntegration({
        manufacturerId: manufacturer.toLowerCase().replace(/\s+/g, '_'),
        apiKey,
        apiSecret,
        endpoint
      });

      if (result.success) {
        toast({
          title: "Integration Added",
          description: result.message
        });
        // Reset form
        setManufacturer('');
        setApiKey('');
        setApiSecret('');
        setEndpoint('');
      } else {
        toast({
          title: "Configuration Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to configure integration",
        variant: "destructive"
      });
    } finally {
      setConfiguring(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="manufacturer">Manufacturer</Label>
        <Select value={manufacturer} onValueChange={setManufacturer}>
          <SelectTrigger>
            <SelectValue placeholder="Select manufacturer" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ZEISS Medical Technology">ZEISS Medical Technology</SelectItem>
            <SelectItem value="Topcon Healthcare">Topcon Healthcare</SelectItem>
            <SelectItem value="Haag-Streit Diagnostics">Haag-Streit Diagnostics</SelectItem>
            <SelectItem value="Nidek Technologies">Nidek Technologies</SelectItem>
            <SelectItem value="Canon Medical">Canon Medical</SelectItem>
            <SelectItem value="Heidelberg Engineering">Heidelberg Engineering</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiKey">API Key</Label>
        <Input
          id="apiKey"
          type="password"
          value={apiKey}
          onChange={(e) => setApiKey(e.target.value)}
          placeholder="Enter API key"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="apiSecret">API Secret</Label>
        <Input
          id="apiSecret"
          type="password"
          value={apiSecret}
          onChange={(e) => setApiSecret(e.target.value)}
          placeholder="Enter API secret"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="endpoint">API Endpoint (Optional)</Label>
        <Input
          id="endpoint"
          value={endpoint}
          onChange={(e) => setEndpoint(e.target.value)}
          placeholder="https://api.manufacturer.com/v1"
        />
      </div>

      <Button type="submit" className="w-full" disabled={configuring}>
        {configuring ? (
          <>
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            Configuring...
          </>
        ) : (
          'Add Integration'
        )}
      </Button>
    </form>
  );
}