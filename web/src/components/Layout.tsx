import { Link, NavLink, Outlet } from "react-router";
import { navClass } from "./navClass";
import { UserMenu } from "./UserMenu";

export function Layout() {
    return (
        <div className="flex min-h-dvh flex-col">
            <header className="border-b border-line">
                <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
                    <Link to="/" className="font-display text-2xl tracking-wide">
                        BRACKET<span className="text-accent">LY</span>
                    </Link>
                    <nav
                        aria-label="Principal"
                        className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold uppercase tracking-widest"
                    >
                        <NavLink to="/" end className={navClass}>
                            Torneos
                        </NavLink>
                        <UserMenu />
                    </nav>
                </div>
            </header>

            <main className="flex-1">
                <Outlet />
            </main>

            <footer className="border-t border-line">
                <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-muted">
                    Bracketly · Torneos de esports de cualquier juego
                </div>
            </footer>
        </div>
    );
}