import { runProcess } from "@tooling/helpers"

const POLL_INTERVAL_SECONDS = 20

const SERVER_URLS = [
  "http://localhost:3000/api/queues",
  "http://localhost:3001/queues",
]

runProcess("inngest", [
  "dev",
  "--no-discovery",
  "--poll-interval",
  POLL_INTERVAL_SECONDS.toString(),
  "-u",
  SERVER_URLS.join(" -u "),
])
