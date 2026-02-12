# Implementation Plan - Inter-Department Connectivity

## Overview

This document outlines the implementation tasks for adding inter-department and sub-department connectivity to the SUVIDHA 2026 system. Tasks are organized in a logical sequence to ensure incremental progress and testability.

---

## Phase 1: Database Models and Core Infrastructure

- [x] 1. Create ComplaintTransfer Model
  - Create `backend/models/ComplaintTransfer.js` with schema
  - Add validation for transfer types and reasons
  - Create indexes for performance
  - Add virtual fields for computed properties
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4_

- [ ] 2. Create ComplaintCommunication Model
  - Create `backend/models/ComplaintCommunication.js` with schema
  - Add message validation and length limits

  - Create indexes for query optimization
  - Add read status tracking
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 3. Create DepartmentConnection Model
  - Create `backend/models/DepartmentConnection.js` with schema
  - Add unique compound index for source-target pairs
  - Add connection type validation
  - Add statistics tracking fields
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 4. Enhance Complaint Model
  - Add transferHistory embedded array to Complaint model
  - Add currentlyAssignedTo field

  - Add escalation fields (isEscalated, escalatedAt, escalationReason)
  - Add communication count fields
  - Create migration script for existing complaints
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 6.1, 6.2, 6.3_

---

## Phase 2: Backend Services and Business Logic

- [x] 5. Create Transfer Service
  - [ ] 5.1 Implement transfer validation logic
    - Validate user permissions
    - Validate target department exists and is active
    - Check for duplicate pending transfers
    - _Requirements: 7.1, 7.2, 7.3_

  - [ ] 5.2 Implement transfer execution
    - Create ComplaintTransfer record
    - Update Complaint model

    - Handle department/sub-department transfers
    - _Requirements: 1.4, 2.4_

  - [ ] 5.3 Implement connection validation
    - Check if connection exists
    - Create connection if needed
    - Update connection statistics
    - _Requirements: 5.1, 5.2, 5.3_
  - [ ] 5.4 Implement transfer acceptance/rejection
    - Update transfer status
    - Update complaint assignment
    - Handle rejection flow
    - _Requirements: 8.1, 8.2, 8.3_

- [x] 6. Create Communication Service
  - [x] 6.1 Implement message creation
    - Validate message content
    - Handle department tagging
    - Process attachments
    - _Requirements: 3.2, 3.3_

  - [x] 6.2 Implement message retrieval
    - Filter by visibility rules
    - Paginate results
    - Include sender information
    - _Requirements: 3.1, 3.4_

  - [x] 6.3 Implement read status tracking
    - Mark messages as read
    - Track read by users
    - Calculate unread counts
    - _Requirements: 3.5_

- [x] 7. Create Notification Service
  - [x] 7.1 Implement transfer notifications
    - Notify target department on transfer
    - Notify source department on acceptance/rejection
    - Notify citizen on major transfers
    - _Requirements: 1.5, 2.5, 10.1, 10.2, 10.3_

  - [x] 7.2 Implement communication notifications
    - Notify tagged departments
    - Notify tagged officers
    - Handle notification preferences
    - _Requirements: 3.3_

  - [x] 7.3 Implement escalation notifications
    - Notify senior officers
    - Notify administrators
    - Send urgent alerts
    - _Requirements: 6.4_

---

## Phase 3: API Controllers and Routes

- [x] 8. Create Transfer Controller
  - Create `backend/controllers/transferController.js`
  - Implement POST `/api/complaints/:id/transfer` endpoint
  - Implement GET `/api/complaints/:id/transfers` endpoint
  - Implement PUT `/api/complaints/:id/transfers/:transferId/accept` endpoint
  - Implement PUT `/api/complaints/:id/transfers/:transferId/reject` endpoint
  - Implement GET `/api/departments/:id/pending-transfers` endpoint
  - Add error handling and validation
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 2.4, 4.1, 4.2_

