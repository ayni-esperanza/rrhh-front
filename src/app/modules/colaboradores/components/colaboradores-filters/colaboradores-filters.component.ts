import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Colaborador } from '../../models/colaborador.model';
import { SelectSearchableComponent } from '../../../../shared/components/select-searchable/select-searchable.component';

export interface ColaboradoresFilterState {
  search: string;
  cargo: string;
  estadoCivil: string;
  estado: string;
  sexo: string;
  jornada: string;
  gradoInstruccion: string;
  tipoSangre: string;
  camisa: string;
  pantalon: string;
  calzado: string;
}

type FilterKey = keyof ColaboradoresFilterState;

@Component({
  imports: [SelectSearchableComponent],
  selector: 'app-colaboradores-filters',
  templateUrl: './colaboradores-filters.component.html'
})
export class ColaboradoresFiltersComponent {
  @Input() colaboradores: Colaborador[] = [];
  @Output() filtersChange = new EventEmitter<ColaboradoresFilterState>();
  @Output() newColaborador = new EventEmitter<void>();

  public isFiltersOpen = false;
  public filters: ColaboradoresFilterState = this.emptyFilters();

  public readonly estadoCivilOptions = ['Soltero', 'Soltera', 'Casado', 'Casada'];
  public readonly estadoOptions = ['Activo', 'Inactivo'];
  public readonly sexoOptions = ['Masculino', 'Femenino', 'No binario'];
  public readonly jornadaOptions = ['Tiempo completo', 'Medio tiempo', 'Turno nocturno'];
  public readonly gradoInstruccionOptions = ['Secundaria completa', 'Técnico', 'Tecnico', 'Universitario', 'Bachiller', 'Titulado', 'Maestría'];
  public readonly tipoSangreOptions = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  public get cargoOptions(): string[] {
    return this.uniqueOptions('cargo');
  }

  public get camisaOptions(): string[] {
    return this.uniqueTallaOptions('camisa');
  }

  public get pantalonOptions(): string[] {
    return this.uniqueTallaOptions('pantalon');
  }

  public get calzadoOptions(): string[] {
    return this.uniqueTallaOptions('calzado');
  }

  public get hasActiveFilters(): boolean {
    return Object.values(this.filters).some((value) => value.trim() !== '');
  }

  public toggleFilters(): void {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  public updateFilter(key: FilterKey, value: string): void {
    this.filters = { ...this.filters, [key]: value };
    this.filtersChange.emit(this.filters);
  }

  public clearFilters(): void {
    this.filters = this.emptyFilters();
    this.filtersChange.emit(this.filters);
  }

  private emptyFilters(): ColaboradoresFilterState {
    return {
      search: '',
      cargo: '',
      estadoCivil: '',
      estado: '',
      sexo: '',
      jornada: '',
      gradoInstruccion: '',
      tipoSangre: '',
      camisa: '',
      pantalon: '',
      calzado: ''
    };
  }

  private uniqueOptions(key: keyof Colaborador): string[] {
    return Array.from(new Set(this.colaboradores.map((item) => String(item[key] ?? '').trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }

  private uniqueTallaOptions(key: keyof Colaborador['tallas']): string[] {
    return Array.from(new Set(this.colaboradores.map((item) => item.tallas[key].trim()).filter(Boolean))).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  }
}




