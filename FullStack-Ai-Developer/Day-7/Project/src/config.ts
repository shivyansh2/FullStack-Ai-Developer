interface Config {
    // true: requests are answered by mock-api.ts (no backend needed).
    // false: requests go to the real server at API_BASE using fetch().
    readonly USE_MOCK: boolean;
    readonly API_BASE: string;
}

export const config: Config = {
    USE_MOCK: true,
    API_BASE: '/api',
};