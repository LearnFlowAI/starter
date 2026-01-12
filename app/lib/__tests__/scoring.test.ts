import { calculateSessionPoints } from "../scoring";

describe("积分计算 calculateSessionPoints", () => {
  it("按分钟计算奖励并扣除暂停惩罚", () => {
    const points = calculateSessionPoints({ seconds: 180, pauseCount: 2 });
    expect(points).toBe(11);
  });

  it("短会话多次暂停时积分不低于 1", () => {
    const points = calculateSessionPoints({ seconds: 10, pauseCount: 10 });
    expect(points).toBe(1);
  });

  it("暂停次数过大时限制惩罚上限", () => {
    const points = calculateSessionPoints({ seconds: 6000, pauseCount: 200 });
    expect(points).toBe(300);
  });
});
