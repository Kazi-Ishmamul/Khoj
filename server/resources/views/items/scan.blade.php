<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>{{ $item->item_name }} — Khoj</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;600;700&display=swap" rel="stylesheet">
    <style>
        :root {
            --bg: #0f172a;
            --card: #1e293b;
            --border: #334155;
            --text: #f1f5f9;
            --muted: #94a3b8;
            --accent: #38bdf8;
        }
        * { box-sizing: border-box; }
        body {
            margin: 0;
            min-height: 100vh;
            font-family: 'DM Sans', system-ui, sans-serif;
            background: var(--bg);
            color: var(--text);
            padding: 1.5rem;
            background-image: radial-gradient(ellipse 80% 50% at 50% -20%, rgba(56, 189, 248, 0.12), transparent);
        }
        .wrap { max-width: 520px; margin: 0 auto; }
        .badge {
            display: inline-block;
            font-size: 0.7rem;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.1em;
            padding: 0.35rem 0.75rem;
            border-radius: 999px;
            margin-bottom: 1rem;
        }
        .badge-lost { background: rgba(244, 63, 94, 0.2); color: #fda4af; border: 1px solid rgba(244, 63, 94, 0.35); }
        .badge-found { background: rgba(52, 211, 153, 0.2); color: #6ee7b7; border: 1px solid rgba(52, 211, 153, 0.35); }
        h1 { font-size: 1.5rem; margin: 0 0 0.5rem; letter-spacing: -0.02em; }
        .card {
            background: var(--card);
            border: 1px solid var(--border);
            border-radius: 1.25rem;
            overflow: hidden;
            margin-top: 1rem;
        }
        .img-wrap {
            aspect-ratio: 16/10;
            background: #0f172a;
            overflow: hidden;
        }
        .img-wrap img { width: 100%; height: 100%; object-fit: cover; }
        .body { padding: 1.25rem; }
        .row { margin-bottom: 0.85rem; font-size: 0.9rem; }
        .row strong { color: var(--muted); display: block; font-size: 0.7rem; text-transform: uppercase; letter-spacing: 0.06em; margin-bottom: 0.2rem; }
        .actions { display: flex; flex-wrap: wrap; gap: 0.75rem; margin-top: 1.25rem; }
        .btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 0.65rem 1rem;
            border-radius: 0.75rem;
            font-weight: 600;
            font-size: 0.875rem;
            text-decoration: none;
            border: 1px solid var(--border);
            background: #0f172a;
            color: var(--text);
        }
        .btn-primary {
            background: linear-gradient(135deg, #0ea5e9, #8b5cf6);
            border: none;
            color: #fff;
        }
        .btn:hover { opacity: 0.92; }
        .foot { text-align: center; margin-top: 2rem; font-size: 0.8rem; color: var(--muted); }
    </style>
</head>
<body>
    <div class="wrap">
        <span class="badge {{ $item->status === 'lost' ? 'badge-lost' : 'badge-found' }}">
            {{ $item->status === 'lost' ? 'Lost' : 'Found' }}
        </span>
        <h1>{{ $item->item_name }}</h1>
        @if($item->category)
            <p style="margin:0; color: var(--accent); font-weight:600;">{{ $item->category }}</p>
        @endif

        <div class="card">
            @if($item->item_image_url)
                <div class="img-wrap">
                    <img src="{{ $item->item_image_url }}" alt="">
                </div>
            @endif
            <div class="body">
                <div class="row">
                    <strong>Description</strong>
                    {{ $item->description }}
                </div>
                <div class="row">
                    <strong>Location</strong>
                    {{ $item->location }}
                </div>
                <div class="row">
                    <strong>Date</strong>
                    {{ \Carbon\Carbon::parse($item->date_time)->format('M j, Y g:i A') }}
                </div>
                @if($item->user)
                    <div class="row">
                        <strong>Posted by</strong>
                        {{ $item->user->name }}
                    </div>
                @endif
                <div class="actions">
                    <a class="btn btn-primary" href="{{ $frontendItemsUrl }}?highlight={{ $item->id }}">Open in Khoj app</a>
                    @if($item->qr_image_path)
                        <a class="btn" href="{{ route('items.qr.download', ['token' => $item->qr_token]) }}">Download QR image</a>
                    @endif
                </div>
            </div>
        </div>

        <p class="foot">Khoj — Lost &amp; Found</p>
    </div>
</body>
</html>
