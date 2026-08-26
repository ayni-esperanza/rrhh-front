import { TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { environment } from '../../../environments/environment';
import { CatalogosService } from '../../modules/colaboradores/services/catalogos.service';
import { PagosService } from '../../modules/pagos/services/pagos.service';
import { UsuariosService } from '../../modules/usuarios/services/usuarios.service';
import { AlertasService } from '../../modules/alertas/services/alertas.service';
import { AsistenciasService } from '../../modules/asistencias/services/asistencias.service';
import { ConfiguracionHorasExtrasService } from '../../modules/asistencias/services/configuracion-horas-extras.service';
import { FeriadosService } from '../../modules/asistencias/services/feriados.service';
import { ColaboradoresService } from '../../modules/colaboradores/services/colaboradores.service';

describe('API contracts', () => {
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideZonelessChangeDetection(), provideHttpClient(), provideHttpClientTesting()] });
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http?.verify());

  it('never builds an empty catalog PATCH URL', () => {
    const service = TestBed.inject(CatalogosService);
    service.create('areas', { nombre: 'Operaciones' }).subscribe();
    const create = http.expectOne(`${environment.apiUrl}/catalogos/areas`);
    expect(create.request.method).toBe('POST');
    create.flush({ id: 'area-1', nombre: 'Operaciones' });

    service.update('areas', 'area-1', { nombre: 'Operaciones' }).subscribe();
    const update = http.expectOne(`${environment.apiUrl}/catalogos/areas/area-1`);
    expect(update.request.method).toBe('PATCH');
    update.flush({ id: 'area-1', nombre: 'Operaciones' });
  });

  it('shares catalog GETs and invalidates the cache after a mutation', () => {
    const service = TestBed.inject(CatalogosService);
    const url = `${environment.apiUrl}/catalogos/areas?page=1&limit=100`;

    service.list<{ id: string; nombre: string }>('areas').subscribe();
    service.list<{ id: string; nombre: string }>('areas').subscribe();
    const firstRequest = http.expectOne(url);
    expect(firstRequest.request.method).toBe('GET');
    firstRequest.flush({ data: [{ id: 'area-1', nombre: 'Operaciones' }], meta: { page: 1, limit: 100, total: 1, totalPages: 1 } });
    http.expectNone(url);

    service.update('areas', 'area-1', { nombre: 'Administración' }).subscribe();
    http.expectOne(`${environment.apiUrl}/catalogos/areas/area-1`).flush({ id: 'area-1', nombre: 'Administración' });

    service.list('areas').subscribe();
    http.expectOne(url).flush({ data: [{ id: 'area-1', nombre: 'Administración' }], meta: { page: 1, limit: 100, total: 1, totalPages: 1 } });
  });

  it('matches every payroll route', () => {
    const service = TestBed.inject(PagosService);
    const base = `${environment.apiUrl}/planillas`;
    const calls: Array<[() => void, string, string, object]> = [
      [() => service.listPeriods().subscribe(), `${base}/periodos?page=1&limit=100`, 'GET', { data: [], total: 0, page: 1, limit: 100, totalPages: 0 }],
      [() => service.createPeriod({ anio: 2026, mes: 8 }).subscribe(), `${base}/periodos`, 'POST', {}],
      [() => service.getPeriod('period-1').subscribe(), `${base}/periodos/period-1`, 'GET', {}],
      [() => service.getPeriodDetails('period-1').subscribe(), `${base}/periodos/period-1/detalles?page=1&limit=100`, 'GET', { data: [], total: 0, page: 1, limit: 100, totalPages: 0 }],
      [() => service.calculatePeriod('period-1').subscribe(), `${base}/periodos/period-1/calcular`, 'POST', {}],
      [() => service.closePeriod('period-1').subscribe(), `${base}/periodos/period-1/cerrar`, 'POST', {}],
      [() => service.getDetail('detail-1').subscribe(), `${base}/detalles/detail-1`, 'GET', {}],
      [() => service.updateDetail('detail-1', { bonificaciones: 10 }).subscribe(), `${base}/detalles/detail-1`, 'PATCH', {}],
      [() => service.registerPayment('detail-1', { monto: 10, fechaPago: '2026-08-25', medioPago: 'Transferencia' }).subscribe(), `${base}/detalles/detail-1/pagos`, 'POST', {}],
      [() => service.getPaymentHistory('detail-1').subscribe(), `${base}/detalles/detail-1/pagos`, 'GET', []],
      [() => service.cancelPayment('payment-1').subscribe(), `${base}/pagos/payment-1/anular`, 'POST', {}]
    ];
    for (const [invoke, url, method, response] of calls) {
      invoke();
      const request = http.expectOne(url);
      expect(request.request.method).toBe(method);
      request.flush(response);
    }
  });

  it('maps five payment metrics even without a scheduled date', () => {
    const service = TestBed.inject(PagosService);
    let labels: string[] = [];
    service.getMetrics(2026, 8).subscribe((metrics) => labels = metrics.map((metric) => metric.label));
    http.expectOne(`${environment.apiUrl}/planillas/metricas?anio=2026&mes=8`).flush({
      periodo: '2026-08', colaboradores: 0, planillaTotal: 0, pagado: 0, pendiente: 0, proximoPago: null
    });
    expect(labels).toEqual(['Colaboradores', 'Planilla mensual total', 'Pagos realizados', 'Pendiente por pagar', 'Próximo pago']);
  });

  it('maps incomplete attendance records as the fifth metric', () => {
    const service = TestBed.inject(AsistenciasService);
    const matrix = http.expectOne((request) => request.url === `${environment.apiUrl}/asistencias/matriz`);
    matrix.flush({ data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 1 }, periodo: '2026-08' });
    const metrics = http.expectOne((request) => request.url === `${environment.apiUrl}/asistencias/metricas`);
    metrics.flush({ registros: 0, minutosNormales: 0, minutosExtras: 0, faltas: 0, incompletos: 3 });
    expect(service.getMetrics().map((metric) => metric.label)).toEqual([
      'Registros', 'Horas trabajadas', 'Horas extras', 'Faltas', 'Registros incompletos'
    ]);
    expect(service.getMetrics()[4].value).toBe('3');
  });

  it('matches attendance justification, holiday and configuration routes', () => {
    const attendance = TestBed.inject(AsistenciasService);
    http.expectOne((request) => request.url.endsWith('/asistencias/matriz')).flush({ data: [], meta: {} });
    http.expectOne((request) => request.url.endsWith('/asistencias/metricas')).flush({ registros: 0, minutosNormales: 0, minutosExtras: 0, faltas: 0, incompletos: 0 });
    const calls: Array<[() => void, string, string]> = [
      [() => attendance.createJustification('attendance-1', { motivo: 'Salud' }).subscribe(), '/asistencias/attendance-1/justificacion', 'POST'],
      [() => attendance.updateJustification('attendance-1', { motivo: 'Salud' }).subscribe(), '/asistencias/attendance-1/justificacion', 'PATCH'],
      [() => attendance.reviewJustification('attendance-1', 'APROBADA').subscribe(), '/asistencias/attendance-1/justificacion/revisar', 'POST'],
      [() => attendance.approveJustification('attendance-1').subscribe(), '/asistencias/attendance-1/justificacion/aprobar', 'POST'],
      [() => attendance.rejectJustification('attendance-1').subscribe(), '/asistencias/attendance-1/justificacion/rechazar', 'POST']
    ];
    for (const [invoke, path, method] of calls) { invoke(); const request = http.expectOne(`${environment.apiUrl}${path}`); expect(request.request.method).toBe(method); request.flush({}); }

    const holidays = TestBed.inject(FeriadosService);
    holidays.get('holiday-1').subscribe(); http.expectOne(`${environment.apiUrl}/feriados/holiday-1`).flush({});
    holidays.getRule('2026-08-30').subscribe(); http.expectOne(`${environment.apiUrl}/feriados/fecha/2026-08-30/regla`).flush({});
    holidays.calculatePayment('holiday-1', 1500, 8).subscribe(); http.expectOne(`${environment.apiUrl}/feriados/holiday-1/calcular-pago`).flush({});
    holidays.delete('holiday-1').subscribe(); const holidayDelete = http.expectOne(`${environment.apiUrl}/feriados/holiday-1`); expect(holidayDelete.request.method).toBe('DELETE'); holidayDelete.flush(null);

    const configurations = TestBed.inject(ConfiguracionHorasExtrasService);
    http.expectOne((request) => request.url.endsWith('/configuraciones-horas-extra')).flush({ data: [], meta: {} });
    http.expectOne((request) => request.url.endsWith('/configuraciones-pago-feriado')).flush({ data: [], meta: {} });
    configurations.deactivateOvertime('overtime-1').subscribe(); http.expectOne(`${environment.apiUrl}/configuraciones-horas-extra/overtime-1`).flush(null);
    configurations.getHolidayConfiguration('holiday-config-1').subscribe(); http.expectOne(`${environment.apiUrl}/configuraciones-pago-feriado/holiday-config-1`).flush({});
    configurations.deactivateHolidayConfiguration('holiday-config-1').subscribe(); http.expectOne(`${environment.apiUrl}/configuraciones-pago-feriado/holiday-config-1`).flush(null);
  });

  it('registers collaborator documents backed by an external URL', () => {
    const collaborators = TestBed.inject(ColaboradoresService);
    collaborators.createDocument('collaborator-1', { nombre: 'Licencia', archivoNombre: 'licencia.pdf', archivoUrl: 'https://example.test/licencia.pdf' }).subscribe();
    const request = http.expectOne(`${environment.apiUrl}/colaboradores/collaborator-1/documentos`);
    expect(request.request.method).toBe('POST');
    expect(request.request.body.archivoUrl).toBe('https://example.test/licencia.pdf');
    request.flush({});
  });

  it('matches users and alerts routes', () => {
    const users = TestBed.inject(UsuariosService);
    const alerts = TestBed.inject(AlertasService);
    users.getMetrics().subscribe();
    const userMetrics = http.expectOne(`${environment.apiUrl}/usuarios/metricas`);
    expect(userMetrics.request.method).toBe('GET');
    userMetrics.flush({ total: 0, activos: 0, inactivos: 0, accesosMes: 0 });

    users.resetPassword('user-1').subscribe();
    const reset = http.expectOne(`${environment.apiUrl}/usuarios/user-1/restablecer-password`);
    expect(reset.request.method).toBe('POST');
    reset.flush({ temporaryPassword: 'temp' });

    alerts.getMetrics().subscribe();
    const metrics = http.expectOne(`${environment.apiUrl}/alertas/metricas`);
    expect(metrics.request.method).toBe('GET');
    metrics.flush({ total: 0, pendientes: 0, alta: 0, media: 0 });

    alerts.generate().subscribe();
    const generate = http.expectOne(`${environment.apiUrl}/alertas/generar`);
    expect(generate.request.method).toBe('POST');
    generate.flush({});
  });
});
