import { IpcMainEvents, IpcMainRequests, IpcRendererEvents } from "./";

// UTILITY TYPES

export type EventListenerArgs<Event, variables> =
    variables extends void | null ? [event: Event] : [event: Event, variables: variables];

export type ProcessSide = "main" | "renderer";

export type IpcMainEventNames = keyof IpcMainEvents;
export type IpcMainRequestNames = keyof IpcMainRequests;
export type IpcRendererEventNames = keyof IpcRendererEvents;

// UTILITY FUNCTIONS

export const getWrongProcessMessage = (wrongModule: `typedIpc${Capitalize<ProcessSide>}`, property: string) => {
    // todo
    const currentSide = !process?.type ? "unknown" :
        process.type === "browser" ? "main"
            : process.type;
    const neededSide: ProcessSide = wrongModule === "typedIpcMain" ? "main" : "renderer";
    return `You are trying to call ${wrongModule}.${property} from ${currentSide} process, but ${wrongModule} is available only in ${neededSide} process`;
};