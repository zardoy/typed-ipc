"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typedIpcRenderer = void 0;
const electron_1 = require("electron");
exports.typedIpcRenderer = {
    send: electron_1.ipcRenderer.send.bind(electron_1.ipcRenderer),
    /**
     * Make query to main process.
     * TODO rename to query
     */
    request: electron_1.ipcRenderer.invoke.bind(electron_1.ipcRenderer),
    addEventListener: electron_1.ipcRenderer.on.bind(electron_1.ipcRenderer),
    removeEventListener: electron_1.ipcRenderer.removeListener.bind(electron_1.ipcRenderer),
    removeAllListeners: electron_1.ipcRenderer.removeAllListeners.bind(electron_1.ipcRenderer)
};
