import { BrowserWindow } from "electron";

import { typedIpcMain, typedIpcRenderer } from "./index";

declare module "./index" {
    interface IpcMainEvents {
        testEvent: {
            numberVar: number;
            stringVar: string;
        };
        eventWithoutVars: null;
        anotherEventWithoutVars: undefined;
    }

    interface IpcMainRequests {
        registerUser: {
            variables: {
                userKey: number;
                name: string;
            };
            data: {
                registered: boolean;
            };
        };
        queryWithoutVars: {
            data: {
                waveToUser: boolean;
            };
        };
        queryWithVariablesOnly: {
            variables: {
                something: "yes" | "no";
            };
        };
        // query must be object anyway
        queryJustQuery: {};
    }

    interface IpcRendererEvents {
        sayHiToUser: null;
        showDialog: {
            message: string;
            withOkButton: boolean;
        };
    }
}

// MAIN PROCESS

typedIpcMain.bindAllEventListeners({
    anotherEventWithoutVars() { },
    eventWithoutVars() { },
    testEvent() { },
    //@ts-expect-error
    unknownEvent: () => { }
});

typedIpcMain.handleAllQueries({
    async queryJustQuery() { },
    async queryWithVariablesOnly(_, { something }) { },
    async queryWithoutVars() {
        return { waveToUser: true };
    },
    async registerUser(_, { name, userKey }) {
        return { registered: false };
    },
    //@ts-expect-error
    async unknownRequest() { }
});

//@ts-expect-error
typedIpcMain.addEventListener("unknownEvent", () => { });


typedIpcMain.removeEventListener("testEvent", () => { });

typedIpcMain.removeAllListeners("testEvent");

typedIpcMain.sendToWindow({} as BrowserWindow, "sayHiToUser");
//@ts-expect-error
typedIpcMain.sendToWindow({} as BrowserWindow, "sayHiToUser", undefined);

typedIpcMain.sendToWindow({} as BrowserWindow, "showDialog", { message: "I'm having a bad day ;(", withOkButton: false });

//@ts-expect-error
typedIpcMain.sendToWindow({} as BrowserWindow, "unknownEvent");

// RENDERER PROCESS

//@ts-expect-error
typedIpcRenderer.send("unknownEvent");

typedIpcRenderer.send("testEvent", { numberVar: 0, stringVar: "" });
//@ts-expect-error
typedIpcRenderer.send("testEvent", { numberVar: "incorrect type", stringVar: 0 });

typedIpcRenderer.send("eventWithoutVars");
//@ts-expect-error
typedIpcRenderer.send("eventWithoutVars", { test: "hey" });

typedIpcRenderer.send("anotherEventWithoutVars");

const { data } = await typedIpcRenderer.request("registerUser", { name: "", userKey: 0 });

data?.registered;

typedIpcRenderer.request("queryWithoutVars");
typedIpcRenderer.request("queryWithoutVars", {});

