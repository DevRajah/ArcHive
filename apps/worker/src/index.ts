import "dotenv/config";

// I import the engineering worker so it starts listening immediately.
import "./workers/engineering-event.worker";

console.log("ArcHive worker service started");