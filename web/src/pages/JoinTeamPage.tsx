import { Link, useNavigate, useParams } from "react-router";
import { ApiError } from "../api/client";
import { AuthLayout } from "../auth/AuthLayout";
import { Button } from "../components/Button";
import { useJoinTeam } from "../teams/useTeams";

function joinErrorMessage(error: Error) {
    if (error instanceof ApiError && error.status === 404) {
        return "Este enlace no es válido. Puede que el capitán haya creado uno nuevo: pídele el actual.";
    }
    if (error instanceof ApiError && error.status === 409) {
        return "Ya formas parte de este equipo.";
    }
    return "No se ha podido unir al equipo. Inténtalo de nuevo.";
}

export function JoinTeamPage() {
    const { code = "" } = useParams();
    const navigate = useNavigate();
    const joinTeam = useJoinTeam();

    function handleJoin() {
        joinTeam.mutate(code, { onSuccess: (team) => navigate(`/panel/equipos/${team.id}`, { replace: true }) });
    }

    return (
        <AuthLayout title="Únete al" accent="equipo">
            <div className="flex flex-col gap-5">
                <p>Te han invitado a un equipo de Bracketly. Al aceptar, aparecerás en su lista de jugadores.</p>

                {joinTeam.isError && (
                    <p role="alert" className="border-2 border-live p-3 text-sm font-semibold text-live">
                        {joinErrorMessage(joinTeam.error)}
                    </p>
                )}

                <Button disabled={joinTeam.isPending} onClick={handleJoin}>
                    {joinTeam.isPending ? "Uniéndote..." : "Unirme al equipo"}
                </Button>
                <Link to="/panel" className="text-sm font-bold text-muted underline underline-offset-4 hover:text-fg">
                    Ahora no
                </Link>
            </div>
        </AuthLayout>
    );
}
