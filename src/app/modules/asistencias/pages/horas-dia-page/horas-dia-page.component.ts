import { Component, inject } from '@angular/core';
import { AsistenciasService } from '../../services/asistencias.service';

@Component({
  selector: 'app-horas-dia-page',
  template: `
    <section class="grid gap-4 md:grid-cols-3">
      @for (item of asistencias; track item.colaborador) {
        <article class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <p class="text-sm text-slate-500 dark:text-slate-400">{{ item.fecha }}</p>
          <h2 class="mt-2 font-semibold">{{ item.colaborador }}</h2>
          <p class="mt-3 text-3xl font-semibold text-emerald-600 dark:text-emerald-400">{{ item.horasTrabajadas }} h</p>
        </article>
      }
    </section>
  `
})
export class HorasDiaPageComponent {
  protected readonly asistencias = inject(AsistenciasService).getAsistencias();
}