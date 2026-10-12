'use strict';

/* ---------- 1. Safe fetch helper ---------- */
// fetch() only rejects on network failure, so we check res.ok ourselves.
async function fetchJson(url, { timeout = 8000 } = {}) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeout);
    try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return await res.json();
    } catch (err) {
        if (err.name === 'AbortError') throw new Error('Request timed out');
        throw err;
    } finally {
        clearTimeout(timer);
    }
}

/* ---------- 2. Helpers ---------- */
const $ = (sel) => document.querySelector(sel);
const body = (id) => $(`#${id} .body`);

function el(tag, text, className) {
    const node = document.createElement(tag);
    if (text !== undefined) node.textContent = text; // textContent, never innerHTML, for API data
    if (className) node.className = className;
    return node;
}

function setState(id, state) {
    const widget = document.getElementById(id);
    widget.dataset.state = state; // loading | success | error
    widget.setAttribute('aria-busy', String(state === 'loading'));
}

function showError(id, message, retry) {
    const box = el('div');
    const msg = el('p', `Could not load: ${message}`, 'error');
    const btn = el('button', 'Retry');
    btn.type = 'button';
    btn.addEventListener('click', retry);
    box.append(msg, btn);
    body(id).replaceChildren(box);
    setState(id, 'error');
}

/* ---------- 3. Renderers ---------- */
function renderWeather(data) {
    const { temperature, windspeed } = data.current_weather;
    body('weather').replaceChildren(
        el('p', `${temperature}°C`, 'big'),
        el('p', `Wind ${windspeed} km/h`, 'muted')
    );
}

function renderGithub(user) {
    const wrap = el('div', undefined, 'profile');
    const img = document.createElement('img');
    img.src = user.avatar_url;
    img.alt = `${user.login} avatar`;
    img.width = 64;
    img.height = 64;

    const info = el('div');
    info.append(
        el('strong', user.name || user.login),
        el('p', `${user.public_repos} repos · ${user.followers} followers`, 'muted')
    );
    wrap.append(img, info);
    body('github').replaceChildren(wrap);
}

function renderPosts(posts) {
    const ul = el('ul');
    posts.forEach((p) => ul.append(el('li', p.title)));
    body('posts').replaceChildren(ul);
}

function renderProducts(data) {
    const ul = el('ul');
    data.products.forEach((p) => ul.append(el('li', `${p.title} - $${p.price}`)));
    body('products').replaceChildren(ul);
}

/* ---------- 4. Widgets defined as data ---------- */
const widgets = [
    {
        id: 'weather',
        url: 'https://api.open-meteo.com/v1/forecast?latitude=28.61&longitude=77.21&current_weather=true',
        render: renderWeather,
    },
    {
        id: 'github',
        url: 'https://api.github.com/users/shivyansh2',
        render: renderGithub,
    },
    {
        id: 'posts',
        url: 'https://jsonplaceholder.typicode.com/posts?_limit=5',
        render: renderPosts,
    },
    {
        id: 'products',
        url: 'https://dummyjson.com/products?limit=5',
        render: renderProducts,
    },
];

/* ---------- 5. Load one widget, independently ---------- */
async function loadWidget(w) {
    setState(w.id, 'loading');
    body(w.id).replaceChildren();
    try {
        const data = await fetchJson(w.url);
        w.render(data);
        setState(w.id, 'success');
    } catch (err) {
        showError(w.id, err.message, () => loadWidget(w));
    }
}

/* ---------- 6. Load all in parallel ---------- */
// map() starts every request immediately. allSettled waits for all of them
// without throwing, and each loadWidget already handles its own error.
async function loadAll() {
    const start = performance.now();
    $('#timing').textContent = 'Loading widgets...';
    await Promise.allSettled(widgets.map(loadWidget));
    const ms = Math.round(performance.now() - start);
    $('#timing').textContent = `All widgets settled in ${ms} ms (parallel).`;
}

/* ---------- 7. Sequential vs parallel comparison ---------- */
// Uses fetchJson only (no rendering), so the numbers show network time.
async function compareTimings() {
    const btn = $('#compare');
    btn.disabled = true;
    const out = $('#timing');
    out.textContent = 'Measuring...';

    const safe = (w) => fetchJson(w.url).catch(() => null);

    let t = performance.now();
    for (const w of widgets) await safe(w);
    const sequential = Math.round(performance.now() - t);

    t = performance.now();
    await Promise.all(widgets.map(safe));
    const parallel = Math.round(performance.now() - t);

    out.textContent = `Sequential: ${sequential} ms | Parallel: ${parallel} ms`;
    console.log({ sequential, parallel });
    btn.disabled = false;
}

/* ---------- 8. Start ---------- */
document.addEventListener('DOMContentLoaded', () => {
    $('#refresh-all').addEventListener('click', loadAll);
    $('#compare').addEventListener('click', compareTimings);
    loadAll();
});