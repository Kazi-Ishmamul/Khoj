{{--
  Optional Blade homepage (reference only).
  Enable with: Route::view('/', 'home'); and ensure your SPA catch-all does not take "/".

  - Default: light mode
  - Preference: localStorage key khoj-home-theme = "light" | "dark"
  - Toggle: sun icon in dark mode (switch to light), moon icon in light mode (switch to dark)
--}}
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}" class="scroll-smooth">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>{{ config('app.name', 'Khoj') }}</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = { darkMode: 'class' };
    </script>
</head>
<body class="min-h-screen bg-slate-50 text-slate-900 antialiased transition-colors duration-300 dark:bg-slate-950 dark:text-slate-100">

    <nav class="sticky top-0 z-50 border-b border-slate-200/90 bg-white/90 shadow-sm backdrop-blur-xl transition-colors duration-300 dark:border-slate-800 dark:bg-slate-950/90 dark:shadow-none">
        <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
            <span class="text-lg font-black tracking-tight text-slate-900 dark:text-white">KHOJ</span>
            <button
                type="button"
                id="theme-toggle"
                class="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-amber-600 shadow-sm transition-all duration-300 hover:bg-slate-50 hover:border-slate-300 dark:border-slate-700 dark:bg-slate-900 dark:text-amber-300 dark:hover:bg-slate-800"
                aria-label="Toggle color theme"
            >
                {{-- Moon: visible in light mode (click → dark) --}}
                <svg id="icon-moon" class="h-5 w-5 dark:hidden" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
                {{-- Sun: visible in dark mode (click → light) --}}
                <svg id="icon-sun" class="hidden h-5 w-5 dark:block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
            </button>
        </div>
    </nav>

    <main class="mx-auto max-w-3xl px-6 py-20">
        <h1 class="text-4xl font-black tracking-tight text-slate-900 dark:text-white">Home</h1>
        <p class="mt-4 text-lg leading-relaxed text-slate-600 dark:text-slate-400">
            Blade + Tailwind (CDN) example: theme is stored in <code class="rounded bg-slate-200 px-1.5 py-0.5 text-sm dark:bg-slate-800">localStorage</code> under <code class="rounded bg-slate-200 px-1.5 py-0.5 text-sm dark:bg-slate-800">khoj-home-theme</code>.
        </p>
    </main>

    <script>
        (function () {
            var STORAGE_KEY = 'khoj-home-theme';

            function applyTheme(mode) {
                var isDark = mode === 'dark';
                document.documentElement.classList.toggle('dark', isDark);
            }

            function readStored() {
                try {
                    return localStorage.getItem(STORAGE_KEY);
                } catch (e) {
                    return null;
                }
            }

            function writeStored(mode) {
                try {
                    localStorage.setItem(STORAGE_KEY, mode);
                } catch (e) { /* private mode */ }
            }

            var stored = readStored();
            applyTheme(stored === 'dark' ? 'dark' : 'light');

            document.getElementById('theme-toggle').addEventListener('click', function () {
                var next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
                writeStored(next);
                applyTheme(next);
            });
        })();
    </script>
</body>
</html>
