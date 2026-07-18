import { Component, Input } from '@angular/core';
import { PagoColaborador, PagoMes } from '../../models/pago.model';

@Component({
  selector: 'app-pagos-table',
  templateUrl: './pagos-table.component.html'
})
export class PagosTableComponent {
  @Input({ required: true }) pagos: PagoColaborador[] = [];
  protected expandedId: number | null = null;

  protected togglePago(id: number): void {
    this.expandedId = this.expandedId === id ? null : id;
  }

  protected estadoClasses(estado: PagoMes['estado']): string {
    const classes = {
      Pagado: 'text-emerald-600 dark:text-emerald-300',
      Abonado: 'text-orange-600 dark:text-orange-300',
      Pendiente: 'text-red-600 dark:text-red-300'
    };
    return classes[estado];
  }

  protected estadoIcon(estado: PagoMes['estado']): string {
    return estado === 'Pagado' ? 'M8 12.5 10.5 15 16 9.5' : estado === 'Abonado' ? 'M12 7v5l3 2' : 'M12 8v4';
  }
}
