import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { PagoColaborador, PagoMes } from '../../models/pago.model';
import { inject } from '@angular/core';
import { RegistrarPagoModalComponent } from '../registrar-pago-modal/registrar-pago-modal.component';
import { PagosService } from '../../services/pagos.service';

@Component({
  selector: 'app-detalle-pago-modal',
  imports: [RegistrarPagoModalComponent],
  templateUrl: './detalle-pago-modal.component.html'
})
export class DetallePagoModalComponent {
  @Input() isOpen = false;
  @Input() pago: PagoColaborador | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() paymentSaved = new EventEmitter<void>();
  private readonly pagosService = inject(PagosService);

  protected selectedMes: PagoMes | null = null;
  protected isRegistrarOpen = false;
  protected expandedMonth = '';

  protected resumen(estado: PagoMes['estado']): { monto: string; count: number } {
    const meses = this.pago?.meses.filter((mes) => mes.estado === estado) ?? [];
    const total = meses.reduce((sum, mes) => sum + this.moneyToNumber(estado === 'Pendiente' ? mes.pendiente : mes.pagadoAbonado), 0);
    return { monto: `S/ ${total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, count: meses.length };
  }

  protected openRegistrar(mes: PagoMes): void {
    this.selectedMes = mes;
    this.isRegistrarOpen = true;
  }

  protected closeRegistrar(): void {
    this.isRegistrarOpen = false;
  }

  protected toggleMovimientos(mes: PagoMes): void {
    if (this.expandedMonth === mes.mesCompleto) { this.expandedMonth = ''; return; }
    if (mes.movimientos.length) { this.expandedMonth = mes.mesCompleto; return; }
    this.pagosService.getPaymentHistory(mes.id).subscribe((movimientos) => { mes.movimientos = movimientos; this.expandedMonth = mes.mesCompleto; });
  }

  protected paymentRegistered(): void {
    if (!this.selectedMes) return;
    this.pagosService.getPaymentHistory(this.selectedMes.id).subscribe((movimientos) => {
      this.selectedMes!.movimientos = movimientos;
      this.expandedMonth = this.selectedMes!.mesCompleto;
      this.closeRegistrar();
      this.paymentSaved.emit();
    });
  }

  protected movimientoLabel(mes: PagoMes): string {
    const count = mes.movimientos.length;
    if (!count) return 'Ver movimientos';
    return `${count} ${mes.estado === 'Pagado' && count === 1 ? 'pago' : count === 1 ? 'abono' : 'abonos'}`;
  }

  protected estadoClasses(estado: PagoMes['estado']): string {
    const classes = { Pagado: 'text-emerald-600 dark:text-emerald-300', Abonado: 'text-orange-600 dark:text-orange-300', Pendiente: 'text-red-600 dark:text-red-300' };
    return classes[estado];
  }

  private moneyToNumber(value: string): number {
    return Number(value.replace(/[^0-9.]/g, '')) || 0;
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isRegistrarOpen) this.closeRegistrar();
    else if (this.isOpen) this.closeModal.emit();
  }
}
