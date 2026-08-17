import { readFile, writeFile } from "node:fs/promises"
import path from "node:path"
import { app, BrowserWindow, dialog, ipcMain } from "electron"
import started from "electron-squirrel-startup"
import { IPC_CHANNELS, type LocalTextFile } from "#shared/desktop-bridge.ts"

if (started) {
  app.quit()
}

// Only paths that the user selected through the open dialog are writable.
const openedPaths = new Set<string>()

function registerLocalFileHandlers() {
  ipcMain.handle(IPC_CHANNELS.openTextFile, async (): Promise<LocalTextFile | null> => {
    const { canceled, filePaths } = await dialog.showOpenDialog({
      filters: [
        {
          extensions: ["json", "md", "txt"],
          name: "Text",
        },
      ],
      properties: ["openFile"],
    })

    const selectedPath = filePaths[0]

    if (canceled || !selectedPath) return null

    openedPaths.add(selectedPath)

    return {
      contents: await readFile(selectedPath, "utf8"),
      path: selectedPath,
    }
  })

  ipcMain.handle(IPC_CHANNELS.saveTextFile, async (_event, file: LocalTextFile) => {
    if (!openedPaths.has(file.path)) {
      throw new Error("Cannot save to a path that the open dialog did not select")
    }

    await writeFile(file.path, file.contents, "utf8")
  })
}

function createWindow() {
  const window = new BrowserWindow({
    height: 600,
    title: "desktop",
    webPreferences: {
      preload: path.join(import.meta.dirname, "preload.cjs"),
    },
    width: 800,
  })

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    void window.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL)
  } else {
    void window.loadFile(
      path.join(import.meta.dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    )
  }
}

app.on("ready", () => {
  registerLocalFileHandlers()
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})
