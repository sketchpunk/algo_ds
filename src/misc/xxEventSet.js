// #region IMPORTS

'use strict';

import type {TEventCallback} from 'Types';

// #endregion

export default class EventSet {
  // #region MAIN
  name: string;
  callbacks: Array<TEventCallback> = [];

  constructor(name: string) {
    this.name = name;
  }
  // #endregion

  // #region METHODS

  /** Clear all callbacks */
  clear() {
    this.callbacks.length = 0;
  }

  /** Add Callback */
  add(fn: TEventCallback): void {
    this.callbacks.push(fn);
  }

  /** Remove Callback */
  remove(fn: TEventCallback): void {
    const idx = this.callbacks.indexOf(fn);
    if (idx == -1) {
      return;
    }

    if (idx == 0) {
      // From Start
      this.callbacks.shift();
    } else if (idx == this.callbacks.length - 1) {
      // From End
      this.callbacks.pop();
    } else {
      // From Middle
      this.callbacks.splice(idx, 1);
    }
  }

  /** Run all callbacks */
  /* $FlowIgnore[unclear-type] */
  dispatch(data: ?any): void {
    let c: TEventCallback;
    for (c of this.callbacks) {
      try {
        c(data);
      } catch (e) {
        FBLogger('A listener had an error during dispatching ', this.name, e);
      }
    }
  }
  // #endregion
}
