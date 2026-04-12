@extends('admin.layout')

@section('title', 'Sign in')

@section('topbar')
    <header class="topbar">
        <div class="brand">Khoj <span>Admin</span></div>
    </header>
@endsection

@section('content')
    <div style="max-width: 400px; margin: 3rem auto;">
        <div class="card">
            <h1 style="margin: 0 0 0.5rem; font-size: 1.5rem;">Administrator sign in</h1>
            <p class="muted" style="margin: 0 0 1.5rem;">Use an account with the <strong>admin</strong> role.</p>

            @if ($errors->any())
                <div style="background: rgba(244, 63, 94, 0.12); border: 1px solid rgba(244, 63, 94, 0.35); color: #fda4af; padding: 0.75rem 1rem; border-radius: 0.75rem; margin-bottom: 1rem; font-size: 0.875rem;">
                    {{ $errors->first() }}
                </div>
            @endif

            <form method="post" action="{{ route('admin.login') }}">
                @csrf
                <label class="muted" style="display: block; margin-bottom: 0.35rem;">Email</label>
                <input type="email" name="email" value="{{ old('email') }}" required autofocus
                    style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 0.65rem; border: 1px solid var(--border); background: #0f172a; color: var(--text); margin-bottom: 1rem; font-size: 1rem;">

                <label class="muted" style="display: block; margin-bottom: 0.35rem;">Password</label>
                <input type="password" name="password" required
                    style="width: 100%; padding: 0.65rem 0.85rem; border-radius: 0.65rem; border: 1px solid var(--border); background: #0f172a; color: var(--text); margin-bottom: 1.25rem; font-size: 1rem;">

                <button type="submit" class="btn btn-primary" style="width: 100%; justify-content: center;">Sign in</button>
            </form>
        </div>
    </div>
@endsection
