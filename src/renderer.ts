import { IpcRenderer, ipcRenderer } from "electron";
import { RequireExactlyOne } from "type-fest";

import { IpcMainEvents, IpcMainQueries, IpcRendererEvents } from "./";
import { EventListenerArgs, getWrongProcessMessage } from "./util";

// EVENT TYPES

export type IpcRendererEventListener<E extends keyof IpcRendererEvents> =
    (...args: EventListenerArgs<Electron.IpcRendererEvent, IpcRendererEvents[E]>) => void;

type IpcRendererSend = <E extends keyof IpcMainEvents>(...args: EventListenerArgs<E, IpcMainEvents[E]>) => void;

type RequestArgs<Q extends keyof IpcMainQueries> = IpcMainQueries[Q] extends { variables: infer K; } ?
    [query: Q, variables: IpcMainQueries[Q]] :
    [query: Q, variables?: {}];

// todo rewrite types
type IpcRendererRequest =
    <Q extends keyof IpcMainQueries>(...args: RequestArgs<Q>)
        => Promise<IpcMainQueries[Q] extends { data: infer T; } ? RequireExactlyOne<{ data: T, error: Error; }, "data" | "error"> : { error?: Error; }>;

type IpcEventReturnType = ReturnType<typeof ipcRenderer["addListener"]>;

type AddRemoveEventListener<R extends keyof IpcRendererEvents = keyof IpcRendererEvents> = (
    event: R,
    listener: IpcRendererEventListener<R>
) => IpcEventReturnType;

const isWrongProcess = process.type === "browser";

/**
 * Can be used in main renderer only
 */
let typedIpcRenderer = isWrongProcess ? undefined! : {
    send: ipcRenderer.send.bind(ipcRenderer) as IpcRendererSend,
    /**
     * Make query to main process.
     * TODO rename to query
     */
    request: ipcRenderer.invoke.bind(ipcRenderer) as IpcRendererRequest,
    addEventListener: ipcRenderer.on.bind(ipcRenderer) as AddRemoveEventListener,
    removeEventListener: ipcRenderer.removeListener.bind(ipcRenderer) as AddRemoveEventListener,
    removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer) as (channel: keyof IpcRendererEvents) => Electron.IpcRenderer
};

if (isWrongProcess) {
    typedIpcRenderer = new Proxy({} as typeof typedIpcRenderer, {
        get(_, property: string) {
            throw new Error(getWrongProcessMessage("typedIpcRenderer", property));
        }
    });
}

export { typedIpcRenderer };