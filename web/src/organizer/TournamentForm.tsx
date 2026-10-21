import { useQuery } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useState } from "react";
import { ApiError } from "../api/client";
import { gamesQuery } from "../api/queries";
import type { TournamentDetail, TournamentSummary } from "../api/types";
import { useCurrentUser } from "../auth/useAuth";
import { type FormErrors, hasErrors } from "../auth/validation";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { OptionGroup } from "../components/OptionGroup";
import { SelectField } from "../components/SelectField";
import { TextAreaField } from "../components/TextAreaField";
import { TournamentCard } from "../components/TournamentCard";
import { nextWeekAtSix, toDateTimeLocal } from "./dates";
import type { TournamentData } from "./organizer.api";
import { TOURNAMENT_MESSAGES, validateTournament } from "./validation";

const SIZE_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({ value, label: String(value) }));
const BEST_OF_OPTIONS = [1, 3, 5].map((value) => ({ value, label: `Al mejor de ${value}` }));

export interface TournamentFormValues {
    name: string;
    gameId: number;
    startsAt: string;
    maxTeams: number;
    teamSize: number;
    bestOf: number;
    description: string;
    rules: string;
}

export type SubmitIntent = "primary" | "secondary";

export function emptyTournamentValues(): TournamentFormValues {
    return {
        name: "",
        gameId: 0,
        startsAt: nextWeekAtSix(),
        maxTeams: 8,
        teamSize: 5,
        bestOf: 3,
        description: "",
        rules: "",
    };
}

export function tournamentToValues(tournament: TournamentDetail, gameId: number): TournamentFormValues {
    return {
        name: tournament.name,
        gameId,
        startsAt: toDateTimeLocal(new Date(tournament.startsAt)),
        maxTeams: tournament.maxTeams,
        teamSize: tournament.teamSize,
        bestOf: tournament.bestOf,
        description: tournament.description ?? "",
        rules: tournament.rules ?? "",
    };
}

function toTournamentData(values: TournamentFormValues): TournamentData {
    const startsAt = new Date(values.startsAt);
    return {
        name: values.name.trim(),
        gameId: values.gameId,
        startsAt: Number.isNaN(startsAt.getTime()) ? "" : startsAt.toISOString(),
        maxTeams: values.maxTeams,
        teamSize: values.teamSize,
        bestOf: values.bestOf,
        description: values.description.trim(),
        rules: values.rules.trim(),
    };
}

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <section className="flex flex-col gap-5 border border-line bg-surface p-5 sm:p-7">
            <h2 className="font-display text-3xl leading-none uppercase">{title}</h2>
            {children}
        </section>
    );
}

interface TournamentFormProps {
    initialValues: TournamentFormValues;
    primaryLabel: string;
    secondaryLabel?: string;
    status?: TournamentSummary["status"];
    acceptedTeams?: number;
    pending: boolean;
    onSubmit: (data: TournamentData, intent: SubmitIntent) => Promise<unknown>;
}

