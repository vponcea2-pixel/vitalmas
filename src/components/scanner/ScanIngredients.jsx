import React, { useState } from 'react';
import { ArrowLeft, Camera, Plus, X, ChefHat } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import GeneratedRecipe from './GeneratedRecipe';

export default function ScanIngredients({ onBack }) {
  const [ingredients, setIngredients] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [manualInput, setManualInput] = useState('');
  const [showManual, setShowManual] = useState(false);
  const [generatingRecipe, setGeneratingRecipe] = useState(false);
  const [recipe, setRecipe] = useState(null);
  const { toast } = useToast();

  const scanIngredient = async (url) => {
    setShowCamera(false);
    setScanning(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: 'Identifica el ingrediente de cocina que aparece en esta imagen. Responde SOLO con el nombre del ingrediente en español. Si ves varios ingredientes, nombra el principal.',
        response_json_schema: {
          type: "object",
          properties: { ingredient_name: { type: "string" } }
        },
        file_urls: [url]
      });
      const name = res.ingredient_name;
      if (name && !ingredients.includes(name)) {
        setIngredients(prev => [...prev, name]);
      }
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo identificar el ingrediente', variant: 'destructive' });
    }
    setScanning(false);
  };

  const addManual = () => {
    const trimmed = manualInput.trim();
    if (trimmed && !ingredients.includes(trimmed)) {
      setIngredients(prev => [...prev, trimmed]);
      setManualInput('');
    }
  };

  const removeIngredient = (name) => {
    setIngredients(prev => prev.filter(i => i !== name));
  };

  const generateRecipe = async () => {
    if (ingredients.length < 2) {
      toast({ title: 'Agrega más ingredientes', description: 'Necesitas al menos 2 ingredientes', variant: 'destructive' });
      return;
    }
    setGeneratingRecipe(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Tengo estos ingredientes: ${ingredients.join(', ')}.

Genera la MEJOR receta posible usando estos ingredientes, preferiblemente una receta ecuatoriana si es posible. Responde en español con TODA esta información:
- Nombre de la receta
- Lista de ingredientes que tengo disponibles
- Lista de ingredientes que me faltan (para completar la receta)
- Tiempo de preparación en minutos
- Dificultad (fácil, media, difícil)
- Preparación paso a paso detallada
- Información nutricional completa
- También sugiere 3 recetas alternativas que podría hacer con los mismos ingredientes`,
        response_json_schema: {
          type: "object",
          properties: {
            recipe_name: { type: "string" },
            description: { type: "string" },
            available_ingredients: { type: "array", items: { type: "string" } },
            missing_ingredients: { type: "array", items: { type: "string" } },
            time_minutes: { type: "number" },
            difficulty: { type: "string" },
            servings: { type: "number" },
            steps: { type: "array", items: { type: "string" } },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fat: { type: "number" },
            fiber: { type: "number" },
            benefits: { type: "string" },
            alternative_recipes: { type: "array", items: { type: "object", properties: { name: { type: "string" }, description: { type: "string" } } } }
          }
        },
        model: 'claude_sonnet_4_6'
      });
      setRecipe(res);
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo generar la receta', variant: 'destructive' });
    }
    setGeneratingRecipe(false);
  };

  if (recipe) return <GeneratedRecipe recipe={recipe} ingredients={ingredients} onBack={() => setRecipe(null)} onBackToScanner={onBack} />;

  return (
    <div className="max-w-lg mx-auto">
      {showCamera && (
        <CameraCapture onCapture={scanIngredient} onClose={() => setShowCamera(false)} label="Escanear ingrediente" />
      )}

      <div className="bg-gradient-to-br from-[#4CAF50] to-[#388E3C] text-white p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Escanear Ingredientes</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-4">
        {/* Ingredient list */}
        <div className="bg-card rounded-2xl border border-border p-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm">Mis ingredientes ({ingredients.length})</h3>
          </div>

          {ingredients.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Escanea o agrega ingredientes para generar una receta
            </p>
          ) : (
            <div className="flex flex-wrap gap-2 mb-3">
              <AnimatePresence>
                {ingredients.map(name => (
                  <motion.span
                    key={name}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#4CAF50]/10 text-[#4CAF50] rounded-full text-sm font-medium"
                  >
                    {name}
                    <button onClick={() => removeIngredient(name)} className="hover:text-red-500">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Scanning indicator */}
        {scanning && (
          <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
            <div className="w-8 h-8 border-2 border-[#4CAF50] border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-medium">Identificando ingrediente...</span>
          </div>
        )}

        {/* Actions */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            onClick={() => setShowCamera(true)}
            className="h-14 rounded-xl bg-[#4CAF50] hover:bg-[#43A047] text-white"
          >
            <Camera className="w-5 h-5 mr-2" />
            Escanear
          </Button>
          <Button
            onClick={() => setShowManual(!showManual)}
            variant="outline"
            className="h-14 rounded-xl"
          >
            <Plus className="w-5 h-5 mr-2" />
            Manual
          </Button>
        </div>

        {/* Manual input */}
        <AnimatePresence>
          {showManual && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
              <div className="flex gap-2">
                <Input
                  value={manualInput}
                  onChange={(e) => setManualInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && addManual()}
                  placeholder="Nombre del ingrediente..."
                  className="rounded-xl"
                />
                <Button onClick={addManual} className="rounded-xl bg-[#4CAF50] hover:bg-[#43A047] text-white">
                  Agregar
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Generate */}
        {ingredients.length >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Button
              onClick={generateRecipe}
              disabled={generatingRecipe}
              className="w-full h-14 rounded-xl bg-gradient-to-r from-[#4CAF50] to-[#66BB6A] hover:from-[#388E3C] hover:to-[#4CAF50] text-white text-base font-bold"
            >
              {generatingRecipe ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Generando receta...
                </>
              ) : (
                <>
                  <ChefHat className="w-5 h-5 mr-2" />
                  Generar Receta
                </>
              )}
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}
