import * as React from "react";
import { EventName } from '../EventName/EventName';
import { EventDispatcher } from '../EventDispatcher/EventDispatcher';
import { Action, ActionType, ActionWithId, DispatchCommand, Scenarios, ScenariosContext } from '@flowcards/core';



interface ActionCustomization {
    mockAPI: boolean;
    delay: boolean;
}

function getResolveActionIndex(actions: Action[], highlightActionIndex?: number) {
    if(highlightActionIndex === undefined) return;
    return actions[highlightActionIndex].resolveActionId;
}

function delay(ms: number, value?: any) {
    return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

function getAction(action: Action, index: number, actions: ActionWithId[]): ActionWithId {
    if(action.resolveActionId) {
        const resolveAction = actions[action.resolveActionId];
        if(!resolveAction) {
            return action as ActionWithId;
        }
        action.payload = () => delay(resolveAction.resolve!.requestDuration, resolveAction.payload);
    }
    return action as ActionWithId;
}



function startReplay(dispatch: DispatchCommand, actions: ActionWithId[]) {
    const replayActions = actions.slice(0, actions.length + 1);
    const actionsWithId = replayActions.map(getAction).filter(a => !(a.type === ActionType.resolved)); //TODO:  do not replay the extend-resolve! ???
    dispatch({type: 'replay', actions: actionsWithId});
}


interface ActionControlProps {
    context: ScenariosContext;
    dispatchActions: DispatchCommand;
    setHighlightActionIndex: (x: number | undefined) => void;
    highlightActionIndex?: number;
}

export function ActionControl({setHighlightActionIndex, dispatchActions, context}: ActionControlProps) {
    return <div className="actionControl">
        <EventDispatcher
          bids={context.bids}
          event={context.event}
        ></EventDispatcher>
        <ul onMouseLeave={() => setHighlightActionIndex(undefined)}  className="actionList">
            <div className="actionLogHeadline">action log</div>
            {context.log.actions.map(action => {
                const actionId = action.id !== undefined && action.id !== null ? action.id : undefined;
                return <li 
                    className="action"
                    onMouseEnter={() => setHighlightActionIndex(actionId)}>
                    <EventName 
                        actionId={action.id} 
                        eventId={(action.eventId)} 
                        actionType={action.type}
                        bidType={action.bidType}
                        ></EventName>
                </li>
            })}
            {context.log.actions.length === 0 && <li>-</li>}
        </ul>
        <div className="actionReplay">
            <button type="button" onClick={() => startReplay(dispatchActions, context.log.actions)}>Replay</button>
        </div>
    </div>
}
