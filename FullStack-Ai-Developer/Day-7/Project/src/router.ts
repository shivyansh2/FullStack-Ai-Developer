// A tiny hash router with access rules.
//
// access: 'public' = anyone | 'guest' = only logged-out users (login, register) | 'auth' = logged-in users
// roles:  optional list, e.g. ['admin']
//
// IMPORTANT: these guards only decide what the UI shows. They are not security.
// Anyone can edit JavaScript in DevTools, so the server must check permissions on every request.

import * as auth from './auth';
import type { Resolution, Route } from './types';

let routes: Route[] = [];

export function defineRoutes(list: Route[]): void {
    routes = list;
}

function parseHash(): { path: string; params: URLSearchParams } {
    const raw = location.hash.slice(1) || '/';
    const [path = '/', query = ''] = raw.split('?');
    return { path, params: new URLSearchParams(query) };
}

export const currentPath = (): string => parseHash().path;

export function navigate(path: string, { replace = false }: { replace?: boolean } = {}): void {
    if (replace) location.replace(`#${path}`);
    else location.hash = path;
}

// Open-redirect protection: only follow ?next= when it is a plain in-app path.
// "//evil.com" and "https://evil.com" must never be accepted.
export function safeNext(next: string | null): string {
    const ok =
        next !== null &&
        next.startsWith('/') &&
        !next.startsWith('//') &&
        !next.includes('\\') &&
        !next.startsWith('/login') &&
        !next.startsWith('/register');
    return ok ? next : '/dashboard';
}

// Decide what to show for the current URL and auth state.
export function resolve(): Resolution {
    const { path, params } = parseHash();
    const route = routes.find((r) => r.path === path);
    const state = auth.getState();

    if (!route) return { kind: 'special', page: 'notFound' };

    // We do not know yet who the user is, so guarded pages must wait.
    if (route.access !== 'public' && state.status === 'loading') return { kind: 'special', page: 'loading' };

    if (route.access === 'guest' && state.status === 'authenticated') {
        return { kind: 'redirect', to: safeNext(params.get('next')) };
    }

    if (route.access === 'auth' && state.status !== 'authenticated') {
        return { kind: 'redirect', to: `/login?next=${encodeURIComponent(path)}` };
    }

    // Narrowing: inside this branch TypeScript knows state.user is a User (not null).
    if (route.roles && (state.status !== 'authenticated' || !route.roles.includes(state.user.role))) {
        return { kind: 'special', page: 'forbidden' };
    }

    return { kind: 'route', route, params };
}