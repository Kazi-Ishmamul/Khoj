import { useI18n, type AppLocale } from '../i18n/I18nContext';

type LanguageSwitcherProps = {
    id?: string;
    selectClassName: string;
};

export function LanguageSwitcher({ id = 'app-locale', selectClassName }: LanguageSwitcherProps) {
    const { locale, setLocale, t } = useI18n();

    const onLangChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        await setLocale(e.target.value as AppLocale);
    };

    return (
        <>
            <label htmlFor={id} className="sr-only">
                {t('nav.language')}
            </label>
            <select
                id={id}
                value={locale}
                onChange={onLangChange}
                title={t('nav.language')}
                aria-label={t('nav.language')}
                className={selectClassName}
            >
                <option value="en">EN</option>
                <option value="bn">BN</option>
            </select>
        </>
    );
}
