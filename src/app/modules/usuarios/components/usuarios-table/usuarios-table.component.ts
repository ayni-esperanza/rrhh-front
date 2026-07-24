import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, Input } from '@angular/core';
import { Usuario } from '../../models/usuario.model';

@Component({
  imports: [PaginacionComponent],
  selector: 'app-usuarios-table',
  templateUrl: './usuarios-table.component.html'
})
export class UsuariosTableComponent {
  @Input({ required: true }) usuarios: Usuario[] = [];

  protected rolLabel(rol: Usuario['rol']): string {
    const labels: Record<Usuario['rol'], string> = { admin: 'Administrador', rrhh: 'RR.HH.', supervisor: 'Supervisor', colaborador: 'Colaborador' };
    return labels[rol];
  }

  protected estadoClasses(estado: Usuario['estado']): string {
    return estado === 'activo'
      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300'
      : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-300';
  }

  protected paginaActual = 0;
  protected porPagina = 10;

  protected get paginationConfig(): PaginacionConfig {
    const totalElementos = this.usuarios.length;
    return {
      paginaActual: this.paginaActual,
      porPagina: this.porPagina,
      totalElementos,
      totalPaginas: Math.max(1, Math.ceil(totalElementos / this.porPagina))
    };
  }

  protected get paginatedUsuarios(): Usuario[] {
    const inicio = this.paginaActual * this.porPagina;
    return this.usuarios.slice(inicio, inicio + this.porPagina);
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }}

