// #region IMPORTS

'use strict';

import type {TEventCallback} from 'SculptorTypes';

import EventSet from 'SculptorEventSet';
// #endregion

export default class SculptorEvents {
  // #region MAIN
  items: Map<string, EventSet> = new Map();
  constructor() {}
  // #endregion

  // #region METHODS

  /** Add Event Listener */
  on(evtName: string, fn: TEventCallback): this {
    let evt: ?EventSet = this.items.get(evtName);

    // Create event set if it doesn't exist.
    if (!evt) {
      evt = new EventSet(evtName);
      this.items.set(evtName, evt);
    }

    evt.add(fn);
    return this;
  }

  /** Remove Event Listener */
  off(evtName: string, fn: TEventCallback): this {
    const evt = this.items.get(evtName);
    if (evt) {
      evt.remove(fn);
    }

    return this;
  }

  /** Emit Event to all listeners */
  /* $FlowIgnore[unclear-type] */
  emit(evtName: string, data: ?any): this {
    const evt = this.items.get(evtName);
    if (evt) {
      evt.dispatch(data);
    }
    return this;
  }

  /** Clear out all events & listeners */
  clearAll() {
    let es: EventSet;
    for (es of this.items.values()) {
      es.clear(); // Remove all Handlers for each event set
    }
    this.items.clear(); // Clear map of all event sets
  }

  // #endregion
}
