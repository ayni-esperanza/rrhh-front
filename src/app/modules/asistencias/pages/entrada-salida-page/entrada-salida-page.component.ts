import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, HostListener, Input, inject } from '@angular/core';
import { EditarRegistroHorarioModalComponent } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.component';
import { AsistenciaRegistroEdicion } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.model';
import { AsistenciaFilters } from '../../models/asistencia.model';
import { AsistenciasService } from '../../services/asistencias.service';
import { SelectboxComponent } from '../../../../shared/components/selectbox/selectbox.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { ExportPdfSection, ExportTable } from '../../../../shared/services/table-export.service';

type Turno = 'atiempo' | 'tarde' | 'falta' | 'vacio';

interface EntradaSalidaDia {
  dia: string;
  fecha: string;
  entrada: string;
  salida: string;
  turno: Turno;
}

interface EntradaSalidaSemana {
  id: number;
  colaborador: string;
  cargo: string;
  avatar: string;
  dias: EntradaSalidaDia[];
}

@Component({
  selector: 'app-entrada-salida-page',
  imports: [EditarRegistroHorarioModalComponent, PaginacionComponent, SelectboxComponent, DatePickerComponent],
  template: `
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 class="text-sm font-bold text-slate-950 dark:text-white">Hora de entrada y salida</h2></div>
        <div class="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>A tiempo</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-orange-500"></span>Tarde</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-red-500"></span>Falta</span>
        </div>
      </header>

      @if (selectedIds.size) {
        <div class="flex flex-wrap items-end gap-3 border-b border-blue-200 bg-blue-50/70 px-4 py-3 dark:border-blue-500/30 dark:bg-blue-500/10">
          <p class="mr-auto self-center text-[11px] font-bold text-blue-800 dark:text-blue-200">{{ selectedIds.size }} colaboradores seleccionados</p>
          <label class="w-36 space-y-1"><span class="text-[10px] font-bold text-slate-600 dark:text-slate-300">Hora de entrada</span><app-date-picker [value]="bulkEntrada" [timeOnly]="true" placeholder="hh:mm" inputClass="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-[11px] font-bold text-slate-700 dark:border-blue-500/30 dark:bg-slate-950 dark:text-slate-200 cursor-pointer" (valueChange)="bulkEntrada = $event" /></label>
          <label class="w-36 space-y-1"><span class="text-[10px] font-bold text-slate-600 dark:text-slate-300">Hora de salida</span><app-date-picker [value]="bulkSalida" [timeOnly]="true" placeholder="hh:mm" inputClass="h-9 w-full rounded-md border border-blue-200 bg-white px-3 text-[11px] font-bold text-slate-700 dark:border-blue-500/30 dark:bg-slate-950 dark:text-slate-200 cursor-pointer" (valueChange)="bulkSalida = $event" /></label>
          <button class="h-9 rounded-md bg-blue-600 px-4 text-[11px] font-bold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50" type="button" [disabled]="!bulkEntrada && !bulkSalida" (click)="applyBulkTimes()">Aplicar</button>
          <button class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-blue-200 bg-white text-slate-600 transition hover:text-rose-600 dark:border-blue-500/30 dark:bg-slate-950 dark:text-slate-300" type="button" aria-label="Cancelar selección" title="Cancelar selección" (click)="selectedIds.clear()"><svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg></button>
        </div>
      }

      <div class="overflow-x-auto">
        <table #selectionTable [class]="tableClasses">
          <thead class="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              <th class="w-10 px-3 py-2" rowspan="2">
                <app-selectbox [checked]="allPageRowsSelected" [indeterminate]="somePageRowsSelected" ariaLabel="Seleccionar todos los colaboradores de esta página" (checkedChange)="togglePageSelection($event)" />
              </th>
              <th class="px-3 py-2" rowspan="2">Colaborador</th>
              @for (week of visibleWeekGroups; track week.label) {
                <th class="border-l border-slate-200 px-3 py-2 text-center text-[10px] uppercase tracking-wide text-slate-500 dark:border-slate-700" [attr.colspan]="week.colspan">{{ week.label }}</th>
              }
              <th class="px-3 py-2 text-center" rowspan="2">Total horas<br /><span class="text-[10px] text-slate-500">{{ periodLabel }}</span></th>
            </tr>
            <tr>
              @for (dia of visibleDias; track dia.dia + dia.fecha) {
                <th class="px-3 py-2 text-center" colspan="2"><span class="block">{{ dia.dia }} {{ dia.fecha }}</span><span class="grid grid-cols-2 pt-2 text-[10px] font-semibold text-slate-500"><span>Entrada</span><span>Salida</span></span></th>
              }
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-[11px] text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            @for (item of paginatedRegistros; track item.id) {
              <tr class="cursor-pointer select-none" [class]="isSelected(item.id) ? 'bg-blue-50/70 dark:bg-blue-500/10' : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/50'" (mousedown)="beginRowSelection($event, item.id)" (mouseenter)="extendRowSelection(item.id)" (click)="openEditarRegistro(item, visibleItemDias(item)[0])">
                <td class="px-3 py-3" (click)="$event.stopPropagation()"><app-selectbox [checked]="isSelected(item.id)" [ariaLabel]="'Seleccionar a ' + item.colaborador" (checkedChange)="toggleRowSelection(item.id, $event)" /></td>
                <td class="px-3 py-3"><div class="flex items-center gap-2"><img class="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" [src]="item.avatar" [alt]="item.colaborador" /><div class="min-w-0"><p class="font-bold text-slate-900 dark:text-white">{{ item.colaborador }}</p><p class="text-[11px] text-slate-500">{{ item.cargo }}</p></div></div></td>
                @for (dia of visibleItemDias(item); track dia.dia + dia.fecha) {
                  @if (dia.turno === 'falta') {
                    <td class="px-2 py-3 text-center font-bold text-red-600" colspan="2" (click)="openEditarRegistro(item, dia); $event.stopPropagation()">- Falta</td>
                  } @else {
                    <td class="px-2 py-3 text-center" (click)="openEditarRegistro(item, dia); $event.stopPropagation()"><span class="inline-flex items-center gap-1.5" [class]="textClasses(dia.turno)"><span class="h-2 w-2 rounded-full" [class]="dotClasses(dia.turno)"></span>{{ dia.entrada }}</span></td>
                    <td class="px-2 py-3 text-center" (click)="openEditarRegistro(item, dia); $event.stopPropagation()"><span [class]="textClasses(dia.turno)">{{ dia.salida }}</span></td>
                  }
                }
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
export class EntradaSalidaPageComponent {
  @Input() filters: AsistenciaFilters = { search: '', range: 'semana', month: 'Mayo 2025', weekIndex: 0, dayIndex: 4, visibleWeekIndexes: [0, 1, 2, 3] };

  private readonly colaboradores = inject(AsistenciasService).getMes();

  protected readonly dias = this.colaboradores[0]?.dias.map(({ dia, fecha }) => ({ dia, fecha })) ?? [];
  protected isEditModalOpen = false;
  protected selectedRegistro: AsistenciaRegistroEdicion | null = null;
  protected readonly registros: EntradaSalidaSemana[] = this.colaboradores.map((item, index) => ({
    id: item.id,
    colaborador: item.colaborador,
    cargo: item.cargo,
    avatar: item.avatar,
    dias: this.buildDias(index)
  }));

  protected paginaActual = 0;
  protected porPagina = 10;
  protected selectedIds = new Set<number>();
  protected bulkEntrada = '';
  protected bulkSalida = '';
  private rowSelectionActive = false;
  private ignoreNextRowAction = false;
  private dragSelectionValue = false;
  private dragStartId: number | null = null;

  protected get paginationConfig(): PaginacionConfig {
    const totalElementos = this.filteredRegistros.length;
    return { paginaActual: this.paginaActual, porPagina: this.porPagina, totalElementos, totalPaginas: Math.max(1, Math.ceil(totalElementos / this.porPagina)) };
  }

  protected get tableClasses(): string {
    const monthWidths: Record<number, string> = { 1: 'min-w-[1080px]', 2: 'min-w-[2100px]', 3: 'min-w-[3200px]', 4: 'min-w-[4300px]' };
    const visibleWeeks = Math.max(1, this.filters.visibleWeekIndexes.length);
    const minWidth = this.filters.range === 'mes' ? monthWidths[visibleWeeks] : this.filters.range === 'dia' ? 'min-w-[720px]' : 'min-w-[1080px]';
    return `w-full ${minWidth} text-left text-xs`;
  }

  protected get periodLabel(): string {
    return this.filters.range === 'mes' ? 'Mes' : this.filters.range === 'dia' ? 'Dia' : 'Semana';
  }

  protected get visibleWeekGroups(): Array<{ label: string; colspan: number }> {
    if (this.filters.range === 'mes') {
      return this.filters.visibleWeekIndexes.map((weekIndex) => ({ label: `Semana ${weekIndex + 1}`, colspan: 14 }));
    }

    return [{ label: this.periodLabel, colspan: this.visibleDias.length * 2 }];
  }

  protected get visibleDias(): Array<{ dia: string; fecha: string }> {
    return this.sliceByRange(this.dias);
  }

  protected get filteredRegistros(): EntradaSalidaSemana[] {
    const search = this.normalize(this.filters.search);
    return this.registros.filter((item) => !search || this.normalize(`${item.colaborador} ${item.cargo}`).includes(search));
  }

  protected get paginatedRegistros(): EntradaSalidaSemana[] {
    const inicio = this.paginaActual * this.porPagina;
    return this.filteredRegistros.slice(inicio, inicio + this.porPagina);
  }

  protected visibleItemDias(item: EntradaSalidaSemana): EntradaSalidaDia[] {
    return this.sliceByRange(item.dias);
  }

  protected visibleTotal(item: EntradaSalidaSemana): string {
    const minutes = this.visibleItemDias(item).reduce((total, dia) => total + this.workedMinutes(dia), 0);
    return this.formatMinutes(minutes);
  }

  public getExportTable(): ExportTable {
    const visibleDays = this.visibleDias;
    const visibleRows = this.filteredRegistros;
    return {
      title: `Asistencias - Entradas y salidas (${this.filters.month})`,
      fileName: 'asistencias-entradas-salidas',
      columns: [
        { key: 'colaborador', header: 'Colaborador' }, { key: 'cargo', header: 'Cargo' },
        ...visibleDays.flatMap((dia, index) => [
          { key: `entrada${index}`, header: `Entrada ${dia.dia} ${dia.fecha}` },
          { key: `salida${index}`, header: `Salida ${dia.dia} ${dia.fecha}` }
        ]),
        { key: 'total', header: `Total ${this.periodLabel}` }
      ],
      rows: visibleRows.map((item) => ({
        colaborador: item.colaborador, cargo: item.cargo,
        ...Object.fromEntries(this.visibleItemDias(item).flatMap((dia, index) => [[`entrada${index}`, dia.entrada], [`salida${index}`, dia.salida]])),
        total: this.visibleTotal(item)
      })),
      pdfSections: this.pdfDaySections(visibleDays, visibleRows)
    };
  }

  private pdfDaySections(days: Array<{ dia: string; fecha: string }>, rows: EntradaSalidaSemana[]): ExportPdfSection[] {
    const sections: ExportPdfSection[] = [];
    for (let start = 0; start < days.length; start += 7) {
      const dayBlock = days.slice(start, start + 7);
      const firstDay = dayBlock[0];
      const lastDay = dayBlock[dayBlock.length - 1];
      sections.push({
        title: firstDay === lastDay ? `${firstDay.dia} ${firstDay.fecha}` : `Del ${firstDay.dia} ${firstDay.fecha} al ${lastDay.dia} ${lastDay.fecha}`,
        columns: [
          { key: 'colaborador', header: 'Colaborador' },
          { key: 'cargo', header: 'Cargo' },
          ...dayBlock.map((day, index) => ({ key: `dia${index}`, header: `${day.dia} ${day.fecha}\nEntrada / Salida` })),
          { key: 'total', header: `Total ${this.periodLabel}` }
        ],
        rows: rows.map((item) => ({
          colaborador: item.colaborador,
          cargo: item.cargo,
          ...Object.fromEntries(this.visibleItemDias(item).slice(start, start + 7).map((day, index) => [`dia${index}`, day.entrada === '-' && day.salida === '-' ? '-' : `${day.entrada} / ${day.salida}`])),
          total: this.visibleTotal(item)
        }))
      });
    }
    return sections;
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }

  protected openEditarRegistro(item: EntradaSalidaSemana, dia: EntradaSalidaDia): void {
    if (this.ignoreNextRowAction) return;
    const empty = dia.turno === 'falta' || dia.turno === 'vacio';
    this.selectedRegistro = {
      colaborador: item.colaborador,
      cargo: item.cargo,
      avatar: item.avatar,
      fecha: `${dia.dia}, ${dia.fecha} de 2025`,
      entrada: dia.entrada === '-' ? '-' : `${dia.entrada} AM`,
      salida: dia.salida === '-' ? '-' : `${dia.salida} PM`,
      entradaAlmuerzo: empty ? '-' : '01:00 PM',
      salidaAlmuerzo: empty ? '-' : '02:00 PM',
      horasNormales: empty ? '-' : this.visibleTotal(item),
      horasExtras: dia.turno === 'tarde' ? 'Tarde' : '-',
      tipoRegistro: dia.turno === 'tarde' ? 'Tarde' : dia.turno === 'falta' ? 'Falta' : 'Horas normales',
      estado: dia.turno === 'falta' ? 'Incompleto' : 'Completo',
      lugar: item.id % 2 === 0 ? 'Sucursal Sur' : 'Planta Principal - Linea de Produccion'
    };
    this.isEditModalOpen = true;
  }

  protected closeEditarRegistro(): void {
    this.isEditModalOpen = false;
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

  protected applyBulkTimes(): void {
    if (!this.bulkEntrada && !this.bulkSalida) return;
    this.registros.filter(({ id }) => this.selectedIds.has(id)).forEach((item) => {
      this.visibleItemDias(item).forEach((dia) => {
        if (this.bulkEntrada) dia.entrada = this.bulkEntrada;
        if (this.bulkSalida) dia.salida = this.bulkSalida;
        dia.turno = dia.entrada === '-' || dia.salida === '-' ? 'vacio' : this.isLateTime(dia.entrada) ? 'tarde' : 'atiempo';
      });
    });
    this.selectedIds.clear();
    this.bulkEntrada = '';
    this.bulkSalida = '';
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

  protected dotClasses(turno: Turno): string {
    const classes = { atiempo: 'bg-emerald-500', tarde: 'bg-orange-500', falta: 'bg-red-500', vacio: 'bg-slate-300' };
    return classes[turno];
  }

  protected textClasses(turno: Turno): string {
    const classes = { atiempo: 'text-slate-800 dark:text-slate-200', tarde: 'font-semibold text-orange-600 dark:text-orange-300', falta: 'font-semibold text-red-600 dark:text-red-300', vacio: 'text-slate-500' };
    return classes[turno];
  }

  private isLateTime(value: string): boolean {
    const [hours, minutes] = value.split(':').map(Number);
    return Number.isFinite(hours) && (hours > 8 || (hours === 8 && minutes > 0));
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

  private workedMinutes(dia: EntradaSalidaDia): number {
    if (dia.entrada === '-' || dia.salida === '-') {
      return 0;
    }

    const [entradaHora, entradaMinuto] = dia.entrada.split(':').map(Number);
    const [salidaHora, salidaMinuto] = dia.salida.split(':').map(Number);
    return (salidaHora * 60 + salidaMinuto) - (entradaHora * 60 + entradaMinuto);
  }

  private formatMinutes(totalMinutes: number): string {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private buildDias(index: number): EntradaSalidaDia[] {
    const lateDays = [[1, 10, 23], [0, 2, 8, 17], [11, 22], [3, 16, 24], [4, 15, 25]];
    const missingDays = [[6], [13, 27], [9], [20], [6]];

    return this.dias.map((dia, dayIndex) => {
      const dayOfWeek = dayIndex % 7;
      if (missingDays[index]?.includes(dayIndex)) {
        return this.missing(dia.dia, dia.fecha);
      }

      if (dayOfWeek >= 5) {
        return this.empty(dia.dia, dia.fecha);
      }

      const isLate = lateDays[index]?.includes(dayIndex);
      const entrada = isLate ? `08:${(5 + ((index + dayIndex) % 4) * 3).toString().padStart(2, '0')}` : `07:${(35 + ((index + dayIndex) % 5) * 4).toString().padStart(2, '0')}`;
      const salidaHour = isLate ? 17 : 18;
      const salidaMinute = isLate ? 35 + ((index + dayIndex) % 4) * 4 : 5 + ((index + dayIndex) % 5) * 6;
      return this.day(dia.dia, dia.fecha, entrada, `${salidaHour}:${salidaMinute.toString().padStart(2, '0')}`, isLate ? 'tarde' : 'atiempo');
    });
  }

  private day(dia: string, fecha: string, entrada: string, salida: string, turno: Turno = 'atiempo'): EntradaSalidaDia { return { dia, fecha, entrada, salida, turno }; }
  private empty(dia: string, fecha: string): EntradaSalidaDia { return { dia, fecha, entrada: '-', salida: '-', turno: 'vacio' }; }
  private missing(dia: string, fecha: string): EntradaSalidaDia { return { dia, fecha, entrada: '-', salida: '-', turno: 'falta' }; }
}

