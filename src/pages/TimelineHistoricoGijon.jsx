import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ORDERED_HISTORIA } from '../data/timelineData.jsx';
import { CenturyImageModal, CreditsOverlay, IdleOverlay } from '../components/timeline/TimelineOverlays';
import { BackgroundLayers, BandoViewLayer, CreditsButton, TimelineScrollLayer } from '../components/timeline/TimelineViews';
import { CenturyNode, ConflictDot } from '../components/timeline/TimelineNodes';
import { useBackgroundTransition } from '../hooks/timeline/useBackgroundTransition';
import { useTimelineIdle } from '../hooks/timeline/useTimelineIdle';
import { useTimelineNavigation } from '../hooks/timeline/useTimelineNavigation';
import { useBandoViewState } from '../hooks/timeline/useBandoViewState';
import { useTimelineLayout } from '../hooks/timeline/useTimelineLayout';
import terciosImage from '../assets/infanteria_fondo.webp';
import sxviiiImage from '../assets/sxviii_mejorada.webp';
import sxixImage from '../assets/19_foto.webp';
import sxxImage from '../assets/20_foto.webp';
import casitaNegraIcon from '../assets/casita-negra.png';
import infoIcon from '../assets/info.png';

const CENTURY_IMAGES = [terciosImage, sxviiiImage, sxixImage, sxxImage];

/**
 * Componente principal de la línea de tiempo histórica de Gijón.
 *
 * @returns {JSX.Element}
 */
export default function TimelineHistoricoGijon() {
  const [hoveredCenturyIdx, setHoveredCenturyIdx] = useState(null);
  const [expandedCenturyImage, setExpandedCenturyImage] = useState(null);
  const [baseBackground, setBaseBackground] = useState(ORDERED_HISTORIA[0]?.fondo ?? null);
  const [overlayBackground, setOverlayBackground] = useState(null);
  const [overlayOpacity, setOverlayOpacity] = useState(0);
  const [isIdleVideoVisible, setIsIdleVideoVisible] = useState(true);
  const [isCreditsOverlayOpen, setIsCreditsOverlayOpen] = useState(false);
  const isElectronApp = typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);
  const conflictTitleWrapRef = useRef(null);
  const backgroundFadeTimeoutRef = useRef(null);
  const backgroundFadeRafRef = useRef(null);
  const backgroundQueueRef = useRef([]);
  const isBackgroundTransitionRunningRef = useRef(false);
  const currentBaseBackgroundRef = useRef(ORDERED_HISTORIA[0]?.fondo ?? null);
  const lastQueuedBackgroundRef = useRef(ORDERED_HISTORIA[0]?.fondo ?? null);
  const idleTimeoutRef = useRef(null);
  const idleVideoRef = useRef(null);
  const {
    isMobile,
    scalePx,
    scaleTimelinePx,
    timelineLineHalfThickness,
    timelineLineThickness,
    viewportScale,
    viewportWidth,
  } = useTimelineLayout();
  const {
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
    setActiveDotKey,
    setSigloIdx,
    sigloIdx,
    wrapperRef,
  } = useTimelineNavigation();

  /** Siglo activo actual, con fallback al primer siglo. */
  const activeSiglo = ORDERED_HISTORIA[sigloIdx] ?? ORDERED_HISTORIA[0];
  /** Conflicto activo asociado al punto actualmente seleccionado. */
  const activeConflict = useMemo(() => {
    if (!activeConflictEntry) return null;
    return (
      ORDERED_HISTORIA[activeConflictEntry.sigloIndex]?.conflictos?.[activeConflictEntry.conflictIndex] ??
      null
    );
  }, [activeConflictEntry]);

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
    };
  }, []);

  const {
    bandoNavTargets,
    handleBackToTimelineAtSiglo,
    handleBackToTimelineCurrent,
    handleBandoClick,
    handleBandoNav,
    isBandoInspectorReady,
    isBandoView,
    isCuartoArtilleriaTitle,
    isIsabelinosTitle,
    isLongBandoDescription,
    isLongBandoTitle,
    isMilicianasTitle,
    isMobileBandoInfoOpen,
    isMobilePrendaModalOpen,
    isSoldado1808Title,
    isSoldadoLineaTitle,
    mobileHotspotCloseSignal,
    mobileInfoButtonTopPx,
    pendingMobileInfoOpenRef,
    selectedBando,
    selectedBandoDescription,
    selectedBandoHotspots,
    selectedBandoImage,
    selectedBandoName,
    setIsMobileBandoInfoOpen,
    setIsMobilePrendaModalOpen,
    setMobileHotspotCloseSignal,
    showBandoInfoPanel,
  } = useBandoViewState({
    activeConflict,
    activeConflictEntry,
    blurFocusedElement,
    conflictTitleWrapRef,
    dragRef,
    isMobile,
    pendingDotSwitchTimeoutRef,
    revealTimelineAtSiglo,
    scalePx,
    setActiveDotKey,
    setSigloIdx,
    sigloIdx,
    viewportWidth,
    onEnterBandoView: () => setExpandedCenturyImage(null),
  });

  const { exitIdleMode } = useTimelineIdle({
    idleTimeoutRef,
    idleVideoRef,
    isIdleVideoVisible,
    setIsIdleVideoVisible,
  });
  const openCreditsOverlay = useCallback(() => setIsCreditsOverlayOpen(true), []);
  const closeCreditsOverlay = useCallback(() => setIsCreditsOverlayOpen(false), []);

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
    [dragRef, handleSigloClick],
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

  const renderCenturyNode = (entry) => (
    <CenturyNode
      key={`siglo-${entry.sigloIndex}`}
      centuryImages={CENTURY_IMAGES}
      dragRef={dragRef}
      entry={entry}
      handleCenturyImageClick={handleCenturyImageClick}
      handleSigloClick={handleSigloClick}
      hoveredCenturyIdx={hoveredCenturyIdx}
      isMobile={isMobile}
      registerCenturyNode={registerCenturyNode}
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
      entry={entry}
      expandedDotsByKey={expandedDotsByKey}
      forcedRevealSigloIdx={forcedRevealSigloIdx}
      getConflict={getConflict}
      handleBandoClick={handleBandoClick}
      handleDotClick={handleDotClick}
      isMobile={isMobile}
      registerDotNode={registerDotNode}
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
