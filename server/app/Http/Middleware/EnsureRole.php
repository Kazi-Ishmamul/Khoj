<?php

namespace App\Http\Middleware;

use Closure;

class EnsureRole
{
    public function handle($request, Closure $next, ...$roles)
    {
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if (!empty($roles) && !in_array($user->role, $roles, true)) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        return $next($request);
    }
}