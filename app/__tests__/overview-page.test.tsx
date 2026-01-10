import { render, screen, within } from "@testing-library/react";
import OverviewPage from "../overview/page";
import type { RecordEntry } from "../lib/models";

describe("OverviewPage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("summarizes totals from records", async () => {
    const records: RecordEntry[] = [
      {
        id: "rec_1",
        taskId: "t1",
        title: "数学口算 20 分钟",
        subject: "数学",
        minutes: 25,
        rating: 4,
        mistakeCount: 1,
        writingStars: 4,
        reviewChecked: true,
        fixChecked: false,
        previewChecked: false,
        note: "",
        createdAt: new Date().toISOString(),
        points: 26
      },
      {
        id: "rec_2",
        taskId: "t2",
        title: "英语阅读 15 分钟",
        subject: "英语",
        minutes: 15,
        rating: 3,
        mistakeCount: 0,
        writingStars: 3,
        reviewChecked: false,
        fixChecked: true,
        previewChecked: true,
        note: "",
        createdAt: new Date().toISOString(),
        points: 10
      }
    ];

    window.localStorage.setItem("lf_records", JSON.stringify(records));

    render(<OverviewPage />);

    const summaryHeading = await screen.findByRole("heading", {
      name: "今日总览"
    });
    expect(summaryHeading).toBeInTheDocument();

    const summarySection = summaryHeading.closest("section");
    expect(summarySection).toBeTruthy();

    const summary = within(summarySection as HTMLElement);
    expect(summary.getByText("40")).toBeInTheDocument();
    expect(summary.getByText("2")).toBeInTheDocument();
    expect(summary.getByText("36")).toBeInTheDocument();
  });
});
