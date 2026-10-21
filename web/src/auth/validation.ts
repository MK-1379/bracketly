import type { LoginData, RegisterData } from "./auth.api";

export type FormErrors<T> = Partial<Record<keyof T, string>>;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateLogin(data: LoginData): FormErrors<LoginData> {
    const errors: FormErrors<LoginData> = {};
    if (!EMAIL_PATTERN.test(data.email)) {
        errors.email = "Escribe un correo válido.";
    }
    if (data.password.length === 0) {
        errors.password = "Escribe tu contraseña.";
    }
    return errors;
}

export function validateRegister(data: RegisterData): FormErrors<RegisterData> {
    const errors: FormErrors<RegisterData> = {};
    const name = data.displayName.trim();
    if (name.length < 3 || name.length > 40) {
        errors.displayName = "Entre 3 y 40 caracteres.";
    }
    if (!EMAIL_PATTERN.test(data.email)) {
        errors.email = "Escribe un correo válido.";
    }
    if (data.password.length < 8 || data.password.length > 72) {
        errors.password = "Entre 8 y 72 caracteres.";
    }
    return errors;
}

export function hasErrors(errors: object) {
    return Object.keys(errors).length > 0;
}
