import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AsistenciaRegistroEdicion } from './editar-registro-horario-modal.model';

@Component({
  selector: 'app-editar-registro-horario-modal',
  imports: [FormsModule],
  templateUrl: './editar-registro-horario-modal.component.html'
})
export class EditarRegistroHorarioModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() registro: AsistenciaRegistroEdicion | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveChanges = new EventEmitter<AsistenciaRegistroEdicion>();

  protected draft: AsistenciaRegistroEdicion | null = null;
  protected readonly tiposRegistro = ['Horas normales', 'Horas extras', 'Permiso / Descanso', 'Tarde', 'Falta', 'Sin registro'];
  protected readonly estados = ['Completo', 'Incompleto', 'Pendiente', 'Observado'];
  protected readonly lugares = ['Planta Principal - Linea de Produccion', 'Oficina Principal', 'Sucursal Norte', 'Sucursal Sur', 'Remoto', 'Sin registro'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['registro'] || changes['isOpen']) {
      this.draft = this.registro ? { ...this.registro } : null;
    }
  }

  protected save(): void {
    if (this.draft) this.saveChanges.emit(this.draft);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen) this.closeModal.emit();
  }
}
