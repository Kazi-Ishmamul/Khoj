<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class EnsureWebAdmin
{
    public function handle(Request $request, Closure $next)
    {
        if (! Auth::guard('web')->check()) {
            return redirect()->guest(route('admin.login'));
        }

        $user = Auth::guard('web')->user();
        if ($user->role !== 'admin') {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('admin.login')->withErrors([
                'email' => 'This area is restricted to administrator accounts.',
            ]);
        }

        return $next($request);
    }
}
