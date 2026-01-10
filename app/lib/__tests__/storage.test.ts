import { renderHook, waitFor } from "@testing-library/react";
import { act } from "react";
import { uid, useLocalState } from "../storage";

describe("useLocalState", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("reads initial value and becomes ready after effect", async () => {
    const { result } = renderHook(() => useLocalState("lf_test", ["a"]));

    expect(result.current[0]).toEqual(["a"]);

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });
  });

  it("prefers stored value when present", async () => {
    window.localStorage.setItem("lf_test", JSON.stringify(["stored"]));

    const { result } = renderHook(() => useLocalState("lf_test", ["a"]));

    await waitFor(() => {
      expect(result.current[2]).toBe(true);
    });

    expect(result.current[0]).toEqual(["stored"]);
  });

  it("persists updates to localStorage", async () => {
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

describe("uid", () => {
  it("adds prefix and unique suffix", () => {
    const value = uid("task");
    expect(value.startsWith("task_")).toBe(true);
    expect(value.length).toBeGreaterThan("task_".length);
  });
});
