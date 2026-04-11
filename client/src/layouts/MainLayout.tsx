import { Outlet, useLocation } from 'react-router-dom';
import { useCallback, useEffect, useState } from 'react';
import HomeNavbar from '../components/HomeNavbar';

const HOME_THEME_KEY = 'khoj-home-theme';

const MainLayout = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';

    const [homeIsDark, setHomeIsDark] = useState(() => {
        if (typeof window === 'undefined') return false;
        try {
            return localStorage.getItem(HOME_THEME_KEY) === 'dark';
        } catch {
            return false;
        }
    });

    useEffect(() => {
        if (!isHomePage) {
            document.documentElement.classList.remove('dark');
            return;
        }
        document.documentElement.classList.toggle('dark', homeIsDark);
    }, [isHomePage, homeIsDark]);

    const toggleHomeTheme = useCallback(() => {
        setHomeIsDark((prev) => {
            const next = !prev;
            try {
                localStorage.setItem(HOME_THEME_KEY, next ? 'dark' : 'light');
            } catch {
                /* ignore quota / private mode */
            }
            return next;
        });
    }, []);

    return (
        <>
            <HomeNavbar
                isHomePage={isHomePage}
                homeIsDark={homeIsDark}
                onToggleHomeTheme={toggleHomeTheme}
            />
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
