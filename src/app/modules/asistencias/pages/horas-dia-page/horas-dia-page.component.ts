import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, HostListener, Input, inject } from '@angular/core';
import { EditarRegistroHorarioModalComponent } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.component';
import { AsistenciaRegistroEdicion } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.model';
import { AsistenciaCelda, AsistenciaFilters, AsistenciaSemana } from '../../models/asistencia.model';
import { AsistenciasService } from '../../services/asistencias.service';
import { SelectboxComponent } from '../../../../shared/components/selectbox/selectbox.component';
import { SelectSearchableComponent } from '../../../../shared/components/select-searchable/select-searchable.component';
import { ConfiguracionHorasExtrasService } from '../../services/configuracion-horas-extras.service';

@Component({
  selector: 'app-horas-dia-page',
  imports: [EditarRegistroHorarioModalComponent, PaginacionComponent, SelectboxComponent, SelectSearchableComponent],
  template: `
    <section class="rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 class="text-sm font-bold text-slate-950 dark:text-white">Horas trabajadas por dia</h2></div>
        <div class="flex flex-wrap items-center justify-start gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-600 dark:text-slate-300 lg:justify-end">
          <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-blue-500"></span>Horas normales</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-emerald-500"></span>Horas extras</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-[#06245f]"></span>Permiso</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2.5 w-2.5 rounded-full bg-[#000000]"></span>Falta</span>
          <span class="group relative">
            <button class="inline-flex h-7 w-7 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white" type="button" aria-label="Ver leyenda">
              <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
            </button>
            <span class="absolute right-0 z-20 mt-2 hidden w-80 gap-2 rounded-lg border border-slate-200 bg-white p-3 text-[11px] font-semibold text-slate-700 shadow-xl group-hover:grid group-focus-within:grid dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 sm:grid-cols-2">
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-[#ff0000]"></span>Feriados</span>
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-emerald-400"></span>Feriado trabajado</span>

              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-[#00ff00]"></span>Vacaciones</span>
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-[#806000]"></span>Renuncia</span>
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-[#ffff00]"></span>Descanso medico</span>
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-[#7b3fa1]"></span>Mater/Pater</span>
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-[#13aee3]"></span>Proyecto temp.</span>
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-[#ffc000]"></span>Estudio</span>
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-[#ff00df]"></span>Descanso por h. extras</span>
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-[#00e5e5]"></span>Cumpleaños</span>
              <span class="inline-flex items-center gap-2"><span class="h-2.5 w-2.5 rounded-full bg-slate-400"></span>No esta en la emp.</span>
            </span>
          </span>
        </div>
      </header>
      @if (selectedIds.size) {
        <div class="flex flex-wrap items-end gap-3 border-b border-blue-200 bg-blue-50/70 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p class="mr-auto self-center text-[11px] font-bold text-blue-800 dark:text-blue-200">{{ selectedIds.size }} colaboradores seleccionados</p>
          <label class="w-full space-y-1 sm:w-56"><span class="text-[10px] font-bold text-slate-600 dark:text-slate-300">Tipo de registro</span><app-select-searchable [value]="bulkTipoRegistro" [options]="tipoRegistroOptions" placeholder="Seleccionar tipo" [allowEmpty]="false" buttonClass="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-[11px] font-bold text-slate-700 dark:border-blue-500/30 dark:bg-slate-950 dark:text-slate-200" (valueChange)="setBulkTipoRegistro($any($event))" /></label>
          @if (bulkTipoRegistro === 'Horas extras') {
            <label class="w-full space-y-1 sm:w-44"><span class="text-[10px] font-bold text-slate-600 dark:text-slate-300">Cantidad de horas extras</span><app-select-searchable [value]="bulkHorasExtras" [options]="horasExtrasOptions" placeholder="Seleccionar cantidad" [allowEmpty]="false" buttonClass="h-9 w-full rounded-md border border-emerald-200 bg-white px-3 text-[11px] font-bold text-emerald-700 dark:border-emerald-500/30 dark:bg-slate-950 dark:text-emerald-300" (valueChange)="bulkHorasExtras = $any($event)" /></label>
          }
          @if (bulkTipoRegistro === 'Feriados') {
            <label class="flex h-9 cursor-pointer items-center gap-2 self-end rounded-md border border-red-200 bg-white px-3 text-[11px] font-bold text-red-700 dark:border-red-500/30 dark:bg-slate-950 dark:text-red-300"><app-selectbox [checked]="bulkFeriadoTrabajado" ariaLabel="Marcar como feriado trabajado" (checkedChange)="bulkFeriadoTrabajado = $event" />Feriado trabajado</label>
          }
          <button class="h-9 rounded-md bg-blue-600 px-4 text-[11px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" type="button" [disabled]="!bulkTipoRegistro || (bulkTipoRegistro === 'Horas extras' && !bulkHorasExtras)" (click)="applyBulkTipoRegistro()">Aplicar</button>
          <button class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-blue-200 bg-white text-slate-600 transition hover:text-rose-600 dark:border-blue-500/30 dark:bg-slate-950 dark:text-slate-300" type="button" aria-label="Cancelar selección" title="Cancelar selección" (click)="selectedIds.clear()"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
      }
      <div class="overflow-x-auto">
        <table #selectionTable [class]="tableClasses">
          <thead class="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr><th class="w-10 px-3 py-2" rowspan="2"><app-selectbox [checked]="allPageRowsSelected" [indeterminate]="somePageRowsSelected" ariaLabel="Seleccionar todos los colaboradores de esta página" (checkedChange)="togglePageSelection($event)" /></th><th class="px-3 py-2" rowspan="2">Colaborador</th>@for (week of visibleWeekGroups; track week.label) {<th class="border-l border-slate-200 px-3 py-2 text-center text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-700" [attr.colspan]="week.colspan">{{ week.label }}</th>}<th class="px-3 py-2 text-center" rowspan="2">Total<br />{{ periodLabel }}</th></tr><tr>@for (dia of visibleDias; track dia.dia + dia.fecha) {<th class="px-3 py-2 text-center"><span class="block">{{ dia.dia }}</span><span class="font-semibold text-slate-500">{{ dia.fecha }}</span></th>}</tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-[11px] text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            @for (item of paginatedSemana; track item.id) {
              <tr class="cursor-pointer select-none" [class]="isSelected(item.id) ? 'bg-blue-50/70 dark:bg-blue-500/10' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'" (mousedown)="beginRowSelection($event, item.id)" (mouseenter)="extendRowSelection(item.id)" (click)="openEditarRegistro(item, visibleItemDias(item)[0])">
                <td class="px-3 py-3" (click)="$event.stopPropagation()"><app-selectbox [checked]="isSelected(item.id)" [ariaLabel]="'Seleccionar a ' + item.colaborador" (checkedChange)="toggleRowSelection(item.id, $event)" /></td>
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
    <app-editar-registro-horario-modal [isOpen]="isEditModalOpen" [registro]="selectedRegistro" (closeModal)="closeEditarRegistro()" (saveChanges)="saveEditarRegistro($event)" />
  `
})
export class HorasDiaPageComponent {
  @Input() filters: AsistenciaFilters = { search: '', range: 'semana', month: 'Mayo 2025', weekIndex: 0, dayIndex: 4, visibleWeekIndexes: [0, 1, 2, 3] };

