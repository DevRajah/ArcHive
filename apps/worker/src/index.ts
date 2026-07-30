import "dotenv/config";

// Engineering intelligence jobs.
import "./workers/engineering-event.worker";

// Executive Report generation jobs.
import "./workers/report.worker";

console.log("ArcHive worker service started");