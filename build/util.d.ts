export declare type EventListenerArgs<Event, variables> = variables extends void ? [event: Event] : [event: Event, variables: variables];
export declare const getWrongProcessMessage: (wrongModule: `typedIpc${"Main" | "Renderer"}`, property: string) => string;
