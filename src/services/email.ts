import { email } from '@devvai/devv-code-backend';

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

export class EmailService {
  private static fromAddress = 'noreply@ophthalmotech.com';

  // Service request notifications
  static async sendServiceRequestNotification(
    recipientEmail: string,
    recipientName: string,
    requestData: {
      requestId: string;
      deviceName: string;
      priority: string;
      description: string;
      reportedBy: string;
    }
  ): Promise<void> {
    const template = this.getServiceRequestTemplate(recipientName, requestData);
    
    await email.sendEmail({
      from: this.fromAddress,
      to: [recipientEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: 'type', value: 'service_request' },
        { name: 'priority', value: requestData.priority.toLowerCase() },
        { name: 'request_id', value: requestData.requestId }
      ]
    });
  }

  // Maintenance reminder notifications
  static async sendMaintenanceReminder(
    recipientEmail: string,
    recipientName: string,
    maintenanceData: {
      deviceName: string;
      manufacturer: string;
      model: string;
      location: string;
      dueDate: string;
      maintenanceType: string;
    }
  ): Promise<void> {
    const template = this.getMaintenanceReminderTemplate(recipientName, maintenanceData);
    
    await email.sendEmail({
      from: this.fromAddress,
      to: [recipientEmail],
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: 'type', value: 'maintenance_reminder' },
        { name: 'device', value: maintenanceData.deviceName },
        { name: 'maintenance_type', value: maintenanceData.maintenanceType }
      ]
    });
  }

  // Maintenance completion notifications
  static async sendMaintenanceCompletionNotification(
    recipientEmails: string[],
    maintenanceData: {
      deviceName: string;
      maintenanceType: string;
      technicianName: string;
      completionDate: string;
      nextMaintenanceDate?: string;
      status: string;
      summary: string;
    }
  ): Promise<void> {
    const template = this.getMaintenanceCompletionTemplate(maintenanceData);
    
    await email.sendEmail({
      from: this.fromAddress,
      to: recipientEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: 'type', value: 'maintenance_completion' },
        { name: 'device', value: maintenanceData.deviceName },
        { name: 'status', value: maintenanceData.status }
      ]
    });
  }

  // Critical alert notifications
  static async sendCriticalAlert(
    recipientEmails: string[],
    alertData: {
      deviceName: string;
      location: string;
      issueType: string;
      description: string;
      reportedBy: string;
      timestamp: string;
    }
  ): Promise<void> {
    const template = this.getCriticalAlertTemplate(alertData);
    
    await email.sendEmail({
      from: this.fromAddress,
      to: recipientEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: 'type', value: 'critical_alert' },
        { name: 'device', value: alertData.deviceName },
        { name: 'issue_type', value: alertData.issueType }
      ]
    });
  }

  // Daily/Weekly reports
  static async sendMaintenanceReport(
    recipientEmails: string[],
    reportData: {
      reportType: 'daily' | 'weekly';
      dateRange: string;
      devicesTotal: number;
      maintenanceDue: number;
      serviceRequests: number;
      criticalIssues: number;
      reportUrl?: string;
    }
  ): Promise<void> {
    const template = this.getMaintenanceReportTemplate(reportData);
    
    await email.sendEmail({
      from: this.fromAddress,
      to: recipientEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
      tags: [
        { name: 'type', value: 'maintenance_report' },
        { name: 'report_type', value: reportData.reportType }
      ]
    });
  }

  // Send email with PDF attachment
  static async sendMaintenanceReportWithPDF(
    recipientEmails: string[],
    reportData: any,
    pdfUrl: string,
    filename: string
  ): Promise<void> {
    const template = this.getMaintenanceReportTemplate(reportData);
    
    await email.sendEmail({
      from: this.fromAddress,
      to: recipientEmails,
      subject: template.subject,
      html: template.html,
      text: template.text,
      attachments: [
        {
          filename: filename,
          path: pdfUrl,
          content_type: 'application/pdf'
        }
      ],
      tags: [
        { name: 'type', value: 'maintenance_report_pdf' },
        { name: 'report_type', value: reportData.reportType }
      ]
    });
  }

  // Template generators
  private static getServiceRequestTemplate(
    recipientName: string,
    requestData: any
  ): EmailTemplate {
    const priorityColors: Record<string, string> = {
      Critical: '#dc2626',
      High: '#ea580c',
      Medium: '#d97706',
      Low: '#16a34a'
    };
    const priorityColor = priorityColors[requestData.priority] || '#6b7280';

    return {
      subject: `🚨 ${requestData.priority} Priority Service Request - ${requestData.deviceName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background: white; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .priority-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; color: white; background: ${priorityColor}; font-weight: 600; font-size: 14px; }
              .device-info { background: #f1f5f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
              .button { display: inline-block; padding: 12px 24px; background: #3b82f6; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
              .footer { background: #f8fafc; padding: 20px; text-align: center; color: #64748b; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>OphthalmoTech Service Alert</h1>
                <p>New Service Request Notification</p>
              </div>
              <div class="content">
                <p>Hello ${recipientName},</p>
                <p>A new service request has been submitted that requires your attention:</p>
                
                <div class="device-info">
                  <h3>🔧 Service Request Details</h3>
                  <p><strong>Request ID:</strong> #${requestData.requestId}</p>
                  <p><strong>Device:</strong> ${requestData.deviceName}</p>
                  <p><strong>Priority:</strong> <span class="priority-badge">${requestData.priority}</span></p>
                  <p><strong>Reported by:</strong> ${requestData.reportedBy}</p>
                  <p><strong>Description:</strong></p>
                  <p style="background: white; padding: 15px; border-left: 4px solid #3b82f6; margin: 10px 0;">${requestData.description}</p>
                </div>
                
                <p>Please review and assign this request as soon as possible.</p>
                
                <a href="#" class="button">View Request Details →</a>
                
                <p style="margin-top: 30px; color: #64748b; font-size: 14px;">
                  This is an automated notification from the OphthalmoTech Maintenance System.
                </p>
              </div>
              <div class="footer">
                <p>OphthalmoTech Medical Device Management System</p>
                <p>Ensuring optimal device performance and patient safety</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
OphthalmoTech Service Alert

Hello ${recipientName},

A new ${requestData.priority} priority service request has been submitted:

Request ID: #${requestData.requestId}
Device: ${requestData.deviceName}
Reported by: ${requestData.reportedBy}

Description: ${requestData.description}

Please review and assign this request as soon as possible.

---
OphthalmoTech Medical Device Management System
      `.trim()
    };
  }

  private static getMaintenanceReminderTemplate(
    recipientName: string,
    maintenanceData: any
  ): EmailTemplate {
    return {
      subject: `📅 Maintenance Due: ${maintenanceData.deviceName} - ${maintenanceData.maintenanceType}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background: white; }
              .header { background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .device-info { background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #f59e0b; }
              .due-date { background: #dc2626; color: white; padding: 10px 20px; border-radius: 6px; display: inline-block; font-weight: 600; }
              .button { display: inline-block; padding: 12px 24px; background: #f59e0b; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>⚠️ Maintenance Reminder</h1>
                <p>Scheduled maintenance due soon</p>
              </div>
              <div class="content">
                <p>Hello ${recipientName},</p>
                <p>This is a reminder that scheduled maintenance is due for the following device:</p>
                
                <div class="device-info">
                  <h3>📋 Device Information</h3>
                  <p><strong>Device:</strong> ${maintenanceData.deviceName}</p>
                  <p><strong>Manufacturer:</strong> ${maintenanceData.manufacturer}</p>
                  <p><strong>Model:</strong> ${maintenanceData.model}</p>
                  <p><strong>Location:</strong> ${maintenanceData.location}</p>
                  <p><strong>Maintenance Type:</strong> ${maintenanceData.maintenanceType}</p>
                  <p><strong>Due Date:</strong> <span class="due-date">${new Date(maintenanceData.dueDate).toLocaleDateString()}</span></p>
                </div>
                
                <p>Please schedule and complete this maintenance to ensure optimal device performance and compliance.</p>
                
                <a href="#" class="button">Schedule Maintenance →</a>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Maintenance Reminder

Hello ${recipientName},

Scheduled maintenance is due for:

Device: ${maintenanceData.deviceName}
Manufacturer: ${maintenanceData.manufacturer}
Model: ${maintenanceData.model}
Location: ${maintenanceData.location}
Maintenance Type: ${maintenanceData.maintenanceType}
Due Date: ${new Date(maintenanceData.dueDate).toLocaleDateString()}

Please schedule and complete this maintenance promptly.
      `.trim()
    };
  }

  private static getMaintenanceCompletionTemplate(maintenanceData: any): EmailTemplate {
    return {
      subject: `✅ Maintenance Completed: ${maintenanceData.deviceName}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background: white; }
              .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .completion-info { background: #d1fae5; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981; }
              .status-badge { display: inline-block; padding: 6px 12px; border-radius: 4px; color: white; background: #10b981; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>✅ Maintenance Completed</h1>
                <p>Device maintenance has been successfully completed</p>
              </div>
              <div class="content">
                <p>The following maintenance has been completed:</p>
                
                <div class="completion-info">
                  <h3>📋 Maintenance Summary</h3>
                  <p><strong>Device:</strong> ${maintenanceData.deviceName}</p>
                  <p><strong>Maintenance Type:</strong> ${maintenanceData.maintenanceType}</p>
                  <p><strong>Technician:</strong> ${maintenanceData.technicianName}</p>
                  <p><strong>Completion Date:</strong> ${new Date(maintenanceData.completionDate).toLocaleDateString()}</p>
                  <p><strong>Status:</strong> <span class="status-badge">${maintenanceData.status}</span></p>
                  ${maintenanceData.nextMaintenanceDate ? 
                    `<p><strong>Next Maintenance:</strong> ${new Date(maintenanceData.nextMaintenanceDate).toLocaleDateString()}</p>` : ''}
                  <p><strong>Summary:</strong></p>
                  <p style="background: white; padding: 15px; border-radius: 4px;">${maintenanceData.summary}</p>
                </div>
                
                <p>The device is now ready for operation.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
Maintenance Completed

Device: ${maintenanceData.deviceName}
Maintenance Type: ${maintenanceData.maintenanceType}
Technician: ${maintenanceData.technicianName}
Completion Date: ${new Date(maintenanceData.completionDate).toLocaleDateString()}
Status: ${maintenanceData.status}

Summary: ${maintenanceData.summary}

The device is now ready for operation.
      `.trim()
    };
  }

  private static getCriticalAlertTemplate(alertData: any): EmailTemplate {
    return {
      subject: `🚨 CRITICAL ALERT: ${alertData.deviceName} - Immediate Action Required`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background: white; }
              .header { background: linear-gradient(135deg, #dc2626 0%, #991b1b 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .alert-info { background: #fee2e2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626; }
              .urgent-button { display: inline-block; padding: 15px 30px; background: #dc2626; color: white; text-decoration: none; border-radius: 6px; margin-top: 20px; font-weight: 600; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚨 CRITICAL ALERT</h1>
                <p>Immediate attention required</p>
              </div>
              <div class="content">
                <p><strong>A critical issue has been detected that requires immediate attention:</strong></p>
                
                <div class="alert-info">
                  <h3>⚠️ Alert Details</h3>
                  <p><strong>Device:</strong> ${alertData.deviceName}</p>
                  <p><strong>Location:</strong> ${alertData.location}</p>
                  <p><strong>Issue Type:</strong> ${alertData.issueType}</p>
                  <p><strong>Reported by:</strong> ${alertData.reportedBy}</p>
                  <p><strong>Time:</strong> ${new Date(alertData.timestamp).toLocaleString()}</p>
                  <p><strong>Description:</strong></p>
                  <p style="background: white; padding: 15px; border-left: 4px solid #dc2626; margin: 10px 0;">${alertData.description}</p>
                </div>
                
                <p><strong style="color: #dc2626;">This device may pose a safety risk and should be taken offline immediately until resolved.</strong></p>
                
                <a href="#" class="urgent-button">RESPOND NOW →</a>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
🚨 CRITICAL ALERT - IMMEDIATE ACTION REQUIRED

Device: ${alertData.deviceName}
Location: ${alertData.location}
Issue Type: ${alertData.issueType}
Reported by: ${alertData.reportedBy}
Time: ${new Date(alertData.timestamp).toLocaleString()}

Description: ${alertData.description}

This device may pose a safety risk and should be taken offline immediately until resolved.

Please respond immediately.
      `.trim()
    };
  }

  private static getMaintenanceReportTemplate(reportData: any): EmailTemplate {
    return {
      subject: `📊 ${reportData.reportType.charAt(0).toUpperCase() + reportData.reportType.slice(1)} Maintenance Report - ${reportData.dateRange}`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background: #f8fafc; }
              .container { max-width: 600px; margin: 0 auto; background: white; }
              .header { background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%); color: white; padding: 30px; text-align: center; }
              .content { padding: 30px; }
              .stats-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin: 20px 0; }
              .stat-card { background: #f1f5f9; padding: 20px; border-radius: 8px; text-align: center; }
              .stat-number { font-size: 32px; font-weight: 700; color: #3b82f6; display: block; }
              .stat-label { color: #64748b; font-size: 14px; margin-top: 5px; }
              .critical { color: #dc2626; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📊 Maintenance Report</h1>
                <p>${reportData.reportType.charAt(0).toUpperCase() + reportData.reportType.slice(1)} Summary for ${reportData.dateRange}</p>
              </div>
              <div class="content">
                <h3>System Overview</h3>
                
                <div class="stats-grid">
                  <div class="stat-card">
                    <span class="stat-number">${reportData.devicesTotal}</span>
                    <div class="stat-label">Total Devices</div>
                  </div>
                  <div class="stat-card">
                    <span class="stat-number">${reportData.maintenanceDue}</span>
                    <div class="stat-label">Maintenance Due</div>
                  </div>
                  <div class="stat-card">
                    <span class="stat-number">${reportData.serviceRequests}</span>
                    <div class="stat-label">Service Requests</div>
                  </div>
                  <div class="stat-card">
                    <span class="stat-number critical">${reportData.criticalIssues}</span>
                    <div class="stat-label">Critical Issues</div>
                  </div>
                </div>
                
                ${reportData.criticalIssues > 0 ? 
                  '<p style="color: #dc2626; background: #fee2e2; padding: 15px; border-radius: 6px;"><strong>⚠️ Attention:</strong> There are critical issues requiring immediate attention.</p>' : 
                  '<p style="color: #059669; background: #d1fae5; padding: 15px; border-radius: 6px;"><strong>✅ Status:</strong> All systems operating normally.</p>'
                }
                
                <p>For detailed information and trending analysis, please access the full dashboard.</p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: `
${reportData.reportType.charAt(0).toUpperCase() + reportData.reportType.slice(1)} Maintenance Report
${reportData.dateRange}

System Overview:
- Total Devices: ${reportData.devicesTotal}
- Maintenance Due: ${reportData.maintenanceDue}
- Service Requests: ${reportData.serviceRequests}
- Critical Issues: ${reportData.criticalIssues}

${reportData.criticalIssues > 0 ? 
  'ATTENTION: There are critical issues requiring immediate attention.' : 
  'All systems operating normally.'
}
      `.trim()
    };
  }
}