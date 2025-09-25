/**
 * Automated Inventory Management Service
 * Handles automated tracking, alerts, and ordering for medical device supplies
 */

export interface InventoryItem {
  id: string;
  name: string;
  category: 'consumables' | 'parts' | 'accessories' | 'chemicals' | 'cleaning';
  deviceId?: string; // Associated device if applicable
  currentStock: number;
  minThreshold: number;
  maxThreshold: number;
  reorderPoint: number;
  reorderQuantity: number;
  unit: string; // e.g., 'pieces', 'ml', 'kg'
  cost: number;
  supplier: string;
  supplierPartNumber?: string;
  lastRestocked: string;
  expiryDate?: string;
  lotNumber?: string;
  status: 'in_stock' | 'low_stock' | 'out_of_stock' | 'expired' | 'on_order';
  autoReorder: boolean;
  usageRate: number; // items per day average
  tags: string[];
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplier: string;
  status: 'draft' | 'sent' | 'acknowledged' | 'shipped' | 'delivered' | 'cancelled';
  items: PurchaseOrderItem[];
  totalCost: number;
  orderDate: string;
  expectedDelivery?: string;
  actualDelivery?: string;
  notes?: string;
}

export interface PurchaseOrderItem {
  itemId: string;
  itemName: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  supplierPartNumber?: string;
}

export interface InventoryAlert {
  id: string;
  type: 'low_stock' | 'out_of_stock' | 'expiring_soon' | 'expired' | 'reorder_suggested';
  itemId: string;
  itemName: string;
  message: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  createdAt: string;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}

export interface UsageHistory {
  id: string;
  itemId: string;
  quantity: number;
  usedBy: string;
  usedFor: string; // maintenance, cleaning, calibration, etc.
  deviceId?: string;
  timestamp: string;
  notes?: string;
}

export class InventoryManagementService {
  private static inventory: InventoryItem[] = [
    {
      id: 'inv_001',
      name: 'OCT Calibration Solution',
      category: 'chemicals',
      deviceId: 'device_001',
      currentStock: 5,
      minThreshold: 3,
      maxThreshold: 20,
      reorderPoint: 5,
      reorderQuantity: 10,
      unit: 'bottles',
      cost: 89.99,
      supplier: 'ZEISS Medical Supplies',
      supplierPartNumber: 'ZS-CAL-001',
      lastRestocked: '2024-10-15',
      expiryDate: '2025-10-15',
      lotNumber: 'LOT-2024-Q3-001',
      status: 'in_stock',
      autoReorder: true,
      usageRate: 0.5,
      tags: ['calibration', 'oct', 'monthly']
    },
    {
      id: 'inv_002',
      name: 'Lens Cleaning Wipes',
      category: 'cleaning',
      currentStock: 12,
      minThreshold: 20,
      maxThreshold: 100,
      reorderPoint: 25,
      reorderQuantity: 50,
      unit: 'packs',
      cost: 15.50,
      supplier: 'MedClean Supply Co.',
      supplierPartNumber: 'MC-WIPES-100',
      lastRestocked: '2024-11-01',
      status: 'low_stock',
      autoReorder: true,
      usageRate: 2.5,
      tags: ['cleaning', 'maintenance', 'daily']
    },
    {
      id: 'inv_003',
      name: 'Fundus Camera Filter Set',
      category: 'parts',
      deviceId: 'device_002',
      currentStock: 0,
      minThreshold: 1,
      maxThreshold: 5,
      reorderPoint: 2,
      reorderQuantity: 3,
      unit: 'sets',
      cost: 450.00,
      supplier: 'Topcon Healthcare',
      supplierPartNumber: 'TC-FILTER-SET-A',
      lastRestocked: '2024-06-15',
      status: 'out_of_stock',
      autoReorder: true,
      usageRate: 0.1,
      tags: ['filters', 'fundus', 'replacement']
    },
    {
      id: 'inv_004',
      name: 'Disinfectant Solution',
      category: 'chemicals',
      currentStock: 8,
      minThreshold: 5,
      maxThreshold: 30,
      reorderPoint: 8,
      reorderQuantity: 15,
      unit: 'liters',
      cost: 25.99,
      supplier: 'Healthcare Chemicals Inc.',
      supplierPartNumber: 'HCI-DISINFECT-1L',
      lastRestocked: '2024-09-20',
      expiryDate: '2024-12-15',
      lotNumber: 'LOT-2024-Q2-078',
      status: 'in_stock',
      autoReorder: true,
      usageRate: 1.2,
      tags: ['disinfection', 'cleaning', 'daily']
    },
    {
      id: 'inv_005',
      name: 'Printer Paper (A4)',
      category: 'consumables',
      currentStock: 25,
      minThreshold: 10,
      maxThreshold: 100,
      reorderPoint: 15,
      reorderQuantity: 50,
      unit: 'reams',
      cost: 8.99,
      supplier: 'Office Supplies Direct',
      supplierPartNumber: 'OSD-A4-PAPER-500',
      lastRestocked: '2024-11-10',
      status: 'in_stock',
      autoReorder: true,
      usageRate: 3.0,
      tags: ['paper', 'printing', 'reports']
    }
  ];

