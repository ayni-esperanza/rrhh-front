import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, ElementRef, HostListener, Input, ViewChild, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { EditarRegistroHorarioModalComponent } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.component';
import { AsistenciaRegistroEdicion } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.model';
import { AsistenciaFilters } from '../../models/asistencia.model';
import { AsistenciasService } from '../../services/asistencias.service';
import { LugarTrabajo, LugaresTrabajoService } from '../../services/lugares-trabajo.service';
import { SelectboxComponent } from '../../../../shared/components/selectbox/selectbox.component';

type LugarVista = 'tabla' | 'activos';

interface LugarDia {
  dia: string;
  fecha: string;
  valor: string;
  lugarId: string;
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
  imports: [EditarRegistroHorarioModalComponent, FormsModule, PaginacionComponent, SelectboxComponent],
  template: `
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div class="flex flex-wrap items-center gap-2">
          <h2 class="text-sm font-bold text-slate-950 dark:text-white">Lugar donde esta trabajando</h2>
          <div class="ml-0 flex h-8 overflow-hidden rounded-lg border border-slate-200 bg-slate-50 text-[11px] font-bold dark:border-slate-800 dark:bg-slate-950 sm:ml-2">
            <button class="px-3 transition" type="button" [class]="vista === 'tabla' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'" (click)="setVista('tabla')">Tabla</button>
            <button class="border-l border-slate-200 px-3 transition dark:border-slate-800" type="button" [class]="vista === 'activos' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300' : 'text-slate-600 hover:bg-white dark:text-slate-300 dark:hover:bg-slate-900'" (click)="setVista('activos')">Activos por lugar</button>
          </div>
        </div>
        <div class="flex flex-wrap items-center justify-start gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300 lg:justify-end">
          @for (lugar of visibleLegend; track lugar.id) {
            <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full" [style.backgroundColor]="lugar.color"></span>{{ lugar.nombre }}</span>
          }
          @if (hiddenLegend.length) {
            <span class="group relative">
              <button class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" type="button" aria-label="Ver leyenda">
                <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
              </button>
              <span class="absolute right-0 z-20 mt-2 hidden w-72 gap-2 rounded-lg border border-slate-200 bg-white p-3 text-[11px] font-semibold text-slate-700 shadow-xl group-hover:grid group-focus-within:grid dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 sm:grid-cols-2">
                @for (lugar of hiddenLegend; track lugar.id) {
                  <span class="inline-flex min-w-0 items-center gap-2"><span class="h-2.5 w-2.5 shrink-0 rounded-full" [style.backgroundColor]="lugar.color"></span><span class="truncate">{{ lugar.nombre }}</span></span>
                }
              </span>
            </span>
          }
          <button class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" type="button" aria-label="Gestionar lugares" title="Gestionar lugares" (click)="openGestionLugares()">
            <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
          </button>
        </div>
      </header>

      @if (vista === 'tabla') {
        <div class="overflow-x-auto">
          <table #selectionTable [class]="tableClasses">
            <thead class="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
              <tr>
                <th class="w-10 px-3 py-2" rowspan="2"><app-selectbox [checked]="allPageRowsSelected" [indeterminate]="somePageRowsSelected" ariaLabel="Seleccionar todos los colaboradores de esta página" (checkedChange)="togglePageSelection($event)" /></th>
                <th class="px-3 py-2" rowspan="2">Colaborador</th>
                @for (week of visibleWeekGroups; track week.label) { <th class="border-l border-slate-200 px-3 py-2 text-center text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-700" [attr.colspan]="week.colspan">{{ week.label }}</th> }
                <th class="px-3 py-2 text-center" rowspan="2">Total dias<br />registrados<br /><span class="text-[10px] text-slate-500">{{ periodLabel }}</span></th>
              </tr>
              <tr>
                @for (dia of visibleDias; track dia.dia + dia.fecha) { <th class="px-3 py-2 text-center"><span class="block">{{ dia.dia }}</span><span class="font-semibold text-slate-500">{{ dia.fecha }}</span></th> }
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 text-[11px] text-slate-800 dark:divide-slate-800 dark:text-slate-200">
              @for (item of paginatedRegistros; track item.id) {
                <tr class="cursor-pointer select-none" [class]="isSelected(item.id) ? 'bg-blue-50/70 dark:bg-blue-500/10' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'" (mousedown)="beginRowSelection($event, item.id)" (mouseenter)="extendRowSelection(item.id)" (click)="openEditarRegistro(item, visibleItemDias(item)[0])">
                  <td class="px-3 py-3" (click)="$event.stopPropagation()"><app-selectbox [checked]="isSelected(item.id)" [ariaLabel]="'Seleccionar a ' + item.colaborador" (checkedChange)="toggleRowSelection(item.id, $event)" /></td>
                  <td class="px-3 py-3"><div class="flex items-center gap-2"><img class="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" [src]="item.avatar" [alt]="item.colaborador" /><div class="min-w-0"><p class="font-bold text-slate-900 dark:text-white">{{ item.colaborador }}</p><p class="text-[11px] text-slate-500">{{ item.cargo }}</p></div></div></td>
                  @for (dia of visibleItemDias(item); track dia.dia + dia.fecha) { <td class="px-3 py-3 text-center" (click)="openEditarRegistro(item, dia); $event.stopPropagation()"><span class="inline-flex min-w-20 justify-center rounded-md px-2 py-1 font-semibold" [style.backgroundColor]="badgeBackground(dia)" [style.color]="badgeTextColor(dia)">{{ dia.valor }}</span></td> }
                  <td class="px-3 py-3 text-center font-bold text-slate-900 dark:text-white">{{ visibleTotal(item) }}</td>
                </tr>
              }
            </tbody>
          </table>
        </div>
        <app-paginacion [config]="paginationConfig" [opcionesPorPagina]="[10, 25, 50]" (cambioPagina)="onPageChange($event)" />
      } @else {
        @if (!selectedLugar) {
          <div class="grid gap-3 p-4 sm:grid-cols-2 xl:grid-cols-3">
            @for (resumen of activosPorLugar; track resumen.id) {
              <button class="rounded-lg border border-slate-200 bg-white p-4 text-left transition hover:border-emerald-200 hover:bg-emerald-50/30 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-emerald-500/40 dark:hover:bg-emerald-500/10" type="button" (click)="selectLugarDetalle(resumen.id)">
                <div class="flex items-start justify-between gap-3">
                  <div class="min-w-0">
                    <p class="truncate text-sm font-bold text-slate-950 dark:text-white">{{ resumen.nombre }}</p>
                    <p class="mt-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ periodLabel }}</p>
                  </div>
                  <span class="h-3 w-3 rounded-full" [style.backgroundColor]="resumen.color"></span>
                </div>
                <div class="mt-4 flex items-end justify-between gap-3">
                  <p class="text-3xl font-bold text-slate-950 dark:text-white">{{ resumen.activos }}</p>
                  <p class="text-right text-[11px] font-semibold text-slate-500 dark:text-slate-400">{{ resumen.registros }} registros activos</p>
                </div>
              </button>
            }
          </div>
        } @else {
          <div class="border-b border-slate-200 px-4 py-3 dark:border-slate-800">
            <button class="inline-flex h-8 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800" type="button" (click)="clearLugarDetalle()">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
              {{ selectedLugar.nombre }}
            </button>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full min-w-[780px] text-left text-xs">
              <thead class="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                <tr>
                  <th class="px-3 py-3">Colaborador</th>
                  <th class="px-3 py-3">Cargo</th>
                  <th class="px-3 py-3 text-center">Dias activos</th>
                  <th class="px-3 py-3">Fechas</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-200 text-[11px] text-slate-800 dark:divide-slate-800 dark:text-slate-200">
                @for (item of trabajadoresPorLugar; track item.id) {
                  <tr class="hover:bg-slate-50/70 dark:hover:bg-slate-800/50">
                    <td class="px-3 py-3"><div class="flex items-center gap-2"><img class="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" [src]="item.avatar" [alt]="item.colaborador" /><div class="min-w-0"><p class="font-bold text-slate-900 dark:text-white">{{ item.colaborador }}</p></div></div></td>
                    <td class="px-3 py-3 font-semibold text-slate-600 dark:text-slate-300">{{ item.cargo }}</td>
                    <td class="px-3 py-3 text-center font-bold text-slate-900 dark:text-white">{{ item.dias.length }}</td>
                    <td class="px-3 py-3"><div class="flex flex-wrap gap-1.5">@for (dia of item.dias; track dia.dia + dia.fecha) { <span class="inline-flex rounded-md px-2 py-1 font-semibold" [style.backgroundColor]="badgeBackground(dia)" [style.color]="badgeTextColor(dia)">{{ dia.dia }} {{ dia.fecha }}</span> }</div></td>
                  </tr>
                }
                @if (!trabajadoresPorLugar.length) {
                  <tr><td class="px-3 py-6 text-center text-[11px] font-semibold text-slate-500 dark:text-slate-400" colspan="4">Sin trabajadores activos en este lugar</td></tr>
                }
              </tbody>
            </table>
          </div>
        }
      }
    </section>

    <app-editar-registro-horario-modal [isOpen]="isEditModalOpen" [registro]="selectedRegistro" (closeModal)="closeEditarRegistro()" (saveChanges)="saveEditarRegistro($event)" />

    @if (isGestionOpen) {
      <div class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-2 backdrop-blur-sm" role="dialog" aria-modal="true" (click)="closeGestionLugares()">
        <section class="w-full max-w-xl rounded-xl bg-white p-4 shadow-2xl dark:bg-slate-900" (click)="$event.stopPropagation()">
          <header class="flex items-start justify-between gap-3">
            <div>
              <h3 class="text-base font-bold text-slate-950 dark:text-white">Gestionar lugares</h3>
              <p class="mt-0.5 text-[11px] font-semibold text-slate-500 dark:text-slate-400">Agrega, edita o elimina lugares para los combo box.</p>
            </div>
            <button class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" type="button" aria-label="Cerrar gestion" (click)="closeGestionLugares()">
              <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            </button>
          </header>

          <form class="mt-4 grid gap-2 sm:grid-cols-[1fr_5rem_auto]" (ngSubmit)="saveLugar()">
            <label class="space-y-1">
              <span class="text-[11px] font-bold text-slate-800 dark:text-slate-200">Lugar</span>
              <input class="h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-[11px] font-bold text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-100 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:focus:ring-blue-500/20" type="text" name="lugarNombre" [(ngModel)]="lugarForm.nombre" placeholder="Nombre del lugar" />
            </label>
            <label class="space-y-1">
              <span class="text-[11px] font-bold text-slate-800 dark:text-slate-200">Color</span>
              <input class="h-9 w-full rounded-lg border border-slate-200 bg-white px-2 dark:border-slate-800 dark:bg-slate-950" type="color" name="lugarColor" [(ngModel)]="lugarForm.color" />
            </label>
            <button class="mt-5 h-9 rounded-lg bg-[#22C55E] px-4 text-[11px] font-bold text-white shadow-sm transition hover:bg-[#22C55E]" type="submit">{{ editingLugarId ? 'Guardar' : 'Agregar' }}</button>
          </form>

          <div class="mt-4 max-h-72 overflow-y-auto rounded-lg border border-slate-200 dark:border-slate-800">
            @for (lugar of lugares; track lugar.id) {
              <div class="flex items-center gap-3 border-b border-slate-200 px-3 py-2 last:border-b-0 dark:border-slate-800">
                <span class="h-3 w-3 shrink-0 rounded-full" [style.backgroundColor]="lugar.color"></span>
                <span class="min-w-0 flex-1 truncate text-[11px] font-bold text-slate-800 dark:text-slate-200">{{ lugar.nombre }}</span>
                <button class="inline-flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" type="button" aria-label="Editar lugar" [disabled]="lugar.locked" (click)="editLugar(lugar)">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
                </button>
                <button class="inline-flex h-7 w-7 items-center justify-center rounded-md text-rose-500 transition hover:bg-rose-50 hover:text-rose-700 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-rose-500/10" type="button" aria-label="Eliminar lugar" [disabled]="lugar.locked" (click)="removeLugar(lugar)">
                  <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M3 6h18"/><path d="M8 6V4h8v2"/><path d="M19 6l-1 14H6L5 6"/></svg>
                </button>
              </div>
            }
          </div>
        </section>
      </div>
    }
  `
})
export class LugarTrabajoPageComponent {
  @Input() filters: AsistenciaFilters = { search: '', range: 'semana', month: 'Mayo 2025', weekIndex: 0, dayIndex: 4, visibleWeekIndexes: [0, 1, 2, 3] };

