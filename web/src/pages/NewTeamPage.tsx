import { type FormEvent, useState } from "react";
import { useNavigate } from "react-router";
import { ApiError } from "../api/client";
import { AuthLayout } from "../auth/AuthLayout";
import { type FormErrors, hasErrors } from "../auth/validation";
import { Button } from "../components/Button";
import { Field } from "../components/Field";
import type { TeamData } from "../teams/teams.api";
import { useCreateTeam } from "../teams/useTeams";
import { TEAM_MESSAGES, validateTeam } from "../teams/validation";

export function NewTeamPage() {
    const navigate = useNavigate();
    const createTeam = useCreateTeam();
    const [errors, setErrors] = useState<FormErrors<TeamData>>({});

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const data: TeamData = {
            name: String(form.get("name") ?? "").trim(),
            tag: String(form.get("tag") ?? "")
                .trim()
                .toUpperCase(),
        };

        const validation = validateTeam(data);
        setErrors(validation);
        if (hasErrors(validation)) {
            return;
        }

        createTeam.mutate(data, {
            onSuccess: (team) => navigate(`/panel/equipos/${team.id}`, { replace: true }),
            onError: (error) => {
                if (error instanceof ApiError && error.status === 400) {
                    setErrors({
                        name: error.fields.name ? TEAM_MESSAGES.name : undefined,
                        tag: error.fields.tag ? TEAM_MESSAGES.tag : undefined,
                    });
                }
            },
        });
    }

    return (
        <AuthLayout title="Nuevo" accent="equipo">
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Field label="Nombre del equipo" name="name" autoComplete="off" error={errors.name} />
                <Field
                    label="Siglas"
                    name="tag"
                    autoComplete="off"
                    maxLength={5}
                    hint="De 2 a 5 letras o números. Se ven en el cuadro, por ejemplo NEB."
                    error={errors.tag}
                />

                {createTeam.isError && !(createTeam.error instanceof ApiError && createTeam.error.status === 400) && (
                    <p role="alert" className="border-2 border-live p-3 text-sm font-semibold text-live">
                        No se ha podido crear el equipo. Inténtalo de nuevo.
                    </p>
                )}

                <Button type="submit" disabled={createTeam.isPending}>
                    {createTeam.isPending ? "Creando..." : "Crear equipo"}
                </Button>
                <p className="text-sm text-muted">Serás el capitán. Después podrás invitar a tus jugadores.</p>
            </form>
        </AuthLayout>
    );
}
