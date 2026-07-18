import { Component, inject } from '@angular/core';
import { UsuariosFiltersComponent } from '../../components/usuarios-filters/usuarios-filters.component';
import { UsuariosMetricsComponent } from '../../components/usuarios-metrics/usuarios-metrics.component';
import { UsuariosTableComponent } from '../../components/usuarios-table/usuarios-table.component';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-page',
  imports: [UsuariosMetricsComponent, UsuariosFiltersComponent, UsuariosTableComponent],
  templateUrl: './usuarios-page.component.html'
})
export class UsuariosPageComponent {
  protected readonly usuarios = inject(UsuariosService).getUsuarios();
}
