import { Injectable } from '@angular/core';
import { PagoColaborador, PagoMetric } from '../models/pago.model';

const MESES = [
  ['Ene', 'Enero 2025'], ['Feb', 'Febrero 2025'], ['Mar', 'Marzo 2025'], ['Abr', 'Abril 2025'],
  ['May', 'Mayo 2025'], ['Jun', 'Junio 2025'], ['Jul', 'Julio 2025'], ['Ago', 'Agosto 2025'],
  ['Sep', 'Septiembre 2025'], ['Oct', 'Octubre 2025'], ['Nov', 'Noviembre 2025'], ['Dic', 'Diciembre 2025']
] as const;

@Injectable({ providedIn: 'root' })
export class PagosService {
  getMetrics(): PagoMetric[] {
    return [
      { label: 'Colaboradores', value: '186', detail: 'Activos 186 (100%)', icon: 'users', tone: 'blue' },
      { label: 'Planilla mensual total', value: 'S/ 128,560.00', detail: 'Mayo 2025', icon: 'wallet', tone: 'emerald' },
      { label: 'Pagos realizados', value: 'S/ 72,340.00', detail: '56.3% del total', icon: 'card', tone: 'orange' },
      { label: 'Pendiente por pagar', value: 'S/ 56,220.00', detail: '43.7% del total', icon: 'money', tone: 'purple' },
      { label: 'Proximo pago', value: '05 Jun 2025', detail: 'Planilla de Junio', icon: 'calendar', tone: 'rose' }
    ];
  }

  getPagos(): PagoColaborador[] {
    return [
      this.colaborador(1, 'Luis Alberto Romero', 'Tecnico Mecanico', 'https://i.pravatar.cc/96?img=12', 'S/ 2,800.00', '05 May 2025', '10:32 a. m.', 2800, [0, 1, 2, 3], [4], '0011-0245-0200456789', '011-245-000200456789-87', 'BCP - Banco de Credito del Peru'),
      this.colaborador(2, 'Maria Fernanda Lopez', 'Supervisora', 'https://i.pravatar.cc/96?img=47', 'S/ 3,200.00', '05 May 2025', '10:35 a. m.', 3200, [0, 1, 2, 3], [4], '0011-0245-0200456790', '011-245-000200456790-88', 'BCP - Banco de Credito del Peru'),
      this.colaborador(3, 'Diego Sanchez Perez', 'Soldador', 'https://i.pravatar.cc/96?img=13', 'S/ 2,500.00', '-', '-', 2500, [0, 1, 2], [3], '0011-0245-0200456791', '011-245-000200456791-89', 'Interbank'),
      this.colaborador(4, 'Ana Lucia Rojas', 'Operaria', 'https://i.pravatar.cc/96?img=32', 'S/ 2,200.00', '-', '-', 2200, [0, 1, 2, 3], [4], '0011-0245-0200456792', '011-245-000200456792-90', 'BBVA'),
      this.colaborador(5, 'Jose Manuel Torres', 'Electricista', 'https://i.pravatar.cc/96?img=11', 'S/ 2,600.00', '-', '-', 2600, [0, 1], [2, 3], '0011-0245-0200456793', '011-245-000200456793-91', 'Scotiabank')
    ];
  }

  private colaborador(id: number, nombre: string, cargo: string, avatar: string, montoMensual: string, fechaPago: string, horaPago: string, monto: number, pagados: number[], abonados: number[], cta: string, cci: string, banco: string): PagoColaborador {
    return {
      id,
      nombre,
      cargo,
      avatar,
      montoMensual,
      fechaPago,
      horaPago,
      cta,
      cci,
      banco,
      meses: MESES.map(([mes, mesCompleto], index) => {
        const estado = pagados.includes(index) ? 'Pagado' : abonados.includes(index) ? 'Abonado' : 'Pendiente';
        const programado = index === 4 && estado !== 'Pagado' ? monto + 100 : monto;
        const pagado = estado === 'Pagado' ? programado : estado === 'Abonado' ? Math.round(programado / 2) : 0;
        const pendiente = Math.max(programado - pagado, 0);
        return {
          mes,
          mesCompleto,
          estado,
          monto: this.money(pagado),
          referencia: `de ${this.money(programado)}`,
          montoProgramado: this.money(programado),
          pagadoAbonado: this.money(pagado),
          pendiente: this.money(pendiente),
          fechaPago: estado === 'Pendiente' ? '-' : `${String(index + 5).padStart(2, '0')} ${mes} 2025`,
          responsable: estado === 'Pendiente' ? '-' : index < 3 ? 'Juan Perez' : 'Maria Lopez',
          entidadMedio: estado === 'Pendiente' ? '-' : estado === 'Abonado' ? 'Plin' : index < 3 ? 'Banco de Credito' : 'Banco de la Nacion'
        };
      })
    };
  }

  private money(value: number): string {
    return `S/ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
