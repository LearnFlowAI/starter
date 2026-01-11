import type { ScoreEntry, SessionEntry } from "../models";
import { buildWeeklyTrend, createDailySummaries } from "../daily";

describe("createDailySummaries", () => {
  it("aggregates sessions and scores by day", () => {
    const sessions = [
      {
        id: "ses_1",
        taskId: "t1",
        title: "数学",
        subject: "数学",
        seconds: 1200,
        pauseCount: 1,
        startedAt: "2025-01-01T08:00:00.000Z",
        endedAt: "2025-01-01T08:20:00.000Z"
      },
      {
        id: "ses_2",
        taskId: "t2",
        title: "英语",
        subject: "英语",
        seconds: 900,
        pauseCount: 0,
        startedAt: "2025-01-01T09:00:00.000Z",
        endedAt: "2025-01-01T09:15:00.000Z"
      },
      {
        id: "ses_3",
        taskId: "t3",
        title: "语文",
        subject: "语文",
        seconds: 600,
        pauseCount: 2,
        startedAt: "2025-01-02T07:00:00.000Z",
        endedAt: "2025-01-02T07:10:00.000Z"
      }
    ];
    const scores = [
      {
        id: "scr_1",
        sessionId: "ses_1",
        taskId: "t1",
        points: 10,
        seconds: 1200,
        pauseCount: 1,
        createdAt: "2025-01-01T08:20:00.000Z"
      },
      {
        id: "scr_2",
        sessionId: "ses_2",
        taskId: "t2",
        points: 15,
        seconds: 900,
        pauseCount: 0,
        createdAt: "2025-01-01T09:15:00.000Z"
      },
      {
        id: "scr_3",
        sessionId: "ses_3",
        taskId: "t3",
        points: 8,
        seconds: 600,
        pauseCount: 2,
        createdAt: "2025-01-02T07:10:00.000Z"
      }
    ];

    const daily = createDailySummaries(sessions, scores);

    expect(daily).toHaveLength(2);
    expect(daily[0].date).toBe("2025-01-02");
    expect(daily[0].totalSeconds).toBe(600);
    expect(daily[0].totalPoints).toBe(8);
    expect(daily[0].sessionCount).toBe(1);
    expect(daily[0].scoreCount).toBe(1);

    expect(daily[1].date).toBe("2025-01-01");
    expect(daily[1].totalSeconds).toBe(2100);
    expect(daily[1].totalPoints).toBe(25);
    expect(daily[1].sessionCount).toBe(2);
    expect(daily[1].scoreCount).toBe(2);
  });

  it("handles days with scores but without sessions", () => {
    const sessions: SessionEntry[] = [];
    const scores: ScoreEntry[] = [
      {
        id: "scr_4",
        sessionId: "ses_dummy",
        taskId: "t4",
        points: 5,
        seconds: 300,
        pauseCount: 0,
        createdAt: "2025-01-03T10:00:00.000Z"
      }
    ];

    const daily = createDailySummaries(sessions, scores);

    expect(daily).toHaveLength(1);
    expect(daily[0].date).toBe("2025-01-03");
    expect(daily[0].totalSeconds).toBe(300);
    expect(daily[0].totalPoints).toBe(5);
    expect(daily[0].sessionCount).toBe(0);
    expect(daily[0].scoreCount).toBe(1);
  });

  it("returns empty array when no data", () => {
    expect(createDailySummaries([], [])).toEqual([]);
  });
});

describe("buildWeeklyTrend", () => {
  it("fills 7 days ending on provided date", () => {
    const now = new Date("2025-01-05T12:00:00.000Z");
    const summaries = [
      {
        date: "2025-01-04",
        totalSeconds: 1200,
        totalPoints: 10,
        sessionCount: 1,
        scoreCount: 1
      },
      {
        date: "2025-01-03",
        totalSeconds: 900,
        totalPoints: 8,
        sessionCount: 1,
        scoreCount: 1
      }
    ];

    const trend = buildWeeklyTrend(summaries, 7, now);

    expect(trend).toHaveLength(7);
    expect(trend[6].date).toBe("2025-01-05");
    expect(trend[6].minutes).toBe(0);
    expect(trend[5].date).toBe("2025-01-04");
    expect(trend[5].minutes).toBe(20);
    expect(trend[4].date).toBe("2025-01-03");
    expect(trend[4].minutes).toBe(15);
  });
});
