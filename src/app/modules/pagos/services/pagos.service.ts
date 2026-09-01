import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PaginatedResponse } from '../../../core/models/api.models';
import { PagoColaborador, PagoMetric, PagoMovimiento } from '../models/pago.model';

interface ApiMetrics { periodo: string; colaboradores: number; planillaTotal: number; pagado: number; pendiente: number; proximoPago: { fecha: string; periodo: string } | null; }
interface ApiPago { colaborador: { id: string; nombres: string; apellidoPaterno: string; apellidoMaterno?: string; fotoUrl?: string }; contratoActual?: { cargo?: { nombre: string; area?: { nombre: string } }; modalidadPago?: string; diaPagoPersonalizado?: number; fechaInicio?: string } | null; cuentasBancarias: Array<{ id: string; numeroCuenta: string; cci?: string; entidadBancaria: string; principal: boolean }>; meses: Array<{ id: string; periodo: { anio: number; mes: number }; estado: string; montoProgramado: number; totalPagado: number; saldoPendiente: number; fechaUltimoPago?: string | null; programacionPagoAplicada?: { modalidad: string; fechas: string[] } | null }> }
interface ApiMovimiento { id: string; monto: number; fechaPago: string; medioPago: string; entidadMedio?: string; referencia?: string; observacion?: string; estado: string; responsableId?: string; }
export interface PlanillaPeriodo { id: string; anio: number; mes: number; estado: 'BORRADOR' | 'CALCULADO' | 'CERRADO'; fechaPagoProgramada?: string; fechaInicio?: string; fechaFin?: string; }
export interface PlanillaMovimiento { id: string; monto: number; fechaPago: string; medioPago: string; referencia?: string; estado: string; }
export interface PlanillaConcepto { id: string; descripcion: string; naturaleza: 'INGRESO' | 'DESCUENTO'; monto: number; }
export interface PlanillaDetalle { id: string; colaboradorId: string; colaborador?: { nombres: string; apellidoPaterno: string; apellidoMaterno?: string; dni: string }; sueldoBase: number; montoHorasExtras: number; montoFeriados: number; bonificaciones: number; descuentos: number; montoProgramado: number; totalPagado: number; saldoPendiente: number; estado: string; conceptos?: PlanillaConcepto[]; movimientos?: PlanillaMovimiento[]; [key: string]: unknown; }

