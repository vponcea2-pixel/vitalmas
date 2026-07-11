import React, { useState } from 'react';
import { Camera, List, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import ScanPlate from '@/components/scanner/ScanPlate';
import ScanIngredients from '@/components/scanner/ScanIngredients';

export default function Scanner() {
  const [mode, setMode] = useState(null);

  if (mode === 'plate') return <ScanPlate onBack={() => setMode(null)} />;
  if (mode === 'ingredients') return <ScanIngredients onBack={() => setMode(null)} />;

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-[#4CAF50] to-[#388E3C] text-white p-6 pb-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Escáner IA</h1>
        <p className="text-green-100 text-sm mt-1">Analiza tu comida con inteligencia artificial</p>
      </div>

      <div className="px-4 -mt-4 space-y-4">
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => setMode('plate')}
          className="w-full bg-card rounded-2xl border border-border p-6 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-[#4CAF50] p-3 rounded-2xl text-white group-hover:scale-110 transition-transform">
              <Camera className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">Escanear Plato Completo</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Toma una foto de tu plato y obtén información nutricional completa al instante
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-[#4CAF50]">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">Análisis con IA en segundos</span>
              </div>
            </div>
          </div>
        </motion.button>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onClick={() => setMode('ingredients')}
          className="w-full bg-card rounded-2xl border border-border p-6 text-left hover:shadow-lg transition-all group"
        >
          <div className="flex items-start gap-4">
            <div className="bg-[#FF7B00] p-3 rounded-2xl text-white group-hover:scale-110 transition-transform">
              <List className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <h2 className="text-lg font-bold text-foreground">Escanear Ingredientes</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Escanea tus ingredientes uno a uno y genera la mejor receta posible
              </p>
              <div className="flex items-center gap-1.5 mt-3 text-[#FF7B00]">
                <Sparkles className="w-4 h-4" />
                <span className="text-xs font-semibold">Recetas generadas por IA</span>
              </div>
            </div>
          </div>
        </motion.button>
      </div>
    </div>
  );
}