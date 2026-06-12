import { Fragment } from 'react';
import { getHotspotImage, hexToRgba } from './bandoInspectorData.jsx';

export function PrendaArrowSticker({ arrowGeometry, isMobile, showArrows }) {
  if (isMobile || !showArrows || !arrowGeometry) return null;

  return (
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
  );
}

export function MannequinStage({
  activeHotspotIndex,
  activeOverlayHotspotKey,
  bandoName,
  getHotspotDotStyle,
  getHotspotHaloStyle,
  handleOverlayLayerPointerDown,
  hotspotAccentMode,
  hotspotHaloScaleMultiplier,
  hotspotRefs,
  imageSrc,
  isMobile,
  mainImageOffsetY,
  mainImageOverlaySrc,
  mainImageScaleMultiplier,
  normalizedHotspots,
  normalizedOverlayHotspots,
  overlayHotspotRefs,
  overlayLayerRef,
  pressedHotspotKey,
  setActiveHotspotIndex,
  setActiveOverlayHotspotKey,
  setOverlayArrowStartPoint,
  setPressedHotspotKey,
  viewportScale,
}) {
  return (
    <div className="timeline-mannequin-stage">
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
          <img
            src={imageSrc}
            alt={bandoName ?? 'Bando'}
            className="timeline-mannequin-image"
            decoding="async"
          />
          {normalizedOverlayHotspots.length > 0 ? (
            normalizedOverlayHotspots.map((overlayHotspot, overlayHotspotIndex) => {
              const overlayHotspotImage =
                overlayHotspot.overlayImage ?? mainImageOverlaySrc ?? getHotspotImage(overlayHotspot);
              if (!overlayHotspotImage) return null;

              const overlayHotspotTop =
                overlayHotspot.estilo?.top ?? overlayHotspot.style?.top ?? '30%';
              const overlayHotspotLeft =
                overlayHotspot.estilo?.left ?? overlayHotspot.style?.left ?? '62%';
              const overlayHotspotOffsetY = overlayHotspot.overlayOffsetY ?? '0%';
              const overlayHotspotKey = overlayHotspot.key;
              const isOverlayActive = activeOverlayHotspotKey === overlayHotspotKey;
              const overlayCueAccentClass =
                hotspotAccentMode === 'red'
                  ? 'timeline-mannequin-overlay-cue-red'
                  : hotspotAccentMode === 'blue'
                    ? 'timeline-mannequin-overlay-cue-blue'
                    : '';
              const overlayImageAccentClass =
                hotspotAccentMode === 'red'
                  ? 'timeline-mannequin-overlay-image-red'
                  : hotspotAccentMode === 'blue'
                    ? 'timeline-mannequin-overlay-image-blue'
                    : '';

              return (
                <Fragment key={overlayHotspotKey}>
                  <div
                    aria-hidden="true"
                    className={`timeline-mannequin-overlay-cue ${overlayCueAccentClass} ${
                      isOverlayActive ? 'timeline-mannequin-overlay-cue-active' : ''
                    }`}
                    style={{
                      '--overlay-offset-y': overlayHotspotOffsetY,
                      '--overlay-pulse-delay': `${(overlayHotspotIndex % 4) * 180}ms`,
                      '--overlay-mask-image': `url("${overlayHotspotImage}")`,
                    }}
                  />
                  <img
                    src={overlayHotspotImage}
                    alt=""
                    aria-hidden="true"
                    className={`timeline-mannequin-overlay-image ${overlayImageAccentClass} ${
                      isOverlayActive ? 'timeline-mannequin-overlay-image-active' : ''
                    }`}
                    decoding="async"
                    style={{
                      '--overlay-offset-y': overlayHotspotOffsetY,
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
              decoding="async"
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
  );
}

export function MobilePrendaModal({
  accentColor,
  activeHotspotImageOffsetX,
  activeHotspotImageOffsetY,
  activeHotspotImageRotation,
  activeHotspotImages,
  closeActiveHotspot,
  contentHotspot,
  hasHotspotImageGallery,
  hotspotContentVisibilityClass,
  isElectronApp,
  isLargeHatGallery,
  isUniformeEstandarGorroGallery,
  onSingleImageError,
  showHotspotImageBlock,
  showMobilePrendaModal,
  uniformeEstandarGorroGalleryOffsetY,
  viewportScale,
}) {
  if (!showMobilePrendaModal) return null;

  return (
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
        backdropFilter: isElectronApp ? 'none' : 'blur(8px) saturate(110%)',
        WebkitBackdropFilter: isElectronApp ? 'none' : 'blur(8px) saturate(110%)',
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
          boxShadow: isElectronApp
            ? `0 14px 30px rgba(0, 0, 0, 0.34), 0 0 0 1px ${hexToRgba(accentColor, 0.18)}`
            : `0 22px 60px rgba(0, 0, 0, 0.42), 0 0 0 1px ${hexToRgba(accentColor, 0.18)}`,
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
                  decoding="async"
                  onError={() => {
                    if (!hasHotspotImageGallery && index === 0) onSingleImageError();
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
                    filter: isElectronApp
                      ? 'drop-shadow(0 10px 18px rgba(0, 0, 0, 0.30))'
                      : 'drop-shadow(0 18px 30px rgba(0, 0, 0, 0.42)) drop-shadow(0 8px 14px rgba(0, 0, 0, 0.26))',
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
  );
}
