import React from 'react';
import { ArrowLeft, Clock, Users, BarChart3 } from 'lucide-react';

export default function RecipeDetail({ recipe, onBack }) {
  const ingredients = recipe.ingredients?.split('\n').filter(Boolean) || [];
  const steps = recipe.preparation?.split('\n').filter(Boolean) || [];

  return (
    <div className="max-w-lg mx-auto pb-4">
      {/* Header image */}
      <div className="relative">
        {recipe.image_url ? (
          <img src={recipe.image_url} alt={recipe.name} className="w-full h-56 object-cover" />
        ) : (
          <div className="w-full h-56 bg-gradient-to-br from-[#FF7B00] to-[#E06800]" />
        )}
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/50 to-transparent">
          <button onClick={onBack} className="p-2 rounded-full bg-black/30 text-white">
            <ArrowLeft className="w-5 h-5" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <h1 className="text-white text-2xl font-bold">{recipe.name}</h1>
        </div>
      </div>

      <div className="px-4 space-y-4 mt-4">
        {/* Quick info */}
        <div className="flex gap-3">
          {recipe.time_minutes && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-2">
              <Clock className="w-4 h-4" /> {recipe.time_minutes} min
            </div>
          )}
          {recipe.servings && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-2">
              <Users className="w-4 h-4" /> {recipe.servings} porc.
            </div>
          )}
          {recipe.difficulty && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-card border border-border rounded-xl px-3 py-2 capitalize">
              <BarChart3 className="w-4 h-4" /> {recipe.difficulty}
            </div>
          )}
        </div>

        {/* Nutrition */}
        <div className="grid grid-cols-4 gap-2">
          {[
            { label: 'Calorías', value: recipe.calories, unit: 'kcal', color: 'text-orange-500' },
            { label: 'Proteína', value: recipe.protein, unit: 'g', color: 'text-red-500' },
            { label: 'Carbos', value: recipe.carbs, unit: 'g', color: 'text-blue-500' },
            { label: 'Grasas', value: recipe.fat, unit: 'g', color: 'text-yellow-500' },
          ].map(m => (
            <div key={m.label} className="bg-card rounded-xl border border-border p-3 text-center">
              <p className={`text-lg font-bold ${m.color}`}>{m.value || '-'}</p>
              <p className="text-[10px] font-medium mt-1">{m.label}</p>
            </div>
          ))}
        </div>

        {/* Ingredients */}
        {ingredients.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-3">🧂 Ingredientes</h3>
            <ul className="space-y-2">
              {ingredients.map((ing, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <span className="w-2 h-2 rounded-full bg-[#4CAF50] mt-1.5 shrink-0" />
                  {ing}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Preparation */}
        {steps.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-4">📝 Preparación</h3>
            <div className="space-y-4">
              {steps.map((step, i) => (
                <div key={i} className="flex gap-3">
                  <div className="w-7 h-7 rounded-full bg-[#4CAF50] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    {i + 1}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed pt-1">{step}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Extra info */}
        {recipe.vitamins && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-2">💊 Vitaminas y Minerales</h3>
            <p className="text-sm text-muted-foreground">{recipe.vitamins}</p>
            {recipe.minerals && <p className="text-sm text-muted-foreground mt-1">{recipe.minerals}</p>}
          </div>
        )}

        {recipe.benefits && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-2">🌿 Beneficios</h3>
            <p className="text-sm text-muted-foreground">{recipe.benefits}</p>
          </div>
        )}

        {recipe.tips && (
          <div className="bg-card rounded-2xl border border-border p-4">
            <h3 className="font-semibold text-sm mb-2">💡 Consejos nutricionales</h3>
            <p className="text-sm text-muted-foreground">{recipe.tips}</p>
          </div>
        )}
      </div>
    </div>
  );
}