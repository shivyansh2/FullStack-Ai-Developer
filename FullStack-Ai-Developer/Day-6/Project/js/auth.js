import { request, onUnauthorized } from './api.js';
 
// status: 'loading' (asking the server) | 'authenticated' | 'anonymous'
let state = { status: 'loading', user: null };
const listeners = new Set();
 
function setState(next) {
    state = { ...state, ...next };
    listeners.forEach((listener) => listener(state));
}
 
export const getState = () => state;
 
export function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}
 
export const isAuthenticated = () => state.status === 'authenticated';
export const hasRole = (role) => Boolean(state.user) && state.user.role === role;
 
// Call once at startup. Restores the session after a page reload.
export async function init() {
    try {
        const { user } = await request('/auth/me', { skipUnauthorizedHandler: true });
        setState({ status: 'authenticated', user });
    } catch {
        setState({ status: 'anonymous', user: null });
    }
}
 
export async function login({ email, password }) {
    const { user } = await request('/auth/login', {
        method: 'POST',
        body: { email, password },
        skipUnauthorizedHandler: true,
    });
    setState({ status: 'authenticated', user });
    return user;
}
 
export async function register({ name, email, password }) {
    const { user } = await request('/auth/register', {
        method: 'POST',
        body: { name, email, password },
        skipUnauthorizedHandler: true,
    });
    setState({ status: 'authenticated', user });
    return user;
}
 
export async function logout() {
    try {
        await request('/auth/logout', { method: 'POST', skipUnauthorizedHandler: true });
    } finally {
        // Even if the request fails, the user asked to leave, so clear local state.
        setState({ status: 'anonymous', user: null });
    }
}
 
export async function updateProfile({ name }) {
    const { user } = await request('/auth/me', { method: 'PATCH', body: { name } });
    setState({ user });
    return user;
}
 
// A protected call came back 401 while we thought we were logged in: the session expired.
onUnauthorized(() => {
    if (state.status === 'authenticated') {
        setState({ status: 'anonymous', user: null });
        window.dispatchEvent(new CustomEvent('auth:expired'));
    }
});
 