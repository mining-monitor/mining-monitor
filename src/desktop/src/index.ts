import { app, BrowserWindow, Tray, Menu } from "electron"
import { webServerRunner } from "./webServerRunner"
import { log } from "./log"

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
  app.quit()
}

// Keep a global reference of the window object, if you don"t, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow: BrowserWindow | null = null
let tray: Tray | null = null
let isShow = true
let isQuit = false

const createWindow = () => {
  mainWindow = new BrowserWindow({})
  mainWindow.maximize()

  mainWindow.loadURL(`file://${__dirname}/index.html`)

  mainWindow.on("closed", () => {
    mainWindow = null
  })

  mainWindow.on("close", (event: any) => {
    if (!isQuit) {
      event.preventDefault()
      hideWindow()
    }

    return false;
  })

  mainWindow.on("minimize", (event: any) => {
    event.preventDefault()
    hideWindow()
  })

  createTray()
}

const createTray = () => {
  tray = new Tray(`${__dirname}/favicon.png`)

  const contextMenu = Menu.buildFromTemplate([
    {
      label: "Открыть",
      click: showWindow,
    },
    {
      label: "Завершить",
      click: quit,
    },
  ])

  tray.setToolTip("Майнинг монитор")
  tray.setContextMenu(contextMenu)

  tray.on("click", toogleWindow)
}

const toogleWindow = () => {
  if (isShow) {
    mainWindow!.hide()
    isShow = false
  } else {
    mainWindow!.show()
    isShow = true
  }
}

const showWindow = () => {
  mainWindow!.show()
  isShow = true
}

const hideWindow = () => {
  mainWindow!.hide()
  isShow = false
}

const quit = () => {
  isQuit = true
  app.quit()
}

app.on("ready", createWindow)

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit()
  }
})

app.on("activate", () => {
  if (mainWindow === null) {
    createWindow()
  }
})

webServerRunner.run(() => {
  log.info("Load url http://localhost:4000")
  mainWindow!.loadURL("http://localhost:4000")
})
