// A fake backend that lives in the browser so the shell works without a server.
// It follows the same contract a real server would, so api.ts cannot tell the difference.
//
// The SESSION_KEY entry stands in for the HttpOnly cookie a real server would set.
// Frontend code (auth.ts, views.ts) must never read it. That is the whole point of cookie sessions.

import { config } from './config';
import type { FieldErrors, LoginRequest, RegisterRequest, Role, UpdateProfileRequest, User } from './types';

/* ---------- server-side shapes (never sent to the browser as-is) ---------- */

interface StoredUser extends User {
    salt: string;
    passwordHash: string;
}

interface Db {
    users: StoredUser[];
}

interface Session {
    userId: string;
    expires: number;
}

interface AttemptRecord {
    count: number;
    until: number;
}

// A request body is untrusted input: every field might be missing or the wrong type,
// so everything is optional here and gets validated before use.
type Body = Partial<RegisterRequest & LoginRequest & UpdateProfileRequest>;

const DB_KEY = 'authshell.mock.db';
const SESSION_KEY = 'authshell.mock.session';
const LATENCY_MS = 350;
const SESSION_MS = 30 * 60 * 1000;
const MAX_FAILS = 5;
const LOCK_MS = 30 * 1000;

const attempts = new Map<string, AttemptRecord>(); // email -> login rate-limit record

class HttpError extends Error {
    readonly status: number;
    readonly errors: FieldErrors | undefined;

    constructor(status: number, message: string, errors?: FieldErrors) {
        super(message);
        this.status = status;
        this.errors = errors;
    }
}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

const reply = (status: number, data: unknown): Response =>
    new Response(data === null ? null : JSON.stringify(data), {
        status,
        headers: { 'Content-Type': 'application/json' },
    });

/* ---------- "database" ---------- */

