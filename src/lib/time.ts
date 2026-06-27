export function formatElapsedSeconds(seconds: number): string {
  const wholeSeconds = Math.max(0, Math.floor(seconds));

  if (wholeSeconds < 60) {
    return `${wholeSeconds}s`;
  }

  const minutes = Math.floor(wholeSeconds / 60);
  const remainingSeconds = wholeSeconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
