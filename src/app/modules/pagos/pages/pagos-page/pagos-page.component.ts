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

  protected readonly metrics = this.pagosService.getMetrics();
  protected readonly pagos = this.pagosService.getPagos();
  protected filters: PagosFilterState = this.emptyFilters();

  protected get filteredPagos(): PagoColaborador[] {
    const search = this.normalize(this.filters.search);

    return this.pagos.filter((pago) => {
      const mesesEnRango = pago.meses.filter((mes) => this.monthIntersectsRange(mes.mesCompleto));
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
    return {
      search: '',
      dateFrom: '2025-05-01',
      dateTo: '2025-05-31',
      area: '',
      estado: '',
      minAmount: Math.floor(Math.min(...amounts) / 100) * 100,
      maxAmount: Math.ceil(Math.max(...amounts) / 100) * 100
    };
  }

  private monthIntersectsRange(monthLabel: string): boolean {
    const monthNames = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
    const [monthName, yearText] = monthLabel.toLowerCase().split(' ');
    const monthIndex = monthNames.indexOf(monthName);
    const year = Number(yearText);
    if (monthIndex < 0 || !year) return false;

    const monthStart = new Date(year, monthIndex, 1).getTime();
    const monthEnd = new Date(year, monthIndex + 1, 0, 23, 59, 59, 999).getTime();
    const rangeStart = this.filters.dateFrom ? this.localDate(this.filters.dateFrom).getTime() : Number.NEGATIVE_INFINITY;
    const rangeEnd = this.filters.dateTo ? this.localDate(this.filters.dateTo, true).getTime() : Number.POSITIVE_INFINITY;
    return monthStart <= rangeEnd && monthEnd >= rangeStart;
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
    const visibleMonths = this.filteredPagos[0]?.meses.filter((month) => this.monthIntersectsRange(month.mesCompleto)) ?? [];
    return {
      title: `Historial de pagos - ${this.periodLabel}`,
      fileName: 'pagos',
      columns: [
        { key: 'nombre', header: 'Colaborador' }, { key: 'cargo', header: 'Cargo' },
        { key: 'area', header: 'Área' }, { key: 'monto', header: 'Monto mensual' },
        { key: 'fecha', header: 'Fecha de pago' }, { key: 'banco', header: 'Banco' },
        ...visibleMonths.map((month, index) => ({ key: `mes${index}`, header: month.mes }))
      ],
      rows: this.filteredPagos.map((pago) => ({
        nombre: pago.nombre, cargo: pago.cargo, area: pago.area, monto: pago.montoMensual,
        fecha: `${pago.fechaPago} ${pago.horaPago}`, banco: pago.banco,
        ...Object.fromEntries(pago.meses.filter((month) => this.monthIntersectsRange(month.mesCompleto)).map((month, index) => [`mes${index}`, this.exportMonthDetail(month)]))
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
