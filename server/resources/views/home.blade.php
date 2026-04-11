{{--
  Example Blade homepage: session locale + resources/lang/en.json & bn.json
  Switcher: GET /locale/{locale} (route name: locale.switch)

  To use this page for "/":
    Route::view('/', 'home')->name('home');
  and ensure this route is registered before your SPA catch-all.
--}}
@php
    $messages = json_decode(
        @file_get_contents(resource_path('lang/' . app()->getLocale() . '.json')),
        true
    ) ?? [];
    $t = static function (string $key) use ($messages): string {
        $parts = explode('.', $key);
        $cur = $messages;
        foreach ($parts as $p) {
            if (! is_array($cur) || ! array_key_exists($p, $cur)) {
                return $key;
            }
            $cur = $cur[$p];
        }
        return is_string($cur) ? $cur : $key;
    };
@endphp
<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ config('app.name', 'Khoj') }} — {{ $t('hero.title_line1') }}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Sans+Bengali:wght@400;600;700&display=swap" rel="stylesheet">
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        .sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
        html[lang="bn"] body { font-family: 'Noto Sans Bengali', 'Inter', system-ui, sans-serif; }
    </style>
</head>
<body class="min-h-screen bg-slate-50 text-slate-900 antialiased">
    <nav class="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div class="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
            <span class="text-lg font-black tracking-tight text-slate-900">KHOJ</span>
            <div class="flex items-center gap-2">
                <span class="sr-only">{{ $t('nav.language') }}</span>
                <a href="{{ route('locale.switch', ['locale' => 'en']) }}"
                   class="rounded-lg border px-3 py-1.5 text-sm font-semibold no-underline {{ app()->getLocale() === 'en' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50' }}">
                    EN
                </a>
                <a href="{{ route('locale.switch', ['locale' => 'bn']) }}"
                   class="rounded-lg border px-3 py-1.5 text-sm font-semibold no-underline {{ app()->getLocale() === 'bn' ? 'border-blue-600 bg-blue-50 text-blue-800' : 'border-slate-200 text-slate-700 hover:bg-slate-50' }}">
                    BN
                </a>
            </div>
        </div>
    </nav>

    <main class="mx-auto max-w-3xl px-6 py-16">
        <p class="text-sm font-bold uppercase tracking-widest text-violet-600">{{ $t('hero.badge') }}</p>
        <h1 class="mt-4 text-4xl font-black text-slate-900">{{ $t('hero.title_line1') }}</h1>
        <p class="mt-2 text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
            {{ $t('hero.title_gradient') }}
        </p>
        <p class="mt-6 text-lg leading-relaxed text-slate-600">{{ $t('hero.subtitle') }}</p>
        <a href="{{ url('/register') }}" class="mt-8 inline-flex rounded-xl bg-gradient-to-r from-blue-600 to-violet-600 px-6 py-3 font-bold text-white no-underline shadow-lg">
            {{ $t('hero.cta_start') }}
        </a>
    </main>
</body>
</html>
