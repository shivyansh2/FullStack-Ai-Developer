import * as auth from './auth.js';
 
let routes = [];
 
export function defineRoutes(list) {
    routes = list;
}
 
function parseHash() {
    const raw = location.hash.slice(1) || '/';
    const [path, query = ''] = raw.split('?');
    return { path, params: new URLSearchParams(query) };
}
 
export const currentPath = () => parseHash().path;
 
export function navigate(path, { replace = false } = {}) {
    if (replace) location.replace(`#${path}`);
    else location.hash = path;
}
 
// Open-redirect protection: only follow ?next= when it is a plain in-app path.
// "//evil.com" and "https://evil.com" must never be accepted.
export function safeNext(next) {
    const ok =
        typeof next === 'string' &&
        next.startsWith('/') &&
        !next.startsWith('//') &&
        !next.includes('\\') &&
        !next.startsWith('/login') &&
        !next.startsWith('/register');
    return ok ? next : '/dashboard';
}
 
// Decide what to show for the current URL and auth state.
// Returns { route, params } | { special: 'loading' | 'notFound' | 'forbidden' } | { redirect }
export function resolve() {
    const { path, params } = parseHash();
    const route = routes.find((r) => r.path === path);
    const { status, user } = auth.getState();
 
    if (!route) return { special: 'notFound' };
 
    // We do not know yet who the user is, so guarded pages must wait.
    if (route.access !== 'public' && status === 'loading') return { special: 'loading' };
 
    if (route.access === 'guest' && status === 'authenticated') {
        return { redirect: safeNext(params.get('next')) };
    }
 
    if (route.access === 'auth' && status !== 'authenticated') {
        return { redirect: `/login?next=${encodeURIComponent(path)}` };
    }
 
    if (route.roles && !route.roles.includes(user.role)) return { special: 'forbidden' };
 
    return { route, params };
}
 