  private static purchaseOrders: PurchaseOrder[] = [
    {
      id: 'po_001',
      orderNumber: 'PO-2024-001',
      supplier: 'ZEISS Medical Supplies',
      status: 'delivered',
      items: [
        {
          itemId: 'inv_001',
          itemName: 'OCT Calibration Solution',
          quantity: 10,
          unitCost: 89.99,
          totalCost: 899.90,
          supplierPartNumber: 'ZS-CAL-001'
        }
      ],
      totalCost: 899.90,
      orderDate: '2024-10-10',
      expectedDelivery: '2024-10-15',
      actualDelivery: '2024-10-15',
      notes: 'Routine monthly calibration supplies'
    },
    {
      id: 'po_002',
      orderNumber: 'PO-2024-002',
      supplier: 'Topcon Healthcare',
      status: 'sent',
      items: [
        {
          itemId: 'inv_003',
          itemName: 'Fundus Camera Filter Set',
          quantity: 3,
          unitCost: 450.00,
          totalCost: 1350.00,
          supplierPartNumber: 'TC-FILTER-SET-A'
        }
      ],
      totalCost: 1350.00,
      orderDate: '2024-11-20',
      expectedDelivery: '2024-12-05',
      notes: 'Urgent replacement for device maintenance'
    }
  ];

  private static alerts: InventoryAlert[] = [
    {
      id: 'alert_001',
      type: 'low_stock',
      itemId: 'inv_002',
      itemName: 'Lens Cleaning Wipes',
      message: 'Stock level (12 packs) is below minimum threshold (20 packs)',
      severity: 'medium',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      acknowledged: false
    },
    {
      id: 'alert_002',
      type: 'out_of_stock',
      itemId: 'inv_003',
      itemName: 'Fundus Camera Filter Set',
      message: 'Item is completely out of stock. Maintenance may be impacted.',
      severity: 'critical',
      createdAt: new Date(Date.now() - 7200000).toISOString(),
      acknowledged: false
    },
    {
      id: 'alert_003',
      type: 'expiring_soon',
      itemId: 'inv_004',
      itemName: 'Disinfectant Solution',
      message: 'Items will expire in 30 days (2024-12-15)',
      severity: 'low',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      acknowledged: true,
      acknowledgedBy: 'user@example.com',
      acknowledgedAt: new Date(Date.now() - 900000).toISOString()
    }
  ];

  private static usageHistory: UsageHistory[] = [
    {
      id: 'usage_001',
      itemId: 'inv_002',
      quantity: 2,
      usedBy: 'tech@example.com',
      usedFor: 'Daily equipment cleaning',
      deviceId: 'device_001',
      timestamp: new Date(Date.now() - 86400000).toISOString(),
      notes: 'Routine maintenance'
    },
    {
      id: 'usage_002',
      itemId: 'inv_001',
      quantity: 1,
      usedBy: 'admin@example.com',
      usedFor: 'Monthly calibration',
      deviceId: 'device_001',
      timestamp: new Date(Date.now() - 172800000).toISOString(),
      notes: 'Scheduled calibration procedure'
    }
  ];

