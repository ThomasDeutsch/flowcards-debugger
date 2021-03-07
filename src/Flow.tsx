import * as React from "react";
import { BThreadState, BThreadReaction, BThreadReactionType, Bid, ScaffoldingResultType, EventMap } from "./fcReact";

export interface FlowProps {
    state: BThreadState;
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

function getReactions(reactionHistory?: Map<number, BThreadReaction>): undefined | Map<number, BThreadReaction> {
    let history = new Map<number, BThreadReaction>();
    reactionHistory?.forEach((reaction, index) => {
        history.set(index,reaction);
    });
    return history || new Map();
}

function partitionBySection(reactions?: Map<number, BThreadReaction>, currentSection?: string): BThreadSection[] {
    const sections: BThreadSection[] = [];
    if((!reactions || reactions.size === 0) && currentSection ) {
        sections.push({title: currentSection, reactions: []})
    }
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

function getStateForIndex(index: number, bThreadReactionHistory?: Map<number, BThreadReaction>): BThreadState | undefined {
    while(index >= 0) {
        const reaction = bThreadReactionHistory?.get(index);
        if(reaction) return reaction.nextState;
        index--;
    }
    return undefined
}

export function Flow({state, bThreadScaffoldingHistory, bThreadReactionHistory, currentActionIndex, highlightActionIndex}: FlowProps) {
    if(!bThreadScaffoldingHistory) return undefined;
    //const highlightState = getStateForIndex(highlightActionIndex, state);
    const isEnabledClass = bThreadScaffoldingHistory.get(highlightActionIndex || currentActionIndex) ? 'enabled' : '';
    const flowHeader = <div className="header">
        <div className="title">
            <span>{state?.isCompleted ? ' ✅' : null} {state?.id.name} {state?.id.key} </span> 
            <span className="description">{state?.description}</span>
        </div>
    </div>
    const reactions = getReactions(bThreadReactionHistory);
    const askForBids: string[] = [];
    const waitForBids: string[] = [];
    state.bids?.askFor?.forEach(bid => {
        askForBids.push(bid.name); // TODO: use EventName Component?
    })
    state.bids?.waitFor?.forEach(bid => {
        waitForBids.push(bid.name); // TODO: use EventName Component?
    })

    if(!reactions) {
        return <div key={state?.id.name} className={"flow " + isEnabledClass}>
            {flowHeader}
            <div className="reactions">
                { askForBids.length > 0 && <span className="bid asking">{askForBids.join(', ')}</span>}
                { waitForBids.length > 0 && <span className="bid waiting">{waitForBids.join(', ')}</span>}
            </div>
        </div>;
    }

    const sections = partitionBySection(reactions, state.section);
    const sectionedRuns = sections.map((section, sectionIndex) => {
        const isCurrentSection = sections.length-1 === sectionIndex;
        const reactions = section.reactions.map((reaction, index) => {
            const isPastHighlight = highlightActionIndex !== undefined && reaction.actionId > highlightActionIndex;
            if(reaction.type === BThreadReactionType.newPending) {
                if(isPastHighlight) return undefined;
                const hasProgressed = section.reactions.slice(index+1).some(reaction => reaction.type !== BThreadReactionType.newPending);
                if(hasProgressed) return undefined;
            }
            if(reaction.type === BThreadReactionType.progress || reaction.type === BThreadReactionType.newPending) {
                const classBidType = reaction.bid.type;
                const classReactionType = `reactionType_${reaction.type}`
                const classPastHightlight = isPastHighlight && 'pastHighlightActionIndex';
                const classHighlightAction = highlightActionIndex && reaction.actionId === highlightActionIndex ? 'current' : '';
                const classes = `bid ${classBidType} ${classPastHightlight} ${classReactionType} ${classHighlightAction}`
            return <span className={classes} key={reaction.actionId}>{reaction.bid.eventId.name}</span>;
            }
        });
        return <div className="section">
            <div className="title">{section.title}</div>
            <div className="reactions">
                {reactions}
                { isCurrentSection && askForBids.length > 0 && <span className="bid asking">{askForBids.join(', ')}</span>}
                { isCurrentSection && waitForBids.length > 0 && <span className="bid waiting">{waitForBids.join(', ')}</span>}
            </div>
        </div>
    });

    return (
        <div key={state.id.name} className={"flow " + isEnabledClass}>
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