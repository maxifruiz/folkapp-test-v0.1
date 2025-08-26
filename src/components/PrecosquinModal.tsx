// src/components/PrecosquinModal.tsx
import { useState } from 'react';

interface PrecosquinData {
  fecha: string;
  numero: number;
  nombre: string;
  provincia: string;
  telefono: string;
}

interface PrecosquinModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const precosquinData: PrecosquinData[] = [
  { fecha: '29 y 30/Nov', numero: 27, nombre: 'La Matanza', provincia: 'Buenos Aires', telefono: '1114849072' },
  { fecha: '29 y 30/Nov', numero: 28, nombre: 'La Plata', provincia: 'Buenos Aires', telefono: '2214885539' },
  { fecha: '26-28/Sept', numero: 31, nombre: 'Leandro N. Alem', provincia: 'Buenos Aires', telefono: '2362421858 / 2364511654' },
  { fecha: '7-9/Nov', numero: 49, nombre: 'San Isidro', provincia: 'Buenos Aires', telefono: '1167831955' },
  { fecha: '4-5/Oct', numero: 51, nombre: 'San Martín', provincia: 'Buenos Aires', telefono: '1164690636' },
  { fecha: '29-30/Nov', numero: 53, nombre: 'San Pedro', provincia: 'Buenos Aires', telefono: '3329420520 de 8 a 12hs' },
  { fecha: '28-30/Nov', numero: 56, nombre: 'Santa Teresita', provincia: 'Buenos Aires', telefono: '2246500573' },
  { fecha: '4-5/Oct', numero: 62, nombre: 'Zárate', provincia: 'Buenos Aires', telefono: '3487645685 / 3487299021' },
  { fecha: '15-16/Nov', numero: 1, nombre: 'Alberti', provincia: 'Buenos Aires', telefono: '2346567895' },
  { fecha: '7-9/Nov', numero: 3, nombre: 'Alte. Brown', provincia: 'Buenos Aires', telefono: '1161758582' },
  { fecha: '7-8/Nov', numero: 8, nombre: 'Chascomús', provincia: 'Buenos Aires', telefono: '2241500041' },
  { fecha: '-', numero: 14, nombre: 'Escobar', provincia: 'Buenos Aires', telefono: '3484560409' },
  { fecha: '29-30/Nov', numero: 32, nombre: 'Lobos', provincia: 'Buenos Aires', telefono: '2227479298' },
  { fecha: '29-30/Nov', numero: 33, nombre: 'Lomas de Zamora', provincia: 'Buenos Aires', telefono: '1149688335' },
  { fecha: '15-16/Nov', numero: 35, nombre: 'Mar Chiquita', provincia: 'Buenos Aires', telefono: '2235383713' },
  { fecha: '15-16/Nov', numero: 36, nombre: 'Mar del Plata', provincia: 'Buenos Aires', telefono: '2233154368' },
  { fecha: '29-30/Nov', numero: 37, nombre: 'Mercedes', provincia: 'Buenos Aires', telefono: '2324511363' },
  { fecha: '8-9/Nov', numero: 38, nombre: 'Pergamino', provincia: 'Buenos Aires', telefono: '3412752872' },
  { fecha: '3 y 4/Oct', numero: 18, nombre: 'Fiambalá', provincia: 'Catamarca', telefono: '3834618029' },
  { fecha: '22-23/Nov', numero: 34, nombre: 'Los Varela', provincia: 'Catamarca', telefono: '3834653729 / 3834541211' },
  { fecha: '15 y 16/Nov', numero: 30, nombre: 'Las Breñas', provincia: 'Chaco', telefono: '3731406228' },
  { fecha: '29-30/Nov', numero: 58, nombre: 'Tres Isletas', provincia: 'Chaco', telefono: '3644216223' },
  { fecha: '22-23/Nov', numero: 42, nombre: 'Resistencia', provincia: 'Chaco', telefono: '3624694987' },
  { fecha: '29 y 30/Nov', numero: 17, nombre: 'Esquel', provincia: 'Chubut', telefono: '2944519529' },
  { fecha: '22-23/Nov', numero: 11, nombre: 'Comodoro Rivadavia', provincia: 'Chubut', telefono: '2974740905' },
  { fecha: '29-30/Nov', numero: 41, nombre: 'Puerto Pirámides', provincia: 'Chubut', telefono: '1163459287 / 1168826984' },
  { fecha: '17-18/Oct', numero: 55, nombre: 'Santa Rosa de Calamuchita', provincia: 'Córdoba', telefono: '3564455872' },
  { fecha: '13-14/Sept', numero: 5, nombre: 'Bell Ville', provincia: 'Córdoba', telefono: '3537666025 / 3537681753' },
  { fecha: '-', numero: 6, nombre: 'Berrotarán', provincia: 'Córdoba', telefono: '3584368861' },
  { fecha: '22-23/Nov', numero: 12, nombre: 'Cruz del Eje', provincia: 'Córdoba', telefono: '3549406607' },
  { fecha: '-', numero: 13, nombre: 'El Tío', provincia: 'Córdoba', telefono: '3576529259' },
  { fecha: '7-8/Nov', numero: 45, nombre: 'Río Tercero', provincia: 'Córdoba', telefono: '3571629931' },
  { fecha: '29 y 30/Nov', numero: 23, nombre: 'Gualeguaychú', provincia: 'Entre Ríos', telefono: '3442619559' },
  { fecha: '18-19/Oct', numero: 60, nombre: 'Villa', provincia: 'Entre Ríos', telefono: '3442484962' },
  { fecha: '15 y 16/Nov', numero: 19, nombre: 'Formosa', provincia: 'Formosa', telefono: '3704503662' },
  { fecha: '11-12/Oct', numero: 10, nombre: 'Clorinda', provincia: 'Formosa', telefono: '3718418725' },
  { fecha: '7-8/Sept', numero: 39, nombre: 'Pirané', provincia: 'Formosa', telefono: '3704590546' },
  { fecha: '29-30/Nov', numero: 54, nombre: 'San Salvador de Jujuy', provincia: 'Jujuy', telefono: '3885222974' },
  { fecha: '4 y 5/Oct', numero: 21, nombre: 'General Acha', provincia: 'La Pampa', telefono: '2952483003' },
  { fecha: '15 y 16/Nov', numero: 24, nombre: 'Ingeniero Luiggi', provincia: 'La Pampa', telefono: '2302564209' },
  { fecha: '3 y 4/Oct', numero: 29, nombre: 'La Rioja', provincia: 'La Rioja', telefono: '115833207' },
  { fecha: '15 y 16/Nov', numero: 22, nombre: 'Godoy Cruz', provincia: 'Mendoza', telefono: '2614699001' },
  { fecha: '29 y 30/Nov', numero: 25, nombre: 'Junín', provincia: 'Mendoza', telefono: '2624624096' },
  { fecha: '27-28/Sept', numero: 61, nombre: 'Zapala', provincia: 'Neuquén', telefono: '2942407400' },
  { fecha: '4-5/Oct', numero: 4, nombre: 'Bariloche', provincia: 'Río Negro', telefono: '2944716040' },
  { fecha: '-', numero: 9, nombre: 'Chocle Choel', provincia: 'Río Negro', telefono: '2946413774' },
  { fecha: '31/Oct y 1/Nov', numero: 48, nombre: 'Salta', provincia: 'Salta', telefono: '3874422673' },
  { fecha: '11-12/Oct', numero: 47, nombre: 'Rosario de Lerma', provincia: 'Salta', telefono: '3874653532' },
  { fecha: '27-28/Sept', numero: 50, nombre: 'San Juan', provincia: 'San Juan', telefono: '2644394066' },
  { fecha: '29-30/Nov', numero: 52, nombre: 'San Martín', provincia: 'San Juan', telefono: '2645754031' },
  { fecha: '15-16/Nov', numero: 40, nombre: 'Puerto San Julián', provincia: 'Santa Cruz', telefono: '2962450275' },
  { fecha: '14-15/Nov', numero: 43, nombre: 'Río Gallegos', provincia: 'Santa Cruz', telefono: '2964436200 interno 7023' },
  { fecha: '7 y 8/Sept', numero: 20, nombre: 'Gálvez', provincia: 'Santa Fe', telefono: '3404415039' },
  { fecha: '22-23/Nov', numero: 57, nombre: 'Santo Tomé', provincia: 'Santa Fe', telefono: '3424161344' },
  { fecha: '5-6/Dec', numero: 59, nombre: 'Villa Constitución', provincia: 'Santa Fe', telefono: '3400500844' },
  { fecha: '-', numero: 7, nombre: 'Carlos Pellegrini', provincia: 'Santa Fe', telefono: '3408528677' },
  { fecha: '7-8/Nov', numero: 15, nombre: 'Esperanza', provincia: 'Santa Fe', telefono: '3494620364' },
  { fecha: '29-30/Nov', numero: 46, nombre: 'Rosario', provincia: 'Santa Fe', telefono: '3414480111' },
  { fecha: '8-9/Nov', numero: 2, nombre: 'Añatuya', provincia: 'Santiago del Estero', telefono: '3844050545 / 3844542699' },
  { fecha: '11/Oct y 1-2/Nov', numero: 26, nombre: 'La Banda', provincia: 'Sgo. del Estero', telefono: '3855894090' },
  { fecha: '29-30/Nov', numero: 44, nombre: 'Río Grande', provincia: 'Tierra del Fuego', telefono: '2964436200 interno 7023' },
];

