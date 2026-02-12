# Design Document - Inter-Department Connectivity

## Overview

This document outlines the technical design for implementing inter-department and sub-department connectivity in the SUVIDHA 2026 system. The feature enables complaint transfers, inter-department communication, and maintains comprehensive transfer history for audit and accountability.

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend Layer                           │
├─────────────────────────────────────────────────────────────┤
│  - ComplaintDetails (Enhanced with Transfer UI)             │
│  - TransferModal Component                                   │
│  - CommunicationThread Component                            │
│  - TransferHistory Component                                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                      API Layer                               │
├─────────────────────────────────────────────────────────────┤
│  - Transfer Routes (/api/complaints/:id/transfer)           │
│  - Communication Routes (/api/complaints/:id/communications)│
│  - Connection Validation Middleware                         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                   Business Logic Layer                       │
├─────────────────────────────────────────────────────────────┤
│  - Transfer Service (validation, execution)                 │
│  - Communication Service (messaging)                        │
│  - Notification Service (alerts)                            │
│  - Permission Service (authorization)                       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
├─────────────────────────────────────────────────────────────┤
│  - Complaint Model (enhanced)                               │
│  - ComplaintTransfer Model (new)                            │
│  - ComplaintCommunication Model (new)                       │
│  - DepartmentConnection Model (new)                         │
└─────────────────────────────────────────────────────────────┘
```

## Data Models

### 1. ComplaintTransfer Model (New)

```javascript
{
  _id: ObjectId,
  complaint: ObjectId (ref: Complaint),
  
  // Source Information
  fromDepartment: ObjectId (ref: Department),
  fromSubDepartment: ObjectId (ref: SubDepartment),
  
  // Target Information
  toDepartment: ObjectId (ref: Department),
  toSubDepartment: ObjectId (ref: SubDepartment),
  
  // Transfer Details
  transferType: String (enum: ['DEPARTMENT', 'SUB_DEPARTMENT', 'ESCALATION']),
  transferReason: String (enum: ['CLARIFICATION', 'RE_VERIFICATION', 'FURTHER_INVESTIGATION', 'SPECIALIZED_HANDLING', 'WRONG_DEPARTMENT', 'ESCALATION', 'OTHER']),
  transferNotes: String (max: 500),
  
  // Officer Information
  transferredBy: ObjectId (ref: User),
  transferredByRole: String,
  
  // Status Tracking
  transferStatus: String (enum: ['PENDING', 'ACCEPTED', 'REJECTED']),
  acceptedBy: ObjectId (ref: User),
  acceptedAt: Date,
  rejectionReason: String,
  
  // Timestamps
  transferredAt: Date (default: now),
  
  // Metadata
  isActive: Boolean (default: true),
  
  // Indexes
  indexes: [
    { complaint: 1, transferredAt: -1 },
    { fromDepartment: 1, toDepartment: 1 },
    { transferStatus: 1 }
  ]
}
```

### 2. ComplaintCommunication Model (New)

```javascript
{
  _id: ObjectId,
  complaint: ObjectId (ref: Complaint),
  
  // Message Details
  message: String (required, max: 1000),
  messageType: String (enum: ['INTERNAL', 'INTER_DEPARTMENT', 'ESCALATION']),
  
  // Sender Information
  sentBy: ObjectId (ref: User),
  sentByDepartment: ObjectId (ref: Department),
  sentBySubDepartment: ObjectId (ref: SubDepartment),
  
  // Recipients
  taggedDepartments: [ObjectId] (ref: Department),
  taggedOfficers: [ObjectId] (ref: User),
  
  // Visibility
  isInternal: Boolean (default: false), // Hidden from citizens
  visibleToRoles: [String] (enum: ['OFFICER', 'ADMIN', 'SUPER_ADMIN']),
  
  // Attachments
  attachments: [{
    filename: String,
    url: String,
    uploadedAt: Date
  }],
  
  // Read Status
  readBy: [{
    user: ObjectId (ref: User),
    readAt: Date
  }],
  
  // Timestamps
  createdAt: Date (default: now),
  updatedAt: Date,
  
  // Indexes
  indexes: [
    { complaint: 1, createdAt: -1 },
    { sentByDepartment: 1 },
    { taggedDepartments: 1 }
  ]
}
```

### 3. DepartmentConnection Model (New)

```javascript
{
  _id: ObjectId,
  
  // Connection Details
  sourceDepartment: ObjectId (ref: Department),
  targetDepartment: ObjectId (ref: Department),
  
  // Connection Type
  connectionType: String (enum: ['TRANSFER_ENABLED', 'COMMUNICATION_ENABLED', 'BOTH']),
  
  // Metadata
  establishedBy: ObjectId (ref: User),
  establishedAt: Date (default: now),
  
  // Status
  isActive: Boolean (default: true),
  
  // Statistics
  transferCount: Number (default: 0),
  lastTransferAt: Date,
  
  // Indexes
  indexes: [
    { sourceDepartment: 1, targetDepartment: 1 }, // Unique compound index
    { isActive: 1 }
  ]
}
```

### 4. Enhanced Complaint Model

```javascript
// Add to existing Complaint model:
{
  // ... existing fields ...
  
  // Transfer History (embedded for quick access)
  transferHistory: [{
    fromDepartment: ObjectId,
    toDepartment: ObjectId,
    transferredBy: ObjectId,
    transferredAt: Date,
    reason: String
  }],
  
  // Current Assignment
  currentlyAssignedTo: ObjectId (ref: User), // null if unclaimed
  claimedAt: Date,
  
  // Transfer Statistics
  transferCount: Number (default: 0),
  lastTransferredAt: Date,
  
  // Escalation
  isEscalated: Boolean (default: false),
  escalatedAt: Date,
  escalatedBy: ObjectId (ref: User),
  escalationReason: String,
  
  // Communication Count
  communicationCount: Number (default: 0),
  lastCommunicationAt: Date
}
```

## Components and Interfaces

### Backend Components

#### 1. Transfer Controller (`backend/controllers/transferController.js`)

```javascript
// Transfer complaint to another department
POST /api/complaints/:id/transfer
Body: {
  targetDepartment: ObjectId,
  targetSubDepartment: ObjectId (optional),
  transferType: String,
  transferReason: String,
  transferNotes: String
}

