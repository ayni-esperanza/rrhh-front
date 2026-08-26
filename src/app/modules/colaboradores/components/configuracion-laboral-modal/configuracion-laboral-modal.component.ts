import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { CatalogosService } from '../../services/catalogos.service';
import { forkJoin } from 'rxjs';

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
  private readonly catalogos = inject(CatalogosService);
  @Input() isOpen = false;
  @Output() closeModal = new EventEmitter<void>();

  protected activeTab: CatalogTab = 'areas';
  protected search = '';
  protected selectedId = '';
  protected isCreating = false;
  protected savedMessage = '';
  protected errorMessage = '';
  protected isLoading = true;
  protected isSaving = false;

  protected areas: AreaItem[] = [];
  protected cargos: CargoItem[] = [];
  protected jornadas: JornadaItem[] = [];
  protected areaDraft: AreaItem = this.emptyArea();
  protected cargoDraft: CargoItem = this.emptyCargo();
  protected jornadaDraft: JornadaItem = this.emptyJornada();

  constructor() {
    forkJoin({
      areas: this.catalogos.list<AreaItem>('areas'),
      cargos: this.catalogos.list<CargoItem>('cargos'),
      jornadas: this.catalogos.list<JornadaItem>('jornadas')
    }).subscribe({
      next: ({ areas, cargos, jornadas }) => {
        this.areas = areas;
        this.cargos = cargos;
        this.jornadas = jornadas;
        this.selectInitialItem();
        this.isLoading = false;
      },
      error: () => {
        this.errorMessage = 'No se pudieron cargar los catálogos laborales.';
        this.isLoading = false;
        this.selectInitialItem();
      }
    });
  }

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
    this.errorMessage = '';
    this.isCreating = false;
    const first = tab === 'areas' ? this.areas[0] : tab === 'cargos' ? this.cargos[0] : this.jornadas[0];
    this.selectedId = first?.id ?? '';
    this.isCreating = !first;
    this.loadDraft();
  }

  protected selectItem(item: AreaItem | CargoItem | JornadaItem): void {
    this.selectedId = item.id;
    this.isCreating = false;
    this.savedMessage = '';
    this.errorMessage = '';
    this.loadDraft();
  }

  protected createItem(): void {
    this.isCreating = true;
    this.selectedId = '';
    this.savedMessage = '';
    this.errorMessage = '';
    if (this.activeTab === 'areas') this.areaDraft = this.emptyArea();
    if (this.activeTab === 'cargos') this.cargoDraft = this.emptyCargo();
    if (this.activeTab === 'jornadas') this.jornadaDraft = this.emptyJornada();
  }

  protected save(): void {
    if (!this.canSave || this.isSaving) return;
    const draft = this.activeTab === 'areas' ? this.areaDraft : this.activeTab === 'cargos' ? this.cargoDraft : this.jornadaDraft;
    const { id, ...payload } = draft;
    const creating = this.isCreating || !id;
    this.isSaving = true;
    this.errorMessage = '';
    const request = creating
      ? this.catalogos.create<typeof draft>(this.activeTab, payload)
      : this.catalogos.update<typeof draft>(this.activeTab, id, payload);
    request.subscribe({
      next: () => {
        this.isCreating = false;
        this.isSaving = false;
        this.savedMessage = creating ? 'Registro creado' : 'Cambios guardados';
        this.reloadActive();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = creating ? 'No se pudo crear el registro.' : 'No se pudieron guardar los cambios.';
      }
    });
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

  private emptyArea(): AreaItem {
    return { id: '', nombre: '', descripcion: '', activo: true };
  }

  private emptyCargo(): CargoItem {
    return { id: '', areaId: this.areas[0]?.id ?? '', nombre: '', descripcion: '', activo: true };
  }

  private emptyJornada(): JornadaItem {
    return { id: '', nombre: '', horaEntrada: '08:00', horaSalida: '17:00', inicioAlmuerzo: '13:00', finAlmuerzo: '14:00', minutosDiarios: 480, activo: true };
  }

  private reloadActive(): void {
    this.catalogos.list<AreaItem | CargoItem | JornadaItem>(this.activeTab).subscribe({
      next: (items) => {
        if (this.activeTab === 'areas') this.areas = items as AreaItem[];
        if (this.activeTab === 'cargos') this.cargos = items as CargoItem[];
        if (this.activeTab === 'jornadas') this.jornadas = items as JornadaItem[];
        this.selectedId = items[0]?.id ?? '';
        this.isCreating = !this.selectedId;
        this.loadDraft();
      },
      error: () => this.errorMessage = 'El cambio se guardó, pero no se pudo actualizar el listado.'
    });
  }

  private selectInitialItem(): void {
    const first = this.activeTab === 'areas' ? this.areas[0] : this.activeTab === 'cargos' ? this.cargos[0] : this.jornadas[0];
    this.selectedId = first?.id ?? '';
    this.isCreating = !first;
    this.loadDraft();
  }
}
