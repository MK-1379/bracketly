import { useState } from "react";
import type { Match } from "../api/types";
import { Button } from "../components/Button";
import { ScoreStepper } from "../matches/ScoreStepper";
import { isValidScore, winsNeeded } from "../matches/score";
import { roundName } from "../utils/bracket";
import { useConfirmMatch } from "./useOrganizer";

interface ResultRowProps {
    match: Match;
    slug: string;
    bestOf: number;
    totalRounds: number;
}

export function ResultRow({ match, slug, bestOf, totalRounds }: ResultRowProps) {
    const confirm = useConfirmMatch(slug);
    const [editing, setEditing] = useState(false);
    const [scoreA, setScoreA] = useState(match.scoreA ?? 0);
    const [scoreB, setScoreB] = useState(match.scoreB ?? 0);

    if (!match.teamA || !match.teamB) {
        return null;
    }

    const reported = match.status === "REPORTED";
    const valid = isValidScore(bestOf, scoreA, scoreB);
    const max = winsNeeded(bestOf);

    function save() {
        confirm.mutate({ matchId: match.id, scoreA, scoreB });
    }

    return (
        <li className={`flex flex-col gap-4 border bg-surface p-5 ${reported ? "border-accent" : "border-line"}`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex min-w-0 flex-col gap-1">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted">
                        {roundName(match.round, totalRounds)} · Partido {match.position}
                    </span>
                    <strong className="font-display text-2xl leading-tight uppercase">
                        {match.teamA.name}{" "}
                        {reported ? (
                            <span className="text-accent tabular-nums">
                                {match.scoreA} – {match.scoreB}
                            </span>
                        ) : (
                            <span className="text-muted">vs</span>
                        )}{" "}
                        {match.teamB.name}
                    </strong>
                    {reported && (
                        <span className="text-sm text-muted">
                            Reportado por {match.reportedBy?.displayName ?? "un capitán"}
                            {match.proofUrl && (
                                <>
                                    {" · "}
                                    <a
                                        href={match.proofUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="font-bold text-accent underline underline-offset-4"
                                    >
                                        Ver captura
                                    </a>
                                </>
                            )}
                        </span>
                    )}
                </div>

                {!editing && (
                    <div className="flex flex-wrap gap-2">
                        <Button variant={reported ? "outline" : "primary"} onClick={() => setEditing(true)}>
                            {reported ? "Corregir" : "Introducir resultado"}
                        </Button>
                        {reported && (
                            <Button disabled={confirm.isPending} onClick={() => confirm.mutate({ matchId: match.id })}>
                                {confirm.isPending ? "Confirmando..." : "Confirmar"}
                            </Button>
                        )}
                    </div>
                )}
            </div>

            {editing && (
                <div className="flex flex-col gap-3 border-t border-line pt-4">
                    <ScoreStepper
                        teamId={match.teamA.id}
                        teamName={match.teamA.name}
                        value={scoreA}
                        max={max}
                        isWinner={valid && scoreA > scoreB}
                        onChange={setScoreA}
                    />
                    <ScoreStepper
                        teamId={match.teamB.id}
                        teamName={match.teamB.name}
                        value={scoreB}
                        max={max}
                        isWinner={valid && scoreB > scoreA}
                        onChange={setScoreB}
                    />
                    <p aria-live="polite" className={`text-sm font-bold ${valid ? "text-accent" : "text-muted"}`}>
                        {valid
                            ? `Gana ${scoreA > scoreB ? match.teamA.name : match.teamB.name} · ${scoreA} — ${scoreB}`
                            : `El ganador necesita ${max} para cerrar la serie`}
                    </p>
                    <div className="flex flex-wrap gap-2">
                        <Button disabled={!valid || confirm.isPending} onClick={save}>
                            {confirm.isPending ? "Guardando..." : "Guardar y confirmar"}
                        </Button>
                        <Button variant="outline" onClick={() => setEditing(false)}>
                            Cancelar
                        </Button>
                    </div>
                </div>
            )}

            {confirm.isError && (
                <p role="alert" className="text-sm font-semibold text-live">
                    No se ha podido confirmar el resultado. Recarga la página y vuelve a intentarlo.
                </p>
            )}
        </li>
    );
}
