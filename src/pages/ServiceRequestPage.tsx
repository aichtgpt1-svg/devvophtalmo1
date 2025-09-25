import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, AlertCircle, Clock, CheckCircle, XCircle, Wrench, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService, ServiceRequest as DBServiceRequest, Device, ServiceRequestWithUIStatus, mapServiceRequestStatus } from '@/services/database';
import { useAuthStore } from '@/store/auth-store';
import { EmailService } from '@/services/email';

// Extended service request with UI-specific fields
interface ServiceRequest extends DBServiceRequest {
  device_name?: string; // This will be populated from device data
  // Additional fields for UI compatibility
  title?: string;
  status?: 'open' | 'in_progress' | 'resolved' | 'closed';
  category?: 'hardware' | 'software' | 'calibration' | 'user_error' | 'other';
  created_date?: string;
  updated_date?: string;
  resolved_date?: string;
  estimated_cost?: number;
  actual_cost?: number;
  images?: string[];
  urgency_level?: number; // 1-5 scale
}

interface CreateServiceRequestForm {
  device_id: string;
  title: string;
  description: string;
  priority: 'Critical' | 'High' | 'Medium' | 'Low';
  category: 'Hardware_Failure' | 'Software_Issue' | 'Calibration_Needed' | 'Image_Quality' | 'Connectivity' | 'User_Error';
  urgency_level: number;
}

