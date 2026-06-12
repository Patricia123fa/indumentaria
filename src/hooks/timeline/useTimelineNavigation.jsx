import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BANDO_EXIT_DOT_SWITCH_DELAY_MS,
  CLOSE_RADIUS_FACTOR,
  DOT_ENTRIES,
  EDGE_LOCK_FACTOR,
  getDefaultDotKey,
  getSigloFocusRatio,
  MIN_AUTO_SIGLO_SWITCH_MS,
  OPEN_RADIUS_FACTOR,
  ORDERED_HISTORIA,
  RETURN_REVEAL_MS,
  SIGLO_SELECTION_PROBE_FACTOR,
} from '../../data/timelineData.jsx';

const INITIAL_EXPANDED_DOTS_BY_KEY = Object.fromEntries(DOT_ENTRIES.map((entry) => [entry.key, false]));

export function useTimelineNavigation() {
  const [sigloIdx, setSigloIdx] = useState(0);
  const [activeDotKey, setActiveDotKey] = useState(getDefaultDotKey);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedDotsByKey, setExpandedDotsByKey] = useState(() => INITIAL_EXPANDED_DOTS_BY_KEY);
  const [forcedRevealSigloIdx, setForcedRevealSigloIdx] = useState(null);

  const wrapperRef = useRef(null);
  const dotRefs = useRef({});
  const centuryRefs = useRef({});
  const deployFrameRef = useRef(null);
  const revealTimeoutRef = useRef(null);
  const pendingDotSwitchTimeoutRef = useRef(null);
  const lastAutoSigloSwitchAtRef = useRef(0);
  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    isDragging: false,
    shouldPreventClick: false,
  });

  const activeConflictEntry = useMemo(
    () => DOT_ENTRIES.find((entry) => entry.key === activeDotKey) ?? null,
    [activeDotKey],
  );

  const updateExpandedDots = useCallback(() => {
    const container = wrapperRef.current;
    if (!container) return;

    const containerRect = container.getBoundingClientRect();
    const centerX = containerRect.left + containerRect.width / 2;
    const selectionProbeX = containerRect.left + containerRect.width * SIGLO_SELECTION_PROBE_FACTOR;
    const openRadius = Math.max(1, containerRect.width * OPEN_RADIUS_FACTOR);
    const closeRadius = Math.max(openRadius + 1, containerRect.width * CLOSE_RADIUS_FACTOR);

    setExpandedDotsByKey((prev) => {
      let hasChanges = false;
      const next = { ...prev };

      DOT_ENTRIES.forEach((entry) => {
        const key = entry.key;
        const node = dotRefs.current[key];
        const wasExpanded = Boolean(prev[key]);
        let shouldExpand = wasExpanded;

        if (!node) {
          shouldExpand = false;
        } else {
          const dotRect = node.getBoundingClientRect();
          const dotCenterX = dotRect.left + dotRect.width / 2;
          const distance = Math.abs(dotCenterX - centerX);
          shouldExpand = wasExpanded ? distance <= closeRadius : distance <= openRadius;
        }

        if (shouldExpand !== wasExpanded) {
          next[key] = shouldExpand;
          hasChanges = true;
        }
      });

      return hasChanges ? next : prev;
    });

    const centuryCenters = ORDERED_HISTORIA.map((_, index) => {
      const node = centuryRefs.current[index];
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
    const positionedCenturies = centuryCenters
      .map((center, index) => ({ center, index }))
      .filter((item) => Number.isFinite(item.center));
    if (!positionedCenturies.length) return;

    let targetSigloIndex = positionedCenturies[0].index;
    const maxScroll = Math.max(0, container.scrollWidth - container.clientWidth);
    const edgeLockDistance = Math.max(24, container.clientWidth * EDGE_LOCK_FACTOR);
    const isNearLeftEdge = container.scrollLeft <= edgeLockDistance;
    const isNearRightEdge = maxScroll - container.scrollLeft <= edgeLockDistance;
    const shouldForceEdgeSelection = isNearLeftEdge || isNearRightEdge;

    if (isNearLeftEdge) {
      targetSigloIndex = positionedCenturies[0].index;
    } else if (isNearRightEdge) {
      targetSigloIndex = positionedCenturies[positionedCenturies.length - 1].index;
    } else {
      for (let index = 0; index < positionedCenturies.length - 1; index += 1) {
        const current = positionedCenturies[index];
        const next = positionedCenturies[index + 1];
        const boundaryX = (current.center + next.center) / 2;

        if (selectionProbeX >= boundaryX) {
          targetSigloIndex = next.index;
        } else {
          break;
        }
      }
    }

    setSigloIdx((prev) => {
      if (prev === targetSigloIndex) return prev;
      const now = window.performance.now();
      if (shouldForceEdgeSelection) {
        lastAutoSigloSwitchAtRef.current = now;
        return targetSigloIndex;
      }

      const isDraggingNow = dragRef.current.isDragging;
      const minSwitchDelay = isDraggingNow ? MIN_AUTO_SIGLO_SWITCH_MS : 0;
      if (now - lastAutoSigloSwitchAtRef.current < minSwitchDelay) return prev;

      const direction = targetSigloIndex > prev ? 1 : -1;
      const candidateIndex =
        isDraggingNow && Math.abs(targetSigloIndex - prev) > 1
          ? prev + direction
          : targetSigloIndex;

      lastAutoSigloSwitchAtRef.current = now;
      return candidateIndex;
    });
  }, []);

  useEffect(() => {
    const container = wrapperRef.current;
    if (!container) return undefined;

    const scheduleProgressUpdate = () => {
      if (deployFrameRef.current !== null) return;
      deployFrameRef.current = window.requestAnimationFrame(() => {
        deployFrameRef.current = null;
        updateExpandedDots();
      });
    };

    scheduleProgressUpdate();
    container.addEventListener('scroll', scheduleProgressUpdate, { passive: true });
    window.addEventListener('resize', scheduleProgressUpdate);

    return () => {
      container.removeEventListener('scroll', scheduleProgressUpdate);
      window.removeEventListener('resize', scheduleProgressUpdate);
      if (deployFrameRef.current !== null) {
        window.cancelAnimationFrame(deployFrameRef.current);
        deployFrameRef.current = null;
      }
    };
  }, [updateExpandedDots]);

  useEffect(() => {
    return () => {
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      if (pendingDotSwitchTimeoutRef.current) {
        window.clearTimeout(pendingDotSwitchTimeoutRef.current);
        pendingDotSwitchTimeoutRef.current = null;
      }
    };
  }, []);

  const handlePointerDown = useCallback((event) => {
    const container = wrapperRef.current;
    if (!container) return;
    container.setPointerCapture?.(event.pointerId);
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startScrollLeft: container.scrollLeft,
      isDragging: true,
      shouldPreventClick: false,
    };
    setIsDragging(true);
  }, []);

  const handlePointerMove = useCallback((event) => {
    const container = wrapperRef.current;
    const dragState = dragRef.current;
    if (!container || !dragState.isDragging || dragState.pointerId !== event.pointerId) return;
    const deltaX = event.clientX - dragState.startX;
    if (!dragState.shouldPreventClick && Math.abs(deltaX) > 4) {
      dragState.shouldPreventClick = true;
    }
    const maxScroll = container.scrollWidth - container.clientWidth;
    const targetScroll = dragState.startScrollLeft - deltaX;
    container.scrollLeft = Math.max(0, Math.min(targetScroll, maxScroll));
  }, []);

  const handlePointerEnd = useCallback((event) => {
    const container = wrapperRef.current;
    const dragState = dragRef.current;
    if (!container || !dragState.isDragging || dragState.pointerId !== event.pointerId) return;
    dragState.isDragging = false;
    container.releasePointerCapture?.(event.pointerId);
    setIsDragging(false);
    updateExpandedDots();
  }, [updateExpandedDots]);

  const handleDotClick = useCallback((entry) => {
    if (dragRef.current.shouldPreventClick) {
      dragRef.current.shouldPreventClick = false;
      return;
    }
    if (pendingDotSwitchTimeoutRef.current) {
      window.clearTimeout(pendingDotSwitchTimeoutRef.current);
      pendingDotSwitchTimeoutRef.current = null;
    }
    setActiveDotKey(entry.key);
    setSigloIdx(entry.sigloIndex);
  }, []);

  const registerCenturyNode = useCallback((index, node) => {
    if (node) {
      centuryRefs.current[index] = node;
      return;
    }

    delete centuryRefs.current[index];
  }, []);

  const registerDotNode = useCallback((key, node) => {
    if (node) {
      dotRefs.current[key] = node;
      return;
    }

    delete dotRefs.current[key];
  }, []);

  const scrollToSigloInTimeline = useCallback((index, behavior = 'smooth', focusRatio = 0.5) => {
    const container = wrapperRef.current;
    const centuryNode = centuryRefs.current[index];
    if (!container || !centuryNode) return;

    const containerRect = container.getBoundingClientRect();
    const centuryRect = centuryNode.getBoundingClientRect();
    const currentCenturyLeft = container.scrollLeft + (centuryRect.left - containerRect.left);
    const clampedFocusRatio = Math.max(0.2, Math.min(0.8, focusRatio));
    const centeredTarget =
      currentCenturyLeft + centuryRect.width / 2 - container.clientWidth * clampedFocusRatio;
    const maxScrollLeft = Math.max(0, container.scrollWidth - container.clientWidth);
    const targetLeft = Math.max(0, Math.min(centeredTarget, maxScrollLeft));
    const shouldReduceMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const resolvedBehavior = behavior === 'smooth' && shouldReduceMotion ? 'auto' : behavior;

    container.scrollTo({ left: targetLeft, behavior: resolvedBehavior });
  }, []);

  const handleSigloClick = useCallback((index) => {
    if (dragRef.current.shouldPreventClick) {
      dragRef.current.shouldPreventClick = false;
      return;
    }
    if (pendingDotSwitchTimeoutRef.current) {
      window.clearTimeout(pendingDotSwitchTimeoutRef.current);
      pendingDotSwitchTimeoutRef.current = null;
    }
    setSigloIdx(index);
    const firstConflict = ORDERED_HISTORIA[index]?.conflictos?.[0];
    if (firstConflict) {
      setActiveDotKey(`dot-${index}-0`);
    }
  }, []);

  const revealTimelineAtSiglo = useCallback((index) => {
    if (revealTimeoutRef.current) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (pendingDotSwitchTimeoutRef.current) {
      window.clearTimeout(pendingDotSwitchTimeoutRef.current);
      pendingDotSwitchTimeoutRef.current = null;
    }

    setForcedRevealSigloIdx(index);
    setSigloIdx(index);

    const firstConflict = ORDERED_HISTORIA[index]?.conflictos?.[0];
    if (firstConflict) {
      pendingDotSwitchTimeoutRef.current = window.setTimeout(() => {
        setActiveDotKey(`dot-${index}-0`);
        pendingDotSwitchTimeoutRef.current = null;
      }, BANDO_EXIT_DOT_SWITCH_DELAY_MS);
    }

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const focusRatio = getSigloFocusRatio(index);
        scrollToSigloInTimeline(index, 'auto', focusRatio);
        updateExpandedDots();
      });
    });

    revealTimeoutRef.current = window.setTimeout(() => {
      setForcedRevealSigloIdx(null);
      updateExpandedDots();
      revealTimeoutRef.current = null;
    }, RETURN_REVEAL_MS);
  }, [scrollToSigloInTimeline, updateExpandedDots]);

  return {
    activeConflictEntry,
    activeDotKey,
    dragRef,
    expandedDotsByKey,
    forcedRevealSigloIdx,
    handleDotClick,
    handlePointerDown,
    handlePointerEnd,
    handlePointerMove,
    handleSigloClick,
    isDragging,
    pendingDotSwitchTimeoutRef,
    registerCenturyNode,
    registerDotNode,
    revealTimelineAtSiglo,
    scrollToSigloInTimeline,
    setActiveDotKey,
    setForcedRevealSigloIdx,
    setSigloIdx,
    sigloIdx,
    updateExpandedDots,
    wrapperRef,
  };
}
