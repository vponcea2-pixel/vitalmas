import React, { useState } from 'react';
import { Pill, Search, ChevronDown, ChevronUp, Sun, AlertTriangle, Apple, Clock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const VITAMINS = [
  {
    name: 'Vitamina A',
    emoji: '🥕',
    benefits: 'Esencial para la visión, el sistema inmunológico y la reproducción. Ayuda al correcto funcionamiento del corazón, pulmones y riñones.',
    dose: '700-900 µg RAE por día (adultos)',
    schedule: 'Con el desayuno, junto con alimentos que contengan grasa para mejor absorción.',
    contraindications: 'Exceso puede causar náuseas, dolor de cabeza y daño hepático. No exceder 3,000 µg/día. Precaución en embarazo.',
    sources: 'Zanahoria, camote, espinaca, mango, hígado, huevos, leche fortificada.',
  },
  {
    name: 'Vitamina B1 (Tiamina)',
    emoji: '🌾',
    benefits: 'Convierte nutrientes en energía. Esencial para el funcionamiento del sistema nervioso y muscular.',
    dose: '1.1-1.2 mg por día (adultos)',
    schedule: 'Por la mañana con el desayuno.',
    contraindications: 'Raramente tóxica. El exceso se excreta por orina. Interacción con algunos diuréticos.',
    sources: 'Cerdo, arroz integral, lentejas, nueces, semillas de girasol.',
  },
  {
    name: 'Vitamina B12',
    emoji: '🥩',
    benefits: 'Fundamental para la formación de glóbulos rojos, función neurológica y síntesis de ADN. Previene anemia megaloblástica.',
    dose: '2.4 µg por día (adultos)',
    schedule: 'Por la mañana en ayunas para mejor absorción.',
    contraindications: 'Generalmente segura en exceso. Puede interactuar con metformina y omeprazol.',
    sources: 'Carne, pescado, huevos, lácteos, cereales fortificados.',
  },
  {
    name: 'Vitamina C',
    emoji: '🍊',
    benefits: 'Potente antioxidante. Refuerza el sistema inmunológico, mejora la absorción de hierro y participa en la síntesis de colágeno.',
    dose: '75-90 mg por día (adultos). Hasta 2,000 mg es tolerable.',
    schedule: 'Con el desayuno o almuerzo. Dividir en dos dosis si es alta.',
    contraindications: 'Exceso puede causar diarrea, náuseas y cálculos renales. Precaución con anticoagulantes.',
    sources: 'Naranja, kiwi, fresa, pimiento rojo, brócoli, guayaba, limón.',
  },
  {
    name: 'Vitamina D',
    emoji: '☀️',
    benefits: 'Esencial para la absorción de calcio, salud ósea y función inmunológica. Regula el estado de ánimo.',
    dose: '15-20 µg (600-800 UI) por día (adultos)',
    schedule: 'Con la comida principal del día (almuerzo o cena) junto con grasas.',
    contraindications: 'Exceso puede causar hipercalcemia (calcio alto en sangre). No exceder 4,000 UI/día sin supervisión médica.',
    sources: 'Exposición solar, salmón, sardinas, huevos, leche fortificada, hongos.',
  },
  {
    name: 'Vitamina E',
    emoji: '🥜',
    benefits: 'Antioxidante que protege las células del daño. Mejora la salud de la piel y fortalece el sistema inmunológico.',
    dose: '15 mg (22.4 UI) por día (adultos)',
    schedule: 'Con la comida principal, junto con alimentos grasos.',
    contraindications: 'En dosis altas puede aumentar riesgo de sangrado. Precaución con anticoagulantes. No exceder 1,000 mg/día.',
    sources: 'Almendras, aguacate, aceite de oliva, semillas de girasol, espinacas.',
  },
  {
    name: 'Hierro',
    emoji: '💪',
    benefits: 'Transporta oxígeno en la sangre. Previene anemia. Esencial para el desarrollo cognitivo y la función inmune.',
    dose: '8-18 mg por día (adultos, mayor para mujeres en edad fértil)',
    schedule: 'En ayunas o 1 hora antes de comer. Acompañar con vitamina C.',
    contraindications: 'Exceso causa estreñimiento, náuseas y daño hepático. No tomar con calcio, té o café.',
    sources: 'Carne roja, lentejas, espinacas, frijoles, quinua, hígado.',
  },
  {
    name: 'Calcio',
    emoji: '🦴',
    benefits: 'Fundamental para huesos y dientes fuertes. Participa en la contracción muscular y la coagulación sanguínea.',
    dose: '1,000-1,200 mg por día (adultos)',
    schedule: 'Dividir en 2 dosis (mañana y noche). No tomar junto con hierro.',
    contraindications: 'Exceso puede causar cálculos renales y problemas cardiovasculares. No exceder 2,500 mg/día.',
    sources: 'Leche, queso, yogur, brócoli, almendras, sardinas, tofu.',
  },
  {
    name: 'Magnesio',
    emoji: '🌿',
    benefits: 'Participa en más de 300 reacciones enzimáticas. Regula función muscular, nerviosa y niveles de azúcar en sangre.',
    dose: '310-420 mg por día (adultos)',
    schedule: 'Por la noche antes de dormir. Ayuda a la relajación muscular y el sueño.',
    contraindications: 'Exceso causa diarrea. Precaución con problemas renales. Puede interactuar con antibióticos y diuréticos.',
    sources: 'Chocolate oscuro, aguacate, nueces, legumbres, plátano, espinacas.',
  },
  {
    name: 'Zinc',
    emoji: '🛡️',
    benefits: 'Fortalece el sistema inmunológico. Esencial para la cicatrización, el sentido del gusto y olfato, y la síntesis de proteínas.',
    dose: '8-11 mg por día (adultos)',
    schedule: 'Con alimentos para evitar náuseas. Separar 2 horas del hierro y calcio.',
    contraindications: 'Exceso puede causar náuseas, vómitos y deficiencia de cobre. No exceder 40 mg/día.',
    sources: 'Ostras, carne roja, semillas de calabaza, garbanzos, nueces.',
  },
];

export default function Vitamins() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);

  const filtered = VITAMINS.filter(v =>
    v.name.toLowerCase().includes(search.toLowerCase()) ||
    v.sources.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-lg mx-auto">
      <div className="bg-gradient-to-br from-[#4CAF50] to-[#2E7D32] text-white p-6 pb-8 rounded-b-3xl">
        <h1 className="text-2xl font-bold">Vitaminas y Minerales</h1>
        <p className="text-green-100 text-sm mt-1">Guía completa para tu salud</p>

        <div className="relative mt-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-green-300" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar vitamina o mineral..."
            className="w-full pl-10 pr-4 py-2.5 bg-white/15 rounded-xl text-white placeholder:text-green-200 text-sm focus:outline-none focus:bg-white/25"
          />
        </div>
      </div>

      <div className="px-4 -mt-4 space-y-3 pb-4">
        {filtered.map((vit, i) => (
          <motion.div
            key={vit.name}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="bg-card rounded-2xl border border-border overflow-hidden"
          >
            <button
              onClick={() => setExpanded(expanded === i ? null : i)}
              className="w-full p-4 flex items-center gap-3 text-left"
            >
              <span className="text-2xl">{vit.emoji}</span>
              <span className="flex-1 font-semibold text-sm text-foreground">{vit.name}</span>
              {expanded === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
            </button>

            <AnimatePresence>
              {expanded === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-4 pb-4 space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Sun className="w-4 h-4 text-[#4CAF50]" />
                        <span className="text-xs font-semibold text-[#4CAF50]">Beneficios</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{vit.benefits}</p>
                    </div>

                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Pill className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-blue-500">Dosis recomendada</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{vit.dose}</p>
                    </div>

                    <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Clock className="w-4 h-4 text-[#FF7B00]" />
                        <span className="text-xs font-semibold text-[#FF7B00]">Horario recomendado</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{vit.schedule}</p>
                    </div>

                    <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                        <span className="text-xs font-semibold text-red-500">Contraindicaciones</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{vit.contraindications}</p>
                    </div>

                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-xl">
                      <div className="flex items-center gap-2 mb-1">
                        <Apple className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-purple-500">Fuentes naturales</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{vit.sources}</p>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
      </div>
    </div>
  );
}