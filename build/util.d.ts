import { IpcMainEvents, IpcMainQueries, IpcRendererEvents } from "./";
export declare type EventListenerArgs<Event, variables> = variables extends void ? [event: Event] : [event: Event, variables: variables];
export declare type ProcessSide = "main" | "renderer";
export declare type IpcRendererEventNames = keyof IpcRendererEvents;
export declare type IpcMainEventNames = keyof IpcMainEvents;
export declare type IpcMainQueryNames = keyof IpcMainQueries;
export declare const getWrongProcessMessage: (wrongModule: `typedIpc${Capitalize<ProcessSide>}`, property: string) => string;
