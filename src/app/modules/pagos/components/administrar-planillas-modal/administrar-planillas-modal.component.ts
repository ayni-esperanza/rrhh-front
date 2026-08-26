import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { DatePipe } from '@angular/common';
import { PagosService, PlanillaDetalle, PlanillaPeriodo } from '../../services/pagos.service';

@Component({
  selector: 'app-administrar-planillas-modal',
  standalone: true,
  imports: [FormsModule, DatePickerComponent, DatePipe],
  templateUrl: './administrar-planillas-modal.component.html'
})
export class AdministrarPlanillasModalComponent implements OnChanges {
  private readonly pagos = inject(PagosService);
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();
  @Output() changed = new EventEmitter<void>();

  protected periods: PlanillaPeriodo[] = [];
  protected selectedPeriod: PlanillaPeriodo | null = null;
  protected details: PlanillaDetalle[] = [];
  protected selectedDetail: PlanillaDetalle | null = null;
  protected year = new Date().getFullYear();
  protected month = new Date().getMonth() + 1;
  protected scheduledDate = '';
  protected bonuses = 0;
  protected discounts = 0;
  protected isLoading = false;
  protected message = '';
  protected errorMessage = '';

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] && this.isOpen) this.loadPeriods();
  }

  protected close(): void { this.closeModal.emit(); }

  protected createPeriod(): void {
    this.busy();
    this.pagos.createPeriod({ anio: Number(this.year), mes: Number(this.month), fechaPagoProgramada: this.scheduledDate || undefined }).subscribe({
      next: (period) => { this.done('Periodo creado.'); this.periods = [period, ...this.periods]; this.selectPeriod(period); this.changed.emit(); },
      error: () => this.fail('No se pudo crear el periodo. Verifica que no exista previamente.')
    });
  }

  protected selectPeriod(period: PlanillaPeriodo): void {
    this.busy();
    this.selectedDetail = null;
    this.pagos.getPeriod(period.id).subscribe({
      next: (detail) => { this.selectedPeriod = detail; this.loadDetails(detail.id); },
      error: () => this.fail('No se pudo consultar el periodo.')
    });
  }

  protected calculate(): void {
    if (!this.selectedPeriod) return;
    this.busy();
    this.pagos.calculatePeriod(this.selectedPeriod.id).subscribe({
      next: (response) => { this.details = response.data; this.selectedPeriod = { ...this.selectedPeriod!, estado: 'CALCULADO' }; this.done('Planilla calculada.'); this.changed.emit(); },
      error: () => this.fail('No se pudo calcular la planilla.')
    });
  }

  protected closePeriod(): void {
    if (!this.selectedPeriod || this.selectedPeriod.estado !== 'CALCULADO') return;
    this.busy();
    this.pagos.closePeriod(this.selectedPeriod.id).subscribe({
      next: (period) => { this.selectedPeriod = period; this.periods = this.periods.map((item) => item.id === period.id ? period : item); this.done('Periodo cerrado.'); this.changed.emit(); },
      error: () => this.fail('No se pudo cerrar el periodo.')
    });
  }

  protected selectDetail(detail: PlanillaDetalle): void {
    this.busy();
    this.pagos.getDetail(detail.id).subscribe({
      next: (full) => { this.selectedDetail = full; this.bonuses = Number(full.bonificaciones); this.discounts = Number(full.descuentos); this.done(''); },
      error: () => this.fail('No se pudo consultar el detalle.')
    });
  }

  protected updateDetail(): void {
    if (!this.selectedDetail || this.selectedPeriod?.estado === 'CERRADO') return;
    this.busy();
    this.pagos.updateDetail(this.selectedDetail.id, { bonificaciones: Number(this.bonuses), descuentos: Number(this.discounts) }).subscribe({
      next: (detail) => { this.selectedDetail = detail; this.details = this.details.map((item) => item.id === detail.id ? detail : item); this.done('Detalle actualizado.'); this.changed.emit(); },
      error: () => this.fail('No se pudo actualizar el detalle.')
    });
  }

  protected cancelPayment(id: string): void {
    this.busy();
    this.pagos.cancelPayment(id).subscribe({
      next: () => { this.done('Pago anulado.'); if (this.selectedDetail) this.selectDetail(this.selectedDetail); this.changed.emit(); },
      error: () => this.fail('No se pudo anular el pago.')
    });
  }

  protected personName(detail: PlanillaDetalle): string {
    const person = detail.colaborador;
    return person ? [person.nombres, person.apellidoPaterno, person.apellidoMaterno].filter(Boolean).join(' ') : detail.colaboradorId;
  }
  protected money(value: number): string { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(Number(value) || 0); }
  protected periodLabel(period: PlanillaPeriodo): string { return new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric' }).format(new Date(Date.UTC(period.anio, period.mes - 1))); }

  private loadPeriods(): void {
    this.busy();
    this.pagos.listPeriods().subscribe({ next: ({ data }) => { this.periods = data; this.done(''); if (data[0]) this.selectPeriod(data[0]); else { this.selectedPeriod = null; this.details = []; } }, error: () => this.fail('No se pudieron cargar los periodos.') });
  }
  private loadDetails(id: string): void {
    this.pagos.getPeriodDetails(id).subscribe({ next: ({ data }) => { this.details = data; this.done(''); }, error: () => this.fail('No se pudieron cargar los detalles del periodo.') });
  }
  private busy(): void { this.isLoading = true; this.message = ''; this.errorMessage = ''; }
  private done(message: string): void { this.isLoading = false; this.message = message; this.errorMessage = ''; }
  private fail(message: string): void { this.isLoading = false; this.errorMessage = message; }
}
