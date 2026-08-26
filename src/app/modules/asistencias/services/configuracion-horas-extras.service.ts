import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api.models';

export interface ConfiguracionHorasExtras {
  incrementoPorcentual: number;
  feriado: ConfiguracionFeriadoTrabajado;
}

export type TipoPagoFeriado = 'porcentaje' | 'multiplicador' | 'monto-fijo';

export interface ConfiguracionFeriadoTrabajado {
  tipo: TipoPagoFeriado;
  valor: number;
  diasBase: number;
  horasJornada: number;
}

@Injectable({ providedIn: 'root' })
export class ConfiguracionHorasExtrasService {
  private readonly http = inject(HttpClient);
  private configuracion: ConfiguracionHorasExtras = { incrementoPorcentual: 0, feriado: { tipo: 'multiplicador', valor: 0, diasBase: 30, horasJornada: 8 } };
  private horasExtraId = '';
  private pagoFeriadoId = '';

  constructor() {
    this.http.get<PaginatedResponse<{ id: string; incrementoPorcentual: number }>>(`${environment.apiUrl}/configuraciones-horas-extra`, { params: { page: 1, limit: 1, activo: true } }).subscribe((x) => { if (x.data[0]) { this.horasExtraId = x.data[0].id; this.configuracion.incrementoPorcentual = Number(x.data[0].incrementoPorcentual); } });
    this.http.get<PaginatedResponse<{ id: string; tipoCalculo: string; valor: number; diasBase: number; horasJornada: number }>>(`${environment.apiUrl}/configuraciones-pago-feriado`, { params: { page: 1, limit: 1, activo: true } }).subscribe((x) => { const value = x.data[0]; if (value) { this.pagoFeriadoId = value.id; this.configuracion.feriado = { tipo: value.tipoCalculo.toLowerCase().replace('_', '-') as TipoPagoFeriado, valor: Number(value.valor), diasBase: value.diasBase, horasJornada: value.horasJornada }; } });
  }

  getConfiguracion(): ConfiguracionHorasExtras {
    return { ...this.configuracion, feriado: { ...this.configuracion.feriado } };
  }

  saveConfiguracion(incrementoPorcentual: number, feriado: ConfiguracionFeriadoTrabajado): ConfiguracionHorasExtras {
    const tipo: TipoPagoFeriado = ['porcentaje', 'multiplicador', 'monto-fijo'].includes(feriado.tipo) ? feriado.tipo : 'multiplicador';
    this.configuracion = {
      incrementoPorcentual: this.clamp(incrementoPorcentual, 0, 500, 25),
      feriado: {
        tipo,
        valor: this.clamp(feriado.valor, 0, tipo === 'monto-fijo' ? 100000 : 500, tipo === 'multiplicador' ? 2 : 100),
        diasBase: this.clamp(feriado.diasBase, 1, 31, 30),
        horasJornada: this.clamp(feriado.horasJornada, 1, 24, 8)
      }
    };
    const vigenteDesde = new Date().toLocaleDateString('en-CA');
    const overtimePayload = { nombre: `Horas extra ${vigenteDesde}`, incrementoPorcentual: this.configuracion.incrementoPorcentual, vigenteDesde };
    const holidayPayload = { nombre: `Feriado ${vigenteDesde}`, tipoCalculo: tipo.toUpperCase().replace('-', '_'), valor: this.configuracion.feriado.valor, diasBase: this.configuracion.feriado.diasBase, horasJornada: this.configuracion.feriado.horasJornada, vigenteDesde, esPredeterminada: true };
    const overtimeRequest = this.horasExtraId
      ? this.http.patch<{ id: string }>(`${environment.apiUrl}/configuraciones-horas-extra/${this.horasExtraId}`, overtimePayload)
      : this.http.post<{ id: string }>(`${environment.apiUrl}/configuraciones-horas-extra`, overtimePayload);
    const holidayRequest = this.pagoFeriadoId
      ? this.http.patch<{ id: string }>(`${environment.apiUrl}/configuraciones-pago-feriado/${this.pagoFeriadoId}`, holidayPayload)
      : this.http.post<{ id: string }>(`${environment.apiUrl}/configuraciones-pago-feriado`, holidayPayload);
    overtimeRequest.subscribe((saved) => this.horasExtraId = saved.id);
    holidayRequest.subscribe((saved) => this.pagoFeriadoId = saved.id);
    return this.getConfiguracion();
  }

  deactivateOvertime(id = this.horasExtraId) { return this.http.delete<void>(`${environment.apiUrl}/configuraciones-horas-extra/${id}`); }
  getHolidayConfiguration(id: string) { return this.http.get<Record<string, unknown>>(`${environment.apiUrl}/configuraciones-pago-feriado/${id}`); }
  deactivateHolidayConfiguration(id = this.pagoFeriadoId) { return this.http.delete<void>(`${environment.apiUrl}/configuraciones-pago-feriado/${id}`); }

  calcularPagoHoraExtra(valorHoraRegular: number, incrementoPorcentual = this.configuracion.incrementoPorcentual): number {
    return valorHoraRegular * (1 + incrementoPorcentual / 100);
  }

  calcularPagoFeriado(remuneracionTotal: number, configuracion = this.configuracion.feriado): number {
    if (configuracion.tipo === 'monto-fijo') return configuracion.valor;
    const pagoDiario = remuneracionTotal / Math.max(1, configuracion.diasBase);
    return configuracion.tipo === 'multiplicador'
      ? pagoDiario * configuracion.valor
      : pagoDiario * (1 + configuracion.valor / 100);
  }

  calcularPagoFeriadoPorHoras(remuneracionTotal: number, horasTrabajadas: number, configuracion = this.configuracion.feriado): number {
    if (configuracion.tipo === 'monto-fijo') return configuracion.valor;
    return (this.calcularPagoFeriado(remuneracionTotal, configuracion) / Math.max(1, configuracion.horasJornada)) * Math.max(0, horasTrabajadas);
  }

  getEtiquetaPagoFeriado(configuracion = this.configuracion.feriado): string {
    if (configuracion.tipo === 'monto-fijo') return `Feriado trabajado · S/ ${configuracion.valor.toFixed(2)} por día`;
    if (configuracion.tipo === 'multiplicador') return `Feriado trabajado · x${configuracion.valor} por hora`;
    return `Feriado trabajado · +${configuracion.valor}% por hora`;
  }

  private clamp(value: unknown, min: number, max: number, fallback: number): number {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }
}
