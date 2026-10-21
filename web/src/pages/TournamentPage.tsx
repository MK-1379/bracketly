import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router";
import { ApiError } from "../api/client";
import { matchesQuery, tournamentQuery } from "../api/queries";
import { Bracket } from "../components/bracket/Bracket";
import { BracketRounds } from "../components/bracket/BracketRounds";
import { MatchList } from "../components/MatchList";
import { ResultsTicker } from "../components/ResultsTicker";
import { type Tab, Tabs } from "../components/Tabs";
import { TeamList } from "../components/TeamList";
import { TournamentHero } from "../components/TournamentHero";

export function TournamentPage() {
    const { slug = "" } = useParams();
    const tournament = useQuery(tournamentQuery(slug));
    const matches = useQuery(matchesQuery(slug));
    const [selectedTab, setSelectedTab] = useState<string | null>(null);

    if (tournament.isPending) {
        return (
            <div className="mx-auto max-w-6xl px-4 py-10" aria-hidden="true">
                <div className="h-48 max-w-2xl bg-surface motion-safe:animate-pulse" />
            </div>
        );
    }

    if (tournament.isError) {
        const notFound = tournament.error instanceof ApiError && tournament.error.status === 404;
        return (
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-16">
                <h1 className="font-display text-5xl uppercase">
                    {notFound ? "Este torneo no existe" : "No se ha podido cargar el torneo"}
                </h1>
                <Link to="/" className="font-bold text-accent underline underline-offset-4">
                    Volver a los torneos
                </Link>
            </div>
        );
    }

    const data = tournament.data;
    const matchList = matches.data ?? [];
    const hasBracket = matchList.length > 0;

    const tabs: Tab[] = [
        {
            id: "cuadro",
            label: "Cuadro",
            content: hasBracket ? (
                <>
                    <div className="hidden md:block">
                        <Bracket matches={matchList} champion={data.winnerTeam} />
                    </div>
                    <div className="md:hidden">
                        <BracketRounds matches={matchList} champion={data.winnerTeam} />
                    </div>
                </>
            ) : (
                <p className="border border-dashed border-line-strong p-8 text-center text-muted">
                    El cuadro se generará cuando empiece el torneo.
                </p>
            ),
        },
        { id: "equipos", label: "Equipos", content: <TeamList tournament={data} matches={matchList} /> },
        {
            id: "partidos",
            label: "Partidos",
            content: hasBracket ? (
                <MatchList matches={matchList} />
            ) : (
                <p className="text-muted">Aún no hay partidos.</p>
            ),
        },
        {
            id: "reglas",
            label: "Reglas",
            content: (
                <div className="flex max-w-prose flex-col gap-4 leading-relaxed whitespace-pre-line text-muted">
                    {data.description && <p>{data.description}</p>}
                    <p>{data.rules ?? "El organizador no ha publicado reglas."}</p>
                </div>
            ),
        },
    ];

    return (
        <div className="pb-16">
            <title>{`${data.name} · Bracketly`}</title>
            <div className="mx-auto max-w-6xl px-4">
                <TournamentHero tournament={data} />
            </div>
            {hasBracket && (
                <div className="mb-8">
                    <ResultsTicker matches={matchList} />
                </div>
            )}
            <div className="mx-auto max-w-6xl px-4">
                <Tabs
                    label="Secciones del torneo"
                    tabs={tabs}
                    selected={selectedTab ?? (hasBracket ? "cuadro" : "equipos")}
                    onSelect={setSelectedTab}
                />
            </div>
        </div>
    );
}
