import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, Input, inject } from '@angular/core';
import { EditarRegistroHorarioModalComponent } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.component';
import { AsistenciaRegistroEdicion } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.model';
import { AsistenciaFilters } from '../../models/asistencia.model';
import { AsistenciasService } from '../../services/asistencias.service';

type LugarTipo = 'principal' | 'norte' | 'sur' | 'remoto' | 'vacio';

interface LugarDia {
  dia: string;
  fecha: string;
  valor: string;
  tipo: LugarTipo;
}

interface LugarSemana {
  id: number;
  colaborador: string;
  cargo: string;
  avatar: string;
  dias: LugarDia[];
}

@Component({
  selector: 'app-lugar-trabajo-page',
  imports: [EditarRegistroHorarioModalComponent, PaginacionComponent],
  template: `
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 class="text-sm font-bold text-slate-950 dark:text-white">Lugar donde esta trabajando</h2></div>
        <div class="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-blue-500"></span>Oficina Principal</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>Sucursal Norte</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-orange-500"></span>Sucursal Sur</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-purple-500"></span>Remoto</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-slate-400"></span>Sin registro</span>
        </div>
      </header>

      <div class="overflow-x-auto">
        <table [class]="tableClasses">
          <thead class="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th class="px-3 py-3">Colaborador</th>
              @for (dia of visibleDias; track dia.dia + dia.fecha) { <th class="px-3 py-3 text-center">{{ dia.dia }} {{ dia.fecha }}</th> }
              <th class="px-3 py-3 text-center">Total dias<br />registrados<br /><span class="text-[10px] text-slate-500">{{ periodLabel }}</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-[11px] text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            @for (item of paginatedRegistros; track item.id) {
              <tr class="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/50" (click)="openEditarRegistro(item, visibleItemDias(item)[0])">
                <td class="px-3 py-3"><div class="flex items-center gap-2"><img class="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" [src]="item.avatar" [alt]="item.colaborador" /><div class="min-w-0"><p class="font-bold text-slate-900 dark:text-white">{{ item.colaborador }}</p><p class="text-[11px] text-slate-500">{{ item.cargo }}</p></div></div></td>
                @for (dia of visibleItemDias(item); track dia.dia + dia.fecha) { <td class="px-3 py-3 text-center" (click)="openEditarRegistro(item, dia); $event.stopPropagation()"><span class="inline-flex min-w-20 justify-center rounded-md px-2 py-1 font-semibold" [class]="badgeClasses(dia.tipo)">{{ dia.valor }}</span></td> }
                <td class="px-3 py-3 text-center font-bold text-slate-900 dark:text-white">{{ visibleTotal(item) }}</td>
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
export class LugarTrabajoPageComponent {
  @Input() filters: AsistenciaFilters = { search: '', range: 'semana', month: 'Mayo 2025', weekIndex: 0, dayIndex: 4, visibleWeekIndexes: [0, 1, 2, 3] };

  private readonly colaboradores = inject(AsistenciasService).getMes();

  protected readonly dias = this.colaboradores[0]?.dias.map(({ dia, fecha }) => ({ dia, fecha })) ?? [];
  protected isEditModalOpen = false;
  protected selectedRegistro: AsistenciaRegistroEdicion | null = null;
  protected readonly registros: LugarSemana[] = this.colaboradores.map((item, index) => ({ id: item.id, colaborador: item.colaborador, cargo: item.cargo, avatar: item.avatar, dias: this.buildDias(index) }));

  protected paginaActual = 0;
  protected porPagina = 10;

  protected get paginationConfig(): PaginacionConfig {
    const totalElementos = this.filteredRegistros.length;
    return { paginaActual: this.paginaActual, porPagina: this.porPagina, totalElementos, totalPaginas: Math.max(1, Math.ceil(totalElementos / this.porPagina)) };
  }

  protected get tableClasses(): string {
    const monthWidths: Record<number, string> = { 1: 'min-w-[980px]', 2: 'min-w-[1500px]', 3: 'min-w-[2050px]', 4: 'min-w-[2600px]' };
    const visibleWeeks = Math.max(1, this.filters.visibleWeekIndexes.length);
    const minWidth = this.filters.range === 'mes' ? monthWidths[visibleWeeks] : this.filters.range === 'dia' ? 'min-w-[680px]' : 'min-w-[980px]';
    return `w-full ${minWidth} text-left text-xs`;
  }

  protected get periodLabel(): string {
    return this.filters.range === 'mes' ? 'Mes' : this.filters.range === 'dia' ? 'Dia' : 'Semana';
  }

  protected get visibleWeekGroups(): Array<{ label: string; colspan: number }> {
    if (this.filters.range === 'mes') {
      return this.filters.visibleWeekIndexes.map((weekIndex) => ({ label: `Semana ${weekIndex + 1}`, colspan: 7 }));
    }

    return [{ label: this.periodLabel, colspan: this.visibleDias.length }];
  }

  protected get visibleDias(): Array<{ dia: string; fecha: string }> {
    return this.sliceByRange(this.dias);
  }

  protected get filteredRegistros(): LugarSemana[] {
    const search = this.normalize(this.filters.search);
    return this.registros.filter((item) => !search || this.normalize(`${item.colaborador} ${item.cargo}`).includes(search));
  }

  protected get paginatedRegistros(): LugarSemana[] {
    const inicio = this.paginaActual * this.porPagina;
    return this.filteredRegistros.slice(inicio, inicio + this.porPagina);
  }

  protected visibleItemDias(item: LugarSemana): LugarDia[] {
    return this.sliceByRange(item.dias);
  }

  protected visibleTotal(item: LugarSemana): string {
    const registrados = this.visibleItemDias(item).filter((dia) => dia.tipo !== 'vacio').length;
    return `${registrados}/${this.visibleItemDias(item).length}`;
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }

  protected openEditarRegistro(item: LugarSemana, dia: LugarDia): void {
    const empty = dia.tipo === 'vacio';
    this.selectedRegistro = {
      colaborador: item.colaborador,
      cargo: item.cargo,
      avatar: item.avatar,
      fecha: `${dia.dia}, ${dia.fecha} de 2025`,
      entrada: empty ? '-' : '08:00 AM',
      salida: empty ? '-' : '05:15 PM',
      entradaAlmuerzo: empty ? '-' : '01:00 PM',
      salidaAlmuerzo: empty ? '-' : '02:00 PM',
      horasNormales: empty ? '-' : '8h 15m',
      horasExtras: '-',
      tipoRegistro: empty ? 'Sin registro' : 'Horas normales',
      estado: empty ? 'Incompleto' : 'Completo',
      lugar: dia.valor
    };
    this.isEditModalOpen = true;
  }

  protected closeEditarRegistro(): void {
    this.isEditModalOpen = false;
  }

  protected badgeClasses(tipo: LugarTipo): string {
    const classes = {
      principal: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
      norte: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
      sur: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300',
      remoto: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
      vacio: 'bg-transparent text-slate-500'
    };
    return classes[tipo];
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

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private buildDias(index: number): LugarDia[] {
    const places: Array<{ valor: string; tipo: LugarTipo }> = [
      { valor: 'Oficina Principal', tipo: 'principal' },
      { valor: 'Sucursal Norte', tipo: 'norte' },
      { valor: 'Sucursal Sur', tipo: 'sur' },
      { valor: 'Remoto', tipo: 'remoto' }
    ];

    return this.dias.map((dia, dayIndex) => {
      if (dayIndex % 7 >= 5) {
        return this.empty(dia.dia, dia.fecha);
      }

      const place = places[(index + dayIndex) % places.length];
      return this.place(dia.dia, dia.fecha, place.valor, place.tipo);
    });
  }

  private place(dia: string, fecha: string, valor: string, tipo: LugarTipo): LugarDia { return { dia, fecha, valor, tipo }; }
  private empty(dia: string, fecha: string): LugarDia { return { dia, fecha, valor: '-', tipo: 'vacio' }; }
}

