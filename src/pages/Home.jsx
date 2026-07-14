import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { Camera, Droplets, Dumbbell, UtensilsCrossed, Pill } from 'lucide-react';
import { motion } from 'framer-motion';

const weekDays = ['W1', 'W2', 'W3', 'W4'];

const quickLinks = [
  { icon: UtensilsCrossed, label: 'Recetas', path: '/recipes', color: 'bg-orange-100 text-[#FF7B00]' },
  { icon: Droplets, label: 'Agua', path: '/hydration', color: 'bg-blue-100 text-blue-500' },
  { icon: Dumbbell, label: 'Ejercicios', path: '/exercises', color: 'bg-purple-100 text-purple-500' },
  { icon: Pill, label: 'Vitaminas', path: '/vitamins', color: 'bg-yellow-100 text-yellow-600' },
];

export default function Home() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [todayMeals, setTodayMeals] = useState([]);
  const [activeWeek, setActiveWeek] = useState('W1');

  useEffect(() => { loadData(); }, [user]);

  const loadData = async () => {
    if (!user) {
      const localProfile = localStorage.getItem('vitalmas_guest_profile');
      if (localProfile) setProfile(JSON.parse(localProfile));
      const today = new Date().toISOString().split('T')[0];
      const meals = JSON.parse(localStorage.getItem('vitalmas_guest_meals') || '[]');
      setTodayMeals(meals.filter(meal => meal.scan_date === today));
      return;
    }
    try {
      const profiles = await base44.entities.UserProfile.filter({ created_by_id: user?.id });
      if (profiles.length > 0) setProfile(profiles[0]);
      const today = new Date().toISOString().split('T')[0];
      const meals = await base44.entities.MealScan.filter({ scan_date: today });
      setTodayMeals(meals);
    } catch (e) { /* silent */ }
  };

  const firstName = (profile?.full_name || user?.full_name || 'Invitado').split(' ')[0];
  const totalCalories = todayMeals.reduce((s, m) => s + (m.calories || 0), 0);

  return (
    <div className="max-w-lg mx-auto px-5 space-y-6 pb-6">
      {/* Greeting */}
      <div className="pt-2">
        <h1 className="text-2xl font-bold text-foreground">¡Hola, {firstName}!</h1>
        <p className="text-muted-foreground text-sm mt-0.5">Bienvenida a VitalMás</p>
      </div>

      {/* Scanner CTA */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
        <Link to="/scanner">
          <div className="bg-gradient-to-br from-[#4CAF50] to-[#388E3C] rounded-3xl p-8 flex flex-col items-center justify-center text-white shadow-lg min-h-[160px] relative overflow-hidden">
            {/* decorative circles */}
            <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/10 rounded-full" />
            <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-white/10 rounded-full" />
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-3 relative z-10">
              <Camera className="w-9 h-9 text-white" />
            </div>
            <p className="text-lg font-bold relative z-10">Escanear Comida con Foto</p>
            <p className="text-sm text-green-100 mt-1 relative z-10">Calcula Calorías Al Instante</p>
          </div>
        </Link>
      </motion.div>

      {/* Weekly Plan */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground">Plan Mensual</p>
            <p className="font-semibold text-sm text-foreground">Semanal</p>
          </div>
        </div>
        <div className="flex gap-2">
          {weekDays.map((w) => (
            <button
              key={w}
              onClick={() => setActiveWeek(w)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all ${
                activeWeek === w
                  ? 'bg-[#FF7B00] text-white shadow'
                  : 'bg-muted text-muted-foreground'
              }`}
            >
              {w}
            </button>
          ))}
        </div>

        {/* Progress bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{totalCalories} kcal hoy</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-[#FF7B00] to-[#FF9A40] rounded-full transition-all duration-500"
              style={{ width: `${Math.min((totalCalories / 2000) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Food image banner */}
      <div className="rounded-2xl overflow-hidden h-36 relative">
        <img
          src="https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=600&q=80"
          alt="Comida saludable"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent flex items-end p-4">
          <p className="text-white font-semibold text-sm">Recetas saludables para hoy</p>
        </div>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-4 gap-3">
        {quickLinks.map(({ icon: Icon, label, path, color }) => (
          <Link key={path} to={path} className="flex flex-col items-center gap-2">
            <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center`}>
              <Icon className="w-5 h-5" />
            </div>
            <span className="text-[11px] text-muted-foreground font-medium">{label}</span>
          </Link>
        ))}
      </div>

      {/* Recent meals */}
      {todayMeals.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Comidas de hoy</h3>
          <div className="space-y-2">
            {todayMeals.slice(0, 3).map((meal) => (
              <div key={meal.id} className="flex items-center gap-3 bg-card rounded-xl border border-border p-3">
                {meal.image_url && <img src={meal.image_url} alt="" className="w-11 h-11 rounded-lg object-cover" />}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{meal.dish_name}</p>
                  <p className="text-xs text-muted-foreground">{meal.calories} kcal</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Setup prompt */}
      {!profile && (
        <Link to="/profile" className="block bg-gradient-to-r from-[#4CAF50] to-[#388E3C] text-white p-4 rounded-2xl">
          <p className="font-bold">¡Completa tu perfil! 🎯</p>
          <p className="text-sm text-green-100 mt-1">Configura tus datos para recomendaciones personalizadas</p>
        </Link>
      )}
    </div>
  );
}