// Get transfer history for a complaint
GET /api/complaints/:id/transfers

// Accept a transferred complaint
PUT /api/complaints/:id/transfers/:transferId/accept

// Reject a transferred complaint
PUT /api/complaints/:id/transfers/:transferId/reject
Body: {
  rejectionReason: String
}

// Get pending transfers for department
GET /api/departments/:id/pending-transfers
```

#### 2. Communication Controller (`backend/controllers/communicationController.js`)

```javascript
// Add communication message
POST /api/complaints/:id/communications
Body: {
  message: String,
  messageType: String,
  taggedDepartments: [ObjectId],
  isInternal: Boolean,
  attachments: [File]
}

// Get communications for a complaint
GET /api/complaints/:id/communications

// Mark communication as read
PUT /api/communications/:id/read

// Get unread communications count
GET /api/communications/unread/count
```

#### 3. Connection Controller (`backend/controllers/connectionController.js`)

```javascript
// Create department connection
POST /api/connections
Body: {
  sourceDepartment: ObjectId,
  targetDepartment: ObjectId,
  connectionType: String
}

// Get connections for a department
GET /api/departments/:id/connections

// Validate connection exists
GET /api/connections/validate?source=:sourceId&target=:targetId

// Delete connection
DELETE /api/connections/:id
```

### Frontend Components

#### 1. TransferModal Component

```jsx
<TransferModal
  complaint={complaint}
  currentDepartment={department}
  onTransfer={handleTransfer}
  onClose={handleClose}
/>

Features:
- Department/Sub-department selector
- Transfer reason dropdown
- Transfer notes textarea
- Validation before submission
- Loading states
```

#### 2. TransferHistory Component

```jsx
<TransferHistory
  complaintId={complaintId}
  transfers={transfers}
/>

