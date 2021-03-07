import * as React from "react";
import { useState, useRef } from "react";
import { extend, waitFor, trigger, set, request, StagingFunction, ScenariosContext, Scenarios, UpdateCallback, scenario, askFor, BThread, BThreadContext } from "@flowcards/core";
import "./styles.scss";
import { Flow } from './Flow';
import { ActionControl } from "./Components/ActionControl/ActionControl";
import { useScenarios } from "./fcReact";

export function delay(ms: number, value?: any): Promise<any> {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}

const flow1 = scenario(
  {
    id: "Flow 1 - user login", description: "user can sign in / out",
    autoRepeat: true
  },
  function*(this: BThreadContext) {
    this.section('login process');
    const userName = yield askFor("login", (value: string) => ({isValid: value !== undefined && value.length > 3, message: 'user-name needs more than 3 characters'}));
    console.log('logged in user: ', userName);
    yield request("loginUser", () => delay(2000, userName));
    yield set("userLoggedIn", userName);
    this.section('user logged in');
    yield askFor('logout');
  }
);

const flow2 = scenario(
  {
    id: "Flow 2 - reserve ticket",
    description: "user can reserve a ticket",
    autoRepeat: true
  },
  function*(this: BThreadContext) {
    this.section('product-list');
    const ticketNumber = yield askFor('select ticket', (value: number) => ({isValid: value !== undefined && value > 0 && value <= 10, message: 'ticket id between 0 and 10'}));
    yield request('get ticket details', () => delay(2000, 'ticket details'));
    this.section('ticket-details: ' + ticketNumber);
    const [type, val] = yield [askFor('reserve ticket'), askFor('back to product-list')];
    if(type === 'reserve ticket') {
      yield request('api reserve ticket', () => delay(2000));
      yield set('userReservedTicket', ticketNumber);
    } 
  }
);

export default function App() {
  const [context, dispatchActions] = useScenarios(enable => {
    const isUserLoggedIn = enable(flow1()).section === ('user logged in');
    if(isUserLoggedIn) {
      enable(flow2());
    }
  }, []);
  const [highlightActionIndex, setHighlightActionIndex] = useState<number | undefined>(undefined);
  
  let flows: any[] = [];
  context.thread.forEach((state, bThreadId) => {
    const bThreadReactionHistory = context.log.bThreadReactionHistory.get(bThreadId);
    const bThreadScaffoldingHistory = context.log.bThreadScaffoldingHistory.get(bThreadId);
    flows[state.orderIndex] = Flow({
      state: state,
      bThreadReactionHistory: bThreadReactionHistory, 
      bThreadScaffoldingHistory: bThreadScaffoldingHistory,
      pendingHistory: context.log.pendingHistory,
      highlightActionIndex: highlightActionIndex,
      currentActionIndex: context.log.actions.length-1
    });
  });
  return (
    <div className="App">
        <div className="actionControl">
          <ActionControl
            context={context}
            dispatchActions={dispatchActions}
            setHighlightActionIndex={setHighlightActionIndex}
            highlightActionIndex={highlightActionIndex} />
        </div>
        <div className="flows">
        {flows}
        </div>
    </div>
  );
}
