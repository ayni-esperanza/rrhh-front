import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-recover-password-page',
  imports: [RouterLink],
  template: `
    <main class="grid min-h-screen place-items-center bg-slate-100 px-4 dark:bg-slate-950">
      <section class="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <h1 class="text-2xl font-semibold text-slate-950 dark:text-white">Recuperar contraseña</h1>
        <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">Esta vista queda preparada para integrarse con el backend de recuperación.</p>
        <a routerLink="/auth/login" class="mt-4 inline-block text-sm font-medium text-emerald-700 dark:text-emerald-300">Volver al login</a>
      </section>
    </main>
  `
})
export class RecoverPasswordPageComponent {}