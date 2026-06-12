import { useEffect } from 'react';

const REQUIRED_TOUCHES = 3;
const HOLD_MS = 900;
const MAX_MOVE_PX = 24;

function getTouchCenter(touches) {
  if (!touches.length) return null;

  let totalX = 0;
  let totalY = 0;
  for (let index = 0; index < touches.length; index += 1) {
    totalX += touches[index].clientX;
    totalY += touches[index].clientY;
  }

  return {
    x: totalX / touches.length,
    y: totalY / touches.length,
  };
}

export default function ElectronTouchFullscreenExit() {
  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (typeof window.electronWindow?.exitFullscreen !== 'function') return undefined;

    let holdTimeoutId = null;
    let startCenter = null;

    const clearGesture = () => {
      if (holdTimeoutId !== null) {
        window.clearTimeout(holdTimeoutId);
        holdTimeoutId = null;
      }
      startCenter = null;
    };

    const handleTouchStart = (event) => {
      if (event.touches.length !== REQUIRED_TOUCHES) {
        clearGesture();
        return;
      }

      startCenter = getTouchCenter(event.touches);
      holdTimeoutId = window.setTimeout(() => {
        window.electronWindow.exitFullscreen();
        clearGesture();
      }, HOLD_MS);
    };

    const handleTouchMove = (event) => {
      if (holdTimeoutId === null || event.touches.length !== REQUIRED_TOUCHES || !startCenter) {
        clearGesture();
        return;
      }

      const nextCenter = getTouchCenter(event.touches);
      if (!nextCenter) {
        clearGesture();
        return;
      }

      const movedX = nextCenter.x - startCenter.x;
      const movedY = nextCenter.y - startCenter.y;
      if (Math.hypot(movedX, movedY) > MAX_MOVE_PX) {
        clearGesture();
      }
    };

    window.addEventListener('touchstart', handleTouchStart, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchend', clearGesture, { passive: true });
    window.addEventListener('touchcancel', clearGesture, { passive: true });

    return () => {
      window.removeEventListener('touchstart', handleTouchStart);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', clearGesture);
      window.removeEventListener('touchcancel', clearGesture);
      clearGesture();
    };
  }, []);

  return null;
}