export default function PrecosquinModal({ isOpen, onClose }: PrecosquinModalProps) {
  const [filterNombre, setFilterNombre] = useState('');
  const [filterProvincia, setFilterProvincia] = useState('');

  if (!isOpen) return null;

  const sortedData = [...precosquinData].sort((a, b) => a.fecha.localeCompare(b.fecha));

  const displayedData = sortedData.filter(
    item =>
      (filterNombre === '' || item.nombre === filterNombre) &&
      (filterProvincia === '' || item.provincia === filterProvincia)
  );

  const uniqueNombres = Array.from(new Set(precosquinData.map(d => d.nombre)));
  const uniqueProvincias = Array.from(new Set(precosquinData.map(d => d.provincia)));

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-start pt-16 sm:pt-20 z-50">
      <div className="bg-folkiCream rounded-xl shadow-lg w-full max-w-5xl mx-2 sm:mx-4 p-3 sm:p-6 overflow-auto max-h-[90vh]">
        <div className="flex justify-between items-center mb-2 sm:mb-4">
          <h2 className="text-folkiRed font-bold text-sm sm:text-xl truncate">Pre Cosquín - Sedes</h2>
          <button
            onClick={onClose}
            className="text-folkiRed font-bold px-2 py-1 rounded hover:bg-folkiAmber/50 transition text-xs sm:text-base"
          >
            X
          </button>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-2 mb-2 sm:mb-3 text-[10px] sm:text-sm">
          <select
            value={filterNombre}
            onChange={(e) => setFilterNombre(e.target.value)}
            className="border border-folkiAmber rounded px-1 py-1 w-full sm:w-auto text-[10px] sm:text-sm"
          >
            <option value="">Todas las sedes</option>
            {uniqueNombres.map((nombre) => (
              <option key={nombre} value={nombre}>{nombre}</option>
            ))}
          </select>

          <select
            value={filterProvincia}
            onChange={(e) => setFilterProvincia(e.target.value)}
            className="border border-folkiAmber rounded px-1 py-1 w-full sm:w-auto text-[10px] sm:text-sm"
          >
            <option value="">Todas las provincias</option>
            {uniqueProvincias.map((provincia) => (
              <option key={provincia} value={provincia}>{provincia}</option>
            ))}
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full border border-folkiAmber text-[10px] sm:text-sm">
            <thead className="bg-folkiAmber text-folkiRed text-[10px] sm:text-sm">
              <tr>
                <th className="px-1 py-0.5 border">Fecha</th>
                <th className="px-1 py-0.5 border">Nº</th>
                <th className="px-1 py-0.5 border">Nombre Sede</th>
                <th className="px-1 py-0.5 border">Provincia</th>
                <th className="px-1 py-0.5 border">Teléfono</th>
              </tr>
            </thead>
            <tbody>
              {displayedData.map((item, idx) => (
                <tr key={idx} className="even:bg-white/20 odd:bg-white/10">
                  <td className="px-1 py-0.5 border truncate">{item.fecha}</td>
                  <td className="px-1 py-0.5 border">{item.numero}</td>
                  <td className="px-1 py-0.5 border truncate">{item.nombre}</td>
                  <td className="px-1 py-0.5 border truncate">{item.provincia}</td>
                  <td className="px-1 py-0.5 border truncate">{item.telefono}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