- [x] 9. Create Communication Controller
  - Create `backend/controllers/communicationController.js`
  - Implement POST `/api/complaints/:id/communications` endpoint
  - Implement GET `/api/complaints/:id/communications` endpoint
  - Implement PUT `/api/communications/:id/read` endpoint
  - Implement GET `/api/communications/unread/count` endpoint
  - Add file upload handling for attachments
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 10. Create Connection Controller
  - Create `backend/controllers/connectionController.js`
  - Implement POST `/api/connections` endpoint
  - Implement GET `/api/departments/:id/connections` endpoint
  - Implement GET `/api/connections/validate` endpoint
  - Implement DELETE `/api/connections/:id` endpoint
  - Add admin-only authorization
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 11. Create Transfer Routes
  - Create `backend/routes/transferRoutes.js`
  - Register all transfer endpoints
  - Add authentication middleware
  - Add permission validation middleware
  - Mount routes in main app
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 12. Create Communication Routes
  - Create `backend/routes/communicationRoutes.js`
  - Register all communication endpoints
  - Add authentication middleware
  - Add file upload middleware
  - Mount routes in main app
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 13. Create Connection Routes
  - Create `backend/routes/connectionRoutes.js`
  - Register all connection endpoints
  - Add admin authorization middleware
  - Mount routes in main app
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

---

## Phase 4: Frontend Services

- [x] 14. Create Transfer Service (Frontend)
  - Create `frontend/src/services/transferService.js`
  - Implement transferComplaint function
  - Implement getTransferHistory function
  - Implement acceptTransfer function
  - Implement rejectTransfer function
  - Implement getPendingTransfers function
  - Add error handling
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 4.1, 4.2_

- [x] 15. Create Communication Service (Frontend)
  - Create `frontend/src/services/communicationService.js`
  - Implement sendMessage function
  - Implement getCommunications function
  - Implement markAsRead function
  - Implement getUnreadCount function
  - Add file upload support
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 16. Create Connection Service (Frontend)
  - Create `frontend/src/services/connectionService.js`
  - Implement getConnections function
  - Implement validateConnection function
  - Implement createConnection function (admin only)

  - _Requirements: 5.1, 5.2, 5.3_

---

## Phase 5: Frontend Components

- [x] 17. Create TransferModal Component
  - Create `frontend/src/components/TransferModal.jsx`
  - Add department selector dropdown
  - Add sub-department selector (conditional)
  - Add transfer reason dropdown
  - Add transfer notes textarea
  - Add validation before submission
  - Add loading states and error handling
  - Style with Tailwind CSS
  - _Requirements: 1.1, 1.2, 2.1, 2.2, 2.3, 9.1, 9.2_

- [x] 18. Create TransferHistory Component
  - Create `frontend/src/components/TransferHistory.jsx`
  - Display transfers in timeline format
  - Show transfer details (from/to, reason, officer, date)
  - Add status badges (pending/accepted/rejected)
  - Add expandable details section
  - Style with Tailwind CSS
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 19. Create CommunicationThread Component
  - Create `frontend/src/components/CommunicationThread.jsx`
  - Display messages in chronological order
  - Show sender information and department badges
  - Add message input form
  - Add department tagging functionality
  - Add attachment upload support
  - Add read receipts display
  - Style with Tailwind CSS
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 20. Create PendingTransfers Component
  - Create `frontend/src/components/PendingTransfers.jsx`
  - Display list of pending transfers
  - Show complaint preview for each transfer
  - Add accept/reject action buttons
  - Add bulk action support
  - Add filtering and sorting
  - Style with Tailwind CSS
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [x] 21. Enhance ComplaintDetails Page
  - Add "Transfer Complaint" button to ComplaintDetails page
  - Integrate TransferModal component
  - Integrate TransferHistory component
  - Integrate CommunicationThread component
  - Add escalation button and logic
  - Update UI to show current assignment status
  - _Requirements: 1.1, 3.1, 4.1, 6.1, 8.1_

- [x] 22. Create PendingTransfers Page
  - Create `frontend/src/pages/officer/PendingTransfers.jsx`
  - Integrate PendingTransfers component
  - Add navigation from officer dashboard
  - Add notification badge for pending count
  - Style with Tailwind CSS
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

---

## Phase 6: Constants and Utilities

- [x] 23. Add Transfer Constants
  - Add TRANSFER_TYPES to constants.js
  - Add TRANSFER_REASONS to constants.js
  - Add TRANSFER_STATUS to constants.js
  - Add MESSAGE_TYPES to constants.js
  - Add CONNECTION_TYPES to constants.js
  - _Requirements: 1.1, 2.1, 3.1, 5.1_

- [x] 24. Create Transfer Utilities
  - Create `frontend/src/utils/transferUtils.js`
  - Add getTransferReasonDisplay function
  - Add getTransferStatusColor function
  - Add formatTransferDate function
  - Add canTransferComplaint validation function
  - _Requirements: 1.1, 4.1, 7.1, 9.1_

