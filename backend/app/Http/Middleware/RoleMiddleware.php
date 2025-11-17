<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class RoleMiddleware
{
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        $user = $request->user();
        if (! $user) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }
        // Temporarily elevate 'broker' to access 'admin' endpoints for the demo
        $effectiveRole = $user->role;
        if ($user->role === 'broker' && in_array('admin', $roles, true)) {
            $effectiveRole = 'admin';
        }

        if (! in_array($effectiveRole, $roles, true)) {
            return response()->json(['message' => 'Forbidden'], 403);
        }
        return $next($request);
    }
}
