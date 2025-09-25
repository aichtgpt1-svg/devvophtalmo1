import { table } from '@devvai/devv-code-backend';

// Table IDs from the database
export const TABLE_IDS = {
  devices: 'ew7zywz879j4',
  maintenance_records: 'ew7zzcjafi80', 
  service_requests: 'ew7zzt9dyl1c',
  user_profiles: 'ew8006ogbocg'
} as const;

// Type definitions
export interface Device {
  _id?: string;
  _uid?: string;
  _tid?: string;
  manufacturer: string;
  model: string;
  serial_number: string;
  device_type: 'OCT' | 'Fundus_Camera' | 'Visual_Field' | 'Tonometer' | 'Slit_Lamp' | 'Autorefractor' | 'Keratometer';
  location: string;
  status: 'Operational' | 'Maintenance_Required' | 'Under_Maintenance' | 'Out_of_Service';
  last_maintenance?: string;
  next_maintenance?: string;
  created_at: string;
  // Additional fields for UI compatibility
  name?: string;
  notes?: string;
  purchase_date?: string;
  warranty_expiry?: string;
  installation_date?: string;
  description?: string;
}

export interface MaintenanceRecord {
  _id?: string;
  _uid?: string;
  _tid?: string;
  device_id: string;
  maintenance_type: 'Preventive' | 'Corrective' | 'Calibration' | 'Inspection' | 'Emergency_Repair';
  maintenance_date: string;
  technician_id: string;
  technician_name: string;
  description: string;
  parts_replaced?: string;
  cost?: number;
  duration_hours?: number;
  before_status: string;
  after_status: string;
  notes?: string;
  next_maintenance_due?: string;
}

export interface ServiceRequest {
  _id?: string;
  _uid?: string;
  _tid?: string;
  device_id: string;
  request_status: 'Open' | 'In_Progress' | 'Resolved' | 'Closed' | 'Cancelled';
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  issue_type: 'Hardware_Failure' | 'Software_Issue' | 'Calibration_Needed' | 'Image_Quality' | 'Connectivity' | 'User_Error';
  description: string;
  symptoms?: string;
  reported_by: string;
  reporter_contact?: string;
  assigned_to?: string;
  created_at: string;
  updated_at?: string;
  resolved_at?: string;
  resolution_notes?: string;
  estimated_hours?: number;
  actual_hours?: number;
}

export interface UserProfile {
  _id?: string;
  _uid?: string;
  _tid?: string;
  email: string;
  full_name: string;
  role: 'Admin' | 'Technician' | 'Operator' | 'Manager' | 'Viewer';
  department: 'Ophthalmology' | 'Biomedical_Engineering' | 'IT' | 'Administration';
  phone?: string;
  employee_id?: string;
  certifications?: string;
  permissions?: string;
  created_at: string;
  last_login?: string;
  active: string;
}

// Status mapping utilities
export const mapDeviceStatus = (status: Device['status']): string => {
  switch (status) {
    case 'Operational': return 'active';
    case 'Maintenance_Required': return 'maintenance';
    case 'Under_Maintenance': return 'maintenance';
    case 'Out_of_Service': return 'inactive';
    default: return 'unknown';
  }
};

export const mapServiceRequestStatus = (status: ServiceRequest['request_status']): string => {
  switch (status) {
    case 'Open': return 'open';
    case 'In_Progress': return 'in_progress';
    case 'Resolved': return 'resolved';
    case 'Closed': return 'closed';
    case 'Cancelled': return 'cancelled';
    default: return 'unknown';
  }
};

export const reverseMapDeviceStatus = (uiStatus: string): Device['status'] => {
  switch (uiStatus) {
    case 'active': return 'Operational';
    case 'maintenance': return 'Maintenance_Required';
    case 'inactive': return 'Out_of_Service';
    default: return 'Operational';
  }
};

export const reverseMapServiceRequestStatus = (uiStatus: string): ServiceRequest['request_status'] => {
  switch (uiStatus) {
    case 'open': return 'Open';
    case 'in_progress': return 'In_Progress';
    case 'resolved': return 'Resolved';
    case 'closed': return 'Closed';
    case 'cancelled': return 'Cancelled';
    default: return 'Open';
  }
};

// Extended interfaces for UI with computed fields
export interface DeviceWithUIStatus extends Device {
  uiStatus: string;
  displayName: string;
}

export interface ServiceRequestWithUIStatus extends ServiceRequest {
  uiStatus: string;
}

// Database service class
export class DatabaseService {
  // Device operations
  static async createDevice(deviceData: Omit<Device, '_id' | '_uid' | '_tid' | 'created_at'>): Promise<void> {
    const device: Omit<Device, '_id' | '_uid' | '_tid'> = {
      ...deviceData,
      created_at: new Date().toISOString()
    };
    
    await table.addItem(TABLE_IDS.devices, device);
  }

