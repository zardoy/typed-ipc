import { IpcRenderer, ipcRenderer } from "electron";
import { RequireExactlyOne } from "type-fest";

import { IpcMainEvents, IpcMainQueries, IpcRendererEvents } from "./";

// EVENT TYPES

export type IpcRendererEventListener<E extends keyof IpcRendererEvents> =
    IpcRendererEvents[E] extends void ?
    (event: Electron.IpcRendererEvent, variables?: undefined) => unknown :
    (event: Electron.IpcRendererEvent, variables: IpcRendererEvents[E]) => unknown;

type IpcRendererSend = <E extends keyof IpcMainEvents>(event: E, variables: IpcMainEvents[E]) => void;

// todo rewrite types
type IpcRendererRequest =
    <Q extends keyof IpcMainQueries>(channel: Q, variables: IpcMainQueries[Q] extends { variables: infer K; } ? K : undefined)
        => Promise<IpcMainQueries[Q] extends { result: infer T; } ? RequireExactlyOne<{ data: T, error: Error; }, "data" | "error"> : { error?: Error; }>;

type IpcEventReturnType = ReturnType<typeof ipcRenderer["addListener"]>;

type AddRemoveEventListener<R extends keyof IpcRendererEvents = keyof IpcRendererEvents> = (
    event: R,
    listener: IpcRendererEventListener<R>
) => IpcEventReturnType;

export const typedIpcRenderer = {
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