import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import type { MyMatch } from "./matches.api";
import { ScoreStepper } from "./ScoreStepper";
import { isValidProofUrl, isValidScore, winsNeeded } from "./score";
import { useReportMatch } from "./useMatches";

function reportErrorMessage(error: Error) {
    if (error instanceof ApiError && error.status === 409) {
        return "Este partido ya no admite resultados. Puede que el organizador ya lo haya confirmado.";
    }
    if (error instanceof ApiError && error.status === 403) {
        return "Solo los capitanes de los dos equipos pueden reportar este partido.";
    }
    return "No se ha podido enviar el resultado. Inténtalo de nuevo.";
}

export function ReportForm({ match }: { match: MyMatch }) {
    const navigate = useNavigate();
    const reportMatch = useReportMatch(match.tournament.slug);
    const [scoreA, setScoreA] = useState(match.scoreA ?? 0);
    const [scoreB, setScoreB] = useState(match.scoreB ?? 0);
    const [errors, setErrors] = useState<{ score?: string; proofUrl?: string }>({});

    const { bestOf } = match.tournament;
    const max = winsNeeded(bestOf);
    const valid = isValidScore(bestOf, scoreA, scoreB);
    const winner = scoreA > scoreB ? match.teamA : match.teamB;
    const showScoreError = Boolean(errors.score) && !valid;

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const proofUrl = String(form.get("proofUrl") ?? "").trim();

        const validation: typeof errors = {};
        if (!valid) {
            validation.score = `Al mejor de ${bestOf}, el ganador necesita ${max} ${max === 1 ? "victoria" : "victorias"}.`;
        }
        if (proofUrl && !isValidProofUrl(proofUrl)) {
            validation.proofUrl = "Pega un enlace que empiece por http:// o https://.";
        }
        setErrors(validation);
        if (validation.score || validation.proofUrl) {
            return;
        }

        reportMatch.mutate(
            { matchId: match.id, data: { scoreA, scoreB, proofUrl: proofUrl || undefined } },
            { onSuccess: () => navigate("/panel", { replace: true }) },
        );
    }

    if (!match.teamA || !match.teamB) {
        return null;
    }

    return (
        <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
            <fieldset
                aria-describedby="score-summary"
                className={`flex flex-col gap-3 border bg-surface p-4 ${showScoreError ? "border-live" : "border-line-strong"}`}
            >
                <legend className="sr-only">Resultado</legend>
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
                <p
                    id="score-summary"
                    aria-live="polite"
                    className={`text-sm font-bold uppercase tracking-widest ${valid ? "text-accent" : "text-muted"}`}
                >
                    {valid
                        ? `Gana ${winner?.name} · ${scoreA} — ${scoreB}`
                        : `El ganador necesita ${max} para cerrar la serie`}
                </p>
                {showScoreError && <p className="text-sm font-semibold text-live">{errors.score}</p>}
            </fieldset>

            <Field
                label="Enlace a la captura (opcional)"
                name="proofUrl"
                type="url"
                inputMode="url"
                placeholder="https://"
                defaultValue={match.proofUrl ?? ""}
                hint="Sube la captura del marcador final (por ejemplo a Imgur o Discord) y pega aquí el enlace."
                error={errors.proofUrl}
            />

            <p className="text-sm text-muted">
                El organizador revisará el resultado antes de darlo por bueno. Si el otro capitán no está de acuerdo,
                puede enviar el suyo y el organizador decidirá.
            </p>

            {reportMatch.isError && (
                <p role="alert" className="border-2 border-live p-3 text-sm font-semibold text-live">
                    {reportErrorMessage(reportMatch.error)}
                </p>
            )}

            <Button type="submit" disabled={reportMatch.isPending}>
                {reportMatch.isPending ? "Enviando..." : "Enviar resultado"}
            </Button>
        </form>
    );
}
