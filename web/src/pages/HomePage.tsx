import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router";
import { gamesQuery, tournamentsQuery } from "../api/queries";
import type { TournamentStatus } from "../api/types";
import { FilterChips } from "../components/FilterChips";
import { TournamentCard } from "../components/TournamentCard";

const STATUS_FILTERS: Record<string, TournamentStatus> = {
    inscripciones: "REGISTRATION",
    "en-curso": "IN_PROGRESS",
    terminados: "FINISHED",
};

const STATUS_OPTIONS = [
    { value: "", label: "Todos" },
    { value: "inscripciones", label: "Inscripciones" },
    { value: "en-curso", label: "En curso" },
    { value: "terminados", label: "Terminados" },
];

export function HomePage() {
    const [searchParams, setSearchParams] = useSearchParams();
    const game = searchParams.get("juego") ?? "";
    const status = searchParams.get("estado") ?? "";

    const games = useQuery(gamesQuery());
    const tournaments = useQuery(tournamentsQuery({ game: game || undefined, status: STATUS_FILTERS[status] }));

    function updateFilter(key: string, value: string) {
        const next = new URLSearchParams(searchParams);
        if (value) {
            next.set(key, value);
        } else {
            next.delete(key);
        }
        setSearchParams(next, { replace: true });
    }

    const gameOptions = [
        { value: "", label: "Todos los juegos" },
        ...(games.data ?? []).map((item) => ({ value: item.slug, label: item.name })),
    ];

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
            <section className="flex flex-col gap-3">
                <h1 className="font-display text-6xl leading-[0.95] uppercase sm:text-8xl">
                    Encuentra tu
                    <span className="block text-accent">próximo torneo</span>
                </h1>
                <p className="max-w-prose text-muted">
                    Torneos de cualquier juego con el cuadro en directo. Inscribe a tu equipo o sigue los resultados.
                </p>
            </section>

            <section className="flex flex-col gap-3 border-t-2 border-fg pt-6">
                <FilterChips
                    label="Estado"
                    options={STATUS_OPTIONS}
                    selected={status}
                    onSelect={(value) => updateFilter("estado", value)}
                />
                <FilterChips
                    label="Juego"
                    options={gameOptions}
                    selected={game}
                    onSelect={(value) => updateFilter("juego", value)}
                />
            </section>

            {tournaments.isPending && (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-hidden="true">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-64 border border-line bg-surface motion-safe:animate-pulse" />
                    ))}
                </div>
            )}

            {tournaments.isError && (
                <p role="alert" className="border-2 border-live p-4 text-live">
                    No se han podido cargar los torneos. Comprueba que la API está arrancada y recarga la página.
                </p>
            )}

            {tournaments.isSuccess && tournaments.data.length === 0 && (
                <p className="border border-dashed border-line-strong p-8 text-center text-muted">
                    No hay torneos con estos filtros.
                </p>
            )}

            {tournaments.isSuccess && tournaments.data.length > 0 && (
                <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {tournaments.data.map((tournament) => (
                        <li key={tournament.id} className="grid">
                            <TournamentCard tournament={tournament} />
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
