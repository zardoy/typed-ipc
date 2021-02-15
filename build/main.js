"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typedIpcMain = void 0;
const electron_1 = require("electron");
/**
 * This can be used in main process only
 */
exports.typedIpcMain = {
    // GROUP ALL-IN-ONE-PLACE. Use it to handle everything in one place (highly-recommended)
    /**
     * Use it to define all IPC event listeners in one place
     */
    bindAllEventListeners: (allIPCEventListeners) => {
        Object.entries(allIPCEventListeners).forEach(([eventName, eventListener]) => {
            electron_1.ipcMain.on(eventName, async (event, dataFromRenderer) => {
                await eventListener(event, dataFromRenderer);
            });
        });
    },
    /**
     * Use it to hanlde all app's queries in one place.
     */
    handleAllQueries: (allIpcHandlers) => {
        Object.entries(allIpcHandlers).forEach(([requestName, handler]) => {
            electron_1.ipcMain.handle(requestName, async (e, data) => {
                try {
                    return {
                        data: await handler(e, data)
                    };
                }
                catch (err) {
                    return {
                        error: err
                    };
                }
            });
        });
    },
    // GROUP Add/Remove. not recommended (todo describe why)
    addEventListener: electron_1.ipcMain.addListener.bind(electron_1.ipcMain),
    removeEventListener: electron_1.ipcMain.removeListener.bind(electron_1.ipcMain),
    removeAllListeners: electron_1.ipcMain.removeAllListeners.bind(electron_1.ipcMain),
    // todo other methods
    sendToWindow(
    // reducing boilerplates
    win, channel, data) {
        if (!win)
            return;
        win.webContents.send(channel, data);
    }
};
