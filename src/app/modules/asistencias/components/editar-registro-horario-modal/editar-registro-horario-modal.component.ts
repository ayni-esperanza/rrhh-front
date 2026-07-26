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
  protected readonly tiposRegistro = [
    { label: 'Horas normales', color: '#3b82f6', textColor: '#1d4ed8' },
    { label: 'Horas extras', color: '#10b981', textColor: '#047857' },
    { label: 'Feriados', color: '#ff0000', textColor: '#ffffff' },
    { label: 'Permiso', color: '#06245f', textColor: '#ffffff' },
    { label: 'Vacaciones', color: '#00ff00', textColor: '#0f172a' },
    { label: 'Renuncia', color: '#806000', textColor: '#ffffff' },
    { label: 'Falta', color: '#000000', textColor: '#ffffff' },
    { label: 'Descanso medico', color: '#ffff00', textColor: '#0f172a' },
    { label: 'Mater/Pater', color: '#7b3fa1', textColor: '#ffffff' },
    { label: 'Proyecto temp.', color: '#13aee3', textColor: '#0f172a' },
    { label: 'Estudio', color: '#ffc000', textColor: '#0f172a' },
    { label: 'Descanso por h. extras', color: '#ff00df', textColor: '#ffffff' },
    { label: 'Cumpleaños', color: '#00e5e5', textColor: '#0f172a' },
    { label: 'No esta en la emp.', color: '#94a3b8', textColor: '#0f172a' }
  ];
  protected isTipoRegistroOpen = false;

  protected readonly estados = ['Completo', 'Incompleto', 'Pendiente', 'Observado'];
  protected readonly lugares = ['Planta Principal - Linea de Produccion', 'Oficina Principal', 'Sucursal Norte', 'Sucursal Sur', 'Remoto', 'Sin registro'];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['registro'] || changes['isOpen']) {
      this.draft = this.registro ? { ...this.registro } : null;
      this.isTipoRegistroOpen = false;
    }
  }

  protected get selectedTipoRegistro(): { label: string; color: string; textColor: string } {
    return this.tiposRegistro.find((tipo) => tipo.label === this.draft?.tipoRegistro) ?? this.tiposRegistro[0];
  }

  protected toggleTipoRegistro(): void {
    this.isTipoRegistroOpen = !this.isTipoRegistroOpen;
  }

  protected selectTipoRegistro(tipo: string): void {
    if (this.draft) {
      this.draft.tipoRegistro = tipo;
    }
    this.isTipoRegistroOpen = false;
  }
  protected save(): void {
    if (this.draft) this.saveChanges.emit(this.draft);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen) this.closeModal.emit();
  }
}



