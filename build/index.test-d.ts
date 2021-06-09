import { BrowserWindow } from "electron";
import { expectType } from "tsd";

import { typedIpcMain, typedIpcRenderer } from "./index";

declare module "./index" {
    interface IpcMainEvents {
        eventFirst: {
            firstEventVar: number;
        };
        secondEvent: {
            secondEventVar: boolean;
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
            response: {
                registered: boolean;
            };
        };
        queryWithoutVars: {
            response: {
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
    eventFirst() { },
    secondEvent() { }
});

//@ts-expect-error not all event listeners
typedIpcMain.bindAllEventListeners({
    anotherEventWithoutVars() { },
    eventWithoutVars() { },
    eventFirst() { }
});

typedIpcMain.handleAllRequests({
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

//@ts-expect-error test unknown events
typedIpcMain.addEventListener("unknownEvent", () => { });
//@ts-expect-error
typedIpcMain.removeAllListeners("unknownEvent");


// should pass with variables from first event
typedIpcMain.addEventListener("eventFirst", (event, { firstEventVar }) => {
    event.reply("showDialog", { message: "", withOkButton: true });
    //@ts-expect-error
    event.reply("sayHiToUser", { message: "", withOkButton: true });
});

//@ts-expect-error firstEventVar shouldn't exist on firstEvent only
typedIpcMain.addEventListener("secondEvent", (event, { firstEventVar }) => { });

typedIpcMain.removeEventListener("eventFirst", () => { });

typedIpcMain.removeAllListeners("eventFirst");

typedIpcMain.sendToWindow({} as BrowserWindow, "sayHiToUser");
//@ts-expect-error
typedIpcMain.sendToWindow({} as BrowserWindow, "sayHiToUser", undefined);
//@ts-expect-error
typedIpcMain.sendToWindow({} as BrowserWindow, "sayHiToUser", { message: "I'm having a bad day ;(", withOkButton: true });

typedIpcMain.sendToWindow({} as BrowserWindow, "showDialog", { message: "I'm having a bad day ;(", withOkButton: false });

//@ts-expect-error
typedIpcMain.sendToWindow({} as BrowserWindow, "unknownEvent");


// RENDERER PROCESS

//@ts-expect-error
typedIpcRenderer.send("unknownEvent");

typedIpcRenderer.send("eventFirst", { firstEventVar: 0 });
typedIpcRenderer.send("secondEvent", { secondEventVar: true });
//@ts-expect-error
typedIpcRenderer.send("secondEvent", { firstEventVar: 0 });

typedIpcRenderer.send("eventWithoutVars");
typedIpcRenderer.send("anotherEventWithoutVars");
//@ts-expect-error
typedIpcRenderer.send("eventWithoutVars", { firstEventVar: 0 });



const { registered } = await typedIpcRenderer.request("registerUser", {
    name: "",
    userKey: 0,
});

expectType<void>(await typedIpcRenderer.request("queryWithVariablesOnly", { something: "no" }));

typedIpcRenderer.request("registerUser", {
    name: "",
    userKey: 0,
    //@ts-expect-error
    extraArg: ""
});

typedIpcRenderer.request("queryWithoutVars");
typedIpcRenderer.request("queryWithoutVars", {});

