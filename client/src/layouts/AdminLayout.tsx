import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

const AdminLayout = () => {
    return (
        <>
            <AdminNavbar />
            <main className="min-h-screen bg-slate-950">
                <Outlet />
            </main>
        </>
    );
};

export default AdminLayout;
