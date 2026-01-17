'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import type { AppView } from '../../types';
import NavBar from '../components/NavBar';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';

interface Rule {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  icon: string;
  color: string;
  bgColor: string;
  isEnabled: boolean;
  type: 'threshold' | 'boolean';
  thresholdValue?: number;
  points: number;
  pointsType: 'reward' | 'penalty';
}

const DEFAULT_RULES: Rule[] = [
  { id: 'focus_reward', title: '专注奖励', subTitle: 'FOCUS REWARD', description: '当单次专注时长超过设定值时，系统将自动发放积分奖励。', icon: 'timer', color: 'text-primary', bgColor: 'bg-teal-50', isEnabled: true, type: 'threshold', thresholdValue: 20, points: 5, pointsType: 'reward' },
  { id: 'accuracy_bonus', title: '无错奖励', subTitle: 'ACCURACY BONUS', description: '当作业或练习准确率达到 100% 时，给予额外奖励。', icon: 'check_circle', color: 'text-secondary', bgColor: 'bg-yellow-50', isEnabled: true, type: 'boolean', points: 10, pointsType: 'reward' }
];

export default function SettingsPage() {
  const router = useRouter();
  const [rules, setRules] = useState<Rule[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  
  const [ruleTitle, setRuleTitle] = useState('');
  const [ruleDesc, setRuleDesc] = useState('');
  const [ruleIcon, setRuleIcon] = useState('star');
  const [rulePoints, setRulePoints] = useState(5);
  const [rulePointsType, setRulePointsType] = useState<'reward' | 'penalty'>('reward');
  const [ruleThreshold, setRuleThreshold] = useState(20);
  const [ruleType, setRuleType] = useState<'threshold' | 'boolean'>('boolean');

  useEffect(() => {
    const savedRules = localStorage.getItem('lf_rules');
    setRules(savedRules ? JSON.parse(savedRules) : DEFAULT_RULES);
  }, []);

  const saveRules = (updatedRules: Rule[]) => {
    setRules(updatedRules);
    localStorage.setItem('lf_rules', JSON.stringify(updatedRules));
  };

  const toggleRule = (id: string) => saveRules(rules.map(r => r.id === id ? { ...r, isEnabled: !r.isEnabled } : r));

  const updateNumericValue = (id: string, field: 'thresholdValue' | 'points', delta: number) => {
    saveRules(rules.map(r => {
      if (r.id === id) {
        const currentVal = r[field] || 0;
        const min = field === 'points' ? 1 : 5;
        const max = field === 'points' ? 100 : 180;
        return { ...r, [field]: Math.max(min, Math.min(max, currentVal + delta)) };
      }
      return r;
    }));
  };

  const handleOpenAdd = () => {
    setEditingRule(null);
    setRuleTitle(''); setRuleDesc(''); setRuleIcon('star'); setRulePoints(5);
    setRulePointsType('reward'); setRuleThreshold(20); setRuleType('boolean');
    setShowModal(true);
  };

  const handleOpenEdit = (rule: Rule) => {
    setEditingRule(rule);
    setRuleTitle(rule.title); setRuleDesc(rule.description); setRuleIcon(rule.icon);
    setRulePoints(rule.points); setRulePointsType(rule.pointsType);
    setRuleThreshold(rule.thresholdValue || 20); setRuleType(rule.type);
    setShowModal(true);
  };

  const handleSaveRule = () => {
    if (!ruleTitle) return;
    if (editingRule) {
      saveRules(rules.map(r => r.id === editingRule.id ? { ...r, title: ruleTitle, description: ruleDesc, icon: ruleIcon, points: rulePoints, pointsType: rulePointsType, thresholdValue: ruleType === 'threshold' ? ruleThreshold : undefined, type: ruleType } : r));
    } else {
      const newRule: Rule = { id: Math.random().toString(36).substr(2, 9), title: ruleTitle, subTitle: 'CUSTOM RULE', description: ruleDesc || '自定义奖励规则', icon: ruleIcon, color: rulePointsType === 'reward' ? 'text-primary' : 'text-rose-500', bgColor: rulePointsType === 'reward' ? 'bg-teal-50' : 'bg-rose-50', isEnabled: true, type: ruleType, thresholdValue: ruleType === 'threshold' ? ruleThreshold : undefined, points: rulePoints, pointsType: rulePointsType };
      saveRules([...rules, newRule]);
    }
    setShowModal(false);
  };

  const handleDeleteRule = (id: string) => {
    if (window.confirm('确定要删除这条规则吗？')) saveRules(rules.filter(r => r.id !== id));
  };
  
  const onNavigate = (view: AppView) => router.push(`/${view}`);

  return (
    <div className="pb-40 px-6 pt-8 relative min-h-screen bg-background-light dark:bg-background-dark">
      <header className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-black text-gray-800 dark:text-white">规则配置</h1>
        <div className="flex gap-2" data-testid="header-actions">
          <Button variant="icon" icon="help_outline" onClick={() => setShowHelpModal(true)} className="bg-white dark:bg-gray-800 rounded-full shadow-sm text-primary"/>
          <Button variant="icon" icon="add" onClick={handleOpenAdd} className="bg-primary text-white rounded-full shadow-glow"/>
        </div>
      </header>

      <p className="text-sm text-gray-500 mb-8 font-medium">设置你的奖励规则，让学习更有动力。</p>

      <main className="space-y-8">
        {rules.map((rule) => (
            <Card key={rule.id} className={`p-6 relative overflow-hidden transition-all duration-300 ${!rule.isEnabled ? 'opacity-60 grayscale-[0.5]' : ''}`}>
            <div className={`absolute top-0 left-0 w-1.5 h-full ${rule.pointsType === 'reward' ? 'bg-primary' : 'bg-rose-500'}`} />
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl ${rule.bgColor} dark:bg-opacity-10 flex items-center justify-center ${rule.color} shadow-sm`}>
                  <span className="material-icons-round text-3xl">{rule.icon}</span>
                </div>
                <div>
                  <h3 className="font-bold text-xl text-gray-800 dark:text-white">{rule.title}</h3>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">{rule.subTitle}</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" checked={rule.isEnabled} onChange={() => toggleRule(rule.id)}/>
                  <div className="w-12 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-moss transition-colors">
                    <div className={`absolute top-[2px] left-[2px] w-5 h-5 bg-white rounded-full shadow-md transition-all ${rule.isEnabled ? 'translate-x-6' : 'translate-x-0'}`} />
                  </div>
                </label>
                <div className="flex gap-2">
                  <Button variant="icon" icon="edit" onClick={() => handleOpenEdit(rule)} className="bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-primary rounded-full"/>
                  {rule.id !== 'focus_reward' && rule.id !== 'accuracy_bonus' && (
                    <Button variant="icon" icon="delete_outline" onClick={() => handleDeleteRule(rule.id)} className="bg-gray-50 dark:bg-gray-800 text-gray-400 hover:text-rose-500 rounded-full"/>
                  )}
                </div>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6 leading-relaxed font-medium">{rule.description}</p>
            {rule.isEnabled && (
              <Card className="p-4 space-y-3 bg-gray-50 dark:bg-gray-800/50 border-white/50 dark:border-gray-700/50">
                {rule.type === 'threshold' && (
                  <div className="flex justify-between items-center pb-3 border-b border-gray-100 dark:border-gray-700">
                    <span className="text-sm font-bold text-gray-500">触发时长</span>
                    <div className="flex items-center bg-white dark:bg-gray-700 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-600">
                      <Button variant="icon" icon="remove" onClick={() => updateNumericValue(rule.id, 'thresholdValue', -5)}/>
                      <span className="w-24 text-center font-black text-gray-800 dark:text-white tabular-nums text-lg">{rule.thresholdValue} <span className="text-xs font-bold text-gray-400 ml-0.5">分钟</span></span>
                      <Button variant="icon" icon="add" onClick={() => updateNumericValue(rule.id, 'thresholdValue', 5)} className="text-primary"/>
                    </div>
                  </div>
                )}
                <div className="flex justify-between items-center pt-1">
                  <span className="text-sm font-bold text-gray-500">{rule.pointsType === 'reward' ? '奖励积分' : '惩罚积分'}</span>
                  <div className="flex items-center bg-white dark:bg-gray-700 rounded-xl p-1 shadow-sm border border-gray-100 dark:border-gray-600">
                    <Button variant="icon" icon="remove" onClick={() => updateNumericValue(rule.id, 'points', -1)}/>
                    <div className="w-24 flex items-center justify-center gap-1">
                        <span className={`font-black text-lg tabular-nums ${rule.pointsType === 'reward' ? 'text-gray-800 dark:text-white' : 'text-rose-500'}`}>{rule.pointsType === 'penalty' && '-'} {rule.points}</span>
                        <span className="material-symbols-outlined text-secondary text-sm fill-1">star</span>
                    </div>
                    <Button variant="icon" icon="add" onClick={() => updateNumericValue(rule.id, 'points', 1)} className={`${rule.pointsType === 'reward' ? 'text-primary' : 'text-rose-500'}`}/>
                  </div>
                </div>
              </Card>
            )}
          </Card>
        ))}
      </main>

        <Modal isOpen={showModal} onClose={() => setShowModal(false)} contentClassName="w-full max-w-md rounded-t-[3.5rem] sm:rounded-[3rem] p-8 pb-12 animate-fade-in-up border-t border-white dark:border-gray-800 max-h-[90vh] overflow-y-auto no-scrollbar">
        <div className="flex justify-center mb-6 sm:hidden"><div className="w-12 h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full" /></div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-black text-gray-800 dark:text-white">{editingRule ? '编辑规则' : '自定义新规则'}</h2>
          <Button variant="icon" icon="close" onClick={() => setShowModal(false)} className="text-gray-400"/>
        </div>
        <div className="space-y-7">
          <div>
            <label htmlFor="rule-title-input" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">规则名称</label>
            <Input id="rule-title-input" type="text" value={ruleTitle} onChange={(e) => setRuleTitle(e.target.value)} placeholder="例如：专注先锋" className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 text-lg font-bold focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300"/>
          </div>
          <div>
            <label htmlFor="rule-desc-input" className="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 ml-1">奖励说明</label>
            <textarea id="rule-desc-input" value={ruleDesc} onChange={(e) => setRuleDesc(e.target.value)} placeholder="达成规则后获得的鼓励..." rows={2} className="w-full bg-gray-50 dark:bg-gray-800 border-none rounded-2xl py-4 px-6 font-bold focus:ring-2 focus:ring-primary/20 placeholder:text-gray-300 resize-none"/>
          </div>
          {/* ... (rest of the form) ... */}
          <Button onClick={handleSaveRule} disabled={!ruleTitle} variant="primary" className="w-full py-4 rounded-full font-black text-lg shadow-lg">
            <span className="material-icons-round">check_circle</span>
            {editingRule ? '保存修改' : '创建规则'}
          </Button>
        </div>
      </Modal>

      <Modal isOpen={showHelpModal} onClose={() => setShowHelpModal(false)} contentClassName="rounded-[3rem] p-8 w-full max-w-xs animate-fade-in-up">
        <div className="flex flex-col items-center text-center">
          <div className="w-20 h-20 rounded-full bg-teal-50 dark:bg-teal-900/30 flex items-center justify-center text-primary mb-6 shadow-sm"><span className="material-icons-round text-4xl">info</span></div>
          <h2 className="text-xl font-black mb-6">奖励规则说明</h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 font-medium"><span className="font-black text-gray-800 dark:text-white">时长规则：</span> 设定一个目标时长，每当你坚持完成专注，就能获得丰厚的经验值奖励。</p>
          <Button onClick={() => setShowHelpModal(false)} variant="primary" className="mt-10 w-full py-4 rounded-full font-black">我知道了</Button>
        </div>
      </Modal>

      <NavBar currentView="settings" onNavigate={onNavigate} />
    </div>
  );
}
