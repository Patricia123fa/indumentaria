import { useCallback, useEffect } from 'react';
import {
  getHotspotImage,
  parseLengthToPx,
  parseRatio,
  resolveContainedImageRect,
  scheduleIdleTask,
} from './bandoInspectorData.jsx';

export function useOverlayPixelHotspots({
  activeOverlayHotspotKey,
  mainImageOverlaySrc,
  normalizedOverlayHotspots,
  overlayAlphaMapsRef,
  overlayLayerRef,
  setActiveHotspotIndex,
  setActiveOverlayHotspotKey,
  setOverlayArrowStartPoint,
  setPressedHotspotKey,
  viewportScale,
}) {
  useEffect(() => {
    let disposed = false;
    const cancelIdleTasks = [];
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

      image.onload = () => {
        if (disposed) return;
        const cancelIdleTask = scheduleIdleTask(() => {
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
        });
        cancelIdleTasks.push(cancelIdleTask);
      };

      image.onerror = () => {
        if (disposed) return;
        overlayAlphaMapsRef.current.set(source, null);
      };

      image.src = source;
    });

    return () => {
      disposed = true;
      cancelIdleTasks.forEach((cancelIdleTask) => cancelIdleTask());
    };
  }, [mainImageOverlaySrc, normalizedOverlayHotspots, overlayAlphaMapsRef]);

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

      const fallbackCandidates = [...normalizedOverlayHotspots]
        .reverse()
        .filter((hotspot) => {
          const source =
            hotspot.overlayHitImage ??
            hotspot.overlayImage ??
            mainImageOverlaySrc ??
            getHotspotImage(hotspot);

          return !source || overlayAlphaMapsRef.current.get(source) === null;
        });

      for (const hotspot of fallbackCandidates) {
        const declaredHitArea = hotspot.overlayHit ?? hotspot.hitArea ?? null;
        const centerXRatio = parseRatio(hotspot.estilo?.left ?? hotspot.style?.left, 0.5);
        const centerYRatio = parseRatio(hotspot.estilo?.top ?? hotspot.style?.top, 0.5);
        const defaultHitSize = Math.max(72, Math.round(84 * viewportScale));
        const hitWidth = declaredHitArea
          ? parseLengthToPx(declaredHitArea.width ?? `${defaultHitSize}px`, layerRect.width)
          : defaultHitSize;
        const hitHeight = declaredHitArea
          ? parseLengthToPx(declaredHitArea.height ?? `${defaultHitSize}px`, layerRect.height)
          : defaultHitSize;
        const hitLeft = declaredHitArea
          ? parseLengthToPx(declaredHitArea.left ?? `${centerXRatio * 100}%`, layerRect.width)
          : centerXRatio * layerRect.width - hitWidth / 2;
        const hitTop = declaredHitArea
          ? parseLengthToPx(declaredHitArea.top ?? `${centerYRatio * 100}%`, layerRect.height)
          : centerYRatio * layerRect.height - hitHeight / 2;
        const hitRight = hitLeft + hitWidth;
        const hitBottom = hitTop + hitHeight;

        if (pointerX >= hitLeft && pointerX <= hitRight && pointerY >= hitTop && pointerY <= hitBottom) {
          return hotspot;
        }
      }

      return null;
    },
    [mainImageOverlaySrc, normalizedOverlayHotspots, overlayAlphaMapsRef, overlayLayerRef, viewportScale],
  );

  return useCallback(
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
    [
      activeOverlayHotspotKey,
      getOverlayHitByVisiblePixel,
      normalizedOverlayHotspots.length,
      overlayLayerRef,
      setActiveHotspotIndex,
      setActiveOverlayHotspotKey,
      setOverlayArrowStartPoint,
      setPressedHotspotKey,
    ],
  );
}
