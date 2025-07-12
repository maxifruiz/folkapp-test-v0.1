import { Province } from '../types';

// Empty initial data - app starts with no events or users
export const mockEvents = [];

export const provinces: Province[] = [
  {
    id: 'ba',
    name: 'Buenos Aires',
    cities: ['La Plata', 'Mar del Plata', 'Bahía Blanca', 'San Antonio de Areco', 'Tandil', 'Quilmes', 'San Isidro', 'Vicente López', 'Tigre', 'Pilar']
  },
  {
    id: 'caba',
    name: 'Ciudad Autónoma de Buenos Aires',
    cities: ['CABA']
  },
  {
    id: 'cordoba',
    name: 'Córdoba',
    cities: ['Córdoba Capital', 'Villa Carlos Paz', 'Río Cuarto', 'Villa María', 'Alta Gracia', 'Jesús María']
  },
  {
    id: 'salta',
    name: 'Salta',
    cities: ['Salta Capital', 'Cafayate', 'Tartagal', 'Orán', 'Metán', 'Rosario de Lerma']
  },
  {
    id: 'jujuy',
    name: 'Jujuy',
    cities: ['San Salvador de Jujuy', 'Palpalá', 'Perico', 'San Pedro', 'Libertador General San Martín']
  },
  {
    id: 'corrientes',
    name: 'Corrientes',
    cities: ['Corrientes Capital', 'Goya', 'Mercedes', 'Paso de los Libres', 'Curuzú Cuatiá']
  },
  {
    id: 'tucuman',
    name: 'Tucumán',
    cities: ['San Miguel de Tucumán', 'Tafí Viejo', 'Yerba Buena', 'Concepción', 'Banda del Río Salí']
  },
  {
    id: 'mendoza',
    name: 'Mendoza',
    cities: ['Mendoza Capital', 'San Rafael', 'Godoy Cruz', 'Maipú', 'Las Heras', 'Luján de Cuyo']
  },
  {
    id: 'santafe',
    name: 'Santa Fe',
    cities: ['Santa Fe Capital', 'Rosario', 'Rafaela', 'Reconquista', 'Venado Tuerto']
  },
  {
    id: 'entrerios',
    name: 'Entre Ríos',
    cities: ['Paraná', 'Concordia', 'Gualeguaychú', 'Concepción del Uruguay', 'Villaguay']
  },
  {
    id: 'misiones',
    name: 'Misiones',
    cities: ['Posadas', 'Oberá', 'Eldorado', 'Puerto Iguazú', 'Apóstoles']
  },
  {
    id: 'formosa',
    name: 'Formosa',
    cities: ['Formosa Capital', 'Clorinda', 'Pirané', 'Las Lomitas', 'Ingeniero Juárez']
  },
  {
    id: 'chaco',
    name: 'Chaco',
    cities: ['Resistencia', 'Barranqueras', 'Fontana', 'Puerto Vilelas', 'Presidencia Roque Sáenz Peña']
  },
  {
    id: 'santiago',
    name: 'Santiago del Estero',
    cities: ['Santiago del Estero Capital', 'La Banda', 'Termas de Río Hondo', 'Añatuya', 'Frías']
  },
  {
    id: 'catamarca',
    name: 'Catamarca',
    cities: ['San Fernando del Valle de Catamarca', 'Andalgalá', 'Belén', 'Tinogasta', 'Santa María']
  },
  {
    id: 'larioja',
    name: 'La Rioja',
    cities: ['La Rioja Capital', 'Chilecito', 'Aimogasta', 'Chepes', 'Chamical']
  },
  {
    id: 'sanjuan',
    name: 'San Juan',
    cities: ['San Juan Capital', 'Rawson', 'Chimbas', 'Rivadavia', 'Santa Lucía']
  },
  {
    id: 'sanluis',
    name: 'San Luis',
    cities: ['San Luis Capital', 'Villa Mercedes', 'Merlo', 'Juana Koslay', 'La Punta']
  },
  {
    id: 'neuquen',
    name: 'Neuquén',
    cities: ['Neuquén Capital', 'Plottier', 'Cipolletti', 'Cutral Có', 'Zapala']
  },
  {
    id: 'rionegro',
    name: 'Río Negro',
    cities: ['Viedma', 'San Carlos de Bariloche', 'General Roca', 'Cipolletti', 'Villa Regina']
  },
  {
    id: 'chubut',
    name: 'Chubut',
    cities: ['Rawson', 'Comodoro Rivadavia', 'Puerto Madryn', 'Trelew', 'Esquel']
  },
  {
    id: 'santacruz',
    name: 'Santa Cruz',
    cities: ['Río Gallegos', 'Caleta Olivia', 'El Calafate', 'Pico Truncado', 'Puerto Deseado']
  },
  {
    id: 'tierradelfuego',
    name: 'Tierra del Fuego',
    cities: ['Ushuaia', 'Río Grande', 'Tolhuin']
  }
];

export const eventTypeLabels = {
  peña: 'Peña',
  certamen: 'Certamen',
  festival: 'Festival',
  recital: 'Recital',
  clase: 'Clase',
  taller: 'Taller',
  convocatoria: 'Convocatoria',
  funcion: 'Funcion'
};
