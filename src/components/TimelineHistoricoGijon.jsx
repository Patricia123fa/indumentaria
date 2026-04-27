import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { HISTORIA } from '../data/conflictos';
import BandoPrendaInspector from './BandoPrendaInspector';
import terciosImage from '../assets/tercios.avif';
import sxviiiImage from '../assets/sxviii.avif';
import sxixImage from '../assets/Sxix.avif';
import sxxImage from '../assets/sxx.avif';
import introVideo from '../assets/video/PANTALLA CARGA BATERIA ALTA (2).mp4';
import proyectoTecnicoImage from '../assets/PROYECTOTECNICO.avif';

const romanLabel = (siglo) => siglo.replace(/^S\.?\s*/i, '').trim();
const getImageTitle = (imagePath, fallback = '') => {
  if (!imagePath || typeof imagePath !== 'string') return fallback;
  const filename = imagePath.split('/').pop() ?? '';
  const baseWithoutExt = filename.replace(/\.[^.]+$/, '');
  const baseWithoutHash = baseWithoutExt.replace(/-[A-Za-z0-9_-]{6,}$/, '');
  const normalized = baseWithoutHash.replace(/[_-]+/g, ' ').trim();
  return normalized || fallback;
};
const PREFERRED_SIGLO_ORDER = ['S. XVII', 'S. XVIII', 'S. XIX', 'S. XX'];
const LOOP_COPIES = 1;
const ORDERED_HISTORIA = (() => {
  const ordered = PREFERRED_SIGLO_ORDER.map((label) =>
    HISTORIA.find((siglo) => siglo.siglo === label),
  ).filter(Boolean);
  const remainder = HISTORIA.filter((siglo) => !PREFERRED_SIGLO_ORDER.includes(siglo.siglo));
  return [...ordered, ...remainder];
})();

const CIRCLE_SIZES = [214, 198, 226, 208];
const CONNECTOR_LENGTHS = [170, 150, 185, 165];
const BASE_CONFLICT_CONNECTOR = 178;
const BANDO_STACK_SPACING = 44;
const CONFLICT_NODE_WIDTH = 356;
const SINGLE_CONFLICT_EXTRA_WIDTH = 146;
const CONFLICT_CONNECTOR_LENGTH_OVERRIDES = {
  'defensa-gijon': 192,
  sucesion: 232,
  independencia: 174,
  carlistas: 258,
  'hispano-americana': 214,
  republica: 182,
  'pre-guerra': 238,
  'guerra-civil': 276,
};
const CONFLICT_BANDO_DISTANCE_OFFSETS = {
  carlistas: [-18, 0],
  'guerra-civil': [-18, 0],
};
const CONFLICT_BANDO_SPACING_OVERRIDES = {
  independencia: 78,
};
const OPEN_RADIUS_FACTOR = 0.43;
const CLOSE_RADIUS_FACTOR = 0.48;
const TIMELINE_PADDING_LEFT = 380;
const TIMELINE_PADDING_RIGHT = 220;
const EDGE_LOCK_FACTOR = 0.16;
const SIGLO_SELECTION_PROBE_FACTOR = 0.35;
const MIN_AUTO_SIGLO_SWITCH_MS = 380;
const EDGE_STEP_SWITCH_MS = 260;
const LINE_TRANSITION = 'top 0.65s cubic-bezier(0.22, 1, 0.36, 1), height 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
const LINE_TRANSITION_NO_TOP = 'height 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
const BANDO_APPEAR_OPEN = 'opacity 0.3s ease 0.3s';
const BANDO_APPEAR_CLOSE = 'opacity 0.2s ease';
const BACKGROUND_FADE_MS = 700;
const SIGLO_PILL_WIDTH = 108;
const ACTIVE_CIRCLE_SCALES = [1.36, 1.18, 1.46, 1.3];
const INACTIVE_CIRCLE_SCALES = [0.92, 0.9, 0.92, 0.9];
const FOUR_K_BASE_WIDTH = 1920;
const FOUR_K_MAX_SCALE = 1.6;
const RETURN_REVEAL_MS = 720;
const VIEW_TRANSITION_MS = 420;
const BANDO_EXIT_DOT_SWITCH_DELAY_MS = VIEW_TRANSITION_MS + 24;
const XIX_SIGLO_FOCUS_RATIO = 0.42;
const LAST_SIGLO_FOCUS_RATIO = 0.35;
const MOBILE_BREAKPOINT = 960;
const MOBILE_TIMELINE_SCALE = 0.8;
const MOBILE_LINE_THICKNESS = '1.2cm';
const MOBILE_LINE_HALF_THICKNESS = '0.6cm';
const IDLE_TIMEOUT_MS = 30000;

const hexToRgba = (hex, alpha) => {
  const value = hex?.replace('#', '');
  if (!value) return `rgba(143, 92, 59, ${alpha})`;

  const normalized =
    value.length === 3
      ? value
          .split('')
          .map((char) => char + char)
          .join('')
      : value;

  const intValue = Number.parseInt(normalized, 16);
  if (Number.isNaN(intValue)) return `rgba(143, 92, 59, ${alpha})`;

  const r = (intValue >> 16) & 255;
  const g = (intValue >> 8) & 255;
  const b = intValue & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
};

const buildTimelineEntries = () => {
  const entries = [];
  ORDERED_HISTORIA.forEach((siglo, sigloIndex) => {
    entries.push({ type: 'siglo', sigloIndex });
    (siglo.conflictos ?? []).forEach((_, conflictIndex) => {
      entries.push({ type: 'dot', sigloIndex, conflictIndex, key: `dot-${sigloIndex}-${conflictIndex}` });
    });
  });
  return entries;
};

const TIMELINE_ENTRIES = buildTimelineEntries();
const DOT_ENTRIES = TIMELINE_ENTRIES.filter((entry) => entry.type === 'dot');

const getDefaultDotKey = () => {
  const firstDot = TIMELINE_ENTRIES.find((entry) => entry.type === 'dot');
  return firstDot?.key ?? null;
};

