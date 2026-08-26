import { Component, inject } from '@angular/core';
import { UsuariosFiltersComponent, UsuariosFilterState } from '../../components/usuarios-filters/usuarios-filters.component';
import { UsuariosMetricsComponent } from '../../components/usuarios-metrics/usuarios-metrics.component';
import { UsuariosTableComponent } from '../../components/usuarios-table/usuarios-table.component';
import { UsuariosMetrics, UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario.model';
import { UsuarioModalComponent } from '../../components/usuario-modal/usuario-modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UsuarioCredentialsModalComponent } from '../../components/usuario-credentials-modal/usuario-credentials-modal.component';

@Component({
  selector: 'app-usuarios-page',
  imports: [UsuariosMetricsComponent, UsuariosFiltersComponent, UsuariosTableComponent, UsuarioModalComponent, UsuarioCredentialsModalComponent, ConfirmDialogComponent],
  templateUrl: './usuarios-page.component.html'
})
export class UsuariosPageComponent {
  private readonly usuariosService = inject(UsuariosService);
  protected usuarios: Usuario[] = [];
  protected filters: UsuariosFilterState = { search: '', rol: '', estado: '' };
  protected isUsuarioModalOpen = false;
  protected selectedUsuario: Usuario | null = null;
  protected pendingDeletion: Usuario | null = null;
  protected createdCredentials: { correo: string; password: string } | null = null;
  protected metrics: UsuariosMetrics | null = null;

  constructor() { this.reload(); }

  protected get filteredUsuarios(): Usuario[] {
    const search = this.normalize(this.filters.search);
    return this.usuarios.filter((usuario) => {
      return (!search || this.normalize(`${usuario.nombre} ${usuario.correo}`).includes(search))
        && (!this.filters.rol || usuario.rol === this.filters.rol)
        && (!this.filters.estado || usuario.estado === this.filters.estado);
    });
  }

  protected get unavailableEmails(): string[] {
    return this.usuarios.filter((usuario) => usuario.id !== this.selectedUsuario?.id).map((usuario) => usuario.correo);
  }

  protected updateFilters(filters: UsuariosFilterState): void {
    this.filters = filters;
  }

  protected openNewUsuario(): void {
    this.selectedUsuario = null;
    this.isUsuarioModalOpen = true;
  }

  protected editUsuario(usuario: Usuario): void {
    this.usuariosService.getById(usuario.id).subscribe((detail) => { this.selectedUsuario = detail; this.isUsuarioModalOpen = true; });
  }

  protected closeUsuarioModal(): void {
    this.isUsuarioModalOpen = false;
    this.selectedUsuario = null;
  }

  protected saveUsuario(usuario: Usuario): void {
    if (!usuario.id) {
      this.usuariosService.create(usuario).subscribe(({ usuario: createdUsuario, temporaryPassword }) => {
        this.usuarios = [createdUsuario, ...this.usuarios];
        this.closeUsuarioModal();
        this.createdCredentials = { correo: createdUsuario.correo, password: temporaryPassword };
      });
      return;
    }
    this.usuariosService.update(usuario).subscribe((updated) => {
      this.usuarios = this.usuarios.map((item) => item.id === updated.id ? updated : item);
      this.closeUsuarioModal();
    });
  }

  protected requestDelete(usuario: Usuario): void {
    this.pendingDeletion = usuario;
  }

  protected confirmDeletion(): void {
    if (!this.pendingDeletion) return;
    this.usuariosService.delete(this.pendingDeletion.id).subscribe(() => {
      this.usuarios = this.usuarios.filter((usuario) => usuario.id !== this.pendingDeletion?.id);
      this.pendingDeletion = null;
      this.closeUsuarioModal();
    });
  }

  protected cancelDeletion(): void {
    this.pendingDeletion = null;
  }

  protected closeCredentialsModal(): void {
    this.createdCredentials = null;
  }

  protected resetPassword(usuario: Usuario): void {
    this.usuariosService.resetPassword(usuario.id).subscribe(({ temporaryPassword }) => {
      this.closeUsuarioModal();
      this.createdCredentials = { correo: usuario.correo, password: temporaryPassword };
    });
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private reload(): void {
    this.usuariosService.getUsuarios().subscribe((usuarios) => this.usuarios = usuarios);
    this.usuariosService.getMetrics().subscribe((metrics) => this.metrics = metrics);
  }
}