  // Inventory Management Methods
  static async getInventory(filters?: {
    category?: string;
    status?: string;
    lowStock?: boolean;
  }): Promise<InventoryItem[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    let filtered = [...this.inventory];
    
    if (filters?.category) {
      filtered = filtered.filter(item => item.category === filters.category);
    }
    
    if (filters?.status) {
      filtered = filtered.filter(item => item.status === filters.status);
    }
    
    if (filters?.lowStock) {
      filtered = filtered.filter(item => 
        item.currentStock <= item.reorderPoint || item.status === 'low_stock'
      );
    }
    
    return filtered;
  }

  static async updateStock(itemId: string, quantity: number, operation: 'add' | 'subtract', notes?: string): Promise<{
    success: boolean;
    message: string;
    newStock?: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const item = this.inventory.find(i => i.id === itemId);
    if (!item) {
      return { success: false, message: 'Item not found' };
    }
    
    const oldStock = item.currentStock;
    
    if (operation === 'add') {
      item.currentStock += quantity;
      if (notes === 'restock') {
        item.lastRestocked = new Date().toISOString().split('T')[0];
      }
    } else {
      if (item.currentStock < quantity) {
        return { success: false, message: 'Insufficient stock' };
      }
      item.currentStock -= quantity;
    }
    
    // Update status based on new stock level
    this.updateItemStatus(item);
    
    // Record usage if subtracting
    if (operation === 'subtract') {
      this.usageHistory.push({
        id: `usage_${Date.now()}`,
        itemId,
        quantity,
        usedBy: 'current_user@example.com', // Would be actual user
        usedFor: notes || 'Manual adjustment',
        timestamp: new Date().toISOString()
      });
    }
    
    return {
      success: true,
      message: `Stock updated from ${oldStock} to ${item.currentStock}`,
      newStock: item.currentStock
    };
  }

  private static updateItemStatus(item: InventoryItem): void {
    if (item.currentStock === 0) {
      item.status = 'out_of_stock';
    } else if (item.currentStock <= item.reorderPoint) {
      item.status = 'low_stock';
    } else {
      item.status = 'in_stock';
    }
    
    // Check expiry
    if (item.expiryDate) {
      const expiryDate = new Date(item.expiryDate);
      const now = new Date();
      if (expiryDate < now) {
        item.status = 'expired';
      }
    }
  }

  // Purchase Order Management
  static async getPurchaseOrders(status?: string): Promise<PurchaseOrder[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (status) {
      return this.purchaseOrders.filter(po => po.status === status);
    }
    
    return [...this.purchaseOrders];
  }

  static async createPurchaseOrder(items: { itemId: string; quantity: number }[]): Promise<{
    success: boolean;
    message: string;
    purchaseOrder?: PurchaseOrder;
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (items.length === 0) {
      return { success: false, message: 'No items specified' };
    }
    
    const orderItems: PurchaseOrderItem[] = [];
    let totalCost = 0;
    let supplier = '';
    
    for (const orderItem of items) {
      const inventoryItem = this.inventory.find(i => i.id === orderItem.itemId);
      if (!inventoryItem) {
        return { success: false, message: `Item ${orderItem.itemId} not found` };
      }
      
      // For simplicity, assume all items from same supplier for this demo
      if (!supplier) supplier = inventoryItem.supplier;
      
      const itemTotal = inventoryItem.cost * orderItem.quantity;
      totalCost += itemTotal;
      
      orderItems.push({
        itemId: orderItem.itemId,
        itemName: inventoryItem.name,
        quantity: orderItem.quantity,
        unitCost: inventoryItem.cost,
        totalCost: itemTotal,
        supplierPartNumber: inventoryItem.supplierPartNumber
      });
    }
    
    const purchaseOrder: PurchaseOrder = {
      id: `po_${Date.now()}`,
      orderNumber: `PO-2024-${String(this.purchaseOrders.length + 1).padStart(3, '0')}`,
      supplier,
      status: 'draft',
      items: orderItems,
      totalCost,
      orderDate: new Date().toISOString().split('T')[0]
    };
    
    this.purchaseOrders.push(purchaseOrder);
    
    return {
      success: true,
      message: 'Purchase order created successfully',
      purchaseOrder
    };
  }

