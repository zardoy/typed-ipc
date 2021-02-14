import { BrowserWindow, ipcMain, IpcMainInvokeEvent } from "electron";

/**
 * Define your IPC events, that might be triggered in main process
 */
interface IpcMainEvents { }
/**
 * Define your IPC events, that might be triggered in renderer process
 */
interface IpcRendererEvents { }

/**
 * @deprecated help me to rename it. Could be removed soon.
 */
interface IpcQueries {
    downloadVideo: {
        /**
         * Variables that must be passed from renderer side.
         */
        variables: {
            id: string;
            /**
             * @default true
             */
            withSound?: boolean;
        };
        /**
         * Data, that must be reterned from main-process invoker. (without promise)
         */
        data: undefined;
    };
}

/**
 * This can be used in main process only
 */
export const typedIpcMain = {
    /**
     * Use it to define all IPC event listeners in one place
     */
    bindAllEventListeners: (allIPCEventListeners: AllIPCEventListeners): void => {
        Object.entries(allIPCEventListeners).forEach(([eventName, eventListener]) => {
            ipcMain.on(eventName, async (event, dataFromRenderer) => {
                await eventListener({ event, reply: event.reply as any }, dataFromRenderer);
            });
        });
    },

    /**
     * Use it to hanlde all app's request in one place.
     */
    handleAllRequests: (allIpcHandlers: AllIpcHandlers): void => {
        Object.entries(allIpcHandlers).forEach(([requestName, handler]) => {
            ipcMain.handle(requestName, async (e, data) => {
                try {
                    return {
                        result: await handler(e, data)
                    };
                } catch (err) {
                    return {
                        error: err
                    };
                }
            });
        });
    },
    sendToWindow<E extends keyof RendererEventsData>(
        // reducing boilerplates
        win: BrowserWindow | null,
        channel: E,
        data: RendererEventsData[E]
    ) {
        if (!win) return;
        win.webContents.send(channel, data);
    }
    // todo add methods from typedIpcRenderer.ts
};