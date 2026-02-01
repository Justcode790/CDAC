# Implementation Plan

- [x] 1. Enhance User Model with Government Hierarchy Support
  - Modify `backend/models/User.js` to add SUPER_ADMIN role to enum
  - Add validation for officer assignment requirements (department and sub-department mandatory for OFFICER role)
  - Implement transferHistory array field for tracking officer movements
  - Add database indexes for officer assignments and lookups
  - Add pre-save middleware to enforce single department assignment rule

  - _Requirements: 3.5, 4.5, 5.5, 6.2, 10.5_

- [x] 2. Create Super Admin Bootstrap System

  - Create `backend/bootstrap/superAdminBootstrap.js` for automatic Super Admin creation
  - Implement environment variable validation for ADMIN_EMAIL and ADMIN_PASSWORD

  - Add logic to check for existing Super Admin and create if none exists
  - Integrate bootstrap system into server startup process in `backend/server.js`
  - Add audit logging for Super Admin creation events
  - _Requirements: 1.1, 1.2, 1.3, 1.5_

- [x] 3. Implement Data Integrity Engine
  - Create `backend/services/dataIntegrityService.js` with constraint validation logic
  - Implement single department assignment validation for officers
  - Add transaction-like logic for officer transfers to prevent inconsistent states
  - Create middleware `backend/middleware/dataIntegrityCheck.js` for pre-operation validation
  - Add database schema constraints and compound unique indexes
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5_

- [x] 4. Create Officer Lifecycle Management Service
  - Create `backend/services/officerLifecycleService.js` with complete officer management
  - Implement officer creation with auto-generated Officer ID and temporary password
  - Implement officer transfer logic with department mapping cleanup
  - Implement officer retirement with hard delete and credential revocation
  - Add validation to ensure officers belong to only one department at a time
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4_

- [x] 5. Create Super Admin Authorization Middleware
  - Create `backend/middleware/superAdminAuth.js` for Super Admin-only operations
  - Implement role-based access control restricting administrative functions
  - Add comprehensive error handling for unauthorized access attempts
  - Integrate with existing JWT authentication system
  - Add audit logging for all administrative access attempts
  - _Requirements: 1.4, 9.1, 9.2, 9.3, 9.4_

- [x] 6. Implement Administrative API Controllers
  - Create `backend/controllers/adminController.js` for Super Admin operations
  - Implement department creation endpoint with validation
  - Implement sub-department creation endpoint with hierarchy validation
  - Implement officer creation, transfer, and retirement endpoints
  - Add comprehensive error handling and audit logging for all operations
  - _Requirements: 2.1, 2.2, 3.1, 4.1, 5.1, 9.5_

- [x] 7. Create Administrative API Routes
  - Create `backend/routes/adminRoutes.js` with Super Admin-only endpoints
  - Implement POST /api/admin/departments for department creation
  - Implement POST /api/admin/subdepartments for sub-department creation
  - Implement POST /api/admin/officers for officer creation
  - Implement PUT /api/admin/officers/:id/transfer for officer transfers
  - Implement DELETE /api/admin/officers/:id for officer retirement
  - _Requirements: 2.1, 2.2, 3.1, 4.1, 5.1_

- [x] 8. Enhance Officer Access Control System
  - Modify `backend/middleware/officerAccess.js` to handle officer transfers
  - Implement immediate access permission updates after officer transfers
  - Add logic to prevent access to previous department complaints after transfer
  - Enhance complaint filtering to respect current officer assignments only
  - Add access control enforcement at database query level
  - _Requirements: 4.2, 4.3, 10.1, 10.2, 10.3, 10.5_

- [x] 9. Create Comprehensive Demo Data Seeding System
  - Create `backend/scripts/seedDemoData.js` with idempotent seeding logic
  - Implement realistic department creation (Electricity, Water, Gas, Municipal)
  - Implement sub-department creation with proper hierarchy
  - Implement officer creation with at least one officer per sub-department
  - Implement citizen creation with unique phone numbers (3-5 citizens)
  - Implement complaint creation with mixed statuses across departments
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 8.1, 8.2, 8.4_

- [x] 10. Add Seeding Script Integration and Credential Display
  - Add "seed" script command to `package.json` for npm run seed execution
  - Implement credential display system showing all created login details
  - Add idempotency checks to prevent duplicate data creation on multiple runs
  - Integrate seeding operations with audit logging system
  - Add comprehensive console output for demo credential reference
  - _Requirements: 8.3, 8.4, 8.5_

- [x] 11. Enhance Department and SubDepartment Models
  - Modify `backend/models/Department.js` to add createdBy field and validation
  - Modify `backend/models/SubDepartment.js` to add compound unique constraints
  - Add deletion prevention logic for departments with active officers
  - Implement virtual fields for counting officers and sub-departments
  - Add database indexes for performance optimization
  - _Requirements: 2.3, 2.4, 2.5_

- [x] 12. Update Server Startup and Environment Configuration
  - Modify `backend/server.js` to integrate Super Admin bootstrap process
  - Add environment variable validation before server start
  - Implement graceful server startup failure if required variables missing
  - Add startup logging for Super Admin bootstrap status
  - Update `.env.example` with required ADMIN_EMAIL and ADMIN_PASSWORD variables
  - _Requirements: 1.1, 1.3_

- [ ]\* 13. Create comprehensive unit tests for government system
  - Write tests for Super Admin bootstrap functionality
  - Write tests for officer lifecycle operations (create, transfer, retire)
  - Write tests for data integrity constraint enforcement
  - Write tests for administrative authorization and access control
  - Write tests for demo data seeding idempotency
  - _Requirements: All requirements validation_

- [ ]\* 14. Create integration tests for end-to-end workflows
  - Write tests for complete officer lifecycle from creation to retirement
  - Write tests for department hierarchy management workflows
  - Write tests for officer transfer scenarios with complaint access changes
  - Write tests for seeding system with realistic data validation
  - Write tests for audit trail completeness across all operations
  - _Requirements: All requirements validation_
