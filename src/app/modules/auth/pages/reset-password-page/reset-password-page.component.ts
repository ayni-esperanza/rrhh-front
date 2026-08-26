import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink],
  template: `
    <main class="grid min-h-screen place-items-center bg-slate-100 px-4 dark:bg-slate-950">
      <form class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" [formGroup]="form" (ngSubmit)="submit()">
        <h1 class="text-2xl font-semibold text-slate-950 dark:text-white">Restablecer contraseña</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Crea una contraseña de al menos ocho caracteres.</p>
        <input class="mt-5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="password" formControlName="password" autocomplete="new-password" placeholder="Nueva contraseña" />
        <input class="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="password" formControlName="confirmation" autocomplete="new-password" placeholder="Confirmar contraseña" />
        @if (error) { <p class="mt-3 text-sm text-rose-600">{{ error }}</p> }
        <button class="mt-4 h-10 w-full rounded-lg bg-emerald-600 text-sm font-bold text-white disabled:opacity-50" type="submit" [disabled]="form.invalid || loading">{{ loading ? 'Guardando…' : 'Guardar contraseña' }}</button>
        <a routerLink="/auth/login" class="mt-4 inline-block text-sm font-medium text-emerald-700">Volver al login</a>
      </form>
    </main>
  `
})
export class ResetPasswordPageComponent {
  private readonly auth = inject(AuthService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.nonNullable.group({ password: ['', [Validators.required, Validators.minLength(8)]], confirmation: ['', Validators.required] });
  protected loading = false;
  protected error = '';

  protected submit(): void {
    const { password, confirmation } = this.form.getRawValue();
    const token = this.route.snapshot.queryParamMap.get('token') ?? '';
    if (!token) { this.error = 'El enlace de recuperación no contiene un token.'; return; }
    if (password !== confirmation) { this.error = 'Las contraseñas no coinciden.'; return; }
    this.loading = true;
    this.auth.resetPassword(token, password).subscribe({
      next: () => void this.router.navigate(['/auth/login'], { queryParams: { passwordReset: '1' } }),
      error: () => { this.loading = false; this.error = 'El enlace es inválido o ha vencido.'; }
    });
  }
}
