import * as auth from './auth.js';
import { request, ApiError } from './api.js';
import { config } from './config.js';
import { navigate, safeNext } from './router.js';
 
/* ---------- tiny DOM helper ---------- */
// h('p', { class: 'x' }, 'text', childNode). Text goes in as text nodes, never as HTML,
// so data from an API cannot inject markup (XSS).
 
export function h(tag, attrs = {}, ...children) {
    const node = document.createElement(tag);
    for (const [key, value] of Object.entries(attrs || {})) {
        if (value == null || value === false) continue;
        if (key.startsWith('on') && typeof value === 'function') {
            node.addEventListener(key.slice(2).toLowerCase(), value);
        } else if (key === 'class') {
            node.className = value;
        } else {
            node.setAttribute(key, value === true ? '' : value);
        }
    }
    for (const child of children.flat(Infinity)) {
        if (child == null || child === false) continue;
        node.append(child instanceof Node ? child : document.createTextNode(String(child)));
    }
    return node;
}
 
/* ---------- toast (screen-reader friendly status message) ---------- */
 
let toastTimer;
export function toast(message) {
    const box = document.getElementById('toast');
    box.textContent = message;
    box.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
        box.classList.remove('show');
        box.textContent = '';
    }, 4000);
}
 
/* ---------- validation rules (client side = convenience, server re-checks) ---------- */
 
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
 
// Each rule returns an error message, or false when the value is fine.
const rules = {
    name: (v) => (v.trim().length < 2 || v.trim().length > 60) && 'Name must be 2 to 60 characters.',
    email: (v) => !EMAIL_RE.test(v.trim()) && 'Enter a valid email address.',
    loginPassword: (v) => !v && 'Enter your password.',
    password: (v) =>
        v.length < 8
            ? 'Use at least 8 characters.'
            : !(/[A-Za-z]/.test(v) && /\d/.test(v)) && 'Include at least one letter and one number.',
};
 
const collect = (checks) => Object.fromEntries(Object.entries(checks).filter(([, message]) => message));
 
/* ---------- accessible form building blocks ---------- */
 
function field({ id, label, type = 'text', autocomplete, hint, value = '', inputmode, secret = false }) {
    const errorId = `${id}-error`;
    const hintId = `${id}-hint`;
    return h(
        'div',
        { class: 'field' },
        h('label', { for: id }, label),
        h('input', {
            id,
            name: id,
            type,
            value,
            autocomplete,
            inputmode,
            'data-secret': secret,
            'aria-describedby': hint ? `${hintId} ${errorId}` : errorId,
        }),
        hint && h('small', { id: hintId, class: 'hint' }, hint),
        h('p', { id: errorId, class: 'field-error', hidden: true })
    );
}
 
function showFormError(box, message) {
    box.textContent = message;
    box.hidden = !message;
}
 
function applyFieldErrors(form, errors) {
    let first = null;
    for (const input of form.querySelectorAll('input[name]')) {
        const message = errors[input.name];
        const box = form.querySelector(`#${input.id}-error`);
        box.textContent = message || '';
        box.hidden = !message;
        if (message) {
            input.setAttribute('aria-invalid', 'true');
            first = first || input;
        } else {
            input.removeAttribute('aria-invalid');
        }
    }
    if (first) first.focus();
}
 
function buildForm({ fields, showToggle = false, submitLabel, pendingLabel, check, submit, clearOnError = [] }) {
    const formError = h('p', { class: 'form-error', role: 'alert', hidden: true });
    const button = h('button', { type: 'submit' }, submitLabel);
 
    const toggle =
        showToggle &&
        h(
            'label',
            { class: 'check' },
            h('input', {
                type: 'checkbox',
                onChange: (event) => {
                    for (const input of form.querySelectorAll('input[data-secret]')) {
                        input.type = event.target.checked ? 'text' : 'password';
                    }
                },
            }),
            ' Show password'
        );
 
    const form = h('form', { class: 'card form', novalidate: true }, formError, ...fields, toggle, button);
 
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        showFormError(formError, '');
 
        const values = Object.fromEntries(new FormData(form));
        const errors = check(values);
        applyFieldErrors(form, errors);
        if (Object.keys(errors).length) return;
 
        button.disabled = true;
        button.textContent = pendingLabel;
        form.setAttribute('aria-busy', 'true');
 
        try {
            await submit(values);
        } catch (err) {
            // Field-level errors from the server (422/409) go next to the field,
            // everything else (401, 429, network) goes in the form-level alert.
            const serverErrors = err instanceof ApiError ? err.errors : {};
            const known = Object.fromEntries(Object.entries(serverErrors).filter(([name]) => form.elements[name]));
            applyFieldErrors(form, known);
            if (!Object.keys(known).length) {
                showFormError(formError, err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');
                // Wipe secrets only after a form-level failure (wrong password, rate limit, network).
                // Field-level errors (like a taken email) keep what the user typed so they can fix one field.
                for (const name of clearOnError) if (form.elements[name]) form.elements[name].value = '';
            }
        } finally {
            button.disabled = false;
            button.textContent = submitLabel;
            form.removeAttribute('aria-busy');
        }
    });
 
    return form;
}
 
