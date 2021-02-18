import { IpcRenderer, ipcRenderer } from "electron";
import { IpcMainEvents, IpcMainRequests, IpcRendererEvents } from "./";
import { EventListenerArgs, IpcMainEventNames, IpcMainRequestNames, IpcRendererEventNames } from "./util";
export declare type IpcRendererEventListener<E extends IpcRendererEventNames> = (...args: EventListenerArgs<Electron.IpcRendererEvent, IpcRendererEvents[E]>) => void;
declare type IpcRendererSend = <E extends IpcMainEventNames>(...args: EventListenerArgs<E, IpcMainEvents[E]>) => void;
declare type RequestArgs<Q extends IpcMainRequestNames> = IpcMainRequests[Q] extends {
    variables: infer K;
} ? [
    query: Q,
    variables: K
] : [
    query: Q,
    variables?: {}
];
declare type IpcEventReturnType = ReturnType<typeof ipcRenderer["addListener"]>;
declare type AddRemoveEventListener<R extends IpcRendererEventNames = IpcRendererEventNames> = (event: R, listener: IpcRendererEventListener<R>) => IpcEventReturnType;
/**
 * Can be used in main renderer only
 */
declare let typedIpcRenderer: {
    send: IpcRendererSend;
    /**
     * important: will throw error if it was throwed in main process
     *
     * Make query to main process.
     * TODO rename to query
     */
    request: <R extends IpcMainRequestNames>(...invokeArgs: RequestArgs<R>) => Promise<IpcMainRequests[R] extends {
        data: infer T;
    } ? {
        data: T;
    } : {}>;
    addEventListener: AddRemoveEventListener<IpcRendererEventNames>;
    removeEventListener: AddRemoveEventListener<IpcRendererEventNames>;
    removeAllListeners: (channel: IpcRendererEventNames) => Electron.IpcRenderer;
};
export { typedIpcRenderer };
