import { EventId } from "@flowcards/core";
import * as React from "react";


interface EventNameProps {
    eventId: EventId
}

export function EventName({eventId}: EventNameProps): React.ReactElement {
    if(eventId.key === undefined) return <span className="eventName">{eventId.name}</span>;
    return <span className="eventName">{eventId.name}<span className="eventKey">{eventId.key}</span></span>;
}