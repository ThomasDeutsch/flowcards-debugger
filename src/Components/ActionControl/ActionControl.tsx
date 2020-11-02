import * as React from "react";
import { Action, DispatchActions, ActionType, EventId } from '@flowcards/react';
import { EventName } from '../EventName/EventName';
import { EventDispatcher } from '../EventDispatcher/EventDispatcher';
import { ScenariosContext } from '@flowcards/core';



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

function getAction(action: Action, index: number, actions: Action[]) {
    if(action.resolveActionId) {
        const resolveAction = actions[action.resolveActionId];
        if(!resolveAction) {
            return action
        }
        action.payload = () => delay(resolveAction.resolve!.requestDuration, resolveAction.payload);
    }
    return action;
}



function startReplay(dispatchActions: DispatchActions, actions: Action[]) {
    const replayActions = actions.slice(0, actions.length + 1);
    const acts = replayActions.map(getAction).filter(a => !(a.type === ActionType.resolved && a.resolve?.isResolvedExtend === false)); // do not replay the extend-resolve!
    dispatchActions(acts);
}


interface ActionControlProps {
    context: ScenariosContext;
    dispatchActions: DispatchActions;
    setHighlightActionIndex: (x: number | undefined) => void;
    highlightActionIndex?: number;
}

export function ActionControl({setHighlightActionIndex, dispatchActions, context}: ActionControlProps) {
    return <div className="actionControl">
        <EventDispatcher
          bids={context.bids}
          event={context.event}
        ></EventDispatcher>
        <div className="actionReplay">
            <button type="button" onClick={() => startReplay(dispatchActions, context.log.actions)}>Replay</button>
        </div>
        <ul onMouseLeave={() => setHighlightActionIndex(undefined)}  className="actionList">
            {context.log.actions.map(action => {
                const actionId = action.id !== undefined && action.id !== null ? action.id : undefined;
                return <li 
                    className="action"
                    onMouseEnter={() => setHighlightActionIndex(actionId)}>
                    <EventName eventId={(action.eventId)}></EventName>
                </li>
            })}
        </ul>
    </div>

}
