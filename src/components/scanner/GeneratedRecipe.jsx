import React from 'react';
import { ArrowLeft, Clock, Users, BarChart3, AlertCircle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

export default function GeneratedRecipe({ recipe, ingredients, onBack, onBackToScanner }) {
  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-[#FF7B00] to-[#E06800] text-white p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Receta Generada</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-4">
        {/* Recipe header */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-2xl border border-border p-5">
          <h2 className="text-xl font-bold text-foreground">{recipe.recipe_name}</h2>
          {recipe.description && <p className="text-sm text-muted-foreground mt-2">{recipe.description}</p>}
          <div className="flex gap-4 mt-4">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              <span>{recipe.time_minutes} min</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>{recipe.servings} porciones</span>
            </div>
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <BarChart3 className="w-4 h-4" />
              <span>{recipe.difficulty}</span>
            </div>
          </div>
        </motion.div>

        {/* Nutrition */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Calorías', value: recipe.calories, unit: 'kcal', color: 'text-orange-500' },
            { label: 'Proteína', value: recipe.protein, unit: 'g', color: 'text-red-500' },
            { label: 'Carbos', value: recipe.carbs, unit: 'g', color: 'text-blue-500' },
            { label: 'Grasas', value: recipe.fat, unit: 'g', color: 'text-yellow-500' },
          ].map(m => (
            <div key={m.label} className="bg-card rounded-xl border border-border p-3 text-center">
              <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
              <p className="text-[10px] text-muted-foreground">{m.unit}</p>
              <p className="text-[10px] font-medium mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Available ingredients */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-sm mb-3 text-[#4CAF50]">✅ Ingredientes disponibles</h3>
          <div className="flex flex-wrap gap-2">
            {recipe.available_ingredients?.map(ing => (
              <span key={ing} className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs rounded-full">{ing}</span>
            ))}
          </div>
        </div>

        {/* Missing ingredients */}
        {recipe.missing_ingredients?.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className="w-4 h-4 text-[#FF7B00]" />
              <h3 className="font-semibold text-sm text-[#FF7B00]">Te faltan únicamente:</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {recipe.missing_ingredients.map(ing => (
                <span key={ing} className="px-3 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs rounded-full">{ing}</span>
              ))}
            </div>
          </div>
        )}

        {/* Steps */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <h3 className="font-semibold text-sm mb-4">📝 Preparación</h3>
          <div className="space-y-4">
            {recipe.steps?.map((step, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-7 h-7 rounded-full bg-[#4CAF50] text-white flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed pt-1">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        {recipe.benefits && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-2">🌿 Beneficios</h3>
            <p className="text-sm text-muted-foreground">{recipe.benefits}</p>
          </div>
        )}

        {/* Alternative recipes */}
        {recipe.alternative_recipes?.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-[#FF7B00]" />
              <h3 className="font-semibold text-sm">Otras recetas posibles</h3>
            </div>
            <div className="space-y-3">
              {recipe.alternative_recipes.map((alt, i) => (
                <div key={i} className="p-3 bg-muted rounded-xl">
                  <p className="font-medium text-sm">{alt.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">{alt.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <Button onClick={onBackToScanner} variant="outline" className="w-full rounded-xl h-12">
          Volver al escáner
        </Button>
      </div>
    </div>
  );
}