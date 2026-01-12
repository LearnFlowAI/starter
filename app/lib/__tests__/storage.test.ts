import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { uid, useLocalState } from "../storage";

describe("useLocalState 钩子", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("读取初始值并在副作用后就绪", async () => {
    const { result } = renderHook(() => useLocalState("lf_test", ["a"]));

    expect(result.current[0]).toEqual(["a"]);

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });
  });

  it("存在存储值时优先使用存储值", async () => {
    window.localStorage.setItem("lf_test", JSON.stringify(["stored"]));

    const { result } = renderHook(() => useLocalState("lf_test", ["a"]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toEqual(["stored"]);
  });

  it("更新时写入 localStorage", async () => {
    const { result } = renderHook(() => useLocalState("lf_test", ["a"]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    act(() => {
      result.current[1](["next"]);
    });

    await waitFor(() => {
      expect(window.localStorage.getItem("lf_test")).toBe("[\"next\"]");
    });
  });
});

describe("uid 工具函数", () => {
  it("添加前缀并生成唯一后缀", () => {
    const value = uid("task");
    expect(value.startsWith("task_")).toBe(true);
    expect(value.length).toBeGreaterThan("task_".length);
  });
});
