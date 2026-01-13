import { migrateInterruptions } from "../migration";
import type { InterruptionLog, SessionEntry } from "../models";

const MIGRATION_KEY = "lf_interruptions_migrated_v2";
const getInterruptions = () => {
  const raw = window.localStorage.getItem("lf_interruptions");
  if (!raw) {
    throw new Error("缺少 lf_interruptions 数据");
  }
  return JSON.parse(raw) as InterruptionLog[];
};

describe("migrateInterruptions", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("如果迁移标志已设置，则不应运行", () => {
    const mockInterruptions: InterruptionLog[] = [
      {
        id: "p1",
        reasonId: "other",
        duration: 10,
        createdAt: "2026-01-10T10:15:00.000Z",
        taskId: "t1"
        // No sessionId
      }
    ];
    window.localStorage.setItem(MIGRATION_KEY, "true");
    window.localStorage.setItem(
      "lf_interruptions",
      JSON.stringify(mockInterruptions)
    );

    migrateInterruptions();

    const result = getInterruptions();
    expect(result[0].sessionId).toBeUndefined();
  });

  it("应为在会话时间范围内的中断分配 sessionId", () => {
    const mockSessions: SessionEntry[] = [
      {
        id: "s1",
        taskId: "t1",
        startedAt: "2026-01-10T10:00:00.000Z",
        endedAt: "2026-01-10T10:30:00.000Z",
        seconds: 1800,
        pauseCount: 1
      }
    ];
    const mockInterruptions: InterruptionLog[] = [
      {
        id: "p1",
        reasonId: "other",
        duration: 10,
        createdAt: "2026-01-10T10:15:00.000Z", // Inside session s1
        taskId: "t1"
      }
    ];
    window.localStorage.setItem("lf_sessions", JSON.stringify(mockSessions));
    window.localStorage.setItem(
      "lf_interruptions",
      JSON.stringify(mockInterruptions)
    );

    migrateInterruptions();

    const result = getInterruptions();
    expect(result[0].sessionId).toBe("s1");
  });

  it("不应为时间范围或 taskId 不匹配的中断分配 sessionId", () => {
    const mockSessions: SessionEntry[] = [
      {
        id: "s1",
        taskId: "t1",
        startedAt: "2026-01-10T10:00:00.000Z",
        endedAt: "2026-01-10T10:30:00.000Z",
        seconds: 1800,
        pauseCount: 1
      }
    ];
    const mockInterruptions: (InterruptionLog & { case: string })[] = [
      {
        case: "Time before",
        id: "p1",
        reasonId: "other",
        duration: 10,
        createdAt: "2026-01-10T09:59:00.000Z",
        taskId: "t1"
      },
      {
        case: "Time after",
        id: "p2",
        reasonId: "other",
        duration: 10,
        createdAt: "2026-01-10T10:31:00.000Z",
        taskId: "t1"
      },
      {
        case: "Different task",
        id: "p3",
        reasonId: "other",
        duration: 10,
        createdAt: "2026-01-10T10:15:00.000Z",
        taskId: "t2"
      }
    ];
    window.localStorage.setItem("lf_sessions", JSON.stringify(mockSessions));
    window.localStorage.setItem(
      "lf_interruptions",
      JSON.stringify(mockInterruptions)
    );

    migrateInterruptions();

    const result = getInterruptions();
    expect(result[0].sessionId).toBeUndefined();
    expect(result[1].sessionId).toBeUndefined();
    expect(result[2].sessionId).toBeUndefined();
  });

  it("运行后应设置迁移标志", () => {
    migrateInterruptions();
    expect(window.localStorage.getItem(MIGRATION_KEY)).toBe("true");
  });
});
