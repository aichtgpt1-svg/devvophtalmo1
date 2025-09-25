// Healthcare Network & Multi-Facility Management Service
import { DatabaseService } from './database';

export interface HealthcareFacility {
  id: string;
  name: string;
  type: 'hospital' | 'clinic' | 'surgery_center' | 'imaging_center' | 'specialist_office';
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
    website?: string;
  };
  administrator: {
    name: string;
    email: string;
    phone: string;
  };
  settings: {
    timezone: string;
    operatingHours: {
      [key: string]: { open: string; close: string; closed?: boolean };
    };
    maintenanceWindow: {
      start: string;
      end: string;
    };
  };
  certifications: string[];
  deviceCount: number;
  staffCount: number;
  status: 'active' | 'inactive' | 'maintenance';
  networkId: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthcareNetwork {
  id: string;
  name: string;
  description: string;
  type: 'hospital_system' | 'clinic_network' | 'franchise' | 'management_company';
  headquarters: {
    name: string;
    address: {
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
    };
    contact: {
      phone: string;
      email: string;
    };
  };
  facilities: string[]; // facility IDs
  totalDevices: number;
  totalStaff: number;
  complianceLevel: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  createdAt: string;
  updatedAt: string;
}

export interface FacilityDeviceAllocation {
  facilityId: string;
  deviceId: string;
  assignedAt: string;
  assignedBy: string;
  status: 'assigned' | 'transferred' | 'decommissioned';
  transferHistory: {
    fromFacility?: string;
    toFacility: string;
    transferredAt: string;
    transferredBy: string;
    reason: string;
  }[];
}

export interface InterFacilityTransfer {
  id: string;
  deviceId: string;
  fromFacilityId: string;
  toFacilityId: string;
  requestedBy: string;
  approvedBy?: string;
  status: 'pending' | 'approved' | 'in_transit' | 'completed' | 'cancelled';
  reason: string;
  requestDate: string;
  approvalDate?: string;
  completionDate?: string;
  notes?: string;
  logisticsProvider?: string;
  trackingNumber?: string;
}

export interface NetworkDashboardMetrics {
  networkId: string;
  totalFacilities: number;
  activeFacilities: number;
  totalDevices: number;
  devicesNeedingMaintenance: number;
  activeServiceRequests: number;
  complianceScore: number;
  facilitiesByType: Record<string, number>;
  devicesByFacility: Record<string, number>;
  maintenanceByFacility: Record<string, number>;
  complianceByFacility: Record<string, number>;
}

