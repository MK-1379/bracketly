import { useCurrentUser } from "../auth/useAuth";

export function PanelPage() {
    const { data: user } = useCurrentUser();

    return (
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10">
            <title>Mi panel · Bracketly</title>
            <h1 className="font-display text-6xl leading-none uppercase sm:text-8xl">
                Hola,
                <span className="block text-accent">{user?.displayName}</span>
            </h1>
            <p className="text-muted">Aquí verás tus torneos y tus equipos. Lo construimos en los próximos pasos.</p>
        </div>
    );
}
