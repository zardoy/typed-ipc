/**
 * Define your IPC events, that might be triggered in main process
 * 
 * `eventName: variables`(or `void`)
 * @example quit: void
 */
export interface IpcMainEvents {
    IpcMainEventNamesTypeToReplace: true;
}
/**
 * Define your IPC events, that might be triggered in renderer process
 * eventName: variables (or void)
 */
export interface IpcRendererEvents {
    IpcRendererEventNamesTypeToReplace: true;
}

/**
 * Can also mutate data, why not.
 * 
 * Please help me to rename it.
 * 
 * @example see IpcMainQueriesExample
 */
export interface IpcMainRequests {
    IpcMainRequestNamesTypeToReplace: true;
}

interface IpcMainQueriesExample {
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

export * from "./main";
export * from "./renderer";
