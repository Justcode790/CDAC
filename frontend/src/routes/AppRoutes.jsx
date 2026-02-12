/**
 * SUVIDHA 2026 - Application Routes
 * 
 * Defines all routes and their protection levels
 */

import { Routes, Route } from 'react-router-dom';
import { ROUTES, ROLES } from '../utils/constants';
import ProtectedRoute from '../components/ProtectedRoute';

// Pages
import Landing from '../pages/Landing';
import PublicTrack from '../pages/PublicTrack';

// Citizen Pages (will be created)
import CitizenLogin from '../pages/citizen/CitizenLogin';
import CitizenRegister from '../pages/citizen/CitizenRegister';
import CitizenDashboard from '../pages/citizen/CitizenDashboard';
import NewComplaint from '../pages/citizen/NewComplaint';
import NewServiceRequest from '../pages/citizen/NewServiceRequest';
import TrackComplaint from '../pages/citizen/TrackComplaint';

// Officer Pages (will be created)
import OfficerLogin from '../pages/officer/OfficerLogin';
import OfficerDashboard from '../pages/officer/OfficerDashboard';
import ComplaintDetails from '../pages/officer/ComplaintDetails';
import PendingTransfers from '../pages/officer/PendingTransfers';

// Admin Pages (will be created)
import AdminLogin from '../pages/admin/AdminLogin';
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminDepartments from '../pages/admin/AdminDepartments';
import AdminSubDepartments from '../pages/admin/AdminSubDepartments';
import AdminOfficers from '../pages/admin/AdminOfficers';

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path={ROUTES.LANDING} element={<Landing />} />
      <Route path="/track" element={<PublicTrack />} />

      {/* Citizen Routes */}
      <Route path={ROUTES.CITIZEN_LOGIN} element={<CitizenLogin />} />
      <Route path={ROUTES.CITIZEN_REGISTER} element={<CitizenRegister />} />
      <Route
        path={ROUTES.CITIZEN_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={[ROLES.PUBLIC]}>
            <CitizenDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_NEW_COMPLAINT}
        element={
          <ProtectedRoute allowedRoles={[ROLES.PUBLIC]}>
            <NewComplaint />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.CITIZEN_TRACK_COMPLAINT}
        element={
          <ProtectedRoute allowedRoles={[ROLES.PUBLIC]}>
            <TrackComplaint />
          </ProtectedRoute>
        }
      />
      <Route
        path="/citizen/new-service-request"
        element={
          <ProtectedRoute allowedRoles={[ROLES.PUBLIC]}>
            <NewServiceRequest />
          </ProtectedRoute>
        }
      />

      {/* Officer Routes */}
      <Route path={ROUTES.OFFICER_LOGIN} element={<OfficerLogin />} />
      <Route
        path={ROUTES.OFFICER_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICER]}>
            <OfficerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/complaint/:id"
        element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICER]}>
            <ComplaintDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/officer/pending-transfers"
        element={
          <ProtectedRoute allowedRoles={[ROLES.OFFICER]}>
            <PendingTransfers />
          </ProtectedRoute>
        }
      />

      {/* Admin Routes */}
      <Route path={ROUTES.ADMIN_LOGIN} element={<AdminLogin />} />
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_DEPARTMENTS}
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminDepartments />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_SUBDEPARTMENTS}
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminSubDepartments />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.ADMIN_OFFICERS}
        element={
          <ProtectedRoute allowedRoles={[ROLES.ADMIN, ROLES.SUPER_ADMIN]}>
            <AdminOfficers />
          </ProtectedRoute>
        }
      />

      {/* 404 - Redirect to landing */}
      <Route path="*" element={<Landing />} />
    </Routes>
  );
};

export default AppRoutes;
