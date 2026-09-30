// Connection state of optional dependencies (Kafka, ...) for GET /ready.
//
// Each dependency reports itself here; a name that never reported is simply
// not checked. MongoDB is read straight from mongoose in the route instead.
const states = new Map();

export const setDependencyReady = (name, ready) => {
  states.set(name, Boolean(ready));
};

export const getDependencyStates = () => Object.fromEntries(states);
