// Auth state lives here, in memory only.
// No token, password or user object is ever written to localStorage or sessionStorage:
// the server's HttpOnly cookie is the source of truth, and on page load we ask GET /auth/me who we are.

import { request, onUnauthorized } from './api';
import type { AuthState, LoginRequest, RegisterRequest, Role, UpdateProfileRequest, User } from './types';

type Listener = (state: AuthState) => void;

let state: AuthState = { status: 'loading', user: null };
const listeners = new Set<Listener>();

function setState(next: AuthState): void {
    state = next;
    listeners.forEach((listener) => listener(state));
}

export const getState = (): AuthState => state;

export function subscribe(listener: Listener): () => void {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export const hasRole = (role: Role): boolean => state.status === 'authenticated' && state.user.role === role;

// For pages the router only renders when logged in. Throws if that guarantee is ever broken.
export function requireUser(): User {
    if (state.status !== 'authenticated') throw new Error('requireUser() called while logged out');
    return state.user;
}

// Call once at startup. Restores the session after a page reload.
export async function init(): Promise<void> {
    try {
        const { user } = await request('GET /auth/me', { skipUnauthorizedHandler: true });
        setState({ status: 'authenticated', user });
    } catch {
        setState({ status: 'anonymous', user: null });
    }
}

export async function login({ email, password }: LoginRequest): Promise<User> {
    const { user } = await request('POST /auth/login', {
        body: { email, password },
        skipUnauthorizedHandler: true,
    });
    setState({ status: 'authenticated', user });
    return user;
}

export async function register({ name, email, password }: RegisterRequest): Promise<User> {
    const { user } = await request('POST /auth/register', {
        body: { name, email, password },
        skipUnauthorizedHandler: true,
    });
    setState({ status: 'authenticated', user });
    return user;
}

export async function logout(): Promise<void> {
    try {
        await request('POST /auth/logout', { skipUnauthorizedHandler: true });
    } finally {
        // Even if the request fails, the user asked to leave, so clear local state.
        setState({ status: 'anonymous', user: null });
    }
}

export async function updateProfile({ name }: UpdateProfileRequest): Promise<User> {
    const { user } = await request('PATCH /auth/me', { body: { name } });
    setState({ status: 'authenticated', user });
    return user;
}

// A protected call came back 401 while we thought we were logged in: the session expired.
onUnauthorized(() => {
    if (state.status === 'authenticated') {
        setState({ status: 'anonymous', user: null });
        window.dispatchEvent(new CustomEvent<void>('auth:expired'));
    }
});