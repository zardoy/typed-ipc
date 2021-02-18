"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.typedIpcRenderer = void 0;
const electron_1 = require("electron");
const util_1 = require("./util");
const isWrongProcess = process.type === "browser";
/**
 * Can be used in main renderer only
 */
let typedIpcRenderer = isWrongProcess ? undefined : {
    send: electron_1.ipcRenderer.send.bind(electron_1.ipcRenderer),
    /**
     * important: will throw error if it was throwed in main process
     *
     * Make query to main process.
     * TODO rename to query
     */
    request: async (...invokeArgs) => {
        //@ts-ignore todo-high
        const result = await electron_1.ipcRenderer.invoke(...invokeArgs);
        if ("error" in result) {
            throw result.error;
        }
        else {
            return result;
        }
    },
    addEventListener: electron_1.ipcRenderer.on.bind(electron_1.ipcRenderer),
    removeEventListener: electron_1.ipcRenderer.removeListener.bind(electron_1.ipcRenderer),
    removeAllListeners: electron_1.ipcRenderer.removeAllListeners.bind(electron_1.ipcRenderer)
};
exports.typedIpcRenderer = typedIpcRenderer;
if (isWrongProcess) {
    exports.typedIpcRenderer = typedIpcRenderer = new Proxy({}, {
        get(_, property) {
            throw new Error(util_1.getWrongProcessMessage("typedIpcRenderer", property));
        }
    });
}