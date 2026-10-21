import type { Match, TournamentDetail } from "../api/types";
import { isBye, roundName, teamColor } from "../utils/bracket";

function teamStatus(teamId: number, tournament: TournamentDetail, matches: Match[]) {
    if (tournament.winnerTeam?.id === teamId) {
        return { text: "Campeón", highlight: true };
    }
    const totalRounds = Math.max(0, ...matches.map((match) => match.round));
    const lost = matches.find(
        (match) =>
            match.status === "CONFIRMED" &&
            !isBye(match) &&
            match.winnerTeamId !== teamId &&
            (match.teamA?.id === teamId || match.teamB?.id === teamId),
    );
    if (lost) {
        return { text: `Eliminado en ${roundName(lost.round, totalRounds).toLowerCase()}`, highlight: false };
    }
    return { text: matches.length > 0 ? "En juego" : "Inscrito", highlight: true };
}

export function TeamList({ tournament, matches }: { tournament: TournamentDetail; matches: Match[] }) {
    if (tournament.registrations.length === 0) {
        return <p className="text-muted">Todavía no hay equipos inscritos.</p>;
    }

    return (
        <ul className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
            {tournament.registrations.map(({ seed, team }) => {
                const status = teamStatus(team.id, tournament, matches);
                return (
                    <li key={team.id} className="flex items-center gap-3 border border-line bg-surface p-4">
                        <span className="min-w-[1.4em] font-display text-3xl text-muted">{seed ?? "·"}</span>
                        <span className="h-9 w-1.5 shrink-0" style={{ backgroundColor: teamColor(team.id) }} />
                        <span className="min-w-0">
                            <strong className="block truncate uppercase tracking-wide">{team.name}</strong>
                            <span
                                className={`text-xs font-bold uppercase tracking-widest ${status.highlight ? "text-accent" : "text-muted"}`}
                            >
                                {status.text}
                            </span>
                        </span>
                    </li>
                );
            })}
        </ul>
    );
}
