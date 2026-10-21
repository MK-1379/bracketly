import { expect, test } from "@playwright/test";
import { enterDemo, uniqueName } from "./helpers.ts";

test("el organizador crea un torneo y abre las inscripciones", async ({ page }) => {
    const name = uniqueName("Copa E2E ");
    await enterDemo(page, "organizador");

    await page.getByRole("link", { name: "Crear torneo" }).click();
    await page.getByLabel("Nombre del torneo").fill(name);
    await page.getByLabel("Juego").selectOption({ label: "Valorant" });
    await page.getByRole("button", { name: "Abrir inscripciones" }).click();

    await expect(page).toHaveURL(/\/panel\/torneos\/copa-e2e-/);
    await expect(page.getByRole("heading", { name })).toBeVisible();

    await page.goto("/?estado=inscripciones");
    await expect(page.getByRole("link", { name: new RegExp(name) })).toBeVisible();
});

test("el capitán inscribe a su equipo y el organizador lo acepta", async ({ page, browser }) => {
    await enterDemo(page, "capitán");
    await page.getByRole("link", { name: /Nébula Esports/ }).click();

    const relampago = page.getByRole("listitem").filter({ hasText: "Torneo Relámpago CS2" });
    await relampago.getByRole("button", { name: "Inscribir al equipo" }).click();
    await expect(page.getByText(/Torneo Relámpago CS2/).first()).toBeVisible();

    const organizer = await browser.newPage();
    await enterDemo(organizer, "organizador");
    await organizer.goto("/panel/torneos/torneo-relampago-cs2");
    const row = organizer.getByRole("row").filter({ hasText: "Nébula Esports" });
    await row.getByRole("button", { name: "Aceptar" }).click();
    await expect(row.getByRole("button", { name: "Aceptar" })).toHaveCount(0);
    await organizer.close();
});
