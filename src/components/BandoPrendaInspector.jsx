import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import flechaA from '../assets/flechas/flecha_nueva_1.png';
import flechaB from '../assets/flechas/flecha_nueva_2.png';
import flechaC from '../assets/flechas/flecha_nueva_3.png';

const getHotspotImage = (hotspot) =>
  hotspot?.imagen ?? hotspot?.image ?? hotspot?.prendaImagen ?? hotspot?.asset ?? null;

const parsePercent = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)%$/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

const resolveSide = (hotspot, index) => {
  if (hotspot?.side === 'left' || hotspot?.side === 'right') return hotspot.side;
  const leftValue = parsePercent(hotspot?.estilo?.left ?? hotspot?.style?.left);
  if (leftValue !== null) return leftValue < 50 ? 'right' : 'left';
  return index % 2 === 0 ? 'right' : 'left';
};

const parseRatio = (value, fallback) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const normalized = value > 1 ? value / 100 : value;
    return Math.max(0, Math.min(1, normalized));
  }
  const asPercent = parsePercent(value);
  if (asPercent === null) return fallback;
  return Math.max(0, Math.min(1, asPercent / 100));
};

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

export default function BandoPrendaInspector({
  imageSrc,
  bandoName,
  hotspots,
  showArrows = true,
  isMobile = false,
  viewportScale = 1,
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

  const [activeHotspotIndex, setActiveHotspotIndex] = useState(null);
  const [activeImageHasError, setActiveImageHasError] = useState(false);
  const [arrowGeometry, setArrowGeometry] = useState(null);
  const hotspotRefs = useRef({});
  const panelRef = useRef(null);
  const arrowRafRef = useRef(null);

  useEffect(() => {
    setActiveHotspotIndex(null);
  }, [bandoName, imageSrc, normalizedHotspots.length]);

  const activeHotspot =
    activeHotspotIndex === null ? null : normalizedHotspots[activeHotspotIndex] ?? null;
  const activeHotspotImage = getHotspotImage(activeHotspot);

  const updateArrow = useCallback(() => {
    if (!showArrows || isMobile || activeHotspotIndex === null) {
      setArrowGeometry(null);
      return;
    }

    const activeHotspot = normalizedHotspots[activeHotspotIndex] ?? null;
    const activeHotspotKey = activeHotspot?.key;
    const hotspotNode = activeHotspotKey ? hotspotRefs.current[activeHotspotKey] : null;
    const panelNode = panelRef.current;

    if (!hotspotNode || !panelNode) {
      setArrowGeometry(null);
      return;
    }

    const hotspotRect = hotspotNode.getBoundingClientRect();
    const panelRect = panelNode.getBoundingClientRect();
    const startX = hotspotRect.left + hotspotRect.width / 2;
    const startY = hotspotRect.top + hotspotRect.height / 2;
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
    const sizeMultiplier = isPantsArrow ? 0.9 : 1;
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
  }, [activeHotspotIndex, isMobile, normalizedHotspots, showArrows]);

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
    if (activeHotspotIndex === null) return undefined;

    const handleUpdate = () => scheduleArrowUpdate();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, { passive: true });
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [activeHotspotIndex, scheduleArrowUpdate]);

  const floatingImageWidthPx = Math.max(210, Math.round((isMobile ? 228 : 300) * viewportScale));
  const floatingImageMaxHeight = `${Math.max(220, Math.round((isMobile ? 280 : 520) * viewportScale))}px`;

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
        <div className="timeline-mannequin-aura" aria-hidden="true" />
        <img
          src={imageSrc}
          alt=""
          aria-hidden="true"
          className="timeline-mannequin-silhouette-shadow"
        />
        <img src={imageSrc} alt={bandoName ?? 'Bando'} className="timeline-mannequin-image" />

        {normalizedHotspots.map((hotspot, index) => {
          const isActive = index === activeHotspotIndex;
          const hotspotTop = hotspot?.estilo?.top ?? hotspot?.style?.top ?? '50%';
          const hotspotLeft = hotspot?.estilo?.left ?? hotspot?.style?.left ?? '50%';
          const hotspotLabel = hotspot?.label ?? hotspot?.nombre ?? `Prenda ${index + 1}`;
          const hotspotSizePx = Math.max(24, Math.round((isMobile ? 26 : 30) * viewportScale));
          const coreSizePx = Math.max(8, Math.round(hotspotSizePx * 0.42));

          const toggleHotspot = () => {
            setActiveHotspotIndex((prev) => (prev === index ? null : index));
          };

          return (
            <div
              key={hotspot.key}
              className="absolute z-30"
              style={{
                top: hotspotTop,
                left: hotspotLeft,
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
                className="absolute rounded-full transition-all duration-200"
                style={{
                  transform: 'translate(-50%, -50%)',
                  top: '0px',
                  left: '0px',
                  width: `${hotspotSizePx}px`,
                  height: `${hotspotSizePx}px`,
                  backgroundColor: 'transparent',
                  borderColor: 'transparent',
                  boxShadow: 'none',
                }}
                aria-label={hotspotLabel}
                title={hotspotLabel}
              >
                <span
                  className={`pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full timeline-prenda-hotspot-halo ${
                    isActive ? 'timeline-prenda-hotspot-halo-active' : ''
                  }`}
                  style={{
                    width: `${hotspotSizePx}px`,
                    height: `${hotspotSizePx}px`,
                  }}
                />
                <span
                  className={`pointer-events-none absolute left-1/2 top-1/2 block -translate-x-1/2 -translate-y-1/2 rounded-full timeline-prenda-hotspot-dot ${
                    isActive ? 'timeline-prenda-hotspot-dot-active' : ''
                  }`}
                  style={{
                    width: `${coreSizePx}px`,
                    height: `${coreSizePx}px`,
                  }}
                />
              </button>
            </div>
          );
        })}
      </div>

      {activeHotspot && activeHotspotImage && !activeImageHasError && (
        <img
          ref={panelRef}
          src={activeHotspotImage}
          alt={activeHotspot?.label ?? activeHotspot?.nombre ?? 'Prenda'}
          className="fixed z-56 pointer-events-none object-contain timeline-prenda-sticker"
          onError={() => setActiveImageHasError(true)}
          style={{
            left: isMobile ? '50%' : 'auto',
            right: isMobile ? 'auto' : `${Math.max(14, Math.round(22 * viewportScale))}px`,
            top: isMobile ? 'auto' : '50%',
            bottom: isMobile ? `${Math.max(16, Math.round(20 * viewportScale))}px` : 'auto',
            transform: isMobile ? 'translateX(-50%)' : 'translateY(-50%)',
            width: `${floatingImageWidthPx}px`,
            maxHeight: floatingImageMaxHeight,
            height: 'auto',
            filter:
              'drop-shadow(0 28px 42px rgba(0, 0, 0, 0.52)) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.34))',
          }}
        />
      )}
    </div>
  );
}
