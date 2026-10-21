import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router";
import { gamesQuery, tournamentQuery } from "../api/queries";
import { useCurrentUser } from "../auth/useAuth";
import { TournamentForm, tournamentToValues } from "../organizer/TournamentForm";
import { useUpdateTournament } from "../organizer/useOrganizer";

export function EditTournamentPage() {
    const { slug = "" } = useParams();
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const tournament = useQuery(tournamentQuery(slug));
    const games = useQuery(gamesQuery());
    const updateTournament = useUpdateTournament(slug);

    if (tournament.isPending || games.isPending) {
        return <div className="mx-auto h-64 max-w-6xl px-4 py-10" aria-busy="true" />;
    }

    const data = tournament.data;
    const editable = data?.status === "DRAFT" || data?.status === "REGISTRATION";
    if (!data || data.organizer.id !== user?.id || !editable) {
        return (
            <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-10">
                <title>No se puede editar · Bracketly</title>
                <h1 className="font-display text-5xl uppercase">No se puede editar</h1>
                <p className="text-muted">Solo el organizador puede editar un torneo, y solo antes de que empiece.</p>
                <Link to="/panel" className="font-bold text-accent underline underline-offset-4">
                    Volver a mi panel
                </Link>
            </div>
        );
    }

    const gameId = games.data?.find((game) => game.slug === data.game.slug)?.id ?? 0;
    const manageUrl = `/panel/torneos/${data.slug}`;

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-10">
            <title>{`Editar ${data.name} · Bracketly`}</title>
            <div>
                <p className="text-xs font-bold uppercase tracking-widest text-muted">
                    <Link to={manageUrl} className="hover:text-fg">
                        {data.name}
                    </Link>{" "}
                    / Editar
                </p>
                <h1 className="font-display text-6xl leading-none uppercase sm:text-7xl">Editar torneo</h1>
            </div>

            <TournamentForm
                initialValues={tournamentToValues(data, gameId)}
                primaryLabel="Guardar cambios"
                status={data.status}
                acceptedTeams={data._count.registrations}
                pending={updateTournament.isPending}
                onSubmit={async (values) => {
                    await updateTournament.mutateAsync({ slug: data.slug, data: values });
                    navigate(manageUrl, { replace: true });
                }}
            />
        </div>
    );
}
