import { Outlet } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';

const MainLayout = () => {
    return (
        <>
            <HomeNavbar />
            <main className="container">
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;
