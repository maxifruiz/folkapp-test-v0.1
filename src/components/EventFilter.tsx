import React, { useEffect, useState } from 'react';
import { Filter, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { EventType } from '../types';
import { provinces, eventTypeLabels } from '../data/mockData';

interface EventFilterProps {
  selectedType: EventType | 'all';
  selectedProvince: string;
  onTypeChange: (type: EventType | 'all') => void;
  onProvinceChange: (province: string) => void;
  onClearFilters: () => void;
}

export function EventFilter({
  selectedType,
  selectedProvince,
  onTypeChange,
  onProvinceChange,
  onClearFilters,
}: EventFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasActiveFilters = selectedType !== 'all' || selectedProvince !== '';

  // Cargar estado guardado
  useEffect(() => {
    const saved = localStorage.getItem('filtersOpen');
    if (saved === 'true') setIsOpen(true);
  }, []);

  // Guardar estado al cambiar
  useEffect(() => {
    localStorage.setItem('filtersOpen', isOpen.toString());
  }, [isOpen]);

  return (
    <div className="bg-white rounded-xl shadow-md p-4 mb-6 border border-neutral-200">
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsOpen(prev => !prev)}
          className="flex items-center space-x-2 text-sm font-semibold text-folkiRed hover:text-red-800 transition"
        >
          <Filter className="h-5 w-5" />
          <span>{isOpen ? 'Ocultar filtros' : 'Mostrar filtros'}</span>
        </button>

        {hasActiveFilters && isOpen && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm font-medium text-red-600 hover:text-red-800 transition"
            aria-label="Limpiar filtros"
          >
            <X className="h-4 w-4" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className="overflow-hidden mt-5 space-y-5"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Tipo de evento</label>
                <select
                  value={selectedType}
                  onChange={(e) => onTypeChange(e.target.value as EventType | 'all')}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-folkiRed focus:border-folkiRed text-neutral-800"
                >
                  <option value="all">Todos los tipos</option>
                  {Object.entries(eventTypeLabels).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-neutral-700 mb-2">Provincia</label>
                <select
                  value={selectedProvince}
                  onChange={(e) => onProvinceChange(e.target.value)}
                  className="w-full px-4 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-folkiRed focus:border-folkiRed text-neutral-800"
                >
                  <option value="">Todas las provincias</option>
                  {provinces.map((province) => (
                    <option key={province.id} value={province.name}>
                      {province.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasActiveFilters && (
              <div className="mt-3 flex flex-wrap gap-3">
                {selectedType !== 'all' && (
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-300">
                    Tipo: {eventTypeLabels[selectedType as EventType]}
                    <button
                      onClick={() => onTypeChange('all')}
                      className="ml-2 text-red-600 hover:text-red-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
                {selectedProvince && (
                  <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
                    {selectedProvince}
                    <button
                      onClick={() => onProvinceChange('')}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
