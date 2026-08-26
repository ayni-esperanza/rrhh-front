import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { inject } from '@angular/core';
import { AuthService } from '../../../../core/services/auth.service';
import { PagoColaborador, PagoMes } from '../../models/pago.model';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { PagosService } from '../../services/pagos.service';

@Component({
  selector: 'app-registrar-pago-modal',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './registrar-pago-modal.component.html'
})
export class RegistrarPagoModalComponent {
  private readonly auth = inject(AuthService);
  private readonly pagosService = inject(PagosService);
  @Input() isOpen = false;
  @Input() colaborador: PagoColaborador | null = null;
  @Input() mes: PagoMes | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() savePayment = new EventEmitter<void>();

  protected fechaPago = new Date().toLocaleDateString('en-CA');
  protected responsable = this.auth.user()?.name ?? '';
  protected entidad = '';
  protected monto = '';
  protected observacion = '';

  protected get hasAbono(): boolean { return this.mes?.estado === 'Abonado'; }
  protected get maximo(): string { return this.hasAbono ? this.mes?.pendiente ?? 'S/ 0.00' : this.mes?.montoProgramado ?? 'S/ 0.00'; }
  protected submit(): void { if (!this.mes) return; const amount = Number(this.monto.replace(/[^0-9.]/g, '')); if (!amount || !this.fechaPago || !this.entidad.trim()) return; this.pagosService.registerPayment(this.mes.id, { monto: amount, fechaPago: this.fechaPago, medioPago: this.entidad.trim(), observacion: this.observacion.trim() || undefined }).subscribe(() => this.savePayment.emit()); }

  @HostListener('document:keydown.escape')
  protected onEscape(): void { if (this.isOpen) this.closeModal.emit(); }
}


