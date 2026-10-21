import { createApp } from "./app.js";
import { env } from "./config/env.js";

createApp().listen(env.PORT, () => {
    console.log(`API en http://localhost:${env.PORT}`);
});