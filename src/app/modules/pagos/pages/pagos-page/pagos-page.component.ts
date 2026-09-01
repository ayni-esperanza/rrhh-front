import { Component, inject } from '@angular/core';
import { PagosFiltersComponent } from '../../components/pagos-filters/pagos-filters.component';
import { PagosMetricsComponent } from '../../components/pagos-metrics/pagos-metrics.component';
import { PagosTableComponent } from '../../components/pagos-table/pagos-table.component';
import { PagosService } from '../../services/pagos.service';
import { PagoColaborador, PagoMes } from '../../models/pago.model';
import { PagosFilterState } from '../../components/pagos-filters/pagos-filters.component';
import { ExportTable, TableExportService } from '../../../../shared/services/table-export.service';

@Component({
  selector: 'app-pagos-page',
  imports: [PagosMetricsComponent, PagosFiltersComponent, PagosTableComponent],
  templateUrl: './pagos-page.component.html'
})
export class PagosPageComponent {
  private readonly pagosService = inject(PagosService);
  private readonly tableExport = inject(TableExportService);

  protected metrics = [] as import('../../models/pago.model').PagoMetric[];
  protected pagos: PagoColaborador[] = [];
  protected filters: PagosFilterState = this.emptyFilters();

  constructor() {
    this.reload();
  }

  protected reload(): void {
    const now = new Date();
    this.pagosService.getMetrics(now.getFullYear(), now.getMonth() + 1).subscribe((metrics) => this.metrics = metrics);
    this.pagosService.getPagos(now.getFullYear()).subscribe((pagos) => { this.pagos = pagos; this.filters = this.emptyFilters(); });
  }

  protected get filteredPagos(): PagoColaborador[] {
    const search = this.normalize(this.filters.search);

    return this.pagos.filter((pago) => {
      const mesesEnRango = pago.meses.filter((mes) => this.paymentDueInRange(mes));
      const monto = this.moneyToNumber(pago.montoMensual);

      return (!search || this.normalize(`${pago.nombre} ${pago.cargo} ${pago.area} ${pago.banco}`).includes(search))
        && (!this.filters.area || pago.area === this.filters.area)
        && (!this.filters.estado || mesesEnRango.some((mes) => mes.estado === this.filters.estado))
        && mesesEnRango.length > 0
        && monto >= this.filters.minAmount
        && monto <= this.filters.maxAmount;
    });
  }

  protected get periodLabel(): string {
    if (!this.filters.dateFrom && !this.filters.dateTo) return 'Todos los periodos';
    if (!this.filters.dateFrom) return `Hasta ${this.formatDate(this.filters.dateTo)}`;
    if (!this.filters.dateTo) return `Desde ${this.formatDate(this.filters.dateFrom)}`;
    return `${this.formatDate(this.filters.dateFrom)} - ${this.formatDate(this.filters.dateTo)}`;
  }

  protected updateFilters(filters: PagosFilterState): void {
    this.filters = filters;
  }

  protected exportExcel(): void { void this.tableExport.toExcel(this.exportTable()); }
  protected exportPdf(): void { void this.tableExport.toPdf(this.exportTable()); }

  private emptyFilters(): PagosFilterState {
    const amounts = this.pagos.map((pago) => this.moneyToNumber(pago.montoMensual));
    const year = new Date().getFullYear();
    return {
      search: '',
      dateFrom: `${year}-01-01`,
      dateTo: `${year}-12-31`,
      area: '',
      estado: '',
      minAmount: amounts.length ? Math.floor(Math.min(...amounts) / 100) * 100 : 0,
      maxAmount: amounts.length ? Math.ceil(Math.max(...amounts) / 100) * 100 : 0
    };
  }

  private monthIntersectsRange(year: number, monthNumber: number): boolean {
    const monthStart = new Date(year, monthNumber - 1, 1).getTime();
    const monthEnd = new Date(year, monthNumber, 0, 23, 59, 59, 999).getTime();
    const rangeStart = this.filters.dateFrom ? this.localDate(this.filters.dateFrom).getTime() : Number.NEGATIVE_INFINITY;
    const rangeEnd = this.filters.dateTo ? this.localDate(this.filters.dateTo, true).getTime() : Number.POSITIVE_INFINITY;
    return monthStart <= rangeEnd && monthEnd >= rangeStart;
  }

  private paymentDueInRange(month: PagoMes): boolean {
    const rangeStart = this.filters.dateFrom ? this.filters.dateFrom : '0000-01-01';
    const rangeEnd = this.filters.dateTo ? this.filters.dateTo : '9999-12-31';
    return month.fechasProgramadas.some((scheduledDate) => {
      const date = scheduledDate.slice(0, 10);
      return date >= rangeStart && date <= rangeEnd;
    });
  }

  private localDate(value: string, endOfDay = false): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day, endOfDay ? 23 : 0, endOfDay ? 59 : 0, endOfDay ? 59 : 0, endOfDay ? 999 : 0);
  }

  private formatDate(value: string): string {
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' }).format(this.localDate(value));
  }

  private moneyToNumber(value: string): number {
    return Number(value.replace(/[^0-9.]/g, '')) || 0;
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private exportTable(): ExportTable {
    const year = new Date().getFullYear();
    const visibleMonths = Array.from({ length: 12 }, (_, index) => ({
      number: index + 1,
      label: new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(new Date(year, index, 1, 12))
    })).filter((month) => this.monthIntersectsRange(year, month.number));
    return {
      title: `Historial de pagos - ${this.periodLabel}`,
      fileName: 'pagos',
      columns: [
        { key: 'nombre', header: 'Colaborador' }, { key: 'cargo', header: 'Cargo' },
        { key: 'area', header: 'Área' }, { key: 'monto', header: 'Monto mensual' },
        { key: 'fecha', header: 'Fecha de pago' }, { key: 'banco', header: 'Banco' },
        ...visibleMonths.map((month) => ({ key: `mes${month.number}`, header: month.label }))
      ],
      rows: this.filteredPagos.map((pago) => ({
        nombre: pago.nombre, cargo: pago.cargo, area: pago.area, monto: pago.montoMensual,
        fecha: pago.fechaPago, banco: pago.banco,
        ...Object.fromEntries(visibleMonths.map((month) => {
          const paymentMonth = pago.meses.find((item) => item.monthNumber === month.number);
          return [`mes${month.number}`, paymentMonth ? this.exportMonthDetail(paymentMonth) : '—'];
        }))
      }))
    };
  }

  private exportMonthDetail(month: PagoMes): string {
    if (month.estado === 'Abonado') {
      return `Abonado: ${month.pagadoAbonado} | Pendiente: ${month.pendiente} | Total: ${month.montoProgramado}`;
    }

    if (month.estado === 'Pendiente') {
      return `Pendiente: ${month.pendiente}`;
    }

    return `Pagado: ${month.pagadoAbonado}`;
  }
}
