import { HISTORIA } from './conflictos';

export const romanLabel = (siglo) => siglo.replace(/^S\.?\s*/i, '').trim();

export const getImageTitle = (imagePath, fallback = '') => {
  if (!imagePath || typeof imagePath !== 'string') return fallback;
  const filename = imagePath.split('/').pop() ?? '';
  const baseWithoutExt = filename.replace(/\.[^.]+$/, '');
  const baseWithoutHash = baseWithoutExt.replace(/-[A-Za-z0-9_-]{6,}$/, '');
  const normalized = baseWithoutHash.replace(/[_-]+/g, ' ').trim();
  return normalized || fallback;
};

const getHotspotImage = (hotspot) =>
  hotspot?.imagen ?? hotspot?.image ?? hotspot?.prendaImagen ?? hotspot?.asset ?? null;

export const collectBandoImageSources = (bando) => {
  const sources = new Set();
  const addSource = (source) => {
    if (typeof source !== 'string') return;
    const trimmed = source.trim();
    if (trimmed) sources.add(trimmed);
  };
  const addHotspotSources = (hotspot) => {
    if (!hotspot) return;
    addSource(getHotspotImage(hotspot));
    addSource(hotspot.detailImage);
    addSource(hotspot.overlayImage);
    addSource(hotspot.overlayHitImage);
  };

  addSource(bando?.base);
  bando?.hotspots?.forEach(addHotspotSources);
  bando?.overlayHotspots?.forEach(addHotspotSources);
  addHotspotSources(bando?.overlayHotspot);

  return [...sources];
};

export const preloadImageSource = (source) =>
  new Promise((resolve) => {
    const image = new Image();
    image.decoding = 'async';
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = source;

    if (typeof image.decode === 'function') {
      image.decode().then(resolve).catch(resolve);
    }
  });

const PREFERRED_SIGLO_ORDER = ['S. XVII', 'S. XVIII', 'S. XIX', 'S. XX'];
const SXX_CONFLICT_ORDER = ['pre-guerra', 'guerra-civil'];

const reorderConflicts = (siglo) => {
  if (!siglo || siglo.siglo !== 'S. XX' || !Array.isArray(siglo.conflictos)) return siglo;

  const rankedConflicts = [...siglo.conflictos].sort((a, b) => {
    const rankA = SXX_CONFLICT_ORDER.indexOf(a?.id);
    const rankB = SXX_CONFLICT_ORDER.indexOf(b?.id);
    const safeRankA = rankA === -1 ? Number.MAX_SAFE_INTEGER : rankA;
    const safeRankB = rankB === -1 ? Number.MAX_SAFE_INTEGER : rankB;
    return safeRankA - safeRankB;
  });

  return {
    ...siglo,
    conflictos: rankedConflicts,
  };
};

export const ORDERED_HISTORIA = (() => {
  const ordered = PREFERRED_SIGLO_ORDER.map((label) =>
    HISTORIA.find((siglo) => siglo.siglo === label),
  )
    .filter(Boolean)
    .map(reorderConflicts);
  const remainder = HISTORIA
    .filter((siglo) => !PREFERRED_SIGLO_ORDER.includes(siglo.siglo))
    .map(reorderConflicts);
  return [...ordered, ...remainder];
})();

