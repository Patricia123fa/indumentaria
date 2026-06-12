import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FOUR_K_BASE_WIDTH,
  getViewportScale,
  MOBILE_BREAKPOINT,
  MOBILE_LINE_HALF_THICKNESS,
  MOBILE_LINE_THICKNESS,
  MOBILE_TIMELINE_SCALE,
} from '../../data/timelineData.jsx';

export function useTimelineLayout() {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? FOUR_K_BASE_WIDTH : window.innerWidth,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const syncViewportWidth = () => setViewportWidth(window.innerWidth);
    syncViewportWidth();
    window.addEventListener('resize', syncViewportWidth);
    return () => window.removeEventListener('resize', syncViewportWidth);
  }, []);

  const viewportScale = useMemo(() => getViewportScale(viewportWidth), [viewportWidth]);
  const isMobile = viewportWidth <= MOBILE_BREAKPOINT;
  const timelineScaleFactor = isMobile ? MOBILE_TIMELINE_SCALE : 1;
  const timelineLineThickness = isMobile ? MOBILE_LINE_THICKNESS : '2cm';
  const timelineLineHalfThickness = isMobile ? MOBILE_LINE_HALF_THICKNESS : '1cm';

  const scalePx = useCallback(
    (value) => {
      if (!Number.isFinite(value)) return value;
      return Math.round(value * viewportScale);
    },
    [viewportScale],
  );

  const scaleTimelinePx = useCallback(
    (value) => {
      if (!Number.isFinite(value)) return value;
      return Math.round(value * viewportScale * timelineScaleFactor);
    },
    [timelineScaleFactor, viewportScale],
  );

  return {
    isMobile,
    scalePx,
    scaleTimelinePx,
    timelineLineHalfThickness,
    timelineLineThickness,
    viewportScale,
    viewportWidth,
  };
}
