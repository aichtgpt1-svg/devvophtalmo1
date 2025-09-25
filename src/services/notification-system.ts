// Advanced Multi-Channel Notification System
import { DatabaseService } from './database';
import { EmailService } from './email';

export interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in_app' | 'webhook' | 'slack' | 'teams' | 'phone';
  enabled: boolean;
  config: {
    endpoint?: string;
    apiKey?: string;
    webhookUrl?: string;
    phoneNumber?: string;
    slackChannel?: string;
    teamsWebhook?: string;
    emailTemplate?: string;
  };
  priority: 'low' | 'medium' | 'high' | 'critical';
  retryPolicy: {
    maxRetries: number;
    retryDelay: number; // in seconds
    backoffMultiplier: number;
  };
}

export interface NotificationTemplate {
  id: string;
  name: string;
  type: 'maintenance_due' | 'device_failure' | 'service_request' | 'compliance_alert' | 'custom';
  subject: string;
  bodyTemplate: string;
  channels: string[]; // channel IDs
  variables: string[]; // template variables like {{deviceName}}, {{facilityName}}
  priority: 'low' | 'medium' | 'high' | 'critical';
  escalationRules: EscalationRule[];
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EscalationRule {
  id: string;
  delayMinutes: number;
  channels: string[];
  recipients: string[];
  condition: 'no_response' | 'not_acknowledged' | 'time_based';
}

export interface NotificationRule {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: 'device_status' | 'maintenance_overdue' | 'service_request' | 'compliance' | 'schedule' | 'custom';
    conditions: Record<string, any>;
    schedule?: {
      type: 'immediate' | 'daily' | 'weekly' | 'monthly';
      time?: string; // HH:MM format
      days?: string[]; // for weekly
      date?: number; // for monthly
    };
  };
  templateId: string;
  recipients: NotificationRecipient[];
  facilityFilter?: string[]; // facility IDs
  deviceFilter?: string[]; // device IDs or types
  enabled: boolean;
  lastTriggered?: string;
  triggerCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationRecipient {
  id: string;
  type: 'user' | 'role' | 'external';
  identifier: string; // user ID, role name, or email/phone
  channels: string[]; // preferred channels
  quietHours?: {
    start: string; // HH:MM
    end: string; // HH:MM
    timezone: string;
  };
}

export interface NotificationLog {
  id: string;
  ruleId: string;
  templateId: string;
  recipient: string;
  channel: string;
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'acknowledged';
  subject: string;
  body: string;
  metadata: Record<string, any>;
  sentAt?: string;
  deliveredAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  errorMessage?: string;
  retryCount: number;
  createdAt: string;
}

export interface NotificationPreference {
  userId: string;
  channels: {
    [channelType: string]: {
      enabled: boolean;
      priority: 'low' | 'medium' | 'high' | 'critical';
      quietHours?: {
        start: string;
        end: string;
        timezone: string;
      };
    };
  };
  categories: {
    [category: string]: {
      enabled: boolean;
      channels: string[];
      immediateEscalation: boolean;
    };
  };
  escalationContact?: string;
  updatedAt: string;
}

export interface NotificationDashboard {
  totalSent: number;
  deliveryRate: number;
  acknowledgedRate: number;
  failedRate: number;
  channelStats: Record<string, {
    sent: number;
    delivered: number;
    failed: number;
  }>;
  recentNotifications: NotificationLog[];
  activeRules: number;
  escalatedAlerts: number;
}

class NotificationSystemService {
  // Channel Management
  async getChannels(): Promise<NotificationChannel[]> {
    const channels = JSON.parse(localStorage.getItem('notification-channels') || '[]');
    return channels.length > 0 ? channels : this.getDefaultChannels();
  }

  async createChannel(channelData: Omit<NotificationChannel, 'id'>): Promise<NotificationChannel> {
    const channel: NotificationChannel = {
      ...channelData,
      id: `channel-${Date.now()}`
    };

    const channels = await this.getChannels();
    channels.push(channel);
    localStorage.setItem('notification-channels', JSON.stringify(channels));

    return channel;
  }

  async updateChannel(channelId: string, updates: Partial<NotificationChannel>): Promise<NotificationChannel> {
    const channels = await this.getChannels();
    const index = channels.findIndex(c => c.id === channelId);
    
    if (index === -1) {
      throw new Error('Channel not found');
    }

    channels[index] = { ...channels[index], ...updates };
    localStorage.setItem('notification-channels', JSON.stringify(channels));

    return channels[index];
  }

  // Template Management
  async getTemplates(): Promise<NotificationTemplate[]> {
    const templates = JSON.parse(localStorage.getItem('notification-templates') || '[]');
    return templates.length > 0 ? templates : this.getDefaultTemplates();
  }

