import { Navigate, Outlet, useLocation } from "react-router";
import { useCurrentUser } from "./useAuth";

export function RequireAuth() {
    const location = useLocation();
    const { data: user, isPending, isError } = useCurrentUser();

    if (isPending) {
        return <div className="mx-auto h-64 max-w-6xl px-4 py-10" aria-busy="true" />;
    }

    if (isError) {
        return (
            <p role="alert" className="mx-auto max-w-6xl px-4 py-10 text-live">
                No se ha podido comprobar tu sesión. Recarga la página.
            </p>
        );
    }

    if (!user) {
        const back = encodeURIComponent(location.pathname + location.search);
        return <Navigate to={`/entrar?volver=${back}`} replace />;
    }

    return <Outlet />;
}
