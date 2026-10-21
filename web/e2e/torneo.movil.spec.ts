import { expect, test } from "@playwright/test";

test("en el móvil el cuadro se ve ronda a ronda", async ({ page }) => {
    await page.goto("/torneos/copa-rocket-iberica");

    const rounds = page.getByRole("group", { name: "Rondas" });
    const final = rounds.getByRole("button", { name: /Final/ });
    const quarterFinals = rounds.getByRole("button", { name: /Cuartos/ });

    await expect(final).toHaveAttribute("aria-pressed", "true");
    await quarterFinals.click();
    await expect(quarterFinals).toHaveAttribute("aria-pressed", "true");
    await expect(final).toHaveAttribute("aria-pressed", "false");
});

test("en el móvil los botones de la demo caben enteros", async ({ page }) => {
    await page.goto("/entrar");
    const organizerButton = page.getByRole("button", { name: "Entrar como organizador" });

    await expect(organizerButton).toBeVisible();
    const box = await organizerButton.boundingBox();
    expect(box?.height).toBeLessThan(60);
});
