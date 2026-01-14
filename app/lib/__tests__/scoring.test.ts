import { calculateSessionPoints } from "../scoring";

describe("积分计算 calculateSessionPoints", () => {
  it("按分钟计算奖励并扣除暂停惩罚", () => {
    const points = calculateSessionPoints({ seconds: 180, pauseCount: 2 });
    expect(points).toBe(13);
  });

  it("短会话多次暂停时积分不低于 1", () => {
    const points = calculateSessionPoints({ seconds: 10, pauseCount: 10 });
    expect(points).toBe(1);
  });

  it("暂停次数过大时限制惩罚上限", () => {
    const points = calculateSessionPoints({ seconds: 6000, pauseCount: 200 });
    expect(points).toBe(360);
  });

  it("结合质量、错题与习惯加成计算积分", () => {
    const points = calculateSessionPoints({
      seconds: 1200,
      pauseCount: 2,
      rating: 5,
      mistakeCount: 3,
      writingStars: 2,
      reviewChecked: true,
      fixChecked: false,
      previewChecked: true
    });

    expect(points).toBe(158);
  });
});
