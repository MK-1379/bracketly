import { expect, test } from "@playwright/test";

test("la portada lista los torneos y filtra por estado", async ({ page }) => {
    await page.goto("/");
    const autumnLeague = page.getByRole("link", { name: /Liga Universitaria de Otoño/ });
    const rocketCup = page.getByRole("link", { name: /Copa Rocket Ibérica/ });

    await expect(autumnLeague).toBeVisible();
    await expect(rocketCup).toBeVisible();

    await page.getByRole("button", { name: "En curso" }).click();

    await expect(page).toHaveURL("/?estado=en-curso");
    await expect(autumnLeague).toBeVisible();
    await expect(rocketCup).toHaveCount(0);
});

test("un torneo terminado enseña el cuadro y el campeón", async ({ page }) => {
    await page.goto("/torneos/copa-rocket-iberica");

    await expect(page.getByRole("heading", { name: "Copa Rocket Ibérica" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Campeón" })).toBeVisible();
    const championCard = page.getByText("¿Quién levanta la copa?").filter({ visible: true }).locator("../..");
    await expect(championCard).toContainText("Nébula Esports");
});

test("una dirección que no existe enseña la página 404", async ({ page }) => {
    await page.goto("/esto-no-existe");

    await expect(page.getByText("Esta página no existe.")).toBeVisible();
});
