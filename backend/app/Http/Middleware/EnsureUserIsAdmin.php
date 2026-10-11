<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserIsAdmin
{
    /**
     * Blocks anyone who isn't an admin. This server-side check is the real protection;
     * hiding the admin pages in React is only for convenience.
     */
    public function handle(Request $request, Closure $next): Response
    {
        if (! $request->user()?->is_admin) {
            abort(403, 'Admins only.');
        }

        return $next($request);
    }
}
