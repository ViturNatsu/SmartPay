import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";
import '@testing-library/jest-dom/vitest';

const createStorageMock = () => {
  let store = {};

  return {
    getItem: vi.fn((key) => store[key] ?? null),
    setItem: vi.fn((key, value) => {
      store[key] = String(value);
    }),
    removeItem: vi.fn((key) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
  };
};

Object.defineProperty(window, "localStorage", {
  value: createStorageMock(),
  configurable: true,
});

Object.defineProperty(window, "sessionStorage", {
  value: createStorageMock(),
  configurable: true,
});

afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorage.clear();
  sessionStorage.clear();
});