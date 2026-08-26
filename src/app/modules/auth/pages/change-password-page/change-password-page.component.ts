import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-change-password-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="grid min-h-screen place-items-center bg-slate-100 px-4 dark:bg-slate-950">
      <form class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" [formGroup]="form" (ngSubmit)="submit()">
        <h1 class="text-2xl font-semibold text-slate-950 dark:text-white">Cambiar contraseña</h1>
        <input class="mt-5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="password" formControlName="currentPassword" autocomplete="current-password" placeholder="Contraseña actual" />
        <input class="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="password" formControlName="newPassword" autocomplete="new-password" placeholder="Nueva contraseña" />
        <input class="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="password" formControlName="confirmation" autocomplete="new-password" placeholder="Confirmar contraseña" />
        @if (message) { <p class="mt-3 text-sm text-emerald-600">{{ message }}</p> }
        @if (error) { <p class="mt-3 text-sm text-rose-600">{{ error }}</p> }
        <button class="mt-4 h-10 w-full rounded-lg bg-emerald-600 text-sm font-bold text-white disabled:opacity-50" type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Guardando…' : 'Cambiar contraseña' }}</button>
        <a routerLink="/dashboard" class="mt-4 inline-block text-sm font-medium text-emerald-700">Volver</a>
      </form>
    </main>
  `
})
export class ChangePasswordPageComponent {
  private readonly auth = inject(AuthService);
  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.nonNullable.group({ currentPassword: ['', Validators.required], newPassword: ['', [Validators.required, Validators.minLength(8)]], confirmation: ['', Validators.required] });
  protected loading = false;
  protected error = '';
  protected message = '';

  protected submit(): void {
    const { currentPassword, newPassword, confirmation } = this.form.getRawValue();
    this.error = ''; this.message = '';
    if (newPassword !== confirmation) { this.error = 'Las contraseñas no coinciden.'; return; }
    this.loading = true;
    this.auth.changePassword(currentPassword, newPassword).subscribe({
      next: () => { this.loading = false; this.message = 'Contraseña actualizada.'; this.form.reset(); },
      error: () => { this.loading = false; this.error = 'No se pudo cambiar la contraseña.'; }
    });
  }
}
