import Electron, { BrowserWindow, ipcMain } from "electron";

import { IpcMainEvents, IpcMainQueries, IpcRendererEvents } from "./";

// EVENT TYPES

// todo-low =? syntax
type ElectronEventArg<R extends keyof IpcRendererEvents = keyof IpcRendererEvents> =
    Omit<Electron.IpcMainEvent, "reply"> & {
        reply: (channel: R, dataToSend: IpcRendererEvents[R]) => void;
    };

export type IpcMainEventListener<E extends keyof IpcMainEvents> =
    IpcMainEvents[E] extends void ?
    (utils: ElectronEventArg, variables?: undefined) => void :
    (utils: ElectronEventArg, variables: IpcMainEvents[E]) => void;

type IpcMainAllEventListeners = {
    [event in keyof IpcMainEvents]: IpcMainEventListener<event>
};

type IpcEventReturnType = ReturnType<typeof ipcMain["addListener"]>;

type AddRemoveEventListener<E extends keyof IpcMainEvents = keyof IpcMainEvents> = (
    event: E,
    listener: IpcMainEventListener<E>
) => IpcEventReturnType;

// HANDLE TYPES

export type IpcMainHandler<R extends keyof IpcMainQueries> =
    (
        event: Electron.IpcMainInvokeEvent,
        variables: IpcMainQueries[R] extends { variables: infer K; } ? K : void
    ) => Promise<IpcMainQueries[R] extends { data: infer T; } ? T : void>;

type IpcMainAllHandlers = {
    [query in keyof IpcMainQueries]: IpcMainHandler<query>
};

/**
 * This can be used in main process only
 */
export const typedIpcMain = {
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

    addEventListener: ipcMain.addListener.bind(ipcMain) as AddRemoveEventListener,
    removeEventListener: ipcMain.removeListener.bind(ipcMain) as AddRemoveEventListener,
    removeAllListeners: ipcMain.removeAllListeners.bind(ipcMain) as (event: keyof IpcMainEvents) => IpcEventReturnType,
    // todo other methods

    sendToWindow<E extends keyof IpcRendererEvents>(
        // reducing boilerplates
        win: BrowserWindow | null,
        channel: E,
        data: IpcRendererEvents[E]
    ) {
        if (!win) return;
        win.webContents.send(channel, data);
    }
};