
// Requirements for a State Machine Component
export interface IStateMachine<T> {
  name: string;
  activate(obj: T): void; // Handle when the component is turned on
  deactivate(obj: T): void; // Handle when the component is turned off
}

// Very basic implementation of a Finite State Machine
// Designed to only store components and transitioning between them.
// T is for any specific object type that may be needed
// to be passed to a Component during its transition.
export class StateMachine<T> {
  // #region MAIN
  components: Map<string, IStateMachine<T>> = new Map(); // Collection of components
  active: IStateMachine<T> | null = null; // Which Component is currently active
  defaultName: string = ''; // Name of the default component
  // #endregion

  // #region METHODS
  /** add a new state machine component */
  register(
    customName: string | null,
    compInstance: IStateMachine<T>,
    isDefault: boolean = false,
  ): this {
    const comName = customName != null ? customName : compInstance.name;
    this.components.set(comName, compInstance);
    if (isDefault) {
      this.defaultName = comName;
    }
    return this;
  }

  /** Remove component from collection */
  remove(name: string, obj: T): boolean {
    if (this.components.has(name)) {
      // If the component is currently active, need to deactivate it before removing
      if (this.active != null && this.active.name === name) {
        this.deactivate(obj);
      }

      // Remove default component if its the same one being removed
      if (this.defaultName === name) {
        this.defaultName = '';
      }

      this.components.delete(name);
      return true;
    }

    return false;
  }

  /** Return the name of the currently active component */
  getActiveName(): string | null {
    return this.active ? this.active.name : null;
  }

  /** Get the active component for direct access to its methods */
  getActive(): IStateMachine<T> | null {
    return this.active;
  }
  // #endregion

  // #region MANAGE COMPONENTS
  /** Transition from the active component to a new one */
  switchTo(name: string, obj: T): boolean {
    const component = this.components.get(name);
    if (!component) {
      return false;
    }

    this.deactivate(obj); // Turn off any component that's currently on
    component.activate(obj); // Turn on new component
    this.active = component;
    return true;
  }

  /** Switch to the default or main component */
  switchToDefault(obj: T): boolean {
    return this.defaultName !== ''
      ? this.switchTo(this.defaultName, obj)
      : false;
  }

  /** Turn off any active state machine components */
  deactivate(obj: T): boolean {
    if (this.active != null) {
      this.active.deactivate(obj);
      this.active = null;
      return true;
    }
    return false;
  }
  // #endregion
}
