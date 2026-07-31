import "dotenv/config";

// Starts the worker responsible for processing GitHub engineering events.import "./workers/engineering-event.worker";

// Starts the worker responsible for generating Executive Reports.
import "./workers/report.worker";

console.log("ArcHive worker service started");