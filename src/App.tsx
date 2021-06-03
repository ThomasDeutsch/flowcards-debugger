import * as React from "react";
import { useState } from "react";
import { extend, set, request, scenario, askFor, BThreadContext, block } from "@flowcards/core";
import "./styles.scss";
import { Flow } from './Components/Flow/Flow';
import { ActionControl } from "./Components/ActionControl/ActionControl";
import { useScenarios } from "./fcReact";

export function delay(ms: number, value?: any): Promise<any> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

const flow1 = scenario(
  {
    id: "Flow 1 - user login", description: "user can sign in / out"
  },
  function*(this: BThreadContext) {
    this.section('login process');
    const userName = yield askFor("login", (value: string) => ({isValid: value !== undefined && value.length > 3, message: 'user-name needs more than 3 characters'}));
    yield request("loginUser", () => delay(2000, userName));
    yield set("userLoggedIn", userName);
    this.section('user logged in');
    yield askFor('logout');
  }
);

const flow2 = scenario(
  {
    id: "Flow 2 - reserve ticket",
    description: "user can reserve a ticket"
  },
  function*(this: BThreadContext) {
    this.section('product-list');
    const ticketNumber = yield askFor('select ticket', (value: number) => ({isValid: value !== undefined && value > 0 && value <= 10, message: 'ticket id between 0 and 10'}));
    yield request('get ticket details', () => delay(2000, 'ticket details'));
    this.section('ticket-details: ' + ticketNumber);
    const [type] = yield [askFor('reserve ticket'), askFor('back to product-list')];
    if(type === 'reserve ticket') {
      yield request('api reserve ticket', () => delay(2000));
      yield set('ticket reserved');
    } 
  }
);

const flow3 = scenario(
  {
    id: "Flow 3 - user name restricted",
    description: "user name can not be longer than 10 characters"
  },
  function*(this: BThreadContext) {
    yield block('login', (value: string) => ({isValid: value?.length > 10, message: 'user-name needs to smaller chan 10 characters'}));
  }
)

const flow4 = scenario(
  {
    id: "Flow 4 - confirm reservation",
    description: "user needs to confirm ticket-reservation"
  },
  function*(this: BThreadContext) {
    const e = yield extend('reserve ticket');
    yield askFor('confirm reservation');
    // viel Arbeit.... model-aligned
    e.resolve('ok');
  }
)

export default function App() {
  const [context, dispatchActions] = useScenarios(enable => {
    const isUserLoggedIn = enable(flow1()).section === ('user logged in');
    if(isUserLoggedIn) {
      enable(flow2());
      enable(flow4())
    } else {
      enable(flow3());
    }
  }, []);

  const [highlightActionId, setHighlightActionId] = useState<number | undefined>(undefined);
  
  let flows: any[] = [];
  context.thread.forEach((state, bThreadId) => {
    const bThreadReactionHistory = context.log.bThreadReactionHistory.get(bThreadId);
    const bThreadScaffoldingHistory = context.log.bThreadScaffoldingHistory.get(bThreadId);
    flows[state.orderIndex] = Flow({
      state: state,
      bThreadReactionHistory: bThreadReactionHistory, 
      bThreadScaffoldingHistory: bThreadScaffoldingHistory,
      highlightActionId: highlightActionId,
      currentActionId: context.log.actions.length-1
    });
  });
  return (
    <div className="App">
        <div className="actionControl">
          <ActionControl
            bids={context.bids}
            event={context.event}
            loggedActions={context.log.actions}
            dispatchActions={dispatchActions}
            setHighlightActionId={setHighlightActionId}
            highlightActionId={highlightActionId} />
        </div>
        <div className="flows">
          {flows}
        </div>
    </div>
  );
}