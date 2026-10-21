import { Link, NavLink } from "react-router";
import { useCurrentUser, useLogout } from "../auth/useAuth";
import { navClass } from "./navClass";

export function UserMenu() {
    const { data: user, isPending } = useCurrentUser();
    const logoutMutation = useLogout();

    if (isPending) {
        return null;
    }

    if (!user) {
        return (
            <>
                <NavLink to="/entrar" className={navClass}>
                    Entrar
                </NavLink>
                <Link
                    to="/registro"
                    className="hidden min-h-11 items-center border-2 border-accent bg-accent px-4 sm:inline-flex font-extrabold text-bg transition hover:-translate-x-0.5 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_var(--color-fg)]"
                >
                    Crear cuenta
                </Link>
            </>
        );
    }

    return (
        <>
            <NavLink to="/panel" className={navClass}>
                Mi panel
            </NavLink>
            <span className="hidden normal-case tracking-normal text-muted sm:inline">{user.displayName}</span>
            <button
                type="button"
                disabled={logoutMutation.isPending}
                onClick={() => logoutMutation.mutate()}
                className="uppercase tracking-widest text-muted hover:text-fg"
            >
                Salir
            </button>
        </>
    );
}
