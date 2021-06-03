import * as React from "react";
import { ActionElement } from '../Action/ActionElement';
import { EventDispatcher } from '../EventDispatcher/EventDispatcher';
import { AnyActionWithId, BidsByType, DispatchCommand, EventContext, EventId } from '@flowcards/core';

function delay(ms: number, value?: any) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

// function getAction(action: AnyActionWithId, actions: AnyActionWithId[]): AnyActionWithId {
//     if(action.resolveActionId) {
//         const resolveAction = actions[action.resolveActionId];
//         if(!resolveAction) {
//             return action;
//         }
//         action.payload = () => delay(resolveAction.resolve!.requestDuration, resolveAction.payload);
//     }
//     return action;
// }



// function startReplay(dispatch: DispatchCommand, actions: ActionWithId[]) {
//     const replayActions = actions.slice(0, actions.length + 1);
//     const actionsWithId = replayActions.map(getAction).filter(a => !(a.type === ActionType.resolved)); //TODO:  do not replay the extend-resolve! ???
//     dispatch({type: 'replay', actions: actionsWithId});
// }


interface ActionControlProps {
    loggedActions: AnyActionWithId[];
    bids: BidsByType,
    event: (eventName: string | EventId) => EventContext,
    dispatchActions: DispatchCommand;
    setHighlightActionId: (x: number | undefined) => void;
    highlightActionId?: number;
}

export function ActionControl({setHighlightActionId, dispatchActions, loggedActions, bids, event}: ActionControlProps) {
    return <div className="actionControl">
        <EventDispatcher
          bids={bids}
          event={event}
        ></EventDispatcher>
        <ul onMouseLeave={() => setHighlightActionId(undefined)}  className="actionList">
            <div className="actionLogHeadline">action log</div>
            {loggedActions.map(action => {
                const actionId = action.id !== undefined && action.id !== null ? action.id : undefined;
                return <li 
                    className="action"
                    onClick={() => console.log('action: ', action)}
                    onMouseEnter={() => setHighlightActionId(actionId)}>
                    <ActionElement action={action} isCurrentlyPending={bids.pending?.has(action.eventId)}/>
                </li>
            })}
            {loggedActions.length === 0 && <li>-</li>}
        </ul>
        {/* <div className="actionReplay">
            <button type="button" onClick={() => startReplay(dispatchActions, loggedActions)}>Replay</button>
        </div> */}
    </div>
}
