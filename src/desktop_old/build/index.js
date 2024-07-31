"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const electron_1 = require("electron");
const webServerRunner_1 = require("./webServerRunner");
const log_1 = require("./log");
const environment_1 = require("./environment");
if (require("electron-squirrel-startup")) { // eslint-disable-line global-require
    electron_1.app.quit();
}
let mainWindow = null;
let tray = null;
let isShow = true;
let isQuit = false;
const createWindow = () => {
    mainWindow = new electron_1.BrowserWindow({});
    mainWindow.maximize();
    mainWindow.loadURL(`file://${__dirname}/index.html`);
    mainWindow.on("closed", () => {
        mainWindow = null;
    });
    mainWindow.on("close", (event) => {
        if (!isQuit && environment_1.environment.isProduction()) {
            event.preventDefault();
            hideWindow();
        }
        return false;
    });
    mainWindow.on("minimize", (event) => {
        event.preventDefault();
        hideWindow();
    });
    createTray();
};
const createTray = () => {
    tray = new electron_1.Tray(`${__dirname}/favicon.png`);
    const contextMenu = electron_1.Menu.buildFromTemplate([
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
    ]);
    tray.setToolTip("Майнинг монитор");
    tray.setContextMenu(contextMenu);
    tray.on("click", toogleWindow);
};
const toogleWindow = () => {
    if (isShow) {
        mainWindow.hide();
        isShow = false;
    }
    else {
        mainWindow.show();
        isShow = true;
    }
};
const showWindow = () => {
    mainWindow.show();
    isShow = true;
};
const hideWindow = () => {
    mainWindow.hide();
    isShow = false;
};
const quit = () => {
    isQuit = true;
    electron_1.app.quit();
};
const openBrowser = () => {
    environment_1.environment.commandLine("start", "http://localhost:4000");
    environment_1.environment.commandLine("xdg-open", "http://localhost:4000");
};
electron_1.app.on("ready", createWindow);
electron_1.app.on("window-all-closed", () => {
    if (process.platform !== "darwin") {
        electron_1.app.quit();
    }
});
electron_1.app.on("activate", () => {
    if (mainWindow === null) {
        createWindow();
    }
});
webServerRunner_1.webServerRunner.run(() => {
    log_1.log.info("Load url http://localhost:4000");
    mainWindow.loadURL("http://localhost:4000");
});
