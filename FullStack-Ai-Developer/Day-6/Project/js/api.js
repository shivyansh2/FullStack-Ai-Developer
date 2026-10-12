import { config } from './config.js';
import { mockFetch } from './mock-api.js';
 
export class ApiError extends Error {
    constructor(status, message, errors = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors || {};
    }
}
 
let unauthorizedHandler = () => {};
 
// auth.js registers a handler here: "the server says my session is gone".
export function onUnauthorized(handler) {
    unauthorizedHandler = handler;
}
 
export async function request(path, { method = 'GET', body, skipUnauthorizedHandler = false } = {}) {
    const send = config.USE_MOCK ? mockFetch : fetch;
 
    let res;
    try {
        res = await send(config.API_BASE + path, {
            method,
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            // Sends the HttpOnly session cookie. The cookie value itself is invisible to JavaScript.
            credentials: 'include',
            body: body === undefined ? undefined : JSON.stringify(body),
        });
    } catch {
        throw new ApiError(0, 'Network error. Check your connection and try again.');
    }
 
    const data = res.status === 204 ? null : await res.json().catch(() => null);
 
    if (!res.ok) {
        // 401 on any normal call means the session ended (expired, revoked, logged out elsewhere).
        if (res.status === 401 && !skipUnauthorizedHandler) unauthorizedHandler();
        throw new ApiError(res.status, (data && data.message) || `Request failed (${res.status})`, data && data.errors);
    }
 
    return data;
}
 