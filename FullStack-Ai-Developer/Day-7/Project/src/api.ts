// The only place the app talks to a server (real or mock).
// Views and the auth store call request(); they never call fetch() themselves.

import { config } from './config';
import { mockFetch } from './mock-api';
import type { Endpoint, Endpoints, ErrorResponse, FieldErrors } from './types';

export class ApiError extends Error {
    readonly status: number;
    readonly errors: FieldErrors;

    constructor(status: number, message: string, errors: FieldErrors = {}) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.errors = errors;
    }
}

let unauthorizedHandler: () => void = () => {};

// auth.ts registers a handler here: "the server says my session is gone".
export function onUnauthorized(handler: () => void): void {
    unauthorizedHandler = handler;
}

/* ---------- typed request() ---------- */

type BodyOf<K extends Endpoint> = Endpoints[K]['body'];

interface BaseOptions {
    skipUnauthorizedHandler?: boolean;
}

// Endpoints whose body is `undefined` (GET, logout) take no body.
// Endpoints with a body type REQUIRE it: leaving it out is a compile error.
type Options<K extends Endpoint> = BaseOptions & (undefined extends BodyOf<K> ? { body?: undefined } : { body: BodyOf<K> });
type Args<K extends Endpoint> = undefined extends BodyOf<K> ? [options?: Options<K>] : [options: Options<K>];

export async function request<K extends Endpoint>(endpoint: K, ...args: Args<K>): Promise<Endpoints[K]['response']> {
    const [method, path] = endpoint.split(' ') as [string, string];
    const options = ((args as unknown[])[0] ?? {}) as BaseOptions & { body?: unknown };

    const send: (url: string, init?: RequestInit) => Promise<Response> = config.USE_MOCK ? mockFetch : fetch;

    let res: Response;
    try {
        res = await send(config.API_BASE + path, {
            method,
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            // Sends the HttpOnly session cookie. The cookie value itself is invisible to JavaScript.
            credentials: 'include',
            body: options.body === undefined ? undefined : JSON.stringify(options.body),
        });
    } catch {
        throw new ApiError(0, 'Network error. Check your connection and try again.');
    }

    const data = res.status === 204 ? null : ((await res.json().catch(() => null)) as unknown);

    if (!res.ok) {
        // 401 on any normal call means the session ended (expired, revoked, logged out elsewhere).
        if (res.status === 401 && !options.skipUnauthorizedHandler) unauthorizedHandler();
        const error = data as Partial<ErrorResponse> | null;
        throw new ApiError(res.status, error?.message ?? `Request failed (${res.status})`, error?.errors);
    }

    // The network gives us `unknown`. This one cast is where we trust the contract in types.ts.
    return data as Endpoints[K]['response'];
}