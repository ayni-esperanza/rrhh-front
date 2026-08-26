import { Component, Input } from '@angular/core';
import { Usuario } from '../../models/usuario.model';
import { UsuariosMetrics } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-metrics',
  templateUrl: './usuarios-metrics.component.html'
})
export class UsuariosMetricsComponent {
  @Input({ required: true }) usuarios: Usuario[] = [];
  @Input() metrics: UsuariosMetrics | null = null;

  protected get total(): number { return this.metrics?.total ?? this.usuarios.length; }
  protected get activos(): number { return this.metrics?.activos ?? this.usuarios.filter((usuario) => usuario.estado === 'activo').length; }
  protected get inactivos(): number { return this.metrics?.inactivos ?? this.usuarios.filter((usuario) => usuario.estado === 'inactivo').length; }
  protected get roles(): number { return new Set(this.usuarios.map((usuario) => usuario.rol)).size; }
}