export default function ServiceRequestPage() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [devices, setDevices] = useState<Device[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [createForm, setCreateForm] = useState<CreateServiceRequestForm>({
    device_id: '',
    title: '',
    description: '',
    priority: 'Medium',
    category: 'Hardware_Failure',
    urgency_level: 3
  });
  const { toast } = useToast();
  const { user } = useAuthStore();

  // Remove the db instance since we're using static methods

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [serviceData, deviceData] = await Promise.all([
        DatabaseService.getServiceRequests(),
        DatabaseService.getDevices()
      ]);
      
      setRequests(serviceData.items || []);
      setDevices(deviceData.items || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load service requests",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createServiceRequest = async () => {
    try {
      if (!createForm.device_id || !createForm.title || !createForm.description) {
        toast({
          title: "Error",
          description: "Please fill in all required fields",
          variant: "destructive"
        });
        return;
      }

      const device = devices.find(d => d._id === createForm.device_id);
      if (!device) return;

      const newRequest: Omit<DBServiceRequest, '_id' | '_uid' | '_tid' | 'created_at' | 'updated_at'> = {
        device_id: createForm.device_id,
        request_status: 'Open',
        priority: createForm.priority,
        issue_type: createForm.category as DBServiceRequest['issue_type'] || 'Hardware_Failure',
        description: createForm.description,
        reported_by: 'Current User', // This would come from auth context
        symptoms: createForm.title
      };

      await DatabaseService.createServiceRequest(newRequest);
      
      // Send notification email for critical/high priority requests
      if (createForm.priority === 'Critical' || createForm.priority === 'High') {
        await EmailService.sendServiceRequestNotification(
          'support@example.com',
          'Support Team',
          {
            requestId: 'REQ-' + Date.now(),
            deviceName: `${device.manufacturer} ${device.model}`,
            priority: createForm.priority,
            description: createForm.description,
            reportedBy: 'Current User'
          }
        );
      }

      await loadData();
      setShowCreateModal(false);
      setCreateForm({
        device_id: '',
        title: '',
        description: '',
        priority: 'Medium',
        category: 'Hardware_Failure',
        urgency_level: 3
      });

      toast({
        title: "Success",
        description: "Service request created successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service request",
        variant: "destructive"
      });
    }
  };

  const updateRequestStatus = async (requestId: string, status: string, resolutionNotes?: string) => {
    try {
      const updateData: any = {
        status,
        updated_date: new Date().toISOString()
      };

      if (status === 'resolved' || status === 'closed') {
        updateData.resolved_date = new Date().toISOString();
        if (resolutionNotes) {
          updateData.resolution_notes = resolutionNotes;
        }
      }

      await DatabaseService.updateServiceRequest(requestId, user?.uid || '', updateData);
      
      // Send status update notification
      const request = requests.find(r => r._id === requestId);
      if (request && status === 'resolved') {
        await EmailService.sendMaintenanceCompletionNotification(
          ['reporter@example.com'],
          {
            deviceName: request.device_name || 'Unknown Device',
            maintenanceType: 'Service Request',
            technicianName: 'Service Team',
            completionDate: new Date().toISOString(),
            status: 'Resolved',
            summary: resolutionNotes || 'Service request resolved successfully'
          }
        );
      }

      await loadData();
      setShowDetailsModal(false);

      toast({
        title: "Success",
        description: "Service request status updated"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service request",
        variant: "destructive"
      });
    }
  };

  const filteredRequests = requests.filter(request => {
    const matchesSearch = (request.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.device_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (request.description || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || request.status === statusFilter;
    const matchesPriority = priorityFilter === 'all' || request.priority === priorityFilter;
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-red-500';
      case 'in_progress': return 'bg-blue-500';
      case 'resolved': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-600 text-white';
      case 'high': return 'bg-orange-500 text-white';
      case 'medium': return 'bg-yellow-500 text-white';
      case 'low': return 'bg-green-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <AlertCircle className="w-4 h-4" />;
      case 'in_progress': return <Wrench className="w-4 h-4" />;
      case 'resolved': return <CheckCircle className="w-4 h-4" />;
      case 'closed': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-medical-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-medical-primary">Service Requests</h1>
          <p className="text-medical-text/70 mt-2">Manage equipment service tickets and repairs</p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Service Request
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-medical-text/70">Open</p>
                <p className="text-2xl font-bold text-medical-primary">
                  {requests.filter(r => r.status === 'open').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Wrench className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-medical-text/70">In Progress</p>
                <p className="text-2xl font-bold text-medical-primary">
                  {requests.filter(r => r.status === 'in_progress').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-medical-text/70">Resolved</p>
                <p className="text-2xl font-bold text-medical-primary">
                  {requests.filter(r => r.status === 'resolved').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 bg-red-100 rounded-lg">
                <AlertCircle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-medical-text/70">Critical</p>
                <p className="text-2xl font-bold text-red-600">
                  {requests.filter(r => r.priority === 'Critical').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-medical-text/50 w-4 h-4" />
            <Input
              placeholder="Search requests..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="low">Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Service Requests List */}
      <Card>
        <CardHeader>
          <CardTitle>Service Requests</CardTitle>
          <CardDescription>
            Track and manage all equipment service requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredRequests.length === 0 ? (
              <div className="text-center py-12">
                <MessageSquare className="w-12 h-12 text-medical-text/30 mx-auto mb-4" />
                <p className="text-medical-text/70">No service requests found</p>
              </div>
            ) : (
              filteredRequests.map((request) => (
                <Card key={request._id} className="hover:shadow-md transition-shadow cursor-pointer"
                      onClick={() => {
                        setSelectedRequest(request);
                        setShowDetailsModal(true);
                      }}>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {request.status && getStatusIcon(request.status)}
                          <h3 className="font-semibold text-medical-primary">{request.title}</h3>
                          <Badge className={`${request.status ? getStatusColor(request.status) : 'bg-gray-500'} text-white`}>
                            {request.status ? request.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                          </Badge>
                          <Badge className={getPriorityColor(request.priority)}>
                            {request.priority.toUpperCase()}
                          </Badge>
                        </div>
                        <div className="text-sm text-medical-text/70 space-y-1">
                          <p><strong>Device:</strong> {request.device_name}</p>
                          <p><strong>Category:</strong> {request.category ? request.category.replace('_', ' ').toUpperCase() : 'UNKNOWN'}</p>
                          <p><strong>Reported:</strong> {request.created_date ? new Date(request.created_date).toLocaleDateString() : 'Not recorded'}</p>
                          <p><strong>Description:</strong> {request.description.substring(0, 100)}...</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <div className="text-right">
                          <p className="text-sm text-medical-text/70">Urgency Level</p>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((level) => (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${
                                  level <= (request.urgency_level || 0) ? 'bg-red-500' : 'bg-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Create Service Request Modal */}
      <Dialog open={showCreateModal} onOpenChange={setShowCreateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Create Service Request</DialogTitle>
            <DialogDescription>
              Report an equipment issue or request service
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="device">Device</Label>
              <Select value={createForm.device_id} onValueChange={(value) => 
                setCreateForm(prev => ({ ...prev, device_id: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select device" />
                </SelectTrigger>
                <SelectContent>
                  {devices.map((device) => (
                    <SelectItem key={device._id} value={device._id || ''}>
                      {device.manufacturer} {device.model}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={createForm.title}
                onChange={(e) => setCreateForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the issue"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="priority">Priority</Label>
                <Select value={createForm.priority} onValueChange={(value: any) => 
                  setCreateForm(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Select value={createForm.category} onValueChange={(value: any) => 
                  setCreateForm(prev => ({ ...prev, category: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hardware">Hardware</SelectItem>
                    <SelectItem value="software">Software</SelectItem>
                    <SelectItem value="calibration">Calibration</SelectItem>
                    <SelectItem value="user_error">User Error</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="urgency">Urgency Level (1-5)</Label>
              <Select value={createForm.urgency_level.toString()} onValueChange={(value) => 
                setCreateForm(prev => ({ ...prev, urgency_level: parseInt(value) }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 - Very Low</SelectItem>
                  <SelectItem value="2">2 - Low</SelectItem>
                  <SelectItem value="3">3 - Medium</SelectItem>
                  <SelectItem value="4">4 - High</SelectItem>
                  <SelectItem value="5">5 - Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={createServiceRequest} className="flex-1">
                Create Request
              </Button>
              <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Service Request Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl">
          {selectedRequest && (
            <>
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {selectedRequest.status && getStatusIcon(selectedRequest.status)}
                  {selectedRequest.title}
                </DialogTitle>
                <DialogDescription>
                  Service Request Details
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm font-medium text-medical-text/70">Device</p>
                    <p className="text-medical-primary">{selectedRequest.device_name}</p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-medical-text/70">Status</p>
                    <Badge className={`${selectedRequest.status ? getStatusColor(selectedRequest.status) : 'bg-gray-500'} text-white`}>
                      {selectedRequest.status ? selectedRequest.status.replace('_', ' ').toUpperCase() : 'UNKNOWN'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-medical-text/70">Priority</p>
                    <Badge className={getPriorityColor(selectedRequest.priority)}>
                      {selectedRequest.priority.toUpperCase()}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-medical-text/70">Category</p>
                    <p>{selectedRequest.category ? selectedRequest.category.replace('_', ' ').toUpperCase() : 'UNKNOWN'}</p>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm font-medium text-medical-text/70 mb-2">Description</p>
                  <p className="text-sm bg-medical-surface p-3 rounded-lg">
                    {selectedRequest.description}
                  </p>
                </div>

                {selectedRequest.resolution_notes && (
                  <div>
                    <p className="text-sm font-medium text-medical-text/70 mb-2">Resolution Notes</p>
                    <p className="text-sm bg-green-50 p-3 rounded-lg border border-green-200">
                      {selectedRequest.resolution_notes}
                    </p>
                  </div>
                )}

                <div className="flex gap-3 pt-4">
                  {selectedRequest.status === 'open' && (
                    <Button 
                      onClick={() => selectedRequest._id && updateRequestStatus(selectedRequest._id, 'in_progress')}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Start Working
                    </Button>
                  )}
                  {selectedRequest.status === 'in_progress' && (
                    <Button 
                      onClick={() => selectedRequest._id && updateRequestStatus(selectedRequest._id, 'resolved', 'Issue resolved successfully')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {selectedRequest.status === 'resolved' && (
                    <Button 
                      onClick={() => selectedRequest._id && updateRequestStatus(selectedRequest._id, 'closed')}
                      variant="outline"
                    >
                      Close Request
                    </Button>
                  )}
                  <Button variant="outline" onClick={() => setShowDetailsModal(false)}>
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}