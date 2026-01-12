export type ScoreInput = {
  seconds: number;
  pauseCount: number;
};

export function calculateSessionPoints({ seconds, pauseCount }: ScoreInput) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  const base = minutes * 5;
  const cappedPauseCount = Math.min(Math.max(pauseCount, 0), 100);
  const penalty = cappedPauseCount * 2;
  return Math.max(1, base - penalty);
}
