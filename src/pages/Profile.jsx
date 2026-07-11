import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { useTheme } from '@/lib/ThemeContext';
import { User, Edit3, Save, LogOut, LogIn, Moon, Sun, TrendingUp, Activity, Scale, Ruler } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion } from 'framer-motion';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

const GOALS = [
  { value: 'lose_weight', label: 'Bajar de peso' },
  { value: 'gain_muscle', label: 'Ganar masa muscular' },
  { value: 'maintain_weight', label: 'Mantener peso saludable' },
];

const ACTIVITY_LEVELS = [
  { value: 'sedentary', label: 'Sedentario' },
  { value: 'light', label: 'Ligero (1-2 días/sem)' },
  { value: 'moderate', label: 'Moderado (3-5 días/sem)' },
  { value: 'active', label: 'Activo (6-7 días/sem)' },
  { value: 'very_active', label: 'Muy activo (2x/día)' },
];

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { toast } = useToast();
  const [profile, setProfile] = useState(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    full_name: '', age: '', sex: '', weight: '', height: '',
    activity_level: '', goal: '', daily_water_goal: 8,
  });
  const [mealHistory, setMealHistory] = useState([]);
  const [exerciseHistory, setExerciseHistory] = useState([]);

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user) {
      const localProfile = JSON.parse(localStorage.getItem('vitalmas_guest_profile') || 'null');
      if (localProfile) {
        setProfile(localProfile);
        setForm(current => ({ ...current, ...localProfile }));
      } else {
        setEditing(true);
      }
      setMealHistory(JSON.parse(localStorage.getItem('vitalmas_guest_meals') || '[]'));
      setExerciseHistory(JSON.parse(localStorage.getItem('vitalmas_guest_exercises') || '[]'));
      setLoading(false);
      return;
    }
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: user?.id });
      if (profiles.length > 0) {
        setProfile(profiles[0]);
        setForm({
          full_name: profiles[0].full_name || '',
          age: profiles[0].age || '',
          sex: profiles[0].sex || '',
          weight: profiles[0].weight || '',
          height: profiles[0].height || '',
          activity_level: profiles[0].activity_level || '',
          goal: profiles[0].goal || '',
          daily_water_goal: profiles[0].daily_water_goal || 8,
        });
      } else {
        setForm(f => ({ ...f, full_name: user?.full_name || '' }));
        setEditing(true);
      }
      const meals = await base44.entities.MealScan.filter({}, '-scan_date', 20);
      setMealHistory(meals);
      const exercises = await base44.entities.ExerciseLog.filter({}, '-date', 20);
      setExerciseHistory(exercises);
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const data = {
        ...form,
        age: Number(form.age) || null,
        weight: Number(form.weight) || null,
        height: Number(form.height) || null,
        daily_water_goal: Number(form.daily_water_goal) || 8,
      };
      if (!user) {
        const localProfile = { id: 'guest-profile', ...data };
        localStorage.setItem('vitalmas_guest_profile', JSON.stringify(localProfile));
        setProfile(localProfile);
        setEditing(false);
        toast({ title: '✅ Perfil guardado en este dispositivo' });
        setSaving(false);
        return;
      }
      if (profile) {
        await base44.entities.UserProfile.update(profile.id, data);
        setProfile({ ...profile, ...data });
      } else {
        const created = await base44.entities.UserProfile.create(data);
        setProfile(created);
      }
      setEditing(false);
      toast({ title: '✅ Perfil guardado' });
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo guardar el perfil', variant: 'destructive' });
    }
    setSaving(false);
  };

  const bmi = form.weight && form.height
    ? (Number(form.weight) / Math.pow(Number(form.height) / 100, 2)).toFixed(1)
    : null;

  const bmiCategory = (v) => {
    if (v < 18.5) return { label: 'Bajo peso', color: 'text-blue-500' };
    if (v < 25) return { label: 'Normal', color: 'text-green-500' };
    if (v < 30) return { label: 'Sobrepeso', color: 'text-orange-500' };
    return { label: 'Obesidad', color: 'text-red-500' };
  };

  const handleLogout = () => {
    base44.auth.logout('/login');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-[#4CAF50]/20 border-t-[#4CAF50] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-[#4CAF50] to-[#388E3C] text-white p-6 pb-10 rounded-b-3xl">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Mi Perfil</h1>
          <div className="flex gap-2">
            <button onClick={toggleTheme} className="p-2 rounded-full bg-white/20">
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </div>
        </div>
        <div className="flex items-center gap-4 mt-4">
          <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
            <User className="w-8 h-8" />
          </div>
          <div>
            <p className="font-bold text-lg">{form.full_name || 'Sin nombre'}</p>
            <p className="text-green-100 text-sm">{user?.email || 'Modo invitado'}</p>
          </div>
        </div>
      </div>

      <div className="px-4 -mt-6 space-y-4 pb-4">
        {/* BMI Card */}
        {bmi && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Índice de Masa Corporal</p>
                <p className="text-3xl font-bold mt-1">{bmi}</p>
                <p className={`text-sm font-medium ${bmiCategory(Number(bmi)).color}`}>
                  {bmiCategory(Number(bmi)).label}
                </p>
              </div>
              <div className="text-right text-sm text-muted-foreground">
                <p className="flex items-center gap-1 justify-end"><Scale className="w-4 h-4" /> {form.weight} kg</p>
                <p className="flex items-center gap-1 justify-end mt-1"><Ruler className="w-4 h-4" /> {form.height} cm</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Profile form */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-sm">Información personal</h3>
            {!editing && (
              <button onClick={() => setEditing(true)} className="text-[#4CAF50] text-sm font-medium flex items-center gap-1">
                <Edit3 className="w-4 h-4" /> Editar
              </button>
            )}
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs text-muted-foreground">Nombre</label>
              <Input value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} disabled={!editing} className="rounded-xl mt-1" />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Edad</label>
                <Input type="number" value={form.age} onChange={e => setForm({ ...form, age: e.target.value })} disabled={!editing} className="rounded-xl mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Sexo</label>
                <Select value={form.sex} onValueChange={v => setForm({ ...form, sex: v })} disabled={!editing}>
                  <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Masculino</SelectItem>
                    <SelectItem value="female">Femenino</SelectItem>
                    <SelectItem value="other">Otro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground">Peso (kg)</label>
                <Input type="number" value={form.weight} onChange={e => setForm({ ...form, weight: e.target.value })} disabled={!editing} className="rounded-xl mt-1" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground">Estatura (cm)</label>
                <Input type="number" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} disabled={!editing} className="rounded-xl mt-1" />
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Nivel de actividad</label>
              <Select value={form.activity_level} onValueChange={v => setForm({ ...form, activity_level: v })} disabled={!editing}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Seleccionar nivel" /></SelectTrigger>
                <SelectContent>
                  {ACTIVITY_LEVELS.map(l => <SelectItem key={l.value} value={l.value}>{l.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-xs text-muted-foreground">Objetivo</label>
              <Select value={form.goal} onValueChange={v => setForm({ ...form, goal: v })} disabled={!editing}>
                <SelectTrigger className="rounded-xl mt-1"><SelectValue placeholder="Seleccionar objetivo" /></SelectTrigger>
                <SelectContent>
                  {GOALS.map(g => <SelectItem key={g.value} value={g.value}>{g.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {editing && (
              <Button onClick={saveProfile} disabled={saving} className="w-full rounded-xl h-11 bg-[#4CAF50] hover:bg-[#43A047] text-white mt-2">
                <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando...' : 'Guardar cambios'}
              </Button>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <Activity className="w-5 h-5 text-[#FF7B00] mx-auto mb-1" />
            <p className="text-2xl font-bold">{exerciseHistory.length}</p>
            <p className="text-xs text-muted-foreground">Ejercicios</p>
          </div>
          <div className="bg-card rounded-2xl border border-border p-4 text-center">
            <TrendingUp className="w-5 h-5 text-[#4CAF50] mx-auto mb-1" />
            <p className="text-2xl font-bold">{mealHistory.length}</p>
            <p className="text-xs text-muted-foreground">Comidas escaneadas</p>
          </div>
        </div>

        {/* Recent meals */}
        {mealHistory.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-3">Historial de comidas</h3>
            <div className="space-y-2">
              {mealHistory.slice(0, 5).map(meal => (
                <div key={meal.id} className="flex items-center gap-3 p-2 rounded-xl bg-muted">
                  {meal.image_url && <img src={meal.image_url} alt="" className="w-10 h-10 rounded-lg object-cover" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{meal.dish_name}</p>
                    <p className="text-[10px] text-muted-foreground">{meal.calories} kcal • {meal.scan_date}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Logout */}
        <Button
          onClick={user ? handleLogout : () => navigate('/login')}
          variant="outline"
          className="w-full rounded-xl h-11 text-[#4CAF50] border-green-200 hover:bg-green-50 dark:hover:bg-green-900/20"
        >
          {user ? <LogOut className="w-4 h-4 mr-2" /> : <LogIn className="w-4 h-4 mr-2" />}
          {user ? 'Cerrar sesión' : 'Iniciar sesión para sincronizar'}
        </Button>
      </div>
    </div>
  );
}
