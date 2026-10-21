import { useParams } from "react-router";

export function TournamentPage() {
    const { slug } = useParams();

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <p className="text-muted">Página del torneo «{slug}»: la haremos en el paso 2.</p>
        </div>
    );
}