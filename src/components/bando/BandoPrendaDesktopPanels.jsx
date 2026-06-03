import { hexToRgba } from './bandoInspectorData.jsx';

export function DesktopPrendaInfoPanel({
  accentColor,
  contentHotspot,
  hotspotContentVisibilityClass,
  infoPanelMinHeight,
  infoPanelPaddingBottom,
  isElectronApp,
  isMobile,
  viewportScale,
}) {
  if (!contentHotspot || isMobile) return null;

  return (
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
        backdropFilter: isElectronApp ? 'none' : 'blur(6px) saturate(108%)',
        WebkitBackdropFilter: isElectronApp ? 'none' : 'blur(6px) saturate(108%)',
        boxShadow: isElectronApp
          ? `0 0 0 1px ${hexToRgba(accentColor, 0.2)}, 0 2px 6px rgba(0, 0, 0, 0.18)`
          : `0 0 0 1px ${hexToRgba(accentColor, 0.2)}, 0 4px 10px rgba(0, 0, 0, 0.24)`,
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
  );
}

export function DesktopPrendaImagePanel({
  activeHotspotImage,
  activeHotspotImageOffsetX,
  activeHotspotImageOffsetY,
  activeHotspotImageRotation,
  activeHotspotImages,
  activeImageHasError,
  contentHotspot,
  floatingImageMaxHeight,
  floatingImageWidthPx,
  hasHotspotImageGallery,
  hotspotContentVisibilityClass,
  isElectronApp,
  isLargeHatGallery,
  isMobile,
  isUniformeEstandarGorroGallery,
  panelRef,
  scheduleArrowUpdate,
  setActiveImageHasError,
  uniformeEstandarGorroGalleryOffsetY,
  viewportScale,
}) {
  if (!contentHotspot || isMobile || activeHotspotImages.length === 0) return null;

  if (hasHotspotImageGallery) {
    return (
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
            decoding="async"
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
              filter: isElectronApp
                ? 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.32))'
                : 'drop-shadow(0 28px 42px rgba(0, 0, 0, 0.52)) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.34))',
            }}
          />
        ))}
      </div>
    );
  }

  if (!activeHotspotImage || activeImageHasError) return null;

  return (
    <img
      ref={panelRef}
      src={activeHotspotImage}
      alt={contentHotspot?.label ?? contentHotspot?.nombre ?? 'Prenda'}
      className={`fixed z-56 pointer-events-none object-contain timeline-prenda-sticker timeline-hotspot-content-switch ${hotspotContentVisibilityClass}`}
      decoding="async"
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
        filter: isElectronApp
          ? 'drop-shadow(0 12px 20px rgba(0, 0, 0, 0.32))'
          : 'drop-shadow(0 28px 42px rgba(0, 0, 0, 0.52)) drop-shadow(0 10px 18px rgba(0, 0, 0, 0.34))',
      }}
    />
  );
}
