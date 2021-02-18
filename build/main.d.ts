import Electron, { BrowserWindow, ipcMain } from "electron";
import { Merge } from "type-fest";
import { IpcMainEvents, IpcMainRequests, IpcRendererEvents } from "./";
import { EventListenerArgs, IpcMainEventNames, IpcMainRequestNames, IpcRendererEventNames } from "./util";
declare type ElectronEventArg<R extends IpcRendererEventNames = IpcRendererEventNames> = Merge<Electron.IpcMainEvent, {
    reply: (channel: R, dataToSend: IpcRendererEvents[R]) => void;
}>;
export declare type IpcMainEventListener<E extends IpcMainEventNames> = (...args: EventListenerArgs<ElectronEventArg, IpcMainEvents[E]>) => void;
declare type IpcMainAllEventListeners = {
    [event in IpcMainEventNames]: IpcMainEventListener<event>;
};
declare type IpcEventReturnType = ReturnType<typeof ipcMain["addListener"]>;
declare type AddRemoveEventListener<E extends IpcMainEventNames> = (event: E, listener: IpcMainEventListener<E>) => IpcEventReturnType;
export declare type IpcMainHandler<R extends IpcMainRequestNames> = (event: Electron.IpcMainInvokeEvent, variables: IpcMainRequests[R] extends {
    variables: infer K;
} ? K : void) => Promise<IpcMainRequests[R] extends {
    data: infer T;
} ? T : void>;
declare type IpcMainAllHandlers = {
    [query in IpcMainRequestNames]: IpcMainHandler<query>;
};
/**
 * Can be used in main process only
 */
declare let typedIpcMain: {
    /**
     * Use it to define all IPC event listeners in one place
     */
    bindAllEventListeners: (allIPCEventListeners: IpcMainAllEventListeners) => void;
    /**
     * Use it to hanlde all app's queries in one place.
     */
    handleAllQueries: (allIpcHandlers: IpcMainAllHandlers) => void;
    addEventListener: AddRemoveEventListener<IpcMainEventNames>;
    removeEventListener: AddRemoveEventListener<IpcMainEventNames>;
    removeAllListeners: (event: IpcMainEventNames) => IpcEventReturnType;
    sendToWindow<E extends IpcRendererEventNames>(win: BrowserWindow | null, ...sendArgs: EventListenerArgs<E, IpcRendererEvents[E]>): void;
};
export { typedIpcMain };
