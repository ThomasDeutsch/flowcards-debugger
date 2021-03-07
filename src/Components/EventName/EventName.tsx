import { ActionType, BidType, EventId } from "@flowcards/core";
import * as React from "react";


interface EventNameProps {
    eventId: EventId;
    actionType: ActionType;
    actionId: number;
    bidType?: BidType; 
}

export function EventName({bidType, actionId, eventId, actionType}: EventNameProps): React.ReactElement {
    return <span className="eventName">
        <span className="eventNameId">{actionId} </span> 
        <span>{eventId.name} </span>
        <span>({bidType || 'UI'}) </span>
        {eventId.key && <span className="eventKey">{eventId.key}</span>}
        <span className="eventActionType">{actionType === 'requested' ? '->' : '<-'}</span>
    </span>;
}