  // Alert Management
  static async getAlerts(acknowledged?: boolean): Promise<InventoryAlert[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    let filtered = [...this.alerts];
    
    if (acknowledged !== undefined) {
      filtered = filtered.filter(alert => alert.acknowledged === acknowledged);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  static async acknowledgeAlert(alertId: string, userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    await new Promise(resolve => setTimeout(resolve, 200));
    
    const alert = this.alerts.find(a => a.id === alertId);
    if (!alert) {
      return { success: false, message: 'Alert not found' };
    }
    
    alert.acknowledged = true;
    alert.acknowledgedBy = userId;
    alert.acknowledgedAt = new Date().toISOString();
    
    return { success: true, message: 'Alert acknowledged' };
  }

  // Usage History
  static async getUsageHistory(itemId?: string, days = 30): Promise<UsageHistory[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const cutoffDate = new Date(Date.now() - (days * 24 * 60 * 60 * 1000));
    
    let filtered = this.usageHistory.filter(usage => 
      new Date(usage.timestamp) >= cutoffDate
    );
    
    if (itemId) {
      filtered = filtered.filter(usage => usage.itemId === itemId);
    }
    
    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Automated Functions
  static async runAutomatedReorderCheck(): Promise<{
    itemsToReorder: InventoryItem[];
    ordersCreated: number;
    alerts: InventoryAlert[];
  }> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const itemsToReorder: InventoryItem[] = [];
    const newAlerts: InventoryAlert[] = [];
    let ordersCreated = 0;
    
    for (const item of this.inventory) {
      // Check if item needs reordering
      if (item.autoReorder && item.currentStock <= item.reorderPoint && item.status !== 'on_order') {
        itemsToReorder.push(item);
        
        // Auto-create purchase order
        const result = await this.createPurchaseOrder([{
          itemId: item.id,
          quantity: item.reorderQuantity
        }]);
        
        if (result.success) {
          ordersCreated++;
          item.status = 'on_order';
        }
      }
      
      // Generate alerts for various conditions
      if (item.currentStock <= item.minThreshold && !this.alerts.some(a => a.itemId === item.id && a.type === 'low_stock' && !a.acknowledged)) {
        newAlerts.push({
          id: `alert_${Date.now()}_${item.id}`,
          type: 'low_stock',
          itemId: item.id,
          itemName: item.name,
          message: `Stock level (${item.currentStock} ${item.unit}) is below minimum threshold (${item.minThreshold} ${item.unit})`,
          severity: item.currentStock === 0 ? 'critical' : 'medium',
          createdAt: new Date().toISOString(),
          acknowledged: false
        });
      }
      
      // Check expiry
      if (item.expiryDate) {
        const expiryDate = new Date(item.expiryDate);
        const now = new Date();
        const daysUntilExpiry = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysUntilExpiry <= 30 && daysUntilExpiry > 0 && !this.alerts.some(a => a.itemId === item.id && a.type === 'expiring_soon' && !a.acknowledged)) {
          newAlerts.push({
            id: `alert_${Date.now()}_exp_${item.id}`,
            type: 'expiring_soon',
            itemId: item.id,
            itemName: item.name,
            message: `Items will expire in ${daysUntilExpiry} days (${item.expiryDate})`,
            severity: daysUntilExpiry <= 7 ? 'high' : 'low',
            createdAt: new Date().toISOString(),
            acknowledged: false
          });
        }
      }
    }
    
    // Add new alerts to the system
    this.alerts.push(...newAlerts);
    
    return {
      itemsToReorder,
      ordersCreated,
      alerts: newAlerts
    };
  }
}