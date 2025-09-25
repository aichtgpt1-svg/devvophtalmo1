import { useState } from 'react';
import { EmailService } from '@/services/email';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Mail, Send, AlertTriangle, Wrench, Clock, BarChart3 } from 'lucide-react';

export default function EmailDemo() {
  const [isLoading, setIsLoading] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState('');
  const { toast } = useToast();

  const handleSendServiceRequest = async () => {
    if (!recipientEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter a recipient email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await EmailService.sendServiceRequestNotification(
        recipientEmail,
        'Dr. Smith',
        {
          requestId: 'SR-2024-001',
          deviceName: 'Zeiss OCT Cirrus 5000',
          priority: 'High',
          description: 'Device is producing blurry images and showing calibration warnings. Patient examinations are being delayed.',
          reportedBy: 'Nurse Johnson'
        }
      );

      toast({
        title: 'Service request email sent!',
        description: `Notification sent to ${recipientEmail}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to send email',
        description: 'Please check your internet connection and try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMaintenanceReminder = async () => {
    if (!recipientEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter a recipient email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await EmailService.sendMaintenanceReminder(
        recipientEmail,
        'John Technician',
        {
          deviceName: 'Topcon Fundus Camera TRC-50DX',
          manufacturer: 'Topcon',
          model: 'TRC-50DX',
          location: 'Exam Room 3',
          dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
          maintenanceType: 'Preventive'
        }
      );

      toast({
        title: 'Maintenance reminder sent!',
        description: `Reminder sent to ${recipientEmail}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to send email',
        description: 'Please check your internet connection and try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCriticalAlert = async () => {
    if (!recipientEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter a recipient email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await EmailService.sendCriticalAlert(
        [recipientEmail],
        {
          deviceName: 'Humphrey Visual Field Analyzer',
          location: 'Exam Room 1',
          issueType: 'Hardware_Failure',
          description: 'Device has completely shut down and will not power on. Error code E-052 displayed before shutdown. Immediate service required.',
          reportedBy: 'Dr. Martinez',
          timestamp: new Date().toISOString()
        }
      );

      toast({
        title: 'Critical alert sent!',
        description: `Alert sent to ${recipientEmail}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to send email',
        description: 'Please check your internet connection and try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMaintenanceReport = async () => {
    if (!recipientEmail) {
      toast({
        title: 'Email required',
        description: 'Please enter a recipient email address',
        variant: 'destructive'
      });
      return;
    }

    try {
      setIsLoading(true);
      
      await EmailService.sendMaintenanceReport(
        [recipientEmail],
        {
          reportType: 'weekly' as const,
          dateRange: 'Dec 16-22, 2024',
          devicesTotal: 24,
          maintenanceDue: 3,
          serviceRequests: 7,
          criticalIssues: 1
        }
      );

      toast({
        title: 'Maintenance report sent!',
        description: `Weekly report sent to ${recipientEmail}`,
      });
    } catch (error) {
      toast({
        title: 'Failed to send email',
        description: 'Please check your internet connection and try again',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Mail className="w-6 h-6" />
          <span>Email Service Demo</span>
        </CardTitle>
        <CardDescription>
          Test the integrated email service with real email templates for ophthalmology device management
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Email Input */}
        <div className="space-y-2">
          <Label htmlFor="email">Test Email Address</Label>
          <Input
            id="email"
            type="email"
            placeholder="your-email@example.com"
            value={recipientEmail}
            onChange={(e) => setRecipientEmail(e.target.value)}
          />
          <p className="text-sm text-muted-foreground">
            Enter your email address to receive demo notifications
          </p>
        </div>

        {/* Email Templates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Request */}
          <Card className="border-orange-200 bg-orange-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-orange-800 flex items-center text-lg">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Service Request Alert
              </CardTitle>
              <CardDescription>
                High priority equipment issue notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p><strong>Device:</strong> Zeiss OCT Cirrus 5000</p>
                <p><strong>Priority:</strong> <Badge variant="destructive">High</Badge></p>
                <p><strong>Issue:</strong> Blurry images, calibration warnings</p>
              </div>
              <Button 
                onClick={handleSendServiceRequest} 
                disabled={isLoading || !recipientEmail}
                className="w-full"
                variant="outline"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Service Alert
              </Button>
            </CardContent>
          </Card>

          {/* Maintenance Reminder */}
          <Card className="border-yellow-200 bg-yellow-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-yellow-800 flex items-center text-lg">
                <Clock className="w-5 h-5 mr-2" />
                Maintenance Reminder
              </CardTitle>
              <CardDescription>
                Scheduled maintenance due notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p><strong>Device:</strong> Topcon Fundus Camera</p>
                <p><strong>Type:</strong> <Badge variant="secondary">Preventive</Badge></p>
                <p><strong>Due:</strong> In 7 days</p>
              </div>
              <Button 
                onClick={handleSendMaintenanceReminder} 
                disabled={isLoading || !recipientEmail}
                className="w-full"
                variant="outline"
              >
                <Clock className="w-4 h-4 mr-2" />
                Send Reminder
              </Button>
            </CardContent>
          </Card>

          {/* Critical Alert */}
          <Card className="border-red-200 bg-red-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-red-800 flex items-center text-lg">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Critical Alert
              </CardTitle>
              <CardDescription>
                Emergency equipment failure notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p><strong>Device:</strong> Humphrey Visual Field</p>
                <p><strong>Status:</strong> <Badge variant="destructive">Complete Failure</Badge></p>
                <p><strong>Action:</strong> Immediate service required</p>
              </div>
              <Button 
                onClick={handleSendCriticalAlert} 
                disabled={isLoading || !recipientEmail}
                className="w-full"
                variant="outline"
              >
                <AlertTriangle className="w-4 h-4 mr-2" />
                Send Critical Alert
              </Button>
            </CardContent>
          </Card>

          {/* Maintenance Report */}
          <Card className="border-blue-200 bg-blue-50/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-blue-800 flex items-center text-lg">
                <BarChart3 className="w-5 h-5 mr-2" />
                Weekly Report
              </CardTitle>
              <CardDescription>
                Comprehensive maintenance summary
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2 text-sm">
                <p><strong>Period:</strong> Dec 16-22, 2024</p>
                <p><strong>Devices:</strong> 24 total, 3 maintenance due</p>
                <p><strong>Requests:</strong> 7 active, 1 critical</p>
              </div>
              <Button 
                onClick={handleSendMaintenanceReport} 
                disabled={isLoading || !recipientEmail}
                className="w-full"
                variant="outline"
              >
                <BarChart3 className="w-4 h-4 mr-2" />
                Send Report
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Features */}
        <div className="mt-8 p-4 bg-secondary/20 rounded-lg">
          <h4 className="font-semibold mb-3">Email Service Features</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <p className="font-medium">✅ HTML Templates</p>
              <p className="text-muted-foreground">Professional medical-grade styling</p>
            </div>
            <div>
              <p className="font-medium">✅ Automatic Tagging</p>
              <p className="text-muted-foreground">Email tracking and analytics</p>
            </div>
            <div>
              <p className="font-medium">✅ Priority Handling</p>
              <p className="text-muted-foreground">Color-coded urgency levels</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}