// FOTOS DE PERSONAS REALES (CASOS DOCUMENTALES)
//
// Es lo mismo que imagenes.ts pero para caras, no para B-roll generico:
// cuando un guion documental pide "foto de <alguien>", esto dice que
// archivo real usar (bajado por descargar_foto_persona.py desde
// Wikimedia Commons, con licencia verificable). No adivina por
// palabras sueltas -- una cara equivocada es peor que ninguna.
export const PERSONAS: Record<string, string> = {
  'foto de pieter levels': 'pieter-levels',
  'pieter levels trabajando': 'pieter-levels',
};

function normalizar(t: string): string {
  return t
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

export function fotoPersona(frase: string): string | null {
  return PERSONAS[normalizar(frase)] ?? null;
}
