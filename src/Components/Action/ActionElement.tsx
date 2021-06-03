import { ActionType, UIAction, AnyActionWithId, RequestedAction, ResolveAction, ResolveExtendAction } from "@flowcards/core";
import * as React from "react";
import { FCEvent } from "../Event/Event";


interface ActionElementProps<T> {
    action: T;
    isCurrentlyPending?: boolean;
}


function UIActionElement({action, isCurrentlyPending}: ActionElementProps<UIAction>): React.ReactElement {
    return <span className="eventName">
        <span className="eventNameId">{action.id}</span>
        <span>UI</span>
        <FCEvent eventId={action.eventId}/>
        <span>{isCurrentlyPending ? '...' : ''}</span>
    </span>
}


function RequestedActionElement({action, isCurrentlyPending}: ActionElementProps<RequestedAction>): React.ReactElement {
    return <span className="eventName">
        <span className="eventNameId">{action.id}</span>
        <span>{action.bidType}</span>
        <FCEvent eventId={action.eventId}/>
        <span>{action.resolveActionId ? '->' : ''}</span>
        <span>{isCurrentlyPending ? '...' : ''}</span>
    </span>
}


function ResolveActionElement({action, isCurrentlyPending}: ActionElementProps<ResolveAction>): React.ReactElement {
    return <span className="eventName">
        <span className="eventNameId">{action.id}</span>
        <span>Resolve</span>
        <FCEvent eventId={action.eventId}/>
        <span>{action.pendingDuration}ms</span>
        <span>{isCurrentlyPending ? '...' : ''}</span>
    </span>
}


function ResolveExtendActionElement({action, isCurrentlyPending}: ActionElementProps<ResolveExtendAction>): React.ReactElement {
    return <span className="eventName">
        <span className="eventNameId">{action.id}</span>
        <span>Resolve Extend</span>
        <FCEvent eventId={action.eventId}/>
        <span>extended: {action.extendedRequestingBid.eventId}</span>
        <span>{isCurrentlyPending ? '...' : ''}</span>
    </span>
}


export function ActionElement(props: ActionElementProps<AnyActionWithId>): React.ReactElement | null {
    if(props.action.type === ActionType.UI) return <UIActionElement action={props.action} isCurrentlyPending={props.isCurrentlyPending}/>
    if(props.action.type === ActionType.requested) return <RequestedActionElement action={props.action} isCurrentlyPending={props.isCurrentlyPending}/>
    if(props.action.type === ActionType.resolved) return <ResolveActionElement action={props.action} isCurrentlyPending={props.isCurrentlyPending}/>
    if(props.action.type === ActionType.resolvedExtend) return <ResolveExtendActionElement action={props.action} isCurrentlyPending={props.isCurrentlyPending}/>
    return null;
}


// UI = u
// request = r
// async requ = a
// resolve = c