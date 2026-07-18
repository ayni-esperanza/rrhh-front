import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PagoColaborador, PagoMes } from '../../models/pago.model';

@Component({
  selector: 'app-registrar-pago-modal',
  imports: [FormsModule],
  templateUrl: './registrar-pago-modal.component.html'
})
export class RegistrarPagoModalComponent {
  @Input() isOpen = false;
  @Input() colaborador: PagoColaborador | null = null;
  @Input() mes: PagoMes | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() savePayment = new EventEmitter<void>();

  protected fechaPago = '06/05/2025';
  protected responsable = 'Administrador';
  protected entidad = 'Banco de Credito del Peru (BCP)';
  protected monto = '1,400.00';
  protected observacion = '';

  protected get hasAbono(): boolean { return this.mes?.estado === 'Abonado'; }
  protected get maximo(): string { return this.mes?.montoProgramado ?? 'S/ 0.00'; }

  @HostListener('document:keydown.escape')
  protected onEscape(): void { if (this.isOpen) this.closeModal.emit(); }
}
