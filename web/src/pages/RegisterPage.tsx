import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { ApiError } from "../api/client";
import { AuthLayout } from "../auth/AuthLayout";
import type { RegisterData } from "../auth/auth.api";
import { safeRedirect } from "../auth/redirect";
import { useCurrentUser, useRegister } from "../auth/useAuth";
import { type FormErrors, hasErrors, validateRegister } from "../auth/validation";
import { Button } from "../components/Button";
import { Field } from "../components/Field";

function registerErrorMessage(error: Error) {
    if (error instanceof ApiError && error.status === 409) {
        return "Ya hay una cuenta con ese correo. Prueba a entrar.";
    }
    if (error instanceof ApiError && error.status === 429) {
        return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
    }
    if (error instanceof ApiError && error.status === 400) {
        return "Revisa los datos del formulario.";
    }
    return "No se ha podido crear la cuenta. Inténtalo de nuevo.";
}

export function RegisterPage() {
    const [searchParams] = useSearchParams();
    const redirectTo = safeRedirect(searchParams.get("volver"));
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const registerMutation = useRegister();
    const [errors, setErrors] = useState<FormErrors<RegisterData>>({});

    if (user) {
        return <Navigate to={redirectTo} replace />;
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const data: RegisterData = {
            displayName: String(form.get("displayName") ?? "").trim(),
            email: String(form.get("email") ?? "").trim(),
            password: String(form.get("password") ?? ""),
        };

        const validation = validateRegister(data);
        setErrors(validation);
        if (hasErrors(validation)) {
            return;
        }

        registerMutation.mutate(data, { onSuccess: () => navigate(redirectTo, { replace: true }) });
    }

    return (
        <AuthLayout title="Crea tu" accent="cuenta">
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Field
                    label="Nombre público"
                    name="displayName"
                    autoComplete="nickname"
                    hint="Es el nombre que verán los demás en los torneos."
                    error={errors.displayName}
                />
                <Field label="Correo" name="email" type="email" autoComplete="email" error={errors.email} />
                <Field
                    label="Contraseña"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    hint="Mínimo 8 caracteres."
                    error={errors.password}
                />

                {registerMutation.isError && (
                    <p role="alert" className="border-2 border-live p-3 text-sm font-semibold text-live">
                        {registerErrorMessage(registerMutation.error)}
                    </p>
                )}

                <Button type="submit" disabled={registerMutation.isPending}>
                    {registerMutation.isPending ? "Creando..." : "Crear cuenta"}
                </Button>

                <p className="text-sm text-muted">
                    ¿Ya tienes cuenta?{" "}
                    <Link
                        to={`/entrar?volver=${encodeURIComponent(redirectTo)}`}
                        className="font-bold text-accent underline underline-offset-4"
                    >
                        Entra
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}
