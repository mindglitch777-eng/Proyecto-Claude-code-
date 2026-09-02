import {INVESTIGACION_NECESARIA} from './investigacion_necesaria';
import type {EstadoInvestigacion, InvestigacionNecesaria} from './tipos';

export function porEstado(estado: EstadoInvestigacion): InvestigacionNecesaria[] {
  return INVESTIGACION_NECESARIA.filter((i) => i.estado === estado);
}

export function pendientes(): InvestigacionNecesaria[] {
  return porEstado('pendiente');
}

export function porId(id: string): InvestigacionNecesaria | undefined {
  return INVESTIGACION_NECESARIA.find((i) => i.id === id);
}
