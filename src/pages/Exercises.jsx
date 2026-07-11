import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { Dumbbell, Play, Pause, RotateCcw, Check, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/AuthContext';

const ROUTINES = {
  beginner: [
    { name: 'Sentadillas', duration: 30, rest: 15, calories: 8, instructions: 'Pies al ancho de hombros, baja como sentándote. 15 repeticiones.' },
    { name: 'Flexiones modificadas', duration: 30, rest: 15, calories: 6, instructions: 'Apoya las rodillas, baja el pecho al suelo. 10 repeticiones.' },
    { name: 'Plancha', duration: 20, rest: 15, calories: 5, instructions: 'Mantén la posición con el cuerpo recto. 20 segundos.' },
    { name: 'Zancadas', duration: 30, rest: 15, calories: 8, instructions: 'Da un paso largo hacia adelante, flexiona ambas rodillas. 10 por pierna.' },
    { name: 'Puente de glúteos', duration: 30, rest: 15, calories: 5, instructions: 'Acuéstate boca arriba, sube la cadera. 15 repeticiones.' },
    { name: 'Marcha en el sitio', duration: 60, rest: 15, calories: 8, instructions: 'Levanta las rodillas alternando. 1 minuto.' },
  ],
  intermediate: [
    { name: 'Burpees', duration: 30, rest: 20, calories: 12, instructions: 'Salto, plancha, flexión, salto. 10 repeticiones.' },
    { name: 'Sentadilla con salto', duration: 30, rest: 20, calories: 10, instructions: 'Sentadilla profunda, salta explosivamente. 12 repeticiones.' },
    { name: 'Mountain climbers', duration: 30, rest: 15, calories: 10, instructions: 'En posición de plancha, lleva rodillas al pecho alternando. 30 segundos.' },
    { name: 'Flexiones diamante', duration: 30, rest: 20, calories: 8, instructions: 'Manos juntas en forma de diamante. 12 repeticiones.' },
    { name: 'Plancha lateral', duration: 30, rest: 15, calories: 5, instructions: '30 segundos cada lado.' },
    { name: 'Jumping jacks', duration: 45, rest: 15, calories: 10, instructions: 'Saltos abriendo y cerrando piernas y brazos. 45 segundos.' },
  ],
  advanced: [
    { name: 'Pistol squats', duration: 30, rest: 20, calories: 12, instructions: 'Sentadilla en una pierna. 8 por pierna.' },
    { name: 'Flexiones pliométricas', duration: 30, rest: 20, calories: 12, instructions: 'Flexión explosiva con palmada. 10 repeticiones.' },
    { name: 'Burpees con flexión', duration: 45, rest: 20, calories: 15, instructions: 'Burpee completo con flexión al bajar. 12 repeticiones.' },
    { name: 'Plancha con toque de hombro', duration: 30, rest: 15, calories: 8, instructions: 'En plancha, toca el hombro opuesto alternando. 30 segundos.' },
    { name: 'Sentadilla búlgara', duration: 30, rest: 20, calories: 10, instructions: 'Pie trasero elevado, baja con control. 10 por pierna.' },
    { name: 'Sprint en sitio', duration: 30, rest: 15, calories: 12, instructions: 'Corre en el lugar lo más rápido posible. 30 segundos.' },
  ],
};

const LEVEL_INFO = {
  beginner: { label: 'Principiante', color: 'bg-green-500', emoji: '🟢', totalTime: 15, totalCal: 120 },
  intermediate: { label: 'Intermedio', color: 'bg-yellow-500', emoji: '🟡', totalTime: 25, totalCal: 200 },
  advanced: { label: 'Avanzado', color: 'bg-red-500', emoji: '🔴', totalTime: 35, totalCal: 300 },
};

export default function Exercises() {
  const { user } = useAuth();
  const [selectedLevel, setSelectedLevel] = useState(null);
  const [currentExercise, setCurrentExercise] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [isResting, setIsResting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [completed, setCompleted] = useState(false);
  const intervalRef = useRef(null);
  const { toast } = useToast();

  const exercises = selectedLevel ? ROUTINES[selectedLevel] : [];
  const current = exercises[currentExercise];

  useEffect(() => {
    if (isActive && timeLeft > 0) {
      intervalRef.current = setInterval(() => setTimeLeft(t => t - 1), 1000);
      return () => clearInterval(intervalRef.current);
    }
    if (isActive && timeLeft === 0) {
      if (isResting) {
        setIsResting(false);
        if (currentExercise < exercises.length - 1) {
          setCurrentExercise(prev => prev + 1);
          setTimeLeft(exercises[currentExercise + 1].duration);
        } else {
          finishWorkout();
        }
      } else {
        if (currentExercise < exercises.length - 1) {
          setIsResting(true);
          setTimeLeft(current.rest);
        } else {
          finishWorkout();
        }
      }
    }
  }, [isActive, timeLeft]);

  const startWorkout = () => {
    setCurrentExercise(0);
    setTimeLeft(exercises[0].duration);
    setIsActive(true);
    setCompleted(false);
    setIsResting(false);
  };

  const togglePause = () => setIsActive(!isActive);

  const finishWorkout = async () => {
    setIsActive(false);
    setCompleted(true);
    const info = LEVEL_INFO[selectedLevel];
    if (!user) {
      const guestLogs = JSON.parse(localStorage.getItem('vitalmas_guest_exercises') || '[]');
      localStorage.setItem('vitalmas_guest_exercises', JSON.stringify([
        {
          id: `guest-${Date.now()}`,
          exercise_name: `Rutina ${info.label}`,
          level: selectedLevel,
          duration_minutes: info.totalTime,
          calories_burned: info.totalCal,
          date: new Date().toISOString().split('T')[0],
          completed: true,
        },
        ...guestLogs,
      ].slice(0, 20)));
      toast({ title: '🎉 ¡Rutina completada!', description: 'Progreso guardado en este dispositivo' });
      return;
    }
    try {
      await base44.entities.ExerciseLog.create({
        exercise_name: `Rutina ${info.label}`,
        level: selectedLevel,
        duration_minutes: info.totalTime,
        calories_burned: info.totalCal,
        date: new Date().toISOString().split('T')[0],
        completed: true,
      });
      toast({ title: '🎉 ¡Rutina completada!', description: `Quemaste aproximadamente ${info.totalCal} calorías` });
    } catch (e) { /* silent */ }
  };

  const reset = () => {
    setIsActive(false);
    setCurrentExercise(0);
    setTimeLeft(0);
    setCompleted(false);
    setIsResting(false);
    setSelectedLevel(null);
  };

  // Level selection
  if (!selectedLevel) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-6 pb-8 rounded-b-3xl">
          <h1 className="text-2xl font-bold">Ejercicios</h1>
          <p className="text-purple-100 text-sm mt-1">Elige tu nivel y comienza tu rutina</p>
        </div>
        <div className="px-4 -mt-4 space-y-3">
          {Object.entries(LEVEL_INFO).map(([key, info], i) => (
            <motion.button
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              onClick={() => setSelectedLevel(key)}
              className="w-full bg-card rounded-2xl border border-border p-5 flex items-center gap-4 text-left hover:shadow-md transition-all"
            >
              <div className={`${info.color} w-12 h-12 rounded-xl flex items-center justify-center text-white`}>
                <Dumbbell className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-foreground">{info.emoji} {info.label}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{info.totalTime} min • ~{info.totalCal} kcal</p>
              </div>
              <ChevronRight className="w-5 h-5 text-muted-foreground" />
            </motion.button>
          ))}
        </div>
      </div>
    );
  }

  // Workout view
  const info = LEVEL_INFO[selectedLevel];

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-purple-500 to-purple-700 text-white p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button onClick={reset} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <RotateCcw className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Rutina {info.label}</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-4">
        {completed ? (
          <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="text-5xl mb-3">🎉</div>
            <h2 className="text-xl font-bold">¡Rutina Completada!</h2>
            <p className="text-muted-foreground text-sm mt-2">Quemaste ~{info.totalCal} kcal en {info.totalTime} min</p>
            <Button onClick={reset} className="mt-6 rounded-xl bg-purple-500 hover:bg-purple-600">
              Volver a rutinas
            </Button>
          </motion.div>
        ) : (
          <>
            {/* Timer */}
            <div className="bg-card rounded-2xl border border-border p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-1">
                {isResting ? '⏸️ Descanso' : `Ejercicio ${currentExercise + 1} de ${exercises.length}`}
              </p>
              <h2 className="text-xl font-bold text-foreground mb-4">
                {isResting ? 'Prepárate...' : current?.name}
              </h2>

              <div className="relative w-36 h-36 mx-auto mb-4">
                <svg className="w-36 h-36 -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="45" fill="none" stroke="hsl(var(--border))" strokeWidth="6" />
                  <circle
                    cx="50" cy="50" r="45" fill="none"
                    stroke={isResting ? '#FF7B00' : '#8B5CF6'}
                    strokeWidth="6" strokeLinecap="round"
                    strokeDasharray={`${(timeLeft / (isResting ? current?.rest : current?.duration) * 283)} 283`}
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-4xl font-bold text-foreground">{timeLeft}</span>
                </div>
              </div>

              {!isActive && timeLeft === 0 ? (
                <Button onClick={startWorkout} className="rounded-xl bg-purple-500 hover:bg-purple-600 h-12 px-8">
                  <Play className="w-5 h-5 mr-2" /> Comenzar
                </Button>
              ) : (
                <Button onClick={togglePause} variant="outline" className="rounded-xl h-12 px-8">
                  {isActive ? <><Pause className="w-5 h-5 mr-2" /> Pausar</> : <><Play className="w-5 h-5 mr-2" /> Continuar</>}
                </Button>
              )}
            </div>

            {/* Instructions */}
            {current && !isResting && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <p className="text-sm text-muted-foreground">{current.instructions}</p>
              </div>
            )}

            {/* Exercise list */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-sm mb-3">Ejercicios</h3>
              <div className="space-y-2">
                {exercises.map((ex, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-3 p-2.5 rounded-xl transition-colors ${
                      i === currentExercise ? 'bg-purple-50 dark:bg-purple-900/20' : ''
                    } ${i < currentExercise ? 'opacity-50' : ''}`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
                      i < currentExercise
                        ? 'bg-green-500 text-white'
                        : i === currentExercise
                        ? 'bg-purple-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}>
                      {i < currentExercise ? <Check className="w-4 h-4" /> : i + 1}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{ex.name}</p>
                      <p className="text-[10px] text-muted-foreground">{ex.duration}s • {ex.calories} kcal</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
