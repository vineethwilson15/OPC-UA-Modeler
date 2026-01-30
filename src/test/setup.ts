import '@testing-library/jest-dom';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeAll, vi } from 'vitest';

// Mock @siemens/ix to avoid loading next.js package
vi.mock('@siemens/ix', async () => {
  const actual = await vi.importActual('@siemens/ix');
  return {
    ...actual,
    UploadFileState: {
      UPLOAD_PENDING: 'upload-pending',
      UPLOAD_FINISHED: 'upload-finished',
      UPLOAD_FAILED: 'upload-failed',
      UPLOAD_SUCCEDED: 'upload-succeded',
    },
  };
});

// Mock scrollIntoView for jsdom
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
  
  // Mock matchMedia for theme detection
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: () => {}, // deprecated
      removeListener: () => {}, // deprecated
      addEventListener: () => {},
      removeEventListener: () => {},
      dispatchEvent: () => true,
    }),
  });
  
  // Mock localStorage
  const storage: Record<string, string> = {};
  const localStorageMock = {
    getItem: (key: string) => storage[key] || null,
    setItem: (key: string, value: string) => { storage[key] = value; },
    removeItem: (key: string) => { delete storage[key]; },
    clear: () => { Object.keys(storage).forEach(key => delete storage[key]); },
    length: 0,
    key: () => null,
  };
  Object.defineProperty(window, 'localStorage', {
    writable: true,
    value: localStorageMock,
  });
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});
