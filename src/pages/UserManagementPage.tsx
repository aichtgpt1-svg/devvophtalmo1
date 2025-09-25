import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/auth-store';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import {
  Users,
  UserPlus,
  Shield,
  Settings,
  Eye,
  CheckCircle,
  X,
  AlertTriangle,
  Crown,
  UserCheck,
  Clock,
  Activity,
  Lock,
  Unlock
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface UserProfile {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  department?: string;
  status: 'active' | 'inactive' | 'pending' | 'suspended';
  lastLogin?: string;
  createdAt: string;
  permissions: Permission[];
  sessionExpiry?: string;
  failedLoginAttempts?: number;
}

interface UserRole {
  id: string;
  name: string;
  description: string;
  level: number; // 1=Admin, 2=Manager, 3=Technician, 4=User, 5=ReadOnly
  permissions: Permission[];
  isSystem: boolean;
}

interface Permission {
  id: string;
  name: string;
  description: string;
  category: 'devices' | 'maintenance' | 'reports' | 'users' | 'system' | 'compliance';
  actions: ('create' | 'read' | 'update' | 'delete' | 'approve')[];
}

interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  timestamp: string;
  ipAddress?: string;
  userAgent?: string;
  success: boolean;
}

const SYSTEM_ROLES: UserRole[] = [
  {
    id: 'admin',
    name: 'System Administrator',
    description: 'Full system access with all permissions',
    level: 1,
    isSystem: true,
    permissions: []
  },
  {
    id: 'clinical-manager',
    name: 'Clinical Manager',
    description: 'Manage devices, maintenance, and clinical operations',
    level: 2,
    isSystem: true,
    permissions: []
  },
  {
    id: 'technician',
    name: 'Medical Technician',
    description: 'Operate devices and perform basic maintenance',
    level: 3,
    isSystem: true,
    permissions: []
  },
  {
    id: 'viewer',
    name: 'Read-Only User',
    description: 'View-only access to reports and device status',
    level: 5,
    isSystem: true,
    permissions: []
  }
];

const AVAILABLE_PERMISSIONS: Permission[] = [
  {
    id: 'devices-create',
    name: 'Create Devices',
    description: 'Add new medical devices to inventory',
    category: 'devices',
    actions: ['create']
  },
  {
    id: 'devices-manage',
    name: 'Manage Devices',
    description: 'Full device management including editing and deletion',
    category: 'devices',
    actions: ['read', 'update', 'delete']
  },
  {
    id: 'maintenance-schedule',
    name: 'Schedule Maintenance',
    description: 'Create and modify maintenance schedules',
    category: 'maintenance',
    actions: ['create', 'update']
  },
  {
    id: 'maintenance-approve',
    name: 'Approve Maintenance',
    description: 'Approve completed maintenance work',
    category: 'maintenance',
    actions: ['approve']
  },
  {
    id: 'reports-generate',
    name: 'Generate Reports',
    description: 'Create and export system reports',
    category: 'reports',
    actions: ['create', 'read']
  },
  {
    id: 'reports-sensitive',
    name: 'Access Sensitive Reports',
    description: 'View financial and compliance reports',
    category: 'reports',
    actions: ['read']
  },
  {
    id: 'users-manage',
    name: 'Manage Users',
    description: 'Create, edit, and deactivate user accounts',
    category: 'users',
    actions: ['create', 'read', 'update', 'delete']
  },
  {
    id: 'compliance-manage',
    name: 'Manage Compliance',
    description: 'Access compliance reports and audit functions',
    category: 'compliance',
    actions: ['read', 'update']
  },
  {
    id: 'system-admin',
    name: 'System Administration',
    description: 'Configure system settings and security',
    category: 'system',
    actions: ['create', 'read', 'update', 'delete']
  }
];

