import { useQuery } from "@tanstack/react-query";
import { type FormEvent, type ReactNode, useState } from "react";
import { Link, useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { gamesQuery } from "../api/queries";
import type { TournamentSummary } from "../api/types";
import { useCurrentUser } from "../auth/useAuth";
import { type FormErrors, hasErrors } from "../auth/validation";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { OptionGroup } from "../components/OptionGroup";
import { SelectField } from "../components/SelectField";
import { TextAreaField } from "../components/TextAreaField";
import { TournamentCard } from "../components/TournamentCard";
import { nextWeekAtSix } from "../organizer/dates";
import type { TournamentData } from "../organizer/organizer.api";
import { useCreateTournament } from "../organizer/useOrganizer";
import { TOURNAMENT_MESSAGES, validateTournament } from "../organizer/validation";

const TEAM_OPTIONS = [4, 8, 16, 32].map((value) => ({ value, label: String(value) }));
const SIZE_OPTIONS = [1, 2, 3, 4, 5].map((value) => ({ value, label: String(value) }));
const BEST_OF_OPTIONS = [1, 3, 5].map((value) => ({ value, label: `Al mejor de ${value}` }));

interface FormValues {
    name: string;
    gameId: number;
    startsAt: string;
    maxTeams: number;
    teamSize: number;
    bestOf: number;
    description: string;
    rules: string;
}

function toTournamentData(values: FormValues): TournamentData {
    const startsAt = new Date(values.startsAt);
    return {
        name: values.name.trim(),
        gameId: values.gameId,
        startsAt: Number.isNaN(startsAt.getTime()) ? "" : startsAt.toISOString(),
        maxTeams: values.maxTeams,
        teamSize: values.teamSize,
        bestOf: values.bestOf,
        description: values.description.trim() || undefined,
        rules: values.rules.trim() || undefined,
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

export function NewTournamentPage() {
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const games = useQuery(gamesQuery());
    const createTournament = useCreateTournament();
    const [errors, setErrors] = useState<FormErrors<TournamentData>>({});
    const [values, setValues] = useState<FormValues>({
        name: "",
        gameId: 0,
        startsAt: nextWeekAtSix(),
        maxTeams: 8,
        teamSize: 5,
        bestOf: 3,
        description: "",
        rules: "",
    });

    function update<K extends keyof FormValues>(field: K, value: FormValues[K]) {
        setValues((current) => ({ ...current, [field]: value }));
        setErrors((current) => ({ ...current, [field]: undefined }));
    }

    const game = games.data?.find((item) => item.id === values.gameId);
    const preview: TournamentSummary = {
        id: 0,
        slug: "",
        name: values.name.trim() || "Tu torneo",
        startsAt: toTournamentData(values).startsAt || new Date().toISOString(),
        maxTeams: values.maxTeams,
        teamSize: values.teamSize,
        bestOf: values.bestOf,
        status: "DRAFT",
        game: { slug: game?.slug ?? "", name: game?.name ?? "Juego", logoUrl: null },
        organizer: { id: user?.id ?? 0, displayName: user?.displayName ?? "" },
        _count: { registrations: 0 },
    };

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        const openNow = submitter?.getAttribute("value") === "open";
        const data = toTournamentData(values);

        const validation = validateTournament(data);
        setErrors(validation);
        if (hasErrors(validation)) {
            return;
        }

        createTournament.mutate(
            { data, openNow },
            {
                onSuccess: (tournament) => navigate(`/panel/torneos/${tournament.slug}`, { replace: true }),
                onError: (error) => {
                    if (error instanceof ApiError && error.status === 400) {
                        const fields = Object.keys(error.fields) as (keyof TournamentData)[];
                        setErrors(Object.fromEntries(fields.map((field) => [field, TOURNAMENT_MESSAGES[field]])));
                    }
                },
            },
        );
    }

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
            <title>Nuevo torneo · Bracketly</title>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">
                    <Link to="/panel" className="hover:text-fg">
                        Mi panel
                    </Link>{" "}
                    / Nuevo torneo
                </p>
                <h1 className="font-display text-6xl leading-none uppercase sm:text-7xl">Nuevo torneo</h1>
            </div>

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
                            options={TEAM_OPTIONS}
                            value={values.maxTeams}
                            onChange={(value) => update("maxTeams", value)}
                            hint="Si se apuntan menos equipos, los mejores cabezas de serie pasan la primera ronda directamente."
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

                    {createTournament.isError &&
                        !(createTournament.error instanceof ApiError && createTournament.error.status === 400) && (
                            <p role="alert" className="border-2 border-live p-3 text-sm font-semibold text-live">
                                No se ha podido crear el torneo. Inténtalo de nuevo.
                            </p>
                        )}

                    <div className="flex flex-wrap justify-end gap-3">
                        <Button type="submit" value="draft" variant="outline" disabled={createTournament.isPending}>
                            Guardar borrador
                        </Button>
                        <Button type="submit" value="open" disabled={createTournament.isPending}>
                            {createTournament.isPending ? "Creando..." : "Abrir inscripciones"}
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
        </div>
    );
}