const heading = (text) => h('h1', { tabindex: '-1' }, text);
const linkButton = (href, text, secondary = false) =>
    h('a', { href: `#${href}`, class: secondary ? 'button secondary' : 'button' }, text);
 
/* ---------- navigation ---------- */
 
async function logout() {
    await auth.logout();
    navigate('/');
    toast('You have been logged out.');
}
 
export function renderNav(nav, { status, user }, path) {
    const link = (href, text) =>
        h('li', {}, h('a', { href: `#${href}`, 'aria-current': path === href ? 'page' : null }, text));
 
    const items = [link('/', 'Home')];
 
    if (status === 'authenticated') {
        items.push(link('/dashboard', 'Dashboard'), link('/profile', 'Profile'));
        if (user.role === 'admin') items.push(link('/admin', 'Admin'));
        items.push(
            h('li', { class: 'who' }, user.name, ' ', h('span', { class: 'badge' }, user.role)),
            h('li', {}, h('button', { type: 'button', class: 'secondary', onClick: logout }, 'Log out'))
        );
    } else if (status === 'anonymous') {
        items.push(link('/login', 'Log in'), link('/register', 'Register'));
    }
 
    nav.replaceChildren(h('ul', { class: 'nav-list' }, ...items));
}
 
/* ---------- pages ---------- */
 
export function homeView() {
    const { status, user } = auth.getState();
 
    const actions =
        status === 'authenticated'
            ? [h('p', {}, 'Signed in as ', h('strong', {}, user.name), '.'), linkButton('/dashboard', 'Open dashboard')]
            : [linkButton('/login', 'Log in'), linkButton('/register', 'Create account', true)];
 
    return h(
        'section',
        { class: 'stack' },
        heading('Auth-ready frontend shell'),
        h(
            'p',
            { class: 'lead' },
            'A framework-free starting point for any app that needs accounts: login, registration, protected pages, ' +
                'role checks and session handling, all behind one API layer you can point at a real backend.'
        ),
        h('div', { class: 'actions' }, ...actions),
        h(
            'ul',
            { class: 'card checklist' },
            h('li', {}, 'Session lives in an HttpOnly cookie. No tokens in localStorage.'),
            h('li', {}, 'Guarded routes wait for the session check, then redirect with a safe ?next= value.'),
            h('li', {}, 'Role-based pages (try the admin account) with a proper 403 page.'),
            h('li', {}, 'Accessible forms: labels, inline errors, focus management, live regions.')
        )
    );
}
 
export function loginView({ params }) {
    const form = buildForm({
        fields: [
            field({ id: 'email', label: 'Email', type: 'email', autocomplete: 'username', inputmode: 'email' }),
            field({ id: 'password', label: 'Password', type: 'password', autocomplete: 'current-password', secret: true }),
        ],
        showToggle: true,
        submitLabel: 'Log in',
        pendingLabel: 'Logging in…',
        clearOnError: ['password'],
        check: (v) => collect({ email: rules.email(v.email), password: rules.loginPassword(v.password) }),
        // On success auth state changes and the router's "guest" rule redirects to ?next= (or /dashboard).
        submit: (v) => auth.login({ email: v.email.trim(), password: v.password }),
    });
 
    const demo = config.USE_MOCK
        ? h(
              'aside',
              { class: 'card demo' },
              h('h2', {}, 'Demo accounts (mock API only)'),
              h('p', {}, h('code', {}, 'demo@example.com'), ' / ', h('code', {}, 'Demo@1234')),
              h('p', {}, h('code', {}, 'admin@example.com'), ' / ', h('code', {}, 'Admin@1234'))
          )
        : null;
 
    const wantsNext = params.get('next') && safeNext(params.get('next')) !== '/dashboard';
 
    return h(
        'section',
        { class: 'stack narrow' },
        heading('Log in'),
        wantsNext && h('p', { class: 'muted' }, 'Please log in to continue.'),
        form,
        h('p', {}, 'No account yet? ', h('a', { href: '#/register' }, 'Register')),
        demo
    );
}
 
