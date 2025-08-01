# KI POS System - Developer Documentation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Setup & Installation](#setup--installation)
4. [Database Schema](#database-schema)
5. [API Documentation](#api-documentation)
6. [Frontend Components](#frontend-components)
7. [RBAC & Permissions](#rbac--permissions)
8. [Development Guidelines](#development-guidelines)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

## 🏗️ Project Overview

### Tech Stack
- **Backend**: Node.js, Electron (main process), SQLite (better-sqlite3)
- **Frontend**: React 18, Vite, Zustand (state management)
- **Database**: SQLite with migrations
- **Authentication**: JWT-based with bcryptjs
- **Architecture**: Electron main process + renderer process with IPC communication

### Project Structure
```
ki-pos-software/
├── backend/           # Electron main process + API
│   ├── controllers/   # Business logic controllers
│   ├── services/      # Service layer
│   ├── models/        # Data models
│   ├── ipcHandlers/   # IPC communication handlers
│   ├── migrations/    # Database migrations
│   ├── utils/         # Utility functions
│   └── index.js       # Electron main entry point
├── renderer/          # React frontend
│   ├── src/
│   │   ├── components/ # React components
│   │   ├── pages/      # Page components
│   │   ├── stores/     # Zustand stores
│   │   └── utils/      # Frontend utilities
│   └── vite.config.js  # Vite configuration
├── docs/             # Documentation
└── README.md         # Project overview
```

## 🏛️ Architecture

### Electron Architecture
- **Main Process**: Handles database, IPC, system integration, hardware communication
- **Renderer Process**: React UI for user interactions
- **IPC Communication**: Secure communication between processes via preload script
- **Context Isolation**: Enabled for security

### Database Architecture
- **SQLite**: File-based database with WAL mode for better performance
- **Migrations**: Version-controlled schema changes with automatic runner
- **Models**: Data access layer with prepared statements
- **Performance**: Optimized with pragmas for concurrent access

### API Architecture
- **IPC Handlers**: Electron IPC for main-renderer communication
- **Controllers**: Request handling and validation
- **Services**: Business logic layer
- **Models**: Data access and manipulation
- **Authentication**: JWT-based with role-based permissions

### Frontend Architecture
- **React 18**: Functional components with hooks
- **Zustand**: State management with persistence
- **React Router**: Client-side routing with protected routes
- **Vite**: Fast development and build tooling

## 🚀 Setup & Installation

### Prerequisites
- Node.js 20.x or higher (required for better-sqlite3)
- Python 3.x (for native modules compilation)
- Visual Studio Build Tools (Windows)

### Installation Steps
1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ki-pos-software
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../renderer
   npm install
   ```

3. **Start development**
   ```bash
   # From root directory
   npm run dev
   ```

### Environment Configuration
- Database path: `backend/pos.db` (auto-created)
- JWT secret: Configured in auth service
- Development server: Vite on port 5173
- Electron window: Loads from localhost:5173

## 🗄️ Database Schema

### Core Tables
- **users**: Employee/user management with role-based access
- **roles**: RBAC role definitions (admin, manager, cashier)
- **permissions**: Granular feature permissions (135 total)
- **role_permissions**: Role-permission mappings
- **products**: Inventory items with categories
- **transactions**: Sales records with TSE compliance
- **customers**: Customer data with loyalty system
- **shifts**: Employee work sessions
- **categories**: Product categorization

### Migration System
- **Automatic**: Runs on app startup
- **Version-controlled**: Sequential migration files
- **Seed Data**: Default users, roles, and sample data
- **Rollback Support**: Built into migration runner

## 🔌 API Documentation

### IPC Communication
The system uses Electron's IPC for communication between main and renderer processes:

#### Authentication
- `login(identifier, password)` - User authentication
- `logout(userId, refreshToken)` - User logout
- `validateSession(token)` - Token verification

#### Products
- `products:list(page, limit)` - List products
- `products:add(product, currentUser)` - Create product
- `products:update(product, currentUser)` - Update product
- `products:delete(id, currentUser)` - Delete product
- `products:search(query, limit)` - Search products

#### Transactions
- `transactions:add(data, currentUser)` - Create transaction
- `transactions:list(page, limit)` - List transactions
- `transactions:get(id)` - Get transaction details
- `sales:add(sale, currentUser)` - Add sale

#### Employees
- `employees:list(page, limit, filters)` - List employees
- `employees:add(employeeData, currentUser)` - Create employee
- `employees:update(id, employeeData)` - Update employee
- `employees:delete(id)` - Delete employee
- `employees:listPermissions()` - List available permissions

#### Reports
- `reports:generateX(date, userId)` - Generate X report
- `reports:generateZ(date, userId)` - Generate Z report
- `reports:exportGoBD(startDate, endDate)` - Export GoBD format
- `reports:generatePDF(reportId)` - Generate PDF report

#### Hardware
- `hardware:getConfig()` - Get hardware configuration
- `hardware:saveConfig(config)` - Save hardware configuration
- `hardware:testECTerminal(config)` - Test EC terminal
- `hardware:testDrawer(config)` - Test cash drawer

## 🎨 Frontend Components

### Core Components
- **ProtectedRoute**: Permission-based route protection
- **Sidebar**: Navigation with role-based menu items
- **Login**: Authentication interface
- **POS Interface**: Sales interface with real-time updates
- **Dashboard**: Analytics and overview
- **Employee Management**: User administration with permissions
- **Product Management**: Inventory control
- **Reports**: Data visualization and export

### State Management
- **Zustand**: Global state with persistence
- **User Store**: Authentication and permissions
- **Product Store**: Product data management
- **Transaction Store**: Sales data management

### Routing
- **React Router**: Client-side routing
- **Protected Routes**: Permission-based access control
- **Fallback Handling**: Graceful permission denial

## 🔐 RBAC & Permissions

### Permission System
- **135 Total Permissions**: Granular access control
- **Role-Based**: Admin, Manager, Cashier roles
- **Dynamic Checking**: Runtime permission validation
- **Frontend Integration**: Zustand store with permission codes

### Default Roles
- **Admin**: Full system access (ALL permission)
- **Manager**: Operational control (dashboard, inventory, reports)
- **Cashier**: Basic sales operations (POS, receipts)

### Permission Categories
- **POS Operations**: Sales interface permissions
- **Inventory Management**: Stock control permissions
- **Employee Management**: User administration permissions
- **Reports & Analytics**: Data access permissions
- **System Settings**: Configuration permissions
- **Hardware Control**: Device management permissions

## 📝 Development Guidelines

### Code Style
- **JavaScript**: ES6+ with async/await
- **React**: Functional components with hooks
- **CSS**: BEM methodology with CSS custom properties
- **Naming**: camelCase for variables, PascalCase for components

### Git Workflow
- **Feature Branches**: `feature/feature-name`
- **Commit Messages**: Conventional commits format
- **Pull Requests**: Code review required
- **Testing**: Unit and integration tests

### Security
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Prepared statements only
- **Authentication**: JWT with bcrypt password hashing
- **Authorization**: Role-based access control

## 🚀 Deployment

### Development
- **Hot Reload**: Vite development server
- **Electron DevTools**: Available in development
- **Database**: SQLite file with WAL mode

### Production
- **Electron Builder**: App packaging
- **Code Signing**: Required for distribution
- **Auto Updates**: Electron updater integration
- **Database Backup**: Automated backup strategy

### Distribution
- **Platforms**: Windows, macOS, Linux
- **Installers**: Platform-specific installers
- **Updates**: Automatic update system

## 🔧 Troubleshooting

### Common Issues
- **Node.js Version**: Requires 20.x+ for better-sqlite3
- **Native Modules**: Python and build tools required
- **Database**: Migration errors and connection issues
- **IPC Communication**: Handler registration problems

### Debug Tools
- **Electron DevTools**: Main and renderer process debugging
- **Database**: SQLite browser for data inspection
- **Logging**: Structured logging throughout application

### Performance Optimization
- **Database**: Indexes and query optimization
- **Frontend**: React.memo and useMemo for expensive operations
- **Memory**: Proper cleanup and garbage collection

## 📚 Additional Resources

- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://reactjs.org/docs)
- [SQLite Documentation](https://www.sqlite.org/docs.html)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Vite Documentation](https://vitejs.dev/guide/)

---

## 🤝 Contributing

Please read our contributing guidelines before submitting pull requests.

## 📄 License

This project is licensed under the ISC License. 