@Injectable({ providedIn: 'root' })
export class PagosService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/planillas`;
  getMetrics(year: number, month: number): Observable<PagoMetric[]> {
    return this.http.get<ApiMetrics>(`${this.url}/metricas`, { params: { anio: year, mes: month } }).pipe(map((m) => [
      { label: 'Colaboradores', value: String(m.colaboradores), detail: m.periodo, icon: 'users', tone: 'blue' },
      { label: 'Planilla mensual total', value: this.money(m.planillaTotal), detail: m.periodo, icon: 'wallet', tone: 'emerald' },
      { label: 'Pagos realizados', value: this.money(m.pagado), detail: this.percent(m.pagado, m.planillaTotal), icon: 'card', tone: 'orange' },
      { label: 'Pendiente por pagar', value: this.money(m.pendiente), detail: this.percent(m.pendiente, m.planillaTotal), icon: 'money', tone: 'purple' },
      { label: 'Próximo pago', value: m.proximoPago ? this.date(m.proximoPago.fecha) : 'Sin fecha', detail: m.proximoPago ? this.periodLabel(m.proximoPago.periodo) : 'Sin fecha programada', icon: 'calendar', tone: 'rose' }
    ] as PagoMetric[]));
  }
  getPagos(year: number): Observable<PagoColaborador[]> {
    return this.http.get<PaginatedResponse<ApiPago>>(this.url, { params: { anio: year, page: 1, limit: 100 } }).pipe(map(({ data }) => data.map((item) => this.toView(item))));
  }
  listPeriods(params: { anio?: number; mes?: number; estado?: string; page?: number; limit?: number } = {}): Observable<PaginatedResponse<PlanillaPeriodo>> { return this.http.get<PaginatedResponse<PlanillaPeriodo>>(`${this.url}/periodos`, { params: { page: 1, limit: 100, ...params } }); }
  createPeriod(value: { anio: number; mes: number; fechaPagoProgramada?: string }): Observable<PlanillaPeriodo> { return this.http.post<PlanillaPeriodo>(`${this.url}/periodos`, value); }
  getPeriod(id: string): Observable<PlanillaPeriodo> { return this.http.get<PlanillaPeriodo>(`${this.url}/periodos/${id}`); }
  getPeriodDetails(id: string, params: { estado?: string; areaId?: string; page?: number; limit?: number } = {}): Observable<PaginatedResponse<PlanillaDetalle>> { return this.http.get<PaginatedResponse<PlanillaDetalle>>(`${this.url}/periodos/${id}/detalles`, { params: { page: 1, limit: 100, ...params } }); }
  calculatePeriod(id: string): Observable<PaginatedResponse<PlanillaDetalle>> { return this.http.post<PaginatedResponse<PlanillaDetalle>>(`${this.url}/periodos/${id}/calcular`, {}); }
  closePeriod(id: string): Observable<PlanillaPeriodo> { return this.http.post<PlanillaPeriodo>(`${this.url}/periodos/${id}/cerrar`, {}); }
  getDetail(id: string): Observable<PlanillaDetalle> { return this.http.get<PlanillaDetalle>(`${this.url}/detalles/${id}`); }
  updateDetail(id: string, value: { bonificaciones?: number; descuentos?: number }): Observable<PlanillaDetalle> { return this.http.patch<PlanillaDetalle>(`${this.url}/detalles/${id}`, value); }
  getPaymentHistory(detailId: string): Observable<PagoMovimiento[]> {
    return this.http.get<ApiMovimiento[]>(`${this.url}/detalles/${detailId}/pagos`).pipe(map((items) => items.map((item, index) => ({
      id: item.id, numero: index + 1, monto: this.money(item.monto), fechaPago: this.date(item.fechaPago),
      horaPago: new Intl.DateTimeFormat('es-PE', { timeStyle: 'short' }).format(new Date(item.fechaPago)),
      responsable: item.responsableId ?? '-', entidadMedio: [item.entidadMedio, item.medioPago].filter(Boolean).join(' / '),
      observacion: item.observacion ?? item.referencia ?? '', estado: item.estado
    }))));
  }
  cancelPayment(paymentId: string): Observable<PlanillaMovimiento> { return this.http.post<PlanillaMovimiento>(`${this.url}/pagos/${paymentId}/anular`, {}); }
  private toView(item: ApiPago): PagoColaborador {
    const accounts = item.cuentasBancarias.map((x) => ({ id: x.id, cuentaBancaria: x.numeroCuenta, cci: x.cci ?? '', entidadBancaria: x.entidadBancaria, esPrincipal: x.principal }));
    const principal = accounts.find((x) => x.esPrincipal) ?? accounts[0];
    const latest = item.meses[item.meses.length - 1];
    const modalidad = item.contratoActual?.modalidadPago ?? 'FIN_MES';
    return {
      id: item.colaborador.id,
      nombre: [item.colaborador.nombres, item.colaborador.apellidoPaterno, item.colaborador.apellidoMaterno].filter(Boolean).join(' '),
      cargo: item.contratoActual?.cargo?.nombre ?? '', area: item.contratoActual?.cargo?.area?.nombre ?? '',
      avatar: item.colaborador.fotoUrl ?? '', montoMensual: this.money(latest?.montoProgramado ?? 0),
      fechaPago: this.paymentScheduleLabel(item.contratoActual), modalidadPago: modalidad,
      cta: principal?.cuentaBancaria ?? '', cci: principal?.cci ?? '', banco: principal?.entidadBancaria ?? '', cuentasBancarias: accounts,
      meses: item.meses.map((month) => {
        const monthDate = new Date(month.periodo.anio, month.periodo.mes - 1, 1, 12);
        return {
          id: month.id, year: month.periodo.anio, monthNumber: month.periodo.mes,
          mes: new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(monthDate),
          mesCompleto: new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(monthDate),
          estado: this.status(month.estado), monto: this.money(month.totalPagado), referencia: `de ${this.money(month.montoProgramado)}`,
          montoProgramado: this.money(month.montoProgramado), pagadoAbonado: this.money(month.totalPagado), pendiente: this.money(month.saldoPendiente),
          fechaPago: month.fechaUltimoPago ? this.date(month.fechaUltimoPago) : '-',
          fechasProgramadas: month.programacionPagoAplicada?.fechas?.length
            ? month.programacionPagoAplicada.fechas
            : this.scheduleDates(month.periodo.anio, month.periodo.mes, item.contratoActual),
          responsable: '-', entidadMedio: '-', movimientos: [], conceptos: []
        };
      })
    };
  }
  registerPayment(detailId: string, value: { monto: number; fechaPago: string; medioPago: string; cuentaBancariaId?: string; entidadMedio?: string; referencia?: string; observacion?: string }): Observable<unknown> { return this.http.post(`${this.url}/detalles/${detailId}/pagos`, value); }
  private status(value: string): 'Pagado' | 'Abonado' | 'Pendiente' { return value === 'PAGADO' ? 'Pagado' : value === 'ABONADO' ? 'Abonado' : 'Pendiente'; }
  private money(value: number): string { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(value) || 0); }
  private date(value: string): string {
    const parsed = /^\d{4}-\d{2}-\d{2}$/.test(value) ? new Date(`${value}T00:00:00`) : new Date(value);
    return new Intl.DateTimeFormat('es-PE').format(parsed);
  }
  private percent(value: number, total: number): string { return total ? `${((value / total) * 100).toFixed(1)}% del total` : '0% del total'; }
  private periodLabel(value: string): string {
    const [year, month] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date(year, month - 1, 1, 12));
  }
  private paymentScheduleLabel(contract: ApiPago['contratoActual']): string {
    const mode = contract?.modalidadPago ?? 'FIN_MES';
    if (mode === 'QUINCENAL') return '15 y fin de mes';
    if (mode === 'FECHA_INGRESO') return `Día ${Number(contract?.fechaInicio?.slice(8, 10) || 0)}`;
    if (mode === 'PERSONALIZADO') return `Día ${contract?.diaPagoPersonalizado ?? '-'}`;
    return 'Fin de mes';
  }
  private scheduleDates(year: number, month: number, contract: ApiPago['contratoActual']): string[] {
    const lastDay = new Date(year, month, 0).getDate();
    const date = (day: number) => `${year}-${String(month).padStart(2, '0')}-${String(Math.min(day, lastDay)).padStart(2, '0')}`;
    const mode = contract?.modalidadPago ?? 'FIN_MES';
    if (mode === 'QUINCENAL') return [date(15), date(lastDay)];
    if (mode === 'FECHA_INGRESO') return [date(Number(contract?.fechaInicio?.slice(8, 10) || lastDay))];
    if (mode === 'PERSONALIZADO') return [date(contract?.diaPagoPersonalizado ?? lastDay)];
    return [date(lastDay)];
  }
}
