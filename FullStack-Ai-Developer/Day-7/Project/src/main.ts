import './styles.css';
import * as auth from './auth';
import { defineRoutes, resolve, navigate, currentPath } from './router';
import * as views from './views';
import type { SpecialPage } from './types';

// Fail loudly at startup if index.html loses an element we depend on,
// instead of crashing later with "cannot read properties of null".
function byId(id: string): HTMLElement {
    const element = document.getElementById(id);
    if (!element) throw new Error(`Missing #${id} in index.html`);
    return element;
}

const app = byId('app');
const nav = byId('nav');

defineRoutes([
    { path: '/', title: 'Home', access: 'public', view: views.homeView },
    { path: '/login', title: 'Log in', access: 'guest', view: views.loginView },
    { path: '/register', title: 'Register', access: 'guest', view: views.registerView },
    { path: '/dashboard', title: 'Dashboard', access: 'auth', view: views.dashboardView },
    { path: '/profile', title: 'Profile', access: 'auth', view: views.profileView },
    { path: '/admin', title: 'Admin', access: 'auth', roles: ['admin'], view: views.adminView },
]);

// Record<SpecialPage, ...> means TypeScript errors if a page is added to SpecialPage but not handled here.
const specialPages: Record<SpecialPage, { title: string; view: () => HTMLElement }> = {
    loading: { title: 'Loading', view: views.loadingView },
    forbidden: { title: 'Access denied', view: views.forbiddenView },
    notFound: { title: 'Not found', view: views.notFoundView },
};

let lastPath: string | null = null;

function render(): void {
    const result = resolve();

    if (result.kind === 'redirect') {
        navigate(result.to, { replace: true }); // triggers hashchange, which renders again
        return;
    }

    const path = currentPath();
    views.renderNav(nav, auth.getState(), path);

    const page =
        result.kind === 'route'
            ? { title: result.route.title, node: result.route.view({ params: result.params }) }
            : { title: specialPages[result.page].title, node: specialPages[result.page].view() };

    app.replaceChildren(page.node);
    document.title = `${page.title} | AuthShell`;

    // Single-page apps do not reload, so move focus to the new page heading
    // (keyboard and screen reader users would otherwise stay stuck on the old spot).
    if (path !== lastPath) {
        lastPath = path;
        app.querySelector('h1')?.focus();
    }
}

// The skip link cannot use a #fragment because the hash is the router.
document.querySelector('.skip-link')?.addEventListener('click', (event) => {
    event.preventDefault();
    app.focus();
});

window.addEventListener('hashchange', render);
window.addEventListener('auth:expired', () => views.toast('Your session expired. Please log in again.'));
auth.subscribe(render);

render(); // first paint: public pages show immediately, guarded pages show "Checking your session…"
void auth.init(); // then ask the server who we are; subscribe() re-renders when it answers