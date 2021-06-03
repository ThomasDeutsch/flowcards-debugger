import * as React from "react";
import { BThreadState, BThreadReaction, BThreadReactionType, ScaffoldingResultType } from "../../fcReact";

export interface FlowProps {
    state: BThreadState;
    currentActionId: number;
    highlightActionId?: number;
    bThreadReactionHistory?: Map<number, BThreadReaction>, 
    bThreadScaffoldingHistory?: Map<number, ScaffoldingResultType>,
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
    reactions?.forEach((reaction, index) =>  {
        if(sections.length === 0) {
            sections.push({title: reaction.section, reactions: [reaction]});
            return 
        }
        sections[sections.length-1].reactions.push(reaction);
        if(reaction.section !== reactions.get(index-1)?.section) {
            sections.push({title: reaction.section, reactions: []});
        }
    });
    return sections;
}

export function Flow({state, bThreadScaffoldingHistory, bThreadReactionHistory, currentActionId, highlightActionId}: FlowProps) {
    if(!bThreadScaffoldingHistory) return undefined;
    const showAction = highlightActionId !== undefined ? highlightActionId : currentActionId;
    const isEnabledClass = bThreadScaffoldingHistory.get(showAction + 1) ? 'enabled' : '';
    const flowHeader = <div className="header">
        <div className="title">
            <span>{state?.isCompleted ? ' ✅' : null} {state?.id.name} {state?.id.key} </span> 
            <span className="description">{state?.description}</span>
        </div>
    </div>
    const reactions = getReactions(bThreadReactionHistory);
    const askForBids: string[] = [];
    const waitForBids: string[] = [];
    const extendBids: string[] = [];
    state.bids?.askFor?.forEach(bid => {
        askForBids.push(bid.name); // TODO: use EventName Component?
    });
    state.bids?.waitFor?.forEach(bid => {
        waitForBids.push(bid.name); // TODO: use EventName Component?
    });
    state.bids?.extend?.forEach(bid => {
        extendBids.push(bid.name); // TODO: use EventName Component?
    });

    if(!reactions || reactions.size === 0) {
        return <div key={state?.id.name} className={"flow " + isEnabledClass}>
            {flowHeader}
            <div className="reactions">
                { askForBids.length > 0 && <span className="bid asking">{askForBids.join(', ')}</span>}
                { waitForBids.length > 0 && <span className="bid waiting">{waitForBids.join(', ')}</span>}
                { extendBids.length > 0 && <span className="bid exending">{extendBids.join(', ')}</span>}
            </div>
        </div>;
    }

    const sections = partitionBySection(reactions, state.section);
    const sectionedRuns = sections.map((section, sectionIndex) => {
        const isCurrentSection = sections.length-1 === sectionIndex;
        const reactions = section.reactions.map((reaction, index) => {
            const isHighlithedActionId = reaction.actionId === highlightActionId;
            if(reaction.reactionType === BThreadReactionType.progress) {
                const classBidType = reaction.selectedBid!.type;
                const classPastHightlight = highlightActionId !== undefined && highlightActionId < reaction.actionId && 'pastHighlightActionIndex';
                const classHighlightAction =  isHighlithedActionId ? 'current' : '';
                const classIsPending = isHighlithedActionId && section.reactions[index]?.bids?.pending?.has(reaction.selectedBid!.eventId) ? 'pending' : '';
                const classes = `bid ${classBidType} ${classPastHightlight} ${classHighlightAction} ${classIsPending}`
            return <span className={classes} key={reaction.actionId}>{reaction.selectedBid?.eventId.name}</span>
            }
            else if(reaction.reactionType === BThreadReactionType.newPending && isHighlithedActionId) {
                return<span className="bid pending">{reaction.selectedBid!.eventId.name}</span>
            }
        });
        const pending = state.bids?.pending?.allValues?.map(bid => <span className="bid pending">{bid.eventId.name}</span>)
        return <div className="section">
            <div className="title">{section.title}</div>
            <div className="reactions">
                {reactions}
                { isCurrentSection && pending}
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