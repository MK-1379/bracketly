import { Link } from "react-router";

export function NotFoundPage() {
    return (
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-6 px-4 py-16">
            <h1 className="font-display text-7xl uppercase sm:text-9xl">
                Fuera de <span className="text-accent">juego</span>
            </h1>
            <p className="text-muted">Esta página no existe.</p>
            <Link
                to="/"
                className="inline-flex min-h-11 items-center border-2 border-accent bg-accent px-5 text-sm font-extrabold uppercase tracking-wider text-bg"
            >
                Ver torneos
            </Link>
        </div>
    );
}
