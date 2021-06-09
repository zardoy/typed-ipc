import { IpcMainEvents, IpcMainRequests, IpcRendererEvents } from "./";

// UTILITY TYPES

export type MaybePromise<T> = T | Promise<T>;

export type EventListenerArgs<Event, variables> =
    variables extends void | null ? [event: Event] : [event: Event, variables: variables];

export type ProcessSide = "main" | "renderer";

export type IpcMainEventNames = keyof IpcMainEvents;
export type IpcMainRequestNames = keyof IpcMainRequests;
export type IpcRendererEventNames = keyof IpcRendererEvents;

// UTILITY FUNCTIONS

export const getWrongProcessMessage = (wrongModule: `typedIpc${Capitalize<ProcessSide>}`, property: string) => {
    const neededSide: ProcessSide = wrongModule === "typedIpcMain" ? "main" : "renderer";
    const perhapsCurrentSide: ProcessSide = neededSide === "main" ? "renderer" : "main";
    return `You are trying to call ${wrongModule}.${property} the most probably from ${perhapsCurrentSide} process, but ${wrongModule} is available only in ${neededSide} process`;
};