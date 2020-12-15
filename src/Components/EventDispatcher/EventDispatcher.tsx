import { Bid, BidType, EventContext, EventId, EventMap } from "@flowcards/core";
import * as React from "react";

interface EventDispatcherProps {
    bids: Record<BidType, EventMap<Bid[]> | undefined>;
    event: (eventName: string | EventId) => EventContext;
}

export function EventDispatcher({bids, event}: EventDispatcherProps) {
    const [selectedEvent, selectEvent] = React.useState<EventId | undefined>(undefined);
    const [payload, setPayload] = React.useState<any>(undefined);
    const validation = selectedEvent && event(selectedEvent).validate(payload);
    const dispatch = selectedEvent && event(selectedEvent) ? event(selectedEvent).dispatch : undefined

    let askFors: any[] = [];
    bids.askFor?.forEach((eventId) => {
        askFors.push(<button onClick={() => selectEvent(eventId)}>{eventId.name} {eventId.key}</button>);
    });
 
    const input = selectedEvent ? <div>
        <input onChange={(e) => {setPayload(e.target.value)}}></input>
        <button disabled={validation?.isValid === false}  onClick={() => {
            selectEvent(undefined);
            if(dispatch) dispatch(payload)
            }}>dispatch</button>
    </div> : null

    return <div className="eventDispatcher">
        {askFors}
        {input}
        <ul className="validationMessages">
            {validation?.required.map(x => <li>{x.map(y => 
            <li className={y.isValid ? 'validation valid' : 'validation invalid'}>{y.message}</li>)}</li>)}
        </ul>
    </div>
}