import { Component, inject } from '@angular/core';
import { ColaboradoresFiltersComponent } from '../../components/colaboradores-filters/colaboradores-filters.component';
import { ColaboradoresMetricsComponent } from '../../components/colaboradores-metrics/colaboradores-metrics.component';
import { ColaboradoresTableComponent } from '../../components/colaboradores-table/colaboradores-table.component';
import { ColaboradoresService } from '../../services/colaboradores.service';

@Component({
  selector: 'app-colaboradores-page',
  imports: [ColaboradoresMetricsComponent, ColaboradoresFiltersComponent, ColaboradoresTableComponent],
  templateUrl: './colaboradores-page.component.html'
})
export class ColaboradoresPageComponent {
  private readonly colaboradoresService = inject(ColaboradoresService);

  protected readonly metrics = this.colaboradoresService.getMetrics();
  protected readonly colaboradores = this.colaboradoresService.getColaboradores();
  protected expandedId = '';
}