---

## Phase 7: Permissions and Authorization

- [x] 25. Create Transfer Permission Middleware
  - Create `backend/middleware/transferPermissions.js`
  - Implement canTransferComplaint function
  - Implement canAcceptTransfer function
  - Implement canRejectTransfer function
  - Add role-based checks
  - Add department ownership checks
  - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_

- [x] 26. Add Permission Checks to Frontend
  - Add transfer permission checks in ComplaintDetails
  - Hide transfer button if user lacks permission
  - Add permission checks in PendingTransfers
  - Show appropriate error messages
  - _Requirements: 7.1, 7.2, 7.3_

---

## Phase 8: Notifications and Alerts

- [ ] 27. Implement Transfer Notifications
  - Send email notification on transfer
  - Send in-app notification to target department
  - Send notification on acceptance/rejection
  - Send citizen notification on major transfers
  - _Requirements: 1.5, 2.5, 10.1, 10.2, 10.3, 10.4, 10.5_

- [ ] 28. Implement Communication Notifications
  - Send notification to tagged departments
  - Send notification to tagged officers
  - Add unread message badge in UI
  - _Requirements: 3.3_

- [ ] 29. Implement Escalation Notifications
  - Send urgent notification to senior officers
  - Send notification to administrators
  - Add escalation badge in UI
  - _Requirements: 6.4_

---

## Phase 9: Analytics and Reporting

- [ ] 30. Create Transfer Analytics
  - Add transfer statistics to admin dashboard
  - Show transfer count by department
  - Show average transfer time

  - Show transfer acceptance rate
  - Show most common transfer reasons
  - _Requirements: 9.4_

- [ ] 31. Create Communication Analytics
  - Add communication statistics to dashboard
  - Show messages per complaint
  - Show response time between departments
  - Show most active departments
  - _Requirements: 3.4_

---

## Phase 10: Testing and Documentation

- [ ]\* 32. Write Unit Tests
  - Write tests for Transfer Service
  - Write tests for Communication Service
  - Write tests for Connection validation
  - Write tests for Permission middleware
  - _Requirements: All_

- [ ]\* 33. Write Integration Tests
  - Test complete transfer workflow
  - Test communication flow
  - Test connection validation
  - Test notification delivery
  - _Requirements: All_

- [ ]\* 34. Write E2E Tests
  - Test officer transfers complaint
  - Test target officer accepts transfer
  - Test inter-department communication
  - Test escalation flow
  - _Requirements: All_

- [ ]\* 35. Create API Documentation
  - Document all transfer endpoints
  - Document all communication endpoints
  - Document all connection endpoints
  - Add request/response examples
  - _Requirements: All_

- [ ]\* 36. Create User Documentation
  - Write guide for transferring complaints
  - Write guide for inter-department communication
  - Write guide for accepting/rejecting transfers
  - Add screenshots and examples
  - _Requirements: All_

---

## Phase 11: Deployment and Migration

- [ ] 37. Create Database Migration Script
  - Create script to add new fields to Complaint model
  - Create script to initialize new collections
  - Create script to create indexes
  - Test migration on staging environment
  - _Requirements: All_

- [ ] 38. Deploy Backend Changes
  - Deploy new models and controllers
  - Deploy new routes and middleware
  - Run database migration
  - Verify API endpoints
  - _Requirements: All_

- [ ] 39. Deploy Frontend Changes
  - Deploy new components and services
  - Deploy updated pages
  - Verify UI functionality
  - Test on multiple browsers
  - _Requirements: All_

- [ ] 40. Monitor and Optimize
  - Monitor API performance
  - Monitor database query performance
  - Optimize slow queries
  - Add caching where needed
  - _Requirements: All_

---

## Notes

- Tasks marked with `*` are optional but recommended
- Each task should be completed and tested before moving to the next
- Create feature branches for each phase
- Conduct code reviews before merging
- Update documentation as features are implemented
- Maintain backward compatibility with existing functionality

## Estimated Timeline

- Phase 1-2: 3-4 days (Backend foundation)
- Phase 3: 2-3 days (API layer)
- Phase 4-5: 4-5 days (Frontend services and components)
- Phase 6-7: 2 days (Utilities and permissions)
- Phase 8-9: 2-3 days (Notifications and analytics)
- Phase 10: 3-4 days (Testing and documentation)
- Phase 11: 1-2 days (Deployment)

**Total Estimated Time: 17-23 days**