  private readonly colaboradores = inject(AsistenciasService).getMes();
  private readonly lugaresService = inject(LugaresTrabajoService);

  protected readonly dias = this.colaboradores[0]?.dias.map(({ dia, fecha }) => ({ dia, fecha })) ?? [];
  protected vista: LugarVista = 'tabla';
  protected isEditModalOpen = false;
  protected isGestionOpen = false;
  protected selectedRegistro: AsistenciaRegistroEdicion | null = null;
  protected editingContext: { itemId: number; dia: string; fecha: string } | null = null;
  protected editingLugarId: string | null = null;
  protected selectedLugarId: string | null = null;
  protected lugarForm = { nombre: '', color: '#22c55e' };
  protected readonly registros: LugarSemana[] = this.colaboradores.map((item, index) => ({ id: item.id, colaborador: item.colaborador, cargo: item.cargo, avatar: item.avatar, dias: this.buildDias(index) }));

  protected paginaActual = 0;
  protected porPagina = 10;
  protected selectedIds = new Set<number>();
  private rowSelectionActive = false;
  private ignoreNextRowAction = false;
  private dragSelectionValue = false;
  private dragStartId: number | null = null;

  @ViewChild('selectionTable') private selectionTable?: ElementRef<HTMLTableElement>;

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

  protected get lugares(): LugarTrabajo[] {
    return this.lugaresService.getLugares();
  }