export function TournamentForm({
    initialValues,
    primaryLabel,
    secondaryLabel,
    status = "DRAFT",
    acceptedTeams = 0,
    pending,
    onSubmit,
}: TournamentFormProps) {
    const { data: user } = useCurrentUser();
    const games = useQuery(gamesQuery());
    const [values, setValues] = useState(initialValues);
    const [errors, setErrors] = useState<FormErrors<TournamentData>>({});
    const [failed, setFailed] = useState(false);

    function update<K extends keyof TournamentFormValues>(field: K, value: TournamentFormValues[K]) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    const teamOptions = [4, 8, 16, 32].map((value) => ({
        value,
        label: String(value),
        disabled: value < acceptedTeams,
    }));

    const game = games.data?.find((item) => item.id === values.gameId);
    const preview: TournamentSummary = {
        id: 0,
        slug: "",
        name: values.name.trim() || "Tu torneo",
        startsAt: toTournamentData(values).startsAt || new Date().toISOString(),
        maxTeams: values.maxTeams,
        teamSize: values.teamSize,
        bestOf: values.bestOf,
        status,
        game: { slug: game?.slug ?? "", name: game?.name ?? "Juego", logoUrl: null },
        organizer: { id: user?.id ?? 0, displayName: user?.displayName ?? "" },
        _count: { registrations: acceptedTeams },
    };

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        const intent: SubmitIntent = submitter?.getAttribute("value") === "secondary" ? "secondary" : "primary";
        const data = toTournamentData(values);

        const validation = validateTournament(data);
        setErrors(validation);
        setFailed(false);
        if (hasErrors(validation)) {
            return;
        }

        onSubmit(data, intent).catch((error: unknown) => {
            if (error instanceof ApiError && error.status === 400) {
                const fields = Object.keys(error.fields) as (keyof TournamentData)[];
                setErrors(Object.fromEntries(fields.map((field) => [field, TOURNAMENT_MESSAGES[field]])));
            } else {
                setFailed(true);
            }
        });
    }

    return (
        <div className="grid gap-8 lg:grid-cols-[1fr_380px] lg:items-start">
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-6">
                <Section title="Datos básicos">
                    <Field
                        label="Nombre del torneo"
                        name="name"
                        autoComplete="off"
                        value={values.name}
                        onChange={(event) => update("name", event.target.value)}
                        error={errors.name}
                    />
                    <div className="grid gap-5 sm:grid-cols-2">
                        <SelectField
                            label="Juego"
                            name="gameId"
                            value={values.gameId}
                            onChange={(event) => update("gameId", Number(event.target.value))}
                            error={errors.gameId}
                        >
                            <option value={0} disabled>
                                Elige un juego
                            </option>
                            {games.data?.map((item) => (
                                <option key={item.id} value={item.id}>
                                    {item.name}
                                </option>
                            ))}
                        </SelectField>
                        <Field
                            label="Fecha de inicio"
                            name="startsAt"
                            type="datetime-local"
                            value={values.startsAt}
                            onChange={(event) => update("startsAt", event.target.value)}
                            error={errors.startsAt}
                        />
                    </div>
                    <TextAreaField
                        label="Descripción"
                        name="description"
                        value={values.description}
                        onChange={(event) => update("description", event.target.value)}
                        hint="Opcional. Aparece en la cabecera del torneo."
                        error={errors.description}
                    />
                </Section>

                <Section title="Formato">
                    <OptionGroup
                        label="Número de equipos"
                        name="maxTeams"
                        options={teamOptions}
                        value={values.maxTeams}
                        onChange={(value) => update("maxTeams", value)}
                        hint={
                            acceptedTeams > 0
                                ? `Ya hay ${acceptedTeams} equipos aceptados: no puedes elegir menos plazas.`
                                : "Si se apuntan menos equipos, los mejores cabezas de serie pasan la primera ronda directamente."
                        }
                    />
                    <OptionGroup
                        label="Jugadores por equipo"
                        name="teamSize"
                        options={SIZE_OPTIONS}
                        value={values.teamSize}
                        onChange={(value) => update("teamSize", value)}
                    />
                    <OptionGroup
                        label="Partidas"
                        name="bestOf"
                        options={BEST_OF_OPTIONS}
                        value={values.bestOf}
                        onChange={(value) => update("bestOf", value)}
                    />
                </Section>

                <Section title="Reglas">
                    <TextAreaField
                        label="Reglas del torneo"
                        name="rules"
                        value={values.rules}
                        onChange={(event) => update("rules", event.target.value)}
                        hint="Opcional. Se muestra en la pestaña Reglas del torneo."
                        error={errors.rules}
                    />
                </Section>

                {failed && (
                    <p role="alert" className="border-2 border-live p-3 text-sm font-semibold text-live">
                        No se ha podido guardar el torneo. Inténtalo de nuevo.
                    </p>
                )}

                <div className="flex flex-wrap justify-end gap-3">
                    {secondaryLabel && (
                        <Button type="submit" value="secondary" variant="outline" disabled={pending}>
                            {secondaryLabel}
                        </Button>
                    )}
                    <Button type="submit" value="primary" disabled={pending}>
                        {pending ? "Guardando..." : primaryLabel}
                    </Button>
                </div>
            </form>

            <aside className="flex flex-col gap-3 lg:sticky lg:top-6">
                <h2 className="text-xs font-bold uppercase tracking-widest text-muted">Vista previa</h2>
                <div inert className="grid">
                    <TournamentCard tournament={preview} />
                </div>
                <p className="text-sm text-muted">
                    Así verán el torneo los demás en la lista. Se actualiza mientras rellenas el formulario.
                </p>
            </aside>
        </div>
    );
}