export const LOOP_COPIES = 1;
export const CIRCLE_SIZES = [214, 198, 226, 208];
export const CONNECTOR_LENGTHS = [170, 150, 185, 165];
export const BANDO_STACK_SPACING = 44;
export const CONFLICT_BANDO_DISTANCE_OFFSETS = {
  carlistas: [-18, 0],
  'guerra-civil': [-18, 0],
};
export const CONFLICT_BANDO_SPACING_OVERRIDES = {
  independencia: 78,
  'guerra-civil': 74,
};
export const OPEN_RADIUS_FACTOR = 0.43;
export const CLOSE_RADIUS_FACTOR = 0.48;
export const TIMELINE_PADDING_LEFT = 380;
export const TIMELINE_PADDING_RIGHT = 220;
export const EDGE_LOCK_FACTOR = 0.16;
export const SIGLO_SELECTION_PROBE_FACTOR = 0.35;
export const MIN_AUTO_SIGLO_SWITCH_MS = 380;
export const EDGE_STEP_SWITCH_MS = 260;
export const LINE_TRANSITION = 'top 0.65s cubic-bezier(0.22, 1, 0.36, 1), height 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
export const LINE_TRANSITION_NO_TOP = 'height 0.65s cubic-bezier(0.22, 1, 0.36, 1)';
export const BANDO_APPEAR_OPEN = 'opacity 0.3s ease 0.3s';
export const BANDO_APPEAR_CLOSE = 'opacity 0.2s ease';
export const BACKGROUND_FADE_MS = 700;
export const SIGLO_PILL_WIDTH = 108;
export const ACTIVE_CIRCLE_SCALES = [1.36, 1.18, 1.46, 1.3];
export const INACTIVE_CIRCLE_SCALES = [0.92, 0.9, 0.92, 0.9];
export const CENTURY_IMAGE_PREVIEW_FRAMING = [
  { scale: 1.14, position: '50% 38%' },
  { scale: 1.08, position: '50% 42%' },
  { scale: 1.1, position: '50% 36%' },
  { scale: 1.08, position: '50% 34%' },
];
export const FOUR_K_BASE_WIDTH = 1920;
export const FOUR_K_MAX_SCALE = 1.6;
export const RETURN_REVEAL_MS = 720;
export const VIEW_TRANSITION_MS = 420;
export const BANDO_EXIT_DOT_SWITCH_DELAY_MS = VIEW_TRANSITION_MS + 24;
export const XIX_SIGLO_FOCUS_RATIO = 0.42;
export const LAST_SIGLO_FOCUS_RATIO = 0.35;
export const MOBILE_BREAKPOINT = 960;
export const MOBILE_TIMELINE_SCALE = 0.8;
export const MOBILE_LINE_THICKNESS = '1.2cm';
export const MOBILE_LINE_HALF_THICKNESS = '0.6cm';
export const IDLE_TIMEOUT_MS = 30000;

const BASE_CONFLICT_CONNECTOR = 178;
const CONFLICT_NODE_WIDTH = 356;
const SINGLE_CONFLICT_EXTRA_WIDTH = 146;
const CONFLICT_CONNECTOR_LENGTH_OVERRIDES = {
  'defensa-gijon': 192,
  sucesion: 232,
  independencia: 174,
  carlistas: 258,
  'hispano-americana': 214,
  republica: 182,
  'pre-guerra': 238,
  'guerra-civil': 276,
};

export const hexToRgba = (hex, alpha) => {
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

const buildTimelineEntries = () => {
  const entries = [];
  ORDERED_HISTORIA.forEach((siglo, sigloIndex) => {
    entries.push({ type: 'siglo', sigloIndex });
    (siglo.conflictos ?? []).forEach((_, conflictIndex) => {
      entries.push({ type: 'dot', sigloIndex, conflictIndex, key: `dot-${sigloIndex}-${conflictIndex}` });
    });
  });
  return entries;
};

export const TIMELINE_ENTRIES = buildTimelineEntries();
export const DOT_ENTRIES = TIMELINE_ENTRIES.filter((entry) => entry.type === 'dot');

export const getDefaultDotKey = () => {
  const firstDot = TIMELINE_ENTRIES.find((entry) => entry.type === 'dot');
  return firstDot?.key ?? null;
};

export const getConflictConnectorBaseLength = (conflictId, conflictIndex) => {
  const override = CONFLICT_CONNECTOR_LENGTH_OVERRIDES[conflictId];
  if (typeof override === 'number') return override;

  const seed = `${conflictId ?? 'conflict'}-${conflictIndex ?? 0}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }

  return BASE_CONFLICT_CONNECTOR - 18 + (Math.abs(hash) % 84);
};

export const getConflictNodeWidth = (sigloIndex) => {
  const conflictCount = ORDERED_HISTORIA[sigloIndex]?.conflictos?.length ?? 0;
  return conflictCount <= 1
    ? CONFLICT_NODE_WIDTH + SINGLE_CONFLICT_EXTRA_WIDTH
    : CONFLICT_NODE_WIDTH;
};

export const getViewportScale = (viewportWidth) => {
  if (viewportWidth <= FOUR_K_BASE_WIDTH) return 1;
  const progression = (viewportWidth - FOUR_K_BASE_WIDTH) / FOUR_K_BASE_WIDTH;
  return Math.min(FOUR_K_MAX_SCALE, 1 + progression * 0.6);
};

export const toTwoLineLabel = (text) => {
  const words = (text ?? '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= 1) return text;
  const splitIndex = Math.ceil(words.length / 2);
  return `${words.slice(0, splitIndex).join(' ')}\n${words.slice(splitIndex).join(' ')}`;
};

export const getSigloFocusRatio = (index) => {
  if (index === ORDERED_HISTORIA.length - 1) return LAST_SIGLO_FOCUS_RATIO;
  if (index === ORDERED_HISTORIA.length - 2) return XIX_SIGLO_FOCUS_RATIO;
  return SIGLO_SELECTION_PROBE_FACTOR;
};

