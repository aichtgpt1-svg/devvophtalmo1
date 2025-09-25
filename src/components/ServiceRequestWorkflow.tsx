import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Clock, 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  MessageSquare, 
  User,
  Calendar
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { DatabaseService, ServiceRequest } from '@/services/database';
import { useAuthStore } from '@/store/auth-store';
import { EmailService } from '@/services/email';

interface ServiceRequestWorkflowProps {
  request: ServiceRequest;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const statusConfig = {
  Open: {
    icon: Clock,
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
    bgColor: 'bg-blue-50',
    next: ['In_Progress', 'Resolved'],
    label: 'Open'
  },
  In_Progress: {
    icon: Play,
    color: 'bg-orange-500',
    textColor: 'text-orange-700',
    bgColor: 'bg-orange-50',
    next: ['Resolved', 'Open'],
    label: 'In Progress'
  },
  Resolved: {
    icon: CheckCircle,
    color: 'bg-green-500',
    textColor: 'text-green-700',
    bgColor: 'bg-green-50',
    next: ['Closed', 'Open'],
    label: 'Resolved'
  },
  Closed: {
    icon: XCircle,
    color: 'bg-gray-500',
    textColor: 'text-gray-700',
    bgColor: 'bg-gray-50',
    next: ['Open'],
    label: 'Closed'
  }
};

export default function ServiceRequestWorkflow({ 
  request, 
  isOpen, 
  onClose, 
  onUpdate 
}: ServiceRequestWorkflowProps) {
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [updateNotes, setUpdateNotes] = useState('');
  const [assignedTechnician, setAssignedTechnician] = useState('');
  const [estimatedCompletion, setEstimatedCompletion] = useState('');
  const [updating, setUpdating] = useState(false);
  const { toast } = useToast();
  const { user } = useAuthStore();

  const currentStatus = request.request_status || 'Open';
  const config = statusConfig[currentStatus as keyof typeof statusConfig] || statusConfig.Open;
  const StatusIcon = config.icon;

  const handleStatusUpdate = async () => {
    if (!selectedStatus) {
      toast({
        title: "Error",
        description: "Please select a new status",
        variant: "destructive"
      });
      return;
    }

    try {
      setUpdating(true);
      
      const updateData: any = {
        request_status: selectedStatus,
        updated_date: new Date().toISOString()
      };

      if (updateNotes) {
        updateData.resolution_notes = updateNotes;
      }

      if (assignedTechnician) {
        updateData.assigned_technician = assignedTechnician;
      }

      if (estimatedCompletion) {
        updateData.estimated_completion = estimatedCompletion;
      }

      if (selectedStatus === 'Resolved' || selectedStatus === 'Closed') {
        updateData.resolved_at = new Date().toISOString();
      }

      await DatabaseService.updateServiceRequest(request._id!, user?.uid || '', updateData);

      // Send email notification for status changes
      try {
        await EmailService.sendServiceRequestNotification(
          'user@example.com', // In a real app, this would be the request creator
          'User',
          {
            requestId: request._id || 'N/A',
            deviceName: request.device_id || 'Unknown Device',
            priority: request.priority || 'Medium',
            description: `Status updated from ${currentStatus} to ${selectedStatus}. ${updateNotes ? 'Notes: ' + updateNotes : ''}`,
            reportedBy: assignedTechnician || 'System'
          }
        );
      } catch (emailError) {
        console.warn('Email notification failed:', emailError);
        // Don't fail the entire operation if email fails
      }

      toast({
        title: "Success",
        description: `Service request status updated to ${selectedStatus}`,
      });

      // Reset form
      setSelectedStatus('');
      setUpdateNotes('');
      setAssignedTechnician('');
      setEstimatedCompletion('');
      
      onUpdate();
      onClose();
    } catch (error) {
      console.error('Error updating service request:', error);
      toast({
        title: "Error",
        description: "Failed to update service request",
        variant: "destructive"
      });
    } finally {
      setUpdating(false);
    }
  };

  const getTimelineItems = () => {
    const items = [
      {
        status: 'Open',
        label: 'Request Created',
        timestamp: request.created_at,
        description: 'Service request submitted'
      }
    ];

    if (currentStatus !== 'Open') {
      items.push({
        status: 'In_Progress',
        label: 'Work Started',
        timestamp: request.updated_at || request.created_at,
        description: 'Technician assigned and work commenced'
      });
    }

    if (currentStatus === 'Resolved' || currentStatus === 'Closed') {
      items.push({
        status: 'Resolved',
        label: 'Issue Resolved',
        timestamp: request.resolved_at || request.updated_at || request.created_at,
        description: 'Service request completed successfully'
      });
    }

    if (currentStatus === 'Closed') {
      items.push({
        status: 'Closed',
        label: 'Request Closed',
        timestamp: request.updated_at || request.created_at,
        description: 'Service request closed and archived'
      });
    }

    return items;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <StatusIcon className={`w-6 h-6 ${config.textColor}`} />
            Service Request Workflow
          </DialogTitle>
          <DialogDescription>
            Manage status, assignments, and track progress for this service request
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Status Overview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Current Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full ${config.color}`}>
                    <StatusIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{config.label}</h3>
                    <p className="text-sm text-muted-foreground">
                      Last updated: {request.updated_at ? 
                        new Date(request.updated_at).toLocaleString() : 
                        'Never'
                      }
                    </p>
                  </div>
                </div>
                <Badge className={config.textColor + ' ' + config.bgColor}>
                  {config.label}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Progress Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {getTimelineItems().map((item, index) => {
                  const itemConfig = statusConfig[item.status as keyof typeof statusConfig];
                  const ItemIcon = itemConfig.icon;
                  const isCompleted = index < getTimelineItems().length - 1 || 
                                    (index === getTimelineItems().length - 1 && currentStatus !== 'Open');
                  
                  return (
                    <div key={item.status} className="flex items-start gap-3">
                      <div className={`p-2 rounded-full ${isCompleted ? itemConfig.color : 'bg-gray-200'}`}>
                        <ItemIcon className={`w-4 h-4 ${isCompleted ? 'text-white' : 'text-gray-400'}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`font-medium ${isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {item.label}
                        </p>
                        <p className={`text-sm ${isCompleted ? 'text-gray-600' : 'text-gray-400'}`}>
                          {item.description}
                        </p>
                        {item.timestamp && (
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(item.timestamp).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Status Update Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Update Status</CardTitle>
              <CardDescription>
                Change the status and add progress notes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">New Status</label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select new status" />
                    </SelectTrigger>
                    <SelectContent>
                      {config.next.map((status) => {
                        const nextConfig = statusConfig[status as keyof typeof statusConfig];
                        return (
                          <SelectItem key={status} value={status}>
                            {nextConfig.label}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Assigned Technician</label>
                  <Select value={assignedTechnician} onValueChange={setAssignedTechnician}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select technician" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="john.smith">John Smith</SelectItem>
                      <SelectItem value="sarah.johnson">Sarah Johnson</SelectItem>
                      <SelectItem value="mike.brown">Mike Brown</SelectItem>
                      <SelectItem value="lisa.davis">Lisa Davis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Estimated Completion</label>
                <input
                  type="datetime-local"
                  value={estimatedCompletion}
                  onChange={(e) => setEstimatedCompletion(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Update Notes</label>
                <Textarea
                  placeholder="Add progress notes, resolution details, or other updates..."
                  value={updateNotes}
                  onChange={(e) => setUpdateNotes(e.target.value)}
                  rows={4}
                />
              </div>

              <div className="flex justify-end gap-3 pt-4">
                <Button variant="outline" onClick={onClose}>
                  Cancel
                </Button>
                <Button 
                  onClick={handleStatusUpdate}
                  disabled={updating || !selectedStatus}
                >
                  {updating ? 'Updating...' : 'Update Status'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}