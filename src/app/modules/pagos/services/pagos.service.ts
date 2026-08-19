import { Injectable } from '@angular/core';
import { PagoColaborador, PagoCuentaBancaria, PagoMetric } from '../models/pago.model';
import { ColaboradoresService } from '../../colaboradores/services/colaboradores.service';

const MESES = [
  ['Ene', 'Enero 2025'], ['Feb', 'Febrero 2025'], ['Mar', 'Marzo 2025'], ['Abr', 'Abril 2025'],
  ['May', 'Mayo 2025'], ['Jun', 'Junio 2025'], ['Jul', 'Julio 2025'], ['Ago', 'Agosto 2025'],
  ['Sep', 'Septiembre 2025'], ['Oct', 'Octubre 2025'], ['Nov', 'Noviembre 2025'], ['Dic', 'Diciembre 2025']
] as const;

@Injectable({ providedIn: 'root' })
export class PagosService {
  constructor(private readonly colaboradoresService: ColaboradoresService) {}

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
    const colaboradores = new Map(this.colaboradoresService.getColaboradores().map((colaborador) => [colaborador.id, colaborador]));
    const pagos = [
      this.colaborador(1, 'Luis Alberto Romero', 'Tecnico Mecanico', 'Mantenimiento', 'https://i.pravatar.cc/96?img=12', 'S/ 2,800.00', '05 May 2025', '10:32 a. m.', 2800, [0, 1, 2, 3], [4], '0011-0245-0200456789', '011-245-000200456789-87', 'BCP - Banco de Credito del Peru'),
      this.colaborador(2, 'Maria Fernanda Lopez', 'Supervisora', 'Operaciones', 'https://i.pravatar.cc/96?img=47', 'S/ 3,200.00', '05 May 2025', '10:35 a. m.', 3200, [0, 1, 2, 3], [4], '0011-0245-0200456790', '011-245-000200456790-88', 'BCP - Banco de Credito del Peru'),
      this.colaborador(3, 'Diego Sanchez Perez', 'Soldador', 'Produccion', 'https://i.pravatar.cc/96?img=13', 'S/ 2,500.00', '-', '-', 2500, [0, 1, 2], [3], '0011-0245-0200456791', '011-245-000200456791-89', 'Interbank'),
      this.colaborador(4, 'Ana Lucia Rojas', 'Operaria', 'Produccion', 'https://i.pravatar.cc/96?img=32', 'S/ 2,200.00', '-', '-', 2200, [0, 1, 2, 3], [4], '0011-0245-0200456792', '011-245-000200456792-90', 'BBVA'),
      this.colaborador(5, 'Jose Manuel Torres', 'Electricista', 'Mantenimiento', 'https://i.pravatar.cc/96?img=11', 'S/ 2,600.00', '-', '-', 2600, [0, 1], [2, 3], '0011-0245-0200456793', '011-245-000200456793-91', 'Scotiabank')
    ];

    return pagos.map((pago) => {
      const colaborador = colaboradores.get(String(pago.id));
      const cuentasBancarias: PagoCuentaBancaria[] = colaborador?.datosBancarios?.length
        ? colaborador.datosBancarios.map((cuenta, index) => ({ ...cuenta, esPrincipal: cuenta.esPrincipal ?? index === 0 }))
        : [{
            cuentaBancaria: colaborador?.cuentaBancaria || pago.cta,
            cci: colaborador?.cci || pago.cci,
            entidadBancaria: colaborador?.entidadBancaria || pago.banco,
            esPrincipal: true
          }];
      const principal = cuentasBancarias.find((cuenta) => cuenta.esPrincipal) ?? cuentasBancarias[0];
      return {
        ...pago,
        cta: principal.cuentaBancaria,
        cci: principal.cci,
        banco: principal.entidadBancaria,
        cuentasBancarias
      };
    });
  }

  private colaborador(id: number, nombre: string, cargo: string, area: string, avatar: string, montoMensual: string, fechaPago: string, horaPago: string, monto: number, pagados: number[], abonados: number[], cta: string, cci: string, banco: string): PagoColaborador {
    return {
      id,
      nombre,
      cargo,
      area,
      avatar,
      montoMensual,
      fechaPago,
      horaPago,
      cta,
      cci,
      banco,
      cuentasBancarias: [{ cuentaBancaria: cta, cci, entidadBancaria: banco, esPrincipal: true }],
      meses: MESES.map(([mes, mesCompleto], index) => {
        const estado = pagados.includes(index) ? 'Pagado' : abonados.includes(index) ? 'Abonado' : 'Pendiente';
        const programado = index === 4 && estado !== 'Pagado' ? monto + 100 : monto;
        const pagado = estado === 'Pagado' ? programado : estado === 'Abonado' ? Math.round(programado / 2) : 0;
        const pendiente = Math.max(programado - pagado, 0);
        const responsable = estado === 'Pendiente' ? '-' : index < 3 ? 'Juan Perez' : 'Maria Lopez';
        const entidadMedio = estado === 'Pendiente' ? '-' : estado === 'Abonado' ? 'Plin' : index < 3 ? 'Banco de Credito' : 'Banco de la Nacion';
        const fechaPagoMes = estado === 'Pendiente' ? '-' : `${String(index + 5).padStart(2, '0')} ${mes} 2025`;
        const movimientos = estado === 'Pendiente' ? [] : estado === 'Abonado'
          ? [
              { id: index * 10 + 1, numero: 1, monto: this.money(Math.ceil(pagado * 0.6)), fechaPago: `${String(index + 3).padStart(2, '0')} ${mes} 2025`, horaPago: '09:15 a. m.', responsable, entidadMedio, observacion: 'Primer abono del mes.' },
              { id: index * 10 + 2, numero: 2, monto: this.money(Math.floor(pagado * 0.4)), fechaPago: fechaPagoMes, horaPago: '10:32 a. m.', responsable, entidadMedio, observacion: 'Segundo abono del mes.' }
            ]
          : [
              { id: index * 10 + 1, numero: 1, monto: this.money(pagado), fechaPago: fechaPagoMes, horaPago: '10:32 a. m.', responsable, entidadMedio, observacion: 'Pago completo del mes.' }
            ];
        return {
          mes,
          mesCompleto,
          estado,
          monto: this.money(pagado),
          referencia: estado === 'Abonado' ? `Pend. ${this.money(pendiente)}` : `de ${this.money(programado)}`,
          montoProgramado: this.money(programado),
          pagadoAbonado: this.money(pagado),
          pendiente: this.money(pendiente),
          fechaPago: fechaPagoMes,
          responsable,
          entidadMedio,
          movimientos
        };
      })
    };
  }

  private money(value: number): string {
    return `S/ ${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
}
