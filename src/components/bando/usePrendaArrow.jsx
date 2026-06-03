import { useCallback, useEffect, useState } from 'react';
import { ARROW_STICKERS, parseRatio } from './bandoInspectorData.jsx';

export function usePrendaArrow({
  activeHotspotImage,
  activeHotspotIndex,
  activeOverlayHotspotKey,
  arrowRafRef,
  contentHotspotKey,
  hasHotspotImageGallery,
  hotspotRefs,
  isHotspotContentVisible,
  isMobile,
  normalizedHotspots,
  normalizedOverlayHotspots,
  overlayArrowStartPoint,
  overlayHotspotRefs,
  overlayLayerRef,
  panelRef,
  showArrows,
}) {
  const [arrowGeometry, setArrowGeometry] = useState(null);

  const updateArrow = useCallback(() => {
    if (!showArrows || isMobile || (activeHotspotIndex === null && !activeOverlayHotspotKey)) {
      setArrowGeometry(null);
      return;
    }

    const activeHotspot = activeOverlayHotspotKey
      ? normalizedOverlayHotspots.find((hotspot) => hotspot.key === activeOverlayHotspotKey) ?? null
      : normalizedHotspots[activeHotspotIndex] ?? null;
    const activeHotspotKey = activeOverlayHotspotKey
      ? activeOverlayHotspotKey
      : activeHotspot?.key;
    const hotspotNode = activeOverlayHotspotKey
      ? overlayHotspotRefs.current[activeOverlayHotspotKey] ?? null
      : activeHotspotKey
        ? hotspotRefs.current[activeHotspotKey]
        : null;
    const panelNode = panelRef.current;

    if (!activeHotspot || !activeHotspotKey || !panelNode) {
      setArrowGeometry(null);
      return;
    }

    let startX = null;
    let startY = null;
    const canUseOverlayClickPoint =
      !!activeOverlayHotspotKey &&
      overlayArrowStartPoint?.key === activeOverlayHotspotKey &&
      Number.isFinite(overlayArrowStartPoint?.xRatio) &&
      Number.isFinite(overlayArrowStartPoint?.yRatio);

    if (canUseOverlayClickPoint) {
      const overlayLayerNode = overlayLayerRef.current;
      const overlayLayerRect = overlayLayerNode?.getBoundingClientRect();
      if (overlayLayerRect?.width && overlayLayerRect?.height) {
        startX = overlayLayerRect.left + overlayLayerRect.width * overlayArrowStartPoint.xRatio;
        startY = overlayLayerRect.top + overlayLayerRect.height * overlayArrowStartPoint.yRatio;
      }
    }

    if (startX === null || startY === null) {
      if (!hotspotNode) {
        setArrowGeometry(null);
        return;
      }
      const hotspotRect = hotspotNode.getBoundingClientRect();
      startX = hotspotRect.left + hotspotRect.width / 2;
      startY = hotspotRect.top + hotspotRect.height / 2;
    }

    const panelRect = panelNode.getBoundingClientRect();
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
    const isApostlesArrow = /12\s*ap[oó]stoles/i.test(activeLabel);
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
    const sizeMultiplier = isApostlesArrow ? 0.82 : isPantsArrow ? 0.9 : 1;
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
  }, [
    activeHotspotIndex,
    activeOverlayHotspotKey,
    hotspotRefs,
    isMobile,
    normalizedHotspots,
    normalizedOverlayHotspots,
    overlayArrowStartPoint,
    overlayHotspotRefs,
    overlayLayerRef,
    panelRef,
    showArrows,
  ]);

  const scheduleArrowUpdate = useCallback(() => {
    if (arrowRafRef.current !== null) return;
    arrowRafRef.current = window.requestAnimationFrame(() => {
      arrowRafRef.current = null;
      updateArrow();
    });
  }, [arrowRafRef, updateArrow]);

  useEffect(() => {
    scheduleArrowUpdate();
    return () => {
      if (arrowRafRef.current !== null) {
        window.cancelAnimationFrame(arrowRafRef.current);
        arrowRafRef.current = null;
      }
    };
  }, [arrowRafRef, scheduleArrowUpdate]);

  useEffect(() => {
    if (activeHotspotIndex === null && !activeOverlayHotspotKey) return undefined;

    const handleUpdate = () => scheduleArrowUpdate();
    window.addEventListener('resize', handleUpdate);
    window.addEventListener('scroll', handleUpdate, { passive: true });
    return () => {
      window.removeEventListener('resize', handleUpdate);
      window.removeEventListener('scroll', handleUpdate);
    };
  }, [activeHotspotIndex, activeOverlayHotspotKey, scheduleArrowUpdate]);

  useEffect(() => {
    if (!showArrows || isMobile) return;
    if (activeHotspotIndex === null && !activeOverlayHotspotKey) return;
    scheduleArrowUpdate();
  }, [
    activeHotspotImage,
    activeHotspotIndex,
    activeOverlayHotspotKey,
    contentHotspotKey,
    hasHotspotImageGallery,
    isHotspotContentVisible,
    isMobile,
    scheduleArrowUpdate,
    showArrows,
  ]);

  return {
    arrowGeometry,
    scheduleArrowUpdate,
    setArrowGeometry,
  };
}
