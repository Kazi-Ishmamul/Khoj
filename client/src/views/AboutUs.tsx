import dev1 from '../assets/developer pics/dev1.jpg';
import dev2 from '../assets/developer pics/dev2.jpg';
import dev3 from '../assets/developer pics/dev3.jpg';

const developers = [
    {
        name: 'Kazi Ishmamul Haque',
        role: 'Lead Developer',
        description: 'Passionate about learning modern web technologies and coordinating team efforts to build meaningful projects.',
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
        role: 'Backend Developer',
        description: 'Focused on learning database management and building the logic that powers web applications.',
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
        role: 'Frontend Developer',
        description: 'Enthusiastic about creating clean user interfaces and bringing designs to life with code.',
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

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-16 px-4 md:px-8 font-sans w-full relative overflow-hidden">
            
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
                <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
            </div>

            <div className="max-w-7xl mx-auto w-full relative z-10">
                
                {/* Header Section */}
                <div className="text-center mb-24">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-blue-500/30 bg-blue-500/10 backdrop-blur-sm mb-6">
                        <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                        <span className="text-sm font-semibold text-blue-300">OUR TEAM</span>
                    </div>
                    <h1 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight">
                        Meet the Builders
                    </h1>
                    <p className="text-xl text-slate-300 max-w-2xl mx-auto font-medium">
                        Passionate developers united by a mission to help people find what matters most.
                    </p>
                </div>

                {/* Developer Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-12 mb-32">
                    {developers.map((dev, index) => (
                        <div key={index} className="group relative pt-12">
                            <div className="bg-gradient-to-br from-slate-700/50 to-slate-800/50 backdrop-blur-xl rounded-2xl p-8 pt-44 relative border border-slate-600/50 transition-all duration-300 hover:-translate-y-2 hover:border-slate-500/80 hover:bg-slate-700/70">
                                
                                {/* Developer Image */}
                                <div className="absolute -top-12 left-6 right-6 h-56 rounded-2xl overflow-hidden border-4 border-slate-700 shadow-lg transition-all duration-300 group-hover:border-blue-500/50">
                                    <img
                                        src={dev.image}
                                        alt={dev.name}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent group-hover:via-blue-950/20 transition-all duration-300"></div>
                                    
                                    {/* Status Badge */}
                                    <div className="absolute bottom-4 right-4 bg-slate-900/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                        <span className="text-sm font-extrabold text-white">{dev.name}</span>
                                    </div>
                                </div>

                                {/* Card Content */}
                                <div className="relative z-10 pt-4">
                                    <h3 className="text-2xl font-bold text-white mb-3">{dev.role}</h3>
                                    <p className="text-slate-400 leading-relaxed mb-8 min-h-[4rem]">
                                        {dev.description}
                                    </p>

                                    {/* Social Links */}
                                    <div className="flex flex-wrap items-center gap-3">
                                        <a href={dev.socials.gmail} aria-label="Mail" className="text-slate-400 hover:text-red-400 bg-slate-700/50 hover:bg-red-500/20 p-2.5 rounded-full transition-all duration-300 border border-slate-600/50 hover:border-red-500/50"><MailIcon /></a>
                                        <a href={dev.socials.facebook} aria-label="Facebook" className="text-slate-400 hover:text-blue-400 bg-slate-700/50 hover:bg-blue-500/20 p-2.5 rounded-full transition-all duration-300 border border-slate-600/50 hover:border-blue-500/50"><FacebookIcon /></a>
                                        <a href={dev.socials.x} aria-label="X" className="text-slate-400 hover:text-sky-400 bg-slate-700/50 hover:bg-sky-500/20 p-2.5 rounded-full transition-all duration-300 border border-slate-600/50 hover:border-sky-500/50"><XIcon /></a>
                                        <a href={dev.socials.linkedin} aria-label="LinkedIn" className="text-slate-400 hover:text-blue-500 bg-slate-700/50 hover:bg-blue-500/20 p-2.5 rounded-full transition-all duration-300 border border-slate-600/50 hover:border-blue-500/50"><LinkedinIcon /></a>
                                        <a href={dev.socials.github} aria-label="GitHub" className="text-slate-400 hover:text-slate-200 bg-slate-700/50 hover:bg-slate-600/50 p-2.5 rounded-full transition-all duration-300 border border-slate-600/50 hover:border-slate-400/50"><GithubIcon /></a>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mission Section */}
                <div className="relative">
                    <div className="bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-blue-600/20 backdrop-blur-xl rounded-3xl p-10 md:p-16 lg:p-24 border border-slate-600/50">
                        
                        {/* Top accent line */}
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 rounded-t-3xl"></div>
                        
                        {/* Radial gradient effect */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-[radial-gradient(circle,rgba(52,211,153,0.05)_0%,transparent_50%)] pointer-events-none"></div>

                        <div className="relative z-10 max-w-4xl mx-auto">
                            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm mb-6">
                                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span className="text-sm font-semibold text-emerald-300">OUR MISSION</span>
                            </div>
                            
                            <h2 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-8 leading-tight">
                                Bringing lost belongings <br className="hidden md:block" /> back home.
                            </h2>
                            
                            <p className="text-lg md:text-xl text-slate-300 leading-relaxed max-w-3xl mx-auto mb-12 font-light">
                                Khoj is a dedicated platform designed to help individuals find their lost belongings and assist those who have found items in returning them to their rightful owners. We believe that by creating an accessible and easy-to-use platform, we can increase the chances of happy reunions between people and their cherished possessions.
                            </p>

                            {/* Values Pills */}
                            <div className="flex justify-center flex-wrap gap-4">
                                <div className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md rounded-full px-6 py-3 text-white font-medium flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span> 
                                    Trustworthy
                                </div>
                                <div className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md rounded-full px-6 py-3 text-white font-medium flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span> 
                                    Accessible
                                </div>
                                <div className="bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300 backdrop-blur-md rounded-full px-6 py-3 text-white font-medium flex items-center gap-3">
                                    <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span> 
                                    Community Driven
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Stats */}
                <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: "Lines of Code", value: "50K+", icon: "💻" },
                        { label: "Team Members", value: "3", icon: "👥" },
                        { label: "Passion Level", value: "100%", icon: "🔥" }
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-700/30 backdrop-blur-sm rounded-xl p-6 border border-slate-600/50 hover:border-slate-500 transition-all text-center">
                            <div className="text-4xl mb-3">{stat.icon}</div>
                            <p className="text-slate-400 text-sm mb-2 font-medium">{stat.label}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default AboutUs;