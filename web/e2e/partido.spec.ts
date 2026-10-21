import { expect, test } from "@playwright/test";
import { enterDemo } from "./helpers.ts";

test("un capitán reporta su semifinal y el organizador la confirma", async ({ page, browser }) => {
    await enterDemo(page, "capitán");
    await page.getByRole("link", { name: "Reportar resultado" }).click();

    await page.getByRole("button", { name: "Sumar una partida a Nébula Esports" }).click();
    await page.getByRole("button", { name: "Sumar una partida a Nébula Esports" }).click();
    await expect(page.getByText(/^Gana Nébula Esports · 2 — 0$/)).toBeVisible();
    await page.getByRole("button", { name: "Enviar resultado" }).click();
    await expect(page).toHaveURL("/panel");

    const organizer = await browser.newPage();
    await enterDemo(organizer, "organizador");
    await organizer.goto("/panel/torneos/liga-universitaria-de-otono");

    const toValidate = organizer
        .getByRole("listitem")
        .filter({ has: organizer.getByRole("button", { name: "Confirmar" }) });
    await expect(toValidate).toHaveCount(2);

    const nebulaMatch = toValidate.filter({ hasText: "Nébula Esports" });
    await nebulaMatch.getByRole("button", { name: "Confirmar" }).click();
    await expect(toValidate).toHaveCount(1);
    await toValidate.getByRole("button", { name: "Confirmar" }).click();
    await expect(toValidate).toHaveCount(0);

    const final = organizer.getByRole("listitem").filter({ hasText: "Nébula Esports" });
    await expect(final.getByRole("button", { name: "Introducir resultado" })).toBeVisible();
    await organizer.close();
});
