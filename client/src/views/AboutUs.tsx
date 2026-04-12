import { useI18n } from '../i18n/I18nContext';
import dev1 from '../assets/developer pics/dev1.jpg';
import dev2 from '../assets/developer pics/dev2.jpg';
import dev3 from '../assets/developer pics/dev3.jpg';

const developers = [
    {
        name: 'Kazi Ishmamul Haque',
        image: dev1,
        socials: {
            gmail: 'kaziishmmamulhaque@gmail.com',
            facebook: 'https://www.facebook.com/kazi.ishmamulhaque.1/',
            x: 'https://x.com/KaziIshmamul',
            github: 'https://github.com/Kazi-Ishmamul',
            linkedin: 'https://www.linkedin.com/in/kazi-ishmamul-haque-a52067372/'
        }
    },
    {
        name: 'Faiyaz Fardin',
        image: dev2,
        socials: {
            gmail: 'mailto:faiyazfardin07@gmail.com',
            facebook: 'https://www.facebook.com/faiyaz.fardin.464176/',
            x: 'https://x.com/AdlaceFrost',
            github: 'https://github.com/faiyazfardin',
            linkedin: 'https://www.linkedin.com/in/faiyaz-fardin-4a32381bb/'
        }
    },
    {
        name: 'Shoaib Mugdho',
        image: dev3,
        socials: {
            gmail: 'mailto:shoaibhossainmugdho@gmail.com',
            facebook: 'https://www.facebook.com/share/1ce74DWfSS/?mibextid=wwXIfr',
            x: 'https://x.com/KaziIshmamul',
            github: 'https://github.com/BughunterX9',
            linkedin: 'https://www.linkedin.com/in/kazi-ishmamul-haque-a52067372/'
        }
    }
];

const GithubIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
);

const LinkedinIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" /><rect width="4" height="12" x="2" y="9" /><circle cx="4" cy="4" r="2" /></svg>
);

const XIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
);

const FacebookIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg>
);

const MailIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
);

const devRoleKeys = ['about_page.dev1_role', 'about_page.dev2_role', 'about_page.dev3_role'] as const;
const devDescKeys = ['about_page.dev1_desc', 'about_page.dev2_desc', 'about_page.dev3_desc'] as const;

const AboutUs = () => {
    const { t } = useI18n();
    return (
        <div className="min-h-screen bg-slate-950 py-16 px-4 md:px-8 font-sans w-full text-slate-100">
            <div className="max-w-7xl mx-auto w-full">
                <div className="text-center mb-24">
                    <p className="text-sm font-bold tracking-[0.2em] text-violet-400 uppercase mb-4">{t('about_page.kicker')}</p>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                        {t('about_page.title')}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto font-medium">
                        {t('about_page.tagline')}
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-32">
                    {developers.map((dev, index) => (
                        <div key={index} className="group relative pt-12">
                            <div className="bg-slate-900/70 rounded-[2.5rem] p-8 pt-44 relative shadow-xl border border-slate-800 transition-all duration-300 hover:-translate-y-2 hover:border-slate-700 hover:shadow-2xl hover:shadow-blue-900/20">
                                <div className="absolute -top-12 left-6 right-6 h-56 rounded-[2rem] overflow-hidden bg-slate-800/50 shadow-lg border-4 border-slate-900 transition-all duration-300 group-hover:border-slate-800">
                                    <img
                                        src={dev.image}
                                        alt={dev.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute bottom-4 right-4 bg-slate-900/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span className="text-sm font-extrabold text-white">{dev.name}</span>
                                    </div>
                                </div>

                                <div className="relative z-10 pt-4">
                                    <h3 className="text-2xl font-bold text-white mb-3">{t(devRoleKeys[index])}</h3>
                                    <p className="text-slate-400 leading-relaxed mb-8 min-h-[4rem]">
                                        {t(devDescKeys[index])}
                                    </p>

                                    <div className="flex flex-wrap items-center gap-3">
                                        <a href={dev.socials.gmail} aria-label="Mail" className="text-slate-400 hover:text-red-400 bg-slate-800/60 hover:bg-red-500/20 p-2.5 rounded-full transition-all duration-300"><MailIcon /></a>
                                        <a href={dev.socials.facebook} aria-label="Facebook" className="text-slate-400 hover:text-blue-400 bg-slate-800/60 hover:bg-blue-500/20 p-2.5 rounded-full transition-all duration-300"><FacebookIcon /></a>
                                        <a href={dev.socials.x} aria-label="X" className="text-slate-400 hover:text-sky-400 bg-slate-800/60 hover:bg-sky-500/20 p-2.5 rounded-full transition-all duration-300"><XIcon /></a>
                                        <a href={dev.socials.linkedin} aria-label="LinkedIn" className="text-slate-400 hover:text-blue-400 bg-slate-800/60 hover:bg-blue-500/20 p-2.5 rounded-full transition-all duration-300"><LinkedinIcon /></a>
                                        <a href={dev.socials.github} aria-label="GitHub" className="text-slate-400 hover:text-slate-300 bg-slate-800/60 hover:bg-slate-700 p-2.5 rounded-full transition-all duration-300"><GithubIcon /></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="bg-gradient-to-br from-slate-900/80 to-slate-950 rounded-[3rem] p-10 md:p-16 lg:p-24 text-center relative overflow-hidden shadow-2xl border border-slate-800/60">
                    <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-600 via-violet-600 to-teal-600"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(99,102,241,0.1)_0%,transparent_50%)]"></div>

                    <div className="relative z-10 max-w-4xl mx-auto">
                        <h2 className="text-sm font-bold tracking-[0.2em] text-violet-400 uppercase mb-6">{t('about_page.mission_kicker')}</h2>
                        <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 leading-tight">
                            {t('about_page.mission_title')}
                        </h3>
                        <p className="text-lg md:text-xl text-slate-400 leading-relaxed max-w-3xl mx-auto mb-12 font-light">
                            {t('about_page.mission_body')}
                        </p>

                        <div className="flex justify-center flex-wrap gap-4">
                            <span className="bg-blue-600/20 border border-blue-500/30 hover:bg-blue-600/30 transition-colors backdrop-blur-md rounded-full px-6 py-3 text-blue-300 font-medium flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-blue-400"></span> {t('about_page.pill_trust')}
                            </span>
                            <span className="bg-violet-600/20 border border-violet-500/30 hover:bg-violet-600/30 transition-colors backdrop-blur-md rounded-full px-6 py-3 text-violet-300 font-medium flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-violet-400"></span> {t('about_page.pill_access')}
                            </span>
                            <span className="bg-teal-600/20 border border-teal-500/30 hover:bg-teal-600/30 transition-colors backdrop-blur-md rounded-full px-6 py-3 text-teal-300 font-medium flex items-center gap-3">
                                <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> {t('about_page.pill_community')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs;