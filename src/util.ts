// UTILITY TYPES

export type EventListenerArgs<Event, variables> =
    variables extends void ? [event: Event] : [event: Event, variables: variables];