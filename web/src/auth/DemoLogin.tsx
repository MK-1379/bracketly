import { ApiError } from "../api/client";
import { Button } from "../components/Button";
import type { DemoRole } from "./auth.api";
import { useDemoEnabled, useDemoLogin } from "./useAuth";

const DEMO_BUTTONS: { role: DemoRole; label: string }[] = [
    { role: "organizer", label: "Entrar como organizador" },
    { role: "captain", label: "Entrar como capitán" },
];

function demoErrorMessage(error: Error) {
    if (error instanceof ApiError && error.status === 429) {
        return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
    }
    if (error instanceof ApiError && error.status === 503) {
        return "La demo se está reiniciando. Prueba otra vez en un momento.";
    }
    return "No se ha podido entrar en la demo. Inténtalo de nuevo.";
}

interface DemoLoginProps {
    onSuccess: () => void;
}

export function DemoLogin({ onSuccess }: DemoLoginProps) {
    const { data: enabled } = useDemoEnabled();
    const demoLogin = useDemoLogin();

    if (!enabled) {
        return null;
    }

    return (
        <section aria-labelledby="demo-title" className="flex flex-col gap-3">
            <div className="flex items-center gap-3">
                <span className="h-px flex-1 bg-line" />
                <h2 id="demo-title" className="text-xs font-bold uppercase tracking-widest text-muted">
                    o prueba la demo
                </h2>
                <span className="h-px flex-1 bg-line" />
            </div>

            <div className="flex flex-col gap-3">
                {DEMO_BUTTONS.map(({ role, label }) => (
                    <Button
                        key={role}
                        variant="outline"
                        disabled={demoLogin.isPending}
                        onClick={() => demoLogin.mutate(role, { onSuccess })}
                    >
                        {demoLogin.isPending && demoLogin.variables === role ? "Entrando..." : label}
                    </Button>
                ))}
            </div>

            {demoLogin.isError && (
                <p role="alert" className="border-2 border-live p-3 text-sm font-semibold text-live">
                    {demoErrorMessage(demoLogin.error)}
                </p>
            )}

            <p className="text-xs text-muted">Las cuentas demo se reinician cada noche.</p>
        </section>
    );
}