Features:
- Timeline visualization
- Transfer details (from/to, reason, officer)
- Status badges (pending/accepted/rejected)
- Expandable details
```

#### 3. CommunicationThread Component

```jsx
<CommunicationThread
  complaintId={complaintId}
  communications={communications}
  onSendMessage={handleSend}
  currentUser={user}
/>

Features:
- Message list with sender info
- Department badges
- Reply functionality
- Tag departments
- Attachment support
- Read receipts
```

#### 4. PendingTransfers Component

```jsx
<PendingTransfers
  departmentId={departmentId}
  onAccept={handleAccept}
  onReject={handleReject}
/>

Features:
- List of pending transfers
- Complaint preview
- Accept/Reject actions
- Bulk actions
```

## API Endpoints

### Transfer Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/complaints/:id/transfer` | Transfer complaint | Officer+ |
| GET | `/api/complaints/:id/transfers` | Get transfer history | Officer+ |
| PUT | `/api/complaints/:id/transfers/:transferId/accept` | Accept transfer | Officer+ |
| PUT | `/api/complaints/:id/transfers/:transferId/reject` | Reject transfer | Officer+ |
| GET | `/api/departments/:id/pending-transfers` | Get pending transfers | Officer+ |
| GET | `/api/transfers/stats` | Get transfer statistics | Admin+ |

### Communication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/complaints/:id/communications` | Add message | Officer+ |
| GET | `/api/complaints/:id/communications` | Get messages | Officer+ |
| PUT | `/api/communications/:id/read` | Mark as read | Officer+ |
| GET | `/api/communications/unread/count` | Unread count | Officer+ |

### Connection Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/connections` | Create connection | Admin+ |
| GET | `/api/departments/:id/connections` | Get connections | Officer+ |
| GET | `/api/connections/validate` | Validate connection | Officer+ |
| DELETE | `/api/connections/:id` | Delete connection | Admin+ |

## Business Logic

### Transfer Workflow

```
1. Officer initiates transfer
   ↓
2. Validate permissions (officer role, department access)
   ↓
3. Validate target department exists and is active
   ↓
4. Check if connection exists (create if needed)
   ↓
5. Create ComplaintTransfer record (status: PENDING)
   ↓
6. Update Complaint model (add to transferHistory)
   ↓
7. Send notification to target department
   ↓
8. Create audit log entry
   ↓
9. Return success response

Target Department Officer:
   ↓
10. View pending transfer
   ↓
11. Accept or Reject
   ↓
12. If accepted: Update complaint assignment, notify original department
13. If rejected: Return to source department, notify officer
```

### Connection Validation Logic

```javascript
async function validateConnection(sourceDeptId, targetDeptId) {
  // Check if connection already exists
  const existingConnection = await DepartmentConnection.findOne({
    $or: [
      { sourceDepartment: sourceDeptId, targetDepartment: targetDeptId },
      { sourceDepartment: targetDeptId, targetDepartment: sourceDeptId }
    ],
    isActive: true
  });
  
  if (existingConnection) {
    return { exists: true, connection: existingConnection };
  }
  
  // Create new connection
  const newConnection = await DepartmentConnection.create({
    sourceDepartment: sourceDeptId,
    targetDepartment: targetDeptId,
    connectionType: 'BOTH',
    establishedBy: currentUser._id
  });
  
  return { exists: false, connection: newConnection };
}
```

### Permission Validation

```javascript
function canTransferComplaint(user, complaint, targetDepartment) {
  // Check user role
  if (!['OFFICER', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
    return { allowed: false, reason: 'Insufficient permissions' };
  }
  
  // Check if user's department matches complaint's current department
  if (user.role === 'OFFICER' && 
      user.assignedSubDepartment.toString() !== complaint.subDepartment.toString()) {
    return { allowed: false, reason: 'Not assigned to this complaint' };
  }
  
  // Check if target department is different
  if (complaint.department.toString() === targetDepartment.toString()) {
    return { allowed: false, reason: 'Cannot transfer to same department' };
  }
  
  return { allowed: true };
}
```

## Error Handling

### Transfer Errors

