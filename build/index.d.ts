/**
 * Define your IPC events, that might be triggered in main process
 *
 * `eventName: variables`(or `void`)
 * @example quit: void
 */
export interface IpcMainEvents {

}
/**
 * Define your IPC events, that might be triggered in renderer process
 * eventName: variables (or void)
 */
export interface IpcRendererEvents {

}
/**
 * Can also mutate data, why not.
 *
 * Please help me to rename it.
 *
 * @example see IpcMainQueriesExample
 */
export interface IpcMainRequests {

}
export * from "./main";
export * from "./renderer";
