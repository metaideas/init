import { join } from "node:path"
import consola from "consola"

const command = process.argv[2]
if (command !== "up" && command !== "down") {
  consola.error("Usage: bun run scripts/docker.ts <up|down>")
  process.exit(1)
}

const composeDir = join(import.meta.dirname, "..", "infra", "local")
const files = ["--file", join(composeDir, "docker-compose.yml")]
if (process.platform === "linux") {
  files.push("--file", join(composeDir, "docker-compose.linux.yml"))
}

const args = command === "up" ? ["up", "--detach", "--remove-orphans"] : ["down"]
const process_ = Bun.spawn(["docker", "compose", ...files, ...args], {
  stderr: "inherit",
  stdout: "inherit",
})
process.exit(await process_.exited)
