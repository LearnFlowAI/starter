import type { ScoreEntry, SessionEntry } from "./models";

export type DailySummary = {
  date: string;
  totalSeconds: number;
  totalPoints: number;
  sessionCount: number;
  scoreCount: number;
};

export function formatDate(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) {
    // eslint-disable-next-line no-console
    console.error("Invalid date input for formatDate", value);
    return "";
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function createDailySummaries(
  sessions: SessionEntry[],
  scores: ScoreEntry[]
): DailySummary[] {
  const map = new Map<string, DailySummary>();

  const ensureDay = (key: string) => {
    if (!map.has(key)) {
      map.set(key, {
        date: key,
        totalSeconds: 0,
        totalPoints: 0,
        sessionCount: 0,
        scoreCount: 0
      });
    }
    const day = map.get(key);
    if (!day) {
      throw new Error(`Failed to get day for key: ${key}`);
    }
    return day;
  };

  for (const entry of sessions) {
    const dateKey = formatDate(entry.endedAt);
    if (!dateKey) {
      continue;
    }
    const day = ensureDay(dateKey);
    day.totalSeconds += entry.seconds;
    day.sessionCount += 1;
  }

  for (const entry of scores) {
    const dateKey = formatDate(entry.createdAt);
    if (!dateKey) {
      continue;
    }
    const day = ensureDay(dateKey);
    day.totalPoints += entry.points;
    day.scoreCount += 1;
    if (typeof entry.seconds === "number" && day.sessionCount === 0) {
      day.totalSeconds += entry.seconds;
    }
  }

  return Array.from(map.values()).sort((a, b) => b.date.localeCompare(a.date));
}

export type DailyTrendPoint = {
  date: string;
  minutes: number;
};

export type RangeSummary = {
  totalMinutes: number;
  totalPoints: number;
  sessionCount: number;
};

export function getStatsForDateRange(
  sessions: SessionEntry[],
  scores: ScoreEntry[],
  startDate: Date,
  endDate: Date
): RangeSummary {
  const endBoundary = new Date(endDate);
  const dayMs = 24 * 60 * 60 * 1000;
  const isStartOfLocalDay =
    endBoundary.getHours() === 0 &&
    endBoundary.getMinutes() === 0 &&
    endBoundary.getSeconds() === 0 &&
    endBoundary.getMilliseconds() === 0;
  const isStartOfUtcDay =
    endBoundary.getUTCHours() === 0 &&
    endBoundary.getUTCMinutes() === 0 &&
    endBoundary.getUTCSeconds() === 0 &&
    endBoundary.getUTCMilliseconds() === 0;

  if (endBoundary.getTime() <= startDate.getTime()) {
    endBoundary.setTime(startDate.getTime() + dayMs - 1);
  } else if (isStartOfLocalDay || isStartOfUtcDay) {
    endBoundary.setTime(endBoundary.getTime() + dayMs - 1);
  }

  const inRange = (value: string) => {
    const date = new Date(value);
    return date >= startDate && date <= endBoundary;
  };

  const filteredSessions = sessions.filter((session) => inRange(session.endedAt));
  const totalMinutes = filteredSessions.reduce(
    (sum, session) => sum + Math.ceil(session.seconds / 60),
    0
  );

  const scoreMap = new Map(scores.map((score) => [score.sessionId, score.points]));
  const totalPoints = filteredSessions.reduce(
    (sum, session) => sum + (scoreMap.get(session.id) ?? 0),
    0
  );

  return {
    totalMinutes,
    totalPoints,
    sessionCount: filteredSessions.length
  };
}

export function buildWeeklyTrend(
  summaries: DailySummary[],
  count = 7,
  endDate = new Date()
): DailyTrendPoint[] {
  const trend: DailyTrendPoint[] = [];
  for (let offset = count - 1; offset >= 0; offset -= 1) {
    const candidate = new Date(endDate);
    candidate.setDate(candidate.getDate() - offset);
    const dateKey = formatDate(candidate);
    const summary = summaries.find((item) => item.date === dateKey);
    const minutes = Math.round((summary?.totalSeconds ?? 0) / 60);
    trend.push({ date: dateKey, minutes });
  }
  return trend;
}
