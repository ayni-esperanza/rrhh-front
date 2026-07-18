import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { PagoColaborador, PagoMes } from '../../models/pago.model';
import { RegistrarPagoModalComponent } from '../registrar-pago-modal/registrar-pago-modal.component';

@Component({
  selector: 'app-detalle-pago-modal',
  imports: [RegistrarPagoModalComponent],
  templateUrl: './detalle-pago-modal.component.html'
})
export class DetallePagoModalComponent {
  @Input() isOpen = false;
  @Input() pago: PagoColaborador | null = null;
  @Output() closeModal = new EventEmitter<void>();

  protected selectedMes: PagoMes | null = null;
  protected isRegistrarOpen = false;

  protected resumen(estado: PagoMes['estado']): { monto: string; count: number } {
    const meses = this.pago?.meses.filter((mes) => mes.estado === estado) ?? [];
    const total = meses.reduce((sum, mes) => sum + Number(mes.pagadoAbonado.replace(/[S/, ]/g, '')), 0);
    return { monto: `S/ ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, count: meses.length };
  }

  protected openRegistrar(mes: PagoMes): void {
    this.selectedMes = mes;
    this.isRegistrarOpen = true;
  }

  protected closeRegistrar(): void {
    this.isRegistrarOpen = false;
  }

  protected estadoClasses(estado: PagoMes['estado']): string {
    const classes = { Pagado: 'text-emerald-600 dark:text-emerald-300', Abonado: 'text-orange-600 dark:text-orange-300', Pendiente: 'text-red-600 dark:text-red-300' };
    return classes[estado];
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isRegistrarOpen) this.closeRegistrar();
    else if (this.isOpen) this.closeModal.emit();
  }
}
