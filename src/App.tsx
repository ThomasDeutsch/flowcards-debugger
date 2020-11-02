import * as React from "react";
import { useState, useRef } from "react";
import { flow, extend, wait, trigger, set, request, DispatchActions, StagingFunction, ScenariosContext, scenarios, PlayPause } from "@flowcards/core";
import "./styles.scss";
import { Flow } from './Flow';
import { ActionControl } from "./Components/ActionControl/ActionControl";
import { EventDispatcher } from "./Components/EventDispatcher/EventDispatcher";

export function useScenarios(stagingFunction: StagingFunction): [ScenariosContext, DispatchActions, PlayPause] {
  const [state, setState] = useState<ScenariosContext>();
  const ref = useRef<[ScenariosContext, DispatchActions, PlayPause] | null>(null);
  if(ref.current === null) {
      ref.current = scenarios(stagingFunction, (a: ScenariosContext): void => { setState(a) })
  }
  return [state || ref.current[0], ref.current[1], ref.current[2]];
}

function delay(ms: number, value?: any) {
  return new Promise(resolve => setTimeout(() => resolve(value), ms));
}


const flow1 = flow(
  {
    name: "Flow 1", description: "this is flow 1"
  },
  function*(this: any) {
    this.section('firstSection');
    yield set("WaitForCard", 15);
    this.section('secondSection');
    yield request("WaitForCard 2", () => delay(2000));
    this.section('endSection');
    yield wait("completeMe");
    this.section(undefined);
    yield wait('ui action', (value: number) => ({isValid: value !== undefined && value < 100, message: 'provide a number value smaller than 100'}));
  }
);

const flow2 = flow(
  {
    name: "Flow 2",
    description: "extend flow"
  },
  function*() {
    const ext1 = yield extend("WaitForCard");
    ext1.resolve(123);
    const ext = yield extend("WaitForCard 2");
    yield request('NONONO')
    yield request('zwischentest', () => delay(2000));
    ext.resolve(20);
  }
);

const flow3 = flow(
  {
    name: "Flow 3",
    key: "1",
    description: "trigger flow"
  },
  function*() {
    yield trigger("completeMe");
    yield request('request after trigger');
  }
);

function iconPause(isActive: boolean) {
  return <svg x="0px" y="0px" viewBox="0 0 59 100">
      <path style={isActive ? {fill: 'red'} : {fill: '#333'}} d="M10.6,0C4.7,0,0,4.9,0,11v78c0,6.1,4.7,11,10.6,11s10.6-4.9,10.6-11V11C21.1,4.9,16.4,0,10.6,0z"/>
      <path style={isActive ? {fill: 'red'} : {fill: '#333'}} d="M48.1,0c-5.8,0-10.6,4.9-10.6,11v78c0,6.1,4.7,11,10.6,11s10.6-4.9,10.6-11V11C58.7,4.9,54,0,48.1,0z"/>
  </svg>
}

export default function App() {
  const [context, dispatchActions, playPause] = useScenarios(enable => {
    enable(flow1());
    const flow2State = enable(flow2());
    if(flow2State.isCompleted) {
      enable(flow3());
    }
    
  });
  const [highlightActionIndex, setHighlightActionIndex] = useState<number | undefined>(undefined);
  
  let flows: any[] = [];
  context.thread.forEach((state, bThreadId) => {
    const bThreadReactionHistory = context.log.bThreadReactionHistory.get(bThreadId);
    const bThreadScaffoldingHistory = context.log.bThreadScaffoldingHistory.get(bThreadId);
    flows[state.orderIndex] = Flow({
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