export function registerView() {
    const form = buildForm({
        fields: [
            field({ id: 'name', label: 'Name', autocomplete: 'name' }),
            field({ id: 'email', label: 'Email', type: 'email', autocomplete: 'email', inputmode: 'email' }),
            field({
                id: 'password',
                label: 'Password',
                type: 'password',
                autocomplete: 'new-password',
                hint: 'At least 8 characters, with a letter and a number.',
                secret: true,
            }),
            field({ id: 'confirm', label: 'Confirm password', type: 'password', autocomplete: 'new-password', secret: true }),
        ],
        showToggle: true,
        submitLabel: 'Create account',
        pendingLabel: 'Creating account…',
        clearOnError: ['password', 'confirm'],
        check: (v) =>
            collect({
                name: rules.name(v.name),
                email: rules.email(v.email),
                password: rules.password(v.password),
                confirm: v.confirm !== v.password && 'Passwords do not match.',
            }),
        submit: (v) => auth.register({ name: v.name.trim(), email: v.email.trim(), password: v.password }),
    });
 
    return h(
        'section',
        { class: 'stack narrow' },
        heading('Create account'),
        form,
        h('p', {}, 'Already registered? ', h('a', { href: '#/login' }, 'Log in'))
    );
}
 
export function dashboardView() {
    const { user } = auth.getState();
 
    const result = h('pre', { class: 'result', 'aria-live': 'polite' }, 'No request made yet.');
    const probe = h(
        'button',
        {
            type: 'button',
            class: 'secondary',
            onClick: async () => {
                probe.disabled = true;
                result.textContent = 'GET /admin/users …';
                try {
                    const data = await request('/admin/users');
                    result.textContent = `200 OK: ${data.users.length} users returned.`;
                } catch (err) {
                    result.textContent = `${err.status} ${err.message}`;
                } finally {
                    probe.disabled = false;
                }
            },
        },
        'Call the admin API as me'
    );
 
    const row = (label, value) => h('div', { class: 'row' }, h('dt', {}, label), h('dd', {}, value));
 
    return h(
        'section',
        { class: 'stack' },
        heading(`Welcome, ${user.name}`),
        h(
            'dl',
            { class: 'card details' },
            row('Email', user.email),
            row('Role', user.role),
            row('Member since', new Date(user.createdAt).toLocaleDateString())
        ),
        h(
            'div',
            { class: 'card' },
            h('h2', {}, 'Why client-side guards are not security'),
            h(
                'p',
                {},
                'Hiding the Admin link only improves the UI. The real check happens on the server. ' +
                    'Call the admin endpoint directly and see what the server says:'
            ),
            probe,
            result
        )
    );
}
 
export function profileView() {
    const { user } = auth.getState();
 
    const form = buildForm({
        fields: [field({ id: 'name', label: 'Display name', autocomplete: 'name', value: user.name })],
        submitLabel: 'Save changes',
        pendingLabel: 'Saving…',
        check: (v) => collect({ name: rules.name(v.name) }),
        submit: async (v) => {
            await auth.updateProfile({ name: v.name.trim() });
            toast('Profile updated.');
        },
    });
 
    return h(
        'section',
        { class: 'stack narrow' },
        heading('Profile'),
        h('p', {}, 'Email: ', h('strong', {}, user.email)),
        form
    );
}
 
export function adminView() {
    const body = h('p', { class: 'muted', role: 'status' }, 'Loading users…');
 
    request('/admin/users')
        .then(({ users }) => {
            body.replaceWith(
                h(
                    'div',
                    { class: 'table-wrap' },
                    h(
                        'table',
                        {},
                        h('caption', {}, `${users.length} registered users`),
                        h('thead', {}, h('tr', {}, ...['Name', 'Email', 'Role'].map((t) => h('th', { scope: 'col' }, t)))),
                        h(
                            'tbody',
                            {},
                            ...users.map((u) =>
                                h('tr', {}, h('td', {}, u.name), h('td', {}, u.email), h('td', {}, h('span', { class: 'badge' }, u.role)))
                            )
                        )
                    )
                )
            );
        })
        .catch((err) => {
            body.className = 'form-error';
            body.setAttribute('role', 'alert');
            body.textContent = `Could not load users: ${err.message}`;
        });
 
    return h('section', { class: 'stack' }, heading('Admin: users'), body);
}
 
export function loadingView() {
    return h('p', { class: 'muted', role: 'status' }, 'Checking your session…');
}
 
export function forbiddenView() {
    return h(
        'section',
        { class: 'stack' },
        heading('Access denied (403)'),
        h('p', {}, 'Your account does not have permission to view this page.'),
        linkButton('/dashboard', 'Back to dashboard')
    );
}
 
export function notFoundView() {
    return h(
        'section',
        { class: 'stack' },
        heading('Page not found (404)'),
        h('p', {}, 'That page does not exist.'),
        linkButton('/', 'Go home')
    );
}
 