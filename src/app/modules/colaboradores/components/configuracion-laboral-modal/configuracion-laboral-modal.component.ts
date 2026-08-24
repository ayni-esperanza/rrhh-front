import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';

type CatalogTab = 'areas' | 'cargos' | 'jornadas';

interface AreaItem {
  id: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface CargoItem {
  id: string;
  areaId: string;
  nombre: string;
  descripcion: string;
  activo: boolean;
}

interface JornadaItem {
  id: string;
  nombre: string;
  horaEntrada: string;
  horaSalida: string;
  inicioAlmuerzo: string;
  finAlmuerzo: string;
  minutosDiarios: number;
  activo: boolean;
}

@Component({
  selector: 'app-configuracion-laboral-modal',
  imports: [FormsModule, DatePickerComponent],
  templateUrl: './configuracion-laboral-modal.component.html'
})
export class ConfiguracionLaboralModalComponent {
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  protected activeTab: CatalogTab = 'areas';
  protected search = '';
  protected selectedId = 'area-1';
  protected isCreating = false;
  protected savedMessage = '';

  protected areas: AreaItem[] = [
    { id: 'area-1', nombre: 'Administración', descripcion: 'Gestión administrativa y financiera', activo: true },
    { id: 'area-2', nombre: 'Operaciones', descripcion: 'Ejecución y supervisión de operaciones', activo: true },
    { id: 'area-3', nombre: 'Mantenimiento', descripcion: 'Mantenimiento preventivo y correctivo', activo: true }
  ];

  protected cargos: CargoItem[] = [
    { id: 'cargo-1', areaId: 'area-2', nombre: 'Supervisor', descripcion: 'Supervisa al equipo operativo', activo: true },
    { id: 'cargo-2', areaId: 'area-3', nombre: 'Técnico mecánico', descripcion: 'Ejecuta trabajos de mantenimiento mecánico', activo: true },
    { id: 'cargo-3', areaId: 'area-1', nombre: 'Administrador', descripcion: 'Gestiona los procesos administrativos', activo: true }
  ];

  protected jornadas: JornadaItem[] = [
    { id: 'jornada-1', nombre: 'Tiempo completo', horaEntrada: '08:00', horaSalida: '17:00', inicioAlmuerzo: '13:00', finAlmuerzo: '14:00', minutosDiarios: 480, activo: true },
    { id: 'jornada-2', nombre: 'Medio tiempo', horaEntrada: '08:00', horaSalida: '12:00', inicioAlmuerzo: '', finAlmuerzo: '', minutosDiarios: 240, activo: true },
    { id: 'jornada-3', nombre: 'Turno nocturno', horaEntrada: '22:00', horaSalida: '06:00', inicioAlmuerzo: '02:00', finAlmuerzo: '02:30', minutosDiarios: 450, activo: false }
  ];

  protected areaDraft: AreaItem = { ...this.areas[0] };
  protected cargoDraft: CargoItem = { ...this.cargos[0] };
  protected jornadaDraft: JornadaItem = { ...this.jornadas[0] };

  protected get filteredItems(): Array<AreaItem | CargoItem | JornadaItem> {
    const term = this.search.trim().toLocaleLowerCase();
    const items = this.activeTab === 'areas' ? this.areas : this.activeTab === 'cargos' ? this.cargos : this.jornadas;
    return term ? items.filter((item) => item.nombre.toLocaleLowerCase().includes(term)) : items;
  }

  protected get activeCount(): number {
    return this.filteredItems.filter((item) => item.activo).length;
  }

  protected get selectedArea(): AreaItem | undefined {
    return this.areas.find((item) => item.id === this.cargoDraft.areaId);
  }

  protected get canSave(): boolean {
    if (this.activeTab === 'areas') return this.areaDraft.nombre.trim().length >= 2;
    if (this.activeTab === 'cargos') return this.cargoDraft.nombre.trim().length >= 2 && !!this.cargoDraft.areaId;
    return this.jornadaDraft.nombre.trim().length >= 2
      && !!this.jornadaDraft.horaEntrada
      && !!this.jornadaDraft.horaSalida
      && this.jornadaDraft.minutosDiarios > 0
      && this.jornadaDraft.minutosDiarios <= 1440;
  }

  protected tabLabel(tab: CatalogTab): string {
    return tab === 'areas' ? 'Áreas' : tab === 'cargos' ? 'Cargos' : 'Jornadas';
  }

  protected tabDescription(tab: CatalogTab): string {
    if (tab === 'areas') return 'Organiza los equipos y unidades de la empresa.';
    if (tab === 'cargos') return 'Define los puestos disponibles dentro de cada área.';
    return 'Establece las plantillas de horario que se asignarán mediante el contrato.';
  }

