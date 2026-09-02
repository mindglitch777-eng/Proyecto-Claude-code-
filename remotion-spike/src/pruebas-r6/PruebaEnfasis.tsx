import React from 'react';
import {Contador} from '../escenas/plata';

// R6-11: confirma el prop opcional `enfasis` de Contador (real,
// wired a produccion) -- no solo la primitiva Enfasis aislada de
// PruebaHighlights.tsx (R6-7).
export const PruebaEnfasis: React.FC = () => <Contador arriba="GENERASTE" hasta={3560} abajo="esta semana" enfasis="circulo" />;
