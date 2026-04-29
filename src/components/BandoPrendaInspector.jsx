import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import flechaA from '../assets/flechas/flecha_nueva_1.avif';
import flechaB from '../assets/flechas/flecha_nueva_2.avif';
import flechaC from '../assets/flechas/flecha_nueva_3.avif';

/**
 * Obtiene la imagen de un hotspot independientemente del alias usado en los datos.
 *
 * @param {object | null | undefined} hotspot
 * @returns {string | null}
 */
const getHotspotImage = (hotspot) =>
  hotspot?.imagen ?? hotspot?.image ?? hotspot?.prendaImagen ?? hotspot?.asset ?? null;

/**
 * Interpreta un valor porcentual y devuelve su parte numérica.
 *
 * @param {number | string | null | undefined} value
 * @returns {number | null}
 */
const parsePercent = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)%$/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

/**
 * Resuelve qué lado debe usar la etiqueta de un hotspot.
 *
 * @param {object | null | undefined} hotspot
 * @param {number} index
 * @returns {'left' | 'right'}
 */
const resolveSide = (hotspot, index) => {
  if (hotspot?.side === 'left' || hotspot?.side === 'right') return hotspot.side;
  const leftValue = parsePercent(hotspot?.estilo?.left ?? hotspot?.style?.left);
  if (leftValue !== null) return leftValue < 50 ? 'right' : 'left';
  return index % 2 === 0 ? 'right' : 'left';
};

/**
 * Interpreta un ratio desde valor numérico o porcentaje y lo limita a [0, 1].
 *
 * @param {number | string | null | undefined} value
 * @param {number} fallback
 * @returns {number}
 */
const parseRatio = (value, fallback) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const normalized = value > 1 ? value / 100 : value;
    return Math.max(0, Math.min(1, normalized));
  }
  const asPercent = parsePercent(value);
  if (asPercent === null) return fallback;
  return Math.max(0, Math.min(1, asPercent / 100));
};

/**
 * Convierte longitudes tipo CSS a px usando un tamaño de referencia para porcentajes.
 *
 * @param {number | string | null | undefined} value
 * @param {number} referenceSize
 * @returns {number}
 */
const parseLengthToPx = (value, referenceSize) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value !== 'string') return 0;

  const trimmed = value.trim();
  if (!trimmed) return 0;

  if (trimmed.endsWith('%')) {
    const parsedPercent = Number.parseFloat(trimmed.slice(0, -1));
    if (!Number.isFinite(parsedPercent)) return 0;
    return (parsedPercent / 100) * referenceSize;
  }

  if (trimmed.endsWith('px')) {
    const parsedPx = Number.parseFloat(trimmed.slice(0, -2));
    return Number.isFinite(parsedPx) ? parsedPx : 0;
  }

  const parsed = Number.parseFloat(trimmed);
  return Number.isFinite(parsed) ? parsed : 0;
};

/**
 * Calcula el rectángulo ocupado por una imagen contenida dentro de un contenedor.
 *
 * @param {number} containerWidth
 * @param {number} containerHeight
 * @param {number} imageWidth
 * @param {number} imageHeight
 * @returns {{x: number, y: number, width: number, height: number} | null}
 */
const resolveContainedImageRect = (containerWidth, containerHeight, imageWidth, imageHeight) => {
  if (
    containerWidth <= 0 ||
    containerHeight <= 0 ||
    imageWidth <= 0 ||
    imageHeight <= 0
  ) {
    return null;
  }

  const containerRatio = containerWidth / containerHeight;
  const imageRatio = imageWidth / imageHeight;

  if (containerRatio > imageRatio) {
    const height = containerHeight;
    const width = height * imageRatio;
    return {
      x: (containerWidth - width) / 2,
      y: 0,
      width,
      height,
    };
  }

  const width = containerWidth;
  const height = width / imageRatio;
  return {
    x: 0,
    y: (containerHeight - height) / 2,
    width,
    height,
  };
};

/**
 * Convierte un color hexadecimal a rgba.
 *
 * @param {string} hex
 * @param {number} alpha
 * @returns {string}
 */
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

/** Metadatos de sprites de flecha usados para dibujar flechas contextuales. */
const ARROW_STICKERS = [
  {
    src: flechaA,
    width: 2354,
    height: 285,
    tail: { x: 94, y: 122 },
    tip: { x: 2175, y: 155 },
    tipFlipped: { x: 2175, y: 130 },
  },
  {
    src: flechaB,
    width: 2333,
    height: 232,
    tail: { x: 63, y: 80 },
    tip: { x: 2190, y: 68 },
    tipFlipped: { x: 2190, y: 164 },
  },
  {
    src: flechaC,
    width: 2306,
    height: 195,
    tail: { x: 44, y: 110 },
    tip: { x: 2215, y: 90 },
    tipFlipped: { x: 2215, y: 105 },
  },
];
const HOTSPOT_CONTENT_SWITCH_MS = 260;

/**
 * Inspector interactivo de prendas y hotspots de cada bando.
 *
 * @param {object} props
 * @returns {JSX.Element}
 */
