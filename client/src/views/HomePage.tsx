import { Link } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';

/* ─────────────────────────── tiny helpers ─────────────────────────── */

const Floating = ({ children, delay = 0, amplitude = 12 }: {
    children: React.ReactNode;
    delay?: number;
    amplitude?: number;
}) => (
    <div
        style={{
            animation: `floatY ${3 + delay * 0.4}s ease-in-out infinite`,
            animationDelay: `${delay * 0.3}s`,
            '--amp': `${amplitude}px`,
        } as React.CSSProperties}
    >
        {children}
    </div>
);

const Stat = ({ value, label, icon }: { value: string; label: string; icon: string }) => {
    const [displayed, setDisplayed] = useState('0');
    const ref = useRef<HTMLDivElement>(null);
    const animated = useRef(false);

    useEffect(() => {
        const obs = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting && !animated.current) {
                animated.current = true;
                const target = parseInt(value.replace(/\D/g, '') || '0');
                const suffix = value.replace(/[0-9]/g, '');
                let start = 0;
                const step = Math.ceil(target / 60);
                const timer = setInterval(() => {
                    start = Math.min(start + step, target);
                    setDisplayed(start + suffix);
                    if (start >= target) clearInterval(timer);
                }, 20);
            }
        }, { threshold: 0.5 });
        if (ref.current) obs.observe(ref.current);
        return () => obs.disconnect();
    }, [value]);

    return (
        <div ref={ref} className="text-center group">
            <div className="text-3xl mb-2">{icon}</div>
            <div className="text-4xl md:text-5xl font-black text-slate-800 dark:text-white mb-1 tabular-nums transition-colors duration-300">{displayed}</div>
            <div className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest transition-colors duration-300">{label}</div>
        </div>
    );
};

const FaqItem = ({ question, answer, index }: { question: string; answer: string; index: number }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div
            className="group rounded-2xl border border-slate-200 bg-white/90 overflow-hidden hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900/70 dark:hover:border-slate-700 transition-all duration-300"
            style={{ animationDelay: `${index * 0.05}s` }}
        >
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-5 flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors duration-200"
            >
                <span className="font-bold text-slate-900 dark:text-white text-left text-sm">{question}</span>
                <span className={`text-xl text-slate-500 dark:text-slate-400 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}>
                    ▼
                </span>
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ${isOpen ? 'max-h-48' : 'max-h-0'}`}
            >
                <p className="px-6 pb-5 text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                    {answer}
                </p>
            </div>
        </div>
    );
};

/* ─────────────────────────── data ─────────────────────────── */

const HOW_IT_WORKS = [
    {
        step: '01',
        icon: '📢',
        title: 'Post Your Item',
        desc: 'Lost something? Found something? Post it in seconds — add a photo, location, date, and contact info.',
        color: 'from-sky-500/20 to-blue-600/10',
        border: 'border-sky-500/30',
        dot: 'bg-sky-400',
        linkTo: '/user-dashboard/items?focus=post',
    },
    {
        step: '02',
        icon: '🔍',
        title: 'Search & Discover',
        desc: 'Browse the live database or let our Gemini-powered AI search understand what you\'re looking for — even in natural language.',
        color: 'from-violet-500/20 to-purple-600/10',
        border: 'border-violet-500/30',
        dot: 'bg-violet-400',
        linkTo: '/user-dashboard/items?focus=search',
    },
    {
        step: '03',
        icon: '🤝',
        title: 'Claim & Resolve',
        desc: 'Found a match? Send a claim request. The poster reviews it and accepts — marking the item as officially resolved.',
        color: 'from-emerald-500/20 to-teal-600/10',
        border: 'border-emerald-500/30',
        dot: 'bg-emerald-400',
        linkTo: '/user-dashboard/activity?tab=claims_received',
    },
];

