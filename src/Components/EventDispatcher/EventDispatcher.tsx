import { Bid, BidType, EventContext, EventId, EventMap } from "@flowcards/core";
import * as React from "react";

interface EventDispatcherProps {
    bids: Record<BidType, EventMap<Bid[]> | undefined>;
    event: (eventName: string | EventId) => EventContext;
}

export function EventDispatcher({bids, event}: EventDispatcherProps) {
    const [selectedEvent, selectEvent] = React.useState<EventId | undefined>(undefined);
    const [payload, setPayload] = React.useState<any>(undefined);
    const eventContext = selectedEvent && event(selectedEvent)
    const validation = selectedEvent && eventContext && eventContext.validate(payload);
    const dispatch = selectedEvent && eventContext ? eventContext.dispatch?.bind(eventContext) : undefined

    let askFors: any[] = [];
    bids.askFor?.forEach((eventId) => {
        askFors.push(
            <div key={eventId.name + eventId.key} className="nextAction" onClick={() => selectEvent(eventId)}>
                <input type="radio" value={payload} name="nextEvent" checked={selectedEvent?.name === eventId.name && selectedEvent.key === eventId.key}/>
                <label>{eventId.name} {eventId.key} </label>
            </div>
        );
    });
 
    const input = selectedEvent ? <div>
        <input onChange={(e) => {setPayload(e.target.value)}}></input>
        <button disabled={validation?.isValid === false}  onClick={() => {
            selectEvent(undefined);
            if(dispatch) {
                dispatch(payload);
                setPayload(undefined);
            }
            }}>dispatch</button>
    </div> : null;

    return <div className="eventDispatcher">
        <div>
            <b className="nextActionHeadline">next action:</b>
            {askFors}
        </div>
            {input}
        <ul className="validationMessages">
            {validation?.required.map(x => <li>{x.map(y => 
            <li className={y.isValid ? 'validation valid' : 'validation invalid'}>{y.message}</li>)}</li>)}
        </ul>
    </div>
}