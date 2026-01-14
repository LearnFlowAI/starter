import { exportData } from "../export";

describe("exportData", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("导出指定类型为 JSON", () => {
    window.localStorage.setItem(
      "lf_tasks",
      JSON.stringify([{ id: "t1", title: "任务" }])
    );
    window.localStorage.setItem(
      "lf_sessions",
      JSON.stringify([{ id: "s1", endedAt: "2025-01-05T10:00:00.000Z" }])
    );

    const result = exportData({
      format: "json",
      includeTypes: ["tasks", "sessions"]
    });

    const parsed = JSON.parse(result) as Record<string, unknown[]>;
    expect(parsed.tasks).toHaveLength(1);
    expect(parsed.sessions).toHaveLength(1);
  });

  it("按时间范围过滤会话", () => {
    window.localStorage.setItem(
      "lf_sessions",
      JSON.stringify([
        { id: "s1", endedAt: "2025-01-05T10:00:00.000Z" },
        { id: "s2", endedAt: "2025-01-06T10:00:00.000Z" }
      ])
    );

    const result = exportData({
      format: "json",
      includeTypes: ["sessions"],
      dateRange: {
        start: new Date("2025-01-05T00:00:00.000Z"),
        end: new Date("2025-01-05T23:59:59.999Z")
      }
    });

    const parsed = JSON.parse(result) as Record<string, Array<{ id: string }>>;
    expect(parsed.sessions).toHaveLength(1);
    expect(parsed.sessions[0].id).toBe("s1");
  });

  it("导出 CSV 时保留嵌套对象与特殊字符", () => {
    window.localStorage.setItem(
      "lf_tasks",
      JSON.stringify([
        {
          id: "t1",
          title: "hello, \"world\"\nnext",
          meta: { level: 1 }
        }
      ])
    );

    const result = exportData({
      format: "csv",
      includeTypes: ["tasks"]
    });

    expect(result).toContain("# tasks");
    expect(result).toContain("id,title,meta");
    expect(result).toContain("\"hello, \"\"world\"\"\nnext\"");
    expect(result).toContain('"{""level"":1}"');
  });

  it("CSV 无数据时返回空字符串", () => {
    window.localStorage.setItem("lf_tasks", JSON.stringify([]));

    const result = exportData({
      format: "csv",
      includeTypes: ["tasks"]
    });

    expect(result).toBe("");
  });
});
