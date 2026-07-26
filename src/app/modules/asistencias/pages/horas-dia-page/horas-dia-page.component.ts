import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, Input, inject } from '@angular/core';
import { EditarRegistroHorarioModalComponent } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.component';
import { AsistenciaRegistroEdicion } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.model';
import { AsistenciaCelda, AsistenciaFilters, AsistenciaSemana } from '../../models/asistencia.model';
import { AsistenciasService } from '../../services/asistencias.service';

@Component({
  selector: 'app-horas-dia-page',
  imports: [EditarRegistroHorarioModalComponent, PaginacionComponent],
  template: `
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 class="text-sm font-bold text-slate-950 dark:text-white">Horas trabajadas por dia</h2></div>
        <div class="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-blue-500"></span>Horas normales</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>Horas extras</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-orange-500"></span>Permiso / Descanso</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-red-500"></span>Falta</span>
        </div>
      </header>
      <div class="overflow-x-auto">
        <table [class]="tableClasses">
          <thead class="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr><th class="px-3 py-2" rowspan="2">Colaborador</th>@for (week of visibleWeekGroups; track week.label) {<th class="border-l border-slate-200 px-3 py-2 text-center text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-700" [attr.colspan]="week.colspan">{{ week.label }}</th>}<th class="px-3 py-2 text-center" rowspan="2">Total<br />{{ periodLabel }}</th></tr><tr>@for (dia of visibleDias; track dia.dia + dia.fecha) {<th class="px-3 py-2 text-center"><span class="block">{{ dia.dia }}</span><span class="font-semibold text-slate-500">{{ dia.fecha }}</span></th>}</tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-[11px] text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            @for (item of paginatedSemana; track item.id) {
              <tr class="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/50" (click)="openEditarRegistro(item, visibleItemDias(item)[0])">
                <td class="px-3 py-3"><div class="flex items-center gap-2"><img class="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" [src]="item.avatar" [alt]="item.colaborador" /><div class="min-w-0"><p class="font-bold text-slate-900 dark:text-white">{{ item.colaborador }}</p><p class="text-[11px] text-slate-500">{{ item.cargo }}</p></div></div></td>
                @for (dia of visibleItemDias(item); track dia.dia + dia.fecha) {
                  <td class="px-3 py-3 text-center" (click)="openEditarRegistro(item, dia); $event.stopPropagation()"><span class="inline-flex min-w-16 flex-col items-center rounded-md px-2 py-1 font-semibold" [class]="cellClasses(dia)"><span>{{ dia.valor }}</span>@if (dia.detalle) { <span class="text-[10px]">{{ dia.detalle }}</span> }</span></td>
                }
                <td class="px-3 py-3 text-center font-bold text-slate-900 dark:text-white"><span class="block">{{ visibleTotal(item) }}</span><span class="text-[10px] text-emerald-600 dark:text-emerald-300">{{ visibleVariation(item) }}</span></td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-paginacion [config]="paginationConfig" [opcionesPorPagina]="[10, 25, 50]" (cambioPagina)="onPageChange($event)" />
    </section>
    <app-editar-registro-horario-modal [isOpen]="isEditModalOpen" [registro]="selectedRegistro" (closeModal)="closeEditarRegistro()" (saveChanges)="closeEditarRegistro()" />
  `
})
export class HorasDiaPageComponent {
  @Input() filters: AsistenciaFilters = { search: '', range: 'semana', month: 'Mayo 2025', weekIndex: 0, dayIndex: 4, visibleWeekIndexes: [0, 1, 2, 3] };

  protected readonly semana = inject(AsistenciasService).getMes();
  protected readonly dias = this.semana[0]?.dias ?? [];
  protected isEditModalOpen = false;
  protected selectedRegistro: AsistenciaRegistroEdicion | null = null;

  protected paginaActual = 0;
  protected porPagina = 10;

  protected get paginationConfig(): PaginacionConfig {
    const totalElementos = this.filteredSemana.length;
    return { paginaActual: this.paginaActual, porPagina: this.porPagina, totalElementos, totalPaginas: Math.max(1, Math.ceil(totalElementos / this.porPagina)) };
  }

  protected get tableClasses(): string {
    const monthWidths: Record<number, string> = { 1: 'min-w-[980px]', 2: 'min-w-[1400px]', 3: 'min-w-[1850px]', 4: 'min-w-[2300px]' };
    const visibleWeeks = Math.max(1, this.filters.visibleWeekIndexes.length);
    const minWidth = this.filters.range === 'mes' ? monthWidths[visibleWeeks] : this.filters.range === 'dia' ? 'min-w-[680px]' : 'min-w-[980px]';
    return `w-full ${minWidth} text-left text-xs`;
  }

