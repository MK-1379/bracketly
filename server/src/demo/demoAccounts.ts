export const DEMO_DOMAIN = "@demo.bracketly.dev";

export const DEMO_ACCOUNTS = {
    organizer: `organizador${DEMO_DOMAIN}`,
    captain: `capitan.neb${DEMO_DOMAIN}`,
} as const;

export type DemoRole = keyof typeof DEMO_ACCOUNTS;
