import { Link, useNavigate } from "react-router";
import { emptyTournamentValues, TournamentForm } from "../organizer/TournamentForm";
import { useCreateTournament } from "../organizer/useOrganizer";

export function NewTournamentPage() {
    const navigate = useNavigate();
    const createTournament = useCreateTournament();

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

            <TournamentForm
                initialValues={emptyTournamentValues()}
                secondaryLabel="Guardar borrador"
                primaryLabel="Abrir inscripciones"
                pending={createTournament.isPending}
                onSubmit={async (data, intent) => {
                    const tournament = await createTournament.mutateAsync({ data, openNow: intent === "primary" });
                    navigate(`/panel/torneos/${tournament.slug}`, { replace: true });
                }}
            />
        </div>
    );
}
