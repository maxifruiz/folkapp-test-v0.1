import React from 'react';
import { Filter, X } from 'lucide-react';
import { EventType } from '../types';
import { provinces, eventTypeLabels } from '../data/mockData';

interface EventFilterProps {
  selectedType: EventType | 'all';
  selectedProvince: string;
  selectedCity: string;
  onTypeChange: (type: EventType | 'all') => void;
  onProvinceChange: (province: string) => void;
  onCityChange: (city: string) => void;
  onClearFilters: () => void;
}

export function EventFilter({
  selectedType,
  selectedProvince,
  selectedCity,
  onTypeChange,
  onProvinceChange,
  onCityChange,
  onClearFilters
}: EventFilterProps) {
  const selectedProvinceData = provinces.find(p => p.name === selectedProvince);
  const hasActiveFilters = selectedType !== 'all' || selectedProvince !== '' || selectedCity !== '';

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-neutral-200">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Filter className="h-5 w-5 text-red-600" />
          <h3 className="font-semibold text-neutral-800">Filtrar eventos</h3>
        </div>
        
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center space-x-1 text-sm text-red-600 hover:text-red-800 transition-colors duration-200"
          >
            <X className="h-4 w-4" />
            <span>Limpiar filtros</span>
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Event Type Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Tipo de evento
          </label>
          <select
            value={selectedType}
            onChange={(e) => onTypeChange(e.target.value as EventType | 'all')}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
          >
            <option value="all">Todos los tipos</option>
            {Object.entries(eventTypeLabels).map(([key, label]) => (
              <option key={key} value={key}>
                {label}
              </option>
            ))}
          </select>
        </div>

        {/* Province Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Provincia
          </label>
          <select
            value={selectedProvince}
            onChange={(e) => {
              onProvinceChange(e.target.value);
              onCityChange(''); // Reset city when province changes
            }}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200"
          >
            <option value="">Todas las provincias</option>
            {provinces.map((province) => (
              <option key={province.id} value={province.name}>
                {province.name}
              </option>
            ))}
          </select>
        </div>

        {/* City Filter */}
        <div>
          <label className="block text-sm font-medium text-neutral-700 mb-2">
            Ciudad
          </label>
          <select
            value={selectedCity}
            onChange={(e) => onCityChange(e.target.value)}
            disabled={!selectedProvince}
            className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-colors duration-200 disabled:bg-neutral-100 disabled:cursor-not-allowed"
          >
            <option value="">Todas las ciudades</option>
            {selectedProvinceData?.cities.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>
      </div>

      {hasActiveFilters && (
        <div className="mt-4 flex flex-wrap gap-2">
          {selectedType !== 'all' && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
              Tipo: {eventTypeLabels[selectedType as EventType]}
              <button
                onClick={() => onTypeChange('all')}
                className="ml-2 text-red-600 hover:text-red-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {selectedProvince && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200">
              {selectedProvince}
              <button
                onClick={() => onProvinceChange('')}
                className="ml-2 text-blue-600 hover:text-blue-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
          
          {selectedCity && (
            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
              {selectedCity}
              <button
                onClick={() => onCityChange('')}
                className="ml-2 text-green-600 hover:text-green-800"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}