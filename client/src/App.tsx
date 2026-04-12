import { Route, Routes, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { Toaster } from 'react-hot-toast';

import MainLayout from './layouts/MainLayout';
import UserLayout from './layouts/UserLayout';
import AdminLayout from './layouts/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import HomePage from './views/HomePage';
import Login from './views/Login';
import Registration from './views/Registration';
import AboutUs from './views/AboutUs';
import Forbidden from './views/Forbidden';


import Items from './views/user/Items';
import MyActivity from './views/user/MyActivity';
import Profile from './views/user/Profile';
import MapView from './views/user/MapView';

import Reports from './views/admin/Reports';
import AdminProfile from './views/admin/AdminProfile';
import AllUsers from './views/admin/AllUsers';
import ManagePosts from './views/admin/ManagePosts';







function App() {
  return (
    <>
      <Routes>
        <Route path="/forbidden" element={<Forbidden />} />

        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutUs />} />

          <Route element={<ProtectedRoute guestOnly />}>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['user']} />}>
          <Route path="/user-dashboard" element={<UserLayout />}>
            <Route index element={<Navigate to="items" replace />} />
            <Route path="items" element={<Items />} />
            <Route path="activity" element={<MyActivity />} />
            <Route path="profile" element={<Profile />} />
            <Route path="map" element={<MapView />} />
          </Route>
        </Route>

        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
          <Route path="/admin-dashboard" element={<AdminLayout />}>
            <Route index element={<Navigate to="users" replace />} />
            <Route path="reports" element={<Reports />} />
            <Route path="posts" element={<ManagePosts />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="users" element={<AllUsers />} />
          </Route>
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
