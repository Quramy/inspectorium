import { EventEmitter } from "events";

export type Store<T> = {
  getState: () => T,
  onStateChange: (cb: (state: T) => any) => void,
}

export type DispatchType<T> = (update: () => (T | Promise<T>)) => void;

export type Dispatcher<T> = {
  getCurrentState: () => T,
  dispatch: DispatchType<T>
}

export function initStore<T>(initialState: T) {

  const coreStore = new CoreStore(initialState);

  return {
    store: {
      getState: coreStore.getCurrentState.bind(coreStore),
      onStateChange: coreStore.onStateChange.bind(coreStore),
    } as Store<T>,
    dispatcher: {
      getCurrentState: coreStore.getCurrentState.bind(coreStore),
      dispatch: coreStore.dispatch.bind(coreStore),
    } as Dispatcher<T>,
  };
}

class CoreStore<T> {

  private state: T;
  private emitter: EventEmitter;

  constructor(initialState: T) {
    this.state = initialState;
    this.emitter = new EventEmitter();
  }

  dispatch(update: () => (T | Promise<T>)) {
    const x = update() as any;
    const cb = (s: T) => {
      this.state = s;
      console.log("next state", s);
      this.emitter.emit("stateChange", this.state);
    };
    if (x.then && typeof x.then === "function") {
      x.then((s: T) => cb(s));
    } else {
      cb(x as T);
    }
  }

  getCurrentState() {
    return this.state;
  }

  onStateChange(cb: (state: T) => any) {
    this.emitter.on("stateChange", cb);
  }
}
