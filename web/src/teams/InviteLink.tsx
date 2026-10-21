import { useState } from "react";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import { inviteUrl, type MyTeam } from "./teams.api";
import { useRegenerateInviteCode } from "./useTeams";

export function InviteLink({ team }: { team: MyTeam }) {
    const regenerate = useRegenerateInviteCode();
    const [message, setMessage] = useState("");

    if (!team.inviteCode) {
        return null;
    }
    const url = inviteUrl(team.inviteCode);

    async function copy() {
        try {
            await navigator.clipboard.writeText(url);
            setMessage("Enlace copiado.");
        } catch {
            setMessage("No se ha podido copiar. Selecciona el enlace y cópialo a mano.");
        }
    }

    function handleRegenerate() {
        regenerate.mutate(team.id, {
            onSuccess: () => setMessage("Enlace nuevo creado. El anterior ya no funciona."),
        });
    }

    return (
        <div className="flex flex-col gap-4 border border-line bg-surface p-5">
            <Field
                label="Enlace de invitación"
                readOnly
                value={url}
                onFocus={(event) => event.currentTarget.select()}
                hint="Quien lo abra con su cuenta se unirá al equipo."
            />
            <div className="flex flex-wrap gap-3">
                <Button onClick={copy}>Copiar enlace</Button>
                <Button variant="outline" disabled={regenerate.isPending} onClick={handleRegenerate}>
                    {regenerate.isPending ? "Creando..." : "Crear enlace nuevo"}
                </Button>
            </div>
            <p role="status" className="min-h-5 text-sm text-accent">
                {message}
            </p>
            {regenerate.isError && (
                <p role="alert" className="text-sm font-semibold text-live">
                    No se ha podido crear un enlace nuevo. Inténtalo de nuevo.
                </p>
            )}
        </div>
    );
}
