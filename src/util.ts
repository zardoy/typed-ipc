// UTILITY TYPES

export type EventListenerArgs<Event, variables> =
    variables extends void ? [event: Event] : [event: Event, variables: variables];

// UTILITY FUNCTIONS

export const getWrongProcessMessage = (wrongModule: `typedIpc${"Main" | "Renderer"}`, property: string) => {
    // todo
    const currentSide = !process?.type ? "unknown" :
        process.type === "browser" ? "main"
            : process.type;
    const neededSide = wrongModule === "typedIpcMain" ? "renderer" : "main";
    return `You are trying to call ${wrongModule}.${property} from ${currentSide} process, but ${wrongModule} is available only in ${neededSide} process`;
};