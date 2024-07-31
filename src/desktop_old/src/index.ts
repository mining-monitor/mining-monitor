import { app, BrowserWindow, Tray, Menu } from "electron"
import { webServerRunner } from "./webServerRunner"
import { log } from "./log"
import { environment } from "./environment"

if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
  app.quit()
}

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
    if (!isQuit && environment.isProduction()) {
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
      label: "Открыть в браузере",
      click: openBrowser,
    },
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

const openBrowser = () => {
  environment.commandLine("start", "http://localhost:4000")
  environment.commandLine("xdg-open", "http://localhost:4000")
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
