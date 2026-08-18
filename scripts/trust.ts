import { join } from "node:path"
import consola from "consola"

const CERT_NICKNAME = "caddy-local-authority"

const certPath = join(
  import.meta.dirname,
  "..",
  "infra",
  "local",
  ".data",
  "caddy",
  "pki",
  "authorities",
  "local",
  "root.crt"
)

if (!(await Bun.file(certPath).exists())) {
  consola.error(
    `No Caddy root certificate at ${certPath}. Start the proxy first with \`bun run docker:up\`.`
  )
  process.exit(1)
}

async function run(command: string[]) {
  const process = Bun.spawn(command, { stderr: "inherit", stdout: "inherit" })
  return (await process.exited) === 0
}

async function trustDarwin() {
  return run([
    "sudo",
    "security",
    "add-trusted-cert",
    "-d",
    "-r",
    "trustRoot",
    "-k",
    "/Library/Keychains/System.keychain",
    certPath,
  ])
}

async function trustLinux() {
  const installed =
    (await run(["sudo", "cp", certPath, `/usr/local/share/ca-certificates/${CERT_NICKNAME}.crt`])) &&
    (await run(["sudo", "update-ca-certificates"]))
  if (!installed) return false

  // Chrome and Firefox on Linux read NSS user databases instead of the system store.
  const nssDatabase = join(process.env.HOME ?? "", ".pki", "nssdb")
  if (Bun.which("certutil") && (await Bun.file(join(nssDatabase, "pkcs11.txt")).exists())) {
    await run([
      "certutil",
      "-d",
      `sql:${nssDatabase}`,
      "-A",
      "-t",
      "C,,",
      "-n",
      CERT_NICKNAME,
      "-i",
      certPath,
    ])
  } else {
    consola.info(
      "Install the certificate in the browser trust store manually when Chrome or Firefox still warns."
    )
  }

  return true
}

async function trustWindows() {
  return run(["certutil", "-addstore", "-f", "ROOT", certPath])
}

const trusted = await (process.platform === "darwin"
  ? trustDarwin()
  : process.platform === "win32"
    ? trustWindows()
    : trustLinux())

if (!trusted) {
  consola.error("Could not install the Caddy root certificate in the system trust store.")
  process.exit(1)
}

consola.success("Trusted the local Caddy certificate authority. Restart open browsers.")
