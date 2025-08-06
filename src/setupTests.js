import '@testing-library/jest-dom';

global.MutationObserver = class {
  constructor() {}
  disconnect() {}
  observe() {}
};
