import { Component, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { UsuariosFiltersComponent, UsuariosFilterState } from '../../components/usuarios-filters/usuarios-filters.component';
import { UsuariosMetricsComponent } from '../../components/usuarios-metrics/usuarios-metrics.component';
import { UsuariosTableComponent } from '../../components/usuarios-table/usuarios-table.component';
import { UsuariosMetrics, UsuariosService } from '../../services/usuarios.service';
import { Usuario } from '../../models/usuario.model';
import { UsuarioModalComponent } from '../../components/usuario-modal/usuario-modal.component';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { UsuarioCredentialsModalComponent } from '../../components/usuario-credentials-modal/usuario-credentials-modal.component';
import { CambioPaginaEvent } from '../../../../shared/components/paginacion/paginacion.component';

@Component({
  selector: 'app-usuarios-page',
  imports: [UsuariosMetricsComponent, UsuariosFiltersComponent, UsuariosTableComponent, UsuarioModalComponent, UsuarioCredentialsModalComponent, ConfirmDialogComponent],
  templateUrl: './usuarios-page.component.html'
})
export class UsuariosPageComponent implements OnDestroy {
  private readonly usuariosService = inject(UsuariosService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private filterTimer: ReturnType<typeof setTimeout> | null = null;
  protected usuarios: Usuario[] = [];
  protected filters: UsuariosFilterState = this.filtersFromUrl();
  protected page = this.positiveInteger(this.route.snapshot.queryParamMap.get('page'), 1);
  protected limit = this.allowedLimit(this.route.snapshot.queryParamMap.get('limit'));
  protected total = 0;
  protected totalPages = 1;
  protected isUsuarioModalOpen = false;
  protected selectedUsuario: Usuario | null = null;
  protected pendingDeletion: Usuario | null = null;
  protected createdCredentials: { correo: string; password: string } | null = null;
  protected metrics: UsuariosMetrics | null = null;

  constructor() { this.reload(); }

  ngOnDestroy(): void {
    if (this.filterTimer) clearTimeout(this.filterTimer);
  }

  protected get unavailableEmails(): string[] {
    return this.usuarios.filter((usuario) => usuario.id !== this.selectedUsuario?.id).map((usuario) => usuario.correo);
  }

  protected updateFilters(filters: UsuariosFilterState): void {
    this.filters = { ...filters };
    this.page = 1;
    if (this.filterTimer) clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => {
      this.syncUrl();
      this.loadUsuarios();
    }, 300);
  }

  protected updatePage(event: CambioPaginaEvent): void {
    this.page = event.pagina + 1;
    this.limit = event.porPagina;
    this.syncUrl();
    this.loadUsuarios();
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
        this.closeUsuarioModal();
        this.createdCredentials = { correo: createdUsuario.correo, password: temporaryPassword };
        this.reload();
      });
      return;
    }
    this.usuariosService.update(usuario).subscribe((updated) => {
      this.closeUsuarioModal();
      this.reload();
    });
  }

  protected requestDelete(usuario: Usuario): void {
    this.pendingDeletion = usuario;
  }

  protected confirmDeletion(): void {
    if (!this.pendingDeletion) return;
    this.usuariosService.delete(this.pendingDeletion.id).subscribe(() => {
      this.pendingDeletion = null;
      this.closeUsuarioModal();
      this.reload();
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

  protected toggleStatus(usuario: Usuario): void {
    const estado = usuario.estado === 'activo' ? 'inactivo' : 'activo';
    this.usuariosService.setStatus(usuario.id, estado).subscribe((updated) => {
      this.reload();
    });
  }

  private filtersFromUrl(): UsuariosFilterState {
    const params = this.route.snapshot.queryParamMap;
    const rol = params.get('rol');
    const estado = params.get('estado');
    return {
      search: params.get('search') ?? '',
      rol: rol === 'admin' || rol === 'rrhh' || rol === 'supervisor' || rol === 'colaborador' ? rol : '',
      estado: estado === 'activo' || estado === 'inactivo' ? estado : ''
    };
  }

  private positiveInteger(value: string | null, fallback: number): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private allowedLimit(value: string | null): number {
    const parsed = Number(value);
    return [10, 25, 50].includes(parsed) ? parsed : 10;
  }

  private syncUrl(): void {
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.filters.search.trim() || null,
        rol: this.filters.rol || null,
        estado: this.filters.estado || null,
        page: this.page > 1 ? this.page : null,
        limit: this.limit !== 10 ? this.limit : null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private loadUsuarios(): void {
    this.usuariosService.getUsuarios({
      search: this.filters.search,
      rol: this.filters.rol || undefined,
      estado: this.filters.estado ? this.filters.estado.toUpperCase() as 'ACTIVO' | 'INACTIVO' : undefined,
      page: this.page,
      limit: this.limit
    }).subscribe(({ data, meta }) => {
      this.usuarios = data;
      this.total = meta.total;
      this.totalPages = Math.max(1, meta.totalPages);
      this.page = meta.page;
    });
  }

  private reload(): void {
    this.loadUsuarios();
    this.usuariosService.getMetrics().subscribe((metrics) => this.metrics = metrics);
  }
}
