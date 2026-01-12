import { render, screen, within } from "@testing-library/react";
import OverviewPage from "../overview/page";
import type {
  RecordEntry,
  ScoreEntry,
  SessionEntry
} from "../lib/models";
import { formatDate } from "../lib/daily";

describe("总览页", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("根据记录汇总今日数据", async () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const scoreDate = new Date(yesterday);
    scoreDate.setMinutes(scoreDate.getMinutes() + 20);

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
        createdAt: today.toISOString(),
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
        createdAt: today.toISOString(),
        points: 10
      }
    ];

    window.localStorage.setItem("lf_records", JSON.stringify(records));

    const sessions: SessionEntry[] = [
      {
        id: "ses_1",
        taskId: "t1",
        seconds: 1200,
        pauseCount: 0,
        startedAt: yesterday.toISOString(),
        endedAt: yesterday.toISOString()
      }
    ];
    const scores: ScoreEntry[] = [
      {
        id: "scr_1",
        sessionId: "ses_1",
        taskId: "t1",
        points: 26,
        seconds: 1200,
        pauseCount: 0,
        createdAt: scoreDate.toISOString()
      }
    ];

    window.localStorage.setItem("lf_sessions", JSON.stringify(sessions));
    window.localStorage.setItem("lf_scores", JSON.stringify(scores));

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

    const dailyHeading = await screen.findByRole("heading", { name: "日报" });
    expect(dailyHeading).toBeInTheDocument();
    const dailyCard = dailyHeading.closest("section");
    expect(dailyCard).toBeTruthy();
    expect(
      within(dailyCard as HTMLElement).getByText(/1 次计时/)
    ).toBeInTheDocument();
    expect(within(dailyCard as HTMLElement).getByText("20 分钟")).toBeInTheDocument();
    expect(within(dailyCard as HTMLElement).getByText("26 积分")).toBeInTheDocument();

    const todayKey = formatDate(today);
    const yesterdayKey = formatDate(yesterday);

    expect(screen.getByTestId(`trend-item-${todayKey}`)).toBeInTheDocument();
    expect(screen.getByTestId(`trend-minutes-${todayKey}`)).toHaveTextContent(
      "0 分钟"
    );
    expect(screen.getByTestId(`trend-minutes-${yesterdayKey}`)).toHaveTextContent(
      "20 分钟"
    );
  });
});
