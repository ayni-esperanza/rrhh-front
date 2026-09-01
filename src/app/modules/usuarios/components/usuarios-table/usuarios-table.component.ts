import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Usuario } from '../../models/usuario.model';

@Component({
  imports: [PaginacionComponent],
  selector: 'app-usuarios-table',
  templateUrl: './usuarios-table.component.html'
})
export class UsuariosTableComponent {
  @Input({ required: true }) usuarios: Usuario[] = [];
  @Input() paginaActual = 0;
  @Input() porPagina = 10;
  @Input() totalElementos = 0;
  @Input() totalPaginas = 1;
  @Output() editUsuario = new EventEmitter<Usuario>();
  @Output() toggleStatus = new EventEmitter<Usuario>();
  @Output() pageChange = new EventEmitter<CambioPaginaEvent>();

  protected rolLabel(rol: Usuario['rol']): string {
    const labels: Record<Usuario['rol'], string> = { admin: 'Administrador', rrhh: 'RR.HH.', supervisor: 'Supervisor', colaborador: 'Colaborador' };
    return labels[rol];
  }

  protected estadoClasses(estado: Usuario['estado']): string {
    return estado === 'activo'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
  }

  protected get paginationConfig(): PaginacionConfig {
    return {
      paginaActual: this.paginaActual,
      porPagina: this.porPagina,
      totalElementos: this.totalElementos,
      totalPaginas: Math.max(1, this.totalPaginas)
    };
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.pageChange.emit(event);
  }
}

