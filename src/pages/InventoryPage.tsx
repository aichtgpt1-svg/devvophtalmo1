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
  Package, 
  AlertTriangle, 
  TrendingUp, 
  ShoppingCart, 
  Plus,
  Minus,
  RefreshCw,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Truck,
  CheckCircle,
  XCircle,
  Clock,
  Eye,
  Bell,
  BellOff
} from 'lucide-react';
import {
  InventoryManagementService,
  InventoryItem,
  PurchaseOrder,
  InventoryAlert,
  UsageHistory
} from '@/services/inventory-management';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [alerts, setAlerts] = useState<InventoryAlert[]>([]);
  const [usageHistory, setUsageHistory] = useState<UsageHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, [selectedCategory, showLowStock]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      const filters: any = {};
      if (selectedCategory !== 'all') filters.category = selectedCategory;
      if (showLowStock) filters.lowStock = true;
      
      const [inventoryData, ordersData, alertsData, historyData] = await Promise.all([
        InventoryManagementService.getInventory(filters),
        InventoryManagementService.getPurchaseOrders(),
        InventoryManagementService.getAlerts(false), // Only unacknowledged
        InventoryManagementService.getUsageHistory()
      ]);
      
      setInventory(inventoryData);
      setPurchaseOrders(ordersData);
      setAlerts(alertsData);
      setUsageHistory(historyData);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load inventory data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStockUpdate = async (itemId: string, quantity: number, operation: 'add' | 'subtract', notes?: string) => {
    try {
      const result = await InventoryManagementService.updateStock(itemId, quantity, operation, notes);
      
      if (result.success) {
        toast({
          title: "Stock Updated",
          description: result.message
        });
        await loadData();
      } else {
        toast({
          title: "Update Failed",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update stock",
        variant: "destructive"
      });
    }
  };

  const handleRunAutomatedCheck = async () => {
    try {
      const result = await InventoryManagementService.runAutomatedReorderCheck();
      
      toast({
        title: "Automated Check Complete",
        description: `${result.ordersCreated} orders created, ${result.alerts.length} new alerts`
      });
      
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to run automated check",
        variant: "destructive"
      });
    }
  };

  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const result = await InventoryManagementService.acknowledgeAlert(alertId, 'current_user@example.com');
      
      if (result.success) {
        toast({
          title: "Alert Acknowledged",
          description: result.message
        });
        await loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to acknowledge alert",
        variant: "destructive"
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'in_stock': return 'bg-green-500';
      case 'low_stock': return 'bg-yellow-500';
      case 'out_of_stock': return 'bg-red-500';
      case 'expired': return 'bg-gray-500';
      case 'on_order': return 'bg-blue-500';
      default: return 'bg-gray-400';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-500';
      case 'medium': return 'bg-yellow-500';
      case 'high': return 'bg-orange-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-400';
    }
  };

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.supplier.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const lowStockCount = inventory.filter(item => 
    item.status === 'low_stock' || item.status === 'out_of_stock'
  ).length;

  const totalValue = inventory.reduce((sum, item) => sum + (item.currentStock * item.cost), 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
            <p className="text-muted-foreground">Automated inventory tracking and management</p>
          </div>
        </div>
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
          <h1 className="text-3xl font-bold tracking-tight">Inventory Management</h1>
          <p className="text-muted-foreground">Automated inventory tracking and management</p>
        </div>
        
        <div className="flex gap-2">
          <Button onClick={handleRunAutomatedCheck} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Run Auto Check
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inventory.length}</div>
            <p className="text-xs text-muted-foreground">
              Across {new Set(inventory.map(i => i.category)).size} categories
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{lowStockCount}</div>
            <p className="text-xs text-muted-foreground">
              {alerts.length} total alerts
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Value</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Current inventory value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {purchaseOrders.filter(po => po.status !== 'delivered' && po.status !== 'cancelled').length}
            </div>
            <p className="text-xs text-muted-foreground">
              {purchaseOrders.length} total orders
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="inventory" className="space-y-4">
        <TabsList>
          <TabsTrigger value="inventory">Inventory</TabsTrigger>
          <TabsTrigger value="alerts">
            Alerts
            {alerts.length > 0 && (
              <Badge className="ml-2 h-5 px-1.5 text-xs bg-red-500">
                {alerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="orders">Purchase Orders</TabsTrigger>
          <TabsTrigger value="usage">Usage History</TabsTrigger>
        </TabsList>

        <TabsContent value="inventory" className="space-y-4">
          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center space-x-2">
              <Search className="h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search inventory..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
            
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="consumables">Consumables</SelectItem>
                <SelectItem value="parts">Parts</SelectItem>
                <SelectItem value="accessories">Accessories</SelectItem>
                <SelectItem value="chemicals">Chemicals</SelectItem>
                <SelectItem value="cleaning">Cleaning</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant={showLowStock ? "default" : "outline"}
              onClick={() => setShowLowStock(!showLowStock)}
            >
              <Filter className="h-4 w-4 mr-2" />
              Low Stock Only
            </Button>
          </div>

          {/* Inventory Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredInventory.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg truncate">{item.name}</CardTitle>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status.replace('_', ' ')}
                    </Badge>
                  </div>
                  <CardDescription>
                    {item.supplier} • {item.category}
                  </CardDescription>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Current Stock:</span>
                      <div className="font-semibold">{item.currentStock} {item.unit}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Min Threshold:</span>
                      <div className="font-semibold">{item.minThreshold} {item.unit}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Unit Cost:</span>
                      <div className="font-semibold">${item.cost}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total Value:</span>
                      <div className="font-semibold">${(item.currentStock * item.cost).toFixed(2)}</div>
                    </div>
                  </div>
                  
                  {item.expiryDate && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Expires:</span>
                      <div className="font-semibold">{item.expiryDate}</div>
                    </div>
                  )}
                  
                  <div className="flex gap-2">
                    <StockUpdateDialog
                      item={item}
                      onUpdate={handleStockUpdate}
                    />
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="alerts" className="space-y-4">
          {alerts.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <CheckCircle className="h-12 w-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Active Alerts</h3>
                <p className="text-muted-foreground text-center">
                  All inventory items are within normal parameters
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {alerts.map((alert) => (
                <Card key={alert.id} className="border-l-4 border-l-red-500">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center space-x-4">
                      <div className={`w-2 h-2 rounded-full ${getSeverityColor(alert.severity)}`} />
                      <div>
                        <h4 className="font-semibold text-sm">{alert.itemName}</h4>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(alert.createdAt).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getSeverityColor(alert.severity)}>
                        {alert.severity}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        <BellOff className="h-3 w-3 mr-1" />
                        Acknowledge
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4">
            {purchaseOrders.map((order) => (
              <Card key={order.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>{order.orderNumber}</CardTitle>
                      <CardDescription>{order.supplier}</CardDescription>
                    </div>
                    <Badge className={order.status === 'delivered' ? 'bg-green-500' : 'bg-blue-500'}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
                    <div>
                      <span className="text-muted-foreground">Order Date:</span>
                      <div className="font-semibold">{order.orderDate}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Expected:</span>
                      <div className="font-semibold">{order.expectedDelivery || 'TBD'}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Items:</span>
                      <div className="font-semibold">{order.items.length}</div>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Total:</span>
                      <div className="font-semibold">${order.totalCost.toFixed(2)}</div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {order.items.map((item, index) => (
                      <div key={index} className="flex justify-between items-center text-sm bg-gray-50 p-2 rounded">
                        <span>{item.itemName} (x{item.quantity})</span>
                        <span className="font-semibold">${item.totalCost.toFixed(2)}</span>
                      </div>
                    ))}
                  </div>
                  
                  {order.notes && (
                    <div className="mt-4 text-sm">
                      <span className="text-muted-foreground">Notes:</span>
                      <p className="mt-1">{order.notes}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="usage" className="space-y-4">
          <div className="space-y-4">
            {usageHistory.map((usage) => (
              <Card key={usage.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                    <div>
                      <h4 className="font-semibold text-sm">
                        {inventory.find(i => i.id === usage.itemId)?.name || 'Unknown Item'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {usage.quantity} units used for {usage.usedFor}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(usage.timestamp).toLocaleString()} by {usage.usedBy}
                      </p>
                    </div>
                  </div>
                  {usage.notes && (
                    <Badge variant="outline">{usage.notes}</Badge>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

// Stock Update Dialog Component
function StockUpdateDialog({ 
  item, 
  onUpdate 
}: { 
  item: InventoryItem; 
  onUpdate: (itemId: string, quantity: number, operation: 'add' | 'subtract', notes?: string) => void;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [operation, setOperation] = useState<'add' | 'subtract'>('add');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdate(item.id, quantity, operation, notes);
    setIsOpen(false);
    setQuantity(1);
    setNotes('');
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="flex-1">
          <Package className="h-3 w-3 mr-1" />
          Update Stock
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Stock - {item.name}</DialogTitle>
          <DialogDescription>
            Current stock: {item.currentStock} {item.unit}
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Operation</Label>
              <Select value={operation} onValueChange={(value: 'add' | 'subtract') => setOperation(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="add">Add Stock</SelectItem>
                  <SelectItem value="subtract">Remove Stock</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label>Quantity</Label>
              <Input
                type="number"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Notes (Optional)</Label>
            <Input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Reason for stock update..."
            />
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              {operation === 'add' ? <Plus className="h-4 w-4 mr-2" /> : <Minus className="h-4 w-4 mr-2" />}
              Update Stock
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}