// Real servers use a slow password hash (bcrypt, argon2). SHA-256 + salt is only a stand-in
// to show that passwords are never stored in plain text.
async function digest(text: string): Promise<string> {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    return [...new Uint8Array(bytes)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function makeUser(input: { name: string; email: string; password: string; role?: Role }): Promise<StoredUser> {
    const salt = crypto.randomUUID();
    return {
        id: crypto.randomUUID(),
        name: input.name,
        email: input.email.toLowerCase(),
        role: input.role ?? 'user',
        salt,
        passwordHash: await digest(salt + input.password),
        createdAt: new Date().toISOString(),
    };
}

// Strips the secret fields. The return type User makes it impossible to leak them by accident.
const publicUser = ({ salt, passwordHash, ...safe }: StoredUser): User => {
    void salt;
    void passwordHash;
    return safe;
};

const saveDb = (db: Db): void => localStorage.setItem(DB_KEY, JSON.stringify(db));

async function loadDb(): Promise<Db> {
    try {
        const stored = JSON.parse(localStorage.getItem(DB_KEY) ?? 'null') as Db | null;
        if (stored && Array.isArray(stored.users)) return stored;
    } catch {
        // fall through and re-seed
    }
    const db: Db = {
        users: [
            await makeUser({ name: 'Demo User', email: 'demo@example.com', password: 'Demo@1234' }),
            await makeUser({ name: 'Admin User', email: 'admin@example.com', password: 'Admin@1234', role: 'admin' }),
        ],
    };
    saveDb(db);
    return db;
}

/* ---------- "session cookie" ---------- */

function readSession(): Session | null {
    try {
        const session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as Session | null;
        if (session && session.expires > Date.now()) return session;
    } catch {
        // ignore corrupt data
    }
    localStorage.removeItem(SESSION_KEY);
    return null;
}

const startSession = (user: StoredUser): void => {
    const session: Session = { userId: user.id, expires: Date.now() + SESSION_MS };
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
};

const endSession = (): void => localStorage.removeItem(SESSION_KEY);

function currentUser(db: Db): StoredUser | null {
    const session = readSession();
    return (session && db.users.find((u) => u.id === session.userId)) || null;
}

function requireUser(db: Db): StoredUser {
    const user = currentUser(db);
    if (!user) throw new HttpError(401, 'You are not logged in.');
    return user;
}

function requireAdmin(db: Db): StoredUser {
    const user = requireUser(db);
    if (user.role !== 'admin') throw new HttpError(403, 'Forbidden: admin role required.');
    return user;
}

/* ---------- server-side validation (never trust the client) ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validName(name: unknown): boolean {
    const n = String(name ?? '').trim();
    return n.length >= 2 && n.length <= 60;
}

function validPassword(password: unknown): boolean {
    const p = String(password ?? '');
    return p.length >= 8 && /[A-Za-z]/.test(p) && /\d/.test(p);
}

function validateRegister(body: Body): FieldErrors {
    const errors: FieldErrors = {};
    if (!validName(body.name)) errors.name = 'Name must be 2 to 60 characters.';
    if (!EMAIL_RE.test(String(body.email ?? '').trim())) errors.email = 'Enter a valid email address.';
    if (!validPassword(body.password)) errors.password = 'Use at least 8 characters with a letter and a number.';
    return errors;
}

/* ---------- request handler ---------- */

export async function mockFetch(url: string, options: RequestInit = {}): Promise<Response> {
    await sleep(LATENCY_MS);

    const method = (options.method ?? 'GET').toUpperCase();
    const path = url.startsWith(config.API_BASE) ? url.slice(config.API_BASE.length) : url;
    const body: Body = typeof options.body === 'string' ? (JSON.parse(options.body) as Body) : {};

    try {
        const db = await loadDb();

        switch (`${method} ${path}`) {
            case 'POST /auth/register': {
                const errors = validateRegister(body);
                if (Object.keys(errors).length) throw new HttpError(422, 'Please fix the highlighted fields.', errors);

                const email = String(body.email).trim().toLowerCase();
                if (db.users.some((u) => u.email === email)) {
                    throw new HttpError(409, 'An account with this email already exists.', {
                        email: 'This email is already registered.',
                    });
                }

                const user = await makeUser({
                    name: String(body.name).trim(),
                    email,
                    password: String(body.password),
                });
                db.users.push(user);
                saveDb(db);
                startSession(user);
                return reply(201, { user: publicUser(user) });
            }

            case 'POST /auth/login': {
                const email = String(body.email ?? '').trim().toLowerCase();

                const record = attempts.get(email);
                if (record && record.until > Date.now()) {
                    const seconds = Math.ceil((record.until - Date.now()) / 1000);
                    throw new HttpError(429, `Too many failed attempts. Try again in ${seconds} seconds.`);
                }

                const user = db.users.find((u) => u.email === email);
                const ok = user !== undefined && (await digest(user.salt + String(body.password ?? ''))) === user.passwordHash;

                if (!user || !ok) {
                    const count = (record ? record.count : 0) + 1;
                    attempts.set(email, count >= MAX_FAILS ? { count: 0, until: Date.now() + LOCK_MS } : { count, until: 0 });
                    // Same message for "no such user" and "wrong password" so attackers learn nothing.
                    throw new HttpError(401, 'Invalid email or password.');
                }

                attempts.delete(email);
                startSession(user);
                return reply(200, { user: publicUser(user) });
            }

            case 'POST /auth/logout':
                endSession();
                return reply(204, null);

            case 'GET /auth/me':
                return reply(200, { user: publicUser(requireUser(db)) });

            case 'PATCH /auth/me': {
                const user = requireUser(db);
                if (!validName(body.name)) {
                    throw new HttpError(422, 'Please fix the highlighted fields.', {
                        name: 'Name must be 2 to 60 characters.',
                    });
                }
                user.name = String(body.name).trim();
                saveDb(db);
                return reply(200, { user: publicUser(user) });
            }

            case 'GET /admin/users':
                requireAdmin(db);
                return reply(200, { users: db.users.map(publicUser) });

            default:
                throw new HttpError(404, 'Not found.');
        }
    } catch (err: unknown) {
        if (err instanceof HttpError) return reply(err.status, { message: err.message, errors: err.errors });
        throw err;
    }
}