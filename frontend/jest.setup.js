import '@testing-library/jest-dom';

// Suppress React act() warnings from Radix UI / other libs (state updates in ref/layout effects)
const originalConsoleError = console.error;
console.error = (...args) => {
  const msg = typeof args[0] === 'string' ? args[0] : String(args[0]);
  if (msg.includes('An update to') && msg.includes('was not wrapped in act(...)')) {
    return;
  }
  originalConsoleError.apply(console, args);
};

// Mock global toa

// Mock global toast (used by some pages without importing, e.g. audit page)
global.toast = global.toast || (() => {});

// Mock global fetch
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({ success: true, data: {} }),
  })
);

// Mock ResizeObserver
class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}

global.ResizeObserver = ResizeObserver;
