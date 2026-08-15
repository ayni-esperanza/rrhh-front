import { Component, inject } from '@angular/core';
import { UsuariosFiltersComponent, UsuariosFilterState } from '../../components/usuarios-filters/usuarios-filters.component';
import { UsuariosMetricsComponent } from '../../components/usuarios-metrics/usuarios-metrics.component';
import { UsuariosTableComponent } from '../../components/usuarios-table/usuarios-table.component';
import { UsuariosService } from '../../services/usuarios.service';
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
  protected usuarios = inject(UsuariosService).getUsuarios();
  protected filters: UsuariosFilterState = { search: '', rol: '', estado: '' };
  protected isUsuarioModalOpen = false;
  protected selectedUsuario: Usuario | null = null;
  protected pendingDeletion: Usuario | null = null;
  protected createdCredentials: { correo: string; password: string } | null = null;

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
    this.selectedUsuario = usuario;
    this.isUsuarioModalOpen = true;
  }

  protected closeUsuarioModal(): void {
    this.isUsuarioModalOpen = false;
    this.selectedUsuario = null;
  }

  protected saveUsuario(usuario: Usuario): void {
    if (usuario.id === 0) {
      const nextId = Math.max(0, ...this.usuarios.map((item) => item.id)) + 1;
      const password = this.generateUniquePassword();
      const createdUsuario = { ...usuario, id: nextId, password };
      this.usuarios = [createdUsuario, ...this.usuarios];
      this.isUsuarioModalOpen = false;
      this.selectedUsuario = null;
      this.createdCredentials = { correo: createdUsuario.correo, password };
      return;
    } else {
      this.usuarios = this.usuarios.map((item) => item.id === usuario.id ? usuario : item);
    }
    this.closeUsuarioModal();
  }

  protected requestDelete(usuario: Usuario): void {
    this.pendingDeletion = usuario;
  }

  protected confirmDeletion(): void {
    if (!this.pendingDeletion) return;
    this.usuarios = this.usuarios.filter((usuario) => usuario.id !== this.pendingDeletion?.id);
    this.pendingDeletion = null;
    this.closeUsuarioModal();
  }

  protected cancelDeletion(): void {
    this.pendingDeletion = null;
  }

  protected closeCredentialsModal(): void {
    this.createdCredentials = null;
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().trim();
  }

  private generateUniquePassword(): string {
    const assignedPasswords = new Set(this.usuarios.map((usuario) => usuario.password));
    let password = '';
    do {
      password = this.buildRandomPassword();
    } while (assignedPasswords.has(password));
    return password;
  }

  private buildRandomPassword(): string {
    const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
    const lower = 'abcdefghijkmnopqrstuvwxyz';
    const digits = '23456789';
    const symbols = '!@#$%&*?';
    const all = upper + lower + digits + symbols;
    const characters = [upper[this.randomIndex(upper.length)], lower[this.randomIndex(lower.length)], digits[this.randomIndex(digits.length)], symbols[this.randomIndex(symbols.length)]];
    while (characters.length < 12) characters.push(all[this.randomIndex(all.length)]);
    for (let index = characters.length - 1; index > 0; index--) {
      const target = this.randomIndex(index + 1);
      [characters[index], characters[target]] = [characters[target], characters[index]];
    }
    return characters.join('');
  }

  private randomIndex(max: number): number {
    const randomValue = new Uint32Array(1);
    crypto.getRandomValues(randomValue);
    return randomValue[0] % max;
  }
}
