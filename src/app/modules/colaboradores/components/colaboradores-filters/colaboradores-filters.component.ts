import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectSearchableComponent, SelectSearchableOption } from '../../../../shared/components/select-searchable/select-searchable.component';
import { TableExportButtonsComponent } from '../../../../shared/components/table-export-buttons/table-export-buttons.component';

export interface ColaboradoresFilterState {
  search: string;
  cargo: string;
  area: string;
  documento: string;
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
  imports: [SelectSearchableComponent, TableExportButtonsComponent],
  selector: 'app-colaboradores-filters',
  templateUrl: './colaboradores-filters.component.html'
})
export class ColaboradoresFiltersComponent {
  @Input({ required: true }) filters: ColaboradoresFilterState = this.emptyFilters();
  @Input() cargoOptions: readonly SelectSearchableOption[] = [];
  @Input() areaOptions: readonly SelectSearchableOption[] = [];
  @Input() documentoOptions: readonly string[] = [];
  @Input() jornadaOptions: readonly SelectSearchableOption[] = [];
  @Input() estadoCivilOptions: readonly string[] = [];
  @Input() gradoInstruccionOptions: readonly string[] = [];
  @Input() tipoSangreOptions: readonly string[] = [];
  @Input() camisaOptions: readonly string[] = [];
  @Input() pantalonOptions: readonly string[] = [];
  @Input() calzadoOptions: readonly string[] = [];
  @Input() exportDisabled = false;
  @Output() filtersChange = new EventEmitter<ColaboradoresFilterState>();
  @Output() newColaborador = new EventEmitter<void>();
  @Output() exportExcel = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();

  public isFiltersOpen = false;

  public readonly estadoOptions = ['Activo', 'Inactivo'];
  public readonly sexoOptions = ['Masculino', 'Femenino', 'No binario'];

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
      area: '',
      documento: '',
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
}