const FEATURES = [
    {
        icon: '✨',
        title: 'AI-Powered Matching',
        desc: 'Advanced Gemini AI engine intelligently matches lost and found items, understanding context, location, and descriptions to surface relevant results instantly.',
        badge: 'Gemini AI',
        badgeColor: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
        glow: 'shadow-violet-900/30',
    },
    {
        icon: '🛡️',
        title: 'Community Moderation',
        desc: 'Built-in reporting system with dedicated admin review. Suspected fraud or inappropriate listings are investigated and struck to maintain community trust.',
        badge: 'Trust & Safety',
        badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        glow: 'shadow-rose-900/30',
    },
    {
        icon: '⚡',
        title: 'Fast & Secure',
        desc: 'Optimized for speed with secure authentication, encrypted communications, and verified user profiles to ensure safe transactions and quick reunions.',
        badge: 'Performance',
        badgeColor: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        glow: 'shadow-cyan-900/30',
    },
];

const CATEGORIES = [
    { name: 'Electronics', icon: '📱', count: '128 items', color: 'text-sky-400' },
    { name: 'Wallets & Cards', icon: '💳', count: '94 items', color: 'text-emerald-400' },
    { name: 'Bags & Luggage', icon: '🎒', count: '76 items', color: 'text-violet-400' },
    { name: 'Jewellery', icon: '💍', count: '52 items', color: 'text-amber-400' },
];

/* ─────────────────────────── component ─────────────────────────── */

