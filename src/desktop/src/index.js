const { app, BrowserWindow, Tray, Menu } = require("electron")
const path = require("node:path")
const { webServerRunner } = require("./webServerRunner")
const { log } = require("./log")
const { environment } = require("./environment")

let mainWindow = null
let isShow = true
let isQuit = false

if (require("electron-squirrel-startup")) {
  app.quit()
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    icon: path.join(__dirname, "favicon.png"),
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  })

  mainWindow.maximize()
  mainWindow.loadFile(path.join(__dirname, "index.html"))
  mainWindow.on("close", (event) => {
    if (!isQuit) {
      event.preventDefault()
      hideWindow()
    }

    return false;
  })

  mainWindow.on("minimize", (event) => {
    event.preventDefault()
    hideWindow()
  })

  createTray()
}

const createTray = () => {
  const tray = new Tray(path.join(__dirname, "favicon.png"))

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
    mainWindow.hide()
    isShow = false
  } else {
    mainWindow.show()
    isShow = true
  }
}

const showWindow = () => {
  mainWindow.show()
  isShow = true
}

const hideWindow = () => {
  mainWindow.hide()
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

app.whenReady().then(() => {
  createWindow()

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow()
    }
  })
})

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    quit()
  }
})

webServerRunner.run(() => {
  log.info("Load url http://localhost:4000")
  mainWindow.loadURL("http://localhost:4000")
})