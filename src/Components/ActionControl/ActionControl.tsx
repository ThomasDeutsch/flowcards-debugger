import * as React from "react";
import { EventName } from '../EventName/EventName';
import { EventDispatcher } from '../EventDispatcher/EventDispatcher';
import { Action, ActionType, ActionWithId, ScenariosContext, ScenariosDispatch } from '@flowcards/core';



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



function startReplay(dispatchActions: ScenariosDispatch, actions: ActionWithId[]) {
    const replayActions = actions.slice(0, actions.length + 1);
    const actionsWithId = replayActions.map(getAction).filter(a => !(a.type === ActionType.resolve && a.resolve?.isResolvedExtend === false)); // do not replay the extend-resolve!
    dispatchActions({type: 'replay', actions: actionsWithId});
}


interface ActionControlProps {
    context: ScenariosContext;
    dispatchActions: ScenariosDispatch;
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
