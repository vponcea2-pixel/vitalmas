import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Search, Clock, Users, BarChart3, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import RecipeDetail from '@/components/recipes/RecipeDetail';

const CATEGORIES = [
  { id: 'all', label: 'Todas' },
  { id: 'lose_weight', label: 'Bajar de peso' },
  { id: 'gain_muscle', label: 'Ganar masa' },
  { id: 'healthy', label: 'Saludable' },
];

const FILTERS = [
  { id: 'costa', label: '🌊 Costa' },
  { id: 'sierra', label: '🏔️ Sierra' },
  { id: 'amazonia', label: '🌿 Amazonía' },
  { id: 'low_cal', label: '🔥 Bajo en calorías' },
  { id: 'high_protein', label: '💪 Alto en proteínas' },
  { id: 'vegetarian', label: '🥬 Vegetariano' },
  { id: 'gluten_free', label: '🌾 Sin gluten' },
  { id: 'lactose_free', label: '🥛 Sin lactosa' },
];

export default function Recipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [activeFilters, setActiveFilters] = useState([]);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);

  useEffect(() => {
    loadRecipes();
  }, []);

  const loadRecipes = async () => {
    try {
      const data = await base44.entities.Recipe.list('-created_date', 100);
      setRecipes(data);
    } catch (e) { /* silent */ }
    setLoading(false);
  };

  const toggleFilter = (id) => {
    setActiveFilters(prev => prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id]);
  };

  const filtered = recipes.filter(r => {
    if (search && !r.name?.toLowerCase().includes(search.toLowerCase())) return false;
    if (category !== 'all' && r.category !== category) return false;
    if (activeFilters.includes('costa') && r.region !== 'costa') return false;
    if (activeFilters.includes('sierra') && r.region !== 'sierra') return false;
    if (activeFilters.includes('amazonia') && r.region !== 'amazonia') return false;
    const tags = (r.tags || '').toLowerCase();
    if (activeFilters.includes('low_cal') && r.calories > 300) return false;
    if (activeFilters.includes('high_protein') && r.protein < 20) return false;
    if (activeFilters.includes('vegetarian') && !tags.includes('vegetarian')) return false;
    if (activeFilters.includes('gluten_free') && !tags.includes('sin gluten')) return false;
    if (activeFilters.includes('lactose_free') && !tags.includes('sin lactosa')) return false;
    return true;
  });

  if (selectedRecipe) return <RecipeDetail recipe={selectedRecipe} onBack={() => setSelectedRecipe(null)} />;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-[#FF7B00] to-[#E06800] text-white p-6 pb-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Recetas Ecuatorianas</h1>
        <p className="text-orange-100 text-sm mt-1">Descubre sabores tradicionales saludables</p>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-orange-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar recetas..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/15 rounded-xl text-white placeholder:text-orange-200 text-sm focus:outline-none focus:bg-white/25"
          />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {CATEGORIES.map(c => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                category === c.id
                  ? 'bg-[#4CAF50] text-white shadow-md'
                  : 'bg-card border border-border text-foreground'
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        {/* Filters toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground"
        >
          <Filter className="w-4 h-4" />
          Filtros {activeFilters.length > 0 && `(${activeFilters.length})`}
        </button>

        <AnimatePresence>
          {showFilters && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex flex-wrap gap-2">
                {FILTERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => toggleFilter(f.id)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      activeFilters.includes(f.id)
                        ? 'bg-[#FF7B00] text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Recipe list */}
        {loading ? (
          <div className="flex justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#4CAF50]/20 border-t-[#4CAF50] rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No se encontraron recetas</p>
          </div>
        ) : (
          <div className="space-y-3 pb-4">
            {filtered.map((recipe, i) => (
              <motion.button
                key={recipe.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => setSelectedRecipe(recipe)}
                className="w-full bg-card rounded-2xl border border-border overflow-hidden text-left hover:shadow-md transition-all"
              >
                {recipe.image_url && (
                  <img src={recipe.image_url} alt={recipe.name} className="w-full h-40 object-cover" />
                )}
                <div className="p-4">
                  <h3 className="font-bold text-foreground">{recipe.name}</h3>
                  <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                    {recipe.time_minutes && (
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {recipe.time_minutes} min</span>
                    )}
                    {recipe.servings && (
                      <span className="flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {recipe.servings} porc.</span>
                    )}
                    {recipe.calories && (
                      <span className="flex items-center gap-1"><BarChart3 className="w-3.5 h-3.5" /> {recipe.calories} kcal</span>
                    )}
                  </div>
                  {recipe.region && (
                    <span className="inline-block mt-2 px-2.5 py-0.5 bg-muted rounded-full text-[10px] font-medium text-muted-foreground capitalize">
                      {recipe.region}
                    </span>
                  )}
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}