  protected selectTab(tab: CatalogTab): void {
    this.activeTab = tab;
    this.search = '';
    this.savedMessage = '';
    this.isCreating = false;
    const first = tab === 'areas' ? this.areas[0] : tab === 'cargos' ? this.cargos[0] : this.jornadas[0];
    this.selectedId = first?.id ?? '';
    this.loadDraft();
  }

  protected selectItem(item: AreaItem | CargoItem | JornadaItem): void {
    this.selectedId = item.id;
    this.isCreating = false;
    this.savedMessage = '';
    this.loadDraft();
  }

  protected createItem(): void {
    this.isCreating = true;
    this.selectedId = '';
    this.savedMessage = '';
    if (this.activeTab === 'areas') this.areaDraft = this.emptyArea();
    if (this.activeTab === 'cargos') this.cargoDraft = this.emptyCargo();
    if (this.activeTab === 'jornadas') this.jornadaDraft = this.emptyJornada();
  }

  protected save(): void {
    if (!this.canSave) return;
    if (this.activeTab === 'areas') this.saveArea();
    if (this.activeTab === 'cargos') this.saveCargo();
    if (this.activeTab === 'jornadas') this.saveJornada();
    this.isCreating = false;
    this.savedMessage = 'Cambios guardados localmente';
  }

  protected toggleStatus(): void {
    if (this.activeTab === 'areas') this.areaDraft.activo = !this.areaDraft.activo;
    if (this.activeTab === 'cargos') this.cargoDraft.activo = !this.cargoDraft.activo;
    if (this.activeTab === 'jornadas') this.jornadaDraft.activo = !this.jornadaDraft.activo;
    this.save();
  }

  protected close(): void {
    this.savedMessage = '';
    this.closeModal.emit();
  }

  protected areaName(areaId: string): string {
    return this.areas.find((area) => area.id === areaId)?.nombre ?? 'Sin área';
  }

  private loadDraft(): void {
    if (this.activeTab === 'areas') {
      const item = this.areas.find((area) => area.id === this.selectedId);
      this.areaDraft = item ? { ...item } : this.emptyArea();
    }
    if (this.activeTab === 'cargos') {
      const item = this.cargos.find((cargo) => cargo.id === this.selectedId);
      this.cargoDraft = item ? { ...item } : this.emptyCargo();
    }
    if (this.activeTab === 'jornadas') {
      const item = this.jornadas.find((jornada) => jornada.id === this.selectedId);
      this.jornadaDraft = item ? { ...item } : this.emptyJornada();
    }
  }

  private saveArea(): void {
    const item = { ...this.areaDraft, nombre: this.areaDraft.nombre.trim() };
    if (this.isCreating) {
      item.id = this.newId('area');
      this.areas = [item, ...this.areas];
    } else {
      this.areas = this.areas.map((area) => area.id === item.id ? item : area);
    }
    this.selectedId = item.id;
    this.areaDraft = { ...item };
  }

  private saveCargo(): void {
    const item = { ...this.cargoDraft, nombre: this.cargoDraft.nombre.trim() };
    if (this.isCreating) {
      item.id = this.newId('cargo');
      this.cargos = [item, ...this.cargos];
    } else {
      this.cargos = this.cargos.map((cargo) => cargo.id === item.id ? item : cargo);
    }
    this.selectedId = item.id;
    this.cargoDraft = { ...item };
  }

  private saveJornada(): void {
    const item = { ...this.jornadaDraft, nombre: this.jornadaDraft.nombre.trim() };
    if (this.isCreating) {
      item.id = this.newId('jornada');
      this.jornadas = [item, ...this.jornadas];
    } else {
      this.jornadas = this.jornadas.map((jornada) => jornada.id === item.id ? item : jornada);
    }
    this.selectedId = item.id;
    this.jornadaDraft = { ...item };
  }

  private emptyArea(): AreaItem {
    return { id: '', nombre: '', descripcion: '', activo: true };
  }

  private emptyCargo(): CargoItem {
    return { id: '', areaId: this.areas[0]?.id ?? '', nombre: '', descripcion: '', activo: true };
  }

  private emptyJornada(): JornadaItem {
    return { id: '', nombre: '', horaEntrada: '08:00', horaSalida: '17:00', inicioAlmuerzo: '13:00', finAlmuerzo: '14:00', minutosDiarios: 480, activo: true };
  }

  private newId(prefix: string): string {
    return `${prefix}-${Date.now()}`;
  }
}
