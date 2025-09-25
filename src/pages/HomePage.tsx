import { Link } from 'react-router-dom';
import { useAuthStore } from '@/store/auth-store';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Eye, 
  Shield, 
  Database, 
  Mail, 
  Activity, 
  Users, 
  Settings, 
  BarChart3,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

export default function HomePage() {
  const { isAuthenticated } = useAuthStore();

  const features = [
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Email OTP verification with session management',
      status: 'integrated'
    },
    {
      icon: Database,
      title: 'Data Management',
      description: 'Device inventory, maintenance records, service requests',
      status: 'integrated'
    },
    {
      icon: Mail,
      title: 'Email Notifications',
      description: 'Automated alerts, reports, and maintenance reminders',
      status: 'integrated'
    },
    {
      icon: Activity,
      title: 'Real-time Monitoring',
      description: 'Device status tracking and performance metrics',
      status: 'coming-soon'
    },
    {
      icon: Users,
      title: 'Role-based Access',
      description: 'Admin and user roles with permission management',
      status: 'coming-soon'
    },
    {
      icon: BarChart3,
      title: 'Advanced Analytics',
      description: 'Maintenance trends, cost analysis, and reporting',
      status: 'coming-soon'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-accent/20 to-secondary/30">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 bg-primary rounded-2xl flex items-center justify-center shadow-lg">
              <Eye className="w-10 h-10 text-primary-foreground" />
            </div>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
            OphthalmoTech
          </h1>
          
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Advanced Medical Device Management System for Ophthalmology Equipment
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/dashboard">
                  Go to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="text-lg px-8">
                <Link to="/auth/login">
                  Sign In to Dashboard
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
              </Button>
            )}
            
            <Button variant="outline" size="lg" className="text-lg px-8">
              View Demo
            </Button>
          </div>
        </div>

        {/* SDK Integration Status */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">SDK Integration Status</h2>
            <p className="text-muted-foreground">Core Devv SDK features integrated and ready</p>
          </div>
          
          <div className="flex flex-wrap justify-center gap-4 mb-8">
            <Badge variant="default" className="px-4 py-2 text-sm">
              <Shield className="w-4 h-4 mr-2" />
              Authentication ✓
            </Badge>
            <Badge variant="default" className="px-4 py-2 text-sm">
              <Database className="w-4 h-4 mr-2" />
              Database ✓
            </Badge>
            <Badge variant="default" className="px-4 py-2 text-sm">
              <Mail className="w-4 h-4 mr-2" />
              Email Service ✓
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Authentication
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  Email OTP verification, session management, secure login/logout
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Database
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  4 tables: devices, maintenance records, service requests, user profiles
                </p>
              </CardContent>
            </Card>
            
            <Card className="border-green-200 bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-green-800 flex items-center">
                  <CheckCircle2 className="w-5 h-5 mr-2" />
                  Email Service
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-green-700">
                  Maintenance alerts, service notifications, automated reports
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-primary mb-4">
              Comprehensive Device Management
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built specifically for ophthalmology practices with medical-grade reliability and professional interfaces
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="border-0 shadow-lg bg-white/80 backdrop-blur-sm hover:shadow-xl transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <Badge variant={feature.status === 'integrated' ? 'default' : 'secondary'}>
                        {feature.status === 'integrated' ? 'Ready' : 'Coming Soon'}
                      </Badge>
                    </div>
                    <CardTitle className="text-xl">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Device Types */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-primary mb-2">Supported Equipment</h2>
            <p className="text-muted-foreground">Comprehensive support for all major ophthalmology devices</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
            {[
              'OCT',
              'Fundus Camera',
              'Visual Field',
              'Tonometer',
              'Slit Lamp',
              'Autorefractor',
              'Keratometer'
            ].map((device) => (
              <Card key={device} className="text-center p-4 bg-white/60 backdrop-blur-sm">
                <CardContent className="p-0">
                  <Settings className="w-8 h-8 mx-auto mb-2 text-primary" />
                  <p className="text-sm font-medium">{device}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="border-0 shadow-xl bg-primary text-primary-foreground max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-2xl">Ready to Get Started?</CardTitle>
              <CardDescription className="text-primary-foreground/80">
                Experience professional medical device management with integrated SDK features
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isAuthenticated ? (
                <Button asChild variant="secondary" size="lg" className="text-lg px-8">
                  <Link to="/dashboard">
                    Access Dashboard
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              ) : (
                <Button asChild variant="secondary" size="lg" className="text-lg px-8">
                  <Link to="/auth/login">
                    Sign In Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Link>
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Footer */}
      <footer className="bg-white/80 backdrop-blur-sm border-t border-border">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-muted-foreground">
            <p>© 2024 OphthalmoTech - Medical Device Management System</p>
            <p className="text-sm mt-2">Powered by Devv SDK for Authentication, Database, and Email Services</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 