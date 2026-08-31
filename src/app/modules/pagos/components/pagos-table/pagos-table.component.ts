import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, Input, OnChanges } from '@angular/core';
import { PagoColaborador, PagoMes } from '../../models/pago.model';
import { EventEmitter, Output } from '@angular/core';
import { DetallePagoModalComponent } from '../detalle-pago-modal/detalle-pago-modal.component';
import { CopyTextButtonComponent } from '../../../../shared/components/copy-text-button/copy-text-button.component';

@Component({
  selector: 'app-pagos-table',
  imports: [DetallePagoModalComponent, PaginacionComponent, CopyTextButtonComponent],
  templateUrl: './pagos-table.component.html'
})
export class PagosTableComponent implements OnChanges {
  @Input({ required: true }) pagos: PagoColaborador[] = [];
  @Input() periodLabel = '';
  @Output() paymentSaved = new EventEmitter<void>();
  protected expandedId: string | null = null;
  protected selectedPago: PagoColaborador | null = null;
  protected isDetalleOpen = false;
  protected readonly yearMonths = Array.from({ length: 12 }, (_, index) => ({
    number: index + 1,
    label: new Intl.DateTimeFormat('es-PE', { month: 'short' }).format(new Date(Date.UTC(2026, index)))
  }));
  private readonly selectedBankIndexes = new Map<string, number>();

  protected togglePago(id: string): void { this.expandedId = this.expandedId === id ? null : id; }
  protected openDetalle(pago: PagoColaborador): void { this.selectedPago = pago; this.isDetalleOpen = true; }
  protected closeDetalle(): void { this.isDetalleOpen = false; }

  protected selectedBankIndex(pago: PagoColaborador): number {
    return this.selectedBankIndexes.get(pago.id)
      ?? Math.max(0, pago.cuentasBancarias.findIndex((cuenta) => cuenta.esPrincipal));
  }

  protected selectedBankAccount(pago: PagoColaborador) {
    return pago.cuentasBancarias[this.selectedBankIndex(pago)] ?? pago.cuentasBancarias[0];
  }

  protected selectBankAccount(pagoId: string, index: string): void {
    this.selectedBankIndexes.set(pagoId, Number(index));
  }

  ngOnChanges(): void {
    const lastPage = Math.max(0, Math.ceil(this.pagos.length / this.porPagina) - 1);
    this.paginaActual = Math.min(this.paginaActual, lastPage);
  }

  protected estadoClasses(estado: PagoMes['estado']): string {
    const classes = { Pagado: 'text-emerald-600 dark:text-emerald-300', Abonado: 'text-orange-600 dark:text-orange-300', Pendiente: 'text-red-600 dark:text-red-300' };
    return classes[estado];
  }

  protected estadoIcon(estado: PagoMes['estado']): string {
    return estado === 'Pagado' ? 'M8 12.5 10.5 15 16 9.5' : estado === 'Abonado' ? 'M12 7v5l3 2' : 'M12 8v4m0 4h.01';
  }

  protected paymentMonth(pago: PagoColaborador, monthNumber: number): PagoMes | undefined {
    return pago.meses.find((month) => month.monthNumber === monthNumber);
  }

  protected paginaActual = 0;
  protected porPagina = 10;

  protected get paginationConfig(): PaginacionConfig {
    const totalElementos = this.pagos.length;
    return {
      paginaActual: this.paginaActual,
      porPagina: this.porPagina,
      totalElementos,
      totalPaginas: Math.max(1, Math.ceil(totalElementos / this.porPagina))
    };
  }

  protected get paginatedPagos(): PagoColaborador[] {
    const inicio = this.paginaActual * this.porPagina;
    return this.pagos.slice(inicio, inicio + this.porPagina);
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }}