  static async getDevices(options?: { 
    deviceType?: Device['device_type'];
    status?: Device['status'];
    limit?: number;
    cursor?: string;
  }): Promise<{ items: Device[]; nextCursor?: string }> {
    const query: any = {};
    let sortField = '_id';
    
    // Use appropriate index based on query parameters
    if (options?.deviceType) {
      query.device_type = options.deviceType;
      sortField = '_id'; // device_type_idx uses _id as range key
    }
    
    if (options?.status) {
      query.status = options.status;
      sortField = 'next_maintenance'; // status_idx uses next_maintenance as range key
    }

    const result = await table.getItems(TABLE_IDS.devices, {
      query: Object.keys(query).length > 0 ? query : undefined,
      limit: options?.limit || 20,
      cursor: options?.cursor,
      sort: sortField,
      order: 'desc'
    });

    return {
      items: result.items as Device[],
      nextCursor: result.nextCursor
    };
  }

  static async updateDevice(deviceId: string, userId: string, updates: Partial<Device>): Promise<void> {
    await table.updateItem(TABLE_IDS.devices, {
      _uid: userId,
      _id: deviceId,
      ...updates
    });
  }

  static async getDeviceById(deviceId: string): Promise<Device | null> {
    try {
      const result = await table.getItems(TABLE_IDS.devices, {
        query: { _id: deviceId },
        limit: 1
      });
      return result.items.length > 0 ? result.items[0] as Device : null;
    } catch (error) {
      console.error('Error fetching device by ID:', error);
      return null;
    }
  }

  static async deleteDevice(deviceId: string, userId: string): Promise<void> {
    await table.deleteItem(TABLE_IDS.devices, {
      _uid: userId,
      _id: deviceId
    });
  }

  // Maintenance records operations
  static async createMaintenanceRecord(recordData: Omit<MaintenanceRecord, '_id' | '_uid' | '_tid'>): Promise<void> {
    await table.addItem(TABLE_IDS.maintenance_records, recordData);
  }

  static async getMaintenanceRecords(options?: {
    deviceId?: string;
    technicianId?: string;
    maintenanceType?: MaintenanceRecord['maintenance_type'];
    limit?: number;
    cursor?: string;
  }): Promise<{ items: MaintenanceRecord[]; nextCursor?: string }> {
    const query: any = {};
    let sortField = '_id'; // Default to _id (uses _tid_id_idx) for global queries, maintenance_date for indexed queries
    
    // Use appropriate index based on query parameters
    if (options?.deviceId) {
      query.device_id = options.deviceId;
      sortField = 'maintenance_date'; // device_id_idx uses maintenance_date as range key
    }
    
    if (options?.technicianId) {
      query.technician_id = options.technicianId;
      sortField = 'maintenance_date'; // technician_idx uses maintenance_date as range key
    }
    
    if (options?.maintenanceType) {
      query.maintenance_type = options.maintenanceType;
      sortField = 'maintenance_date'; // type_idx uses maintenance_date as range key
    }

    const result = await table.getItems(TABLE_IDS.maintenance_records, {
      query: Object.keys(query).length > 0 ? query : undefined,
      limit: options?.limit || 20,
      cursor: options?.cursor,
      sort: sortField,
      order: 'desc'
    });

    return {
      items: result.items as MaintenanceRecord[],
      nextCursor: result.nextCursor
    };
  }

  static async getMaintenanceRecordById(recordId: string): Promise<MaintenanceRecord | null> {
    try {
      const result = await table.getItems(TABLE_IDS.maintenance_records, {
        query: { _id: recordId },
        limit: 1
      });
      return result.items.length > 0 ? result.items[0] as MaintenanceRecord : null;
    } catch (error) {
      console.error('Error fetching maintenance record by ID:', error);
      return null;
    }
  }

  static async updateMaintenanceRecord(recordId: string, userId: string, updates: Partial<MaintenanceRecord>): Promise<void> {
    await table.updateItem(TABLE_IDS.maintenance_records, {
      _uid: userId,
      _id: recordId,
      ...updates
    });
  }

