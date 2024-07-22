export function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;

  const minutesStr = minutes.toString().padStart(2, "0");
  const secondsStr = secs.toString().padStart(2, "0");

  return `${minutesStr}:${secondsStr}`;
}
