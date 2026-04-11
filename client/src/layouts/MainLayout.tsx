import { Outlet, useLocation } from 'react-router-dom';
import HomeNavbar from '../components/HomeNavbar';

const MainLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    return (
        <>
            <HomeNavbar />
            <main
                className={isHomePage ? 'w-full' : 'container'}
                style={isHomePage ? { padding: 0, margin: 0 } : undefined}
            >
                <Outlet />
            </main>
        </>
    );
};

export default MainLayout;
