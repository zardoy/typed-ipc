import { ipcRenderer } from "electron";
import { IpcMainEvents, IpcMainRequests, IpcRendererEvents } from "./";
import { EventListenerArgs, IpcMainEventNames, IpcMainRequestNames, IpcRendererEventNames } from "./util";
declare type IpcManageEventsReturnType = ReturnType<typeof ipcRenderer["addListener"]>;
export declare type IpcRendererEventListener<E extends IpcRendererEventNames> = (...args: EventListenerArgs<Electron.IpcRendererEvent, IpcRendererEvents[E]>) => void;
declare type IpcRendererSend = <E extends IpcMainEventNames>(...args: EventListenerArgs<E, IpcMainEvents[E]>) => void;
declare type RequestArgs<Q extends IpcMainRequestNames> = IpcMainRequests[Q] extends {
    variables: infer K;
} ? [
    requestName: Q,
    variables: K
] : [
    requestName: Q,
    variables?: {}
];
declare type AddRemoveEventListener = <R extends IpcRendererEventNames>(event: R, listener: IpcRendererEventListener<R>) => IpcManageEventsReturnType;
/**
 * Can be used in main renderer only
 */
declare let typedIpcRenderer: {
    send: IpcRendererSend;
    /**
     * Make request to main process.
     *
     * Important: it will throw error if it was thrown in main process
     */
    request: <R extends IpcMainRequestNames>(...invokeArgs: RequestArgs<R>) => Promise<IpcMainRequests[R] extends {
        data: infer T;
    } ? T : void>;
    addEventListener: AddRemoveEventListener;
    removeEventListener: AddRemoveEventListener;
    removeAllListeners: (channel: IpcRendererEventNames) => IpcManageEventsReturnType;
};
export { typedIpcRenderer };
