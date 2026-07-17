import { Component, inject } from '@angular/core';
import { AsistenciasService } from '../../services/asistencias.service';

@Component({
  selector: 'app-lugar-trabajo-page',
  template: `
    <section class="grid gap-4 md:grid-cols-3">
      @for (item of asistencias; track item.colaborador) {
        <article class="rounded-lg border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h2 class="font-semibold">{{ item.colaborador }}</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ item.lugar }}</p>
        </article>
      }
    </section>
  `
})
export class LugarTrabajoPageComponent {
  protected readonly asistencias = inject(AsistenciasService).getAsistencias();
}