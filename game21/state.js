const state = {
  currentCategory: null,
  allQuotes: [],
  byId: new Map(),
  manifest: null,
  queues: {
    all: { ids: [], cursor: 0 },
    byCategory: new Map(),
  },
};

export default state;
