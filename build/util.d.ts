import { IpcMainEvents, IpcMainRequests, IpcRendererEvents } from "./";
export declare type EventListenerArgs<Event, variables> = variables extends void | null ? [event: Event] : [event: Event, variables: variables];
export declare type ProcessSide = "main" | "renderer";
export declare type IpcMainEventNames = keyof IpcMainEvents;
export declare type IpcMainRequestNames = keyof IpcMainRequests;
export declare type IpcRendererEventNames = keyof IpcRendererEvents;
export declare const getWrongProcessMessage: (wrongModule: `typedIpc${Capitalize<ProcessSide>}`, property: string) => string;
