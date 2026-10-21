import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { scheduleDemoReset } from "./demo/scheduleDemoReset.js";

createApp().listen(env.PORT, () => {
    console.log(`API en http://localhost:${env.PORT}`);
});

if (env.DEMO_MODE) {
    scheduleDemoReset();
}