  protected get visibleLegend(): LugarTrabajo[] {
    return this.lugares.slice(0, 4);
  }

  protected get hiddenLegend(): LugarTrabajo[] {
    return this.lugares.slice(4);
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

  protected get activosPorLugar(): Array<LugarTrabajo & { activos: number; registros: number }> {
    return this.lugares.map((lugar) => {
      const colaboradoresActivos = new Set<number>();
      let registros = 0;

      for (const item of this.filteredRegistros) {
        const dias = this.visibleItemDias(item).filter((dia) => dia.lugarId === lugar.id && dia.valor !== '-');
        if (dias.length) {
          colaboradoresActivos.add(item.id);
          registros += dias.length;
        }
      }

      return { ...lugar, activos: colaboradoresActivos.size, registros };
    });
  }
  protected get selectedLugar(): LugarTrabajo | null {
    return this.selectedLugarId ? this.lugares.find((lugar) => lugar.id === this.selectedLugarId) ?? null : null;
  }

  protected get trabajadoresPorLugar(): Array<LugarSemana & { dias: LugarDia[] }> {
    if (!this.selectedLugarId) return [];

    return this.filteredRegistros
      .map((item) => ({ ...item, dias: this.visibleItemDias(item).filter((dia) => dia.lugarId === this.selectedLugarId && dia.valor !== '-') }))
      .filter((item) => item.dias.length);
  }

  protected setVista(vista: LugarVista): void {
    this.vista = vista;
    if (vista !== 'activos') this.selectedLugarId = null;
  }

  protected selectLugarDetalle(lugarId: string): void {
    this.selectedLugarId = lugarId;
  }

  protected clearLugarDetalle(): void {
    this.selectedLugarId = null;
  }
  protected visibleItemDias(item: LugarSemana): LugarDia[] {
    return this.sliceByRange(item.dias);
  }

  protected visibleTotal(item: LugarSemana): string {
    const registrados = this.visibleItemDias(item).filter((dia) => dia.valor !== '-').length;
    return `${registrados}/${this.visibleItemDias(item).length}`;
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }

  protected openEditarRegistro(item: LugarSemana, dia: LugarDia): void {
    if (this.ignoreNextRowAction) return;
    const empty = dia.valor === '-';
    this.editingContext = { itemId: item.id, dia: dia.dia, fecha: dia.fecha };
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
      lugar: empty ? 'Sin registro' : dia.valor
    };
    this.isEditModalOpen = true;
  }

