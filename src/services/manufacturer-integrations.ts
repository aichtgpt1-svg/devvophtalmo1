/**
 * Manufacturer API Integration Service
 * Handles connections to medical device manufacturer APIs for automated data sync
 */

export interface ManufacturerDevice {
  id: string;
  model: string;
  serialNumber: string;
  status: 'active' | 'maintenance' | 'offline' | 'error';
  lastSync: string;
  firmwareVersion?: string;
  warrantyStatus?: 'active' | 'expired' | 'void';
  warrantyExpiry?: string;
  serviceHistory?: ServiceEvent[];
}

export interface ServiceEvent {
  date: string;
  type: 'maintenance' | 'repair' | 'calibration' | 'upgrade';
  description: string;
  technician?: string;
  cost?: number;
}

export interface ManufacturerIntegration {
  id: string;
  name: string;
  status: 'connected' | 'disconnected' | 'error';
  lastSync: string;
  deviceCount: number;
  apiVersion: string;
}

// Simulated manufacturer integrations (would connect to real APIs in production)
export class ManufacturerIntegrationService {
  private static integrations: ManufacturerIntegration[] = [
    {
      id: 'zeiss',
      name: 'ZEISS Medical Technology',
      status: 'connected',
      lastSync: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
      deviceCount: 12,
      apiVersion: '2.1.0'
    },
    {
      id: 'topcon',
      name: 'Topcon Healthcare',
      status: 'connected',
      lastSync: new Date(Date.now() - 600000).toISOString(), // 10 minutes ago
      deviceCount: 8,
      apiVersion: '1.8.3'
    },
    {
      id: 'haag_streit',
      name: 'Haag-Streit Diagnostics',
      status: 'disconnected',
      lastSync: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
      deviceCount: 5,
      apiVersion: '3.0.1'
    },
    {
      id: 'nidek',
      name: 'Nidek Technologies',
      status: 'error',
      lastSync: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
      deviceCount: 3,
      apiVersion: '2.5.2'
    }
  ];

  private static deviceData: Record<string, ManufacturerDevice[]> = {
    zeiss: [
      {
        id: 'zeiss_oct_001',
        model: 'CIRRUS HD-OCT 6000',
        serialNumber: 'ZS-2024-001',
        status: 'active',
        lastSync: new Date().toISOString(),
        firmwareVersion: '11.5.2',
        warrantyStatus: 'active',
        warrantyExpiry: '2025-12-31',
        serviceHistory: [
          {
            date: '2024-11-15',
            type: 'maintenance',
            description: 'Routine calibration and cleaning',
            technician: 'John Smith',
            cost: 450
          }
        ]
      },
      {
        id: 'zeiss_ffp_002',
        model: 'CLARUS 700',
        serialNumber: 'ZS-2023-045',
        status: 'maintenance',
        lastSync: new Date(Date.now() - 1800000).toISOString(), // 30 minutes ago
        firmwareVersion: '8.2.1',
        warrantyStatus: 'active',
        warrantyExpiry: '2026-03-15'
      }
    ],
    topcon: [
      {
        id: 'topcon_oct_003',
        model: 'Maestro2',
        serialNumber: 'TC-2024-012',
        status: 'active',
        lastSync: new Date().toISOString(),
        firmwareVersion: '2.8.5',
        warrantyStatus: 'active',
        warrantyExpiry: '2025-08-20'
      }
    ]
  };

  static async getIntegrations(): Promise<ManufacturerIntegration[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    return [...this.integrations];
  }

  static async getDevicesByManufacturer(manufacturerId: string): Promise<ManufacturerDevice[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    return this.deviceData[manufacturerId] || [];
  }

  static async syncManufacturerData(manufacturerId: string): Promise<{
    success: boolean;
    syncedDevices: number;
    errors: string[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate sync time

    const integration = this.integrations.find(i => i.id === manufacturerId);
    if (!integration) {
      return {
        success: false,
        syncedDevices: 0,
        errors: ['Manufacturer integration not found']
      };
    }

    // Update last sync time
    integration.lastSync = new Date().toISOString();
    integration.status = 'connected';

    const devices = this.deviceData[manufacturerId] || [];
    
    return {
      success: true,
      syncedDevices: devices.length,
      errors: []
    };
  }

  static async testConnection(manufacturerId: string): Promise<{
    success: boolean;
    message: string;
    latency?: number;
  }> {
    const startTime = Date.now();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 1000 + 500));
    const latency = Date.now() - startTime;

    const integration = this.integrations.find(i => i.id === manufacturerId);
    if (!integration) {
      return {
        success: false,
        message: 'Integration not found'
      };
    }

    // Simulate occasional connection failures
    const success = Math.random() > 0.1; // 90% success rate

    if (success) {
      integration.status = 'connected';
      return {
        success: true,
        message: 'Connection successful',
        latency
      };
    } else {
      integration.status = 'error';
      return {
        success: false,
        message: 'Connection timeout - please check API credentials'
      };
    }
  }

  static async configureIntegration(config: {
    manufacturerId: string;
    apiKey: string;
    apiSecret: string;
    endpoint: string;
  }): Promise<{ success: boolean; message: string }> {
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate configuration validation
    if (!config.apiKey || !config.apiSecret) {
      return {
        success: false,
        message: 'API credentials are required'
      };
    }

    const integration = this.integrations.find(i => i.id === config.manufacturerId);
    if (integration) {
      integration.status = 'connected';
      integration.lastSync = new Date().toISOString();
    }

    return {
      success: true,
      message: 'Integration configured successfully'
    };
  }
}