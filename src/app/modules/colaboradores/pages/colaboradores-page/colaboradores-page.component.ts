import { Component, inject } from '@angular/core';
import { ColaboradoresFiltersComponent } from '../../components/colaboradores-filters/colaboradores-filters.component';
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
  protected expandedId = '';
  protected isNewColaboradorModalOpen = false;
  protected selectedColaborador: Colaborador | null = null;

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

  protected saveColaborador(colaborador: Colaborador): void {
    const existingIndex = this.colaboradores.findIndex((item) => item.id === colaborador.id);
    this.colaboradores = existingIndex === -1
      ? [colaborador, ...this.colaboradores]
      : this.colaboradores.map((item) => item.id === colaborador.id ? colaborador : item);
    this.expandedId = '';
    this.closeNewColaboradorModal();
  }
}

