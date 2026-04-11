import { Outlet } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';

const UserLayout = () => {
    return (
        <>
            <UserNavbar />
            <main className="w-full p-0 bg-slate-950">
                <Outlet />
            </main>
        </>
    );
};

export default UserLayout;
