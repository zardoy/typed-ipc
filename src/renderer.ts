import { IpcRenderer, ipcRenderer } from "electron";
import { RequireExactlyOne } from "type-fest";

import { IpcMainEvents, IpcMainQueries, IpcRendererEvents } from "./";
import {
    EventListenerArgs,
    getWrongProcessMessage,
    IpcMainEventNames,
    IpcMainQueryNames,
    IpcRendererEventNames
} from "./util";

// EVENT TYPES

export type IpcRendererEventListener<E extends IpcRendererEventNames> =
    (...args: EventListenerArgs<Electron.IpcRendererEvent, IpcRendererEvents[E]>) => void;

type IpcRendererSend = <E extends IpcMainEventNames>(...args: EventListenerArgs<E, IpcMainEvents[E]>) => void;

type RequestArgs<Q extends IpcMainQueryNames> = IpcMainQueries[Q] extends { variables: infer K; } ?
    [query: Q, variables: K] :
    [query: Q, variables?: {}];

// todo rewrite types
type IpcRendererRequest =
    <Q extends IpcMainQueryNames>(...args: RequestArgs<Q>)
        => Promise<IpcMainQueries[Q] extends { data: infer T; } ? RequireExactlyOne<{ data: T, error: Error; }, "data" | "error"> : { error?: Error; }>;

type IpcEventReturnType = ReturnType<typeof ipcRenderer["addListener"]>;

type AddRemoveEventListener<R extends IpcRendererEventNames = IpcRendererEventNames> = (
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
     * important: will throw error if it was throwed in main process
     * 
     * Make query to main process.
     * TODO rename to query
     */
    request: async <R extends IpcMainQueryNames>(
        ...invokeArgs: RequestArgs<R>
    ): Promise<IpcMainQueries[R] extends { data: infer T; } ? { data: T; } : {}> => {
        //@ts-ignore todo-high
        const result = await ipcRenderer.invoke(...invokeArgs);
        if ("error" in result) {
            throw result.error;
        } else {
            return result;
        }
    },
    addEventListener: ipcRenderer.on.bind(ipcRenderer) as AddRemoveEventListener,
    removeEventListener: ipcRenderer.removeListener.bind(ipcRenderer) as AddRemoveEventListener,
    removeAllListeners: ipcRenderer.removeAllListeners.bind(ipcRenderer) as (channel: IpcRendererEventNames) => Electron.IpcRenderer
};

if (isWrongProcess) {
    typedIpcRenderer = new Proxy({} as typeof typedIpcRenderer, {
        get(_, property: string) {
            throw new Error(getWrongProcessMessage("typedIpcRenderer", property));
        }
    });
}

export { typedIpcRenderer };