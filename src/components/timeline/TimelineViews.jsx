import BandoPrendaInspector from '../bando/BandoPrendaInspector';
import {
  BandoCenturyNav,
  BandoInfoPanel,
  BandoNavigationButtons,
  BackToTimelineButton,
  MobileBandoInfoButton,
} from './TimelineBandoControls';
import {
  BACKGROUND_FADE_MS,
  hexToRgba,
  LOOP_COPIES,
  TIMELINE_ENTRIES,
  TIMELINE_PADDING_LEFT,
  TIMELINE_PADDING_RIGHT,
  VIEW_TRANSITION_MS,
} from '../../data/timelineData.jsx';

export function BackgroundLayers({
  baseBackground,
  overlayBackground,
  overlayOpacity,
}) {
  return (
    <>
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: baseBackground ? `url(${baseBackground})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {overlayBackground && (
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${overlayBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: overlayOpacity,
            transition: `opacity ${BACKGROUND_FADE_MS}ms ease`,
          }}
        />
      )}
    </>
  );
}

export function CreditsButton({
  infoIcon,
  isBandoView,
  isMobile,
  onOpen,
  scalePx,
}) {
  if (isBandoView) return null;

  return (
    <button
      type="button"
      onClick={onOpen}
      className="pointer-events-auto absolute right-0 top-0 z-50 rounded-[3px] border transition-all duration-200"
      style={{
        right: `${scalePx(isMobile ? 10 : 14)}px`,
        top: `${scalePx(isMobile ? 10 : 14)}px`,
        width: `${scalePx(isMobile ? 56 : 64)}px`,
        height: `${scalePx(isMobile ? 56 : 64)}px`,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        borderWidth: '0px',
        boxShadow: 'none',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '0px',
      }}
      aria-label="Abrir información y créditos"
      title="Información y créditos"
    >
      <img
        src={infoIcon}
        alt=""
        aria-hidden="true"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'contain',
          pointerEvents: 'none',
          userSelect: 'none',
          WebkitUserDrag: 'none',
        }}
      />
    </button>
  );
}

export function TimelineScrollLayer({
  handlePointerDown,
  handlePointerEnd,
  handlePointerMove,
  isBandoView,
  isDragging,
  isElectronApp,
  isMobile,
  renderCenturyNode,
  renderConflictDot,
  scalePx,
  timelineLineThickness,
  viewportScale,
  wrapperRef,
}) {
  return (
    <div
      className="absolute inset-0"
      aria-hidden={isBandoView}
      style={{
        opacity: isBandoView ? 0 : 1,
        transform: isBandoView ? 'translateY(-10px) scale(0.995)' : 'translateY(0) scale(1)',
        filter: isBandoView ? (isElectronApp ? 'none' : 'blur(2px)') : 'blur(0px)',
        transition: `opacity ${VIEW_TRANSITION_MS}ms ease, transform ${VIEW_TRANSITION_MS}ms ease, filter ${VIEW_TRANSITION_MS}ms ease`,
        pointerEvents: isBandoView ? 'none' : 'auto',
      }}
    >
      <span
        className="absolute inset-x-0 top-1/2 z-0 -translate-y-1/2"
        style={{ height: timelineLineThickness, backgroundColor: '#000' }}
      />

      <div
        ref={wrapperRef}
        className={`timeline-scroll relative z-10 flex h-full w-full overflow-x-auto overflow-y-visible ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
        style={{
          WebkitOverflowScrolling: 'touch',
          touchAction: 'pan-x',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerCancel={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
      >
        {Array.from({ length: LOOP_COPIES }).map((_, copyIndex) => (
          <div
            key={`copy-${copyIndex}`}
            className="flex min-w-full shrink-0 items-center"
            style={{
              paddingLeft: `${isMobile ? scalePx(148) : scalePx(TIMELINE_PADDING_LEFT)}px`,
              paddingRight: `${isMobile ? scalePx(108) : scalePx(TIMELINE_PADDING_RIGHT)}px`,
            }}
          >
            {TIMELINE_ENTRIES.map((entry) =>
              entry.type === 'siglo' ? renderCenturyNode(entry) : renderConflictDot(entry),
            )}
          </div>
        ))}
      </div>

      <span
        className="timeline-swipe-hint pointer-events-none absolute bottom-6 left-1/2 z-30 -translate-x-1/2 text-center font-semibold uppercase tracking-[0.12em] text-[#fff8f1]"
        style={{
          color: 'rgba(255, 248, 241, 0.56)',
          fontSize: `${((isMobile ? 0.78 : 0.95) * viewportScale).toFixed(3)}rem`,
          whiteSpace: isMobile ? 'normal' : 'nowrap',
          maxWidth: isMobile ? `${scalePx(250)}px` : 'none',
          textShadow: '0 2px 10px rgba(0, 0, 0, 0.45)',
        }}
      >
        {'<- desliza la pantalla ->'}
      </span>
    </div>
  );
}

export function BandoViewLayer({
  activeConflict,
  activeSiglo,
  bandoNavTargets,
  casitaNegraIcon,
  conflictTitleWrapRef,
  handleBackToTimelineAtSiglo,
  handleBackToTimelineCurrent,
  handleBandoNav,
  isBandoInspectorReady,
  isBandoView,
  isCuartoArtilleriaTitle,
  isElectronApp,
  isIsabelinosTitle,
  isLongBandoDescription,
  isLongBandoTitle,
  isMilicianasTitle,
  isMobile,
  isMobileBandoInfoOpen,
  isMobilePrendaModalOpen,
  isSoldado1808Title,
  isSoldadoLineaTitle,
  mobileHotspotCloseSignal,
  mobileInfoButtonTopPx,
  pendingMobileInfoOpenRef,
  scalePx,
  selectedBando,
  selectedBandoDescription,
  selectedBandoHotspots,
  selectedBandoImage,
  selectedBandoName,
  setIsMobileBandoInfoOpen,
  setIsMobilePrendaModalOpen,
  setMobileHotspotCloseSignal,
  showBandoInfoPanel,
  sigloIdx,
  timelineLineHalfThickness,
  timelineLineThickness,
  viewportScale,
}) {
  return (
    <>
      <div
        className="absolute inset-0 z-20"
        aria-hidden={!isBandoView}
        style={{
          opacity: isBandoView ? 1 : 0,
          transform: isBandoView ? 'translateY(0px) scale(1)' : 'translateY(12px) scale(0.99)',
          filter: isBandoView ? 'blur(0px)' : (isElectronApp ? 'none' : 'blur(2px)'),
          transition: `opacity ${VIEW_TRANSITION_MS}ms ease, transform ${VIEW_TRANSITION_MS}ms ease, filter ${VIEW_TRANSITION_MS}ms ease`,
          pointerEvents: isBandoView ? 'auto' : 'none',
        }}
      >
        <div
          ref={conflictTitleWrapRef}
          className="pointer-events-none absolute inset-x-0 top-8 z-20 flex justify-center px-6"
        >
          <div
            className="rounded-none border px-6 py-2 text-center"
            style={{
              backgroundColor: hexToRgba(activeSiglo?.acento ?? '#7b8465', 0.76),
              borderColor: hexToRgba(activeSiglo?.acento ?? '#7b8465', 0.54),
              borderWidth: `${isMobile ? 2 : 3}px`,
              boxShadow: isElectronApp
                ? '0 4px 10px rgba(0, 0, 0, 0.18)'
                : '0 0 16px rgba(255, 255, 255, 0.28), 0 8px 20px rgba(0, 0, 0, 0.28)',
            }}
          >
            <p className="text-[0.9rem] font-black uppercase tracking-[0.3em] text-[#050505]">
              {activeConflict?.nombre ?? 'BANDOS'}
            </p>
          </div>
        </div>

        <BackToTimelineButton
          casitaNegraIcon={casitaNegraIcon}
          handleBackToTimelineCurrent={handleBackToTimelineCurrent}
          isBandoView={isBandoView}
          isMobile={isMobile}
          scalePx={scalePx}
          viewportScale={viewportScale}
        />

        <MobileBandoInfoButton
          activeSiglo={activeSiglo}
          isBandoView={isBandoView}
          isMobile={isMobile}
          isMobileBandoInfoOpen={isMobileBandoInfoOpen}
          isMobilePrendaModalOpen={isMobilePrendaModalOpen}
          mobileInfoButtonTopPx={mobileInfoButtonTopPx}
          pendingMobileInfoOpenRef={pendingMobileInfoOpenRef}
          scalePx={scalePx}
          setIsMobileBandoInfoOpen={setIsMobileBandoInfoOpen}
          setMobileHotspotCloseSignal={setMobileHotspotCloseSignal}
          viewportScale={viewportScale}
        />

        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-25"
          style={{
            height: timelineLineThickness,
            backgroundColor: '#000',
          }}
        />

        <BandoNavigationButtons
          activeSiglo={activeSiglo}
          bandoNavTargets={bandoNavTargets}
          handleBandoNav={handleBandoNav}
          isMobile={isMobile}
          isMobilePrendaModalOpen={isMobilePrendaModalOpen}
          scalePx={scalePx}
          timelineLineHalfThickness={timelineLineHalfThickness}
          timelineLineThickness={timelineLineThickness}
          viewportScale={viewportScale}
        />

        <div
          className={`absolute inset-0 z-10 flex items-center justify-center px-6 ${
            isBandoView ? 'pointer-events-auto' : 'pointer-events-none'
          }`}
        >
          {selectedBandoImage && isBandoInspectorReady ? (
            <BandoPrendaInspector
              imageSrc={selectedBandoImage}
              bandoName={selectedBando?.nombre ?? 'Bando'}
              hotspots={selectedBandoHotspots}
              showArrows={!selectedBando?.hideArrows}
              accentColor={activeSiglo?.acento ?? '#7b8465'}
              isMobile={isMobile}
              viewportScale={viewportScale}
              mainImageOverlayHotspots={
                selectedBando?.overlayHotspots
                  ?? (selectedBando?.overlayHotspot ? [selectedBando.overlayHotspot] : null)
              }
              imageScaleMultiplier={isCuartoArtilleriaTitle ? 2 : 1}
              mainImageScaleMultiplier={
                isCuartoArtilleriaTitle
                  ? 1.1
                  : isIsabelinosTitle
                    ? 1.06
                    : isSoldado1808Title
                      ? 1.06
                      : isSoldadoLineaTitle
                        ? 1.05
                        : isMilicianasTitle
                          ? 1.05
                          : 1
              }
              mainImageOffsetY={
                isCuartoArtilleriaTitle
                  ? '-3%'
                  : isIsabelinosTitle
                    ? '-1%'
                    : isSoldado1808Title
                      ? '-1%'
                      : isSoldadoLineaTitle
                        ? '-1%'
                    : isMilicianasTitle
                          ? '-1%'
                          : '0%'
              }
              onMobileHotspotModalChange={(isOpen) => {
                setIsMobilePrendaModalOpen(isOpen);
                if (isOpen) {
                  setIsMobileBandoInfoOpen(false);
                }
              }}
              closeMobileHotspotSignal={mobileHotspotCloseSignal}
            />
          ) : (
            <span className="text-[0.76rem] font-semibold uppercase tracking-[0.3em] text-[#fff8f1] opacity-85">
              Cargando...
            </span>
          )}
        </div>

        <BandoInfoPanel
          activeSiglo={activeSiglo}
          isCuartoArtilleriaTitle={isCuartoArtilleriaTitle}
          isElectronApp={isElectronApp}
          isLongBandoDescription={isLongBandoDescription}
          isLongBandoTitle={isLongBandoTitle}
          isMobile={isMobile}
          scalePx={scalePx}
          selectedBandoDescription={selectedBandoDescription}
          selectedBandoName={selectedBandoName}
          showBandoInfoPanel={showBandoInfoPanel}
          timelineLineThickness={timelineLineThickness}
          viewportScale={viewportScale}
        />
      </div>

      <BandoCenturyNav
        handleBackToTimelineAtSiglo={handleBackToTimelineAtSiglo}
        isBandoView={isBandoView}
        isMobile={isMobile}
        scalePx={scalePx}
        sigloIdx={sigloIdx}
        timelineLineHalfThickness={timelineLineHalfThickness}
        viewportScale={viewportScale}
      />
    </>
  );
}
