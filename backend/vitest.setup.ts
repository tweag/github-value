import { vi } from 'vitest';

// Mock global objects or setup global configurations here
global.console = {
  ...console,
  log: vi.fn(),
  error: vi.fn()
};