  async createTemplate(templateData: Omit<NotificationTemplate, 'id' | 'createdAt' | 'updatedAt'>): Promise<NotificationTemplate> {
    const template: NotificationTemplate = {
      ...templateData,
      id: `template-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const templates = await this.getTemplates();
    templates.push(template);
    localStorage.setItem('notification-templates', JSON.stringify(templates));

    return template;
  }

  // Rule Management
  async getRules(): Promise<NotificationRule[]> {
    const rules = JSON.parse(localStorage.getItem('notification-rules') || '[]');
    return rules.length > 0 ? rules : this.getDefaultRules();
  }

  async createRule(ruleData: Omit<NotificationRule, 'id' | 'lastTriggered' | 'triggerCount' | 'createdAt' | 'updatedAt'>): Promise<NotificationRule> {
    const rule: NotificationRule = {
      ...ruleData,
      id: `rule-${Date.now()}`,
      triggerCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const rules = await this.getRules();
    rules.push(rule);
    localStorage.setItem('notification-rules', JSON.stringify(rules));

    return rule;
  }

  async updateRule(ruleId: string, updates: Partial<NotificationRule>): Promise<NotificationRule> {
    const rules = await this.getRules();
    const index = rules.findIndex(r => r.id === ruleId);
    
    if (index === -1) {
      throw new Error('Rule not found');
    }

    rules[index] = { 
      ...rules[index], 
      ...updates, 
      updatedAt: new Date().toISOString() 
    };
    localStorage.setItem('notification-rules', JSON.stringify(rules));

    return rules[index];
  }

  // Notification Sending
  async sendNotification(
    templateId: string, 
    recipients: string[], 
    variables: Record<string, any> = {},
    priority: 'low' | 'medium' | 'high' | 'critical' = 'medium'
  ): Promise<NotificationLog[]> {
    const template = (await this.getTemplates()).find(t => t.id === templateId);
    if (!template) {
      throw new Error('Template not found');
    }

    const channels = await this.getChannels();
    const logs: NotificationLog[] = [];

    for (const recipient of recipients) {
      for (const channelId of template.channels) {
        const channel = channels.find(c => c.id === channelId);
        if (!channel || !channel.enabled) continue;

        const log: NotificationLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          ruleId: 'manual',
          templateId,
          recipient,
          channel: channelId,
          status: 'pending',
          subject: this.processTemplate(template.subject, variables),
          body: this.processTemplate(template.bodyTemplate, variables),
          metadata: { variables, priority },
          retryCount: 0,
          createdAt: new Date().toISOString()
        };

        // Simulate sending
        try {
          await this.sendThroughChannel(channel, log);
          log.status = 'sent';
          log.sentAt = new Date().toISOString();
        } catch (error) {
          log.status = 'failed';
          log.errorMessage = error instanceof Error ? error.message : 'Unknown error';
        }

        logs.push(log);
      }
    }

    // Save logs
    const existingLogs = JSON.parse(localStorage.getItem('notification-logs') || '[]');
    existingLogs.push(...logs);
    localStorage.setItem('notification-logs', JSON.stringify(existingLogs));

    return logs;
  }

  // Dashboard & Analytics
  async getDashboard(): Promise<NotificationDashboard> {
    const logs = JSON.parse(localStorage.getItem('notification-logs') || '[]') as NotificationLog[];
    const rules = await this.getRules();
    const channels = await this.getChannels();

    const totalSent = logs.filter(l => l.status === 'sent' || l.status === 'delivered').length;
    const totalFailed = logs.filter(l => l.status === 'failed').length;
    const totalAcknowledged = logs.filter(l => l.status === 'acknowledged').length;
    const total = logs.length || 1;

    const channelStats: Record<string, any> = {};
    channels.forEach(channel => {
      const channelLogs = logs.filter(l => l.channel === channel.id);
      channelStats[channel.name] = {
        sent: channelLogs.filter(l => l.status === 'sent' || l.status === 'delivered').length,
        delivered: channelLogs.filter(l => l.status === 'delivered').length,
        failed: channelLogs.filter(l => l.status === 'failed').length
      };
    });

    return {
      totalSent,
      deliveryRate: Math.round((totalSent / total) * 100),
      acknowledgedRate: Math.round((totalAcknowledged / total) * 100),
      failedRate: Math.round((totalFailed / total) * 100),
      channelStats,
      recentNotifications: logs.slice(-10).reverse(),
      activeRules: rules.filter(r => r.enabled).length,
      escalatedAlerts: Math.floor(Math.random() * 5) + 1
    };
  }

  // Get notification logs
  async getNotificationLogs(limit = 50): Promise<NotificationLog[]> {
    const logs = JSON.parse(localStorage.getItem('notification-logs') || '[]') as NotificationLog[];
    return logs.slice(-limit).reverse();
  }

  // Acknowledge notification
  async acknowledgeNotification(logId: string, acknowledgedBy: string): Promise<NotificationLog> {
    const logs = JSON.parse(localStorage.getItem('notification-logs') || '[]') as NotificationLog[];
    const index = logs.findIndex(l => l.id === logId);
    
    if (index === -1) {
      throw new Error('Notification log not found');
    }

    logs[index].status = 'acknowledged';
    logs[index].acknowledgedAt = new Date().toISOString();
    logs[index].acknowledgedBy = acknowledgedBy;

    localStorage.setItem('notification-logs', JSON.stringify(logs));
    return logs[index];
  }

  // Private helper methods
  private processTemplate(template: string, variables: Record<string, any>): string {
    let processed = template;
    Object.entries(variables).forEach(([key, value]) => {
      processed = processed.replace(new RegExp(`{{${key}}}`, 'g'), String(value));
    });
    return processed;
  }

  private async sendThroughChannel(channel: NotificationChannel, log: NotificationLog): Promise<void> {
    // Simulate different channel behaviors
    switch (channel.type) {
      case 'email':
        // Use existing email service
        if (channel.config.emailTemplate) {
          await EmailService.sendEmail({
            to: log.recipient,
            subject: log.subject,
            htmlContent: log.body
          });
        }
        break;
      case 'sms':
        // Simulate SMS sending
        if (Math.random() > 0.05) { // 95% success rate
          await new Promise(resolve => setTimeout(resolve, 500));
        } else {
          throw new Error('SMS delivery failed');
        }
        break;
      case 'push':
      case 'in_app':
        // Simulate push/in-app notifications
        await new Promise(resolve => setTimeout(resolve, 100));
        break;
      case 'webhook':
        // Simulate webhook calls
        if (channel.config.webhookUrl) {
          // In real implementation, make HTTP request
          await new Promise(resolve => setTimeout(resolve, 300));
        }
        break;
      default:
        await new Promise(resolve => setTimeout(resolve, 200));
    }
  }

  private getDefaultChannels(): NotificationChannel[] {
    const channels: NotificationChannel[] = [
      {
        id: 'email-primary',
        name: 'Primary Email',
        type: 'email',
        enabled: true,
        config: { emailTemplate: 'default' },
        priority: 'medium',
        retryPolicy: { maxRetries: 3, retryDelay: 300, backoffMultiplier: 2 }
      },
      {
        id: 'sms-alerts',
        name: 'SMS Alerts',
        type: 'sms',
        enabled: true,
        config: {},
        priority: 'high',
        retryPolicy: { maxRetries: 2, retryDelay: 600, backoffMultiplier: 1.5 }
      },
      {
        id: 'in-app',
        name: 'In-App Notifications',
        type: 'in_app',
        enabled: true,
        config: {},
        priority: 'low',
        retryPolicy: { maxRetries: 1, retryDelay: 0, backoffMultiplier: 1 }
      },
      {
        id: 'slack-alerts',
        name: 'Slack Integration',
        type: 'slack',
        enabled: false,
        config: { slackChannel: '#ophthalmo-alerts' },
        priority: 'medium',
        retryPolicy: { maxRetries: 2, retryDelay: 300, backoffMultiplier: 2 }
      }
    ];

    localStorage.setItem('notification-channels', JSON.stringify(channels));
    return channels;
  }

  private getDefaultTemplates(): NotificationTemplate[] {
    const templates: NotificationTemplate[] = [
      {
        id: 'maintenance-due',
        name: 'Maintenance Due Alert',
        type: 'maintenance_due',
        subject: 'Maintenance Required: {{deviceName}}',
        bodyTemplate: 'Device {{deviceName}} at {{facilityName}} requires maintenance. Scheduled for {{maintenanceDate}}.\\n\\nPriority: {{priority}}\\nTechnician: {{technician}}',
        channels: ['email-primary', 'in-app'],
        variables: ['deviceName', 'facilityName', 'maintenanceDate', 'priority', 'technician'],
        priority: 'medium',
        escalationRules: [],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'device-failure',
        name: 'Critical Device Failure',
        type: 'device_failure',
        subject: 'URGENT: Device Failure - {{deviceName}}',
        bodyTemplate: 'CRITICAL ALERT: {{deviceName}} at {{facilityName}} has failed.\\n\\nError: {{errorMessage}}\\nTime: {{failureTime}}\\n\\nImmediate attention required.',
        channels: ['email-primary', 'sms-alerts', 'in-app'],
        variables: ['deviceName', 'facilityName', 'errorMessage', 'failureTime'],
        priority: 'critical',
        escalationRules: [],
        active: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    localStorage.setItem('notification-templates', JSON.stringify(templates));
    return templates;
  }

  private getDefaultRules(): NotificationRule[] {
    const rules: NotificationRule[] = [
      {
        id: 'maintenance-overdue',
        name: 'Overdue Maintenance Alert',
        description: 'Alert when device maintenance is overdue',
        trigger: {
          type: 'maintenance_overdue',
          conditions: { days: 7 },
          schedule: { type: 'daily', time: '09:00' }
        },
        templateId: 'maintenance-due',
        recipients: [
          { id: 'maintenance-team', type: 'role', identifier: 'maintenance_technician', channels: ['email-primary'] }
        ],
        enabled: true,
        triggerCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    localStorage.setItem('notification-rules', JSON.stringify(rules));
    return rules;
  }
}

export const notificationSystemService = new NotificationSystemService();