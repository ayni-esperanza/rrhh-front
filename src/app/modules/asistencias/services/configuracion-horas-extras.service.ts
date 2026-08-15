import { Injectable } from '@angular/core';

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
  private readonly storageKey = 'rrhh.configuracion-horas-extras';
  private configuracion: ConfiguracionHorasExtras = this.load();

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
    if (typeof localStorage !== 'undefined') localStorage.setItem(this.storageKey, JSON.stringify(this.configuracion));
    return this.getConfiguracion();
  }

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

  private load(): ConfiguracionHorasExtras {
    const defaults: ConfiguracionHorasExtras = { incrementoPorcentual: 25, feriado: { tipo: 'multiplicador', valor: 2, diasBase: 30, horasJornada: 8 } };
    if (typeof localStorage === 'undefined') return defaults;
    try {
      const stored = JSON.parse(localStorage.getItem(this.storageKey) ?? 'null') as Partial<ConfiguracionHorasExtras> | null;
      return {
        incrementoPorcentual: this.clamp(stored?.incrementoPorcentual, 0, 500, defaults.incrementoPorcentual),
        feriado: {
          tipo: stored?.feriado?.tipo ?? defaults.feriado.tipo,
          valor: this.clamp(stored?.feriado?.valor, 0, 100000, defaults.feriado.valor),
          diasBase: this.clamp(stored?.feriado?.diasBase, 1, 31, defaults.feriado.diasBase),
          horasJornada: this.clamp(stored?.feriado?.horasJornada, 1, 24, defaults.feriado.horasJornada)
        }
      };
    } catch {
      return defaults;
    }
  }

  private clamp(value: unknown, min: number, max: number, fallback: number): number {
    const number = Number(value);
    return Number.isFinite(number) ? Math.min(max, Math.max(min, number)) : fallback;
  }
}
