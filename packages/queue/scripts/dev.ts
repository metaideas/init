import { runProcess } from "@tooling/utils"

const POLL_INTERVAL_SECONDS = 20

const SERVER_URLS = [
  "http://localhost:3000/api/inngest",
  "http://localhost:8787/api/inngest",
]

runProcess("inngest", [
  "dev",
  "--no-discovery",
  "--poll-interval",
  POLL_INTERVAL_SECONDS.toString(),
  "-u",
  SERVER_URLS.join(" -u "),
])