export default function HomePage() {
    return (
        <>
            {/* ── Keyframe styles ── */}
            <style>{`
                @keyframes floatY {
                    0%, 100% { transform: translateY(0px); }
                    50%       { transform: translateY(calc(-1 * var(--amp, 12px))); }
                }
                @keyframes gradientShift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                @keyframes pulseRing {
                    0%   { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0.4); }
                    70%  { transform: scale(1);    box-shadow: 0 0 0 16px rgba(99,102,241,0); }
                    100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(99,102,241,0); }
                }
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(24px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
                .fade-up { animation: fadeUp 0.7s ease forwards; }
                .fade-up-delay-1 { animation: fadeUp 0.7s 0.15s ease both; }
                .fade-up-delay-2 { animation: fadeUp 0.7s 0.30s ease both; }
                .fade-up-delay-3 { animation: fadeUp 0.7s 0.45s ease both; }
                .fade-up-delay-4 { animation: fadeUp 0.7s 0.60s ease both; }
                .gradient-text {
                    background: linear-gradient(135deg, #0f172a, #1d4ed8, #6d28d9, #047857);
                    background-size: 300% 300%;
                    animation: gradientShift 6s ease infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .dark .gradient-text {
                    background: linear-gradient(135deg, #e2e8f0, #93c5fd, #c4b5fd, #6ee7b7);
                    background-size: 300% 300%;
                    animation: gradientShift 6s ease infinite;
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }
                .hero-grid {
                    background-image:
                        linear-gradient(rgba(15,23,42,0.06) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(15,23,42,0.06) 1px, transparent 1px);
                    background-size: 48px 48px;
                }
                .dark .hero-grid {
                    background-image:
                        linear-gradient(rgba(148,163,184,0.04) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(148,163,184,0.04) 1px, transparent 1px);
                }
                .card-hover {
                    transition: transform 0.25s ease, box-shadow 0.25s ease;
                }
                .card-hover:hover {
                    transform: translateY(-4px);
                }
            `}</style>

            <div className="min-h-screen bg-slate-50 text-slate-900 transition-[background-color,color] duration-300 dark:bg-slate-950 dark:text-slate-100 overflow-x-hidden">

                {/* ════════════════════════════════════════════════
                    HERO
                ════════════════════════════════════════════════ */}
                <section className="relative min-h-screen flex flex-col items-center justify-center hero-grid overflow-hidden">

                    {/* Background glows */}
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[-10rem] left-[-8rem] w-[40rem] h-[40rem] rounded-full bg-blue-500/20 blur-[120px] dark:bg-blue-600/10" />
                        <div className="absolute top-[10rem] right-[-8rem] w-[36rem] h-[36rem] rounded-full bg-purple-500/15 blur-[120px] dark:bg-purple-600/10" />
                        <div className="absolute bottom-[-6rem] left-1/2 -translate-x-1/2 w-[50rem] h-[24rem] rounded-full bg-indigo-400/15 blur-[100px] dark:bg-indigo-800/10" />
                    </div>

                    {/* Hero content */}
                    <div className="relative z-10 max-w-5xl mx-auto px-6 text-center pt-12 pb-20">

                        {/* Badge */}
                        <div className="fade-up inline-flex items-center gap-2 bg-white/80 border border-slate-200/80 rounded-full px-5 py-2 mb-10 backdrop-blur-sm dark:bg-slate-800/70 dark:border-slate-700/60 transition-colors duration-300">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse dark:bg-emerald-400" />
                            <span className="text-xs font-bold text-slate-600 uppercase tracking-widest dark:text-slate-300">
                                AI-Powered Lost &amp; Found Portal
                            </span>
                        </div>

                        {/* Headline */}
                        <h1 className="fade-up-delay-1 text-5xl sm:text-6xl md:text-8xl font-black leading-none mb-8">
                            <span className="block text-slate-900 mb-2 dark:text-white transition-colors duration-300">Lost something?</span>
                            <span className="gradient-text">Khoj finds it.</span>
                        </h1>

                        {/* Sub-headline */}
                        <p className="fade-up-delay-2 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-12 leading-relaxed font-medium dark:text-slate-400 transition-colors duration-300">
                            Report lost &amp; found items, let Gemini AI match them intelligently,
                            claim ownership and reunite with your belongings — all in one place.
                        </p>

                        {/* CTAs */}
                        <div className="fade-up-delay-3 flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                            <Link
                                to="/register"
                                className="group flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-base shadow-2xl shadow-blue-900/40 transition-all duration-300 hover:shadow-blue-800/60 hover:scale-105"
                                style={{ textDecoration: 'none' }}
                            >
                                <span>Get Started</span>
                                <span className="text-xl group-hover:translate-x-1 transition-transform duration-200">→</span>
                            </Link>
                            <Link
                                to="/login"
                                className="flex items-center gap-3 px-8 py-4 rounded-2xl border border-slate-300 text-slate-700 hover:text-slate-900 hover:border-slate-400 font-semibold text-base hover:bg-white/80 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white dark:hover:border-slate-500 dark:hover:bg-slate-800/60 transition-all duration-300"
                                style={{ textDecoration: 'none' }}
                            >
                                <span className="text-xl">🔐</span>
                                <span>Sign In</span>
                            </Link>
                        </div>

                        {/* Floating item cards */}
                        <div className="fade-up-delay-4 relative flex items-end justify-center gap-4 h-44 pointer-events-none select-none">
                            <Floating delay={0} amplitude={10}>
                                <div className="bg-white/95 border border-slate-200/80 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm flex items-center gap-3 text-left dark:bg-slate-900/90 dark:border-slate-700/60 dark:shadow-xl transition-colors duration-300">
                                    <span className="text-2xl">📱</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">iPhone 14 Pro</p>
                                        <p className="text-[10px] text-rose-600 font-semibold dark:text-rose-400">🔴 LOST · Dhaka</p>
                                    </div>
                                </div>
                            </Floating>
                            <Floating delay={2} amplitude={16}>
                                <div className="bg-white/95 border border-emerald-500/40 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm flex items-center gap-3 text-left scale-110 dark:bg-slate-900/90 dark:border-emerald-500/30 dark:shadow-xl transition-colors duration-300">
                                    <span className="text-2xl">✨</span>
                                    <div>
                                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-300">AI Match Found!</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">98% confidence</p>
                                    </div>
                                </div>
                            </Floating>
                            <Floating delay={1} amplitude={8}>
                                <div className="bg-white/95 border border-slate-200/80 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm flex items-center gap-3 text-left dark:bg-slate-900/90 dark:border-slate-700/60 dark:shadow-xl transition-colors duration-300">
                                    <span className="text-2xl">💳</span>
                                    <div>
                                        <p className="text-xs font-bold text-slate-900 dark:text-white">Blue Wallet</p>
                                        <p className="text-[10px] text-emerald-600 font-semibold dark:text-emerald-400">🟢 FOUND · Chittagong</p>
                                    </div>
                                </div>
                            </Floating>
                            <Floating delay={3} amplitude={12}>
                                <div className="bg-white/95 border border-violet-400/40 rounded-2xl px-4 py-3 shadow-lg backdrop-blur-sm flex items-center gap-3 text-left dark:bg-slate-900/90 dark:border-violet-500/30 dark:shadow-xl transition-colors duration-300">
                                    <span className="text-2xl">🔔</span>
                                    <div>
                                        <p className="text-xs font-bold text-violet-700 dark:text-violet-300">Claim Accepted!</p>
                                        <p className="text-[10px] text-slate-500 dark:text-slate-400">Just now</p>
                                    </div>
                                </div>
                            </Floating>
                        </div>
                    </div>

                    {/* Scroll indicator */}
                    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-bounce opacity-50 dark:opacity-40">
                        <div className="w-px h-8 bg-gradient-to-b from-transparent to-slate-500 dark:to-slate-400" />
                        <span className="text-[10px] text-slate-500 uppercase tracking-widest">scroll</span>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════
                    STATS
                ════════════════════════════════════════════════ */}
                <section className="relative py-20 border-y border-slate-200/80 dark:border-slate-800/60 transition-colors duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-100 via-white to-slate-100 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 transition-colors duration-300" />
                    <div className="relative max-w-5xl mx-auto px-6">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
                            <Stat value="500+" label="Items Posted" icon="📦" />
                            <Stat value="320+" label="Successfully Resolved" icon="✅" />
                            <Stat value="1200+" label="Registered Users" icon="👥" />
                            <Stat value="98%" label="AI Match Accuracy" icon="🤖" />
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════
                    HOW IT WORKS
                ════════════════════════════════════════════════ */}
                <section className="py-28 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <p className="text-xs font-bold text-violet-600 uppercase tracking-[0.3em] mb-4 dark:text-violet-400">How It Works</p>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 transition-colors duration-300">
                                Three steps to reunion
                            </h2>
                            <p className="text-slate-600 text-lg max-w-xl mx-auto dark:text-slate-400 transition-colors duration-300">
                                Khoj is designed to get your belongings back as fast as possible.
                            </p>
                        </div>

                        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Connector line (desktop) */}
                            <div className="hidden md:block absolute top-14 left-[16.5%] right-[16.5%] h-px bg-gradient-to-r from-sky-500/40 via-violet-500/40 to-emerald-500/40 pointer-events-none" />

                            {HOW_IT_WORKS.map((step) => (
                                <Link
                                    key={step.step}
                                    to={step.linkTo}
                                    className={`card-hover relative block bg-gradient-to-br ${step.color} border ${step.border} rounded-3xl p-8 backdrop-blur-sm text-left no-underline text-inherit cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/60 focus-visible:ring-offset-2 focus-visible:ring-offset-white dark:focus-visible:ring-offset-slate-950`}
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl mb-6 bg-white/70 border ${step.border} shadow-md dark:bg-slate-900/60 dark:shadow-lg`}>
                                        {step.icon}
                                    </div>
                                    <div className="absolute top-8 right-8">
                                        <span className="text-6xl font-black text-slate-900/[0.06] select-none pointer-events-none dark:text-white/5">{step.step}</span>
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 dark:text-white transition-colors duration-300">{step.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400 transition-colors duration-300">{step.desc}</p>
                                    <div className={`mt-6 w-8 h-1 rounded-full ${step.dot}`} />
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════
                    AI SPOTLIGHT
                ════════════════════════════════════════════════ */}
                <section className="py-28 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60rem] h-[30rem] rounded-full bg-violet-300/30 blur-[100px] dark:bg-violet-900/10" />
                    </div>

                    <div className="relative max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

                            {/* Left: text */}
                            <div>
                                <div className="inline-flex items-center gap-2 bg-violet-500/15 border border-violet-400/40 rounded-full px-4 py-1.5 mb-6 dark:bg-violet-500/10 dark:border-violet-500/30">
                                    <span className="w-2 h-2 rounded-full bg-violet-500 animate-pulse dark:bg-violet-400" />
                                    <span className="text-xs font-bold text-violet-800 uppercase tracking-widest dark:text-violet-300">Gemini AI</span>
                                </div>
                                <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-6 transition-colors duration-300">
                                    Don't just search. <br />
                                    <span className="gradient-text">Think out loud.</span>
                                </h2>
                                <p className="text-slate-600 text-lg leading-relaxed mb-8 dark:text-slate-400 transition-colors duration-300">
                                    Type exactly what happened — <em className="text-slate-800 dark:text-slate-300">"I lost my black backpack near the TSC canteen on Tuesday evening"</em> — and Gemini understands the context, location, and time to surface the best matches from the entire database.
                                </p>
                                <ul className="space-y-3 mb-10">
                                    {[
                                        ['✨', 'Proactive Smart Suggestions — we find matches before you search'],
                                        ['🧠', 'Semantic Search — natural language, not just keywords'],
                                        ['📍', 'Location-aware ranking for nearby results'],
                                        ['🔄', 'Results cached intelligently for blazing speed'],
                                    ].map(([icon, text]) => (
                                        <li key={text} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                                            <span className="text-base mt-0.5 flex-shrink-0">{icon}</span>
                                            <span>{text}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    to="/register"
                                    className="inline-flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white font-bold shadow-xl shadow-violet-900/30 transition-all hover:scale-105"
                                    style={{ textDecoration: 'none' }}
                                >
                                    Try AI Search <span>→</span>
                                </Link>
                            </div>

                            {/* Right: mock search UI */}
                            <div className="relative">
                                <div className="bg-white/90 border border-slate-200/80 rounded-3xl p-6 backdrop-blur-xl shadow-xl dark:bg-slate-900/80 dark:border-slate-700/60 dark:shadow-2xl transition-colors duration-300">
                                    {/* Search bar */}
                                    <div className="flex items-center gap-3 bg-slate-100/90 border border-violet-400/50 rounded-2xl px-4 py-3 mb-6 ring-4 ring-violet-500/10 dark:bg-slate-800/80 dark:border-violet-500/40">
                                        <span className="flex h-2.5 w-2.5 relative">
                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-violet-400 opacity-75" />
                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-violet-500" />
                                        </span>
                                        <span className="text-sm text-slate-700 font-medium dark:text-slate-300">black backpack near TSC canteen...</span>
                                        <div className="ml-auto bg-violet-600 hover:bg-violet-500 text-white rounded-lg px-3 py-1.5 text-xs font-bold cursor-pointer">Ask AI</div>
                                    </div>

                                    {/* Result cards */}
                                    <p className="text-xs font-bold text-violet-700 uppercase tracking-widest mb-3 dark:text-violet-400">AI Results — 3 matches</p>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Black Adidas Backpack', location: 'TSC Area, Dhaka', date: 'Apr 9', match: '97%', status: 'found', matchColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
                                            { name: 'Dark Bag with Laptop Inside', location: 'TSC Canteen', date: 'Apr 8', match: '84%', status: 'found', matchColor: 'bg-sky-500/15 text-sky-300 border-sky-500/30' },
                                            { name: 'Black Canvas Bag', location: 'Near University Gate', date: 'Apr 7', match: '71%', status: 'found', matchColor: 'bg-slate-700 text-slate-300 border-slate-600' },
                                        ].map((item) => (
                                            <div key={item.name} className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-xl p-3 dark:bg-slate-800/60 dark:border-slate-700/60">
                                                <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-2xl flex-shrink-0 dark:bg-slate-700">🎒</div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-bold text-slate-900 truncate dark:text-white">{item.name}</p>
                                                    <p className="text-xs text-slate-500">📍 {item.location} · {item.date}</p>
                                                </div>
                                                <span className={`flex-shrink-0 text-xs font-bold px-2.5 py-1 rounded-full border ${item.matchColor}`}>
                                                    {item.match}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Decorative floating badge */}
                                <div className="absolute -top-4 -right-4 bg-gradient-to-br from-violet-600 to-purple-700 text-white rounded-2xl px-4 py-2 shadow-xl text-xs font-black uppercase tracking-wide">
                                    Gemini AI ✨
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════
                    FEATURES GRID
                ════════════════════════════════════════════════ */}
                <section className="py-28 px-6">
                    <div className="max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <p className="text-xs font-bold text-sky-600 uppercase tracking-[0.3em] mb-4 dark:text-sky-400">Core Features</p>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 transition-colors duration-300">
                                Intelligent & Secure
                            </h2>
                            <p className="text-slate-600 text-lg max-w-xl mx-auto dark:text-slate-400 transition-colors duration-300">
                                Advanced AI matching combined with trusted community moderation ensures fast, safe recoveries.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {FEATURES.map((feat) => (
                                <div
                                    key={feat.title}
                                    className={`card-hover bg-white/90 border border-slate-200 rounded-3xl p-7 hover:border-slate-300 shadow-lg dark:bg-slate-900/70 dark:border-slate-800 dark:hover:border-slate-600 dark:shadow-xl transition-colors duration-300 ${feat.glow}`}
                                >
                                    <div className="text-4xl mb-5">{feat.icon}</div>
                                    <span className={`inline-block text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border mb-4 ${feat.badgeColor}`}>
                                        {feat.badge}
                                    </span>
                                    <h3 className="text-xl font-bold text-slate-900 mb-3 dark:text-white transition-colors duration-300">{feat.title}</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed dark:text-slate-400 transition-colors duration-300">{feat.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════
                    CATEGORIES
                ════════════════════════════════════════════════ */}
                <section className="py-20 px-6">
                    <div className="max-w-4xl mx-auto">
                        <div className="text-center mb-14">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.3em] mb-4 dark:text-emerald-400">Popular Categories</p>
                            <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white transition-colors duration-300">Start browsing</h2>
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {CATEGORIES.map((cat) => (
                                <Link
                                    key={cat.name}
                                    to="/login"
                                    className="card-hover group bg-white/90 border border-slate-200 hover:border-slate-300 rounded-2xl p-5 text-center block transition-all dark:bg-slate-900/70 dark:border-slate-800 dark:hover:border-slate-600"
                                    style={{ textDecoration: 'none' }}
                                >
                                    <div className="text-4xl mb-3 group-hover:scale-110 transition-transform duration-200">{cat.icon}</div>
                                    <p className={`font-bold text-sm ${cat.color} mb-1`}>{cat.name}</p>
                                    <p className="text-xs text-slate-500">{cat.count}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </section>


                {/* ════════════════════════════════════════════════
                    SUCCESS STORIES
                ════════════════════════════════════════════════ */}
                <section className="py-28 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[40rem] h-[20rem] rounded-full bg-emerald-200/40 blur-[100px] dark:bg-emerald-900/10" />
                    </div>

                    <div className="relative max-w-6xl mx-auto">
                        <div className="text-center mb-20">
                            <p className="text-xs font-bold text-emerald-600 uppercase tracking-[0.3em] mb-4 dark:text-emerald-400">Success Stories</p>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 transition-colors duration-300">
                                Reunited with their belongings
                            </h2>
                            <p className="text-slate-600 text-lg max-w-xl mx-auto dark:text-slate-400 transition-colors duration-300">
                                Real stories from real people who recovered their lost items through Khoj.
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {/* Story 1 */}
                            <div className="card-hover bg-gradient-to-br from-emerald-500/10 to-teal-600/10 border border-emerald-500/30 rounded-3xl p-8 backdrop-blur-sm hover:border-emerald-500/60">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-2xl font-bold text-white">
                                        AK
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Arjun Khan</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Dhaka</p>
                                    </div>
                                </div>
                                <p className="text-slate-700 mb-4 leading-relaxed dark:text-slate-300">
                                    "Lost my MacBook, thought it was gone forever. Khoj's AI found it within 2 hours. Amazing service!"
                                </p>
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-amber-400">⭐</span>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">Recovered in 2 hours • 💻 Electronics</p>
                            </div>

                            {/* Story 2 */}
                            <div className="card-hover bg-gradient-to-br from-sky-500/10 to-blue-600/10 border border-sky-500/30 rounded-3xl p-8 backdrop-blur-sm hover:border-sky-500/60">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center text-2xl font-bold text-white">
                                        SR
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Sarah Rahman</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Chittagong</p>
                                    </div>
                                </div>
                                <p className="text-slate-700 mb-4 leading-relaxed dark:text-slate-300">
                                    "Found someone's important documents here. The community helped me return them. Love this!"
                                </p>
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-amber-400">⭐</span>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">Reunited in 24 hours • 📄 Documents</p>
                            </div>

                            {/* Story 3 */}
                            <div className="card-hover bg-gradient-to-br from-violet-500/10 to-purple-600/10 border border-violet-500/30 rounded-3xl p-8 backdrop-blur-sm hover:border-violet-500/60">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-2xl font-bold text-white">
                                        MH
                                    </div>
                                    <div>
                                        <p className="font-bold text-slate-900 dark:text-white">Marzin Hassan</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400">Sylhet</p>
                                    </div>
                                </div>
                                <p className="text-slate-700 mb-4 leading-relaxed dark:text-slate-300">
                                    "My heirloom ring was missing for weeks. Found it through a perfect AI match. Grateful forever!"
                                </p>
                                <div className="flex items-center gap-1 mb-3">
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className="text-amber-400">⭐</span>
                                    ))}
                                </div>
                                <p className="text-xs text-slate-500">Recovered in 3 weeks • 💍 Jewellery</p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════
                    LIVE ACTIVITY FEED
                ════════════════════════════════════════════════ */}
                <section className="py-28 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute bottom-0 right-0 w-[40rem] h-[20rem] rounded-full bg-rose-200/35 blur-[100px] dark:bg-rose-900/10" />
                    </div>

                    <div className="relative max-w-4xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold text-rose-600 uppercase tracking-[0.3em] mb-4 dark:text-rose-400">Live Activity</p>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight transition-colors duration-300">
                                Happening right now
                            </h2>
                        </div>

                        <div className="space-y-3 max-h-96 overflow-hidden relative">
                            {[
                                { emoji: '🔴', action: 'Maria lost', item: 'Red AirPods', location: 'AIUB Library', time: '2 mins ago' },
                                { emoji: '🟢', action: 'Ahmed found', item: 'Blue Wallet', location: 'Dhanmondi Lake', time: '5 mins ago' },
                                { emoji: '✨', action: 'AI matched', item: 'Black Backpack ↔️ Dark Bag', match: '94%', time: '7 mins ago' },
                                { emoji: '🔔', action: 'Claim accepted', item: 'iPhone 13 recovered', person: 'by Tarek', time: '12 mins ago' },
                                { emoji: '🔴', action: 'Rashid lost', item: 'Car Keys', location: 'Gulshan Mall', time: '15 mins ago' },
                            ].map((activity, i) => (
                                <div
                                    key={i}
                                    className="flex items-center gap-4 p-4 rounded-2xl bg-white/90 border border-slate-200 hover:border-slate-300 transition-all duration-300 hover:translate-x-1 dark:bg-slate-900/70 dark:border-slate-800 dark:hover:border-slate-700"
                                    style={{ animationDelay: `${i * 100}ms` }}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl dark:bg-slate-800">
                                        {activity.emoji}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-semibold text-slate-900 dark:text-white">
                                            {activity.action} <span className="text-slate-600 dark:text-slate-400">{activity.item}</span>
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {activity.location && `📍 ${activity.location}`}
                                            {activity.match && `• ${activity.match} match`}
                                            {activity.person && `${activity.person}`}
                                        </p>
                                    </div>
                                    <p className="text-xs text-slate-500 flex-shrink-0 dark:text-slate-600">{activity.time}</p>
                                </div>
                            ))}

                            {/* Gradient fade at bottom */}
                            <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none dark:from-slate-950" />
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════
                    FAQ SECTION
                ════════════════════════════════════════════════ */}
                <section className="py-28 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 right-0 -translate-y-1/2 w-[30rem] h-[30rem] rounded-full bg-sky-200/40 blur-[100px] dark:bg-sky-900/10" />
                    </div>

                    <div className="relative max-w-3xl mx-auto">
                        <div className="text-center mb-16">
                            <p className="text-xs font-bold text-sky-600 uppercase tracking-[0.3em] mb-4 dark:text-sky-400">FAQ</p>
                            <h2 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white leading-tight mb-4 transition-colors duration-300">
                                Questions? We have answers.
                            </h2>
                            <p className="text-slate-600 text-lg dark:text-slate-400 transition-colors duration-300">
                                Everything you need to know about Khoj and how it works.
                            </p>
                        </div>

                        <div className="space-y-3">
                            {[
                                {
                                    q: 'Is Khoj free to use?',
                                    a: 'Yes! Khoj is completely free. Post items, search, and communicate with other users at no cost. We believe in making lost & found accessible to everyone.',
                                },
                                {
                                    q: 'How does the AI matching work?',
                                    a: 'Our Gemini AI analyzes descriptions, locations, dates, and images to find the best matches. It understands context and can match items even with vague descriptions.',
                                },
                                {
                                    q: 'Is my information secure?',
                                    a: 'We use bank-level encryption for all data. Personal information is only visible to verified users, and you control what you share.',
                                },
                                {
                                    q: 'How long does it take to recover an item?',
                                    a: 'Recovery times vary, but our users report average resolution times of 3-7 days. Some items are recovered within hours!',
                                },
                            ].map((faq, i) => (
                                <FaqItem key={i} question={faq.q} answer={faq.a} index={i} />
                            ))}
                        </div>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════
                    FINAL CTA
                ════════════════════════════════════════════════ */}
                <section className="py-28 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-100/80 via-white to-violet-100/80 dark:from-blue-950/40 dark:via-slate-950 dark:to-violet-950/40 transition-colors duration-300" />
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[50rem] h-[24rem] rounded-full bg-gradient-to-r from-blue-400/20 to-violet-400/20 blur-[100px] dark:from-blue-800/20 dark:to-violet-800/20" />
                    </div>

                    <div className="relative max-w-3xl mx-auto text-center">
                        <div
                            className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-4xl mx-auto mb-8 shadow-2xl shadow-blue-900/40"
                            style={{ animation: 'pulseRing 2s ease-in-out infinite' }}
                        >
                            💫
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black text-slate-900 dark:text-white mb-6 leading-tight transition-colors duration-300">
                            Ready to reunite <br />
                            <span className="gradient-text">with your belongings?</span>
                        </h2>
                        <p className="text-xl text-slate-600 leading-relaxed mb-12 max-w-xl mx-auto dark:text-slate-400 transition-colors duration-300">
                            Join thousands of users already using Khoj. Post, search, and recover lost items with AI-powered matching.
                        </p>

                        <Link
                            to="/register"
                            className="group inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-bold text-lg shadow-2xl shadow-blue-900/40 transition-all hover:scale-105"
                            style={{ textDecoration: 'none' }}
                        >
                            Create Account (Free)
                            <span className="group-hover:translate-x-1 transition-transform duration-200">→</span>
                        </Link>

                        <p className="mt-8 text-sm text-slate-500 dark:text-slate-600">No credit card required &bull; Powered by Gemini AI</p>
                    </div>
                </section>

                {/* ════════════════════════════════════════════════
                    FOOTER
                ════════════════════════════════════════════════ */}
                <footer className="border-t border-slate-200/80 py-12 px-6 bg-white/60 dark:border-slate-800/60 dark:bg-slate-900/30 transition-colors duration-300">
                    <div className="max-w-6xl mx-auto">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                            <div>
                                <p className="text-sm font-semibold text-slate-800 mb-4 dark:text-slate-300">Product</p>
                                <div className="space-y-2">
                                    <Link to="/login" className="block text-sm text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" style={{ textDecoration: 'none' }}>Sign In</Link>
                                    <Link to="/register" className="block text-sm text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" style={{ textDecoration: 'none' }}>Create Account</Link>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 mb-4 dark:text-slate-300">About</p>
                                <div className="space-y-2">
                                    <Link to="/about" className="block text-sm text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" style={{ textDecoration: 'none' }}>About Khoj</Link>
                                </div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 mb-4 dark:text-slate-300">Legal</p>
                                <div className="space-y-2">
                                    <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" style={{ textDecoration: 'none' }}>Privacy Policy</a>
                                    <a href="#" className="block text-sm text-slate-600 hover:text-slate-900 dark:text-slate-500 dark:hover:text-slate-300 transition-colors" style={{ textDecoration: 'none' }}>Terms of Service</a>
                                </div>
                            </div>
                        </div>
                        <div className="pt-8 border-t border-slate-200/80 dark:border-slate-800/60 flex flex-col md:flex-row items-center justify-between transition-colors duration-300">
                            <p className="text-xs text-slate-500 dark:text-slate-600">
                                © 2026 Khoj. All rights reserved.
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-600 mt-4 md:mt-0">
                                Built with ❤️ by the Khoj team &bull; Powered by Gemini AI
                            </p>
                        </div>
                    </div>
                </footer>

            </div>
        </>
    );
}
