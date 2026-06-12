import { memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  getHotspotImage,
  HOTSPOT_CONTENT_SWITCH_MS,
  resolveSide,
} from './bandoInspectorData.jsx';
import {
  MannequinStage,
  MobilePrendaModal,
  PrendaArrowSticker,
} from './BandoPrendaInspectorViews.jsx';
import { DesktopPrendaImagePanel, DesktopPrendaInfoPanel } from './BandoPrendaDesktopPanels.jsx';
import { useOverlayPixelHotspots } from './useOverlayPixelHotspots.jsx';
import { usePrendaArrow } from './usePrendaArrow.jsx';


/**
 * Inspector interactivo de prendas y hotspots de cada bando.
 *
 * @param {object} props
 * @returns {JSX.Element}
 */
function BandoPrendaInspector({
  imageSrc,
  bandoName,
  hotspots,
  showArrows = true,
  accentColor = '#7b8465',
  isMobile = false,
  viewportScale = 1,
  imageScaleMultiplier = 1,
  mainImageScaleMultiplier = 1,
  mainImageOffsetY = '0%',
  mainImageOverlaySrc = null,
  mainImageOverlayHotspot = null,
  mainImageOverlayHotspots = null,
  onMobileHotspotModalChange = () => {},
  closeMobileHotspotSignal = 0,
}) {
  const normalizedHotspots = useMemo(
    () =>
      (hotspots ?? [])
        .filter(Boolean)
        .map((hotspot, index) => ({
          ...hotspot,
          key: hotspot.id ?? `${hotspot.label ?? hotspot.nombre ?? 'prenda'}-${index}`,
          side: resolveSide(hotspot, index),
        })),
    [hotspots],
  );
  const normalizedOverlayHotspots = useMemo(() => {
    const overlaySource =
      mainImageOverlayHotspots ?? (mainImageOverlayHotspot ? [mainImageOverlayHotspot] : []);

    return overlaySource
      .filter(Boolean)
      .map((overlayHotspot, index) => ({
        ...overlayHotspot,
        key: overlayHotspot.id ?? overlayHotspot.key ?? `__main-image-overlay-hotspot__-${index}`,
      }));
  }, [mainImageOverlayHotspots, mainImageOverlayHotspot]);

  const [activeHotspotIndex, setActiveHotspotIndex] = useState(null);
  const [activeOverlayHotspotKey, setActiveOverlayHotspotKey] = useState(null);
  const [pressedHotspotKey, setPressedHotspotKey] = useState(null);
  const [activeImageHasError, setActiveImageHasError] = useState(false);
  const [overlayArrowStartPoint, setOverlayArrowStartPoint] = useState(null);
  const [contentHotspotKey, setContentHotspotKey] = useState(null);
  const [isHotspotContentVisible, setIsHotspotContentVisible] = useState(true);
  const lastCloseMobileHotspotSignalRef = useRef(closeMobileHotspotSignal);
  const hotspotContentSwitchTimeoutRef = useRef(null);
  const hotspotRefs = useRef({});
  const overlayHotspotRefs = useRef({});
  const overlayAlphaMapsRef = useRef(new Map());
  const overlayLayerRef = useRef(null);
  const panelRef = useRef(null);
  const arrowRafRef = useRef(null);

  const activeMarkerHotspot =
    activeHotspotIndex === null ? null : normalizedHotspots[activeHotspotIndex] ?? null;
  const activeOverlayHotspot =
    activeOverlayHotspotKey === null
      ? null
      : normalizedOverlayHotspots.find((hotspot) => hotspot.key === activeOverlayHotspotKey) ?? null;
  const activeHotspot = activeOverlayHotspot ?? activeMarkerHotspot;
  const contentMarkerHotspot =
    contentHotspotKey === null
      ? null
      : normalizedHotspots.find((hotspot) => hotspot.key === contentHotspotKey) ?? null;
  const contentOverlayHotspot =
    contentHotspotKey === null
      ? null
      : normalizedOverlayHotspots.find((hotspot) => hotspot.key === contentHotspotKey) ?? null;
  const contentHotspot = contentOverlayHotspot ?? contentMarkerHotspot;

  useEffect(() => {
    const nextHotspotKey = activeHotspot?.key ?? null;
    if (nextHotspotKey === contentHotspotKey) return;

    if (hotspotContentSwitchTimeoutRef.current) {
      window.clearTimeout(hotspotContentSwitchTimeoutRef.current);
      hotspotContentSwitchTimeoutRef.current = null;
    }

    if (contentHotspotKey === null) {
      setContentHotspotKey(nextHotspotKey);
      setIsHotspotContentVisible(true);
      return;
    }

    setIsHotspotContentVisible(false);
    hotspotContentSwitchTimeoutRef.current = window.setTimeout(() => {
      setContentHotspotKey(nextHotspotKey);
      requestAnimationFrame(() => {
        setIsHotspotContentVisible(true);
      });
      hotspotContentSwitchTimeoutRef.current = null;
    }, HOTSPOT_CONTENT_SWITCH_MS);
  }, [activeHotspot?.key, contentHotspotKey]);

  useEffect(() => {
    return () => {
      if (!hotspotContentSwitchTimeoutRef.current) return;
      window.clearTimeout(hotspotContentSwitchTimeoutRef.current);
      hotspotContentSwitchTimeoutRef.current = null;
    };
  }, []);

  const activeHotspotImages = useMemo(() => {
    if (!contentHotspot) return [];

    const galleryCandidates = [];
    const addImage = (value) => {
      if (typeof value !== 'string') return;
      const trimmed = value.trim();
      if (!trimmed) return;
      galleryCandidates.push(trimmed);
    };
    const addImageCollection = (collection) => {
      if (!Array.isArray(collection)) return;
      collection.forEach((item) => {
        if (typeof item === 'string') {
          addImage(item);
          return;
        }
        if (!item || typeof item !== 'object') return;
        addImage(item.src ?? item.image ?? item.imagen ?? item.detailImage ?? null);
      });
    };

    addImageCollection(contentHotspot.detailImages);
    addImageCollection(contentHotspot.galleryImages);
    addImageCollection(contentHotspot.galeria);
    addImageCollection(contentHotspot.gallery);
    const explicitGallery = [...new Set(galleryCandidates)];
    if (explicitGallery.length > 0) return explicitGallery;

    const singleImage =
      contentOverlayHotspot?.detailImage ?? contentHotspot?.detailImage ?? getHotspotImage(contentHotspot);
    if (typeof singleImage !== 'string') return [];
    const trimmedSingleImage = singleImage.trim();
    return trimmedSingleImage ? [trimmedSingleImage] : [];
  }, [contentHotspot, contentOverlayHotspot]);
  const activeHotspotImage = activeHotspotImages[0] ?? null;
  const hasHotspotImageGallery = activeHotspotImages.length > 1;
  const isUniformeEstandarGorroGallery =
    hasHotspotImageGallery &&
    bandoName === 'Uniforme EstÃ¡ndar' &&
    /gorro/i.test(contentHotspot?.label ?? contentHotspot?.nombre ?? '');
  const isRayadilloGorroGallery =
    hasHotspotImageGallery &&
    /rayadillo/i.test(bandoName ?? '') &&
    /gorro/i.test(contentHotspot?.label ?? contentHotspot?.nombre ?? '');
  const isLargeHatGallery = isUniformeEstandarGorroGallery || isRayadilloGorroGallery;
  const uniformeEstandarGorroGalleryOffsetY = Math.max(24, Math.round(42 * viewportScale));
  const showHotspotImageBlock =
    activeHotspotImages.length > 0 && (hasHotspotImageGallery || !activeImageHasError);
  const hotspotContentVisibilityClass = isHotspotContentVisible
    ? 'timeline-hotspot-content-visible'
    : 'timeline-hotspot-content-hidden';
  const activeHotspotImageScaleMultiplier = contentHotspot?.imageScaleMultiplier ?? 1;
  const activeHotspotImageOffsetY = contentHotspot?.imageOffsetY ?? '0%';
  const activeHotspotImageOffsetX = contentHotspot?.imageOffsetX ?? '0%';
  const activeHotspotImageRotation = (() => {
    const rawRotation = contentHotspot?.imageRotation ?? contentHotspot?.imageRotate ?? '0deg';
    if (typeof rawRotation === 'number' && Number.isFinite(rawRotation)) {
      return `${rawRotation}deg`;
    }
    if (typeof rawRotation === 'string' && rawRotation.trim()) {
      return rawRotation.trim();
    }
    return '0deg';
  })();
  const isSoldadoLineaHotspotTheme = /soldado\s*de\s*l[ií]nea/i.test(bandoName ?? '');
  const isSoldadoRepublicanoHotspotTheme = /soldado\s*republicano/i.test(bandoName ?? '');
  const hotspotAccentMode =
    isSoldadoLineaHotspotTheme || isSoldadoRepublicanoHotspotTheme ? 'red' : 'default';
  const isElectronApp = typeof navigator !== 'undefined' && /Electron/i.test(navigator.userAgent);
  const hotspotHaloScaleMultiplier =
    hotspotAccentMode === 'red' ? 1.54 : hotspotAccentMode === 'blue' ? 1.5 : 1.5;
  const showMobilePrendaModal = isMobile && !!activeHotspot;

  /**
   * Limpia la selecciÃ³n activa de hotspot y overlay.
   *
   * @returns {void}
   */
  const closeActiveHotspot = useCallback(() => {
    setActiveHotspotIndex(null);
    setActiveOverlayHotspotKey(null);
    setOverlayArrowStartPoint(null);
  }, []);

  useEffect(() => {
    if (!showMobilePrendaModal) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [showMobilePrendaModal]);

  useEffect(() => {
    onMobileHotspotModalChange(showMobilePrendaModal);
    return () => {
      onMobileHotspotModalChange(false);
    };
  }, [onMobileHotspotModalChange, showMobilePrendaModal]);

  useEffect(() => {
    if (!showMobilePrendaModal) {
      lastCloseMobileHotspotSignalRef.current = closeMobileHotspotSignal;
      return;
    }

    if (closeMobileHotspotSignal === lastCloseMobileHotspotSignalRef.current) return;
    lastCloseMobileHotspotSignalRef.current = closeMobileHotspotSignal;
    closeActiveHotspot();
  }, [closeActiveHotspot, closeMobileHotspotSignal, showMobilePrendaModal]);

  /**
   * Encuentra el hotspot superior cuyo pÃ­xel visible (alpha) ha sido pulsado.
   *
   * @param {number} clientX
   * @param {number} clientY
   * @returns {object | null}
   */
  const handleOverlayLayerPointerDown = useOverlayPixelHotspots({
    activeOverlayHotspotKey,
    mainImageOverlaySrc,
    normalizedOverlayHotspots,
    overlayAlphaMapsRef,
    overlayLayerRef,
    setActiveHotspotIndex,
    setActiveOverlayHotspotKey,
    setOverlayArrowStartPoint,
    setPressedHotspotKey,
    viewportScale,
  });

  const { arrowGeometry, scheduleArrowUpdate, setArrowGeometry } = usePrendaArrow({
    activeHotspotImage,
    activeHotspotIndex,
    activeOverlayHotspotKey,
    arrowRafRef,
    contentHotspotKey,
    hasHotspotImageGallery,
    hotspotRefs,
    isHotspotContentVisible,
    isMobile,
    normalizedHotspots,
    normalizedOverlayHotspots,
    overlayArrowStartPoint,
    overlayHotspotRefs,
    overlayLayerRef,
    panelRef,
    showArrows,
  });

  useLayoutEffect(() => {
    if (hotspotContentSwitchTimeoutRef.current) {
      window.clearTimeout(hotspotContentSwitchTimeoutRef.current);
      hotspotContentSwitchTimeoutRef.current = null;
    }
    if (arrowRafRef.current !== null) {
      window.cancelAnimationFrame(arrowRafRef.current);
      arrowRafRef.current = null;
    }
    setActiveHotspotIndex(null);
    setActiveOverlayHotspotKey(null);
    setPressedHotspotKey(null);
    setOverlayArrowStartPoint(null);
    setContentHotspotKey(null);
    setIsHotspotContentVisible(true);
    setActiveImageHasError(false);
    setArrowGeometry(null);
  }, [bandoName, imageSrc, normalizedHotspots.length, normalizedOverlayHotspots.length, setArrowGeometry]);

  useEffect(() => {
    setActiveImageHasError(false);
  }, [activeHotspotImage]);

  const floatingImageWidthPx = Math.max(
    210,
    Math.round((isMobile ? 228 : 300) * viewportScale * imageScaleMultiplier * activeHotspotImageScaleMultiplier),
  );
  const floatingImageMaxHeight = `${Math.max(
    220,
    Math.round((isMobile ? 280 : 520) * viewportScale * imageScaleMultiplier * activeHotspotImageScaleMultiplier),
  )}px`;
  const activeHotspotDetail = contentHotspot?.detalle ?? '';
  const activeHotspotDetailLines = Math.max(
    1,
    (activeHotspotDetail.match(/\n/g)?.length ?? 0) + Math.ceil(activeHotspotDetail.length / (isMobile ? 64 : 82)),
  );
  /**
   * Devuelve estilos de halo en funciÃ³n del tema visual del hotspot.
   *
   * @param {boolean} isActive
   * @returns {object | null}
   */
  const getHotspotHaloStyle = (isActive) => {
    if (hotspotAccentMode === 'blue') {
      return {
        background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.14)',
        borderColor: isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.92)',
        borderWidth: isActive ? '2px' : '1.5px',
        boxShadow: isActive
          ? '0 0 0 1px rgba(255, 255, 255, 1), 0 0 0 2px rgba(255, 255, 255, 0.82), 0 0 30px rgba(255, 255, 255, 0.95), 0 0 54px rgba(255, 255, 255, 0.64)'
          : '0 0 0 1px rgba(255, 255, 255, 0.98), 0 0 0 2px rgba(255, 255, 255, 0.68), 0 0 20px rgba(255, 255, 255, 0.76), 0 0 38px rgba(255, 255, 255, 0.46)',
        filter: isActive ? 'brightness(1.26) saturate(1.2)' : 'brightness(1.16) saturate(1.06)',
      };
    }

    if (hotspotAccentMode === 'red') {
      return {
        background: isActive ? 'rgba(255, 98, 38, 0.74)' : 'rgba(244, 76, 18, 0.52)',
        borderColor: isActive ? 'rgba(255, 247, 241, 1)' : 'rgba(255, 212, 188, 1)',
        borderWidth: isActive ? '2px' : '1.5px',
        boxShadow: isActive
          ? '0 0 0 1px rgba(255, 248, 243, 1), 0 0 0 2px rgba(255, 170, 124, 0.88), 0 0 36px rgba(255, 108, 46, 1), 0 0 72px rgba(232, 72, 22, 0.96), 0 0 98px rgba(176, 42, 10, 0.7)'
          : '0 0 0 1px rgba(255, 216, 194, 1), 0 0 0 2px rgba(255, 152, 99, 0.72), 0 0 28px rgba(246, 92, 35, 0.86), 0 0 50px rgba(194, 52, 14, 0.6)',
        filter: isActive ? 'brightness(1.3) saturate(1.72)' : 'brightness(1.2) saturate(1.5)',
      };
    }

    return {
      background: isActive ? 'rgba(255, 255, 255, 0.2)' : 'rgba(255, 255, 255, 0.14)',
      borderColor: isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.92)',
      borderWidth: isActive ? '2px' : '1.5px',
      boxShadow: isActive
        ? '0 0 0 1px rgba(255, 255, 255, 1), 0 0 0 2px rgba(255, 255, 255, 0.82), 0 0 30px rgba(255, 255, 255, 0.95), 0 0 54px rgba(255, 255, 255, 0.64)'
        : '0 0 0 1px rgba(255, 255, 255, 0.98), 0 0 0 2px rgba(255, 255, 255, 0.68), 0 0 20px rgba(255, 255, 255, 0.76), 0 0 38px rgba(255, 255, 255, 0.46)',
      filter: isActive ? 'brightness(1.26) saturate(1.2)' : 'brightness(1.16) saturate(1.06)',
    };
  };

  /**
   * Devuelve estilos de punto central en funciÃ³n del tema visual del hotspot.
   *
   * @param {boolean} isActive
   * @returns {object | null}
   */
  const getHotspotDotStyle = (isActive) => {
    if (hotspotAccentMode !== 'red') {
      return {
        background: isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(238, 238, 238, 0.98)',
        borderColor: isActive ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0.95)',
        borderWidth: isActive ? '2px' : '1.5px',
        boxShadow: isActive
          ? '0 0 0 1px rgba(255, 255, 255, 1), 0 0 0 2px rgba(255, 255, 255, 0.84), 0 0 24px rgba(255, 255, 255, 0.98), 0 0 44px rgba(255, 255, 255, 0.68)'
          : '0 0 0 1px rgba(255, 255, 255, 0.92), 0 0 16px rgba(255, 255, 255, 0.78), 0 0 30px rgba(255, 255, 255, 0.52)',
        filter: isActive ? 'brightness(1.32) saturate(1.12)' : 'brightness(1.2) saturate(1.02)',
      };
    }

    return {
      background: isActive ? 'rgba(204, 50, 8, 1)' : 'rgba(156, 37, 10, 1)',
      borderColor: isActive ? 'rgba(255, 246, 239, 1)' : 'rgba(255, 217, 196, 1)',
      borderWidth: isActive ? '2px' : '1.5px',
      boxShadow: isActive
        ? '0 0 0 1px rgba(255, 249, 245, 1), 0 0 0 2px rgba(255, 178, 138, 0.8), 0 0 30px rgba(255, 99, 35, 1), 0 0 52px rgba(214, 52, 12, 0.82)'
        : '0 0 0 1px rgba(255, 220, 201, 0.98), 0 0 18px rgba(246, 88, 28, 0.92), 0 0 34px rgba(192, 44, 11, 0.56)',
      filter: isActive ? 'brightness(1.34) saturate(1.7)' : 'brightness(1.22) saturate(1.46)',
    };
  };
  const infoPanelExtraHeight = Math.min(
    120,
    Math.max(0, (activeHotspotDetailLines - 3) * (isMobile ? 18 : 22)),
  );
  const infoPanelMinHeight = Math.max(
    170,
    Math.round(228 * viewportScale) + infoPanelExtraHeight,
  );
  const infoPanelPaddingBottom = Math.max(
    16,
    Math.round((isMobile ? 20 : 24) + activeHotspotDetailLines * (isMobile ? 2 : 3)),
  );

  return (
    <div className="relative">
      <PrendaArrowSticker
        arrowGeometry={arrowGeometry}
        isMobile={isMobile}
        showArrows={showArrows}
      />

      <MannequinStage
        activeHotspotIndex={activeHotspotIndex}
        activeOverlayHotspotKey={activeOverlayHotspotKey}
        bandoName={bandoName}
        getHotspotDotStyle={getHotspotDotStyle}
        getHotspotHaloStyle={getHotspotHaloStyle}
        handleOverlayLayerPointerDown={handleOverlayLayerPointerDown}
        hotspotAccentMode={hotspotAccentMode}
        hotspotHaloScaleMultiplier={hotspotHaloScaleMultiplier}
        hotspotRefs={hotspotRefs}
        imageSrc={imageSrc}
        isMobile={isMobile}
        mainImageOffsetY={mainImageOffsetY}
        mainImageOverlaySrc={mainImageOverlaySrc}
        mainImageScaleMultiplier={mainImageScaleMultiplier}
        normalizedHotspots={normalizedHotspots}
        normalizedOverlayHotspots={normalizedOverlayHotspots}
        overlayHotspotRefs={overlayHotspotRefs}
        overlayLayerRef={overlayLayerRef}
        pressedHotspotKey={pressedHotspotKey}
        setActiveHotspotIndex={setActiveHotspotIndex}
        setActiveOverlayHotspotKey={setActiveOverlayHotspotKey}
        setOverlayArrowStartPoint={setOverlayArrowStartPoint}
        setPressedHotspotKey={setPressedHotspotKey}
        viewportScale={viewportScale}
      />

      <MobilePrendaModal
        accentColor={accentColor}
        activeHotspotImageOffsetX={activeHotspotImageOffsetX}
        activeHotspotImageOffsetY={activeHotspotImageOffsetY}
        activeHotspotImageRotation={activeHotspotImageRotation}
        activeHotspotImages={activeHotspotImages}
        closeActiveHotspot={closeActiveHotspot}
        contentHotspot={contentHotspot}
        hasHotspotImageGallery={hasHotspotImageGallery}
        hotspotContentVisibilityClass={hotspotContentVisibilityClass}
        isElectronApp={isElectronApp}
        isLargeHatGallery={isLargeHatGallery}
        isUniformeEstandarGorroGallery={isUniformeEstandarGorroGallery}
        onSingleImageError={() => setActiveImageHasError(true)}
        showHotspotImageBlock={showHotspotImageBlock}
        showMobilePrendaModal={showMobilePrendaModal}
        uniformeEstandarGorroGalleryOffsetY={uniformeEstandarGorroGalleryOffsetY}
        viewportScale={viewportScale}
      />

      <DesktopPrendaInfoPanel
        accentColor={accentColor}
        contentHotspot={contentHotspot}
        hotspotContentVisibilityClass={hotspotContentVisibilityClass}
        infoPanelMinHeight={infoPanelMinHeight}
        infoPanelPaddingBottom={infoPanelPaddingBottom}
        isElectronApp={isElectronApp}
        isMobile={isMobile}
        viewportScale={viewportScale}
      />

      <DesktopPrendaImagePanel
        activeHotspotImage={activeHotspotImage}
        activeHotspotImageOffsetX={activeHotspotImageOffsetX}
        activeHotspotImageOffsetY={activeHotspotImageOffsetY}
        activeHotspotImageRotation={activeHotspotImageRotation}
        activeHotspotImages={activeHotspotImages}
        activeImageHasError={activeImageHasError}
        contentHotspot={contentHotspot}
        floatingImageMaxHeight={floatingImageMaxHeight}
        floatingImageWidthPx={floatingImageWidthPx}
        hasHotspotImageGallery={hasHotspotImageGallery}
        hotspotContentVisibilityClass={hotspotContentVisibilityClass}
        isElectronApp={isElectronApp}
        isLargeHatGallery={isLargeHatGallery}
        isMobile={isMobile}
        isUniformeEstandarGorroGallery={isUniformeEstandarGorroGallery}
        panelRef={panelRef}
        scheduleArrowUpdate={scheduleArrowUpdate}
        setActiveImageHasError={setActiveImageHasError}
        uniformeEstandarGorroGalleryOffsetY={uniformeEstandarGorroGalleryOffsetY}
        viewportScale={viewportScale}
      />
    </div>
  );
}

export default memo(BandoPrendaInspector);