export default function BandoPrendaInspector({
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
  const [arrowGeometry, setArrowGeometry] = useState(null);
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
  }, [bandoName, imageSrc, normalizedHotspots.length, normalizedOverlayHotspots.length]);

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
    bandoName === 'Uniforme Estándar' &&
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
  const isSoldadoLineaAccent = accentColor?.toLowerCase() === '#7fa9d6';
  const isSigloXXAccent = accentColor?.toLowerCase() === '#c1a04d';
  const isUniforme1926HotspotTheme = /uniforme\s*1926/i.test(bandoName ?? '');
  const isSoldadoLineaHotspotTheme = /soldado\s*de\s*l[ií]nea/i.test(bandoName ?? '');
  const hotspotAccentMode = isSigloXXAccent || isUniforme1926HotspotTheme || isSoldadoLineaHotspotTheme
    ? 'red'
    : isSoldadoLineaAccent
      ? 'blue'
      : 'default';
  const overlayOutlineFilterId = 'timeline-mannequin-overlay-outline-filter';
  const overlayOutlineDilateRadius = 4.2;
  const overlayOutlineBlur = 2.8;
  const overlayOutlineColor = hotspotAccentMode === 'red' ? '#ff4218' : '#ffffff';
  const overlayOutlineOpacity = 1;
  const overlayOutlineScale = 1;
  const overlayHaloScaleMultiplier =
    hotspotAccentMode === 'red' ? 1.58 : hotspotAccentMode === 'blue' ? 1.54 : 1.54;
  const hotspotHaloScaleMultiplier =
    hotspotAccentMode === 'red' ? 1.54 : hotspotAccentMode === 'blue' ? 1.5 : 1.5;
  const showMobilePrendaModal = isMobile && !!activeHotspot;

  /**
   * Limpia la selección activa de hotspot y overlay.
   *
   * @returns {void}
   */
  function closeActiveHotspot() {
    setActiveHotspotIndex(null);
    setActiveOverlayHotspotKey(null);
    setOverlayArrowStartPoint(null);
  }

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

  useEffect(() => {
    let disposed = false;
    const overlaySources = [
      ...new Set(
        normalizedOverlayHotspots
          .map(
            (hotspot) =>
              hotspot.overlayHitImage ??
              hotspot.overlayImage ??
              mainImageOverlaySrc ??
              getHotspotImage(hotspot),
          )
          .filter(Boolean),
      ),
    ];

    overlaySources.forEach((source) => {
      if (overlayAlphaMapsRef.current.has(source)) return;

      const image = new Image();
      image.decoding = 'async';
      image.src = source;

      image.onload = () => {
        if (disposed) return;
        const width = image.naturalWidth || image.width;
        const height = image.naturalHeight || image.height;
        if (!width || !height) {
          overlayAlphaMapsRef.current.set(source, null);
          return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { willReadFrequently: true });
        if (!context) {
          overlayAlphaMapsRef.current.set(source, null);
          return;
        }

        context.clearRect(0, 0, width, height);
        context.drawImage(image, 0, 0, width, height);
        const alphaData = context.getImageData(0, 0, width, height).data;
        overlayAlphaMapsRef.current.set(source, {
          width,
          height,
          alphaData,
        });
      };

      image.onerror = () => {
        if (disposed) return;
        overlayAlphaMapsRef.current.set(source, null);
      };
    });

    return () => {
      disposed = true;
    };
  }, [mainImageOverlaySrc, normalizedOverlayHotspots]);

  /**
   * Encuentra el hotspot superior cuyo píxel visible (alpha) ha sido pulsado.
   *
   * @param {number} clientX
   * @param {number} clientY
   * @returns {object | null}
   */
  const getOverlayHitByVisiblePixel = useCallback(
    (clientX, clientY) => {
      const overlayLayerNode = overlayLayerRef.current;
      if (!overlayLayerNode) return null;

      const layerRect = overlayLayerNode.getBoundingClientRect();
      if (!layerRect.width || !layerRect.height) return null;
      const pointerX = clientX - layerRect.left;
      const pointerY = clientY - layerRect.top;

      const candidates = [...normalizedOverlayHotspots].reverse();
      for (const hotspot of candidates) {
        const source =
          hotspot.overlayHitImage ??
          hotspot.overlayImage ??
          mainImageOverlaySrc ??
          getHotspotImage(hotspot);
        if (!source) continue;

        const alphaMap = overlayAlphaMapsRef.current.get(source);
        if (!alphaMap) continue;

        const containedRect = resolveContainedImageRect(
          layerRect.width,
          layerRect.height,
          alphaMap.width,
          alphaMap.height,
        );
        if (!containedRect) continue;

        const offsetY = parseLengthToPx(hotspot.overlayOffsetY ?? '0%', containedRect.height);
        const imageLeft = containedRect.x;
        const imageTop = containedRect.y + offsetY;
        const imageRight = imageLeft + containedRect.width;
        const imageBottom = imageTop + containedRect.height;

        if (
          pointerX < imageLeft ||
          pointerX > imageRight ||
          pointerY < imageTop ||
          pointerY > imageBottom
        ) {
          continue;
        }

        const normalizedX = (pointerX - imageLeft) / containedRect.width;
        const normalizedY = (pointerY - imageTop) / containedRect.height;
        if (
          normalizedX < 0 ||
          normalizedX > 1 ||
          normalizedY < 0 ||
          normalizedY > 1
        ) {
          continue;
        }

        const pixelX = Math.min(
          alphaMap.width - 1,
          Math.max(0, Math.floor(normalizedX * alphaMap.width)),
        );
        const pixelY = Math.min(
          alphaMap.height - 1,
          Math.max(0, Math.floor(normalizedY * alphaMap.height)),
        );
        const alphaIndex = (pixelY * alphaMap.width + pixelX) * 4 + 3;
        if ((alphaMap.alphaData[alphaIndex] ?? 0) > 10) {
          return hotspot;
        }
      }

      // Fallback geométrico: si el mapa alpha no detecta píxel visible,
      // usamos el área declarada del hotspot o una caja centrada por defecto.
      const fallbackCandidates = [...normalizedOverlayHotspots].reverse();
      for (const hotspot of fallbackCandidates) {
        const centerXRatio = parseRatio(hotspot.estilo?.left ?? hotspot.style?.left, 0.5);
        const centerYRatio = parseRatio(hotspot.estilo?.top ?? hotspot.style?.top, 0.5);
        const hitArea = hotspot.overlayHit ?? hotspot.hitArea ?? null;
        const defaultHitSize = Math.max(72, Math.round(84 * viewportScale));
        const hitWidth = hitArea
          ? parseLengthToPx(hitArea.width ?? `${defaultHitSize}px`, layerRect.width)
          : defaultHitSize;
        const hitHeight = hitArea
          ? parseLengthToPx(hitArea.height ?? `${defaultHitSize}px`, layerRect.height)
          : defaultHitSize;
        const hitLeft = hitArea
          ? parseLengthToPx(hitArea.left ?? `${centerXRatio * 100}%`, layerRect.width)
          : centerXRatio * layerRect.width - hitWidth / 2;
        const hitTop = hitArea
          ? parseLengthToPx(hitArea.top ?? `${centerYRatio * 100}%`, layerRect.height)
          : centerYRatio * layerRect.height - hitHeight / 2;
        const hitRight = hitLeft + hitWidth;
        const hitBottom = hitTop + hitHeight;

        if (pointerX >= hitLeft && pointerX <= hitRight && pointerY >= hitTop && pointerY <= hitBottom) {
          return hotspot;
        }
      }

      return null;
    },
    [mainImageOverlaySrc, normalizedOverlayHotspots, viewportScale],
  );

  /**
   * Gestiona el pointer down sobre la capa overlay y alterna hotspots.
   *
   * @param {PointerEvent | import('react').PointerEvent} event
   * @returns {void}
   */
  const handleOverlayLayerPointerDown = useCallback(
    (event) => {
      if (normalizedOverlayHotspots.length === 0) return;
      if (typeof event.button === 'number' && event.button !== 0) return;

      const hitHotspot = getOverlayHitByVisiblePixel(event.clientX, event.clientY);
      if (!hitHotspot) return;

      const layerNode = overlayLayerRef.current;
      const layerRect = layerNode?.getBoundingClientRect();
      const hasLayerSize = !!layerRect?.width && !!layerRect?.height;
      const clickXRatio = hasLayerSize
        ? Math.max(0, Math.min(1, (event.clientX - layerRect.left) / layerRect.width))
        : 0.5;
      const clickYRatio = hasLayerSize
        ? Math.max(0, Math.min(1, (event.clientY - layerRect.top) / layerRect.height))
        : 0.5;
      const isClosingCurrentOverlay = activeOverlayHotspotKey === hitHotspot.key;

      setActiveHotspotIndex(null);
      setPressedHotspotKey(hitHotspot.key);
      setActiveOverlayHotspotKey(isClosingCurrentOverlay ? null : hitHotspot.key);
      setOverlayArrowStartPoint(
        isClosingCurrentOverlay
          ? null
          : {
              key: hitHotspot.key,
              xRatio: clickXRatio,
              yRatio: clickYRatio,
            },
      );
    },
    [activeOverlayHotspotKey, getOverlayHitByVisiblePixel, normalizedOverlayHotspots.length],
  );

  /**
   * Recalcula la geometría de la flecha entre hotspot activo y panel de información.
   *
   * @returns {void}
   */
  const updateArrow = useCallback(() => {
    if (!showArrows || isMobile || (activeHotspotIndex === null && !activeOverlayHotspotKey)) {
      setArrowGeometry(null);
      return;
    }

    const activeHotspot = activeOverlayHotspotKey
      ? normalizedOverlayHotspots.find((hotspot) => hotspot.key === activeOverlayHotspotKey) ?? null
      : normalizedHotspots[activeHotspotIndex] ?? null;
    const activeHotspotKey = activeOverlayHotspotKey
      ? activeOverlayHotspotKey
      : activeHotspot?.key;
    const hotspotNode = activeOverlayHotspotKey
      ? overlayHotspotRefs.current[activeOverlayHotspotKey] ?? null
      : activeHotspotKey
        ? hotspotRefs.current[activeHotspotKey]
        : null;
    const panelNode = panelRef.current;

    if (!activeHotspot || !activeHotspotKey || !panelNode) {
      setArrowGeometry(null);
      return;
    }

    let startX = null;
    let startY = null;
    const canUseOverlayClickPoint =
      !!activeOverlayHotspotKey &&
      overlayArrowStartPoint?.key === activeOverlayHotspotKey &&
      Number.isFinite(overlayArrowStartPoint?.xRatio) &&
      Number.isFinite(overlayArrowStartPoint?.yRatio);

    if (canUseOverlayClickPoint) {
      const overlayLayerNode = overlayLayerRef.current;
      const overlayLayerRect = overlayLayerNode?.getBoundingClientRect();
      if (overlayLayerRect?.width && overlayLayerRect?.height) {
        startX = overlayLayerRect.left + overlayLayerRect.width * overlayArrowStartPoint.xRatio;
        startY = overlayLayerRect.top + overlayLayerRect.height * overlayArrowStartPoint.yRatio;
      }
    }

    if (startX === null || startY === null) {
      if (!hotspotNode) {
        setArrowGeometry(null);
        return;
      }
      const hotspotRect = hotspotNode.getBoundingClientRect();
      startX = hotspotRect.left + hotspotRect.width / 2;
      startY = hotspotRect.top + hotspotRect.height / 2;
    }

    const panelRect = panelNode.getBoundingClientRect();
    const targetRatioX = parseRatio(
      activeHotspot?.arrowTarget?.x ?? activeHotspot?.flechaObjetivo?.x,
      0,
    );
    const targetRatioY = parseRatio(
      activeHotspot?.arrowTarget?.y ?? activeHotspot?.flechaObjetivo?.y,
      0.5,
    );
    const endX = panelRect.left + panelRect.width * targetRatioX;
    const endY = panelRect.top + panelRect.height * targetRatioY;
    const vx = endX - startX;
    const vy = endY - startY;
    const distance = Math.hypot(vx, vy) || 1;
    if (distance < 24) {
      setArrowGeometry(null);
      return;
    }

    const activeLabel = activeHotspot?.label ?? activeHotspot?.nombre ?? '';
    const isApostlesArrow = /12\s*ap[oó]stoles/i.test(activeLabel);
    const isPantsArrow = /pantalon/i.test(activeLabel);
    const seed = [...activeHotspotKey].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const stickerIndex = isPantsArrow ? 2 : seed % ARROW_STICKERS.length;
    const sticker = ARROW_STICKERS[stickerIndex];
    const shouldFlipY = isPantsArrow && stickerIndex !== 2;
    const tipSource = shouldFlipY && sticker.tipFlipped ? sticker.tipFlipped : sticker.tip;
    const tailAnchor = {
      x: sticker.tail.x,
      y: shouldFlipY ? sticker.height - sticker.tail.y : sticker.tail.y,
    };
    const tipAnchor = {
      x: tipSource.x,
      y: shouldFlipY ? sticker.height - tipSource.y : tipSource.y,
    };
    const anchorDx = tipAnchor.x - tailAnchor.x;
    const anchorDy = tipAnchor.y - tailAnchor.y;
    const anchorDistance = Math.hypot(anchorDx, anchorDy) || 1;
    const scale = distance / anchorDistance;
    const sizeMultiplier = isApostlesArrow ? 0.82 : isPantsArrow ? 0.9 : 1;
    const finalScale = scale * sizeMultiplier;
    const anchorAngle = Math.atan2(anchorDy, anchorDx);
    const targetAngle = Math.atan2(vy, vx);
    const rotation = targetAngle - anchorAngle;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    const tailOffsetX = finalScale * (cos * tailAnchor.x - sin * tailAnchor.y);
    const tailOffsetY = finalScale * (sin * tailAnchor.x + cos * tailAnchor.y);
    const renderLeft = startX - tailOffsetX;
    const renderTop = startY - tailOffsetY;
    const arrowWidth = sticker.width * finalScale;
    const arrowHeight = sticker.height * finalScale;
    const angleDeg = (rotation * 180) / Math.PI;

    const nextGeometry = {
      src: sticker.src,
      left: renderLeft,
      top: renderTop,
      width: arrowWidth,
      height: arrowHeight,
      angleDeg,
      isFlippedY: shouldFlipY,
      key: `${activeHotspotKey}-${stickerIndex}`,
    };

    setArrowGeometry((prev) => {
      if (!prev || prev.key !== nextGeometry.key) return nextGeometry;
      const almostSamePosition =
        Math.abs(prev.left - nextGeometry.left) < 0.75 &&
        Math.abs(prev.top - nextGeometry.top) < 0.75 &&
        Math.abs(prev.width - nextGeometry.width) < 0.75 &&
        Math.abs(prev.height - nextGeometry.height) < 0.75 &&
        Math.abs(prev.angleDeg - nextGeometry.angleDeg) < 0.2 &&
        prev.isFlippedY === nextGeometry.isFlippedY &&
        prev.src === nextGeometry.src;
      return almostSamePosition ? prev : nextGeometry;
    });
  }, [
    activeHotspotIndex,
    activeOverlayHotspotKey,
    isMobile,
    normalizedHotspots,
    normalizedOverlayHotspots,
    overlayArrowStartPoint,
    showArrows,
  ]);

  /**
   * Programa la actualización de la geometría de la flecha en el siguiente frame.
   *
   * @returns {void}
   */
  const scheduleArrowUpdate = useCallback(() => {
    if (arrowRafRef.current !== null) return;
    arrowRafRef.current = window.requestAnimationFrame(() => {
      arrowRafRef.current = null;
      updateArrow();
    });
  }, [updateArrow]);

  useEffect(() => {
    setActiveImageHasError(false);
  }, [activeHotspotImage]);

  useEffect(() => {
    scheduleArrowUpdate();
    return () => {
      if (arrowRafRef.current !== null) {
        window.cancelAnimationFrame(arrowRafRef.current);
        arrowRafRef.current = null;
      }
    };
  }, [scheduleArrowUpdate]);

  useEffect(() => {
    if (activeHotspotIndex === null && !activeOverlayHotspotKey) return undefined;

    const handleUpdate = () => scheduleArrowUpdate();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, { passive: true });
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [activeHotspotIndex, activeOverlayHotspotKey, scheduleArrowUpdate]);

  useEffect(() => {
    if (!showArrows || isMobile) return;
    if (activeHotspotIndex === null && !activeOverlayHotspotKey) return;
    scheduleArrowUpdate();
  }, [
    activeHotspotIndex,
    activeOverlayHotspotKey,
    contentHotspotKey,
    isHotspotContentVisible,
    activeHotspotImage,
    hasHotspotImageGallery,
    isMobile,
    scheduleArrowUpdate,
    showArrows,
  ]);

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
   * Devuelve estilos de halo en función del tema visual del hotspot.
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
   * Devuelve estilos de punto central en función del tema visual del hotspot.
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
      {!isMobile && showArrows && arrowGeometry && (
        <div
          key={`arrow-screen-${arrowGeometry.key}`}
          aria-hidden="true"
          className="pointer-events-none fixed z-55 select-none timeline-prenda-arrow-sticker-shell"
          style={{
            left: `${arrowGeometry.left}px`,
            top: `${arrowGeometry.top}px`,
            width: `${arrowGeometry.width}px`,
            height: `${arrowGeometry.height}px`,
            transformOrigin: '0 0',
            transform: arrowGeometry.isFlippedY
              ? `rotate(${arrowGeometry.angleDeg}deg) translateY(${arrowGeometry.height}px) scaleY(-1)`
              : `rotate(${arrowGeometry.angleDeg}deg)`,
          }}
        >
          <img
            src={arrowGeometry.src}
            alt=""
            className="timeline-prenda-arrow-sticker"
            style={{
              width: `${arrowGeometry.width}px`,
              height: `${arrowGeometry.height}px`,
            }}
          />
        </div>
      )}

      <div className="timeline-mannequin-stage">
        <svg
          aria-hidden="true"
          focusable="false"
          width="0"
          height="0"
          style={{ position: 'absolute', width: 0, height: 0, overflow: 'hidden' }}
        >
          <defs>
            <filter
              id={overlayOutlineFilterId}
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feMorphology
                in="SourceAlpha"
                operator="dilate"
                radius={overlayOutlineDilateRadius}
                result="dilated"
              />
              <feComposite in="dilated" in2="SourceAlpha" operator="out" result="outline" />
              <feGaussianBlur in="outline" stdDeviation={overlayOutlineBlur} result="softOutline" />
              <feFlood floodColor={overlayOutlineColor} floodOpacity={overlayOutlineOpacity} result="white" />
              <feComposite in="white" in2="softOutline" operator="in" result="whiteOutline" />
              <feMerge>
                <feMergeNode in="whiteOutline" />
              </feMerge>
            </filter>
          </defs>
        </svg>
        <div className="timeline-mannequin-aura" aria-hidden="true" />
        <div
          className="timeline-mannequin-image-shell"
          style={{
            transform: `translateY(${mainImageOffsetY}) scale(${mainImageScaleMultiplier})`,
          }}
        >
          <div
            className="timeline-mannequin-image-float-layer"
            ref={overlayLayerRef}
            onPointerDown={handleOverlayLayerPointerDown}
            onPointerUp={() => setPressedHotspotKey(null)}
            onPointerCancel={() => setPressedHotspotKey(null)}
          >
            <img src={imageSrc} alt={bandoName ?? 'Bando'} className="timeline-mannequin-image" />
            {normalizedOverlayHotspots.length > 0 ? (
              normalizedOverlayHotspots.map((overlayHotspot) => {
                const overlayHotspotImage =
                  overlayHotspot.overlayImage ?? mainImageOverlaySrc ?? getHotspotImage(overlayHotspot);
                if (!overlayHotspotImage) return null;

                const overlayHotspotTop =
                  overlayHotspot.estilo?.top ?? overlayHotspot.style?.top ?? '30%';
                const overlayHotspotLeft =
                  overlayHotspot.estilo?.left ?? overlayHotspot.style?.left ?? '62%';
                const overlayHotspotOffsetY = overlayHotspot.overlayOffsetY ?? '0%';
                const overlayHitSizePx = Math.max(70, Math.round(78 * viewportScale));
                const overlayHitArea = overlayHotspot.overlayHit ?? overlayHotspot.hitArea ?? null;
                const overlayHitTop = overlayHitArea?.top ?? overlayHotspotTop;
                const overlayHitLeft = overlayHitArea?.left ?? overlayHotspotLeft;
                const overlayHitWidth = overlayHitArea?.width ?? `${overlayHitSizePx}px`;
                const overlayHitHeight = overlayHitArea?.height ?? `${overlayHitSizePx}px`;
                const overlayHitBorderRadius = overlayHitArea?.borderRadius ?? '50%';
                const overlayHaloSizePx = overlayHitArea?.haloSize ?? Math.max(42, Math.round(46 * viewportScale));
                const overlayHotspotKey = overlayHotspot.key;
                const isOverlayActive = activeOverlayHotspotKey === overlayHotspotKey;
                return (
                  <Fragment key={overlayHotspotKey}>
                    <img
                      src={overlayHotspotImage}
                      alt=""
                      aria-hidden="true"
                      className="timeline-mannequin-overlay-outline"
                      style={{
                        filter: `url(#${overlayOutlineFilterId})`,
                        transform: `translateY(${overlayHotspotOffsetY}) scale(${overlayOutlineScale})`,
                      }}
                    />
                    <img
                      src={overlayHotspotImage}
                      alt=""
                      aria-hidden="true"
                      className={`timeline-mannequin-overlay-image ${
                        isOverlayActive ? 'timeline-mannequin-overlay-image-active' : ''
                      }`}
                      style={{
                        transform: `translateY(${overlayHotspotOffsetY})`,
                        filter:
                          hotspotAccentMode === 'red'
                            ? isOverlayActive
                              ? 'drop-shadow(0 0 16px rgba(255, 224, 210, 1)) drop-shadow(0 0 34px rgba(255, 110, 50, 0.94)) drop-shadow(0 0 56px rgba(205, 58, 18, 0.68))'
                              : 'drop-shadow(0 0 12px rgba(255, 169, 132, 0.86)) drop-shadow(0 0 26px rgba(230, 86, 38, 0.64)) drop-shadow(0 0 40px rgba(180, 56, 18, 0.44))'
                            : isOverlayActive
                              ? 'drop-shadow(0 0 16px rgba(255, 255, 255, 1)) drop-shadow(0 0 34px rgba(255, 255, 255, 0.92)) drop-shadow(0 0 56px rgba(255, 255, 255, 0.62))'
                              : 'drop-shadow(0 0 12px rgba(255, 255, 255, 0.88)) drop-shadow(0 0 24px rgba(255, 255, 255, 0.66)) drop-shadow(0 0 38px rgba(255, 255, 255, 0.42))',
                      }}
                    />
                    <button
                      type="button"
                      className={`timeline-mannequin-overlay-hotspot ${
                        isOverlayActive ? 'timeline-mannequin-overlay-hotspot-active' : ''
                      }`}
                      onClick={() => {
                        setActiveHotspotIndex(null);
                        setOverlayArrowStartPoint(null);
                        setActiveOverlayHotspotKey((prev) => (prev === overlayHotspotKey ? null : overlayHotspotKey));
                      }}
                      onPointerDown={() => setPressedHotspotKey(overlayHotspotKey)}
                      onPointerUp={() => setPressedHotspotKey(null)}
                      onPointerCancel={() => setPressedHotspotKey(null)}
                      onPointerLeave={() => setPressedHotspotKey(null)}
                    onBlur={() => setPressedHotspotKey(null)}
                    aria-label={overlayHotspot.label ?? 'Elemento resaltado'}
                    aria-pressed={isOverlayActive}
                    title={overlayHotspot.label ?? 'Elemento resaltado'}
                      ref={(node) => {
                        if (node) {
                          overlayHotspotRefs.current[overlayHotspotKey] = node;
                        } else {
                          delete overlayHotspotRefs.current[overlayHotspotKey];
                        }
                      }}
                      style={{
                        top: overlayHotspotTop,
                        left: overlayHotspotLeft,
                        width: '1px',
                        height: '1px',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '50%',
                        opacity: 0,
                        pointerEvents: 'none',
                      }}
                      >
                {overlayHotspot.showHalo ? (
                  <span
                    className={`pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full timeline-prenda-hotspot-halo ${
                      isOverlayActive ? 'timeline-prenda-hotspot-halo-active' : ''
                    }`}
                    style={{
                      width: `${overlayHaloSizePx * overlayHaloScaleMultiplier}px`,
                      height: `${overlayHaloSizePx * overlayHaloScaleMultiplier}px`,
                      ...getHotspotHaloStyle(isOverlayActive),
                    }}
                  />
                ) : null}
                    </button>
                  </Fragment>
                );
              })
            ) : mainImageOverlaySrc ? (
              <img
                src={mainImageOverlaySrc}
                alt=""
                aria-hidden="true"
                className="timeline-mannequin-overlay-image"
              />
            ) : null}
          </div>
        </div>

        {normalizedHotspots.map((hotspot, index) => {
          const isActive = index === activeHotspotIndex;
          const isPressed = pressedHotspotKey === hotspot.key;
          const hotspotTop = hotspot?.estilo?.top ?? hotspot?.style?.top ?? '50%';
          const hotspotLeft = hotspot?.estilo?.left ?? hotspot?.style?.left ?? '50%';
          const hotspotLabel = hotspot?.label ?? hotspot?.nombre ?? `Prenda ${index + 1}`;
          const hotspotHitSizePx = Math.max(48, Math.round((isMobile ? 48 : 48) * viewportScale));
          const hotspotVisualSizePx = Math.max(14, Math.round((isMobile ? 16 : 15) * viewportScale));
          const hotspotHaloSizePx = Math.max(28, Math.round(hotspotVisualSizePx * 2.3));
          const toggleHotspot = () => {
            setActiveOverlayHotspotKey(null);
            setOverlayArrowStartPoint(null);
            setActiveHotspotIndex((prev) => (prev === index ? null : index));
          };

          return (
            <div
              key={hotspot.key}
              className="absolute z-30"
              style={{
                top: hotspotTop,
                left: hotspotLeft,
                width: `${hotspotHitSizePx}px`,
                height: `${hotspotHitSizePx}px`,
                transform: 'translate(-50%, -50%)',
              }}
              ref={(node) => {
                if (node) {
                  hotspotRefs.current[hotspot.key] = node;
                } else {
                  delete hotspotRefs.current[hotspot.key];
                }
              }}
            >
              <button
                type="button"
                onClick={toggleHotspot}
                onPointerDown={() => setPressedHotspotKey(hotspot.key)}
                onPointerUp={() => setPressedHotspotKey(null)}
                onPointerCancel={() => setPressedHotspotKey(null)}
                onPointerLeave={() => setPressedHotspotKey(null)}
                onBlur={() => setPressedHotspotKey(null)}
                className="relative block h-full w-full rounded-full"
                style={{
                  backgroundColor: 'transparent',
                  border: 'none',
                  padding: 0,
                  boxShadow: 'none',
                  transform: isPressed ? 'scale(0.92)' : 'scale(1)',
                  transition: 'transform 140ms ease',
                  appearance: 'none',
                  WebkitAppearance: 'none',
                  touchAction: 'manipulation',
                  WebkitTapHighlightColor: 'transparent',
                  userSelect: 'none',
                  cursor: 'pointer',
                }}
                aria-label={hotspotLabel}
                aria-pressed={isActive}
                title={hotspotLabel}
              >
                <span
                  className={`pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full timeline-prenda-hotspot-halo ${
                    isActive ? 'timeline-prenda-hotspot-halo-active' : ''
                  }`}
                  style={{
                    width: `${hotspotHaloSizePx * hotspotHaloScaleMultiplier}px`,
                    height: `${hotspotHaloSizePx * hotspotHaloScaleMultiplier}px`,
                    ...getHotspotHaloStyle(isActive),
                  }}
                />
                <span
                  className={`pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full timeline-prenda-hotspot-dot ${
                    isActive ? 'timeline-prenda-hotspot-dot-active' : ''
                  }`}
                  style={{
                    width: `${hotspotVisualSizePx}px`,
                    height: `${hotspotVisualSizePx}px`,
                    ...getHotspotDotStyle(isActive),
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {showMobilePrendaModal && (
        <div
          className="fixed inset-0 pointer-events-auto"
          style={{
            zIndex: 90,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            paddingTop: 'max(10px, env(safe-area-inset-top))',
            paddingRight: 'max(12px, env(safe-area-inset-right))',
            paddingBottom: 'max(0px, env(safe-area-inset-bottom))',
            paddingLeft: 'max(12px, env(safe-area-inset-left))',
            background: 'rgba(0, 0, 0, 0.72)',
            backdropFilter: 'blur(8px) saturate(110%)',
            WebkitBackdropFilter: 'blur(8px) saturate(110%)',
          }}
          role="dialog"
          aria-modal="true"
          aria-label={contentHotspot?.label || contentHotspot?.nombre || 'Información de la prenda'}
          onClick={closeActiveHotspot}
        >
          <div
            className="relative w-full overflow-hidden border timeline-prenda-mobile-sheet"
            style={{
              maxWidth: 'min(94vw, 560px)',
              height: 'min(78vh, calc(100vh - 24px))',
              background: `linear-gradient(180deg, ${hexToRgba(accentColor, 0.9)} 0%, ${hexToRgba(accentColor, 0.8)} 100%)`,
              borderColor: hexToRgba(accentColor, 0.92),
              borderWidth: '1px',
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              boxShadow: `0 22px 60px rgba(0, 0, 0, 0.42), 0 0 0 1px ${hexToRgba(accentColor, 0.18)}`,
              transformOrigin: 'bottom center',
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div
              className="flex h-full min-h-0 flex-col overflow-y-auto overscroll-y-contain"
              style={{
                height: '100%',
                minHeight: 0,
                WebkitOverflowScrolling: 'touch',
                touchAction: 'pan-y',
                overscrollBehaviorY: 'contain',
              }}
            >
              <div className="sticky top-0 z-20 flex justify-end px-3 pt-3">
                <button
                  type="button"
                  onClick={closeActiveHotspot}
                  className="flex h-7 w-7 items-center justify-center border text-black"
                  style={{
                    borderColor: hexToRgba(accentColor, 0.55),
                    background: 'rgba(255, 248, 234, 0.42)',
                    borderRadius: '9999px',
                    boxShadow: 'none',
                    opacity: 0.72,
                  }}
                  aria-label="Cerrar información de la prenda"
                >
                  <span style={{ fontSize: '0.95rem', lineHeight: 1, fontWeight: 900 }}>×</span>
                </button>
              </div>

              {showHotspotImageBlock ? (
              <div
                className={`timeline-hotspot-content-switch ${hotspotContentVisibilityClass} flex items-center ${hasHotspotImageGallery ? 'justify-start overflow-x-auto' : 'justify-center'}`}
                style={{
                    minHeight: '14vh',
                    maxHeight: '20vh',
                    paddingTop: '1rem',
                    paddingRight: '1rem',
                    paddingLeft: '1rem',
                    paddingBottom: '0.25rem',
                    gap: hasHotspotImageGallery
                      ? `${isUniformeEstandarGorroGallery ? Math.max(4, Math.round(6 * viewportScale)) : 12}px`
                      : undefined,
                  }}
                >
                  {activeHotspotImages.map((imageSrc, index) => (
                    <img
                      key={`${contentHotspot?.key ?? 'hotspot-image'}-${index}-${imageSrc}`}
                      src={imageSrc}
                      alt={contentHotspot?.label ?? contentHotspot?.nombre ?? `Prenda ${index + 1}`}
                      draggable="false"
                      className="object-contain"
                      onError={() => {
                        if (!hasHotspotImageGallery && index === 0) {
                          setActiveImageHasError(true);
                        }
                      }}
                      style={{
                        width: hasHotspotImageGallery
                          ? `min(${Math.round((isLargeHatGallery ? 290 : 210) * viewportScale)}px, ${isLargeHatGallery ? '58vw' : '44vw'})`
                          : '100%',
                        maxHeight: '20vh',
                        flex: hasHotspotImageGallery ? '0 0 auto' : '0 1 auto',
                        pointerEvents: 'none',
                        userSelect: 'none',
                        WebkitUserDrag: 'none',
                        marginLeft:
                          isUniformeEstandarGorroGallery && index > 0
                            ? `${-Math.max(14, Math.round(18 * viewportScale))}px`
                            : '0px',
                        transform:
                          index === 0
                            ? `translateX(${activeHotspotImageOffsetX}) translateY(${activeHotspotImageOffsetY}) rotate(${activeHotspotImageRotation})`
                            : isUniformeEstandarGorroGallery && index === 1
                              ? `translateY(${uniformeEstandarGorroGalleryOffsetY}px)`
                              : 'none',
                        filter:
                          'drop-shadow(0 18px 30px rgba(0, 0, 0, 0.42)) drop-shadow(0 8px 14px rgba(0, 0, 0, 0.26))',
                      }}
                    />
                  ))}
                </div>
              ) : null}

              <div
                className={`timeline-hotspot-content-switch ${hotspotContentVisibilityClass}`}
                style={{
                  paddingTop: showHotspotImageBlock ? '0.05rem' : '0.35rem',
                  paddingRight: '1rem',
                  paddingBottom: 'calc(2.2rem + env(safe-area-inset-bottom))',
                  paddingLeft: '1rem',
                }}
              >
                <p
                  className="font-black uppercase"
                  style={{
                    fontSize: `${(1.42 * viewportScale).toFixed(3)}rem`,
                    lineHeight: 1.04,
                    letterSpacing: '0.08em',
                    marginTop: 0,
                    marginBottom: '0.85rem',
                    color: '#000',
                    WebkitTextStroke: '0.3px #000',
                    textShadow: '0 4px 12px rgba(0, 0, 0, 0.28)',
                    whiteSpace: 'normal',
                    textWrap: 'balance',
                  }}
                >
                  {contentHotspot?.label || contentHotspot?.nombre}
                </p>
                <p
                  style={{
                    fontSize: `${(0.95 * viewportScale).toFixed(3)}rem`,
                    lineHeight: 1.58,
                    fontFamily: '"Mulish", sans-serif',
                    fontWeight: 600,
                    color: '#000',
                    textTransform: 'none',
                    whiteSpace: 'pre-line',
                    textWrap: 'pretty',
                    textShadow: 'none',
                    marginTop: 0,
                    marginBottom: 0,
                    letterSpacing: '0.01em',
                  }}
                >
                  {contentHotspot?.detalle}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {contentHotspot && !isMobile && (
        <div
          className={`fixed z-56 pointer-events-none p-3 rounded-none border timeline-hotspot-content-switch ${hotspotContentVisibilityClass}`}
          style={{
            right: '0px',
            width: '550px',
            bottom: `${Math.max(40, Math.round(60 * viewportScale))}px`,
            minHeight: `${infoPanelMinHeight}px`,
            paddingLeft: `${Math.max(20, Math.round(26 * viewportScale))}px`,
            paddingBottom: `${infoPanelPaddingBottom}px`,
            background: `linear-gradient(180deg, ${hexToRgba(accentColor, 0.66)} 0%, ${hexToRgba(accentColor, 0.58)} 100%)`,
            borderStyle: 'solid',
            borderTopWidth: '1px',
            borderBottomWidth: '1px',
            borderLeftWidth: '0px',
            borderRightWidth: '0px',
            borderTopColor: hexToRgba(accentColor, 0.9),
            borderBottomColor: hexToRgba(accentColor, 0.9),
            backdropFilter: 'blur(6px) saturate(108%)',
            WebkitBackdropFilter: 'blur(6px) saturate(108%)',
            boxShadow: `0 0 0 1px ${hexToRgba(accentColor, 0.2)}, 0 4px 10px rgba(0, 0, 0, 0.24)`,
          }}
        >
          <p
            className="font-black uppercase"
            style={{
              fontSize: `${((isMobile ? 1.35 : 2.05) * viewportScale).toFixed(3)}rem`,
              lineHeight: 1.08,
              letterSpacing: '0.08em',
              marginTop: '-32px',
              marginBottom: '10px',
              color: '#000',
              WebkitTextStroke: '0.3px #000',
              textShadow: '0 4px 12px rgba(0, 0, 0, 0.28)',
              whiteSpace: 'normal',
              textWrap: 'balance',
              position: 'relative',
            }}
          >
            {contentHotspot?.label || contentHotspot?.nombre}
          </p>
          <div style={{ marginTop: '38px' }}>
            <p
              style={{
                fontSize: `${((isMobile ? 0.82 : 0.95) * viewportScale).toFixed(3)}rem`,
                lineHeight: 1.6,
                fontFamily: '"Mulish", sans-serif',
                fontWeight: 600,
                color: '#000',
                textTransform: 'none',
                whiteSpace: 'pre-line',
                textWrap: 'pretty',
                textShadow: 'none',
                marginTop: 0,
                letterSpacing: '0.01em',
              }}
            >
              {contentHotspot?.detalle}
            </p>
          </div>
        </div>
      )}

      {contentHotspot && !isMobile && activeHotspotImages.length > 0 && (
        hasHotspotImageGallery ? (
          <div
            className={`fixed z-56 pointer-events-none timeline-hotspot-content-switch ${hotspotContentVisibilityClass}`}
            style={{
              right: `${Math.max(14, Math.round(110 * viewportScale))}px`,
              top: '40%',
              transform: 'translateY(-50%)',
              display: 'flex',
              alignItems: 'center',
              width: `${Math.max(
                isLargeHatGallery ? 520 : 360,
                Math.round((isLargeHatGallery ? 600 : 420) * viewportScale),
              )}px`,
              maxWidth: isLargeHatGallery ? '46vw' : '36vw',
              columnGap: '0px',
            }}
          >
            {activeHotspotImages.slice(0, 2).map((imageSrc, index) => (
              <img
                key={`desktop-floating-gallery-${index}-${imageSrc}`}
                ref={index === 0 ? panelRef : undefined}
                src={imageSrc}
                alt={contentHotspot?.label ?? contentHotspot?.nombre ?? `Prenda ${index + 1}`}
                className="object-contain timeline-prenda-sticker"
                onLoad={index === 0 ? scheduleArrowUpdate : undefined}
                style={{
                  width: `${isLargeHatGallery ? 56 : 50}%`,
                  maxHeight: floatingImageMaxHeight,
                  height: 'auto',
                  marginLeft:
                    isUniformeEstandarGorroGallery && index > 0
                      ? `${-Math.max(26, Math.round(34 * viewportScale))}px`
                      : '0px',
                  transform:
                    isUniformeEstandarGorroGallery && index === 1
                      ? `translateY(${uniformeEstandarGorroGalleryOffsetY}px)`
                      : 'none',
                  zIndex: index + 1,
                  filter:
                    'drop-shadow(0 28px 42px rgba(0, 0, 0, 0.52)) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.34))',
                }}
              />
            ))}
          </div>
        ) : (
          activeHotspotImage && !activeImageHasError && (
            <img
              ref={panelRef}
              src={activeHotspotImage}
              alt={contentHotspot?.label ?? contentHotspot?.nombre ?? 'Prenda'}
              className={`fixed z-56 pointer-events-none object-contain timeline-prenda-sticker timeline-hotspot-content-switch ${hotspotContentVisibilityClass}`}
              onLoad={scheduleArrowUpdate}
              onError={() => setActiveImageHasError(true)}
              style={{
                left: isMobile ? '50%' : 'auto',
                right: isMobile ? 'auto' : `${Math.max(14, Math.round(150 * viewportScale))}px`,
                top: isMobile ? 'auto' : '40%',
                bottom: isMobile ? `${Math.max(16, Math.round(20 * viewportScale))}px` : 'auto',
                transform: isMobile
                  ? `translateX(calc(-50% + ${activeHotspotImageOffsetX})) translateY(${activeHotspotImageOffsetY}) rotate(${activeHotspotImageRotation})`
                  : `translateX(${activeHotspotImageOffsetX}) translateY(calc(-50% + ${activeHotspotImageOffsetY})) rotate(${activeHotspotImageRotation})`,
                width: `${floatingImageWidthPx}px`,
                maxHeight: floatingImageMaxHeight,
                height: 'auto',
                filter:
                  'drop-shadow(0 28px 42px rgba(0, 0, 0, 0.52)) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.34))',
              }}
            />
          )
        )
      )}
    </div>
  );
}
