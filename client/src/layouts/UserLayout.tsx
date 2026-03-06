import { Outlet } from 'react-router-dom';
import UserNavbar from '../components/UserNavbar';

const UserLayout = () => {
    return (
        <>
            <UserNavbar />
            <main className="container">
                <Outlet />
            </main>
        </>
    );
};

export default UserLayout;
