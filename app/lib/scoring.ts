export type ScoringInput = {
  seconds: number;
  pauseCount: number;
  rating?: number;
  mistakeCount?: number;
  writingStars?: number;
  reviewChecked?: boolean;
  fixChecked?: boolean;
  previewChecked?: boolean;
};

/**
 * 计算单次专注积分。
 * 公式：基础分 = ceil(秒数/60) * 5；暂停扣分 = pauseCount * 2。
 * 质量加成 = (rating - 1) * 10%；错题惩罚 = min(mistakeCount * 5%, 30%)；
 * 书写加成 = writingStars * 10%；习惯加成 = 勾选项 * 10%。
 * 最终积分 = max(1, round((基础分 - 暂停扣分) * (1 + 加成 - 惩罚))).
 */
export function calculateSessionPoints({
  seconds,
  pauseCount,
  rating = 3,
  mistakeCount = 0,
  writingStars = 0,
  reviewChecked = false,
  fixChecked = false,
  previewChecked = false
}: ScoringInput) {
  const minutes = Math.max(1, Math.ceil(seconds / 60));
  const base = minutes * 5;
  const cappedPauseCount = Math.min(Math.max(pauseCount, 0), 100);
  const pausePenalty = cappedPauseCount * 2;

  const normalizedRating = Math.min(Math.max(rating, 1), 5);
  const normalizedMistakes = Math.max(mistakeCount, 0);
  const normalizedStars = Math.min(Math.max(writingStars, 0), 3);

  const qualityBonus = (normalizedRating - 1) * 0.1;
  const mistakePenalty = Math.min(normalizedMistakes * 0.05, 0.3);
  const writingBonus = normalizedStars * 0.1;
  const habitBonus =
    (reviewChecked ? 0.1 : 0) +
    (fixChecked ? 0.1 : 0) +
    (previewChecked ? 0.1 : 0);

  const multiplier = 1 + qualityBonus - mistakePenalty + writingBonus + habitBonus;
  const scoredBase = Math.max(1, base - pausePenalty);
  return Math.max(1, Math.round(scoredBase * multiplier));
}
