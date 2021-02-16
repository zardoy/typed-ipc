import Electron, { BrowserWindow, ipcMain } from "electron";
import { Merge } from "type-fest";

import { IpcMainEvents, IpcMainQueries, IpcRendererEvents } from "./";
import {
    EventListenerArgs,
    getWrongProcessMessage,
    IpcMainEventNames,
    IpcMainQueryNames,
    IpcRendererEventNames
} from "./util";

// EVENT TYPES


// todo-low =? syntax
type ElectronEventArg<R extends IpcRendererEventNames = IpcRendererEventNames> =
    Merge<Electron.IpcMainEvent, {
        reply: (channel: R, dataToSend: IpcRendererEvents[R]) => void;
    }>;

export type IpcMainEventListener<E extends IpcMainEventNames> =
    (...args: EventListenerArgs<ElectronEventArg, IpcMainEvents[E]>) => void;

type IpcMainAllEventListeners = {
    [event in IpcMainEventNames]: IpcMainEventListener<event>
};

type IpcEventReturnType = ReturnType<typeof ipcMain["addListener"]>;

type AddRemoveEventListener<E extends IpcMainEventNames> = (
    event: E,
    listener: IpcMainEventListener<E>
) => IpcEventReturnType;

// HANDLE TYPES

export type IpcMainHandler<R extends IpcMainQueryNames> =
    (
        event: Electron.IpcMainInvokeEvent,
        variables: IpcMainQueries[R] extends { variables: infer K; } ? K : void
    ) => Promise<IpcMainQueries[R] extends { data: infer T; } ? T : void>;

type IpcMainAllHandlers = {
    [query in IpcMainQueryNames]: IpcMainHandler<query>
};

const isWrongProcess = process.type !== "browser";

/**
 * Can be used in main process only
 */
let typedIpcMain = isWrongProcess ? undefined! : {
    // GROUP ALL-IN-ONE-PLACE. Use it to handle everything in one place (highly-recommended)

    /**
     * Use it to define all IPC event listeners in one place
     */
    bindAllEventListeners: (allIPCEventListeners: IpcMainAllEventListeners): void => {
        Object.entries(allIPCEventListeners).forEach(([eventName, eventListener]: [string, any]) => {
            ipcMain.on(eventName, async (event, dataFromRenderer) => {
                await eventListener(event, dataFromRenderer);
            });
        });
    },

    /**
     * Use it to hanlde all app's queries in one place.
     */
    handleAllQueries: (allIpcHandlers: IpcMainAllHandlers): void => {
        Object.entries(allIpcHandlers).forEach(([requestName, handler]: [string, any]) => {
            ipcMain.handle(requestName, async (e, data): Promise</* TYPE HERE */any> => {
                try {
                    return {
                        data: await handler(e, data)
                    };
                } catch (err) {
                    return {
                        error: err
                    };
                }
            });
        });
    },

    // GROUP Add/Remove. not recommended (todo describe why)

    // todo-high why never
    addEventListener: ipcMain.addListener.bind(ipcMain) as AddRemoveEventListener<IpcMainEventNames>,
    removeEventListener: ipcMain.removeListener.bind(ipcMain) as AddRemoveEventListener<IpcMainEventNames>,
    removeAllListeners: ipcMain.removeAllListeners.bind(ipcMain) as (event: IpcMainEventNames) => IpcEventReturnType,
    // todo other methods

    sendToWindow<E extends IpcRendererEventNames>(
        // reducing boilerplates
        win: BrowserWindow | null,
        channel: E,
        data: IpcRendererEvents[E]
    ) {
        if (!win) return;
        win.webContents.send(channel, data);
    }
};

if (isWrongProcess) {
    typedIpcMain = new Proxy({} as typeof typedIpcMain, {
        get(_, property: string) {
            throw new Error(getWrongProcessMessage("typedIpcMain", property));
        }
    });
}

export { typedIpcMain };