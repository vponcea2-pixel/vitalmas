import React, { useState } from 'react';
import { ArrowLeft, Sparkles, Save, ChevronDown, ChevronUp } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { motion, AnimatePresence } from 'framer-motion';
import CameraCapture from './CameraCapture';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

export default function ScanPlate({ onBack }) {
  const [showCamera, setShowCamera] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [showFullNutrition, setShowFullNutrition] = useState(false);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const analyzeImage = async (url) => {
    setImageUrl(url);
    setShowCamera(false);
    setAnalyzing(true);
    try {
      const res = await base44.integrations.Core.InvokeLLM({
        prompt: `Analiza esta imagen de comida. Identifica el plato y proporciona toda la información nutricional estimada por porción típica. Si es comida ecuatoriana, identifícala correctamente (encebollado, bolón, ceviche, seco de pollo, arroz con menestra, hornado, tigrillo, corviche, encocado, etc.).

Responde en español con TODA esta información:`,
        response_json_schema: {
          type: "object",
          properties: {
            dish_name: { type: "string" },
            description: { type: "string" },
            calories: { type: "number" },
            protein: { type: "number" },
            carbs: { type: "number" },
            fat: { type: "number" },
            saturated_fat: { type: "number" },
            fiber: { type: "number" },
            sugar: { type: "number" },
            sodium: { type: "number" },
            potassium: { type: "number" },
            iron: { type: "number" },
            calcium: { type: "number" },
            magnesium: { type: "number" },
            zinc: { type: "number" },
            vitamin_a: { type: "number" },
            vitamin_b: { type: "number" },
            vitamin_c: { type: "number" },
            vitamin_d: { type: "number" },
            vitamin_e: { type: "number" },
            benefits: { type: "string" },
            good_for_lose_weight: { type: "boolean" },
            good_for_gain_muscle: { type: "boolean" },
            good_for_maintain_weight: { type: "boolean" }
          }
        },
        file_urls: [url]
      });
      setResult(res);
    } catch (err) {
      toast({ title: 'Error', description: 'No se pudo analizar la imagen. Intenta de nuevo.', variant: 'destructive' });
    }
    setAnalyzing(false);
  };

  const saveMeal = async (mealType) => {
    if (!result) return;
    setSaving(true);
    try {
      await base44.entities.MealScan.create({
        ...result,
        image_url: imageUrl,
        scan_date: new Date().toISOString().split('T')[0],
        meal_type: mealType,
        added_to_plan: true
      });
      toast({ title: '✅ Guardado', description: `${result.dish_name} agregado a tu historial` });
    } catch (e) {
      toast({ title: 'Error', description: 'No se pudo guardar', variant: 'destructive' });
    }
    setSaving(false);
  };

  const macros = result ? [
    { label: 'Calorías', value: result.calories, unit: 'kcal', color: 'text-orange-500' },
    { label: 'Proteína', value: result.protein, unit: 'g', color: 'text-red-500' },
    { label: 'Carbos', value: result.carbs, unit: 'g', color: 'text-blue-500' },
    { label: 'Grasas', value: result.fat, unit: 'g', color: 'text-yellow-500' },
  ] : [];

  const micronutrients = result ? [
    { label: 'Grasa saturada', value: result.saturated_fat, unit: 'g' },
    { label: 'Fibra', value: result.fiber, unit: 'g' },
    { label: 'Azúcares', value: result.sugar, unit: 'g' },
    { label: 'Sodio', value: result.sodium, unit: 'mg' },
    { label: 'Potasio', value: result.potassium, unit: 'mg' },
    { label: 'Hierro', value: result.iron, unit: 'mg' },
    { label: 'Calcio', value: result.calcium, unit: 'mg' },
    { label: 'Magnesio', value: result.magnesium, unit: 'mg' },
    { label: 'Zinc', value: result.zinc, unit: 'mg' },
    { label: 'Vitamina A', value: result.vitamin_a, unit: 'µg' },
    { label: 'Vitamina B', value: result.vitamin_b, unit: 'mg' },
    { label: 'Vitamina C', value: result.vitamin_c, unit: 'mg' },
    { label: 'Vitamina D', value: result.vitamin_d, unit: 'µg' },
    { label: 'Vitamina E', value: result.vitamin_e, unit: 'mg' },
  ] : [];

  return (
    <div className="max-w-lg mx-auto">
      {showCamera && (
        <CameraCapture onCapture={analyzeImage} onClose={() => setShowCamera(false)} label="Escanear plato" />
      )}

      <div className="bg-gradient-to-br from-[#4CAF50] to-[#388E3C] text-white p-4 pb-6 rounded-b-3xl">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 rounded-full hover:bg-white/20 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <h1 className="text-xl font-bold">Escanear Plato</h1>
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-4 pb-4">
        {!imageUrl && !analyzing && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <button
              onClick={() => setShowCamera(true)}
              className="w-full bg-card rounded-2xl border-2 border-dashed border-[#4CAF50]/30 p-12 flex flex-col items-center gap-3 hover:border-[#4CAF50] transition-colors"
            >
              <div className="w-20 h-20 rounded-full bg-[#4CAF50]/10 flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-[#4CAF50]" />
              </div>
              <p className="font-bold text-foreground">Tomar foto del plato</p>
              <p className="text-sm text-muted-foreground text-center">La IA analizará tu comida e identificará todos los nutrientes</p>
            </button>
          </motion.div>
        )}

        {analyzing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-card rounded-2xl border border-border p-8 text-center">
            <div className="relative w-24 h-24 mx-auto mb-4">
              <div className="w-24 h-24 rounded-full border-4 border-[#4CAF50]/20 border-t-[#4CAF50] animate-spin" />
              <Sparkles className="w-8 h-8 text-[#4CAF50] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
            </div>
            <p className="font-bold text-foreground">Analizando con IA...</p>
            <p className="text-sm text-muted-foreground mt-1">Identificando plato y nutrientes</p>
          </motion.div>
        )}

        {result && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* Dish image & name */}
            {imageUrl && (
              <div className="relative rounded-2xl overflow-hidden">
                <img src={imageUrl} alt={result.dish_name} className="w-full h-48 object-cover" />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                  <h2 className="text-white text-xl font-bold">{result.dish_name}</h2>
                  {result.description && <p className="text-white/80 text-sm mt-1">{result.description}</p>}
                </div>
              </div>
            )}

            {/* Macros */}
            <div className="grid grid-cols-4 gap-2">
              {macros.map(m => (
                <div key={m.label} className="bg-card rounded-xl border border-border p-3 text-center">
                  <p className={`text-lg font-bold ${m.color}`}>{m.value}</p>
                  <p className="text-[10px] text-muted-foreground">{m.unit}</p>
                  <p className="text-[10px] font-medium text-foreground mt-1">{m.label}</p>
                </div>
              ))}
            </div>

            {/* Goals compatibility */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <h3 className="font-semibold text-sm mb-3">Recomendado para</h3>
              <div className="flex flex-wrap gap-2">
                {result.good_for_lose_weight && (
                  <span className="px-3 py-1.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-medium rounded-full">✅ Bajar de peso</span>
                )}
                {result.good_for_gain_muscle && (
                  <span className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-medium rounded-full">💪 Ganar masa muscular</span>
                )}
                {result.good_for_maintain_weight && (
                  <span className="px-3 py-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 text-xs font-medium rounded-full">⚖️ Mantener peso</span>
                )}
              </div>
            </div>

            {/* Micronutrients */}
            <div className="bg-card rounded-2xl border border-border p-4">
              <button
                onClick={() => setShowFullNutrition(!showFullNutrition)}
                className="w-full flex items-center justify-between"
              >
                <h3 className="font-semibold text-sm">Información nutricional completa</h3>
                {showFullNutrition ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <AnimatePresence>
                {showFullNutrition && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="mt-3 space-y-2">
                      {micronutrients.map(n => (
                        <div key={n.label} className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
                          <span className="text-sm text-muted-foreground">{n.label}</span>
                          <span className="text-sm font-medium">{n.value} {n.unit}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Benefits */}
            {result.benefits && (
              <div className="bg-card rounded-2xl border border-border p-4">
                <h3 className="font-semibold text-sm mb-2">🌿 Beneficios nutricionales</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{result.benefits}</p>
              </div>
            )}

            {/* Actions */}
            <div className="grid grid-cols-2 gap-2">
              <Button onClick={() => saveMeal('breakfast')} disabled={saving} variant="outline" className="rounded-xl h-11 text-xs">
                <Save className="w-4 h-4 mr-1" /> Desayuno
              </Button>
              <Button onClick={() => saveMeal('lunch')} disabled={saving} variant="outline" className="rounded-xl h-11 text-xs">
                <Save className="w-4 h-4 mr-1" /> Almuerzo
              </Button>
              <Button onClick={() => saveMeal('dinner')} disabled={saving} variant="outline" className="rounded-xl h-11 text-xs">
                <Save className="w-4 h-4 mr-1" /> Cena
              </Button>
              <Button onClick={() => saveMeal('snack')} disabled={saving} variant="outline" className="rounded-xl h-11 text-xs">
                <Save className="w-4 h-4 mr-1" /> Snack
              </Button>
            </div>

            <Button
              onClick={() => { setImageUrl(null); setResult(null); setShowCamera(true); }}
              className="w-full rounded-xl h-12 bg-[#4CAF50] hover:bg-[#43A047] text-white"
            >
              Escanear otro plato
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  );
}