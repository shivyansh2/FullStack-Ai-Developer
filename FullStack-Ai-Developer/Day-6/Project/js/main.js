import * as auth from './auth.js';
import { defineRoutes, resolve, navigate, currentPath } from './router.js';
import * as views from './views.js';
 
const app = document.getElementById('app');
const nav = document.getElementById('nav');
 
defineRoutes([
    { path: '/', title: 'Home', access: 'public', view: views.homeView },
    { path: '/login', title: 'Log in', access: 'guest', view: views.loginView },
    { path: '/register', title: 'Register', access: 'guest', view: views.registerView },
    { path: '/dashboard', title: 'Dashboard', access: 'auth', view: views.dashboardView },
    { path: '/profile', title: 'Profile', access: 'auth', view: views.profileView },
    { path: '/admin', title: 'Admin', access: 'auth', roles: ['admin'], view: views.adminView },
]);
 
const specialPages = {
    loading: { title: 'Loading', view: views.loadingView },
    forbidden: { title: 'Access denied', view: views.forbiddenView },
    notFound: { title: 'Not found', view: views.notFoundView },
};
 
let lastPath = null;
 
function render() {
    const result = resolve();
 
    if (result.redirect) {
        navigate(result.redirect, { replace: true }); // triggers hashchange, which renders again
        return;
    }
 
    const path = currentPath();
    views.renderNav(nav, auth.getState(), path);
 
    const page = result.route || specialPages[result.special];
    app.replaceChildren(page.view({ params: result.params }));
    document.title = `${page.title} | AuthShell`;
 
    // Single-page apps do not reload, so move focus to the new page heading
    // (keyboard and screen reader users would otherwise stay stuck on the old spot).
    if (path !== lastPath) {
        lastPath = path;
        const title = app.querySelector('h1');
        if (title) title.focus();
    }
}
 
// The skip link cannot use a #fragment because the hash is the router.
document.querySelector('.skip-link').addEventListener('click', (event) => {
    event.preventDefault();
    app.focus();
});
 
window.addEventListener('hashchange', render);
window.addEventListener('auth:expired', () => views.toast('Your session expired. Please log in again.'));
auth.subscribe(render);
 
render(); // first paint: public pages show immediately, guarded pages show "Checking your session…"
auth.init(); // then ask the server who we are; subscribe() re-renders when it answers
 