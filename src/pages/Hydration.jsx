import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Droplets, Plus, Minus, Target, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';

export default function Hydration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todayLog, setTodayLog] = useState(null);
  const [goal, setGoal] = useState(8);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    loadData();
  }, [user]);

  const loadData = async () => {
    if (!user) {
      const saved = JSON.parse(localStorage.getItem('vitalmas_guest_hydration') || '{}');
      setGoal(saved.goal || 8);
      setHistory(saved.history || []);
      setTodayLog((saved.history || []).find(log => log.date === today) || null);
      setLoading(false);
      return;
    }
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: user?.id });
      if (profiles.length > 0 && profiles[0].daily_water_goal) {
        setGoal(profiles[0].daily_water_goal);
      }

      const logs = await base44.entities.HydrationLog.filter({}, '-date', 30);
      setHistory(logs);

      const todayLogs = logs.filter(l => l.date === today);
      if (todayLogs.length > 0) setTodayLog(todayLogs[0]);
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  const glasses = todayLog?.glasses || 0;
  const percentage = Math.min((glasses / goal) * 100, 100);

  const updateGlasses = async (delta) => {
    const newGlasses = Math.max(0, glasses + delta);
    if (!user) {
      const nextLog = { id: `guest-${today}`, glasses: newGlasses, date: today, goal };
      const nextHistory = [nextLog, ...history.filter(log => log.date !== today)];
      setTodayLog(nextLog);
      setHistory(nextHistory);
      localStorage.setItem('vitalmas_guest_hydration', JSON.stringify({ goal, history: nextHistory }));
      if (newGlasses === goal) {
        toast({ title: '🎉 ¡Meta cumplida!', description: 'Has alcanzado tu meta de hidratación' });
      }
      return;
    }
    try {
      if (todayLog) {
        await base44.entities.HydrationLog.update(todayLog.id, { glasses: newGlasses });
        setTodayLog({ ...todayLog, glasses: newGlasses });
      } else {
        const created = await base44.entities.HydrationLog.create({ glasses: newGlasses, date: today, goal });
        setTodayLog(created);
      }
      if (newGlasses === goal) {
        toast({ title: '🎉 ¡Meta cumplida!', description: 'Has alcanzado tu meta de hidratación' });
      }
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo actualizar', variant: 'destructive' });
    }
  };

  const weekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  const getLast7Days = () => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const log = history.find(h => h.date === dateStr);
      days.push({
        day: weekDays[d.getDay() === 0 ? 6 : d.getDay() - 1],
        glasses: log?.glasses || 0,
        isToday: i === 0,
      });
    }
    return days;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 pb-10 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Hidratación</h1>
        <p className="text-blue-100 text-sm mt-1">Mantén tu cuerpo hidratado</p>
      </div>

      <div className="px-4 -mt-6 space-y-5 pb-4">
        {/* Main circle */}
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-card rounded-3xl border border-border p-6 text-center">
          <div className="relative w-48 h-48 mx-auto mb-4">
            <svg className="w-48 h-48 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
              <circle
                cx="50" cy="50" r="45" fill="none" stroke="#3B82F6" strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${percentage * 2.83} ${283 - percentage * 2.83}`}
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Droplets className="w-8 h-8 text-blue-500 mb-1" />
              <span className="text-3xl font-bold text-foreground">{glasses}</span>
              <span className="text-sm text-muted-foreground">de {goal} vasos</span>
            </div>
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={() => updateGlasses(-1)}
              disabled={glasses <= 0}
              className="w-14 h-14 rounded-full bg-muted flex items-center justify-center text-foreground hover:bg-muted/80 disabled:opacity-30 transition-all"
            >
              <Minus className="w-6 h-6" />
            </button>
            <button
              onClick={() => updateGlasses(1)}
              className="w-14 h-14 rounded-full bg-blue-500 flex items-center justify-center text-white hover:bg-blue-600 transition-all active:scale-95"
            >
              <Plus className="w-6 h-6" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">{Math.round(glasses * 250)} ml de {goal * 250} ml</p>
        </motion.div>

        {/* Weekly chart */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <h3 className="font-semibold text-sm">Últimos 7 días</h3>
          </div>
          <div className="flex items-end justify-between gap-2 h-24">
            {getLast7Days().map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full bg-muted rounded-full overflow-hidden flex flex-col justify-end" style={{ height: '80px' }}>
                  <div
                    className={`w-full rounded-full transition-all duration-300 ${d.isToday ? 'bg-blue-500' : 'bg-blue-300 dark:bg-blue-700'}`}
                    style={{ height: `${Math.min((d.glasses / goal) * 100, 100)}%` }}
                  />
                </div>
                <span className={`text-[10px] ${d.isToday ? 'font-bold text-blue-500' : 'text-muted-foreground'}`}>
                  {d.day}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Goal setting */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-4 h-4 text-[#FF7B00]" />
            <h3 className="font-semibold text-sm">Meta diaria</h3>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                const nextGoal = Math.max(1, goal - 1);
                setGoal(nextGoal);
                if (!user) localStorage.setItem('vitalmas_guest_hydration', JSON.stringify({ goal: nextGoal, history }));
              }}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="text-2xl font-bold flex-1 text-center">{goal} vasos</span>
            <button
              onClick={() => {
                const nextGoal = goal + 1;
                setGoal(nextGoal);
                if (!user) localStorage.setItem('vitalmas_guest_hydration', JSON.stringify({ goal: nextGoal, history }));
              }}
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">{goal * 250} ml al día</p>
        </div>
      </div>
    </div>
  );
}
