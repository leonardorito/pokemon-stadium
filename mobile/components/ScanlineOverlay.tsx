// Intentionally empty. The earlier implementation (tiled data-URI scanline PNG +
// LinearGradient vignette) rendered as a "weird gradient all over" on iOS — the
// 1x3 data-URI image was being stretched instead of tiled, producing a giant
// dark band, and the vignette compounded the effect. Kept as a no-op so the
// existing imports across screens continue to work; we can swap in a real tiled
// asset later if we want the scanline texture back.
export function ScanlineOverlay() {
  return null;
}
