import { Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layouts/MainLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';

import HomePage from './views/HomePage';
import Login from './views/Login';
import Registration from './views/Registration';
import AboutUs from './views/AboutUs';


import Items from './views/user/Items';
import MyActivity from './views/user/MyActivity';
import Notifications from './views/user/Notifications';
import Profile from './views/user/Profile';

import Reports from './views/admin/Reports';
import AdminProfile from './views/admin/AdminProfile';
import AllUsers from './views/admin/AllUsers';







function App() {
  return (
    <>
      <Routes>
        {/* Main Public Routes Layout */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/about" element={<AboutUs />} />
        </Route>

        {/* User Routes Layout */}
        <Route path="/user-dashboard" element={<UserLayout />}>
          <Route index element={<Navigate to="items" replace />} />
          <Route path="items" element={<Items />} />
          <Route path="activity" element={<MyActivity />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        {/* Admin Routes Layout */}
        <Route path="/admin-dashboard" element={<AdminLayout />}>
          <Route index element={<Navigate to="users" replace />} />
          <Route path="reports" element={<Reports />} />
          <Route path="profile" element={<AdminProfile />} />
          <Route path="users" element={<AllUsers />} />
        </Route>
      </Routes>
      <Toaster
        position="top-center"
        toastOptions={{
          error: {
            duration: 5000,
          },
        }}
      />
    </>
  );
}

export default App;
