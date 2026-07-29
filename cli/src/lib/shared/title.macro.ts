import figlet from "figlet"

export function getTitle(): string {
  return figlet.textSync("init", { font: "DOS Rebel" })
}
