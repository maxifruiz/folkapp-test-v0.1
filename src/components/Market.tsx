// src/components/Market.tsx
import React from 'react';
import { Megaphone } from 'lucide-react';

const Market = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 py-12 bg-folkiCream rounded-2xl shadow-xl border border-folkiAmber">
      <Megaphone className="w-16 h-16 text-folkiRed mb-4 animate-bounce" />
      <h2 className="text-3xl sm:text-4xl font-bold text-folkiRed mb-2">¡Tienda Folki muy pronto!</h2>
      <p className="text-lg sm:text-xl text-folkiRed/80 max-w-xl mb-6">

Estamos creando un espacio donde artesanos, diseñadores y productores folklóricos puedan mostrar sus productos y proyectos con sus datos de contacto, para que puedas conocerlos y comunicarte directamente con ellos.

Este espacio aún está en desarrollo y pronto tendrá novedades para apoyar y visibilizar a la comunidad folklórica. ¡Estar atentos!
      </p>
      <div className="bg-folkiAmber text-folkiRed font-semibold px-4 py-2 rounded-lg shadow-md animate-pulse">
        Próximamente...
      </div>
    </div>
  );
};

export default Market;
