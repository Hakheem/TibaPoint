// Simple cron runner for local/server use.
// Requires: Node 18+ (for global fetch) and process.env.CRON_SECRET set.
import cron from "node-cron";

const SECRET = process.env.CRON_SECRET || "your-secret-key";

// Determine base URL dynamically: prefer CRON_BASE_URL, then NEXT_PUBLIC_APP_URL, then VERCEL_URL
const BASE =
  process.env.CRON_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  (process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "http://localhost:3000");

const ENABLED =
  String(process.env.CRON_ENABLED || "true").toLowerCase() === "true";

function callEndpoint(path) {
  const url = `${BASE.replace(/\/$/, "")}/api/cron-jobs/${path}`;
  console.log(new Date().toISOString(), "Calling", url);
  return fetch(url, { headers: { Authorization: `Bearer ${SECRET}` } })
    .then(async (res) => {
      const text = await res.text();
      console.log("Response:", res.status, text);
    })
    .catch((err) => console.error("Fetch error", err));
}

if (!ENABLED) {
  console.log("Cron runner disabled via CRON_ENABLED=false");
  process.exit(0);
}

// Run expiry checks hourly (to support 12-hour warnings)
cron.schedule("0 * * * *", () => {
  console.log(new Date().toISOString(), "Running expire-credits cron");
  callEndpoint("expire-credits");
});

// Run doctor balance update on Sundays (0) and Wednesdays (3) at 03:00
cron.schedule("0 3 * * 0,3", () => {
  console.log(new Date().toISOString(), "Running update-doctors-balance cron");
  callEndpoint("update-doctors-balance");
});

console.log(
  "Cron runner started. Scheduled jobs: hourly expire-credits, Sun/Wed update-doctors-balance"
);
