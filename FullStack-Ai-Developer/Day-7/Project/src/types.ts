// Every shape that crosses the network or is shared between modules lives here.
// This file IS the API contract on the frontend: if the backend changes a response,
// you change it here and the compiler shows every place that needs updating.

/* ---------- domain ---------- */

export type Role = 'user' | 'admin';

export interface User {
    id: string;
    name: string;
    email: string;
    role: Role;
    createdAt: string; // ISO 8601 date string
}

/* ---------- request / response bodies ---------- */

export interface LoginRequest {
    email: string;
    password: string;
}

export interface RegisterRequest extends LoginRequest {
    name: string;
}

export interface UpdateProfileRequest {
    name: string;
}

export interface UserResponse {
    user: User;
}

export interface UsersResponse {
    users: User[];
}

// Field name -> message, e.g. { email: 'This email is already registered.' }
export type FieldErrors = Record<string, string>;

// The standardized error body every failing endpoint returns.
export interface ErrorResponse {
    message: string;
    errors?: FieldErrors;
}

/* ---------- the endpoint map ---------- */

// "METHOD /path" -> what you may send and what you get back.
// api.ts uses this so request('POST /auth/login', { body }) is checked at compile time:
// a typo in the path, a missing field, or a wrong response property will not compile.
export interface Endpoints {
    'POST /auth/register': { body: RegisterRequest; response: UserResponse };
    'POST /auth/login': { body: LoginRequest; response: UserResponse };
    'POST /auth/logout': { body: undefined; response: null };
    'GET /auth/me': { body: undefined; response: UserResponse };
    'PATCH /auth/me': { body: UpdateProfileRequest; response: UserResponse };
    'GET /admin/users': { body: undefined; response: UsersResponse };
}

export type Endpoint = keyof Endpoints;

/* ---------- auth state ---------- */

// A discriminated union: the `status` field decides which other fields exist.
// Check status === 'authenticated' and TypeScript knows `user` is a User, not null.
export type AuthState =
    | { status: 'loading'; user: null }
    | { status: 'anonymous'; user: null }
    | { status: 'authenticated'; user: User };

/* ---------- routing ---------- */

export type Access = 'public' | 'guest' | 'auth';

export type SpecialPage = 'loading' | 'forbidden' | 'notFound';

export interface ViewContext {
    params: URLSearchParams;
}

export interface Route {
    path: string;
    title: string;
    access: Access;
    roles?: Role[];
    view: (context: ViewContext) => HTMLElement;
}

export type Resolution =
    | { kind: 'route'; route: Route; params: URLSearchParams }
    | { kind: 'special'; page: SpecialPage }
    | { kind: 'redirect'; to: string };

/* ---------- custom browser events ---------- */

declare global {
    interface WindowEventMap {
        'auth:expired': CustomEvent<void>;
    }
}