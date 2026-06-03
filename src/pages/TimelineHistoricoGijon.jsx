import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  BANDO_EXIT_DOT_SWITCH_DELAY_MS,
  CLOSE_RADIUS_FACTOR,
  collectBandoImageSources,
  DOT_ENTRIES,
  EDGE_LOCK_FACTOR,
  FOUR_K_BASE_WIDTH,
  getDefaultDotKey,
  getSigloFocusRatio,
  getViewportScale,
  MIN_AUTO_SIGLO_SWITCH_MS,
  MOBILE_BREAKPOINT,
  MOBILE_LINE_HALF_THICKNESS,
  MOBILE_LINE_THICKNESS,
  MOBILE_TIMELINE_SCALE,
  OPEN_RADIUS_FACTOR,
  ORDERED_HISTORIA,
  preloadImageSource,
  RETURN_REVEAL_MS,
  SIGLO_SELECTION_PROBE_FACTOR,
} from '../data/timelineData.jsx';import { CenturyImageModal, CreditsOverlay, IdleOverlay } from '../components/timeline/TimelineOverlays';
import { BackgroundLayers, BandoViewLayer, CreditsButton, TimelineScrollLayer } from '../components/timeline/TimelineViews';
import { CenturyNode, ConflictDot } from '../components/timeline/TimelineNodes';
import { useBackgroundTransition } from '../hooks/timeline/useBackgroundTransition';
import { useTimelineIdle } from '../hooks/timeline/useTimelineIdle';
import terciosImage from '../assets/infanteria_fondo.webp';
import sxviiiImage from '../assets/sxviii_mejorada.webp';
import sxixImage from '../assets/19_foto.webp';
import sxxImage from '../assets/20_foto.webp';
import casitaNegraIcon from '../assets/casita-negra.png';
import infoIcon from '../assets/info.png';


/**
 * Componente principal de la línea de tiempo histórica de Gijón.
 *
 * @returns {JSX.Element}
 */
