# Bracketly API

Base URL in development: `http://localhost:3001/api`

All bodies are JSON. Authentication uses an `httpOnly` cookie called `session`, set by `register` and `login`. Errors always have the shape `{ "error": "message" }`; validation errors (400) also include `fields` with the problem of each field.

| Code | Meaning |
|---|---|
| 400 | Invalid data |
| 401 | Not logged in |
| 403 | Logged in, but not allowed (not the organizer or captain) |
| 404 | Not found |
| 409 | Valid request that conflicts with the current state (already registered, tournament full, already started...) |
| 429 | Too many login or register attempts |

## Auth

| Method | Path | Access | Body | Response |
|---|---|---|---|---|
| POST | `/auth/register` | Public | `email`, `password` (8-72), `displayName` (3-40) | `201 { user }` + session cookie |
| POST | `/auth/login` | Public | `email`, `password` | `200 { user }` + session cookie |
| POST | `/auth/logout` | Public | | `204` |
| GET | `/auth/me` | User | | `200 { user }` |

## Games

| Method | Path | Access | Response |
|---|---|---|---|
| GET | `/games` | Public | `200 { games }` |

## Tournaments

| Method | Path | Access | Body / query | Response |
|---|---|---|---|---|
| GET | `/tournaments` | Public | `?game=<slug>&status=<status>` | `200 { tournaments }` (drafts are hidden) |
| GET | `/tournaments/:slug` | Public | | `200 { tournament }` with accepted teams |
| POST | `/tournaments` | User | `name`, `gameId`, `startsAt`, `maxTeams` (2-64), `teamSize` (1-10), `bestOf` (1, 3, 5), `description?`, `rules?` | `201 { tournament }` as `DRAFT` |
| PATCH | `/tournaments/:slug` | Organizer | Any field of the create body | `200 { tournament }` (only before it starts) |
| POST | `/tournaments/:slug/open` | Organizer | | `200 { tournament }` as `REGISTRATION` |
| POST | `/tournaments/:slug/start` | Organizer | | `200` creates the bracket, status `IN_PROGRESS` |
| DELETE | `/tournaments/:slug` | Organizer | | `204` (only before it starts) |
| GET | `/tournaments/:slug/matches` | Public | | `200 { matches }` ordered by round and position |

Tournament status: `DRAFT` → `REGISTRATION` → `IN_PROGRESS` → `FINISHED`.

## Registrations

| Method | Path | Access | Body | Response |
|---|---|---|---|---|
| GET | `/tournaments/:slug/registrations` | Organizer | | `200 { registrations }` |
| POST | `/tournaments/:slug/registrations` | Team captain | `teamId` | `201 { registration }` as `PENDING` |
| PATCH | `/tournaments/:slug/registrations/:teamId` | Organizer | `status`: `ACCEPTED` or `REJECTED` | `200 { registration }` |
| DELETE | `/tournaments/:slug/registrations/:teamId` | Team captain | | `204` |

## Teams

| Method | Path | Access | Body | Response |
|---|---|---|---|---|
| POST | `/teams` | User | `name` (2-40), `tag` (2-5 letters or numbers) | `201 { team }` with `inviteCode` |
| GET | `/teams/mine` | User | | `200 { teams }` with members and registrations (`inviteCode` only for the captain) |
| GET | `/teams/:id` | Public | | `200 { team }` with members |
| POST | `/teams/:id/invite-code` | Captain | | `200 { inviteCode }` (the old one stops working) |
| DELETE | `/teams/:id/members/:userId` | Captain, or the member themselves | | `204` |
| POST | `/join/:code` | User | | `201 { team }` |

## Matches

| Method | Path | Access | Body | Response |
|---|---|---|---|---|
| POST | `/matches/:id/report` | Captain of either team | `scoreA`, `scoreB`, `proofUrl?` (http or https) | `200 { match }` as `REPORTED` |
| POST | `/matches/:id/confirm` | Organizer | `scoreA?`, `scoreB?` (defaults to the reported score) | `200 { match }` as `CONFIRMED`; the winner moves to the next match |

Match status: `PENDING` (waiting for teams) → `READY` → `REPORTED` → `CONFIRMED`. Byes are created as `CONFIRMED`. Confirming the final sets the tournament to `FINISHED` with its winner.
