import introVideo from '../../assets/video/PANTALLA CARGA BATERIA ALTA (2).mp4';
import proyectoTecnicoImage from '../../assets/PROYECTOTECNICO.avif';

export function CenturyImageModal({
  expandedCenturyImage,
  isElectronApp,
  onClose,
}) {
  if (!expandedCenturyImage) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 z-80 flex items-center justify-center bg-black/72 px-4"
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Cerrar imagen ampliada"
        onClick={onClose}
        className="absolute right-4 top-4 z-82 rounded-xs border border-white/55 bg-black/46 px-3 py-1 text-sm font-semibold text-[#fff8f1]"
      >
        Cerrar
      </button>
      <img
        src={expandedCenturyImage.src}
        alt={expandedCenturyImage.alt}
        className="z-81 object-contain"
        style={{
          width: 'min(92vw, 1800px)',
          maxHeight: '90vh',
          height: 'auto',
          filter: isElectronApp
            ? 'grayscale(100%) contrast(1.03)'
            : 'grayscale(100%) contrast(1.06) drop-shadow(0 14px 28px rgba(0, 0, 0, 0.46))',
        }}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  );
}

export function CreditsOverlay({
  isOpen,
  isMobile,
  viewportScale,
  onClose,
}) {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="absolute inset-0 bg-black"
      style={{ zIndex: 95 }}
      onClick={onClose}
    >
      <button
        type="button"
        aria-label="Cerrar créditos"
        onClick={onClose}
        className="absolute right-4 top-4 z-92 rounded-xs border border-white/55 bg-black px-3 py-1 text-sm font-semibold text-[#fff8f1]"
      >
        Cerrar
      </button>
      <div
        className="flex h-full w-full items-center justify-center px-6 text-center"
        onClick={(event) => event.stopPropagation()}
      >
        <p
          style={{
            fontSize: `${((isMobile ? 0.9 : 1.08) * viewportScale).toFixed(3)}rem`,
            letterSpacing: '0.08em',
            color: 'rgba(255, 248, 241, 0.78)',
            textTransform: 'uppercase',
            fontWeight: 700,
          }}
        >
          Espacio reservado para imagen de créditos
        </p>
      </div>
    </div>
  );
}

export function IdleOverlay({
  idleVideoRef,
  isVisible,
  onExit,
}) {
  if (isVisible) {
    return (
      <div
        className="timeline-idle-overlay"
        role="button"
        tabIndex={0}
        onPointerDown={onExit}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            onExit();
          }
        }}
        aria-label="Iniciar interactivo"
      >
        <video
          ref={idleVideoRef}
          className="timeline-idle-video"
          src={introVideo}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
        />
        <div className="timeline-idle-overlay-content" aria-hidden="true">
          {'TOCA LA PANTALLA'}
        </div>
      </div>
    );
  }

  return (
    <img
      src={proyectoTecnicoImage}
      alt="Proyecto técnico"
      className="timeline-proyectotecnico-badge"
      draggable="false"
    />
  );
}
