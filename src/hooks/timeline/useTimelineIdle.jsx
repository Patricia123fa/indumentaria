import { useCallback, useEffect } from 'react';
import { IDLE_TIMEOUT_MS } from '../../data/timelineData.jsx';

export function useTimelineIdle({
  idleTimeoutRef,
  idleVideoRef,
  isIdleVideoVisible,
  setIsIdleVideoVisible,
}) {
  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, [idleTimeoutRef]);

  const scheduleIdleMode = useCallback(() => {
    clearIdleTimeout();
    idleTimeoutRef.current = window.setTimeout(() => {
      setIsIdleVideoVisible(true);
    }, IDLE_TIMEOUT_MS);
  }, [clearIdleTimeout, idleTimeoutRef, setIsIdleVideoVisible]);

  const exitIdleMode = useCallback(() => {
    setIsIdleVideoVisible(false);
    scheduleIdleMode();
  }, [scheduleIdleMode, setIsIdleVideoVisible]);

  const registerUserActivity = useCallback(() => {
    if (isIdleVideoVisible) return;
    scheduleIdleMode();
  }, [isIdleVideoVisible, scheduleIdleMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const handleActivity = () => registerUserActivity();

    window.addEventListener('pointerdown', handleActivity, { passive: true });
    window.addEventListener('wheel', handleActivity, { passive: true });
    window.addEventListener('touchstart', handleActivity, { passive: true });
    window.addEventListener('keydown', handleActivity);

    if (!isIdleVideoVisible) {
      scheduleIdleMode();
    } else {
      clearIdleTimeout();
    }

    return () => {
      window.removeEventListener('pointerdown', handleActivity);
      window.removeEventListener('wheel', handleActivity);
      window.removeEventListener('touchstart', handleActivity);
      window.removeEventListener('keydown', handleActivity);
      clearIdleTimeout();
    };
  }, [clearIdleTimeout, isIdleVideoVisible, registerUserActivity, scheduleIdleMode]);

  useEffect(() => {
    if (!isIdleVideoVisible || !idleVideoRef.current) return;
    idleVideoRef.current.currentTime = 0;
    const playPromise = idleVideoRef.current.play();
    if (playPromise && typeof playPromise.catch === 'function') {
      playPromise.catch(() => {});
    }
  }, [idleVideoRef, isIdleVideoVisible]);

  return { exitIdleMode };
}

