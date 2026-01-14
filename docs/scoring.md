# 积分计算说明

本文件描述单次专注的积分计算规则，用于解释评分组成并保持实现一致。

## 输入字段

- seconds: 专注时长（秒）
- pauseCount: 暂停次数
- rating: 质量评分 1-5（默认 3）
- mistakeCount: 错题数（默认 0）
- writingStars: 书写质量 0-3 星（默认 0）
- reviewChecked: 是否完成复习（默认 false）
- fixChecked: 是否完成订正（默认 false）
- previewChecked: 是否完成预习（默认 false）

## 计算步骤

1. 基础分
   - minutes = max(1, ceil(seconds / 60))
   - base = minutes * 5
2. 暂停惩罚
   - pausePenalty = min(max(pauseCount, 0), 100) * 2
3. 质量加成
   - qualityBonus = (rating - 1) * 0.1
4. 错题惩罚
   - mistakePenalty = min(mistakeCount * 0.05, 0.3)
5. 书写加成
   - writingBonus = writingStars * 0.1
6. 习惯加成
   - habitBonus = (reviewChecked ? 0.1 : 0) + (fixChecked ? 0.1 : 0) + (previewChecked ? 0.1 : 0)
7. 最终积分
   - multiplier = 1 + qualityBonus - mistakePenalty + writingBonus + habitBonus
   - scoredBase = max(1, base - pausePenalty)
   - points = max(1, round(scoredBase * multiplier))

## 说明

- 评分与书写星级会进行范围修正，确保输入超出范围时仍可安全计算。
- 最终积分最低为 1，避免出现 0 或负数。
