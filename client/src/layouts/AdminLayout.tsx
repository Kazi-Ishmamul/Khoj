import { Outlet } from 'react-router-dom';
import AdminNavbar from '../components/AdminNavbar';

const AdminLayout = () => {
    return (
        <>
            <AdminNavbar />
            <main className="container">
                <Outlet />
            </main>
        </>
    );
};

export default AdminLayout;
