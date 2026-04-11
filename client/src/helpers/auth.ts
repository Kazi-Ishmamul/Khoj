export type AuthRole = 'user' | 'admin';

export interface JwtPayload {
    exp?: number;
    role?: string;
    user?: {
        role?: string;
        [key: string]: unknown;
    };
    [key: string]: unknown;
}

export interface AuthState {
    token: string | null;
    role: AuthRole | null;
    isAuthenticated: boolean;
}

export const clearAuthStorage = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
};

const isAuthRole = (value: unknown): value is AuthRole => value === 'user' || value === 'admin';

const decodeBase64Url = (value: string) => {
    const normalized = value.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (normalized.length % 4)) % 4);
    const base64 = normalized + padding;
    const binary = atob(base64);
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));

    return new TextDecoder().decode(bytes);
};

export const decodeJwtPayload = (token: string): JwtPayload | null => {
    const parts = token.split('.');

    if (parts.length < 2) {
        return null;
    }

    try {
        return JSON.parse(decodeBase64Url(parts[1]));
    } catch {
        return null;
    }
};

export const readStoredUserRole = (): AuthRole | null => {
    try {
        const userValue = localStorage.getItem('user');

        if (!userValue) {
            return null;
        }

        const parsedUser = JSON.parse(userValue);
        return isAuthRole(parsedUser?.role) ? parsedUser.role : null;
    } catch {
        return null;
    }
};

export const getAuthState = (): AuthState => {
    const token = localStorage.getItem('token');

    if (!token || token === 'null' || token === 'undefined') {
        clearAuthStorage();
        return {
            token: null,
            role: null,
            isAuthenticated: false,
        };
    }

    const payload = decodeJwtPayload(token);

    if (!payload) {
        clearAuthStorage();
        return {
            token: null,
            role: null,
            isAuthenticated: false,
        };
    }

    const fallbackRole = readStoredUserRole();
    const tokenRole = isAuthRole(payload?.role) ? payload.role : null;
    const nestedRole = isAuthRole(payload?.user?.role) ? payload.user?.role : null;
    const role = tokenRole ?? nestedRole ?? fallbackRole;
    const isExpired = typeof payload?.exp === 'number' && Date.now() >= payload.exp * 1000;

    if (isExpired) {
        clearAuthStorage();
        return {
            token: null,
            role: null,
            isAuthenticated: false,
        };
    }

    return {
        token,
        role,
        isAuthenticated: true,
    };
};

export const getDashboardPath = (role: AuthRole | null) => {
    if (role === 'admin') {
        return '/admin-dashboard/users';
    }

    if (role === 'user') {
        return '/user-dashboard/items';
    }

    return '/';
};