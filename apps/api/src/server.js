"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv/config");
const app_1 = require("./app");
// I keep the port configurable because Render, Railway, Docker, and local development
// may all provide different ports.
const PORT = Number(process.env.PORT) || 6800;
const HOST = process.env.HOST || "0.0.0.0";
const startServer = async () => {
    try {
        const app = await (0, app_1.buildApp)();
        await app.listen({
            port: PORT,
            host: HOST,
        });
        console.log(`ArcHive API running on http://${HOST}:${PORT}`);
    }
    catch (error) {
        console.error("Failed to start ArcHive API:", error);
        process.exit(1);
    }
};
startServer();
//# sourceMappingURL=server.js.map