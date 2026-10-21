import { Link } from "react-router";
import { TeamBadge } from "./TeamBadge";
import type { MyTeam } from "./teams.api";

export function TeamCard({ team }: { team: MyTeam }) {
    const players = team.members.length;

    return (
        <Link
            to={`/panel/equipos/${team.id}`}
            className="flex items-center gap-4 border border-line bg-surface p-5 transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:border-accent hover:shadow-[4px_4px_0_var(--color-accent)]"
        >
            <TeamBadge teamId={team.id} tag={team.tag} />
            <span className="flex min-w-0 flex-col gap-1">
                <strong className="truncate font-display text-2xl leading-none uppercase">{team.name}</strong>
                <span className="text-sm text-muted">
                    {team.isCaptain ? "Eres el capitán" : `Capitán: ${team.captain.displayName}`} · {players}{" "}
                    {players === 1 ? "jugador" : "jugadores"}
                </span>
            </span>
        </Link>
    );
}