  protected saveEditarRegistro(registro: AsistenciaRegistroEdicion): void {
    const item = this.registros.find((registroItem) => registroItem.id === this.editingContext?.itemId);
    const dia = item?.dias.find((diaItem) => diaItem.dia === this.editingContext?.dia && diaItem.fecha === this.editingContext?.fecha);
    if (dia) {
      const lugar = this.lugaresService.findByName(registro.lugar);
      dia.valor = lugar.locked ? '-' : lugar.nombre;
      dia.lugarId = lugar.id;
    }

    this.closeEditarRegistro();
  }

  protected closeEditarRegistro(): void {
    this.isEditModalOpen = false;
    this.editingContext = null;
  }

  protected isSelected(itemId: number): boolean {
    return this.selectedIds.has(itemId);
  }

  protected get allPageRowsSelected(): boolean {
    return this.paginatedRegistros.length > 0 && this.paginatedRegistros.every(({ id }) => this.isSelected(id));
  }

  protected get somePageRowsSelected(): boolean {
    return !this.allPageRowsSelected && this.paginatedRegistros.some(({ id }) => this.isSelected(id));
  }

  protected toggleRowSelection(itemId: number, isSelected: boolean): void {
    if (isSelected) this.selectedIds.add(itemId);
    else this.selectedIds.delete(itemId);
  }

  protected togglePageSelection(isSelected: boolean): void {
    this.paginatedRegistros.forEach(({ id }) => this.toggleRowSelection(id, isSelected));
  }

