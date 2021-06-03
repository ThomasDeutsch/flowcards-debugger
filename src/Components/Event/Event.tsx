import { EventId } from "@flowcards/core";
import * as React from "react";

export interface EventProps {
    eventId: EventId
}

export function FCEvent({eventId}: EventProps): React.ReactElement {
    return <span className="event">
        <span className="name">{eventId.name}</span> 
        {eventId.key && <span className="key">{eventId.key}</span>}
    </span>;
}