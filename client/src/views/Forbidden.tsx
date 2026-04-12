import { useI18n } from '../i18n/I18nContext';

const Forbidden = () => {
    const { t } = useI18n();
    return (
        <div className="min-h-screen flex flex-col justify-center items-center bg-slate-950 text-slate-100 px-4 font-sans">
            <h1 className="text-4xl md:text-5xl font-bold mb-2">{t('forbidden.title')}</h1>
            <p className="text-lg text-slate-400 text-center max-w-md">{t('forbidden.message')}</p>
        </div>
    );
};

export default Forbidden;
