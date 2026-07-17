import { Component, inject } from '@angular/core';
import { AsistenciasService } from '../../services/asistencias.service';

@Component({
  selector: 'app-entrada-salida-page',
  template: `
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <table class="w-full text-left text-sm">
        <thead class="bg-slate-50 dark:bg-slate-800"><tr><th class="px-4 py-3">Colaborador</th><th class="px-4 py-3">Entrada</th><th class="px-4 py-3">Salida</th></tr></thead>
        <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
          @for (item of asistencias; track item.colaborador) {
            <tr><td class="px-4 py-3">{{ item.colaborador }}</td><td class="px-4 py-3">{{ item.entrada }}</td><td class="px-4 py-3">{{ item.salida }}</td></tr>
          }
        </tbody>
      </table>
    </section>
  `
})
export class EntradaSalidaPageComponent {
  protected readonly asistencias = inject(AsistenciasService).getAsistencias();
}