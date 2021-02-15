import { IpcRenderer, ipcRenderer } from "electron";
import { RequireExactlyOne } from "type-fest";

import { IpcMainEvents, IpcMainQueries, IpcRendererEvents } from "./";
import { EventListenerArgs } from "./util";

export declare type IpcRendererEventListener<E extends keyof IpcRendererEvents> = (...args: EventListenerArgs<Electron.IpcRendererEvent, IpcRendererEvents[E]>) => void;
declare type IpcRendererSend = <E extends keyof IpcMainEvents>(...args: EventListenerArgs<E, IpcMainEvents[E]>) => void;
declare type RequestArgs<Q extends keyof IpcMainQueries> = IpcMainQueries[Q] extends {
    variables: infer K;
} ? [
        query: Q,
        variables: IpcMainQueries[Q]
    ] : [
        query: Q,
        variables?: {}
    ];
declare type IpcRendererRequest = <Q extends keyof IpcMainQueries>(...args: RequestArgs<Q>) => Promise<IpcMainQueries[Q] extends {
    data: infer T;
} ? RequireExactlyOne<{
    data: T;
    error: Error;
}, "data" | "error"> : {
    error?: Error;
}>;
declare type IpcEventReturnType = ReturnType<typeof ipcRenderer["addListener"]>;
declare type AddRemoveEventListener<R extends keyof IpcRendererEvents = keyof IpcRendererEvents> = (event: R, listener: IpcRendererEventListener<R>) => IpcEventReturnType;
/**
 * Can be used in main renderer only
 */
declare let typedIpcRenderer: {
    send: IpcRendererSend;
    /**
     * Make query to main process.
     * TODO rename to query
     */
    request: IpcRendererRequest;
    addEventListener: AddRemoveEventListener<never>;
    removeEventListener: AddRemoveEventListener<never>;
    removeAllListeners: (channel: keyof IpcRendererEvents) => Electron.IpcRenderer;
};
export { typedIpcRenderer };
