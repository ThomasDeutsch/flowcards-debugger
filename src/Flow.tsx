import * as React from "react";
import { BThreadState, BThreadReaction, BThreadReactionType, Bid, ScaffoldingResultType, PendingEventInfo, EventMap, EventId, EventContext } from "@flowcards/react";

export interface FlowProps {
    highlightActionIndex? :number;
    currentActionIndex: number;
    bThreadReactionHistory?: Map<number, BThreadReaction>, 
    bThreadScaffoldingHistory?: Map<number, ScaffoldingResultType>, 
    pendingHistory: Map<number, EventMap<Bid[]>>,
    reactions?: Map<number, BThreadReaction>;
}
interface BThreadSection {
    title?: string,
    reactions: BThreadReaction[];
}

function getCurrentRun(scaffoldingHistory: Map<number, ScaffoldingResultType>, reactionHistory: Map<number, BThreadReaction>, highlightActionIndex?: number): undefined | [Map<number, BThreadReaction>, number, number] {
    let fromIndex: number | undefined, toIndex: number | undefined;
    let total = 0;
    let current = 0;
    scaffoldingHistory.forEach((type, index) => {
        if(type === ScaffoldingResultType.init) {
            if(current === 0) fromIndex = index;
            else if(current === total) toIndex = index-1;
            total++;
        }
        if(highlightActionIndex === undefined || highlightActionIndex === index) {
            current = total;
        }
    });
    if(fromIndex === undefined) return undefined;
    let history = new Map<number, BThreadReaction>();
    reactionHistory.forEach((reaction, index) => {
        if(index >= fromIndex! && toIndex ? index <= toIndex! : true) history.set(index,reaction);
    });
    return [history, current, total];
}

function partitionBySection(reactions?: Map<number, BThreadReaction>): BThreadSection[] {
    const sections: BThreadSection[] = [];
    reactions?.forEach((reaction) =>  {
        if(sections.length === 0) {
            sections.push({title: reaction.nextState.section, reactions: [reaction]});
            return 
        }
        sections[sections.length-1].reactions.push(reaction);
        if(reaction.hasNextSection) {
            sections.push({title: reaction.nextState.section, reactions: []});
        }
    });
    return sections;
}

function getStateForIndex(bThreadReactionHistory: Map<number, BThreadReaction>, index: number): BThreadState | undefined {
    while(index >= 0) {
        const reaction = bThreadReactionHistory.get(index);
        if(reaction) return reaction.nextState;
        index = index-1;
    }
    return undefined
}

export function Flow({bThreadScaffoldingHistory, bThreadReactionHistory, pendingHistory, currentActionIndex, highlightActionIndex}: FlowProps) {
    if(!bThreadScaffoldingHistory || !bThreadReactionHistory) return undefined;
    const state = getStateForIndex(bThreadReactionHistory!, highlightActionIndex || currentActionIndex);
    if(state === undefined) return null;
    const flowHeader = <div className="header">
        <div className="title">{state?.id.name} {state?.id.key} {state.description} {state.isCompleted ? ' (completed)' : null}</div>
    </div>;
    const currentRun = getCurrentRun(bThreadScaffoldingHistory, bThreadReactionHistory, highlightActionIndex || currentActionIndex);
    if(!currentRun) return flowHeader;
    const sectionedRuns = partitionBySection(currentRun[0]).map(section => {
        const reactions = section.reactions.map(reaction => {
            if(reaction.type === BThreadReactionType.newPending) {
                const pending = state.pending.get(reaction.bid.eventId);
                if(pending === undefined) return undefined;
                if(pending.actionId !== reaction.actionId) return undefined;
            }
            if(reaction.type === BThreadReactionType.progress || reaction.type === BThreadReactionType.newPending) {
                const isPending = pendingHistory.get(highlightActionIndex || currentActionIndex)?.has(reaction.bid.eventId)
                const classBidType = reaction.bid.type;
                const classPending = isPending ? 'pending' : '';
                const classPastHightlight = highlightActionIndex !== undefined && reaction.actionId > highlightActionIndex ? 'pastHighlightActionIndex' : '';
                if(classPending && classPastHightlight) return undefined
                const classHighlightAction = highlightActionIndex && reaction.actionId === highlightActionIndex ? 'current' : '';
                const classes = `bid ${classBidType} ${classPastHightlight} ${classPending} ${classHighlightAction}`
            return <span className={classes} key={reaction.actionId}>{reaction.bid.eventId.name}</span>;
            } 
        });
        return <div className="section">
            <div className="title">{section.title}</div>
            <div className="reactions">{reactions}</div>
        </div>
    });

    return (
        <div key={state.id.name} className="flow">
            {flowHeader}
            <div className="sections">
                {sectionedRuns}
            </div>
        </div>

    )
}


// TODO: Show init
// TODO: Show reset

// TODO: GET LIST OF ALL DISPATCHABLE EVENTS
// TODO: UI FOR EVENT DISPATCH