- `TRANSFER_PERMISSION_DENIED`: User lacks permission to transfer
- `INVALID_TARGET_DEPARTMENT`: Target department doesn't exist or is inactive
- `SAME_DEPARTMENT_TRANSFER`: Attempting to transfer to same department
- `DUPLICATE_PENDING_TRANSFER`: Transfer already pending for this complaint
- `COMPLAINT_NOT_FOUND`: Complaint ID is invalid
- `CONNECTION_VALIDATION_FAILED`: Unable to validate/create connection

### Communication Errors

- `MESSAGE_TOO_LONG`: Message exceeds 1000 characters
- `INVALID_TAGGED_DEPARTMENT`: Tagged department doesn't exist
- `ATTACHMENT_TOO_LARGE`: Attachment exceeds size limit
- `COMMUNICATION_PERMISSION_DENIED`: User cannot add communications

## Testing Strategy

### Unit Tests

1. **Transfer Service Tests**
   - Test transfer validation logic
   - Test connection validation
   - Test permission checks
   - Test transfer status updates

2. **Communication Service Tests**
   - Test message creation
   - Test tagging logic
   - Test read status updates
   - Test notification triggers

3. **Model Tests**
   - Test ComplaintTransfer model validations
   - Test ComplaintCommunication model validations
   - Test DepartmentConnection uniqueness constraint

### Integration Tests

1. **Transfer Flow Tests**
   - Test complete transfer workflow
   - Test accept/reject flows
   - Test notification delivery
   - Test audit logging

2. **Communication Flow Tests**
   - Test message thread creation
   - Test inter-department messaging
   - Test attachment handling

3. **Connection Tests**
   - Test connection creation
   - Test duplicate prevention
   - Test connection validation

### E2E Tests

1. Officer transfers complaint to another department
2. Target department officer accepts transfer
3. Officers communicate about complaint
4. Complaint is escalated
5. Transfer history is displayed correctly

## Security Considerations

1. **Authorization**
   - Validate user permissions on every transfer request
   - Ensure officers can only transfer complaints from their department
   - Admins can transfer any complaint

2. **Data Validation**
   - Sanitize all input data
   - Validate ObjectIds before database queries
   - Limit message and notes length

3. **Audit Logging**
   - Log all transfer operations
   - Log all communication messages
   - Log connection creations/deletions

4. **Rate Limiting**
   - Limit transfer requests per officer (max 10/hour)
   - Limit communication messages (max 50/hour)

## Performance Optimization

1. **Database Indexes**
   - Compound index on (complaint, transferredAt) for transfer history
   - Index on transferStatus for pending transfers query
   - Index on (sourceDepartment, targetDepartment) for connection validation

2. **Caching**
   - Cache department connections (TTL: 1 hour)
   - Cache transfer statistics (TTL: 15 minutes)

3. **Query Optimization**
   - Use lean() for read-only queries
   - Limit transfer history to last 50 records
   - Paginate communication threads

## Deployment Considerations

1. **Database Migration**
   - Create new collections: ComplaintTransfer, ComplaintCommunication, DepartmentConnection
   - Add new fields to Complaint model
   - Create indexes

2. **Backward Compatibility**
   - Existing complaints work without transfer history
   - API versioning for new endpoints

3. **Rollout Strategy**
   - Phase 1: Deploy backend models and APIs
   - Phase 2: Deploy frontend components
   - Phase 3: Enable for pilot departments
   - Phase 4: Full rollout

## Monitoring and Metrics

1. **Transfer Metrics**
   - Total transfers per day/week/month
   - Average transfer time
   - Transfer acceptance rate
   - Most common transfer reasons

2. **Communication Metrics**
   - Messages per complaint
   - Response time between departments
   - Most active communication departments

3. **Performance Metrics**
   - API response times
   - Database query performance
   - Notification delivery success rate

## Future Enhancements

1. **Automated Transfer Routing**
   - AI-based department suggestion
   - Auto-routing based on complaint category

2. **Transfer Templates**
   - Pre-defined transfer reasons with templates
   - Quick transfer for common scenarios

3. **Video/Voice Communication**
   - Real-time communication between officers
   - Video conferencing for complex cases

4. **Transfer Analytics Dashboard**
   - Visual transfer flow diagrams
   - Department performance metrics
   - Bottleneck identification
