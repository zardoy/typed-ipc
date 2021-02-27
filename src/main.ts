import Electron, { BrowserWindow, ipcMain } from "electron";
import { Merge } from "type-fest";

import { IpcMainEvents, IpcMainRequests, IpcRendererEvents } from "./";
import {
    EventListenerArgs,
    getWrongProcessMessage,
    InterfaceDoesntAugmented,
    IpcMainEventNames,
    IpcMainRequestNames,
    IpcRendererEventNames
} from "./util";

// EVENT TYPES

type IpcManageEventsReturnType = ReturnType<typeof ipcMain["addListener"]>;

// todo-low =? syntax
type ElectronEventArg = Merge<Electron.IpcMainEvent, {
    reply: <R extends IpcRendererEventNames>(channel: R, dataToSend: IpcRendererEvents[R]) => void;
}>;

export type IpcMainEventListener<E extends IpcMainEventNames> =
    (...args: EventListenerArgs<ElectronEventArg, IpcMainEvents[E]>) => void;

// if never - user didn't augment the interface
type IpcMainAllEventListeners = IpcMainEventNames extends never ? InterfaceDoesntAugmented.mainEvents : {
    [event in IpcMainEventNames]: IpcMainEventListener<event>
};

type AddRemoveEventListener = IpcMainEventNames extends never ? InterfaceDoesntAugmented.mainEvents : <E extends IpcMainEventNames>(
    event: E,
    listener: IpcMainEventListener<E>
) => IpcManageEventsReturnType;

type RemoveAllEventListeners = IpcMainEventNames extends never ? InterfaceDoesntAugmented.mainEvents :
    (event: IpcMainEventNames) => IpcManageEventsReturnType;

// REQUEST TYPES

export type IpcMainHandler<R extends IpcMainRequestNames> =
    (
        event: Electron.IpcMainInvokeEvent,
        variables: IpcMainRequests[R] extends { variables: infer K; } ? K : void
    ) => Promise<IpcMainRequests[R] extends { data: infer T; } ? T : void>;

type IpcMainAllHandlers = IpcMainRequestNames extends never ? {} : {
    [Request in IpcMainRequestNames]: IpcMainHandler<Request>
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
    handleAllRequests: (allIpcHandlers: IpcMainAllHandlers): void => {
        Object.entries(allIpcHandlers).forEach(([requestName, handler]: [string, any]) => {
            ipcMain.handle(requestName, async (e, data): Promise</* TYPE HERE */any> => {
                return {
                    data: await handler(e, data)
                };
            });
        });
    },

    // GROUP Add/Remove. not recommended (todo describe why)

    addEventListener: ipcMain.addListener.bind(ipcMain) as AddRemoveEventListener,
    removeEventListener: ipcMain.removeListener.bind(ipcMain) as AddRemoveEventListener,
    removeAllListeners: ipcMain.removeAllListeners.bind(ipcMain) as RemoveAllEventListeners,
    // todo other methods

    sendToWindow<E extends IpcRendererEventNames>(
        // reducing boilerplates
        win: BrowserWindow | null,
        ...sendArgs: EventListenerArgs<E, IpcRendererEvents[E]>
    ) {
        if (!win) return;
        //@ts-ignore
        win.webContents.send(...sendArgs);
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