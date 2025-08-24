export function createStore(initial) {
  let state = JSON.parse(JSON.stringify(initial));
  const listeners = new Set();
  return {
    getState: () => state,
    setState: (patch) => { state = { ...state, ...patch }; emit(); },
    replaceState: (next) => { state = JSON.parse(JSON.stringify(next)); emit(); },
    subscribe: (fn) => { listeners.add(fn); fn(state); return () => listeners.delete(fn); }
  };
  function emit() { for (const fn of listeners) fn(state); }
}
