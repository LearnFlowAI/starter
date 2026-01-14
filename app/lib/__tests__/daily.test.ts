import type { ScoreEntry, SessionEntry } from "../models";
import {
  buildWeeklyTrend,
  createDailySummaries,
  formatDate,
  getStatsForDateRange
} from "../daily";

describe("日报汇总 createDailySummaries", () => {
  it("按天汇总会话与积分", () => {
    const sessions = [
      {
        id: "ses_1",
        taskId: "t1",
        seconds: 1200,
        pauseCount: 1,
        startedAt: "2025-01-01T08:00:00.000Z",
        endedAt: "2025-01-01T08:20:00.000Z"
      },
      {
        id: "ses_2",
        taskId: "t2",
        seconds: 900,
        pauseCount: 0,
        startedAt: "2025-01-01T09:00:00.000Z",
        endedAt: "2025-01-01T09:15:00.000Z"
      },
      {
        id: "ses_3",
        taskId: "t3",
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

  it("仅有积分无会话时也能汇总", () => {
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

  it("无数据时返回空数组", () => {
    expect(createDailySummaries([], [])).toEqual([]);
  });
});

describe("趋势构建 buildWeeklyTrend", () => {
  it("以指定日期为结尾补齐 7 天", () => {
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

describe("区间统计 getStatsForDateRange", () => {
  it("按时间范围汇总分钟与积分", () => {
    const sessions: SessionEntry[] = [
      {
        id: "ses_1",
        taskId: "t1",
        seconds: 600,
        pauseCount: 0,
        startedAt: "2025-01-05T08:00:00.000Z",
        endedAt: "2025-01-05T08:10:00.000Z"
      },
      {
        id: "ses_2",
        taskId: "t2",
        seconds: 900,
        pauseCount: 0,
        startedAt: "2025-01-06T08:00:00.000Z",
        endedAt: "2025-01-06T08:15:00.000Z"
      }
    ];
    const scores: ScoreEntry[] = [
      {
        id: "scr_1",
        sessionId: "ses_1",
        taskId: "t1",
        points: 20,
        pauseCount: 0,
        createdAt: "2025-01-05T08:10:00.000Z"
      }
    ];

    const start = new Date("2025-01-05T00:00:00.000Z");
    const end = new Date("2025-01-05T23:59:59.999Z");

    const summary = getStatsForDateRange(sessions, scores, start, end);

    expect(summary.totalMinutes).toBe(10);
    expect(summary.totalPoints).toBe(20);
    expect(summary.sessionCount).toBe(1);
  });

  it("结束日期为当天 0 点时覆盖整天", () => {
    const sessions: SessionEntry[] = [
      {
        id: "ses_3",
        taskId: "t3",
        seconds: 1800,
        pauseCount: 0,
        startedAt: "2025-01-07T20:00:00.000Z",
        endedAt: "2025-01-07T20:30:00.000Z"
      }
    ];
    const scores: ScoreEntry[] = [
      {
        id: "scr_3",
        sessionId: "ses_3",
        taskId: "t3",
        points: 30,
        pauseCount: 0,
        createdAt: "2025-01-07T20:30:00.000Z"
      }
    ];

    const start = new Date("2025-01-07T00:00:00.000Z");
    const end = new Date("2025-01-07T00:00:00.000Z");

    const summary = getStatsForDateRange(sessions, scores, start, end);

    expect(summary.totalMinutes).toBe(30);
    expect(summary.totalPoints).toBe(30);
    expect(summary.sessionCount).toBe(1);
  });
});

describe("日期格式化 formatDate", () => {
  it("格式化 Date 对象", () => {
    const result = formatDate(new Date("2025-01-15T12:30:00.000Z"));
    expect(result).toBe("2025-01-15");
  });

  it("格式化 ISO 字符串", () => {
    const result = formatDate("2025-01-15T12:30:00.000Z");
    expect(result).toBe("2025-01-15");
  });

  it("无效日期返回空字符串", () => {
    const result = formatDate("not-a-date");
    expect(result).toBe("");
  });
});
