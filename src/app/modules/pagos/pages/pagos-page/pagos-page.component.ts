import { Component, inject } from '@angular/core';
import { PagosFiltersComponent } from '../../components/pagos-filters/pagos-filters.component';
import { PagosMetricsComponent } from '../../components/pagos-metrics/pagos-metrics.component';
import { PagosTableComponent } from '../../components/pagos-table/pagos-table.component';
import { PagosService } from '../../services/pagos.service';

@Component({
  selector: 'app-pagos-page',
  imports: [PagosMetricsComponent, PagosFiltersComponent, PagosTableComponent],
  templateUrl: './pagos-page.component.html'
})
export class PagosPageComponent {
  private readonly pagosService = inject(PagosService);

  protected readonly metrics = this.pagosService.getMetrics();
  protected readonly pagos = this.pagosService.getPagos();
}