  protected readonly semana = inject(AsistenciasService).getMes();
  private readonly configuracionPagosService = inject(ConfiguracionHorasExtrasService);
  protected readonly dias = this.semana[0]?.dias ?? [];
  protected isEditModalOpen = false;
  protected selectedRegistro: AsistenciaRegistroEdicion | null = null;
  protected editingContext: { itemId: number; dia: string; fecha: string } | null = null;

  protected paginaActual = 0;
  protected porPagina = 10;
  protected selectedIds = new Set<number>();
  protected bulkTipoRegistro = '';
  protected bulkHorasExtras = '';
  protected bulkFeriadoTrabajado = false;
  protected readonly tipoRegistroOptions = ['Horas normales', 'Horas extras', 'Feriados', 'Permiso', 'Vacaciones', 'Renuncia', 'Falta', 'Descanso medico', 'Mater/Pater', 'Proyecto temp.', 'Estudio', 'Descanso por h. extras', 'Cumpleaños', 'No esta en la emp.'];
  protected readonly horasExtrasOptions = ['+30m', '+1h', '+1h 30m', '+2h', '+2h 30m', '+3h', '+4h'];
  private rowSelectionActive = false;
  private ignoreNextRowAction = false;
  private dragSelectionValue = false;
  private dragStartId: number | null = null;

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
    const minutes = this.visibleItemDias(item).reduce((total, dia) => this.isWorkedDay(dia) ? total + this.parseMinutes(dia.valor) : total, 0);
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
    if (this.ignoreNextRowAction) return;
    const blocked = !this.isWorkedDay(dia);
    this.editingContext = { itemId: item.id, dia: dia.dia, fecha: dia.fecha };
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
      horasExtras: dia.tipo === 'extra' ? dia.detalle ?? '-' : '-',
      tipoRegistro: this.tipoRegistroLabel(dia),
      feriadoTrabajado: dia.tipo === 'feriado-trabajado',
      estado: dia.tipo === 'falta' ? 'Incompleto' : 'Completo',
      lugar: item.id % 2 === 0 ? 'Sucursal Sur' : 'Planta Principal - Linea de Produccion'
    };
    this.isEditModalOpen = true;
  }

  protected saveEditarRegistro(registro: AsistenciaRegistroEdicion): void {
    if (!this.editingContext) {
      this.closeEditarRegistro();
      return;
    }

    const item = this.semana.find((semanaItem) => semanaItem.id === this.editingContext?.itemId);
    const dia = item?.dias.find((diaItem) => diaItem.dia === this.editingContext?.dia && diaItem.fecha === this.editingContext?.fecha);
    if (dia) {
      const updatedDia = this.diaFromRegistro(registro);
      dia.tipo = updatedDia.tipo;
      dia.valor = updatedDia.valor;
      if (updatedDia.detalle) {
        dia.detalle = updatedDia.detalle;
      } else {
        delete dia.detalle;
      }
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
    return this.paginatedSemana.length > 0 && this.paginatedSemana.every(({ id }) => this.isSelected(id));
  }

  protected get somePageRowsSelected(): boolean {
    return !this.allPageRowsSelected && this.paginatedSemana.some(({ id }) => this.isSelected(id));
  }

  protected toggleRowSelection(itemId: number, isSelected: boolean): void {
    if (isSelected) this.selectedIds.add(itemId);
    else this.selectedIds.delete(itemId);
  }

  protected togglePageSelection(isSelected: boolean): void {
    this.paginatedSemana.forEach(({ id }) => this.toggleRowSelection(id, isSelected));
  }

  protected setBulkTipoRegistro(value: string): void {
    this.bulkTipoRegistro = value;
    if (value !== 'Horas extras') this.bulkHorasExtras = '';
    if (value !== 'Feriados') this.bulkFeriadoTrabajado = false;
  }

  protected applyBulkTipoRegistro(): void {
    if (!this.bulkTipoRegistro || (this.bulkTipoRegistro === 'Horas extras' && !this.bulkHorasExtras)) return;
    this.semana.filter(({ id }) => this.selectedIds.has(id)).forEach((item) => {
      this.visibleItemDias(item).forEach((dia) => {
        const horasRegistradas = this.isWorkedDay(dia) ? dia.valor : '8h';
        const updatedDia = this.diaFromRegistro({ tipoRegistro: this.bulkTipoRegistro, feriadoTrabajado: this.bulkFeriadoTrabajado, horasNormales: horasRegistradas, horasExtras: this.bulkHorasExtras, entrada: '08:00', salida: '17:15' } as AsistenciaRegistroEdicion);
        dia.tipo = updatedDia.tipo;
        dia.valor = updatedDia.valor;
        if (updatedDia.detalle) dia.detalle = updatedDia.detalle;
        else delete dia.detalle;
      });
    });
    this.selectedIds.clear();
    this.bulkTipoRegistro = '';
    this.bulkHorasExtras = '';
    this.bulkFeriadoTrabajado = false;
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

  protected cellClasses(dia: AsistenciaCelda): string {
    const classes = {
      normal: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
      extra: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
      feriado: 'bg-red-50 text-red-700 dark:bg-red-500/10 dark:text-red-300',
      'feriado-trabajado': 'bg-red-50 text-red-700 ring-1 ring-inset ring-emerald-400 dark:bg-red-500/10 dark:text-red-300',
      permiso: 'bg-blue-50 text-blue-900 dark:bg-blue-500/10 dark:text-blue-300',

      vacaciones: 'bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300',
      renuncia: 'bg-amber-50 text-amber-800 dark:bg-amber-500/10 dark:text-amber-300',
      falta: 'bg-slate-100 text-slate-950 dark:bg-slate-500/15 dark:text-slate-200',
      'descanso-medico': 'bg-yellow-50 text-yellow-800 dark:bg-yellow-500/10 dark:text-yellow-300',
      'mater-pater': 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
      'proyecto-temp': 'bg-cyan-50 text-cyan-700 dark:bg-cyan-500/10 dark:text-cyan-300',
      estudio: 'bg-orange-50 text-orange-700 dark:bg-orange-500/10 dark:text-orange-300',
      'descanso-extra': 'bg-fuchsia-50 text-fuchsia-700 dark:bg-fuchsia-500/10 dark:text-fuchsia-300',
      cumpleanos: 'bg-teal-50 text-teal-700 dark:bg-teal-500/10 dark:text-teal-300',
      'no-esta': 'bg-slate-100 text-slate-600 dark:bg-slate-500/10 dark:text-slate-300'
    };
    return classes[dia.tipo];
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest('button, input, a, select, textarea, label, [data-no-row-selection]'));
  }

  private isWorkedDay(dia: AsistenciaCelda): boolean {
    return dia.tipo === 'normal' || dia.tipo === 'extra' || dia.tipo === 'feriado-trabajado';
  }

  private tipoRegistroLabel(dia: AsistenciaCelda): string {
    const labels = {
      normal: 'Horas normales',
      extra: 'Horas extras',
      feriado: 'Feriados',
      'feriado-trabajado': 'Feriados',
      permiso: 'Permiso',

      vacaciones: 'Vacaciones',
      renuncia: 'Renuncia',
      falta: 'Falta',
      'descanso-medico': 'Descanso medico',
      'mater-pater': 'Mater/Pater',
      'proyecto-temp': 'Proyecto temp.',
      estudio: 'Estudio',
      'descanso-extra': 'Descanso por h. extras',
      cumpleanos: 'Cumpleaños',
      'no-esta': 'No esta en la emp.'
    };
    return labels[dia.tipo];
  }

  private diaFromRegistro(registro: AsistenciaRegistroEdicion): Pick<AsistenciaCelda, 'tipo' | 'valor' | 'detalle'> {
    const normalHours = registro.horasNormales && registro.horasNormales !== '-' ? registro.horasNormales : '8h';
    const extraDetail = registro.horasExtras && registro.horasExtras !== '-' && registro.horasExtras !== 'Tarde' ? registro.horasExtras : '+1h';
    if (registro.tipoRegistro === 'Feriados' && registro.feriadoTrabajado) {
      return { tipo: 'feriado-trabajado', valor: normalHours, detalle: this.configuracionPagosService.getEtiquetaPagoFeriado() };
    }
    const types: Record<string, Pick<AsistenciaCelda, 'tipo' | 'valor' | 'detalle'>> = {
      'Horas normales': { tipo: 'normal', valor: normalHours },
      'Horas extras': { tipo: 'extra', valor: normalHours, detalle: extraDetail },

      Feriados: { tipo: 'feriado', valor: 'Feriado' },
      Permiso: { tipo: 'permiso', valor: 'Permiso' },
      Vacaciones: { tipo: 'vacaciones', valor: 'Vacaciones' },
      Renuncia: { tipo: 'renuncia', valor: 'Renuncia' },
      Falta: { tipo: 'falta', valor: '-' },
      'Descanso medico': { tipo: 'descanso-medico', valor: 'Desc. medico' },
      'Mater/Pater': { tipo: 'mater-pater', valor: 'Mater/Pater' },
      'Proyecto temp.': { tipo: 'proyecto-temp', valor: 'Proyecto' },
      Estudio: { tipo: 'estudio', valor: 'Estudio' },
      'Descanso por h. extras': { tipo: 'descanso-extra', valor: 'Desc. h. extras' },
      'Cumpleaños': { tipo: 'cumpleanos', valor: 'Cumpleaños' },
      'No esta en la emp.': { tipo: 'no-esta', valor: 'No esta' }
    };

    return types[registro.tipoRegistro] ?? { tipo: 'normal', valor: normalHours };
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
    const hours = Number(value.match(/(\d+)h/)?.[1] ?? 0);
    const minutes = Number(value.match(/(\d+)m/)?.[1] ?? 0);
    return hours * 60 + minutes;
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