class FacilityManagementService {
  // Network Management
  async createNetwork(networkData: Omit<HealthcareNetwork, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthcareNetwork> {
    const network: HealthcareNetwork = {
      ...networkData,
      id: `network-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // In real implementation, save to database
    const networks = this.getSavedNetworks();
    networks.push(network);
    localStorage.setItem('healthcare-networks', JSON.stringify(networks));

    return network;
  }

  async getNetworks(): Promise<HealthcareNetwork[]> {
    return this.getSavedNetworks();
  }

  async getNetwork(networkId: string): Promise<HealthcareNetwork | null> {
    const networks = this.getSavedNetworks();
    return networks.find(n => n.id === networkId) || null;
  }

  async updateNetwork(networkId: string, updates: Partial<HealthcareNetwork>): Promise<HealthcareNetwork> {
    const networks = this.getSavedNetworks();
    const index = networks.findIndex(n => n.id === networkId);
    
    if (index === -1) {
      throw new Error('Network not found');
    }

    networks[index] = {
      ...networks[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('healthcare-networks', JSON.stringify(networks));
    return networks[index];
  }

  // Facility Management
  async createFacility(facilityData: Omit<HealthcareFacility, 'id' | 'createdAt' | 'updatedAt'>): Promise<HealthcareFacility> {
    const facility: HealthcareFacility = {
      ...facilityData,
      id: `facility-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add facility to network
    const networks = this.getSavedNetworks();
    const networkIndex = networks.findIndex(n => n.id === facility.networkId);
    if (networkIndex !== -1) {
      networks[networkIndex].facilities.push(facility.id);
      localStorage.setItem('healthcare-networks', JSON.stringify(networks));
    }

    // Save facility
    const facilities = this.getSavedFacilities();
    facilities.push(facility);
    localStorage.setItem('healthcare-facilities', JSON.stringify(facilities));

    return facility;
  }

  async getFacilities(networkId?: string): Promise<HealthcareFacility[]> {
    const facilities = this.getSavedFacilities();
    return networkId ? facilities.filter(f => f.networkId === networkId) : facilities;
  }

  async getFacility(facilityId: string): Promise<HealthcareFacility | null> {
    const facilities = this.getSavedFacilities();
    return facilities.find(f => f.id === facilityId) || null;
  }

  async updateFacility(facilityId: string, updates: Partial<HealthcareFacility>): Promise<HealthcareFacility> {
    const facilities = this.getSavedFacilities();
    const index = facilities.findIndex(f => f.id === facilityId);
    
    if (index === -1) {
      throw new Error('Facility not found');
    }

    facilities[index] = {
      ...facilities[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('healthcare-facilities', JSON.stringify(facilities));
    return facilities[index];
  }

  // Device Transfer Management
  async initiateDeviceTransfer(transferData: Omit<InterFacilityTransfer, 'id' | 'requestDate'>): Promise<InterFacilityTransfer> {
    const transfer: InterFacilityTransfer = {
      ...transferData,
      id: `transfer-${Date.now()}`,
      requestDate: new Date().toISOString()
    };

    const transfers = this.getSavedTransfers();
    transfers.push(transfer);
    localStorage.setItem('device-transfers', JSON.stringify(transfers));

    return transfer;
  }

  async approveDeviceTransfer(transferId: string, approvedBy: string): Promise<InterFacilityTransfer> {
    const transfers = this.getSavedTransfers();
    const index = transfers.findIndex(t => t.id === transferId);
    
    if (index === -1) {
      throw new Error('Transfer not found');
    }

    transfers[index] = {
      ...transfers[index],
      status: 'approved',
      approvedBy,
      approvalDate: new Date().toISOString()
    };

    localStorage.setItem('device-transfers', JSON.stringify(transfers));
    return transfers[index];
  }

  async getDeviceTransfers(facilityId?: string): Promise<InterFacilityTransfer[]> {
    const transfers = this.getSavedTransfers();
    return facilityId 
      ? transfers.filter(t => t.fromFacilityId === facilityId || t.toFacilityId === facilityId)
      : transfers;
  }

  // Network Analytics
  async getNetworkDashboardMetrics(networkId: string): Promise<NetworkDashboardMetrics> {
    const network = await this.getNetwork(networkId);
    const facilities = await this.getFacilities(networkId);
    
    if (!network) {
      throw new Error('Network not found');
    }

    // In real implementation, aggregate from actual data sources
    const metrics: NetworkDashboardMetrics = {
      networkId,
      totalFacilities: facilities.length,
      activeFacilities: facilities.filter(f => f.status === 'active').length,
      totalDevices: facilities.reduce((sum, f) => sum + f.deviceCount, 0),
      devicesNeedingMaintenance: Math.floor(facilities.reduce((sum, f) => sum + f.deviceCount, 0) * 0.15),
      activeServiceRequests: Math.floor(facilities.length * 3.2),
      complianceScore: 92,
      facilitiesByType: facilities.reduce((acc, f) => {
        acc[f.type] = (acc[f.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>),
      devicesByFacility: facilities.reduce((acc, f) => {
        acc[f.id] = f.deviceCount;
        return acc;
      }, {} as Record<string, number>),
      maintenanceByFacility: facilities.reduce((acc, f) => {
        acc[f.id] = Math.floor(f.deviceCount * 0.15);
        return acc;
      }, {} as Record<string, number>),
      complianceByFacility: facilities.reduce((acc, f) => {
        acc[f.id] = Math.floor(Math.random() * 20) + 80; // 80-100%
        return acc;
      }, {} as Record<string, number>)
    };

    return metrics;
  }

  // Cross-facility analytics
  async getCrossFacilityReport(networkId: string, reportType: 'maintenance' | 'compliance' | 'utilization') {
    const facilities = await this.getFacilities(networkId);
    const report = {
      networkId,
      reportType,
      generatedAt: new Date().toISOString(),
      facilities: facilities.map(facility => ({
        facilityId: facility.id,
        facilityName: facility.name,
        type: facility.type,
        metrics: this.generateFacilityMetrics(facility, reportType)
      }))
    };

    return report;
  }

  // Private helper methods
  private getSavedNetworks(): HealthcareNetwork[] {
    return JSON.parse(localStorage.getItem('healthcare-networks') || '[]');
  }

  private getSavedFacilities(): HealthcareFacility[] {
    return JSON.parse(localStorage.getItem('healthcare-facilities') || '[]');
  }

  private getSavedTransfers(): InterFacilityTransfer[] {
    return JSON.parse(localStorage.getItem('device-transfers') || '[]');
  }

  private generateFacilityMetrics(facility: HealthcareFacility, reportType: string) {
    // Mock metrics generation - in real implementation, query actual data
    switch (reportType) {
      case 'maintenance':
        return {
          scheduledMaintenance: Math.floor(facility.deviceCount * 0.1),
          overdueMaintenance: Math.floor(facility.deviceCount * 0.05),
          completedThisMonth: Math.floor(facility.deviceCount * 0.2),
          averageResponseTime: Math.floor(Math.random() * 12) + 4 // 4-16 hours
        };
      case 'compliance':
        return {
          complianceScore: Math.floor(Math.random() * 20) + 80,
          pendingAudits: Math.floor(Math.random() * 3),
          certificationStatus: Math.random() > 0.8 ? 'needs_renewal' : 'current',
          lastAuditDate: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
        };
      case 'utilization':
        return {
          averageUtilization: Math.floor(Math.random() * 40) + 60, // 60-100%
          peakHours: ['09:00-11:00', '14:00-16:00'],
          deviceDowntime: Math.floor(Math.random() * 5) + 1, // 1-5%
          efficiencyScore: Math.floor(Math.random() * 20) + 75 // 75-95%
        };
      default:
        return {};
    }
  }

  // Initialize with sample data
  async initializeSampleData(): Promise<void> {
    const existingNetworks = this.getSavedNetworks();
    if (existingNetworks.length > 0) return;

    // Sample network
    const sampleNetwork: HealthcareNetwork = {
      id: 'network-001',
      name: 'Metropolitan Eye Care Network',
      description: 'Comprehensive ophthalmology services across the metropolitan area',
      type: 'clinic_network',
      headquarters: {
        name: 'Metropolitan Eye Care HQ',
        address: {
          street: '123 Healthcare Blvd',
          city: 'Metropolitan City',
          state: 'CA',
          zipCode: '90210',
          country: 'USA'
        },
        contact: {
          phone: '+1-555-EYE-CARE',
          email: 'headquarters@meteye.com'
        }
      },
      facilities: [],
      totalDevices: 0,
      totalStaff: 0,
      complianceLevel: 'excellent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Sample facilities
    const sampleFacilities: HealthcareFacility[] = [
      {
        id: 'facility-001',
        name: 'Downtown Eye Center',
        type: 'clinic',
        address: {
          street: '456 Medical Plaza',
          city: 'Downtown',
          state: 'CA',
          zipCode: '90211',
          country: 'USA'
        },
        contact: {
          phone: '+1-555-EYE-001',
          email: 'downtown@meteye.com',
          website: 'https://downtown.meteye.com'
        },
        administrator: {
          name: 'Dr. Sarah Johnson',
          email: 'sarah.johnson@meteye.com',
          phone: '+1-555-EYE-ADM'
        },
        settings: {
          timezone: 'America/Los_Angeles',
          operatingHours: {
            'monday': { open: '08:00', close: '18:00' },
            'tuesday': { open: '08:00', close: '18:00' },
            'wednesday': { open: '08:00', close: '18:00' },
            'thursday': { open: '08:00', close: '18:00' },
            'friday': { open: '08:00', close: '17:00' },
            'saturday': { open: '09:00', close: '13:00' },
            'sunday': { closed: true, open: '', close: '' }
          },
          maintenanceWindow: {
            start: '19:00',
            end: '07:00'
          }
        },
        certifications: ['Joint Commission', 'AAAHC', 'CAP'],
        deviceCount: 15,
        staffCount: 12,
        status: 'active',
        networkId: 'network-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      {
        id: 'facility-002',
        name: 'Westside Surgery Center',
        type: 'surgery_center',
        address: {
          street: '789 Surgical Way',
          city: 'Westside',
          state: 'CA',
          zipCode: '90212',
          country: 'USA'
        },
        contact: {
          phone: '+1-555-EYE-002',
          email: 'westside@meteye.com',
          website: 'https://westside.meteye.com'
        },
        administrator: {
          name: 'Dr. Michael Chen',
          email: 'michael.chen@meteye.com',
          phone: '+1-555-EYE-002'
        },
        settings: {
          timezone: 'America/Los_Angeles',
          operatingHours: {
            'monday': { open: '07:00', close: '19:00' },
            'tuesday': { open: '07:00', close: '19:00' },
            'wednesday': { open: '07:00', close: '19:00' },
            'thursday': { open: '07:00', close: '19:00' },
            'friday': { open: '07:00', close: '18:00' },
            'saturday': { closed: true, open: '', close: '' },
            'sunday': { closed: true, open: '', close: '' }
          },
          maintenanceWindow: {
            start: '20:00',
            end: '06:00'
          }
        },
        certifications: ['Joint Commission', 'AAAHC', 'CMS'],
        deviceCount: 22,
        staffCount: 18,
        status: 'active',
        networkId: 'network-001',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    ];

    // Update network with facility IDs
    sampleNetwork.facilities = sampleFacilities.map(f => f.id);
    sampleNetwork.totalDevices = sampleFacilities.reduce((sum, f) => sum + f.deviceCount, 0);
    sampleNetwork.totalStaff = sampleFacilities.reduce((sum, f) => sum + f.staffCount, 0);

    // Save to localStorage
    localStorage.setItem('healthcare-networks', JSON.stringify([sampleNetwork]));
    localStorage.setItem('healthcare-facilities', JSON.stringify(sampleFacilities));
  }
}

export const facilityManagementService = new FacilityManagementService();