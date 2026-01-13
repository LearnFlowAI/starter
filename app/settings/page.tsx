"use client";

import { useEffect, useState } from "react";
import BottomNav from "../components/BottomNav";

interface Rule {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  isEnabled: boolean;
  type: "threshold" | "boolean";
  thresholdValue?: number;
  points: number;
  pointsType: "reward" | "penalty";
}

const DEFAULT_RULES: Rule[] = [
  {
    id: "focus_reward",
    title: "专注奖励",
    subTitle: "FOCUS REWARD",
    description: "当单次专注时长超过设定值时，系统将自动发放积分奖励。",
    icon: "timer",
    color: "text-primary",
    bgColor: "bg-teal-50",
    isEnabled: true,
    type: "threshold",
    thresholdValue: 20,
    points: 5,
    pointsType: "reward"
  },
  {
    id: "accuracy_bonus",
    title: "无错奖励",
    subTitle: "ACCURACY BONUS",
    description: "当作业或练习准确率达到 100% 时，给予额外奖励。",
    icon: "check_circle",
    color: "text-secondary",
    bgColor: "bg-yellow-50",
    isEnabled: true,
    type: "boolean",
    points: 10,
    pointsType: "reward"
  }
];

export default function SettingsPage() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);

  const [ruleTitle, setRuleTitle] = useState("");
  const [ruleDesc, setRuleDesc] = useState("");
  const [ruleIcon, setRuleIcon] = useState("star");
  const [rulePoints, setRulePoints] = useState(5);
  const [rulePointsType, setRulePointsType] = useState<"reward" | "penalty">(
    "reward"
  );
  const [ruleThreshold, setRuleThreshold] = useState(20);
  const [ruleType, setRuleType] = useState<"threshold" | "boolean">("boolean");

  useEffect(() => {
    const savedRules = localStorage.getItem("lf_rules");
    if (savedRules) {
      setRules(JSON.parse(savedRules));
    } else {
      setRules(DEFAULT_RULES);
    }
  }, []);

  const saveRules = (updatedRules: Rule[]) => {
    setRules(updatedRules);
    localStorage.setItem("lf_rules", JSON.stringify(updatedRules));
  };

  const toggleRule = (id: string) => {
    const updated = rules.map((rule) =>
      rule.id === id ? { ...rule, isEnabled: !rule.isEnabled } : rule
    );
    saveRules(updated);
  };

  const updateNumericValue = (
    id: string,
    field: "thresholdValue" | "points",
    delta: number
  ) => {
    const updated = rules.map((rule) => {
      if (rule.id === id) {
        const currentVal = rule[field] || 0;
        const min = field === "points" ? 1 : 5;
        const max = field === "points" ? 100 : 180;
        return {
          ...rule,
          [field]: Math.max(min, Math.min(max, currentVal + delta))
        };
      }
      return rule;
    });
    saveRules(updated);
  };

  const handleOpenAdd = () => {
    setEditingRule(null);
    setRuleTitle("");
    setRuleDesc("");
    setRuleIcon("star");
    setRulePoints(5);
    setRulePointsType("reward");
    setRuleThreshold(20);
    setRuleType("boolean");
    setShowModal(true);
  };

  const handleOpenEdit = (rule: Rule) => {
    setEditingRule(rule);
    setRuleTitle(rule.title);
    setRuleDesc(rule.description);
    setRuleIcon(rule.icon);
    setRulePoints(rule.points);
    setRulePointsType(rule.pointsType);
    setRuleThreshold(rule.thresholdValue || 20);
    setRuleType(rule.type);
    setShowModal(true);
  };

  const handleSaveRule = () => {
    if (!ruleTitle) {
      return;
    }

    if (editingRule) {
      const updated = rules.map((rule) =>
        rule.id === editingRule.id
          ? {
              ...rule,
              title: ruleTitle,
              description: ruleDesc,
              icon: ruleIcon,
              points: rulePoints,
              pointsType: rulePointsType,
              thresholdValue: ruleType === "threshold" ? ruleThreshold : undefined,
              type: ruleType
            }
          : rule
      );
      saveRules(updated);
    } else {
      const newRule: Rule = {
        id: Math.random().toString(36).slice(2, 9),
        title: ruleTitle,
        subTitle: "CUSTOM RULE",
        description: ruleDesc || "自定义奖励规则",
        icon: ruleIcon,
        color: rulePointsType === "reward" ? "text-primary" : "text-rose-500",
        bgColor: rulePointsType === "reward" ? "bg-teal-50" : "bg-rose-50",
        isEnabled: true,
        type: ruleType,
        thresholdValue: ruleType === "threshold" ? ruleThreshold : undefined,
        points: rulePoints,
        pointsType: rulePointsType
      };
      saveRules([...rules, newRule]);
    }
    setShowModal(false);
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm("确定要删除这条规则吗？")) {
      saveRules(rules.filter((rule) => rule.id !== id));
    }
  };

  return (
    <div className="relative min-h-screen bg-background-light px-6 pb-40 pt-8 dark:bg-background-dark">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-black text-gray-800 dark:text-white">
          规则配置
        </h1>
        <div className="flex gap-2">
          <button type="button"
            onClick={() => setShowHelpModal(true)}
            className="rounded-full bg-white p-2.5 text-primary shadow-sm transition-all active:scale-90 dark:bg-gray-800"
          >
            <span className="material-icons-round">help_outline</span>
          </button>
          <button type="button"
            onClick={handleOpenAdd}
            className="rounded-full bg-primary p-2.5 text-white shadow-glow transition-all active:scale-90"
          >
            <span className="material-icons-round">add</span>
          </button>
        </div>
      </header>

      <p className="mb-8 text-sm font-medium text-gray-500">
        设置你的奖励规则，让学习更有动力。
      </p>

      <main className="space-y-8">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`relative overflow-hidden rounded-[2.5rem] border border-gray-100 bg-white p-6 shadow-soft transition-all duration-300 dark:border-gray-800 dark:bg-card-dark ${
              !rule.isEnabled ? "opacity-60 grayscale-[0.5]" : ""
            }`}
          >
            <div
              className={`absolute left-0 top-0 h-full w-1.5 ${
                rule.pointsType === "reward" ? "bg-primary" : "bg-rose-500"
              }`}
            />

            <div className="mb-4 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${rule.bgColor} shadow-sm dark:bg-opacity-10 ${rule.color}`}
                >
                  <span className="material-icons-round text-3xl">
                    {rule.icon}
                  </span>
                </div>
                <div>
                  <h2 className="text-lg font-black text-gray-800 dark:text-white">
                    {rule.title}
                  </h2>
                  <p className="text-xs font-bold uppercase tracking-widest text-gray-300 dark:text-gray-500">
                    {rule.subTitle}
                  </p>
                </div>
              </div>
              <button type="button"
                onClick={() => toggleRule(rule.id)}
                className={`relative h-7 w-12 rounded-full transition-all ${
                  rule.isEnabled ? "bg-primary" : "bg-gray-200 dark:bg-gray-700"
                }`}
              >
                <span
                  className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow-sm transition-all ${
                    rule.isEnabled ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <p className="mb-5 text-sm leading-relaxed text-gray-500">
              {rule.description}
            </p>

            <div className="flex items-center justify-between gap-4">
              {rule.type === "threshold" && (
                <div className="flex items-center gap-3">
                  <button type="button"
                    onClick={() => updateNumericValue(rule.id, "thresholdValue", -5)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 shadow-sm dark:bg-gray-800"
                  >
                    <span className="material-icons-round text-base">remove</span>
                  </button>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                      阈值
                    </p>
                    <p className="text-lg font-black text-gray-700 dark:text-gray-200">
                      {rule.thresholdValue} 分钟
                    </p>
                  </div>
                  <button type="button"
                    onClick={() => updateNumericValue(rule.id, "thresholdValue", 5)}
                    className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 shadow-sm dark:bg-gray-800"
                  >
                    <span className="material-icons-round text-base">add</span>
                  </button>
                </div>
              )}

              <div className="flex items-center gap-3">
                <button type="button"
                  onClick={() => updateNumericValue(rule.id, "points", -1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 shadow-sm dark:bg-gray-800"
                >
                  <span className="material-icons-round text-base">remove</span>
                </button>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-gray-300">
                    积分
                  </p>
                  <p className="text-lg font-black text-gray-700 dark:text-gray-200">
                    {rule.points}
                  </p>
                </div>
                <button type="button"
                  onClick={() => updateNumericValue(rule.id, "points", 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-50 text-gray-400 shadow-sm dark:bg-gray-800"
                >
                  <span className="material-icons-round text-base">add</span>
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button type="button"
                  onClick={() => handleOpenEdit(rule)}
                  className="rounded-full bg-gray-50 px-4 py-2 text-xs font-bold text-gray-500 transition-all hover:text-primary dark:bg-gray-800"
                >
                  编辑
                </button>
                <button type="button"
                  onClick={() => handleDeleteRule(rule.id)}
                  className="rounded-full bg-rose-50 px-4 py-2 text-xs font-bold text-rose-500 transition-all hover:bg-rose-100 dark:bg-rose-900/30"
                >
                  删除
                </button>
              </div>
            </div>
          </div>
        ))}
      </main>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl dark:bg-card-dark">
            <h2 className="mb-6 text-xl font-black text-gray-800 dark:text-white">
              {editingRule ? "编辑规则" : "新增规则"}
            </h2>
            <div className="space-y-4">
              <input
                value={ruleTitle}
                onChange={(event) => setRuleTitle(event.target.value)}
                placeholder="规则标题"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800"
              />
              <textarea
                value={ruleDesc}
                onChange={(event) => setRuleDesc(event.target.value)}
                placeholder="规则描述"
                rows={3}
                className="w-full resize-none rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-primary/20 dark:border-gray-700 dark:bg-gray-800"
              />
              <div className="flex gap-3">
                <select
                  value={ruleType}
                  onChange={(event) =>
                    setRuleType(event.target.value as "threshold" | "boolean")
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="boolean">触发型</option>
                  <option value="threshold">阈值型</option>
                </select>
                <select
                  value={rulePointsType}
                  onChange={(event) =>
                    setRulePointsType(event.target.value as "reward" | "penalty")
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium dark:border-gray-700 dark:bg-gray-800"
                >
                  <option value="reward">奖励</option>
                  <option value="penalty">扣分</option>
                </select>
              </div>
              {ruleType === "threshold" && (
                <input
                  type="number"
                  min={5}
                  max={180}
                  value={ruleThreshold}
                  onChange={(event) =>
                    setRuleThreshold(Number(event.target.value))
                  }
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium dark:border-gray-700 dark:bg-gray-800"
                />
              )}
              <input
                type="number"
                min={1}
                max={100}
                value={rulePoints}
                onChange={(event) => setRulePoints(Number(event.target.value))}
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium dark:border-gray-700 dark:bg-gray-800"
              />
              <input
                value={ruleIcon}
                onChange={(event) => setRuleIcon(event.target.value)}
                placeholder="图标名称"
                className="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-medium dark:border-gray-700 dark:bg-gray-800"
              />
            </div>
            <div className="mt-6 flex items-center gap-3">
              <button type="button"
                onClick={() => setShowModal(false)}
                className="flex-1 rounded-full border border-gray-200 py-3 text-sm font-bold text-gray-400 transition-all hover:text-gray-600 dark:border-gray-700"
              >
                取消
              </button>
              <button type="button"
                onClick={handleSaveRule}
                className="flex-1 rounded-full bg-primary py-3 text-sm font-bold text-white shadow-glow"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {showHelpModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 px-6">
          <div className="w-full max-w-md rounded-[2.5rem] bg-white p-6 shadow-2xl dark:bg-card-dark">
            <h2 className="mb-4 text-xl font-black text-gray-800 dark:text-white">
              规则说明
            </h2>
            <p className="text-sm text-gray-500">
              规则用于定义学习行为的奖励与惩罚。可以设置阈值型规则（如专注时长）或触发型规则（如完成任务）。
            </p>
            <button type="button"
              onClick={() => setShowHelpModal(false)}
              className="mt-6 w-full rounded-full bg-primary py-3 text-sm font-bold text-white shadow-glow"
            >
              我知道了
            </button>
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  );
}
