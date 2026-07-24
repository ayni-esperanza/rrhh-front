import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, Input } from '@angular/core';
import { PagoColaborador, PagoMes } from '../../models/pago.model';
import { DetallePagoModalComponent } from '../detalle-pago-modal/detalle-pago-modal.component';

@Component({
  selector: 'app-pagos-table',
  imports: [DetallePagoModalComponent, PaginacionComponent],
  templateUrl: './pagos-table.component.html'
})
export class PagosTableComponent {
  @Input({ required: true }) pagos: PagoColaborador[] = [];
  protected expandedId: number | null = null;
  protected selectedPago: PagoColaborador | null = null;
  protected isDetalleOpen = false;

  protected togglePago(id: number): void { this.expandedId = this.expandedId === id ? null : id; }
  protected openDetalle(pago: PagoColaborador): void { this.selectedPago = pago; this.isDetalleOpen = true; }
  protected closeDetalle(): void { this.isDetalleOpen = false; }

  protected estadoClasses(estado: PagoMes['estado']): string {
    const classes = { Pagado: 'text-emerald-600 dark:text-emerald-300', Abonado: 'text-orange-600 dark:text-orange-300', Pendiente: 'text-red-600 dark:text-red-300' };
    return classes[estado];
  }

  protected estadoIcon(estado: PagoMes['estado']): string {
    return estado === 'Pagado' ? 'M8 12.5 10.5 15 16 9.5' : estado === 'Abonado' ? 'M12 7v5l3 2' : 'M12 8v4';
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