  protected get periodLabel(): string {
    return this.filters.range === 'mes' ? 'mes' : this.filters.range === 'dia' ? 'dia' : 'semana';
  }

  protected get visibleWeekGroups(): Array<{ label: string; colspan: number }> {
    if (this.filters.range === 'mes') {
      return this.filters.visibleWeekIndexes.map((weekIndex) => ({ label: `Semana ${weekIndex + 1}`, colspan: 7 }));
    }

    return [{ label: this.periodLabel, colspan: this.visibleDias.length }];
  }

  protected get visibleDias(): AsistenciaCelda[] {
    return this.sliceByRange(this.dias);
  }

  protected get filteredSemana(): AsistenciaSemana[] {
    const search = this.normalize(this.filters.search);
    return this.semana.filter((item) => !search || this.normalize(`${item.colaborador} ${item.cargo}`).includes(search));
  }

  protected get paginatedSemana(): AsistenciaSemana[] {
    const inicio = this.paginaActual * this.porPagina;
    return this.filteredSemana.slice(inicio, inicio + this.porPagina);
  }

  protected visibleItemDias(item: AsistenciaSemana): AsistenciaCelda[] {
    return this.sliceByRange(item.dias);
  }

  protected visibleTotal(item: AsistenciaSemana): string {
    const minutes = this.visibleItemDias(item).reduce((total, dia) => dia.tipo === 'normal' || dia.tipo === 'extra' ? total + this.parseMinutes(dia.valor) : total, 0);
    return this.formatMinutes(minutes);
  }

  protected visibleVariation(item: AsistenciaSemana): string {
    const minutes = this.visibleItemDias(item).reduce((total, dia) => total + this.parseMinutes(dia.detalle?.replace('+', '') ?? '0h'), 0);
    return minutes ? `+${this.formatMinutes(minutes)}` : '-';
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }

  protected openEditarRegistro(item: AsistenciaSemana, dia: AsistenciaCelda): void {
    const blocked = dia.tipo === 'falta' || dia.tipo === 'permiso';
    this.selectedRegistro = {
      colaborador: item.colaborador,
      cargo: item.cargo,
      avatar: item.avatar,
      fecha: `${dia.dia}, ${dia.fecha} de 2025`,
      entrada: blocked ? '-' : '08:00 AM',
      salida: blocked ? '-' : dia.tipo === 'extra' ? '05:45 PM' : '05:15 PM',
      entradaAlmuerzo: blocked ? '-' : '01:00 PM',
      salidaAlmuerzo: blocked ? '-' : '02:00 PM',
      horasNormales: blocked ? '-' : dia.valor,
      horasExtras: dia.detalle ?? '-',
      tipoRegistro: dia.tipo === 'extra' ? 'Horas extras' : dia.tipo === 'permiso' ? 'Permiso / Descanso' : dia.tipo === 'falta' ? 'Falta' : 'Horas normales',
      estado: dia.tipo === 'falta' ? 'Incompleto' : 'Completo',
      lugar: item.id % 2 === 0 ? 'Sucursal Sur' : 'Planta Principal - Linea de Produccion'
    };
    this.isEditModalOpen = true;
  }

  protected closeEditarRegistro(): void { this.isEditModalOpen = false; }

  protected cellClasses(dia: AsistenciaCelda): string {
    const classes = { normal: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300', extra: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300', permiso: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300', falta: 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-300' };
    return classes[dia.tipo];
  }

  private sliceByRange<T>(items: T[]): T[] {
    if (this.filters.range === 'dia') {
      const monthDayIndex = this.filters.weekIndex * 7 + this.filters.dayIndex;
      return items.slice(monthDayIndex, monthDayIndex + 1);
    }

    if (this.filters.range === 'semana') {
      const start = this.filters.weekIndex * 7;
      return items.slice(start, start + 7);
    }

    return this.filters.visibleWeekIndexes.flatMap((weekIndex) => {
      const start = weekIndex * 7;
      return items.slice(start, start + 7);
    });
  }

  private parseMinutes(value: string): number {
    const match = value.match(/(\d+)h(?:\s*(\d+)m)?/);
    return match ? Number(match[1]) * 60 + Number(match[2] ?? 0) : 0;
  }

  private formatMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}

