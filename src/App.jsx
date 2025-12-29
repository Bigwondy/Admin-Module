import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import UserList from './pages/Users/UserList';
import UserForm from './pages/Users/UserForm';
import RoleList from './pages/Roles/RoleList';
import RoleForm from './pages/Roles/RoleForm';
import AuthListList from './pages/AuthLists/AuthListList';
import AuthListForm from './pages/AuthLists/AuthListForm';
import ApprovalQueueList from './pages/ApprovalQueue/ApprovalQueueList';
import HistoryList from './pages/History/HistoryList';
import ActivityLogs from './pages/Activity/ActivityLogs';

// Placeholder Layout (we will build this in the next task)
import DashboardLayout from './components/layout/DashboardLayout';




function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          
          <Route path="/" element={<Navigate to="/dashboard/users" replace />} />
          

          <Route path="/dashboard" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
              <Route index element={<Navigate to="users" replace />} />
              <Route path="users" element={<UserList />} />
             <Route path="users/new" element={<UserForm />} />
             <Route path="users/edit/:id" element={<UserForm />} />
             
             <Route path="roles" element={<RoleList />} />
             <Route path="roles/new" element={<RoleForm />} />
             <Route path="roles/edit/:id" element={<RoleForm />} />
             
             <Route path="auth-lists" element={<AuthListList />} />
             <Route path="auth-lists/new" element={<AuthListForm />} />
             <Route path="auth-lists/edit/:id" element={<AuthListForm />} />
             
             <Route path="approval-queue" element={<ApprovalQueueList />} />
             <Route path="history" element={<HistoryList />} />
             <Route path="activity" element={<ActivityLogs />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
