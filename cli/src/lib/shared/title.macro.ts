import figlet from "figlet"

export function getTitle() {
  return figlet.textSync("init", { font: "DOS Rebel" })
}