const getConflictConnectorBaseLength = (conflictId, conflictIndex) => {
  const override = CONFLICT_CONNECTOR_LENGTH_OVERRIDES[conflictId];
  if (typeof override === 'number') return override;

  const seed = `${conflictId ?? 'conflict'}-${conflictIndex ?? 0}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return BASE_CONFLICT_CONNECTOR - 18 + (Math.abs(hash) % 84);
};

const getConflictNodeWidth = (sigloIndex) => {
  const conflictCount = ORDERED_HISTORIA[sigloIndex]?.conflictos?.length ?? 0;
  return conflictCount <= 1
    ? CONFLICT_NODE_WIDTH + SINGLE_CONFLICT_EXTRA_WIDTH
    : CONFLICT_NODE_WIDTH;
};

const getViewportScale = (viewportWidth) => {
  if (viewportWidth <= FOUR_K_BASE_WIDTH) return 1;
  const progression = (viewportWidth - FOUR_K_BASE_WIDTH) / FOUR_K_BASE_WIDTH;
  return Math.min(FOUR_K_MAX_SCALE, 1 + progression * 0.6);
};

const toTwoLineLabel = (text) => {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return text;
  const splitIndex = Math.ceil(words.length / 2);
  return `${words.slice(0, splitIndex).join(' ')}\n${words.slice(splitIndex).join(' ')}`;
};

const getSigloFocusRatio = (index) => {
  if (index === ORDERED_HISTORIA.length - 1) return LAST_SIGLO_FOCUS_RATIO;
  if (index === ORDERED_HISTORIA.length - 2) return XIX_SIGLO_FOCUS_RATIO;
  return SIGLO_SELECTION_PROBE_FACTOR;
};

export default function TimelineHistoricoGijon() {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? FOUR_K_BASE_WIDTH : window.innerWidth,
  );
  const [sigloIdx, setSigloIdx] = useState(0);
  const [bandoViewSigloIdx, setBandoViewSigloIdx] = useState(null);
  const [hoveredCenturyIdx, setHoveredCenturyIdx] = useState(null);
  const [selectedBandoIndex, setSelectedBandoIndex] = useState(null);
  const [singleBandoNavSide, setSingleBandoNavSide] = useState('right');
  const [isMobileBandoInfoOpen, setIsMobileBandoInfoOpen] = useState(false);
  const [isMobilePrendaModalOpen, setIsMobilePrendaModalOpen] = useState(false);
  const [mobileHotspotCloseSignal, setMobileHotspotCloseSignal] = useState(0);
  const pendingMobileInfoOpenRef = useRef(false);
  const [mobileInfoButtonTopPx, setMobileInfoButtonTopPx] = useState(null);
  const [expandedCenturyImage, setExpandedCenturyImage] = useState(null);
  const [forcedRevealSigloIdx, setForcedRevealSigloIdx] = useState(null);
  const [activeDotKey, setActiveDotKey] = useState(getDefaultDotKey);
  const [isDragging, setIsDragging] = useState(false);
  const [expandedDotsByKey, setExpandedDotsByKey] = useState(() =>
    Object.fromEntries(DOT_ENTRIES.map((entry) => [entry.key, false])),
  );
  const [baseBackground, setBaseBackground] = useState(ORDERED_HISTORIA[0]?.fondo ?? null);
  const [overlayBackground, setOverlayBackground] = useState(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [isIdleVideoVisible, setIsIdleVideoVisible] = useState(true);
  const wrapperRef = useRef(null);
  const conflictTitleWrapRef = useRef(null);
  const dotRefs = useRef({});
  const centuryRefs = useRef({});
  const deployFrameRef = useRef(null);
  const backgroundFadeTimeoutRef = useRef(null);
  const backgroundFadeRafRef = useRef(null);
  const backgroundQueueRef = useRef([]);
  const isBackgroundTransitionRunningRef = useRef(false);
  const currentBaseBackgroundRef = useRef(ORDERED_HISTORIA[0]?.fondo ?? null);
  const lastQueuedBackgroundRef = useRef(ORDERED_HISTORIA[0]?.fondo ?? null);
  const revealTimeoutRef = useRef(null);
  const pendingDotSwitchTimeoutRef = useRef(null);
  const idleTimeoutRef = useRef(null);
  const idleVideoRef = useRef(null);
  const lastAutoSigloSwitchAtRef = useRef(0);
  const dragRef = useRef({
    pointerId: null,
    startX: 0,
    startScrollLeft: 0,
    isDragging: false,
    shouldPreventClick: false,
  });

  const activeSiglo = ORDERED_HISTORIA[sigloIdx] ?? ORDERED_HISTORIA[0];
  const isBandoView = bandoViewSigloIdx !== null;
  const activeConflictEntry = useMemo(
    () => DOT_ENTRIES.find((entry) => entry.key === activeDotKey) ?? null,
    [activeDotKey],
  );
  const activeConflict = useMemo(() => {
    if (!activeConflictEntry) return null;
    return (
      ORDERED_HISTORIA[activeConflictEntry.sigloIndex]?.conflictos?.[activeConflictEntry.conflictIndex] ??
      null
    );
  }, [activeConflictEntry]);
  const activeConflictBandos = activeConflict?.bandos ?? [];
  const resolvedSelectedBandoIndex = useMemo(() => {
    if (!activeConflictBandos.length) return null;
    if (
      typeof selectedBandoIndex === 'number' &&
      selectedBandoIndex >= 0 &&
      selectedBandoIndex < activeConflictBandos.length
    ) {
      return selectedBandoIndex;
    }
    return 0;
  }, [activeConflictBandos, selectedBandoIndex]);
  const selectedBando =
    resolvedSelectedBandoIndex === null
      ? null
      : activeConflictBandos[resolvedSelectedBandoIndex] ?? null;
  const hasMultipleBandos = activeConflictBandos.length > 1;
  const nextBandoTarget = useMemo(() => {
    if (!hasMultipleBandos || resolvedSelectedBandoIndex === null) return null;
    const total = activeConflictBandos.length;
    const nextIndex = (resolvedSelectedBandoIndex + 1) % total;
    return {
      nextIndex,
      nextName: activeConflictBandos[nextIndex]?.nombre ?? `Bando ${nextIndex + 1}`,
    };
  }, [activeConflictBandos, hasMultipleBandos, resolvedSelectedBandoIndex]);
  const selectedBandoImage = selectedBando?.base ?? null;
  const selectedBandoDescription =
    selectedBando?.descripcion ??
    activeConflict?.descripcionBreve ??
    activeConflict?.detalles?.[0] ??
    'Sin descripcion disponible.';
  const isLongBandoDescription = (selectedBandoDescription?.length ?? 0) > 260;
  const selectedBandoName = selectedBando?.nombre ?? 'Bando';
  const isLongBandoTitle = (selectedBandoName?.length ?? 0) > 15;
  const isIsabelinosTitle = selectedBandoName === 'Isabelinos';
  const isSoldadoLineaTitle = selectedBandoName === 'Soldado de Línea';
  const isSoldado1808Title = selectedBandoName === 'Soldado 1808';
  const isCuartoArtilleriaTitle = selectedBandoName === 'Cuarto regimiento de artillería';
  const isMilicianosTitle = selectedBandoName === 'Milicianos';
  const selectedBandoHotspots = selectedBando?.hotspots ?? activeConflict?.hotspots ?? [];
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
  const showBandoInfoPanel = isBandoView && (!isMobile || (isMobileBandoInfoOpen && !isMobilePrendaModalOpen));
  const clearIdleTimeout = useCallback(() => {
    if (idleTimeoutRef.current) {
      window.clearTimeout(idleTimeoutRef.current);
      idleTimeoutRef.current = null;
    }
  }, []);
  const scheduleIdleMode = useCallback(() => {
    clearIdleTimeout();
    idleTimeoutRef.current = window.setTimeout(() => {
      setIsIdleVideoVisible(true);
    }, IDLE_TIMEOUT_MS);
  }, [clearIdleTimeout]);
  const exitIdleMode = useCallback(() => {
    setIsIdleVideoVisible(false);
    scheduleIdleMode();
  }, [scheduleIdleMode]);
  const registerUserActivity = useCallback(() => {
    if (isIdleVideoVisible) return;
    scheduleIdleMode();
  }, [isIdleVideoVisible, scheduleIdleMode]);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const handleResize = () => setViewportWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
  }, [isIdleVideoVisible]);

  useEffect(() => {
    if (!isBandoView || !isMobile) {
      setIsMobileBandoInfoOpen(false);
    }
  }, [isBandoView, isMobile]);

  useEffect(() => {
    if (isMobilePrendaModalOpen) return;
    if (!pendingMobileInfoOpenRef.current) return;

    pendingMobileInfoOpenRef.current = false;
    setIsMobileBandoInfoOpen(true);
  }, [isMobilePrendaModalOpen]);

  useEffect(() => {
    if (isBandoView) {
      setExpandedCenturyImage(null);
    }
  }, [isBandoView]);

  useEffect(() => {
    if (!isMobile || !isBandoView) {
      setMobileInfoButtonTopPx(null);
      return undefined;
    }

    const frameId = window.requestAnimationFrame(() => {
      const defaultTop = scalePx(96);
      const titleNode = conflictTitleWrapRef.current;
      if (!titleNode) {
        setMobileInfoButtonTopPx(defaultTop);
        return;
      }

      const measuredTop = Math.ceil(titleNode.offsetTop + titleNode.offsetHeight + scalePx(12));
      setMobileInfoButtonTopPx(Math.max(defaultTop, measuredTop));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeConflict?.nombre, isBandoView, isMobile, scalePx, viewportWidth]);

  const runNextBackgroundTransition = useCallback(() => {
    if (backgroundFadeTimeoutRef.current) {
      window.clearTimeout(backgroundFadeTimeoutRef.current);
      backgroundFadeTimeoutRef.current = null;
    }
    if (backgroundFadeRafRef.current) {
      window.cancelAnimationFrame(backgroundFadeRafRef.current);
      backgroundFadeRafRef.current = null;
    }

    const nextBackground = backgroundQueueRef.current.shift();
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
        runNextBackgroundTransition();
      } else {
        isBackgroundTransitionRunningRef.current = false;
        lastQueuedBackgroundRef.current = currentBaseBackgroundRef.current;
      }
    }, BACKGROUND_FADE_MS);
  }, []);

  const enqueueBackgroundTransition = useCallback(
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
        runNextBackgroundTransition();
      }
    },
    [runNextBackgroundTransition],
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
      for (let i = 0; i < positionedCenturies.length - 1; i += 1) {
        const current = positionedCenturies[i];
        const next = positionedCenturies[i + 1];
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
    const targetBackground = activeSiglo?.fondo ?? null;
    enqueueBackgroundTransition(targetBackground);
  }, [activeSiglo, enqueueBackgroundTransition]);

  const blurFocusedElement = useCallback(() => {
    if (typeof document === 'undefined') return;
    const activeElement = document.activeElement;
    if (activeElement && typeof activeElement.blur === 'function') {
      activeElement.blur();
    }
  }, []);

  useEffect(() => {
    return () => {
      if (backgroundFadeTimeoutRef.current) {
        window.clearTimeout(backgroundFadeTimeoutRef.current);
        backgroundFadeTimeoutRef.current = null;
      }
      if (backgroundFadeRafRef.current) {
        window.cancelAnimationFrame(backgroundFadeRafRef.current);
        backgroundFadeRafRef.current = null;
      }
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

  const getConflict = useCallback((entry) => {
    if (entry.type !== 'dot') return null;
    return ORDERED_HISTORIA[entry.sigloIndex]?.conflictos?.[entry.conflictIndex] ?? null;
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

  const closeExpandedCenturyImage = useCallback(() => {
    setExpandedCenturyImage(null);
  }, []);

  const handleCenturyImageClick = useCallback(
    (index, imageSrc, imageAlt, canExpand) => {
      if (dragRef.current.shouldPreventClick) {
        dragRef.current.shouldPreventClick = false;
        return;
      }
      if (canExpand && imageSrc) {
        setExpandedCenturyImage({
          src: imageSrc,
          alt: imageAlt ?? 'Imagen del siglo',
        });
        return;
      }
      handleSigloClick(index);
      if (imageSrc) {
        // Open right after activation so one click is enough.
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            setExpandedCenturyImage({
              src: imageSrc,
              alt: imageAlt ?? 'Imagen del siglo',
            });
          });
        });
      }
    },
    [handleSigloClick],
  );

  useEffect(() => {
    if (!expandedCenturyImage) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setExpandedCenturyImage(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [expandedCenturyImage]);

  const handleBandoClick = useCallback((entry, bandoIndex) => {
    dragRef.current.shouldPreventClick = false;
    if (pendingDotSwitchTimeoutRef.current) {
      window.clearTimeout(pendingDotSwitchTimeoutRef.current);
      pendingDotSwitchTimeoutRef.current = null;
    }
    blurFocusedElement();
    setActiveDotKey(entry.key);
    setSigloIdx(entry.sigloIndex);
    setSelectedBandoIndex(bandoIndex);
    setSingleBandoNavSide('right');
    setIsMobileBandoInfoOpen(false);
    setBandoViewSigloIdx(entry.sigloIndex);
  }, [blurFocusedElement]);

  const handleSingleBandoNav = useCallback(() => {
    if (!nextBandoTarget) return;
    setSelectedBandoIndex(nextBandoTarget.nextIndex);
    setSingleBandoNavSide((prev) => (prev === 'right' ? 'left' : 'right'));
  }, [nextBandoTarget]);

  const handleBackToTimelineAtSiglo = useCallback(
    (index) => {
      if (revealTimeoutRef.current) {
        window.clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
      if (pendingDotSwitchTimeoutRef.current) {
        window.clearTimeout(pendingDotSwitchTimeoutRef.current);
        pendingDotSwitchTimeoutRef.current = null;
      }
      blurFocusedElement();
      setForcedRevealSigloIdx(index);
      setBandoViewSigloIdx(null);
      setSelectedBandoIndex(null);
      setSingleBandoNavSide('right');
      setIsMobileBandoInfoOpen(false);
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
    },
    [blurFocusedElement, scrollToSigloInTimeline, updateExpandedDots],
  );

  const renderCenturyNode = (entry) => {
    const index = entry.sigloIndex;
    const siglo = ORDERED_HISTORIA[index];
    const fallbackTitle = siglo?.etiqueta ?? siglo?.siglo ?? '';
    const centuryCaption = siglo?.pieDeFoto ?? 'Pie de foto. Grabado original de Gijón';
    const isXVII = index === 0;
    const isXVIII = index === 1;
    const isXIX = index === 2;
    const isXX = index === 3;
    const centuryImage = isXVII
      ? terciosImage
      : isXVIII
        ? sxviiiImage
        : isXIX
          ? sxixImage
          : isXX
            ? sxxImage
            : null;
    const isActive = sigloIdx === index;
    const isTop = index % 2 !== 0;
    const sigloAccent = siglo.acento ?? '#8f5c3b';
    const blockBaseSize = scaleTimelinePx(CIRCLE_SIZES[index] ?? 200);
    const activeScale = ACTIVE_CIRCLE_SCALES[index] ?? 2.8;
    const inactiveScale = INACTIVE_CIRCLE_SCALES[index] ?? 0.72;
    const isCenturyHovered = hoveredCenturyIdx === index;
    const effectiveScale = isActive ? activeScale : inactiveScale;
    const displayBlockSize = Math.round(blockBaseSize * effectiveScale);
    const baseBlockWidth = Math.round(displayBlockSize * 0.86);
    const isXVIIICenturyActive = index === 1 && isActive;
    const isXIXCenturyActive = index === 2 && isActive;
    const isXXCenturyActive = index === 3 && isActive;
    const hasHorizontalRectEffect = isXVIIICenturyActive || isXXCenturyActive;
    const horizontalRectWidthFactor = isXVIIICenturyActive
      ? 1.72
      : isXXCenturyActive
        ? 1.56
        : 1;
    const displayBlockWidth = Math.round(baseBlockWidth * horizontalRectWidthFactor);
    const displayBlockHeight = Math.round(displayBlockSize * (isXIXCenturyActive ? 1.3 : 1.38));
    const showCenturyAccent = isCenturyHovered || isActive;
    const halfDisplayBlockWidth = displayBlockWidth / 2;
    const asymmetricLeftShift = 0;
    const imageInset = Math.max(
      scaleTimelinePx(14),
      Math.round(Math.min(displayBlockWidth, displayBlockHeight) * 0.15),
    );
    const imageHoleSize = Math.max(
      scaleTimelinePx(72),
      Math.min(displayBlockWidth, displayBlockHeight) - imageInset * 2,
    );
    const imageHoleWidth = hasHorizontalRectEffect ? Math.round(imageHoleSize * 1.2) : imageHoleSize;
    const imageHoleHeight = hasHorizontalRectEffect ? Math.round(imageHoleSize * 0.86) : imageHoleSize;
    const centuryImageTitle = getImageTitle(centuryImage, fallbackTitle);
    const activeCenturyTitleOffset = Math.round(imageHoleHeight / 2 + scaleTimelinePx(isMobile ? 10 : 12));
    const pillWidth = scaleTimelinePx(SIGLO_PILL_WIDTH);
    const pillDisplayWidth = Math.max(pillWidth, Math.round(displayBlockWidth * 0.94));
    const centerMaskWidth = displayBlockWidth + scaleTimelinePx(isMobile ? 68 : 96);
    const timelineHalfThickness = timelineLineHalfThickness;
    const pillBorderWidth = isMobile ? 4 : 6;

    return (
      <div
        key={`siglo-${index}`}
        className="relative flex h-full items-center justify-center"
        style={{ width: `${scaleTimelinePx(220)}px` }}
        ref={(node) => {
          if (node) {
            centuryRefs.current[index] = node;
          } else {
            delete centuryRefs.current[index];
          }
        }}
      >
        <button
          type="button"
          onClick={() => handleSigloClick(index)}
          aria-pressed={isActive}
          className="absolute left-1/2 top-1/2 z-20 rounded-none px-5 py-1 text-center font-bold tracking-[0.5em] uppercase transition-all duration-300"
          style={{
            width: `${pillDisplayWidth}px`,
            padding: `${scaleTimelinePx(4)}px ${scaleTimelinePx(20)}px`,
            fontSize: `${(1.08 * viewportScale * (isMobile ? 0.86 : 1)).toFixed(3)}rem`,
            fontWeight: 900,
            WebkitTextStroke: isActive ? '0.55px #000' : '0.32px currentColor',
            textShadow: isActive ? '0 0 0 #000' : 'none',
            border: isActive
              ? `${pillBorderWidth}px solid ${sigloAccent}`
              : `${pillBorderWidth}px solid rgba(0, 0, 0, 0.95)`,
            backgroundColor: isActive ? sigloAccent : 'rgb(0, 0, 0)',
            color: isActive ? '#000' : '#fff8f1',
            boxShadow: isActive
              ? `0 0 0 5px ${hexToRgba(sigloAccent, 0.22)}, 0 10px 24px rgba(36, 24, 16, 0.35)`
              : '0 8px 16px rgba(0, 0, 0, 0.28)',
            transform: 'translate(-50%, -50%)',
          }}
        >
          {romanLabel(siglo.siglo)}
        </button>

        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-1/2 top-1/2 z-10 -translate-x-1/2 -translate-y-1/2 bg-black"
          style={{
            width: `${centerMaskWidth}px`,
            height: timelineLineThickness,
          }}
        />

        <button
          type="button"
          onClick={() => handleCenturyImageClick(index, centuryImage, centuryCaption, isActive)}
          onPointerDown={(event) => {
            event.stopPropagation();
            dragRef.current.shouldPreventClick = false;
          }}
          onMouseEnter={() => setHoveredCenturyIdx(index)}
          onMouseLeave={() =>
            setHoveredCenturyIdx((prev) => (prev === index ? null : prev))
          }
          onFocus={() => setHoveredCenturyIdx(index)}
          onBlur={() =>
            setHoveredCenturyIdx((prev) => (prev === index ? null : prev))
          }
          className="absolute z-[5]"
          aria-pressed={isActive}
          style={{
            width: `${displayBlockWidth}px`,
            left: `calc(50% - ${halfDisplayBlockWidth + asymmetricLeftShift}px)`,
            top: isTop ? '0px' : `calc(50% + ${timelineHalfThickness})`,
            bottom: isTop ? `calc(50% + ${timelineHalfThickness})` : '0px',
            boxSizing: 'border-box',
            borderRadius: '0px',
            backgroundColor: showCenturyAccent ? sigloAccent : 'rgb(0, 0, 0)',
            boxShadow: showCenturyAccent
              ? `0 0 0 8px ${hexToRgba(sigloAccent, 0.2)}, 0 28px 60px rgba(15, 12, 10, 0.45)`
              : '0 12px 28px rgba(0, 0, 0, 0.42)',
            transition:
              'width 0.35s ease, height 0.35s ease, left 0.35s ease, top 0.35s ease, bottom 0.35s ease, border-radius 0.3s ease, box-shadow 0.3s ease, background-color 0.3s ease',
          }}
        >
          <span
            className="absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2"
            style={{
              width: `${imageHoleWidth}px`,
              height: `${imageHoleHeight}px`,
              backgroundColor: centuryImage ? 'transparent' : '#fff',
              backgroundImage: centuryImage ? `url(${centuryImage})` : 'none',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              opacity: 1,
              transition: 'width 0.35s ease, height 0.35s ease',
            }}
          />
          {isActive && centuryImageTitle && (
            <span
              className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 font-semibold"
              style={{
                top: `calc(50% + ${activeCenturyTitleOffset}px)`,
                width: `${Math.max(imageHoleWidth, scaleTimelinePx(isMobile ? 94 : 120))}px`,
                fontSize: `${((isMobile ? 0.56 : 0.64) * viewportScale).toFixed(3)}rem`,
                letterSpacing: '0.02em',
                lineHeight: 1,
                fontFamily: '"Mulish", sans-serif',
                color: '#050505',
                textAlign: 'right',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                textShadow: 'none',
                opacity: 0.95,
              }}
            >
              {centuryCaption}
            </span>
          )}
        </button>
      </div>
    );
  };

  const renderConflictDot = (entry) => {
    const conflict = getConflict(entry);
    if (!conflict) return null;
    const isActive = activeDotKey === entry.key;
    const isTop = conflict.posicion === 'top';
    const bandos = conflict.bandos ?? [];
    const isExpanded =
      forcedRevealSigloIdx === entry.sigloIndex ||
      Boolean(expandedDotsByKey[entry.key]);
    const bandoCount = Math.max(1, bandos.length);
    const connectorBaseLength = scaleTimelinePx(getConflictConnectorBaseLength(conflict.id, entry.conflictIndex));
    const bandoSpacing = scaleTimelinePx(
      CONFLICT_BANDO_SPACING_OVERRIDES[conflict.id] ?? BANDO_STACK_SPACING,
    );
    const extensionLength = connectorBaseLength + Math.max(0, bandoCount - 1) * bandoSpacing;
    const visibleLength = isExpanded ? extensionLength : 0;
    const bandoOffsets = CONFLICT_BANDO_DISTANCE_OFFSETS[conflict.id] ?? [];
    const showSingleSideBandoLabelRight =
      conflict.id === 'defensa-gijon' ||
      conflict.id === 'sucesion' ||
      conflict.id === 'independencia' ||
      conflict.id === 'republica' ||
      conflict.id === 'pre-guerra';
    const showSplitTwoSidedLabels =
      conflict.id === 'carlistas' ||
      conflict.id === 'hispano-americana' ||
      conflict.id === 'guerra-civil';

    const getBandoTop = (index) => {
      if (!isExpanded) return 0;
      const scaledOffset = scaleTimelinePx(bandoOffsets[index] ?? 0);
      const distanceFromAxis =
        bandoCount === 1
          ? extensionLength
          : Math.max(
              0,
              Math.min(
                extensionLength,
                connectorBaseLength + index * bandoSpacing + scaledOffset,
              ),
            );
      return isTop ? visibleLength - distanceFromAxis : distanceFromAxis;
    };

    const nodeWidth = scaleTimelinePx(getConflictNodeWidth(entry.sigloIndex));
    const conflictCenturyAccent = ORDERED_HISTORIA[entry.sigloIndex]?.acento ?? '#fff8f1';
    const bandoMarkerSize = isMobile ? 24 : 20;
    const bandoInnerSize = isMobile ? 16 : 14;
    const bandoBorderWidth = isMobile ? 5 : 6;
    const conflictPillFontFactor = isMobile ? 0.68 : 1;
    const conflictPillPaddingY = isMobile ? 1 : 4;
    const conflictPillPaddingX = isMobile ? 10 : 20;
    const conflictPillLineHeight = isMobile ? 1.05 : 1.28;

    return (
      <div key={entry.key} className="relative flex h-full items-center justify-center" style={{ width: `${nodeWidth}px` }}>
        <button
          type="button"
          onClick={() => handleDotClick(entry)}
          className="absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 cursor-pointer"
          aria-label={conflict.nombre}
          ref={(node) => {
            if (node) {
              dotRefs.current[entry.key] = node;
            } else {
              delete dotRefs.current[entry.key];
            }
          }}
        >
          <span
            className="absolute left-1/2 top-1/2 block h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-[6px] border-black/80 bg-white/55"
            style={{ opacity: isActive && entry.conflictIndex !== 0 ? 1 : 0 }}
          />
          <span className="relative block h-4 w-4 rounded-full bg-black" />
        </button>

        <span
          className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-[4px] px-5 py-1 text-center text-[0.82rem] font-bold uppercase tracking-[0.08em]"
          style={
            {
              padding: `${scaleTimelinePx(conflictPillPaddingY)}px ${scaleTimelinePx(conflictPillPaddingX)}px`,
              fontSize: `${(0.82 * viewportScale * conflictPillFontFactor).toFixed(3)}rem`,
              lineHeight: conflictPillLineHeight,
              color: conflictCenturyAccent,
              backgroundColor: '#000',
              boxShadow: '0 8px 18px rgba(20, 14, 10, 0.22)',
              textShadow: 'none',
            }
          }
        >
          {conflict.nombre}
        </span>

        <div
          className="pointer-events-none absolute left-1/2 z-10 -translate-x-1/2"
          style={
            isTop
              ? {
                  top: `calc(50% - ${visibleLength}px)`,
                  height: `${visibleLength}px`,
                  transition: LINE_TRANSITION,
                }
              : { top: '50%', height: `${visibleLength}px`, transition: LINE_TRANSITION_NO_TOP }
          }
        >
          <span
            className="absolute left-1/2 top-0 h-full -translate-x-1/2 bg-black/85"
            style={{ width: `${isMobile ? 4 : 6}px` }}
          />
          {Array.from({ length: bandoCount }).map((_, index) => {
            const bandoName = bandos[index]?.nombre ?? `Bando ${index + 1}`;
            const labelSide = showSplitTwoSidedLabels
              ? (bandos[index]?.alineacion === 'left' ? 'left' : 'right')
              : (showSingleSideBandoLabelRight ? 'right' : null);
            const bandoLabelText = labelSide ? toTwoLineLabel(bandoName) : bandoName;
            return (
              <button
                type="button"
                key={`${entry.key}-bando-${index}`}
                onPointerDown={(event) => event.stopPropagation()}
                onClick={() => handleBandoClick(entry, index)}
                className="absolute left-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-[2px] border-[6px] border-black/80 bg-white/55 pointer-events-auto cursor-pointer"
                style={{
                  top: `${getBandoTop(index)}px`,
                  width: `${bandoMarkerSize}px`,
                  height: `${bandoMarkerSize}px`,
                  borderWidth: `${bandoBorderWidth}px`,
                  opacity: isExpanded ? 1 : 0,
                  transition: isExpanded ? BANDO_APPEAR_OPEN : BANDO_APPEAR_CLOSE,
                }}
                title={bandoName}
                aria-label={bandoName}
              >
                <span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] timeline-click-halo"
                  style={{ width: `${bandoInnerSize}px`, height: `${bandoInnerSize}px` }}
                />
                <span
                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[2px] bg-black timeline-dot-core"
                  style={{ width: `${bandoInnerSize}px`, height: `${bandoInnerSize}px` }}
                />
                {labelSide && (
                  <span
                    className={`pointer-events-none absolute top-1/2 text-[0.82rem] font-bold uppercase tracking-[0.08em] text-black ${labelSide === 'right' ? 'left-full' : 'right-full'}`}
                    style={{
                      marginLeft: labelSide === 'right' ? `${scaleTimelinePx(10)}px` : '0px',
                      marginRight: labelSide === 'left' ? `${scaleTimelinePx(10)}px` : '0px',
                      transform: 'translateY(-50%)',
                      width: `${scaleTimelinePx(isMobile ? 118 : 148)}px`,
                      fontSize: `${(0.82 * viewportScale * (isMobile ? 0.85 : 1)).toFixed(3)}rem`,
                      whiteSpace: 'pre-line',
                      lineHeight: 1.28,
                      textAlign: labelSide === 'right' ? 'left' : 'right',
                      textShadow: 'none',
                      opacity: isExpanded ? 1 : 0,
                      transition: 'opacity 0.25s ease',
                    }}
                  >
                    {bandoLabelText}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="relative h-screen min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: baseBackground ? `url(${baseBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {overlayBackground && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${overlayBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: overlayOpacity,
            transition: `opacity ${BACKGROUND_FADE_MS}ms ease`,
          }}
        />
      )}
      <div className="relative h-full w-full">
        <div
          className="absolute inset-0"
          aria-hidden={isBandoView}
          style={{
            opacity: isBandoView ? 0 : 1,
            transform: isBandoView ? 'translateY(-10px) scale(0.995)' : 'translateY(0) scale(1)',
            filter: isBandoView ? 'blur(2px)' : 'blur(0px)',
            transition: `opacity ${VIEW_TRANSITION_MS}ms ease, transform ${VIEW_TRANSITION_MS}ms ease, filter ${VIEW_TRANSITION_MS}ms ease`,
            pointerEvents: isBandoView ? 'none' : 'auto',
          }}
        >
          <span
            className="absolute inset-x-0 top-1/2 z-0 -translate-y-1/2"
            style={{ height: timelineLineThickness, backgroundColor: '#000' }}
          />

          <div
            ref={wrapperRef}
            className={`timeline-scroll relative z-10 flex h-full w-full overflow-x-auto overflow-y-visible ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
            style={{
              WebkitOverflowScrolling: 'touch',
              touchAction: 'pan-x',
              scrollbarWidth: 'none',
              msOverflowStyle: 'none',
            }}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerEnd}
            onPointerCancel={handlePointerEnd}
            onPointerLeave={handlePointerEnd}
          >
            {Array.from({ length: LOOP_COPIES }).map((_, copyIndex) => (
              <div
                key={`copy-${copyIndex}`}
                className="flex min-w-full shrink-0 items-center"
                style={{
                  paddingLeft: `${isMobile ? scalePx(148) : scalePx(TIMELINE_PADDING_LEFT)}px`,
                  paddingRight: `${isMobile ? scalePx(108) : scalePx(TIMELINE_PADDING_RIGHT)}px`,
                }}
              >
                {TIMELINE_ENTRIES.map((entry) =>
                  entry.type === 'siglo' ? renderCenturyNode(entry) : renderConflictDot(entry),
                )}
              </div>
            ))}
          </div>

          <span
            className="timeline-swipe-hint pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-center font-semibold uppercase tracking-[0.12em] text-[#fff8f1]"
            style={{
              color: 'rgba(255, 248, 241, 0.56)',
              fontSize: `${((isMobile ? 0.78 : 0.95) * viewportScale).toFixed(3)}rem`,
              whiteSpace: isMobile ? 'normal' : 'nowrap',
              maxWidth: isMobile ? `${scalePx(250)}px` : 'none',
              textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
            }}
          >
            {'<- desliza la pantalla ->'}
          </span>
        </div>

        <div
          className="absolute inset-0 z-20"
          aria-hidden={!isBandoView}
          style={{
            opacity: isBandoView ? 1 : 0,
            transform: isBandoView ? 'translateY(0px) scale(1)' : 'translateY(12px) scale(0.99)',
            filter: isBandoView ? 'blur(0px)' : 'blur(2px)',
            transition: `opacity ${VIEW_TRANSITION_MS}ms ease, transform ${VIEW_TRANSITION_MS}ms ease, filter ${VIEW_TRANSITION_MS}ms ease`,
            pointerEvents: isBandoView ? 'auto' : 'none',
          }}
        >
          <div
            ref={conflictTitleWrapRef}
            className="pointer-events-none absolute inset-x-0 top-8 z-20 flex justify-center px-6"
          >
            <div
              className="rounded-none border px-6 py-2 text-center"
              style={{
                backgroundColor: hexToRgba(activeSiglo?.acento ?? '#7b8465', 0.76),
                borderColor: hexToRgba(activeSiglo?.acento ?? '#7b8465', 0.54),
                borderWidth: `${isMobile ? 2 : 3}px`,
                boxShadow: '0 0 16px rgba(255, 255, 255, 0.28), 0 8px 20px rgba(0, 0, 0, 0.28)',
              }}
            >
              <p className="text-[0.9rem] font-black uppercase tracking-[0.3em] text-[#050505]">
                {activeConflict?.nombre ?? 'BANDOS'}
              </p>
            </div>
          </div>

          {isMobile && isBandoView && (
            <div
              className="absolute inset-x-0 flex justify-center px-6"
              style={{
                top: `${mobileInfoButtonTopPx ?? scalePx(96)}px`,
                zIndex: isMobilePrendaModalOpen ? 95 : 30,
              }}
            >
              <button
                type="button"
                onClick={() => {
                  if (isMobilePrendaModalOpen) {
                    pendingMobileInfoOpenRef.current = true;
                    setMobileHotspotCloseSignal((prev) => prev + 1);
                    return;
                  }
                  setIsMobileBandoInfoOpen((prev) => !prev);
                }}
                className="pointer-events-auto rounded-[3px] border uppercase tracking-[0.14em]"
                style={{
                  padding: `${scalePx(6)}px ${scalePx(12)}px`,
                  fontSize: `${(0.72 * viewportScale).toFixed(3)}rem`,
                  fontWeight: 700,
                  color: '#050505',
                  backgroundColor: hexToRgba(activeSiglo?.acento ?? '#7b8465', 0.74),
                  borderColor: hexToRgba(activeSiglo?.acento ?? '#7b8465', 0.88),
                  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.24)',
                  position: 'relative',
                  zIndex: 1,
                }}
                aria-expanded={isMobileBandoInfoOpen}
                aria-controls="mobile-bando-info-panel"
              >
                {isMobileBandoInfoOpen ? 'ocultar info' : '+ info'}
              </button>
            </div>
          )}

          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 z-[25]"
            style={{
              height: timelineLineThickness,
              backgroundColor: '#000',
            }}
          />

          {nextBandoTarget && (
            <button
              type="button"
              onClick={handleSingleBandoNav}
              className={`pointer-events-auto absolute flex items-center gap-2 rounded-[3px] border uppercase transition-all duration-200 ${singleBandoNavSide === 'right' ? 'justify-end' : 'justify-start'}`}
              style={{
                ...(singleBandoNavSide === 'right'
                  ? { right: `${scalePx(isMobile ? 10 : 12)}px` }
                  : { left: `${scalePx(isMobile ? 10 : 12)}px` }),
                ...(isMobile
                  ? {
                      top: 'auto',
                      bottom: `calc(${timelineLineThickness} + ${scalePx(8)}px)`,
                      transform: 'none',
                    }
                  : {
                      top: `calc(100% - ${timelineLineHalfThickness})`,
                      transform: 'translateY(-50%)',
                    }),
                minWidth: `${scalePx(isMobile ? 120 : 214)}px`,
                maxWidth: isMobile ? '42vw' : `min(${scalePx(320)}px, 26vw)`,
                padding: `${scalePx(isMobile ? 5 : 9)}px ${scalePx(isMobile ? 8 : 12)}px`,
                backgroundColor: hexToRgba(activeSiglo?.acento ?? '#8f5c3b', isMobile ? 0.66 : 0.74),
                color: isMobile ? '#050505' : '#fff8f1',
                borderColor: hexToRgba(activeSiglo?.acento ?? '#8f5c3b', isMobile ? 0.78 : 0.85),
                borderWidth: '1px',
                boxShadow: `0 0 0 1px ${hexToRgba(activeSiglo?.acento ?? '#8f5c3b', 0.2)}, 0 4px 10px rgba(0, 0, 0, 0.24)`,
                fontSize: `${((isMobile ? 0.56 : 0.82) * viewportScale).toFixed(3)}rem`,
                letterSpacing: isMobile ? '0.06em' : '0.16em',
                zIndex: isMobilePrendaModalOpen ? 80 : 40,
                opacity: isMobilePrendaModalOpen ? 0.18 : 1,
                pointerEvents: isMobilePrendaModalOpen ? 'none' : 'auto',
              }}
              aria-label={`Ir al bando ${nextBandoTarget.nextName}`}
              title={nextBandoTarget.nextName}
            >
              {singleBandoNavSide === 'left' && (
                <span style={{ fontSize: `${((isMobile ? 0.72 : 1.1) * viewportScale).toFixed(3)}rem`, lineHeight: 1 }}>{'<'}</span>
              )}
              <span className={`truncate font-semibold ${singleBandoNavSide === 'right' ? 'text-right' : 'text-left'}`}>
                {nextBandoTarget.nextName}
              </span>
              {singleBandoNavSide === 'right' && (
                <span style={{ fontSize: `${((isMobile ? 0.72 : 1.1) * viewportScale).toFixed(3)}rem`, lineHeight: 1 }}>{'>'}</span>
              )}
            </button>
          )}

          <div
            className={`absolute inset-0 z-10 flex items-center justify-center px-6 ${
              isBandoView ? 'pointer-events-auto' : 'pointer-events-none'
            }`}
          >
            {selectedBandoImage ? (
              <BandoPrendaInspector
                imageSrc={selectedBandoImage}
                bandoName={selectedBando?.nombre ?? 'Bando'}
                hotspots={selectedBandoHotspots}
                showArrows={!selectedBando?.hideArrows}
                accentColor={activeSiglo?.acento ?? '#7b8465'}
                isMobile={isMobile}
                viewportScale={viewportScale}
                mainImageOverlayHotspots={
                  selectedBando?.overlayHotspots
                    ?? (selectedBando?.overlayHotspot ? [selectedBando.overlayHotspot] : null)
                }
                imageScaleMultiplier={isCuartoArtilleriaTitle ? 2 : 1}
                mainImageScaleMultiplier={
                  isCuartoArtilleriaTitle
                    ? 1.1
                    : isIsabelinosTitle
                      ? 1.06
                      : isSoldado1808Title
                        ? 1.06
                        : isSoldadoLineaTitle
                          ? 1.05
                          : isMilicianosTitle
                            ? 1.05
                            : 1
                }
                mainImageOffsetY={
                  isCuartoArtilleriaTitle
                    ? '-3%'
                    : isIsabelinosTitle
                      ? '-1%'
                      : isSoldado1808Title
                        ? '-1%'
                        : isSoldadoLineaTitle
                          ? '-1%'
                      : isMilicianosTitle
                            ? '-1%'
                            : '0%'
                }
                onMobileHotspotModalChange={(isOpen) => {
                  setIsMobilePrendaModalOpen(isOpen);
                  if (isOpen) {
                    setIsMobileBandoInfoOpen(false);
                  }
                }}
                closeMobileHotspotSignal={mobileHotspotCloseSignal}
              />
            ) : (
              <span className="text-[0.76rem] font-semibold uppercase tracking-[0.3em] text-[#fff8f1] opacity-85">
                SIN IMAGEN
              </span>
            )}
          </div>

          <div
            id="mobile-bando-info-panel"
            className={`absolute z-20 overflow-visible border border-transparent ${
              isMobile ? 'rounded-none' : 'rounded-none border-l-0'
            }`}
            style={{
              top: 'auto',
              bottom: isMobile ? `calc(${timelineLineThickness} + ${scalePx(54)}px)` : timelineLineThickness,
              transform: showBandoInfoPanel
                ? (isMobile ? 'translateX(-50%) translateY(0)' : 'translateX(-12%)')
                : (isMobile
                    ? 'translateX(-50%) translateY(20px)'
                    : 'translateX(calc(-112% - 56px))'),
              width: isMobile ? `min(${scalePx(460)}px, 92vw)` : `min(${scalePx(520)}px, 46vw)`,
              minWidth: isMobile ? `${scalePx(248)}px` : `${scalePx(320)}px`,
              height: isMobile
                ? `min(${scalePx(280)}px, 34vh)`
                : `calc(min(${scalePx(620)}px, 82vh) - 2cm)`,
              minHeight: isMobile
                ? `${scalePx(160)}px`
                : `calc(${scalePx(320)}px - 2cm)`,
              left: isMobile ? '50%' : '0px',
              background: `linear-gradient(180deg, ${hexToRgba(activeSiglo?.acento ?? '#7b8465', 0.66)} 0%, ${hexToRgba(activeSiglo?.acento ?? '#7b8465', 0.58)} 100%)`,
              borderColor: hexToRgba(activeSiglo?.acento ?? '#7b8465', 0.5),
              borderWidth: `${isMobile ? 2 : 2}px`,
              backdropFilter: 'blur(6px) saturate(108%)',
              WebkitBackdropFilter: 'blur(6px) saturate(108%)',
              opacity: showBandoInfoPanel ? 1 : 0,
              boxShadow: isMobile
                ? '0 0 18px rgba(255,255,255,0.26), 0 8px 16px rgba(0,0,0,0.2)'
                : '0 0 24px rgba(255,255,255,0.24), 0 12px 24px rgba(0,0,0,0.22)',
              transition: `opacity ${VIEW_TRANSITION_MS}ms ease, transform ${VIEW_TRANSITION_MS}ms ease`,
              pointerEvents: showBandoInfoPanel ? 'auto' : 'none',
            }}
          >
            {!isMobile && (
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 left-0 w-5"
                style={{
                  width: `${scalePx(6)}px`,
                  background: 'rgba(0, 0, 0, 0.24)',
                }}
              />
            )}
            <div
              className="relative flex h-full min-h-0 flex-col gap-3 px-6 py-5 text-[#050505]"
              style={{
                paddingLeft: isMobile ? `calc(${scalePx(18)}px + 8%)` : `calc(${scalePx(24)}px + 12%)`,
                paddingRight: `${scalePx(isMobile ? 14 : 24)}px`,
                paddingTop: `${scalePx(isMobile ? (isLongBandoTitle ? 84 : 64) : (isLongBandoTitle ? 132 : 98))}px`,
              }}
            >
              <p
                className="font-black uppercase"
                style={{
                  position: 'absolute',
                  top: isCuartoArtilleriaTitle ? '-1.3em' : '-0.52em',
                  left: isMobile ? `calc(${scalePx(18)}px + 8%)` : `calc(${scalePx(24)}px + 12%)`,
                  right: `${scalePx(isMobile ? 14 : 24)}px`,
                  transform: 'none',
                  zIndex: 4,
                  fontSize: `${((isMobile ? (isLongBandoTitle ? 1.95 : 2.3) : (isLongBandoTitle ? 2.65 : 3.25)) * viewportScale).toFixed(3)}rem`,
                  lineHeight: 1.02,
                  letterSpacing: '0.08em',
                  marginTop: '0px',
                  color: '#000',
                  WebkitTextStroke: '0.3px #000',
                  whiteSpace: 'normal',
                  textWrap: 'balance',
                  textShadow: '0 4px 12px rgba(0, 0, 0, 0.28)',
                }}
              >
                {selectedBandoName}
              </p>
              <p
                className="min-h-0 flex-1 overflow-y-auto pr-1 font-semibold"
              style={{
                  fontSize: `${((isMobile ? (isLongBandoDescription ? 0.86 : 0.94) : (isLongBandoDescription ? 1.0 : 1.12)) * viewportScale).toFixed(3)}rem`,
                  lineHeight: isLongBandoDescription ? 1.52 : isMobile ? 1.48 : 1.6,
                  fontFamily: '"Mulish", sans-serif',
                  color: '#050505',
                  textTransform: 'none',
                  whiteSpace: 'pre-line',
                  textWrap: 'pretty',
                  textShadow: 'none',
                }}
              >
                {selectedBandoDescription}
              </p>
            </div>
          </div>
        </div>

        <div
          className="pointer-events-none absolute inset-x-0 z-30 flex justify-center px-4"
          aria-hidden={!isBandoView}
          style={{
            opacity: isBandoView ? 1 : 0,
            top: `calc(100% - ${timelineLineHalfThickness})`,
            bottom: 'auto',
            transform: isBandoView ? 'translateY(-50%)' : 'translateY(calc(-50% + 14px))',
            paddingLeft: `${scalePx(8)}px`,
            paddingRight: `${scalePx(8)}px`,
            transition: `opacity ${VIEW_TRANSITION_MS}ms ease, transform ${VIEW_TRANSITION_MS}ms ease`,
            pointerEvents: 'none',
          }}
        >
          <div
            className={`pointer-events-auto flex items-center justify-center gap-2 ${isMobile ? 'flex-nowrap' : 'flex-wrap'}`}
            style={{
              padding: `${scalePx(isMobile ? 3 : 4)}px`,
              maxWidth: '100%',
              overflowX: isMobile ? 'auto' : 'visible',
            }}
          >
            {ORDERED_HISTORIA.map((siglo, index) => {
              const isActiveSiglo = index === sigloIdx;
              const sigloAccent = siglo.acento ?? '#8f5c3b';
              return (
                <button
                  key={`bando-view-siglo-${siglo.siglo}-${index}`}
                  type="button"
                  onClick={() => handleBackToTimelineAtSiglo(index)}
                  className="rounded-[3px] border px-3 py-[3px] text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition-all duration-200"
                  style={{
                    padding: `${scalePx(isMobile ? 2 : 3)}px ${scalePx(isMobile ? 8 : 12)}px`,
                    fontSize: `${((isMobile ? 0.62 : 0.72) * viewportScale).toFixed(3)}rem`,
                    borderColor: isActiveSiglo ? hexToRgba(sigloAccent, 0.85) : 'rgba(255, 255, 255, 0.34)',
                    backgroundColor: isActiveSiglo
                      ? hexToRgba(sigloAccent, 0.74)
                      : 'rgba(0, 0, 0, 0.3)',
                    color: '#fff8f1',
                    boxShadow: isActiveSiglo
                      ? `0 0 0 1px ${hexToRgba(sigloAccent, 0.2)}, 0 4px 10px rgba(0, 0, 0, 0.24)`
                      : '0 3px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  {romanLabel(siglo.siglo)}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {expandedCenturyImage && (
        <div
          role="dialog"
          aria-modal="true"
          className="absolute inset-0 z-[80] flex items-center justify-center bg-black/72 px-4"
          onClick={closeExpandedCenturyImage}
        >
          <button
            type="button"
            aria-label="Cerrar imagen ampliada"
            onClick={closeExpandedCenturyImage}
            className="absolute right-4 top-4 z-[82] rounded-[2px] border border-white/55 bg-black/46 px-3 py-1 text-sm font-semibold text-[#fff8f1]"
          >
            Cerrar
          </button>
          <img
            src={expandedCenturyImage.src}
            alt={expandedCenturyImage.alt}
            className="z-[81] object-contain"
            style={{
              width: 'min(92vw, 1800px)',
              maxHeight: '90vh',
              height: 'auto',
              filter: 'drop-shadow(0 14px 28px rgba(0, 0, 0, 0.46))',
            }}
            onClick={(event) => event.stopPropagation()}
          />
        </div>
      )}

      {isIdleVideoVisible && (
        <div
          className="timeline-idle-overlay"
          role="button"
          tabIndex={0}
          onPointerDown={exitIdleMode}
          onKeyDown={(event) => {
            if (event.key === 'Enter' || event.key === ' ') {
              event.preventDefault();
              exitIdleMode();
            }
          }}
          aria-label="Iniciar interactivo"
        >
          <video
            ref={idleVideoRef}
            className="timeline-idle-video"
            src={introVideo}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden="true"
          />
          <div className="timeline-idle-overlay-content" aria-hidden="true">
            {'TOCA LA PANTALLA'}
          </div>
        </div>
      )}

      {!isIdleVideoVisible && (
        <img
          src={proyectoTecnicoImage}
          alt="Proyecto técnico"
          className="timeline-proyectotecnico-badge"
          draggable="false"
        />
      )}
    </div>
  );
}

