import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  createFiber,
  setCurrentFiber,
  clearCurrentFiber,
  runEffects,
} from '../hooks.js';
import { useUpdateEffect } from './useUpdateEffect.js';

describe('useUpdateEffect', () => {
  let fiber = createFiber();

  beforeEach(() => {
    fiber = createFiber();
    setCurrentFiber(fiber);
  });

  afterEach(() => {
    clearCurrentFiber();
  });

  it('does not run the effect on the first render', () => {
    const effectSpy = vi.fn();
    useUpdateEffect(effectSpy);

    runEffects(fiber);
    expect(effectSpy).not.toHaveBeenCalled();
  });

  it('runs the effect when dependencies change after the first render', () => {
    const effectSpy = vi.fn();

    // 1. First render (Ignored)
    useUpdateEffect(effectSpy, ['initial']);
    runEffects(fiber);

    // 2. Second render (Deps changed -> Should run)
    fiber.hookIndex = 0;
    useUpdateEffect(effectSpy, ['updated']);
    runEffects(fiber);

    expect(effectSpy).toHaveBeenCalledTimes(1);
  });

  it('does not run when dependencies are unchanged', () => {
    const effectSpy = vi.fn();

    // 1. First render (Ignored)
    useUpdateEffect(effectSpy, ['stable-dep']);
    runEffects(fiber);

    // 2. Second render (Deps same -> Native diffing skips it)
    fiber.hookIndex = 0;
    useUpdateEffect(effectSpy, ['stable-dep']);
    runEffects(fiber);

    expect(effectSpy).not.toHaveBeenCalled();
  });

  it('runs a returned cleanup function before the next effect', () => {
    const cleanupSpy = vi.fn();
    const effectSpy = vi.fn(() => cleanupSpy);

    // 1. First render (Ignored)
    useUpdateEffect(effectSpy, [1]);
    runEffects(fiber);

    // 2. Second render (Effect runs, returning our cleanup spy)
    fiber.hookIndex = 0;
    useUpdateEffect(effectSpy, [2]);
    runEffects(fiber);

    // 3. Third render (Cleanup from render 2 must run before effect)
    fiber.hookIndex = 0;
    useUpdateEffect(effectSpy, [3]);
    runEffects(fiber);

    expect(cleanupSpy).toHaveBeenCalledTimes(1);
    expect(effectSpy).toHaveBeenCalledTimes(2);
  });
});