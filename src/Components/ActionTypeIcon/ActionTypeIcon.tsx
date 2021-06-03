import { ActionType, AnyAction } from "@flowcards/core";
import * as React from "react";
import styles from './styles.module.scss';

export interface ActionTypeIconProps {
    action: AnyAction;
}

export function ActionTypeIcon({action}: ActionTypeIconProps) {
    if(action.type === ActionType.requested) {
        if(action.resolveActionId) return <span className={`actionIcon ${action.bidType} ${styles.Pending}`}></span>
        return <span className={`actionIcon ${action.bidType}`}></span>
    }
    else {
        return <span className={`actionIcon ${action.type}`}></span>
    }
}