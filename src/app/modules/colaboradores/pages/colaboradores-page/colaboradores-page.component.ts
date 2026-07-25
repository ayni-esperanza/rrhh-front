import { Component, inject } from '@angular/core';
import { ColaboradoresFiltersComponent, ColaboradoresFilterState } from '../../components/colaboradores-filters/colaboradores-filters.component';
import { ColaboradoresMetricsComponent } from '../../components/colaboradores-metrics/colaboradores-metrics.component';
import { ColaboradoresTableComponent } from '../../components/colaboradores-table/colaboradores-table.component';
import { NuevoColaboradorModalComponent } from '../../components/nuevo-colaborador-modal/nuevo-colaborador-modal.component';
import { Colaborador } from '../../models/colaborador.model';
import { ColaboradoresService } from '../../services/colaboradores.service';

@Component({
  selector: 'app-colaboradores-page',
  imports: [ColaboradoresMetricsComponent, ColaboradoresFiltersComponent, ColaboradoresTableComponent, NuevoColaboradorModalComponent],
  templateUrl: './colaboradores-page.component.html'
})
export class ColaboradoresPageComponent {
  private readonly colaboradoresService = inject(ColaboradoresService);

  protected readonly metrics = this.colaboradoresService.getMetrics();
  protected colaboradores = this.colaboradoresService.getColaboradores();
  protected filters: ColaboradoresFilterState = this.emptyFilters();
  protected expandedId = '';
  protected isNewColaboradorModalOpen = false;
  protected selectedColaborador: Colaborador | null = null;

  protected get filteredColaboradores(): Colaborador[] {
    const search = this.normalize(this.filters.search);
    return this.colaboradores.filter((colaborador) => {
      const matchesSearch = !search || this.normalize([
        colaborador.nombre,
        colaborador.apellido,
        colaborador.dni,
        colaborador.cargo,
        colaborador.correo
      ].join(' ')).includes(search);

      return matchesSearch
        && this.matchesFilter(colaborador.cargo, this.filters.cargo)
        && this.matchesFilter(colaborador.estadoCivil, this.filters.estadoCivil)
        && this.matchesFilter(colaborador.estado, this.filters.estado)
        && this.matchesFilter(colaborador.sexo ?? '', this.filters.sexo)
        && this.matchesFilter(colaborador.jornada, this.filters.jornada)
        && this.matchesFilter(colaborador.gradoInstruccion, this.filters.gradoInstruccion)
        && this.matchesFilter(colaborador.tipoSangre ?? '', this.filters.tipoSangre)
        && this.matchesFilter(colaborador.tallas.camisa, this.filters.camisa)
        && this.matchesFilter(colaborador.tallas.pantalon, this.filters.pantalon)
        && this.matchesFilter(colaborador.tallas.calzado, this.filters.calzado);
    });
  }

  protected openNewColaboradorModal(): void {
    this.selectedColaborador = null;
    this.isNewColaboradorModalOpen = true;
  }

  protected closeNewColaboradorModal(): void {
    this.isNewColaboradorModalOpen = false;
    this.selectedColaborador = null;
  }

  protected editColaborador(colaborador: Colaborador): void {
    this.selectedColaborador = colaborador;
    this.isNewColaboradorModalOpen = true;
  }

  protected updateFilters(filters: ColaboradoresFilterState): void {
    this.filters = filters;
    this.expandedId = '';
  }

  protected saveColaborador(colaborador: Colaborador): void {
    const existingIndex = this.colaboradores.findIndex((item) => item.id === colaborador.id);
    this.colaboradores = existingIndex === -1
      ? [colaborador, ...this.colaboradores]
      : this.colaboradores.map((item) => item.id === colaborador.id ? colaborador : item);
    this.expandedId = '';
    this.closeNewColaboradorModal();
  }

  private matchesFilter(value: string, filter: string): boolean {
    return !filter || value === filter;
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
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
}
