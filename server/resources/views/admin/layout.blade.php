<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="csrf-token" content="{{ csrf_token() }}">
    <title>@yield('title', 'Admin') — Khoj</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,600;0,9..40,700;1,9..40,400&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0f172a;
            --surface: #1e293b;
            --border: #334155;
            --text: #f1f5f9;
            --muted: #94a3b8;
            --accent: #38bdf8;
            --accent2: #a78bfa;
            --danger: #f43f5e;
            --success: #34d399;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: 'DM Sans', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            background-image:
                radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.15), transparent),
                radial-gradient(ellipse 60% 40% at 100% 0%, rgba(167, 139, 250, 0.1), transparent);
        }
        a { color: var(--accent); text-decoration: none; }
        a:hover { text-decoration: underline; }
        .topbar {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 1rem 1.5rem;
            border-bottom: 1px solid var(--border);
            background: rgba(15, 23, 42, 0.85);
            backdrop-filter: blur(12px);
            position: sticky;
            top: 0;
            z-index: 40;
        }
        .brand { font-weight: 700; font-size: 1.125rem; letter-spacing: -0.02em; }
        .brand span { color: var(--accent); }
        .wrap { max-width: 1200px; margin: 0 auto; padding: 1.5rem; }
        .btn {
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            padding: 0.5rem 1rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.875rem;
            border: 1px solid var(--border);
            background: var(--surface);
            color: var(--text);
            cursor: pointer;
            font-family: inherit;
        }
        .btn:hover { border-color: var(--accent); color: var(--accent); }
        .btn-primary {
            background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
            border: none;
            color: white;
        }
        .btn-primary:hover { filter: brightness(1.08); color: white; text-decoration: none; }
        .card {
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 1rem;
            padding: 1.25rem;
        }
        .muted { color: var(--muted); font-size: 0.875rem; }
    </style>
    @stack('styles')
</head>
<body>
    @hasSection('topbar')
        @yield('topbar')
    @else
        <header class="topbar">
            <div class="brand">Khoj <span>Admin</span></div>
            <nav style="display: flex; align-items: center; gap: 1rem;">
                @auth('web')
                    <a href="{{ route('admin.analytics') }}">Analytics</a>
                    <form action="{{ route('admin.logout') }}" method="post" style="display: inline;">
                        @csrf
                        <button type="submit" class="btn" style="font-size: 0.8125rem;">Log out</button>
                    </form>
                @endauth
            </nav>
        </header>
    @endif

    <main class="wrap">
        @if(session('status'))
            <p style="color: var(--success); margin-bottom: 1rem;">{{ session('status') }}</p>
        @endif
        @yield('content')
    </main>
    @stack('scripts')
</body>
</html>
