import { expect, test } from "@playwright/test";
import { uniqueName } from "./helpers.ts";

test("una página privada lleva al login y, al registrarse, vuelve a ella", async ({ page }) => {
    const name = uniqueName("ana");

    await page.goto("/panel");
    await expect(page).toHaveURL("/entrar?volver=%2Fpanel");

    await page.getByRole("link", { name: "Regístrate" }).click();
    await page.getByLabel("Nombre público").fill(name);
    await page.getByLabel("Correo").fill(`${name}@test.com`);
    await page.getByLabel("Contraseña").fill("supersecreta");
    await page.getByRole("button", { name: "Crear cuenta" }).click();

    await expect(page).toHaveURL("/panel");
    await expect(page.getByRole("heading", { name: new RegExp(name, "i") })).toBeVisible();

    await page.getByRole("button", { name: "Salir" }).click();
    await expect(page.getByRole("link", { name: "Entrar" })).toBeVisible();
});

test("con una contraseña incorrecta avisa y no entra", async ({ page }) => {
    await page.goto("/entrar");
    await page.getByLabel("Correo").fill("nadie@test.com");
    await page.getByLabel("Contraseña").fill("contraseña-mala");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page.getByRole("alert")).toHaveText("Correo o contraseña incorrectos.");
    await expect(page).toHaveURL("/entrar");
});

test("el formulario marca los campos vacíos sin llamar a la API", async ({ page }) => {
    let calls = 0;
    page.on("request", (request) => {
        if (request.url().includes("/api/auth/login")) {
            calls++;
        }
    });

    await page.goto("/entrar");
    await page.getByRole("button", { name: "Entrar", exact: true }).click();

    await expect(page.getByLabel("Correo")).toHaveAttribute("aria-invalid", "true");
    expect(calls).toBe(0);
});