export default function UserManagementPage() {
  const { user } = useAuthStore();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [roles, setRoles] = useState<UserRole[]>(SYSTEM_ROLES);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'audit'>('users');

  // Form states
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    role: '',
    department: '',
    permissions: [] as string[]
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      // Simulate loading user data
      const mockUsers: UserProfile[] = [
        {
          id: user.uid || 'user-1',
          email: user.email || 'admin@example.com',
          name: 'System Administrator',
          role: SYSTEM_ROLES[0],
          department: 'IT',
          status: 'active',
          lastLogin: new Date().toISOString(),
          createdAt: '2024-01-01T00:00:00Z',
          permissions: AVAILABLE_PERMISSIONS,
          failedLoginAttempts: 0
        },
        {
          id: 'user-2',
          email: 'clinical.manager@hospital.com',
          name: 'Dr. Sarah Johnson',
          role: SYSTEM_ROLES[1],
          department: 'Clinical Operations',
          status: 'active',
          lastLogin: '2024-03-14T10:30:00Z',
          createdAt: '2024-02-15T00:00:00Z',
          permissions: AVAILABLE_PERMISSIONS.filter(p => p.category !== 'system' && p.category !== 'users'),
          failedLoginAttempts: 0
        },
        {
          id: 'user-3',
          email: 'tech1@hospital.com',
          name: 'Mike Rodriguez',
          role: SYSTEM_ROLES[2],
          department: 'Medical Technology',
          status: 'active',
          lastLogin: '2024-03-13T16:45:00Z',
          createdAt: '2024-02-20T00:00:00Z',
          permissions: AVAILABLE_PERMISSIONS.filter(p => 
            p.category === 'devices' || p.category === 'maintenance'
          ).filter(p => !p.actions.includes('delete')),
          failedLoginAttempts: 1
        },
        {
          id: 'user-4',
          email: 'viewer@hospital.com',
          name: 'Jane Smith',
          role: SYSTEM_ROLES[3],
          department: 'Quality Assurance',
          status: 'active',
          lastLogin: '2024-03-12T09:15:00Z',
          createdAt: '2024-03-01T00:00:00Z',
          permissions: AVAILABLE_PERMISSIONS.filter(p => 
            p.actions.includes('read') && !p.actions.includes('create') && !p.actions.includes('update')
          ),
          failedLoginAttempts: 0
        }
      ];

      // Mock audit logs
      const mockAuditLogs: AuditLog[] = [
        {
          id: '1',
          userId: user.uid || 'user-1',
          action: 'LOGIN',
          resource: 'Authentication',
          timestamp: new Date().toISOString(),
          ipAddress: '192.168.1.100',
          success: true
        },
        {
          id: '2',
          userId: 'user-2',
          action: 'CREATE_DEVICE',
          resource: 'OCT Machine Model X',
          timestamp: '2024-03-14T11:00:00Z',
          ipAddress: '192.168.1.101',
          success: true
        },
        {
          id: '3',
          userId: 'user-3',
          action: 'UPDATE_MAINTENANCE',
          resource: 'Fundus Camera Maintenance',
          timestamp: '2024-03-13T17:00:00Z',
          ipAddress: '192.168.1.102',
          success: true
        }
      ];

      setUsers(mockUsers);
      setAuditLogs(mockAuditLogs);
    } catch (error) {
      console.error('Error loading user management data:', error);
      toast({
        title: "Error",
        description: "Failed to load user management data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async () => {
    if (!formData.email || !formData.role) {
      toast({
        title: "Validation Error",
        description: "Email and role are required fields.",
        variant: "destructive",
      });
      return;
    }

    try {
      const selectedRole = roles.find(r => r.id === formData.role);
      if (!selectedRole) return;

      const newUser: UserProfile = {
        id: crypto.randomUUID(),
        email: formData.email,
        name: formData.name || formData.email.split('@')[0],
        role: selectedRole,
        department: formData.department,
        status: 'pending',
        createdAt: new Date().toISOString(),
        permissions: selectedRole.permissions.concat(
          AVAILABLE_PERMISSIONS.filter(p => formData.permissions.includes(p.id))
        ),
        failedLoginAttempts: 0
      };

      setUsers(prev => [...prev, newUser]);
      setIsDialogOpen(false);
      setFormData({ email: '', name: '', role: '', department: '', permissions: [] });

      toast({
        title: "User Created",
        description: `User ${formData.email} has been created successfully.`,
      });
    } catch (error) {
      console.error('Error creating user:', error);
      toast({
        title: "Error",
        description: "Failed to create user. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateUserStatus = async (userId: string, status: UserProfile['status']) => {
    try {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, status } : u
      ));

      toast({
        title: "Status Updated",
        description: `User status has been updated to ${status}.`,
      });
    } catch (error) {
      console.error('Error updating user status:', error);
      toast({
        title: "Error",
        description: "Failed to update user status. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleResetFailedAttempts = async (userId: string) => {
    try {
      setUsers(prev => prev.map(u => 
        u.id === userId ? { ...u, failedLoginAttempts: 0 } : u
      ));

      toast({
        title: "Login Attempts Reset",
        description: "Failed login attempts have been reset for this user.",
      });
    } catch (error) {
      console.error('Error resetting login attempts:', error);
      toast({
        title: "Error",
        description: "Failed to reset login attempts. Please try again.",
        variant: "destructive",
      });
    }
  };

  const getStatusColor = (status: UserProfile['status']) => {
    switch (status) {
      case 'active': return 'default';
      case 'inactive': return 'secondary';
      case 'pending': return 'secondary';
      case 'suspended': return 'destructive';
      default: return 'secondary';
    }
  };

  const getRoleBadgeColor = (level: number) => {
    switch (level) {
      case 1: return 'destructive'; // Admin
      case 2: return 'default'; // Manager
      case 3: return 'secondary'; // Technician
      case 4: return 'outline'; // User
      case 5: return 'outline'; // ReadOnly
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="flex items-center space-x-2">
          <Users className="h-4 w-4 animate-pulse" />
          <span>Loading user management...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-1">Advanced role-based access control and user administration</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge variant="secondary" className="flex items-center space-x-2">
            <Shield className="h-4 w-4" />
            <span>RBAC Enabled</span>
          </Badge>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New User</DialogTitle>
                <DialogDescription>
                  Add a new user to the system with specific roles and permissions.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="user@hospital.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      placeholder="John Doe"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Role *</Label>
                    <Select value={formData.role} onValueChange={(value) => setFormData(prev => ({ ...prev, role: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map((role) => (
                          <SelectItem key={role.id} value={role.id}>
                            {role.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input
                      id="department"
                      value={formData.department}
                      onChange={(e) => setFormData(prev => ({ ...prev, department: e.target.value }))}
                      placeholder="Medical Technology"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Additional Permissions</Label>
                  <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                    {AVAILABLE_PERMISSIONS.map((permission) => (
                      <div key={permission.id} className="flex items-center space-x-2">
                        <Switch
                          checked={formData.permissions.includes(permission.id)}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setFormData(prev => ({ 
                                ...prev, 
                                permissions: [...prev.permissions, permission.id] 
                              }));
                            } else {
                              setFormData(prev => ({ 
                                ...prev, 
                                permissions: prev.permissions.filter(p => p !== permission.id) 
                              }));
                            }
                          }}
                        />
                        <Label className="text-sm">{permission.name}</Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateUser}>
                  Create User
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <Button
          variant={activeTab === 'users' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('users')}
        >
          <Users className="h-4 w-4 mr-2" />
          Users
        </Button>
        <Button
          variant={activeTab === 'roles' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('roles')}
        >
          <Shield className="h-4 w-4 mr-2" />
          Roles
        </Button>
        <Button
          variant={activeTab === 'audit' ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setActiveTab('audit')}
        >
          <Activity className="h-4 w-4 mr-2" />
          Audit Log
        </Button>
      </div>

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Users Summary */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold">{users.length}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-green-600">
                      {users.filter(u => u.status === 'active').length}
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Pending</p>
                    <p className="text-2xl font-bold text-yellow-600">
                      {users.filter(u => u.status === 'pending').length}
                    </p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">Suspended</p>
                    <p className="text-2xl font-bold text-red-600">
                      {users.filter(u => u.status === 'suspended').length}
                    </p>
                  </div>
                  <Lock className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Users List */}
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {users.map((userProfile) => (
                  <div key={userProfile.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Users className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{userProfile.name || userProfile.email}</h4>
                          <p className="text-sm text-gray-600">{userProfile.email}</p>
                          <div className="flex items-center space-x-2 mt-1">
                            <Badge variant={getRoleBadgeColor(userProfile.role.level)}>
                              {userProfile.role.name}
                            </Badge>
                            <Badge variant={getStatusColor(userProfile.status)}>
                              {userProfile.status}
                            </Badge>
                            {userProfile.role.level === 1 && (
                              <Crown className="h-4 w-4 text-yellow-500" />
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="text-right text-sm">
                          <p className="text-gray-600">Department: {userProfile.department || 'Not set'}</p>
                          <p className="text-gray-600">
                            Last login: {userProfile.lastLogin ? 
                              format(parseISO(userProfile.lastLogin), 'MMM dd, HH:mm') : 'Never'}
                          </p>
                          {(userProfile.failedLoginAttempts ?? 0) > 0 && (
                            <p className="text-red-600">
                              Failed attempts: {userProfile.failedLoginAttempts}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col space-y-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelectedUser(userProfile)}
                          >
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          {userProfile.status === 'active' ? (
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleUpdateUserStatus(userProfile.id, 'suspended')}
                            >
                              <Lock className="h-3 w-3 mr-1" />
                              Suspend
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => handleUpdateUserStatus(userProfile.id, 'active')}
                            >
                              <Unlock className="h-3 w-3 mr-1" />
                              Activate
                            </Button>
                          )}
                          {(userProfile.failedLoginAttempts ?? 0) > 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleResetFailedAttempts(userProfile.id)}
                            >
                              Reset
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Permissions Preview */}
                    <div className="mt-3 pt-3 border-t">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Permissions:</span>
                        <span className="text-xs text-gray-500">
                          {userProfile.permissions.length} permission{userProfile.permissions.length === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {userProfile.permissions.slice(0, 6).map((permission) => (
                          <Badge key={permission.id} variant="outline" className="text-xs">
                            {permission.name}
                          </Badge>
                        ))}
                        {userProfile.permissions.length > 6 && (
                          <Badge variant="outline" className="text-xs">
                            +{userProfile.permissions.length - 6} more
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Roles Tab */}
      {activeTab === 'roles' && (
        <Card>
          <CardHeader>
            <CardTitle>System Roles</CardTitle>
            <CardDescription>Predefined roles with specific permission sets</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {roles.map((role) => (
                <div key={role.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium">{role.name}</h4>
                        <Badge variant={getRoleBadgeColor(role.level)}>
                          Level {role.level}
                        </Badge>
                        {role.isSystem && (
                          <Badge variant="outline" className="text-xs">
                            System Role
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{role.description}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Users with this role: {users.filter(u => u.role.id === role.id).length}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        <Settings className="h-3 w-3 mr-1" />
                        Configure
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log Tab */}
      {activeTab === 'audit' && (
        <Card>
          <CardHeader>
            <CardTitle>Audit Log</CardTitle>
            <CardDescription>System access and activity logs</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {auditLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center space-x-3">
                    <div className={`w-2 h-2 rounded-full ${log.success ? 'bg-green-500' : 'bg-red-500'}`} />
                    <div>
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-gray-600">{log.resource}</p>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-500">
                    <p>User: {users.find(u => u.id === log.userId)?.email || 'Unknown'}</p>
                    <p>{format(parseISO(log.timestamp), 'MMM dd, HH:mm:ss')}</p>
                    {log.ipAddress && <p>IP: {log.ipAddress}</p>}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Detail Modal */}
      {selectedUser && (
        <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>User Details: {selectedUser.name || selectedUser.email}</DialogTitle>
              <DialogDescription>
                Detailed view of user permissions and activity
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Email</Label>
                  <p className="font-medium">{selectedUser.email}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge variant={getStatusColor(selectedUser.status)} className="ml-2">
                    {selectedUser.status}
                  </Badge>
                </div>
                <div>
                  <Label>Role</Label>
                  <p className="font-medium">{selectedUser.role.name}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="font-medium">{selectedUser.department || 'Not set'}</p>
                </div>
              </div>
              
              <Separator />
              
              <div>
                <Label className="text-base font-medium">Permissions</Label>
                <div className="grid grid-cols-2 gap-2 mt-2 max-h-60 overflow-y-auto">
                  {selectedUser.permissions.map((permission) => (
                    <div key={permission.id} className="flex items-center space-x-2 p-2 border rounded">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-sm font-medium">{permission.name}</p>
                        <p className="text-xs text-gray-600">{permission.description}</p>
                        <div className="flex space-x-1 mt-1">
                          {permission.actions.map((action) => (
                            <Badge key={action} variant="outline" className="text-xs">
                              {action}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}