  // Service requests operations
  static async createServiceRequest(requestData: Omit<ServiceRequest, '_id' | '_uid' | '_tid' | 'created_at' | 'updated_at'>): Promise<void> {
    const request: Omit<ServiceRequest, '_id' | '_uid' | '_tid'> = {
      ...requestData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    await table.addItem(TABLE_IDS.service_requests, request);
  }

  static async getServiceRequests(options?: {
    deviceId?: string;
    status?: ServiceRequest['request_status'];
    priority?: ServiceRequest['priority'];
    assignedTo?: string;
    limit?: number;
    cursor?: string;
  }): Promise<{ items: ServiceRequest[]; nextCursor?: string }> {
    const query: any = {};
    let sortField = '_id'; // Default to _id for global queries (uses _tid_id_idx)
    
    // Use appropriate index based on query parameters
    if (options?.deviceId) {
      query.device_id = options.deviceId;
      sortField = 'created_at'; // device_id_idx uses created_at as range key
    }
    
    if (options?.status) {
      query.request_status = options.status;
      sortField = 'created_at'; // status_idx uses created_at as range key
    }
    
    if (options?.priority) {
      query.priority = options.priority;
      sortField = 'created_at'; // priority_idx uses created_at as range key
    }
    
    if (options?.assignedTo) {
      query.assigned_to = options.assignedTo;
      sortField = 'created_at'; // assigned_idx uses created_at as range key
    }

    const result = await table.getItems(TABLE_IDS.service_requests, {
      query: Object.keys(query).length > 0 ? query : undefined,
      limit: options?.limit || 20,
      cursor: options?.cursor,
      sort: sortField,
      order: 'desc'
    });

    return {
      items: result.items as ServiceRequest[],
      nextCursor: result.nextCursor
    };
  }

  static async getServiceRequestById(requestId: string): Promise<ServiceRequest | null> {
    try {
      const result = await table.getItems(TABLE_IDS.service_requests, {
        query: { _id: requestId },
        limit: 1
      });
      return result.items.length > 0 ? result.items[0] as ServiceRequest : null;
    } catch (error) {
      console.error('Error fetching service request by ID:', error);
      return null;
    }
  }

  static async updateServiceRequest(requestId: string, userId: string, updates: Partial<ServiceRequest>): Promise<void> {
    await table.updateItem(TABLE_IDS.service_requests, {
      _uid: userId,
      _id: requestId,
      ...updates,
      updated_at: new Date().toISOString()
    });
  }

  // User profiles operations
  static async createUserProfile(profileData: Omit<UserProfile, '_id' | '_uid' | '_tid' | 'created_at'>): Promise<void> {
    const profile: Omit<UserProfile, '_id' | '_uid' | '_tid'> = {
      ...profileData,
      created_at: new Date().toISOString(),
      active: 'true'
    };
    
    await table.addItem(TABLE_IDS.user_profiles, profile);
  }

  static async getUserProfiles(options?: {
    role?: UserProfile['role'];
    department?: UserProfile['department'];
    active?: boolean;
    limit?: number;
    cursor?: string;
  }): Promise<{ items: UserProfile[]; nextCursor?: string }> {
    const query: any = {};
    
    if (options?.role) {
      query.role = options.role;
    }
    
    if (options?.department) {
      query.department = options.department;
    }
    
    if (options?.active !== undefined) {
      query.active = options.active.toString();
    }

    const result = await table.getItems(TABLE_IDS.user_profiles, {
      query: Object.keys(query).length > 0 ? query : undefined,
      limit: options?.limit || 20,
      cursor: options?.cursor,
      sort: 'created_at',
      order: 'desc'
    });

    return {
      items: result.items as UserProfile[],
      nextCursor: result.nextCursor
    };
  }

  static async updateUserProfile(profileId: string, userId: string, updates: Partial<UserProfile>): Promise<void> {
    await table.updateItem(TABLE_IDS.user_profiles, {
      _uid: userId,
      _id: profileId,
      ...updates
    });
  }

  // Utility methods
  static async getDevicesByMaintenanceStatus(): Promise<{
    operational: number;
    maintenanceRequired: number;
    underMaintenance: number;
    outOfService: number;
  }> {
    try {
      // Get all devices first and then filter in memory to avoid index issues
      const allDevices = await this.getDevices({ limit: 100 });
      
      const statusCounts = {
        operational: 0,
        maintenanceRequired: 0,
        underMaintenance: 0,
        outOfService: 0
      };

      allDevices.items.forEach(device => {
        switch (device.status) {
          case 'Operational':
            statusCounts.operational++;
            break;
          case 'Maintenance_Required':
            statusCounts.maintenanceRequired++;
            break;
          case 'Under_Maintenance':
            statusCounts.underMaintenance++;
            break;
          case 'Out_of_Service':
            statusCounts.outOfService++;
            break;
        }
      });

      return statusCounts;
    } catch (error) {
      console.error('Error getting device status counts:', error);
      return {
        operational: 0,
        maintenanceRequired: 0,
        underMaintenance: 0,
        outOfService: 0
      };
    }
  }

  static async getServiceRequestsByPriority(): Promise<{
    critical: number;
    high: number;
    medium: number;
    low: number;
  }> {
    try {
      // Get all open service requests and filter in memory
      const allRequests = await this.getServiceRequests({ status: 'Open', limit: 100 });
      
      const priorityCounts = {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };

      allRequests.items.forEach(request => {
        switch (request.priority) {
          case 'Critical':
            priorityCounts.critical++;
            break;
          case 'High':
            priorityCounts.high++;
            break;
          case 'Medium':
            priorityCounts.medium++;
            break;
          case 'Low':
            priorityCounts.low++;
            break;
        }
      });

      return priorityCounts;
    } catch (error) {
      console.error('Error getting service request priority counts:', error);
      return {
        critical: 0,
        high: 0,
        medium: 0,
        low: 0
      };
      }
  }
}