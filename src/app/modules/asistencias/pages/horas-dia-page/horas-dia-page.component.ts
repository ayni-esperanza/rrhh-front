import { Component, inject } from '@angular/core';
import { AsistenciaCelda } from '../../models/asistencia.model';
import { AsistenciasService } from '../../services/asistencias.service';

@Component({
  selector: 'app-horas-dia-page',
  template: `
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 class="text-sm font-bold text-slate-950 dark:text-white">Horas trabajadas por dia</h2>
        </div>
        <div class="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-blue-500"></span>Horas normales</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>Horas extras</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-orange-500"></span>Permiso / Descanso</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-red-500"></span>Falta</span>
        </div>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-xs">
          <thead class="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th class="w-10 px-3 py-3">#</th>
              <th class="px-3 py-3">Colaborador</th>
              @for (dia of dias; track dia.dia) {
                <th class="px-3 py-3 text-center"><span class="block">{{ dia.dia }}</span><span class="font-semibold text-slate-500">{{ dia.fecha }}</span></th>
              }
              <th class="px-3 py-3 text-center">Total<br />semana</th>
              <th class="w-10 px-3 py-3"></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-[11px] text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            @for (item of semana; track item.id) {
              <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                <td class="px-3 py-3 font-semibold text-slate-500">{{ item.id }}</td>
                <td class="px-3 py-3">
                  <div class="flex items-center gap-2">
                    <img class="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" [src]="item.avatar" [alt]="item.colaborador" />
                    <div class="min-w-0">
                      <p class="font-bold text-slate-900 dark:text-white">{{ item.colaborador }}</p>
                      <p class="text-[11px] text-slate-500">{{ item.cargo }}</p>
                    </div>
                  </div>
                </td>
                @for (dia of item.dias; track dia.dia) {
                  <td class="px-3 py-3 text-center">
                    <span class="inline-flex min-w-16 flex-col items-center rounded-md px-2 py-1 font-semibold" [class]="cellClasses(dia)">
                      <span>{{ dia.valor }}</span>
                      @if (dia.detalle) { <span class="text-[10px]">{{ dia.detalle }}</span> }
                    </span>
                  </td>
                }
                <td class="px-3 py-3 text-center font-bold text-slate-900 dark:text-white">
                  <span class="block">{{ item.total }}</span>
                  <span class="text-[10px] text-emerald-600 dark:text-emerald-300">{{ item.variacion }}</span>
                </td>
                <td class="px-3 py-3 text-center"><button class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800" type="button" aria-label="Ver detalle"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg></button></td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <footer class="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <span>Mostrando 1 a 5 de 186 colaboradores</span>
        <nav class="flex items-center gap-1.5" aria-label="Paginacion">
          <button class="h-7 w-7 rounded-md border border-slate-200 text-slate-500 dark:border-slate-800" type="button" aria-label="Pagina anterior"><svg class="mx-auto h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button>
          <button class="h-7 w-7 rounded-md border border-blue-200 bg-blue-50 font-semibold text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300" type="button">1</button>
          <button class="h-7 w-7 rounded-md border border-slate-200 dark:border-slate-800" type="button">2</button>
          <button class="h-7 w-7 rounded-md border border-slate-200 dark:border-slate-800" type="button">3</button>
          <span class="px-1">...</span>
          <button class="h-7 w-7 rounded-md border border-slate-200 dark:border-slate-800" type="button">38</button>
          <button class="h-7 w-7 rounded-md border border-slate-200 text-slate-500 dark:border-slate-800" type="button" aria-label="Pagina siguiente"><svg class="mx-auto h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button>
        </nav>
      </footer>
    </section>
  `
})
export class HorasDiaPageComponent {
  protected readonly semana = inject(AsistenciasService).getSemana();
  protected readonly dias = this.semana[0]?.dias ?? [];

  protected cellClasses(dia: AsistenciaCelda): string {
    const classes = {
      normal: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
      extra: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
      permiso: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300',
      falta: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300'
    };
    return classes[dia.tipo];
  }
}
