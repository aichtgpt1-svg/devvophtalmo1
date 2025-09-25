import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
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
  Bell,
  Mail,
  MessageSquare,
  Smartphone,
  Webhook,
  Slack,
  Phone,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Plus,
  Settings,
  Eye,
  Edit,
  TrendingUp,
  Users,
  Zap,
  Filter,
  Download
} from 'lucide-react';
import {
  notificationSystemService,
  type NotificationChannel,
  type NotificationTemplate,
  type NotificationRule,
  type NotificationLog,
  type NotificationDashboard
} from '@/services/notification-system';

const CHANNEL_ICONS = {
  email: Mail,
  sms: MessageSquare,
  push: Smartphone,
  in_app: Bell,
  webhook: Webhook,
  slack: Slack,
  teams: Users,
  phone: Phone
};

const STATUS_COLORS = {
  pending: 'bg-yellow-100 text-yellow-800',
  sent: 'bg-blue-100 text-blue-800',
  delivered: 'bg-green-100 text-green-800',
  failed: 'bg-red-100 text-red-800',
  acknowledged: 'bg-purple-100 text-purple-800'
};

const PRIORITY_COLORS = {
  low: 'bg-gray-100 text-gray-800',
  medium: 'bg-blue-100 text-blue-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800'
};

export default function NotificationManagementPage() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [dashboard, setDashboard] = useState<NotificationDashboard | null>(null);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [templates, setTemplates] = useState<NotificationTemplate[]>([]);
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [logs, setLogs] = useState<NotificationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [showTestDialog, setShowTestDialog] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string>('');
  const [testRecipient, setTestRecipient] = useState('');

  // Load data
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [dashboardData, channelsData, templatesData, rulesData, logsData] = await Promise.all([
        notificationSystemService.getDashboard(),
        notificationSystemService.getChannels(),
        notificationSystemService.getTemplates(),
        notificationSystemService.getRules(),
        notificationSystemService.getNotificationLogs()
      ]);

      setDashboard(dashboardData);
      setChannels(channelsData);
      setTemplates(templatesData);
      setRules(rulesData);
      setLogs(logsData);
    } catch (error) {
      console.error('Failed to load notification data:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleChannel = async (channelId: string, enabled: boolean) => {
    try {
      await notificationSystemService.updateChannel(channelId, { enabled });
      await loadData();
    } catch (error) {
      console.error('Failed to update channel:', error);
    }
  };

  const toggleRule = async (ruleId: string, enabled: boolean) => {
    try {
      await notificationSystemService.updateRule(ruleId, { enabled });
      await loadData();
    } catch (error) {
      console.error('Failed to update rule:', error);
    }
  };

  const sendTestNotification = async () => {
    if (!selectedChannel || !testRecipient) return;

    try {
      await notificationSystemService.sendNotification(
        'maintenance-due',
        [testRecipient],
        {
          deviceName: 'Test OCT Machine',
          facilityName: 'Test Clinic',
          maintenanceDate: new Date().toLocaleDateString(),
          priority: 'medium',
          technician: 'Test Technician'
        },
        'medium'
      );
      
      setShowTestDialog(false);
      setSelectedChannel('');
      setTestRecipient('');
      await loadData();
    } catch (error) {
      console.error('Failed to send test notification:', error);
    }
  };

  const acknowledgeNotification = async (logId: string) => {
    try {
      await notificationSystemService.acknowledgeNotification(logId, 'admin');
      await loadData();
    } catch (error) {
      console.error('Failed to acknowledge notification:', error);
    }
  };

  const getChannelIcon = (type: string) => {
    return CHANNEL_ICONS[type as keyof typeof CHANNEL_ICONS] || Bell;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Bell className="w-8 h-8 animate-pulse mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading notification system...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b bg-white p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Notification Management</h1>
            <p className="text-gray-600">Manage multi-channel notifications and alerts across your healthcare network</p>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-green-600 border-green-200">
              <Zap className="w-3 h-3 mr-1" />
              Real-time System
            </Badge>
            <Button onClick={() => setShowTestDialog(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Send Test
            </Button>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-fit grid-cols-5">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="channels">Channels</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
            <TabsTrigger value="rules">Rules</TabsTrigger>
            <TabsTrigger value="logs">Activity</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="dashboard" className="h-full m-0 p-6">
            {dashboard ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Key Metrics */}
                <div className="lg:col-span-2 space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <Bell className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{dashboard.totalSent}</div>
                          <div className="text-sm text-gray-600">Total Sent</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{dashboard.deliveryRate}%</div>
                          <div className="text-sm text-gray-600">Delivery Rate</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 rounded-lg">
                          <Eye className="w-5 h-5 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{dashboard.acknowledgedRate}%</div>
                          <div className="text-sm text-gray-600">Acknowledged</div>
                        </div>
                      </div>
                    </Card>

                    <Card className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <AlertTriangle className="w-5 h-5 text-red-600" />
                        </div>
                        <div>
                          <div className="font-semibold">{dashboard.escalatedAlerts}</div>
                          <div className="text-sm text-gray-600">Escalated</div>
                        </div>
                      </div>
                    </Card>
                  </div>

                  {/* Channel Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Channel Performance</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries(dashboard.channelStats).map(([channel, stats]) => (
                        <div key={channel} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{channel}</span>
                            <span className="text-sm text-gray-600">
                              {stats.sent} sent, {stats.failed} failed
                            </span>
                          </div>
                          <Progress 
                            value={stats.sent > 0 ? ((stats.sent - stats.failed) / stats.sent) * 100 : 0} 
                            className="h-2"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Clock className="w-5 h-5" />
                        Recent Notifications
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {dashboard.recentNotifications.slice(0, 5).map((log) => (
                        <div key={log.id} className="flex items-center gap-3 p-2 border rounded">
                          {React.createElement(getChannelIcon(channels.find(c => c.id === log.channel)?.type || 'email'), {
                            className: "w-4 h-4 text-gray-500"
                          })}
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">{log.subject}</div>
                            <div className="text-xs text-gray-500">{log.recipient}</div>
                          </div>
                          <Badge className={STATUS_COLORS[log.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                            {log.status}
                          </Badge>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>System Status</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span>Active Rules</span>
                        <Badge variant="outline">{dashboard.activeRules}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Enabled Channels</span>
                        <Badge variant="outline">{channels.filter(c => c.enabled).length}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Templates</span>
                        <Badge variant="outline">{templates.filter(t => t.active).length}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            ) : null}
          </TabsContent>

          <TabsContent value="channels" className="h-full m-0 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Notification Channels</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Channel
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {channels.map((channel) => (
                <Card key={channel.id} className="group">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {React.createElement(getChannelIcon(channel.type), {
                          className: "w-5 h-5 text-gray-500"
                        })}
                        <CardTitle className="text-base">{channel.name}</CardTitle>
                      </div>
                      <Switch
                        checked={channel.enabled}
                        onCheckedChange={(enabled) => toggleChannel(channel.id, enabled)}
                      />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span>Type</span>
                        <Badge variant="outline">{channel.type.toUpperCase()}</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Priority</span>
                        <Badge className={PRIORITY_COLORS[channel.priority]}>
                          {channel.priority}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Max Retries</span>
                        <span>{channel.retryPolicy.maxRetries}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Settings className="w-4 h-4" />
                      </Button>
                      <Button size="sm" variant="ghost" className="h-8 px-2">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="h-full m-0 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Notification Templates</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Template
              </Button>
            </div>

            <div className="space-y-4">
              {templates.map((template) => (
                <Card key={template.id} className="group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{template.name}</h3>
                          <Badge className={PRIORITY_COLORS[template.priority]}>
                            {template.priority}
                          </Badge>
                          {template.active && (
                            <Badge variant="outline" className="text-green-600 border-green-200">
                              Active
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{template.subject}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Channels:</span>
                          {template.channels.map(channelId => {
                            const channel = channels.find(c => c.id === channelId);
                            return channel ? (
                              <Badge key={channelId} variant="outline" className="text-xs">
                                {channel.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-8 px-2">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="rules" className="h-full m-0 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Notification Rules</h2>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Rule
              </Button>
            </div>

            <div className="space-y-4">
              {rules.map((rule) => (
                <Card key={rule.id} className="group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">{rule.name}</h3>
                          <Switch
                            checked={rule.enabled}
                            onCheckedChange={(enabled) => toggleRule(rule.id, enabled)}
                          />
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{rule.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>Trigger: {rule.trigger.type}</span>
                          <span>Recipients: {rule.recipients.length}</span>
                          <span>Triggered: {rule.triggerCount} times</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="ghost" className="h-8 px-2">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-8 px-2">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="logs" className="h-full m-0 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold">Notification Activity</h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              {logs.map((log) => (
                <Card key={log.id} className="group">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {React.createElement(getChannelIcon(channels.find(c => c.id === log.channel)?.type || 'email'), {
                          className: "w-4 h-4 text-gray-500"
                        })}
                        <div>
                          <div className="font-medium text-sm">{log.subject}</div>
                          <div className="text-xs text-gray-500">
                            To: {log.recipient} • {new Date(log.createdAt).toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={STATUS_COLORS[log.status as keyof typeof STATUS_COLORS] || 'bg-gray-100 text-gray-800'}>
                          {log.status}
                        </Badge>
                        {log.status === 'sent' && (
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => acknowledgeNotification(log.id)}
                            className="h-8 px-2 opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Test Notification Dialog */}
      <Dialog open={showTestDialog} onOpenChange={setShowTestDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Test Notification</DialogTitle>
            <DialogDescription>
              Send a test notification to verify channel configuration
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Channel</label>
              <Select value={selectedChannel} onValueChange={setSelectedChannel}>
                <SelectTrigger>
                  <SelectValue placeholder="Select channel" />
                </SelectTrigger>
                <SelectContent>
                  {channels.filter(c => c.enabled).map(channel => (
                    <SelectItem key={channel.id} value={channel.id}>
                      {channel.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Recipient</label>
              <input
                type="text"
                className="w-full mt-1 px-3 py-2 border rounded-md"
                placeholder="Email or phone number"
                value={testRecipient}
                onChange={(e) => setTestRecipient(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowTestDialog(false)}>
              Cancel
            </Button>
            <Button onClick={sendTestNotification} disabled={!selectedChannel || !testRecipient}>
              Send Test
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}