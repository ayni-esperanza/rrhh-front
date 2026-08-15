import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaRegistroEdicion } from './editar-registro-horario-modal.model';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { SelectSearchableComponent } from '../../../../shared/components/select-searchable/select-searchable.component';
import { LugaresTrabajoService } from '../../services/lugares-trabajo.service';
import { SelectboxComponent } from '../../../../shared/components/selectbox/selectbox.component';
import { ConfiguracionHorasExtrasService } from '../../services/configuracion-horas-extras.service';

@Component({
  selector: 'app-editar-registro-horario-modal',
  imports: [FormsModule, DatePickerComponent, SelectSearchableComponent, SelectboxComponent],
  templateUrl: './editar-registro-horario-modal.component.html'
})
export class EditarRegistroHorarioModalComponent implements OnChanges {
  private readonly lugaresTrabajoService = inject(LugaresTrabajoService);
  private readonly configuracionPagosService = inject(ConfiguracionHorasExtrasService);

  @Input() isOpen = false;
  @Input() registro: AsistenciaRegistroEdicion | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveChanges = new EventEmitter<AsistenciaRegistroEdicion>();

  protected draft: AsistenciaRegistroEdicion | null = null;
  protected readonly tipoRegistroOptions = [
    { value: 'Horas normales', label: 'Horas normales', color: '#3b82f6' },
    { value: 'Horas extras', label: 'Horas extras', color: '#10b981' },
    { value: 'Feriados', label: 'Feriados', color: '#ff0000' },
    { value: 'Permiso', label: 'Permiso', color: '#06245f' },
    { value: 'Vacaciones', label: 'Vacaciones', color: '#00ff00' },
    { value: 'Renuncia', label: 'Renuncia', color: '#806000' },
    { value: 'Falta', label: 'Falta', color: '#000000' },
    { value: 'Descanso medico', label: 'Descanso medico', color: '#ffff00' },
    { value: 'Mater/Pater', label: 'Mater/Pater', color: '#7b3fa1' },
    { value: 'Proyecto temp.', label: 'Proyecto temp.', color: '#13aee3' },
    { value: 'Estudio', label: 'Estudio', color: '#ffc000' },
    { value: 'Descanso por h. extras', label: 'Descanso por h. extras', color: '#ff00df' },
    { value: 'Cumpleaños', label: 'Cumpleaños', color: '#00e5e5' },
    { value: 'No esta en la emp.', label: 'No esta en la emp.', color: '#94a3b8' }
  ];

  protected readonly estados = ['Completo', 'Incompleto', 'Pendiente', 'Observado'];
  protected readonly horasExtrasOptions = ['+30m', '+1h', '+1h 30m', '+2h', '+2h 30m', '+3h', '+4h'];
  protected get lugares(): string[] {
    return this.lugaresTrabajoService.getOpciones();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['registro'] || changes['isOpen']) {
      this.draft = this.registro ? { ...this.registro } : null;
    }
  }

  protected timePickerValue(value: string): string {
    const normalized = String(value || '').trim();
    if (!normalized || normalized === '-') return '';

    const match12 = normalized.match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
    if (match12) {
      let hours = Number(match12[1]);
      const minutes = match12[2];
      const period = match12[3].toUpperCase();
      if (period === 'PM' && hours < 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      return `${hours.toString().padStart(2, '0')}:${minutes}`;
    }

    const match24 = normalized.match(/^(\d{1,2}):(\d{2})$/);
    if (match24) return `${match24[1].padStart(2, '0')}:${match24[2]}`;

    return '';
  }

  protected setDraftTime(field: 'entrada' | 'salida' | 'entradaAlmuerzo' | 'salidaAlmuerzo', value: string): void {
    if (!this.draft) return;
    this.draft[field] = value || '-';
    this.updateWorkedHours();
  }

  protected setTipoRegistro(tipoRegistro: string): void {
    if (!this.draft) return;
    this.draft.tipoRegistro = tipoRegistro;
    if (tipoRegistro !== 'Feriados') this.draft.feriadoTrabajado = false;
  }

  protected setFeriadoTrabajado(checked: boolean): void {
    if (!this.draft) return;
    this.draft.feriadoTrabajado = checked;
    if (checked) this.updateWorkedHours();
  }

  protected get reglaPagoFeriado(): string {
    return this.configuracionPagosService.getEtiquetaPagoFeriado();
  }
  protected save(): void {
    if (this.draft) this.saveChanges.emit(this.draft);
  }

  protected isExtraDuration(value: string): boolean {
    return this.horasExtrasOptions.includes(value);
  }

  private updateWorkedHours(): void {
    if (!this.draft) return;
    const entrada = this.toMinutes(this.draft.entrada);
    const salida = this.toMinutes(this.draft.salida);
    if (entrada === null || salida === null || salida <= entrada) {
      this.draft.horasNormales = '-';
      return;
    }

    const almuerzoEntrada = this.toMinutes(this.draft.entradaAlmuerzo);
    const almuerzoSalida = this.toMinutes(this.draft.salidaAlmuerzo);
    const descanso = almuerzoEntrada !== null && almuerzoSalida !== null && almuerzoSalida > almuerzoEntrada ? almuerzoSalida - almuerzoEntrada : 0;
    const total = Math.max(0, salida - entrada - descanso);
    const hours = Math.floor(total / 60);
    const minutes = total % 60;
    this.draft.horasNormales = minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  private toMinutes(value: string): number | null {
    const normalized = this.timePickerValue(value);
    if (!normalized) return null;
    const [hours, minutes] = normalized.split(':').map(Number);
    return hours * 60 + minutes;
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen) this.closeModal.emit();
  }
}