  protected beginRowSelection(event: MouseEvent, itemId: number): void {
    if (event.button !== 0 || this.isInteractiveTarget(event.target)) return;
    this.rowSelectionActive = true;
    this.dragStartId = itemId;
    this.dragSelectionValue = !this.isSelected(itemId);
  }

  protected extendRowSelection(itemId: number): void {
    if (!this.rowSelectionActive || this.dragStartId === null || itemId === this.dragStartId) return;
    this.ignoreNextRowAction = true;
    this.toggleRowSelection(this.dragStartId, this.dragSelectionValue);
    this.toggleRowSelection(itemId, this.dragSelectionValue);
  }

  @HostListener('document:mouseup')
  protected finishRowSelection(): void {
    this.rowSelectionActive = false;
    this.dragStartId = null;
    window.setTimeout(() => this.ignoreNextRowAction = false, 0);
  }

  @HostListener('document:click', ['$event'])
  protected clearSelectionOutsideTable(event: MouseEvent): void {
    if (!this.selectionTable?.nativeElement.contains(event.target as Node)) this.selectedIds.clear();
  }

  protected openGestionLugares(): void {
    this.resetLugarForm();
    this.isGestionOpen = true;
  }

  protected closeGestionLugares(): void {
    this.isGestionOpen = false;
    this.resetLugarForm();
  }

  protected editLugar(lugar: LugarTrabajo): void {
    if (lugar.locked) return;
    this.editingLugarId = lugar.id;
    this.lugarForm = { nombre: lugar.nombre, color: lugar.color };
  }

  protected saveLugar(): void {
    const cleanName = this.lugarForm.nombre.trim();
    if (!cleanName) return;

    const oldLugar = this.lugares.find((lugar) => lugar.id === this.editingLugarId);
    if (this.editingLugarId) {
      this.lugaresService.updateLugar(this.editingLugarId, cleanName, this.lugarForm.color);
      if (oldLugar) this.renameLugarInRegistros(oldLugar.nombre, cleanName);
    } else {
      this.lugaresService.addLugar(cleanName, this.lugarForm.color);
    }
    this.resetLugarForm();
  }

  protected removeLugar(lugar: LugarTrabajo): void {
    if (lugar.locked) return;
    const fallback = this.lugaresService.findByName('Sin registro');
    this.lugaresService.removeLugar(lugar.id);
    this.registros.forEach((item) => item.dias.forEach((dia) => {
      if (dia.lugarId === lugar.id) {
        dia.valor = '-';
        dia.lugarId = fallback.id;
      }
    }));
  }

  protected badgeBackground(dia: LugarDia): string {
    if (dia.valor === '-') return 'transparent';
    return this.colorWithAlpha(this.lugaresService.findByName(dia.valor).color, 0.14);
  }

  protected badgeTextColor(dia: LugarDia): string {
    return dia.valor === '-' ? '#64748b' : this.lugaresService.findByName(dia.valor).color;
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest('button, input, a, select, textarea, label, [data-no-row-selection]'));
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
    const places = this.lugares.filter((lugar) => !lugar.locked);

    return this.dias.map((dia, dayIndex) => {
      if (dayIndex % 7 >= 5) {
        return this.empty(dia.dia, dia.fecha);
      }

      const place = places[(index + dayIndex) % places.length];
      return this.place(dia.dia, dia.fecha, place.nombre, place.id);
    });
  }

  private renameLugarInRegistros(oldName: string, newName: string): void {
    this.registros.forEach((item) => item.dias.forEach((dia) => {
      if (dia.valor === oldName) dia.valor = newName;
    }));
  }

  private resetLugarForm(): void {
    this.editingLugarId = null;
    this.lugarForm = { nombre: '', color: '#22c55e' };
  }

  private colorWithAlpha(color: string, alpha: number): string {
    const hex = color.replace('#', '');
    const fullHex = hex.length === 3 ? hex.split('').map((char) => `${char}${char}`).join('') : hex;
    const value = Number.parseInt(fullHex, 16);
    const red = (value >> 16) & 255;
    const green = (value >> 8) & 255;
    const blue = value & 255;
    return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
  }

  private place(dia: string, fecha: string, valor: string, lugarId: string): LugarDia { return { dia, fecha, valor, lugarId }; }
  private empty(dia: string, fecha: string): LugarDia {
    const emptyLugar = this.lugaresService.findByName('Sin registro');
    return { dia, fecha, valor: '-', lugarId: emptyLugar.id };
  }
}
