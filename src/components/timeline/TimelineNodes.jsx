import {
  ACTIVE_CIRCLE_SCALES,
  BANDO_APPEAR_CLOSE,
  BANDO_APPEAR_OPEN,
  BANDO_STACK_SPACING,
  CENTURY_IMAGE_PREVIEW_FRAMING,
  CIRCLE_SIZES,
  CONFLICT_BANDO_DISTANCE_OFFSETS,
  CONFLICT_BANDO_SPACING_OVERRIDES,
  getConflictConnectorBaseLength,
  getConflictNodeWidth,
  getImageTitle,
  hexToRgba,
  INACTIVE_CIRCLE_SCALES,
  LINE_TRANSITION,
  LINE_TRANSITION_NO_TOP,
  ORDERED_HISTORIA,
  romanLabel,
  SIGLO_PILL_WIDTH,
  toTwoLineLabel,
} from '../../data/timelineData.jsx';

export function CenturyNode({
  centuryImages,
  centuryRefs,
  dragRef,
  entry,
  handleCenturyImageClick,
  handleSigloClick,
  hoveredCenturyIdx,
  isMobile,
  scaleTimelinePx,
  setHoveredCenturyIdx,
  sigloIdx,
  timelineLineHalfThickness,
  timelineLineThickness,
  viewportScale,
}) {
  const index = entry.sigloIndex;
  const siglo = ORDERED_HISTORIA[index];
  const fallbackTitle = siglo?.etiqueta ?? siglo?.siglo ?? '';
  const centuryCaption = siglo?.pieDeFoto ?? 'Pie de foto. Grabado original de GijÃ³n';
  const centuryImage = centuryImages[index] ?? null;
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
  const centuryImagePreviewFraming = CENTURY_IMAGE_PREVIEW_FRAMING[index] ?? {
    scale: 1.08,
    position: '50% 50%',
  };
  const pillWidth = scaleTimelinePx(SIGLO_PILL_WIDTH);
  const pillDisplayWidth = Math.max(pillWidth, Math.round(displayBlockWidth * 0.94));
  const centerMaskWidth = displayBlockWidth + scaleTimelinePx(isMobile ? 68 : 96);
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
        onMouseLeave={() => setHoveredCenturyIdx((prev) => (prev === index ? null : prev))}
        onFocus={() => setHoveredCenturyIdx(index)}
        onBlur={() => setHoveredCenturyIdx((prev) => (prev === index ? null : prev))}
        className="absolute z-5"
        aria-pressed={isActive}
        style={{
          width: `${displayBlockWidth}px`,
          left: `calc(50% - ${halfDisplayBlockWidth}px)`,
          top: isTop ? '0px' : `calc(50% + ${timelineLineHalfThickness})`,
          bottom: isTop ? `calc(50% + ${timelineLineHalfThickness})` : '0px',
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
            overflow: 'hidden',
            backgroundColor: centuryImage ? 'transparent' : '#fff',
            opacity: 1,
            transition: 'width 0.35s ease, height 0.35s ease',
          }}
        >
          {centuryImage ? (
            <img
              src={centuryImage}
              alt=""
              aria-hidden="true"
              draggable="false"
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                objectPosition: centuryImagePreviewFraming.position,
                transform: `scale(${centuryImagePreviewFraming.scale})`,
                transformOrigin: 'center center',
                filter: 'grayscale(100%) contrast(1.06)',
                pointerEvents: 'none',
                userSelect: 'none',
                WebkitUserDrag: 'none',
              }}
            />
          ) : null}
        </span>
        {isActive && centuryImageTitle && (
          <span
            className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 font-semibold"
            style={{
              top: `calc(50% + ${activeCenturyTitleOffset}px)`,
              width: `${Math.max(imageHoleWidth, scaleTimelinePx(isMobile ? 94 : 120))}px`,
              fontSize: `${((isMobile ? 0.56 : 0.64) * viewportScale).toFixed(3)}rem`,
              letterSpacing: '0.02em',
              lineHeight: 1.14,
              fontFamily: '"Mulish", sans-serif',
              color: '#050505',
              textAlign: 'center',
              textTransform: 'none',
              whiteSpace: 'normal',
              overflowWrap: 'anywhere',
              wordBreak: 'break-word',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
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
}

export function ConflictDot({
  activeDotKey,
  dotRefs,
  entry,
  expandedDotsByKey,
  forcedRevealSigloIdx,
  getConflict,
  handleBandoClick,
  handleDotClick,
  isMobile,
  scaleTimelinePx,
  viewportScale,
}) {
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
        className="pointer-events-none absolute left-1/2 top-1/2 z-20 -translate-x-1/2 -translate-y-1/2 rounded-sm px-5 py-1 text-center text-[0.82rem] font-bold uppercase tracking-[0.08em]"
        style={{
          padding: `${scaleTimelinePx(conflictPillPaddingY)}px ${scaleTimelinePx(conflictPillPaddingX)}px`,
          fontSize: `${(0.82 * viewportScale * conflictPillFontFactor).toFixed(3)}rem`,
          lineHeight: conflictPillLineHeight,
          color: conflictCenturyAccent,
          backgroundColor: '#000',
          boxShadow: '0 8px 18px rgba(20, 14, 10, 0.22)',
          textShadow: 'none',
        }}
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
              className="absolute left-1/2 block h-5 w-5 -translate-x-1/2 -translate-y-1/2 rounded-xs border-[6px] border-black/80 bg-white/55 pointer-events-auto cursor-pointer"
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
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xs timeline-click-halo"
                style={{ width: `${bandoInnerSize}px`, height: `${bandoInnerSize}px` }}
              />
              <span
                className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-xs bg-black timeline-dot-core"
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
}

