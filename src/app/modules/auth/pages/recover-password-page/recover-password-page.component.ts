import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-recover-password-page',
  imports: [RouterLink, ReactiveFormsModule],
  template: `
    <main class="grid min-h-screen place-items-center bg-slate-100 px-4 dark:bg-slate-950">
      <form class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900" [formGroup]="form" (ngSubmit)="submit()">
        <h1 class="text-2xl font-semibold text-slate-950 dark:text-white">Recuperar contraseña</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Ingresa el correo asociado a tu cuenta.</p>
        <input class="mt-5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm dark:border-slate-700 dark:bg-slate-950" type="email" formControlName="email" autocomplete="email" placeholder="correo@empresa.com" />
        @if (message) { <p class="mt-3 text-sm text-emerald-600">{{ message }}</p> }
        @if (resetToken) { <a class="mt-3 inline-block text-sm font-bold text-emerald-700" routerLink="/auth/restablecer-password" [queryParams]="{ token: resetToken }">Continuar con el restablecimiento</a> }
        @if (error) { <p class="mt-3 text-sm text-rose-600">{{ error }}</p> }
        <button class="mt-4 h-10 w-full rounded-lg bg-emerald-600 text-sm font-bold text-white disabled:opacity-50" type="submit" [disabled]="form.invalid || loading">Enviar solicitud</button>
        <a routerLink="/auth/login" class="mt-4 inline-block text-sm font-medium text-emerald-700 dark:text-emerald-300">Volver al login</a>
      </form>
    </main>
  `
})
export class RecoverPasswordPageComponent {
  private readonly auth = inject(AuthService); private readonly fb = inject(FormBuilder);
  protected readonly form = this.fb.nonNullable.group({ email: ['', [Validators.required, Validators.email]] });
  protected loading = false; protected message = ''; protected error = '';
  protected resetToken = '';
  protected submit(): void { if (this.form.invalid) return; this.loading = true; this.error = ''; this.auth.forgotPassword(this.form.controls.email.value).subscribe({ next: (x) => { this.message = x.message; this.resetToken = x.resetToken ?? ''; this.loading = false; }, error: () => { this.error = 'No se pudo procesar la solicitud.'; this.loading = false; } }); }
}
