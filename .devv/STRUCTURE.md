# This file is only for editing file nodes, do not break the structure
## Project Description
OphthalmoTech is an advanced medical device management system specifically designed for ophthalmology practices. It provides comprehensive tracking, maintenance scheduling, and service management for critical eye care equipment including OCT machines, fundus cameras, visual field analyzers, and other specialized devices.

## Key Features
- **Secure Authentication**: Email OTP verification with persistent session management
- **AI-Powered Device Analysis**: Upload files for intelligent device extraction and analysis
- **Device Management**: Complete inventory tracking with real-time status monitoring
- **Real-Time Monitoring**: Live device performance tracking with automated alerts
- **Predictive Maintenance**: ML-powered failure prediction with cost optimization
- **Maintenance Scheduling**: Automated reminders and comprehensive maintenance records
- **Service Requests**: Ticketing system for equipment issues with priority management
- **Compliance Management**: Automated FDA, ISO, HIPAA, Joint Commission reporting
- **Advanced User Management**: Role-based access control with granular permissions
- **Comprehensive Reporting**: Advanced analytics dashboard with charts and metrics
- **Custom Report Builder**: Drag-and-drop interface for creating custom reports with templates
- **Email Notifications**: Automated alerts for critical issues and maintenance reminders
- **Professional Navigation**: Full sidebar navigation with responsive design
- **Medical-grade UI**: Professional interface designed for healthcare environments
- **Manufacturer Integrations**: API connections to medical device manufacturers for automated data sync
- **Automated Inventory Management**: Smart inventory tracking with automated reordering and alerts
- **Multi-Facility Support**: Healthcare network management for multiple facilities
- **Advanced Notification System**: Multi-channel notifications (email, SMS, push, webhook, Slack)

## Devv SDK Integration
Built-in: 
- **auth**: Email OTP verification, session management, secure login/logout
- **table**: 4 database tables (devices, maintenance_records, service_requests, user_profiles)
- **email**: Automated notifications, maintenance alerts, service reports with HTML templates

External: None (fully integrated with built-in SDK features)

/src
├── components/      # Components directory
│   ├── ui/         # Pre-installed shadcn/ui components (shadcn/ui library)
│   ├── EmailDemo.tsx # Email notification demonstration component
│   ├── ProtectedRoute.tsx # Route protection wrapper for authenticated pages
│   ├── ReportBuilder.tsx # Drag-and-drop custom report builder component
│   ├── ServiceAnalytics.tsx # Service request analytics component
│   └── ServiceRequestWorkflow.tsx # Service request workflow management
│
├── hooks/          # Custom Hooks directory
│   ├── use-mobile.ts # Mobile detection hook from shadcn
│   └── use-toast.ts  # Toast notification system hook
│
├── lib/            # Utility library directory
│   └── utils.ts    # Utility functions including cn for Tailwind classes
│
├── pages/          # Page components directory - comprehensive medical device management
│   ├── HomePage.tsx # Landing page with feature overview and quick actions
│   ├── LoginPage.tsx # Authentication page with email OTP
│   ├── DashboardPage.tsx # Main dashboard with metrics and overview
│   ├── DevicesPage.tsx # Device inventory management
│   ├── DeviceFormPage.tsx # Device creation and editing forms
│   ├── DeviceDetailsPage.tsx # Individual device details and history
│   ├── DeviceAnalysisPage.tsx # AI-powered device analysis from file uploads
│   ├── MaintenancePage.tsx # Maintenance scheduling and tracking
│   ├── ServiceRequestPage.tsx # Service request ticketing system
│   ├── ServiceAnalyticsPage.tsx # Service performance analytics
│   ├── MonitoringPage.tsx # Real-time device monitoring dashboard
│   ├── PredictiveMaintenancePage.tsx # ML-powered predictive maintenance
│   ├── CompliancePage.tsx # Regulatory compliance management
│   ├── UserManagementPage.tsx # Advanced user role management with RBAC
│   ├── ReportsPage.tsx # Comprehensive reporting and analytics
│   ├── ReportBuilderPage.tsx # Custom drag-and-drop report builder
│   ├── IntegrationsPage.tsx # Manufacturer API integrations and device sync
│   ├── InventoryPage.tsx # Automated inventory management and tracking
│   ├── FacilityManagementPage.tsx # Multi-facility and healthcare network management
│   ├── NotificationManagementPage.tsx # Advanced multi-channel notification system
│   └── NotFoundPage.tsx # 404 error page
│
├── services/       # Service layer for external integrations
│   ├── database.ts # Database service with table management
│   ├── email.ts    # Email notification service
│   ├── manufacturer-integrations.ts # API integrations with device manufacturers
│   ├── inventory-management.ts # Automated inventory and supply management
│   ├── facility-management.ts # Healthcare network and multi-facility management
│   └── notification-system.ts # Advanced multi-channel notification system
│
├── store/          # State management with Zustand
│   └── auth-store.ts # Authentication state with persistence
│
├── App.tsx         # Root component with full navigation and routing
├── main.tsx        # Application entry point
└── index.css       # Global styles with medical-grade design system
# Contains theme customization, plugins, and content paths
# Includes shadcn/ui theme configuration
