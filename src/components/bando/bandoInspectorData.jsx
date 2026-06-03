import flechaA from '../../assets/flechas/flecha_nueva_1.avif';
import flechaB from '../../assets/flechas/flecha_nueva_2.avif';
import flechaC from '../../assets/flechas/flecha_nueva_3.avif';

export const getHotspotImage = (hotspot) =>
  hotspot?.imagen ?? hotspot?.image ?? hotspot?.prendaImagen ?? hotspot?.asset ?? null;

export const parsePercent = (value) => {
  if (typeof value === 'number') return value;
  if (typeof value !== 'string') return null;
  const match = value.trim().match(/^(-?\d+(?:\.\d+)?)%$/);
  if (!match) return null;
  const parsed = Number.parseFloat(match[1]);
  return Number.isFinite(parsed) ? parsed : null;
};

export const resolveSide = (hotspot, index) => {
  if (hotspot?.side === 'left' || hotspot?.side === 'right') return hotspot.side;
  const leftValue = parsePercent(hotspot?.estilo?.left ?? hotspot?.style?.left);
  if (leftValue !== null) return leftValue < 50 ? 'right' : 'left';
  return index % 2 === 0 ? 'right' : 'left';
};

export const parseRatio = (value, fallback) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    const normalized = value > 1 ? value / 100 : value;
    return Math.max(0, Math.min(1, normalized));
  }
  const asPercent = parsePercent(value);
  if (asPercent === null) return fallback;
  return Math.max(0, Math.min(1, asPercent / 100));
};

export const parseLengthToPx = (value, referenceSize) => {
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

export const resolveContainedImageRect = (containerWidth, containerHeight, imageWidth, imageHeight) => {
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

export const ARROW_STICKERS = [
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

export const HOTSPOT_CONTENT_SWITCH_MS = 260;

export const scheduleIdleTask = (callback) => {
  if (typeof window !== 'undefined' && typeof window.requestIdleCallback === 'function') {
    const id = window.requestIdleCallback(callback, { timeout: 220 });
    return () => window.cancelIdleCallback(id);
  }

  const id = window.setTimeout(callback, 0);
  return () => window.clearTimeout(id);
};
