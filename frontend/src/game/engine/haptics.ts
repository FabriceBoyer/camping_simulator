/** Best-effort haptic tick — silently does nothing on browsers/devices
 * without the Vibration API (iOS Safari, desktop). */
export function vibrate(pattern: number | number[]) {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    // ignore
  }
}