export default function TimelineHistoricoGijon() {
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === 'undefined' ? FOUR_K_BASE_WIDTH : window.innerWidth,
  );
  const [sigloIdx, setSigloIdx] = useState(0);
  const [bandoViewSigloIdx, setBandoViewSigloIdx] = useState(null);
  const [hoveredCenturyIdx, setHoveredCenturyIdx] = useState(null);
  const [selectedBandoIndex, setSelectedBandoIndex] = useState(null);
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
  const [isCreditsOverlayOpen, setIsCreditsOverlayOpen] = useState(false);
  const [isBandoInspectorReady, setIsBandoInspectorReady] = useState(false);
  const isElectronApp = typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);
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

  /** Siglo activo actual, con fallback al primer siglo. */
  const activeSiglo = ORDERED_HISTORIA[sigloIdx] ?? ORDERED_HISTORIA[0];
  const isBandoView = bandoViewSigloIdx !== null;
  const activeConflictEntry = useMemo(
    () => DOT_ENTRIES.find((entry) => entry.key === activeDotKey) ?? null,
    [activeDotKey],
  );
  /** Conflicto activo asociado al punto actualmente seleccionado. */
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
  /** Bando activo según índice resuelto. */
  const selectedBando =
    resolvedSelectedBandoIndex === null
      ? null
      : activeConflictBandos[resolvedSelectedBandoIndex] ?? null;
  const hasMultipleBandos = activeConflictBandos.length > 1;
  const bandoNavTargets = useMemo(() => {
    if (!hasMultipleBandos || resolvedSelectedBandoIndex === null) return null;
    const total = activeConflictBandos.length;

    if (total === 2) {
      if (resolvedSelectedBandoIndex === 0) {
        const nextIndex = 1;
        return {
          left: null,
          right: {
            nextIndex,
            nextName: activeConflictBandos[nextIndex]?.nombre ?? `Bando ${nextIndex + 1}`,
          },
        };
      }

      const previousIndex = 0;
      return {
        left: {
          nextIndex: previousIndex,
          nextName: activeConflictBandos[previousIndex]?.nombre ?? `Bando ${previousIndex + 1}`,
        },
        right: null,
      };
    }

    if (activeConflict?.id === 'guerra-civil') {
      const leftIndex = resolvedSelectedBandoIndex > 0 ? resolvedSelectedBandoIndex - 1 : null;
      const rightIndex = resolvedSelectedBandoIndex < total - 1 ? resolvedSelectedBandoIndex + 1 : null;
      return {
        left: leftIndex === null
          ? null
          : {
              nextIndex: leftIndex,
              nextName: activeConflictBandos[leftIndex]?.nombre ?? `Bando ${leftIndex + 1}`,
            },
        right: rightIndex === null
          ? null
          : {
              nextIndex: rightIndex,
              nextName: activeConflictBandos[rightIndex]?.nombre ?? `Bando ${rightIndex + 1}`,
            },
      };
    }

    const nextIndex = (resolvedSelectedBandoIndex + 1) % total;
    return {
      left: null,
      right: {
        nextIndex,
        nextName: activeConflictBandos[nextIndex]?.nombre ?? `Bando ${nextIndex + 1}`,
      },
    };
  }, [activeConflict?.id, activeConflictBandos, hasMultipleBandos, resolvedSelectedBandoIndex]);
  /** Imagen base del bando activo. */
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
  const isMilicianasTitle = selectedBandoName === 'Milicianas';
  const selectedBandoHotspots = selectedBando?.hotspots ?? activeConflict?.hotspots ?? [];
  useEffect(() => {
    if (!isBandoView) {
      setIsBandoInspectorReady(false);
      return undefined;
    }

    setIsBandoInspectorReady(false);
    let cancelled = false;
    const timerId = window.setTimeout(() => {
      if (!cancelled) {
        setIsBandoInspectorReady(true);
      }
    }, 180);

    const finish = () => {
      if (cancelled) return;
      window.clearTimeout(timerId);
      setIsBandoInspectorReady(true);
    };
    const preloadSources = collectBandoImageSources(selectedBando);

    Promise.all(preloadSources.map(preloadImageSource)).then(finish).catch(finish);

    return () => {
      cancelled = true;
      window.clearTimeout(timerId);
    };
  }, [isBandoView, selectedBando, selectedBandoImage]);

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
  /**
   * Escala un valor para elementos de la línea temporal según viewport y móvil.
   *
   * @param {number} value
   * @returns {number}
   */
  const scaleTimelinePx = useCallback(
    (value) => {
      if (!Number.isFinite(value)) return value;
      return Math.round(value * viewportScale * timelineScaleFactor);
    },
    [timelineScaleFactor, viewportScale],
  );
  /** Controla si el panel de información del bando debe mostrarse. */
  const showBandoInfoPanel = isBandoView && (!isMobile || (isMobileBandoInfoOpen && !isMobilePrendaModalOpen));
  const { exitIdleMode } = useTimelineIdle({
    idleTimeoutRef,
    idleVideoRef,
    isIdleVideoVisible,
    setIsIdleVideoVisible,
  });
  const openCreditsOverlay = useCallback(() => setIsCreditsOverlayOpen(true), []);
  const closeCreditsOverlay = useCallback(() => setIsCreditsOverlayOpen(false), []);

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

    /** Calcula la posición vertical del botón de información móvil. */
    const frameId = window.requestAnimationFrame(() => {
      const defaultTop = scalePx(96);
      const titleNode = conflictTitleWrapRef.current;
      if (!titleNode) {
        setMobileInfoButtonTopPx(defaultTop);
        return;
      }
      /** Ajusta el botón para que quede por debajo del título del conflicto. */
      const measuredTop = Math.ceil(titleNode.offsetTop + titleNode.offsetHeight + scalePx(12));
      setMobileInfoButtonTopPx(Math.max(defaultTop, measuredTop));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeConflict?.nombre, isBandoView, isMobile, scalePx, viewportWidth]);

  /**
   * Ejecuta la siguiente transición de fondo en cola.
   *
   * @returns {void}
   */
  const enqueueBackgroundTransition = useBackgroundTransition({
    backgroundFadeRafRef,
    backgroundFadeTimeoutRef,
    backgroundQueueRef,
    currentBaseBackgroundRef,
    isBackgroundTransitionRunningRef,
    lastQueuedBackgroundRef,
    setBaseBackground,
    setOverlayBackground,
    setOverlayOpacity,
  });

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
      /** Recorre puntos y aplica expansión/contracción según distancia al centro. */
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

    /** Calcula posiciones centrales de siglos para decidir selección activa. */
    const centuryCenters = ORDERED_HISTORIA.map((_, index) => {
      const node = centuryRefs.current[index];
      if (!node) return null;
      const rect = node.getBoundingClientRect();
      return rect.left + rect.width / 2;
    });
    /** Conserva únicamente siglos con posición válida en pantalla. */
    const positionedCenturies = centuryCenters
      .map((center, index) => ({ center, index }))
      .filter((item) => Number.isFinite(item.center));
    if (!positionedCenturies.length) return;

    /** Determina el índice objetivo aplicando lógica de bordes. */
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

    /** Actualiza el siglo activo evitando saltos bruscos durante arrastre. */
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

  /**
   * Obtiene el conflicto asociado a una entrada tipo dot.
   *
   * @param {{type: string, sigloIndex: number, conflictIndex: number}} entry
   * @returns {object | null}
   */
  const getConflict = useCallback((entry) => {
    if (entry.type !== 'dot') return null;
    return ORDERED_HISTORIA[entry.sigloIndex]?.conflictos?.[entry.conflictIndex] ?? null;
  }, []);

  /**
   * Inicia el arrastre horizontal de la línea de tiempo.
   *
   * @param {import('react').PointerEvent} event
   * @returns {void}
   */
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

  /**
   * Actualiza el desplazamiento horizontal durante el arrastre.
   *
   * @param {import('react').PointerEvent} event
   * @returns {void}
   */
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

  /**
   * Finaliza el arrastre horizontal de la línea de tiempo.
   *
   * @param {import('react').PointerEvent} event
   * @returns {void}
   */
  const handlePointerEnd = useCallback((event) => {
    const container = wrapperRef.current;
    const dragState = dragRef.current;
    if (!container || !dragState.isDragging || dragState.pointerId !== event.pointerId) return;
    dragState.isDragging = false;
    container.releasePointerCapture?.(event.pointerId);
    setIsDragging(false);
    updateExpandedDots();
  }, [updateExpandedDots]);

  /**
   * Activa un punto de conflicto y su siglo asociado.
   *
   * @param {{key: string, sigloIndex: number}} entry
   * @returns {void}
   */
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

  /**
   * Centra un siglo concreto dentro de la línea de tiempo.
   *
   * @param {number} index
   * @param {'smooth' | 'auto'} [behavior='smooth']
   * @param {number} [focusRatio=0.5]
   * @returns {void}
   */
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

  /**
   * Activa un siglo y posiciona su primer conflicto.
   *
   * @param {number} index
   * @returns {void}
   */
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

  /**
   * Cierra la imagen ampliada del siglo.
   *
   * @returns {void}
   */
  const closeExpandedCenturyImage = useCallback(() => {
    setExpandedCenturyImage(null);
  }, []);
  /**
   * Gestiona el click en una imagen de siglo para activar o ampliar.
   *
   * @param {number} index
   * @param {string | null} imageSrc
   * @param {string | null} imageAlt
   * @param {boolean} canExpand
   * @returns {void}
   */
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
        /** Open right after activation so one click is enough. */
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

  /**
   * Activa la vista de bando para un conflicto.
   *
   * @param {{key: string, sigloIndex: number}} entry
   * @param {number} bandoIndex
   * @returns {void}
   */
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
    setIsMobileBandoInfoOpen(false);
    setBandoViewSigloIdx(entry.sigloIndex);
  }, [blurFocusedElement]);

  /**
   * Navega a un bando objetivo dentro del conflicto activo.
   *
   * @param {number} targetIndex
   * @returns {void}
   */
  const handleBandoNav = useCallback((targetIndex) => {
    if (!Number.isInteger(targetIndex)) return;
    setSelectedBandoIndex(targetIndex);
  }, []);

  /**
   * Vuelve de la vista de bandos a la línea de tiempo en un siglo concreto.
   *
   * @param {number} index
   * @returns {void}
   */
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

  /**
   * Vuelve de la vista de bandos al timeline manteniendo el conflicto actual.
   *
   * @returns {void}
   */
  const handleBackToTimelineCurrent = useCallback(() => {
    if (revealTimeoutRef.current) {
      window.clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }
    if (pendingDotSwitchTimeoutRef.current) {
      window.clearTimeout(pendingDotSwitchTimeoutRef.current);
      pendingDotSwitchTimeoutRef.current = null;
    }

    const targetSigloIndex = activeConflictEntry?.sigloIndex ?? sigloIdx;
    blurFocusedElement();
    setForcedRevealSigloIdx(targetSigloIndex);
    setBandoViewSigloIdx(null);
    setSelectedBandoIndex(null);
    setIsMobileBandoInfoOpen(false);
    setSigloIdx(targetSigloIndex);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        const focusRatio = getSigloFocusRatio(targetSigloIndex);
        scrollToSigloInTimeline(targetSigloIndex, 'auto', focusRatio);
        updateExpandedDots();
      });
    });

    revealTimeoutRef.current = window.setTimeout(() => {
      setForcedRevealSigloIdx(null);
      updateExpandedDots();
      revealTimeoutRef.current = null;
    }, RETURN_REVEAL_MS);
  }, [activeConflictEntry, blurFocusedElement, scrollToSigloInTimeline, sigloIdx, updateExpandedDots]);

  /**
   * Renderiza un nodo de siglo en la línea de tiempo.
   *
   * @param {{sigloIndex: number}} entry
   * @returns {JSX.Element}
   */
  const centuryImages = [terciosImage, sxviiiImage, sxixImage, sxxImage];

  const renderCenturyNode = (entry) => (
    <CenturyNode
      key={`siglo-${entry.sigloIndex}`}
      centuryImages={centuryImages}
      centuryRefs={centuryRefs}
      dragRef={dragRef}
      entry={entry}
      handleCenturyImageClick={handleCenturyImageClick}
      handleSigloClick={handleSigloClick}
      hoveredCenturyIdx={hoveredCenturyIdx}
      isMobile={isMobile}
      scaleTimelinePx={scaleTimelinePx}
      setHoveredCenturyIdx={setHoveredCenturyIdx}
      sigloIdx={sigloIdx}
      timelineLineHalfThickness={timelineLineHalfThickness}
      timelineLineThickness={timelineLineThickness}
      viewportScale={viewportScale}
    />
  );

  const renderConflictDot = (entry) => (
    <ConflictDot
      key={entry.key}
      activeDotKey={activeDotKey}
      dotRefs={dotRefs}
      entry={entry}
      expandedDotsByKey={expandedDotsByKey}
      forcedRevealSigloIdx={forcedRevealSigloIdx}
      getConflict={getConflict}
      handleBandoClick={handleBandoClick}
      handleDotClick={handleDotClick}
      isMobile={isMobile}
      scaleTimelinePx={scaleTimelinePx}
      viewportScale={viewportScale}
    />
  );

  return (
    <div className="relative h-screen min-h-screen w-full overflow-hidden">
      <BackgroundLayers
        baseBackground={baseBackground}
        overlayBackground={overlayBackground}
        overlayOpacity={overlayOpacity}
      />

      <div className="relative h-full w-full">
        <CreditsButton
          infoIcon={infoIcon}
          isBandoView={isBandoView}
          isMobile={isMobile}
          onOpen={openCreditsOverlay}
          scalePx={scalePx}
        />

        <TimelineScrollLayer
          handlePointerDown={handlePointerDown}
          handlePointerEnd={handlePointerEnd}
          handlePointerMove={handlePointerMove}
          isBandoView={isBandoView}
          isDragging={isDragging}
          isElectronApp={isElectronApp}
          isMobile={isMobile}
          renderCenturyNode={renderCenturyNode}
          renderConflictDot={renderConflictDot}
          scalePx={scalePx}
          timelineLineThickness={timelineLineThickness}
          viewportScale={viewportScale}
          wrapperRef={wrapperRef}
        />

        <BandoViewLayer
          activeConflict={activeConflict}
          activeSiglo={activeSiglo}
          bandoNavTargets={bandoNavTargets}
          casitaNegraIcon={casitaNegraIcon}
          conflictTitleWrapRef={conflictTitleWrapRef}
          handleBackToTimelineAtSiglo={handleBackToTimelineAtSiglo}
          handleBackToTimelineCurrent={handleBackToTimelineCurrent}
          handleBandoNav={handleBandoNav}
          isBandoInspectorReady={isBandoInspectorReady}
          isBandoView={isBandoView}
          isCuartoArtilleriaTitle={isCuartoArtilleriaTitle}
          isElectronApp={isElectronApp}
          isIsabelinosTitle={isIsabelinosTitle}
          isLongBandoDescription={isLongBandoDescription}
          isLongBandoTitle={isLongBandoTitle}
          isMilicianasTitle={isMilicianasTitle}
          isMobile={isMobile}
          isMobileBandoInfoOpen={isMobileBandoInfoOpen}
          isMobilePrendaModalOpen={isMobilePrendaModalOpen}
          isSoldado1808Title={isSoldado1808Title}
          isSoldadoLineaTitle={isSoldadoLineaTitle}
          mobileHotspotCloseSignal={mobileHotspotCloseSignal}
          mobileInfoButtonTopPx={mobileInfoButtonTopPx}
          pendingMobileInfoOpenRef={pendingMobileInfoOpenRef}
          scalePx={scalePx}
          selectedBando={selectedBando}
          selectedBandoDescription={selectedBandoDescription}
          selectedBandoHotspots={selectedBandoHotspots}
          selectedBandoImage={selectedBandoImage}
          selectedBandoName={selectedBandoName}
          setIsMobileBandoInfoOpen={setIsMobileBandoInfoOpen}
          setIsMobilePrendaModalOpen={setIsMobilePrendaModalOpen}
          setMobileHotspotCloseSignal={setMobileHotspotCloseSignal}
          showBandoInfoPanel={showBandoInfoPanel}
          sigloIdx={sigloIdx}
          timelineLineHalfThickness={timelineLineHalfThickness}
          timelineLineThickness={timelineLineThickness}
          viewportScale={viewportScale}
        />
      </div>

      <CenturyImageModal
        expandedCenturyImage={expandedCenturyImage}
        isElectronApp={isElectronApp}
        onClose={closeExpandedCenturyImage}
      />

      <CreditsOverlay
        isOpen={isCreditsOverlayOpen}
        isMobile={isMobile}
        viewportScale={viewportScale}
        onClose={closeCreditsOverlay}
      />

      <IdleOverlay
        idleVideoRef={idleVideoRef}
        isVisible={isIdleVideoVisible}
        onExit={exitIdleMode}
      />
    </div>
  );
}











