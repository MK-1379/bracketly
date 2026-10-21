import { type FormEvent, useState } from "react";
import { Link, Navigate, useNavigate, useSearchParams } from "react-router";
import { ApiError } from "../api/client";
import { AuthLayout } from "../auth/AuthLayout";
import type { LoginData } from "../auth/auth.api";
import { safeRedirect } from "../auth/redirect";
import { useCurrentUser, useLogin } from "../auth/useAuth";
import { type FormErrors, hasErrors, validateLogin } from "../auth/validation";
import { Button } from "../components/Button";
import { Field } from "../components/Field";

function loginErrorMessage(error: Error) {
    if (error instanceof ApiError && error.status === 401) {
        return "Correo o contraseña incorrectos.";
    }
    if (error instanceof ApiError && error.status === 429) {
        return "Demasiados intentos. Espera unos minutos y vuelve a probar.";
    }
    return "No se ha podido iniciar sesión. Inténtalo de nuevo.";
}

export function LoginPage() {
    const [searchParams] = useSearchParams();
    const redirectTo = safeRedirect(searchParams.get("volver"));
    const navigate = useNavigate();
    const { data: user } = useCurrentUser();
    const loginMutation = useLogin();
    const [errors, setErrors] = useState<FormErrors<LoginData>>({});

    if (user) {
        return <Navigate to={redirectTo} replace />;
    }

    function handleSubmit(event: FormEvent<HTMLFormElement>) {
        event.preventDefault();
        const form = new FormData(event.currentTarget);
        const data: LoginData = {
            email: String(form.get("email") ?? "").trim(),
            password: String(form.get("password") ?? ""),
        };

        const validation = validateLogin(data);
        setErrors(validation);
        if (hasErrors(validation)) {
            return;
        }

        loginMutation.mutate(data, { onSuccess: () => navigate(redirectTo, { replace: true }) });
    }

    return (
        <AuthLayout title="Vuelve al" accent="cuadro">
            <form noValidate onSubmit={handleSubmit} className="flex flex-col gap-5">
                <Field label="Correo" name="email" type="email" autoComplete="email" error={errors.email} />
                <Field
                    label="Contraseña"
                    name="password"
                    type="password"
                    autoComplete="current-password"
                    error={errors.password}
                />

                {loginMutation.isError && (
                    <p role="alert" className="border-2 border-live p-3 text-sm font-semibold text-live">
                        {loginErrorMessage(loginMutation.error)}
                    </p>
                )}

                <Button type="submit" disabled={loginMutation.isPending}>
                    {loginMutation.isPending ? "Entrando..." : "Entrar"}
                </Button>

                <p className="text-sm text-muted">
                    ¿No tienes cuenta?{" "}
                    <Link
                        to={`/registro?volver=${encodeURIComponent(redirectTo)}`}
                        className="font-bold text-accent underline underline-offset-4"
                    >
                        Regístrate
                    </Link>
                </p>
            </form>
        </AuthLayout>
    );
}