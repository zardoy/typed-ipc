import Electron, { BrowserWindow, ipcMain } from "electron";
import { Merge } from "type-fest";
import { IpcMainEvents, IpcMainQueries, IpcRendererEvents } from "./";
import { EventListenerArgs } from "./util";
declare type ElectronEventArg<R extends keyof IpcRendererEvents = keyof IpcRendererEvents> = Merge<Electron.IpcMainEvent, {
    reply: (channel: R, dataToSend: IpcRendererEvents[R]) => void;
}>;
export declare type IpcMainEventListener<E extends keyof IpcMainEvents> = (...args: EventListenerArgs<ElectronEventArg, IpcMainEvents[E]>) => void;
declare type IpcMainAllEventListeners = {
    [event in keyof IpcMainEvents]: IpcMainEventListener<event>;
};
declare type IpcEventReturnType = ReturnType<typeof ipcMain["addListener"]>;
declare type AddRemoveEventListener<E extends keyof IpcMainEvents = keyof IpcMainEvents> = (event: E, listener: IpcMainEventListener<E>) => IpcEventReturnType;
export declare type IpcMainHandler<R extends keyof IpcMainQueries> = (event: Electron.IpcMainInvokeEvent, variables: IpcMainQueries[R] extends {
    variables: infer K;
} ? K : void) => Promise<IpcMainQueries[R] extends {
    data: infer T;
} ? T : void>;
declare type IpcMainAllHandlers = {
    [query in keyof IpcMainQueries]: IpcMainHandler<query>;
};
/**
 * This can be used in main process only
 */
export declare const typedIpcMain: {
    /**
     * Use it to define all IPC event listeners in one place
     */
    bindAllEventListeners: (allIPCEventListeners: IpcMainAllEventListeners) => void;
    /**
     * Use it to hanlde all app's queries in one place.
     */
    handleAllQueries: (allIpcHandlers: IpcMainAllHandlers) => void;
    addEventListener: AddRemoveEventListener<never>;
    removeEventListener: AddRemoveEventListener<never>;
    removeAllListeners: (event: keyof IpcMainEvents) => IpcEventReturnType;
    sendToWindow<E extends never>(win: BrowserWindow | null, channel: E, data: IpcRendererEvents[E]): void;
};
export {};
