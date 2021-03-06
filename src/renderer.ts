import { ipcRenderer } from "electron";

import { IpcMainEvents, IpcMainRequests, IpcRendererEvents } from "./";
import {
    EventListenerArgs,
    getWrongProcessMessage,
    IpcMainEventNames,
    IpcMainRequestNames,
    IpcRendererEventNames
} from "./util";

// EVENT TYPES

type IpcManageEventsReturnType = ReturnType<typeof ipcRenderer["addListener"]>;

export type IpcRendererEventListener<E extends IpcRendererEventNames> =
    (...args: EventListenerArgs<Electron.IpcRendererEvent, IpcRendererEvents[E]>) => void;

type IpcRendererSend = <E extends IpcMainEventNames>(...args: EventListenerArgs<E, IpcMainEvents[E]>) => void;

type RequestArgs<Q extends IpcMainRequestNames> = IpcMainRequests[Q] extends { variables: infer K; } ?
    [requestName: Q, variables: K] :
    [requestName: Q, variables?: {}];

type AddRemoveEventListener = <R extends IpcRendererEventNames>(
    event: R,
    listener: IpcRendererEventListener<R>
) => IpcManageEventsReturnType;

const isWrongProcess = ipcRenderer === undefined;

/**
 * Can be used in main renderer only
 */
let typedIpcRenderer = isWrongProcess ? undefined! : {
    send: ipcRenderer.send.bind(ipcRenderer) as IpcRendererSend,
    /**
     * Make request to main process.
     * 
     * Important: it will throw error if it was thrown in main process
     */
    request: ipcRenderer.invoke as <R extends IpcMainRequestNames>(
        ...invokeArgs: RequestArgs<R>
    ) => Promise<IpcMainRequests[R] extends { response: infer T; } ? T : void>,
    addEventListener: ipcRenderer.addListener.bind(ipcRenderer) as AddRemoveEventListener,
    removeEventListener: ipcRenderer.removeListener.bind(ipcRenderer) as AddRemoveEventListener,
    removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer) as (channel: IpcRendererEventNames) => IpcManageEventsReturnType
};

if (isWrongProcess) {
    typedIpcRenderer = new Proxy({} as typeof typedIpcRenderer, {
        get(_, property: string) {
            throw new Error(getWrongProcessMessage("typedIpcRenderer", property));
        }
    });
}

export { typedIpcRenderer };