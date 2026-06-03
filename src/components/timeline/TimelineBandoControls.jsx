import { hexToRgba, ORDERED_HISTORIA, romanLabel, VIEW_TRANSITION_MS } from '../../data/timelineData.jsx';

export function BackToTimelineButton({
  casitaNegraIcon,
  handleBackToTimelineCurrent,
  isBandoView,
  isMobile,
  scalePx,
  viewportScale,
}) {
  if (!isBandoView) return null;

  return (
    <button
      type="button"
      onClick={handleBackToTimelineCurrent}
      className="pointer-events-auto absolute right-0 top-0 z-35 rounded-[3px] border font-black transition-all duration-200"
      style={{
        right: `${scalePx(isMobile ? 10 : 14)}px`,
        top: `${scalePx(isMobile ? 10 : 14)}px`,
        width: `${scalePx(isMobile ? 68 : 80)}px`,
        height: `${scalePx(isMobile ? 68 : 80)}px`,
        backgroundColor: 'transparent',
        color: '#000',
        borderColor: 'transparent',
        borderWidth: '0px',
        boxShadow: 'none',
        fontSize: `${((isMobile ? 1.0 : 1.15) * viewportScale).toFixed(3)}rem`,
        lineHeight: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0px',
      }}
      aria-label="Volver al timeline"
      title="Volver al timeline"
    >
      <img
        src={casitaNegraIcon}
        alt=""
        aria-hidden="true"
        style={{
          width: '400px',
          height: '400px',
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserDrag: 'none',
        }}
      />
    </button>
  );
}

export function MobileBandoInfoButton({
  activeSiglo,
  isBandoView,
  isMobile,
  isMobileBandoInfoOpen,
  isMobilePrendaModalOpen,
  mobileInfoButtonTopPx,
  pendingMobileInfoOpenRef,
  scalePx,
  setIsMobileBandoInfoOpen,
  setMobileHotspotCloseSignal,
  viewportScale,
}) {
  if (!isMobile || !isBandoView) return null;

  return (
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
  );
}

export function BandoNavigationButtons({
  activeSiglo,
  bandoNavTargets,
  handleBandoNav,
  isMobile,
  isMobilePrendaModalOpen,
  scalePx,
  timelineLineHalfThickness,
  timelineLineThickness,
  viewportScale,
}) {
  const renderButton = (side, target) => {
    if (!target) return null;
    const isLeft = side === 'left';

    return (
      <button
        type="button"
        onClick={() => handleBandoNav(target.nextIndex)}
        className={`pointer-events-auto absolute ${isLeft ? 'left-0 justify-start' : 'right-0 justify-end'} flex items-center gap-2 rounded-[3px] border uppercase transition-all duration-200`}
        style={{
          [side]: `${scalePx(isMobile ? 10 : 12)}px`,
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
        aria-label={`Ir al bando ${target.nextName}`}
        title={target.nextName}
      >
        {isLeft && <span style={{ fontSize: `${((isMobile ? 0.72 : 1.1) * viewportScale).toFixed(3)}rem`, lineHeight: 1 }}>{'<'}</span>}
        <span className={`truncate ${isLeft ? 'text-left' : 'text-right'} font-semibold`}>{target.nextName}</span>
        {!isLeft && <span style={{ fontSize: `${((isMobile ? 0.72 : 1.1) * viewportScale).toFixed(3)}rem`, lineHeight: 1 }}>{'>'}</span>}
      </button>
    );
  };

  return (
    <>
      {renderButton('left', bandoNavTargets?.left)}
      {renderButton('right', bandoNavTargets?.right)}
    </>
  );
}

export function BandoInfoPanel({
  activeSiglo,
  isCuartoArtilleriaTitle,
  isElectronApp,
  isLongBandoDescription,
  isLongBandoTitle,
  isMobile,
  scalePx,
  selectedBandoDescription,
  selectedBandoName,
  showBandoInfoPanel,
  timelineLineThickness,
  viewportScale,
}) {
  return (
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
        backdropFilter: isElectronApp ? 'none' : 'blur(6px) saturate(108%)',
        WebkitBackdropFilter: isElectronApp ? 'none' : 'blur(6px) saturate(108%)',
        opacity: showBandoInfoPanel ? 1 : 0,
        boxShadow: isMobile
          ? '0 0 18px rgba(255,255,255,0.26), 0 8px 16px rgba(0,0,0,0.2)'
          : (isElectronApp
              ? '0 0 0 1px rgba(255,255,255,0.16), 0 6px 14px rgba(0,0,0,0.18)'
              : '0 0 24px rgba(255,255,255,0.24), 0 12px 24px rgba(0,0,0,0.22)'),
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
  );
}

export function BandoCenturyNav({
  handleBackToTimelineAtSiglo,
  isBandoView,
  isMobile,
  scalePx,
  sigloIdx,
  timelineLineHalfThickness,
  viewportScale,
}) {
  return (
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
              className="rounded-[3px] border px-3 py-0.75 text-[0.72rem] font-semibold uppercase tracking-[0.16em] transition-all duration-200"
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
  );
}

