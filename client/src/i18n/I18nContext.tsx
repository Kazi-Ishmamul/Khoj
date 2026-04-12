import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { secrets } from '../secrets';
import bundledEn from '../locales/bundled-en.json';
import bundledBn from '../locales/bundled-bn.json';

export type AppLocale = 'en' | 'bn';

type Messages = typeof bundledEn;

function getByPath(obj: Record<string, unknown>, path: string): string {
    const parts = path.split('.');
    let cur: unknown = obj;
    for (const p of parts) {
        if (cur === null || typeof cur !== 'object' || !(p in (cur as object))) {
            return path;
        }
        cur = (cur as Record<string, unknown>)[p];
    }
    return typeof cur === 'string' ? cur : path;
}

type I18nContextValue = {
    locale: AppLocale;
    loading: boolean;
    t: (key: string) => string;
    setLocale: (next: AppLocale) => Promise<void>;
};

const I18nContext = createContext<I18nContextValue | null>(null);

const bundled: Record<AppLocale, Messages> = {
    en: bundledEn as Messages,
    bn: bundledBn as Messages,
};

function localeBaseUrl(): string {
    const ep = secrets.backendEndpoint || 'http://localhost:8000/api';
    return ep.replace(/\/?api\/?$/i, '') || 'http://localhost:8000';
}

export function I18nProvider({ children }: { children: React.ReactNode }) {
    const [locale, setLocaleState] = useState<AppLocale>('en');
    const [messages, setMessages] = useState<Messages>(bundledEn as Messages);
    const [loading, setLoading] = useState(true);

    const applyDocumentLang = useCallback((loc: AppLocale) => {
        document.documentElement.lang = loc === 'bn' ? 'bn' : 'en';
    }, []);

    const loadFromServer = useCallback(async (path: string) => {
        const base = localeBaseUrl();
        const { data } = await axios.get<{ locale: AppLocale; messages: Messages }>(`${base}${path}`, {
            withCredentials: true,
        });
        return data;
    }, []);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await loadFromServer('/api/locale/current');
                if (cancelled) return;
                const loc = data.locale === 'bn' ? 'bn' : 'en';
                setLocaleState(loc);
                setMessages(data.messages && Object.keys(data.messages).length ? data.messages : bundled[loc]);
                applyDocumentLang(loc);
            } catch {
                if (cancelled) return;
                setLocaleState('en');
                setMessages(bundledEn as Messages);
                applyDocumentLang('en');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [loadFromServer, applyDocumentLang]);

    const setLocale = useCallback(
        async (next: AppLocale) => {
            try {
                const data = await loadFromServer(`/api/locale/use/${next}`);
                setLocaleState(next);
                setMessages(data.messages && Object.keys(data.messages).length ? data.messages : bundled[next]);
                applyDocumentLang(next);
            } catch {
                setLocaleState(next);
                setMessages(bundled[next]);
                applyDocumentLang(next);
            }
        },
        [loadFromServer, applyDocumentLang]
    );

    const t = useCallback(
        (key: string) => getByPath(messages as unknown as Record<string, unknown>, key),
        [messages]
    );

    const value = useMemo(
        () => ({
            locale,
            loading,
            t,
            setLocale,
        }),
        [locale, loading, t, setLocale]
    );

    return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
    const ctx = useContext(I18nContext);
    if (!ctx) {
        throw new Error('useI18n must be used within I18nProvider');
    }
    return ctx;
}
