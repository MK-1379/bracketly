# Security policy

## Supported versions

Bracketly is a portfolio project with a single deployment. Only the latest version on the `main` branch, which is the one running at https://bracketly-mk.duckdns.org, receives fixes.

## Reporting a vulnerability

Please don't open a public issue for a security problem.

Report it privately through GitHub instead: open the **Security** tab of this repository and choose **Report a vulnerability**. Include:

- what the problem is and where it is (endpoint, page or file),
- the steps to reproduce it,
- what an attacker could do with it.

I'll reply within 7 days and keep you updated until it's fixed. Once the fix is deployed, I'm happy to credit you in the commit if you want.

## Scope

In scope: the code in this repository and the live demo.

Out of scope:

- The demo accounts and their data. They are public on purpose and are rebuilt every night.
- Denial of service, load testing or automated scanners that send large amounts of traffic to the live demo.
- Problems in third-party services (Oracle Cloud, DuckDNS, Let's Encrypt) or in dependencies that are already reported upstream.

## What the project already does

- Passwords are hashed with bcrypt and never returned by the API.
- The session is a signed JWT in an `httpOnly`, `SameSite=Lax` cookie, marked `Secure` in production.
- Register, login and demo login are rate limited.
- Every request body and parameter is validated with Zod, and database access goes through Prisma, without raw SQL built from user input.
- Organizer and captain actions check ownership on the server, not only in the interface.
- Secrets live only in the server's `.env` and in GitHub Actions secrets, never in the repository.
- nginx sends `X-Content-Type-Options`, `X-Frame-Options` and `Referrer-Policy`, and Express doesn't send `X-Powered-By`.
