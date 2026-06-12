import { useCallback, useEffect, useRef } from 'react';
import { BACKGROUND_FADE_MS } from '../../data/timelineData.jsx';

export function useBackgroundTransition({
  backgroundFadeRafRef,
  backgroundFadeTimeoutRef,
  backgroundQueueRef,
  currentBaseBackgroundRef,
  isBackgroundTransitionRunningRef,
  lastQueuedBackgroundRef,
  setBaseBackground,
  setOverlayBackground,
  setOverlayOpacity,
}) {
  const runBackgroundTransitionRef = useRef(null);

  const clearPendingTransition = useCallback(() => {
    if (backgroundFadeTimeoutRef.current) {
      window.clearTimeout(backgroundFadeTimeoutRef.current);
      backgroundFadeTimeoutRef.current = null;
    }
    if (backgroundFadeRafRef.current) {
      window.cancelAnimationFrame(backgroundFadeRafRef.current);
      backgroundFadeRafRef.current = null;
    }
  }, [backgroundFadeRafRef, backgroundFadeTimeoutRef]);

  const runBackgroundTransition = useCallback((nextBackground) => {
    clearPendingTransition();

    if (!nextBackground) {
      isBackgroundTransitionRunningRef.current = false;
      lastQueuedBackgroundRef.current = currentBaseBackgroundRef.current;
      return;
    }

    if (nextBackground === currentBaseBackgroundRef.current) {
      isBackgroundTransitionRunningRef.current = false;
      lastQueuedBackgroundRef.current = currentBaseBackgroundRef.current;
      return;
    }

    isBackgroundTransitionRunningRef.current = true;
    setOverlayBackground(nextBackground);
    setOverlayOpacity(0);

    backgroundFadeRafRef.current = window.requestAnimationFrame(() => {
      setOverlayOpacity(1);
    });

    backgroundFadeTimeoutRef.current = window.setTimeout(() => {
      currentBaseBackgroundRef.current = nextBackground;
      setBaseBackground(nextBackground);
      setOverlayBackground(null);
      setOverlayOpacity(0);
      backgroundFadeTimeoutRef.current = null;

      if (backgroundQueueRef.current.length > 0) {
        const queuedBackground = backgroundQueueRef.current.shift();
        runBackgroundTransitionRef.current?.(queuedBackground);
        return;
      }

      isBackgroundTransitionRunningRef.current = false;
      lastQueuedBackgroundRef.current = currentBaseBackgroundRef.current;
    }, BACKGROUND_FADE_MS);
  }, [
    backgroundFadeRafRef,
    backgroundFadeTimeoutRef,
    backgroundQueueRef,
    currentBaseBackgroundRef,
    isBackgroundTransitionRunningRef,
    lastQueuedBackgroundRef,
    setBaseBackground,
    clearPendingTransition,
    setOverlayBackground,
    setOverlayOpacity,
  ]);

  useEffect(() => {
    runBackgroundTransitionRef.current = runBackgroundTransition;
  }, [runBackgroundTransition]);

  return useCallback(
    (targetBackground) => {
      if (!targetBackground) return;

      if (
        targetBackground === currentBaseBackgroundRef.current &&
        backgroundQueueRef.current.length === 0 &&
        !isBackgroundTransitionRunningRef.current
      ) {
        return;
      }

      if (targetBackground === lastQueuedBackgroundRef.current) return;

      backgroundQueueRef.current = [targetBackground];
      lastQueuedBackgroundRef.current = targetBackground;

      if (!isBackgroundTransitionRunningRef.current) {
        const nextBackground = backgroundQueueRef.current.shift();
        runBackgroundTransition(nextBackground);
      }
    },
    [
      backgroundQueueRef,
      currentBaseBackgroundRef,
      isBackgroundTransitionRunningRef,
      lastQueuedBackgroundRef,
      runBackgroundTransition,
    ],
  );
}
