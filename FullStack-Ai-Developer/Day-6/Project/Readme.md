# AuthShell: auth-ready frontend shell
 
A framework-free frontend with login, registration, protected pages, role checks and session handling.
It runs with **no backend** (a mock API lives in the browser) and is built so you can point it at a real
server by changing one flag.
 
## Run it
 
```bash
npx serve 
 
Demo accounts (mock API only):
 
| Email | Password | Role |
|---|---|---|
| `demo@example.com` | `Demo@1234` | user |
| `admin@example.com` | `Admin@1234` | admin |
 
To reset the mock database, clear this site's data in DevTools (Application, Storage).
 
## Structure
 
```
project/
├── index.html
├── styles.css
└── js/
    ├── config.js     USE_MOCK flag and API_BASE
    ├── mock-api.js   fake backend: users, sessions, validation, rate limiting
    ├── api.js        the ONLY place that talks to a server (fetch wrapper)
    ├── auth.js       auth state (in memory) + login/register/logout/init
    ├── router.js     hash router with access rules and safe redirects
    ├── views.js      pages, accessible forms, nav, toast
    └── main.js       wires routes, renders, manages focus
```
 
Request flow:
 
```
View → auth.js → api.js → (mock-api.js | real server)
```