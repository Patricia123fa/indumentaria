import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { collectBandoImageSources, preloadImageSource } from '../../data/timelineData.jsx';

export function useBandoViewState({
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
  onEnterBandoView,
}) {
  const [bandoViewSigloIdx, setBandoViewSigloIdx] = useState(null);
  const [selectedBandoIndex, setSelectedBandoIndex] = useState(null);
  const [isMobileBandoInfoOpen, setIsMobileBandoInfoOpen] = useState(false);
  const [isMobilePrendaModalOpen, setIsMobilePrendaModalOpen] = useState(false);
  const [mobileHotspotCloseSignal, setMobileHotspotCloseSignal] = useState(0);
  const [isBandoInspectorReady, setIsBandoInspectorReady] = useState(false);
  const [measuredMobileInfoButtonTopPx, setMeasuredMobileInfoButtonTopPx] = useState(null);
  const pendingMobileInfoOpenRef = useRef(false);

  const isBandoView = bandoViewSigloIdx !== null;
  const activeConflictBandos = useMemo(() => activeConflict?.bandos ?? [], [activeConflict]);
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

  const selectedBando = useMemo(
    () => (resolvedSelectedBandoIndex === null ? null : activeConflictBandos[resolvedSelectedBandoIndex] ?? null),
    [activeConflictBandos, resolvedSelectedBandoIndex],
  );

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
  const showBandoInfoPanel = isBandoView && (!isMobile || (isMobileBandoInfoOpen && !isMobilePrendaModalOpen));

  useEffect(() => {
    if (!isBandoView) return undefined;
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

  useEffect(() => {
    if (isMobilePrendaModalOpen) return;
    if (!pendingMobileInfoOpenRef.current) return;

    const frameId = window.requestAnimationFrame(() => {
      pendingMobileInfoOpenRef.current = false;
      setIsMobileBandoInfoOpen(true);
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [isMobilePrendaModalOpen]);

  useEffect(() => {
    if (!isMobile || !isBandoView) return undefined;

    const frameId = window.requestAnimationFrame(() => {
      const defaultTop = scalePx(96);
      const titleNode = conflictTitleWrapRef.current;
      if (!titleNode) {
        setMeasuredMobileInfoButtonTopPx(defaultTop);
        return;
      }
      const measuredTop = Math.ceil(titleNode.offsetTop + titleNode.offsetHeight + scalePx(12));
      setMeasuredMobileInfoButtonTopPx(Math.max(defaultTop, measuredTop));
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeConflict?.nombre, conflictTitleWrapRef, isBandoView, isMobile, scalePx, viewportWidth]);

  const mobileInfoButtonTopPx = isMobile && isBandoView ? measuredMobileInfoButtonTopPx : null;

  const handleBandoClick = useCallback((entry, bandoIndex) => {
    dragRef.current.shouldPreventClick = false;
    if (pendingDotSwitchTimeoutRef.current) {
      window.clearTimeout(pendingDotSwitchTimeoutRef.current);
      pendingDotSwitchTimeoutRef.current = null;
    }
    blurFocusedElement();
    setIsBandoInspectorReady(false);
    onEnterBandoView?.();
    setActiveDotKey(entry.key);
    setSigloIdx(entry.sigloIndex);
    setSelectedBandoIndex(bandoIndex);
    setIsMobileBandoInfoOpen(false);
    setBandoViewSigloIdx(entry.sigloIndex);
  }, [
    blurFocusedElement,
    dragRef,
    onEnterBandoView,
    pendingDotSwitchTimeoutRef,
    setActiveDotKey,
    setSigloIdx,
  ]);

  const handleBandoNav = useCallback((targetIndex) => {
    if (!Number.isInteger(targetIndex)) return;
    setIsBandoInspectorReady(false);
    setSelectedBandoIndex(targetIndex);
  }, []);

  const handleBackToTimelineAtSiglo = useCallback((index) => {
    blurFocusedElement();
    setBandoViewSigloIdx(null);
    setSelectedBandoIndex(null);
    setIsMobileBandoInfoOpen(false);
    revealTimelineAtSiglo(index);
  }, [blurFocusedElement, revealTimelineAtSiglo]);

  const handleBackToTimelineCurrent = useCallback(() => {
    const targetSigloIndex = activeConflictEntry?.sigloIndex ?? sigloIdx;
    blurFocusedElement();
    setBandoViewSigloIdx(null);
    setSelectedBandoIndex(null);
    setIsMobileBandoInfoOpen(false);
    revealTimelineAtSiglo(targetSigloIndex);
  }, [activeConflictEntry, blurFocusedElement, revealTimelineAtSiglo, sigloIdx]);

  return {
    bandoNavTargets,
    bandoViewSigloIdx,
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
    setIsBandoInspectorReady,
    setIsMobileBandoInfoOpen,
    setIsMobilePrendaModalOpen,
    setMobileHotspotCloseSignal,
    showBandoInfoPanel,
  };
}
