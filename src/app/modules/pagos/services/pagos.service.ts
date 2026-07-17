import { Injectable } from '@angular/core';
import { Pago } from '../models/pago.model';

@Injectable({ providedIn: 'root' })
export class PagosService {
  getPagos(): Pago[] {
    return [
      { colaborador: 'Ana Torres', periodo: 'Julio 2026', monto: 4200, estado: 'pagado' },
      { colaborador: 'Luis Vargas', periodo: 'Julio 2026', monto: 5100, estado: 'pendiente' },
      { colaborador: 'Marta Ríos', periodo: 'Julio 2026', monto: 2800, estado: 'observado' }
    ];
  }
}