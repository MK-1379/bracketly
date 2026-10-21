import cron from "node-cron";
import { resetDemo } from "./resetDemo.js";

const EVERY_NIGHT_AT_4 = "0 4 * * *";

export function scheduleDemoReset() {
    cron.schedule(
        EVERY_NIGHT_AT_4,
        async () => {
            try {
                await resetDemo();
                console.log("Datos demo restaurados");
            } catch (error) {
                console.error("No se han podido restaurar los datos demo", error);
            }
        },
        { name: "demo-reset", timezone: "Europe/Madrid", noOverlap: true },
    );
}
