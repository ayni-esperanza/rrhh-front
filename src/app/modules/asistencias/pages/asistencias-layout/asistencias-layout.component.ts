import { Component, inject } from '@angular/core';
import { AsistenciaFilters, AsistenciaMetric } from '../../models/asistencia.model';
import { ElementRef, ViewChild } from '@angular/core';
import { AsistenciasService } from '../../services/asistencias.service';
import { EntradaSalidaPageComponent } from '../entrada-salida-page/entrada-salida-page.component';
import { HorasDiaPageComponent } from '../horas-dia-page/horas-dia-page.component';
import { LugarTrabajoPageComponent } from '../lugar-trabajo-page/lugar-trabajo-page.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { ConfiguracionHorasExtrasService } from '../../services/configuracion-horas-extras.service';
import { TableExportButtonsComponent } from '../../../../shared/components/table-export-buttons/table-export-buttons.component';
import { ExportTable, TableExportService } from '../../../../shared/services/table-export.service';
import { PagosEspecialesModalComponent } from './pagos-especiales-modal/pagos-especiales-modal.component';

type AsistenciaTab = 'horas-dia' | 'entrada-salida' | 'lugar-trabajo';
@Component({
  selector: 'app-asistencias-layout',
  standalone: true,
  imports: [HorasDiaPageComponent, EntradaSalidaPageComponent, LugarTrabajoPageComponent, DatePickerComponent, TableExportButtonsComponent, PagosEspecialesModalComponent],
  templateUrl: './asistencias-layout.component.html'
})
export class AsistenciasLayoutComponent {
  @ViewChild('tabStage') private tabStage?: ElementRef<HTMLElement>;
  @ViewChild(HorasDiaPageComponent) private horasDiaPage?: HorasDiaPageComponent;
  @ViewChild(EntradaSalidaPageComponent) private entradaSalidaPage?: EntradaSalidaPageComponent;
  @ViewChild(LugarTrabajoPageComponent) private lugarTrabajoPage?: LugarTrabajoPageComponent;
  private readonly tableExport = inject(TableExportService);
  private tabAnimation?: Animation;
  protected readonly metrics = inject(AsistenciasService).getMetrics();
  protected readonly monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  private readonly shortMonthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  protected activeTab: AsistenciaTab = 'horas-dia';
  protected filters: AsistenciaFilters = { search: '', range: 'semana', month: 'Mayo 2025', weekIndex: 0, dayIndex: 4, visibleWeekIndexes: [0, 1, 2, 3] };
  protected isHorasExtrasConfigOpen = false;
  protected incrementoHorasExtras = inject(ConfiguracionHorasExtrasService).getConfiguracion().incrementoPorcentual;


  protected get monthPickerValue(): string {
    const { year, monthIndex } = this.selectedMonthParts;
    return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
  }

  protected get weekLabels(): string[] {
    const { year, monthIndex } = this.selectedMonthParts;
    const totalDays = new Date(year, monthIndex + 1, 0).getDate();

    return Array.from({ length: 4 }, (_, index) => {
      const startDay = index * 7 + 1;
      const endDay = Math.min(startDay + 6, totalDays);
      return `Semana ${index + 1} (${this.formatDay(startDay)} - ${this.formatDay(endDay)} ${this.shortMonthNames[monthIndex]})`;
    });
  }

  protected get weekLabel(): string {
    return this.weekLabels[this.filters.weekIndex] ?? this.weekLabels[0];
  }

  protected setActiveTab(tab: AsistenciaTab): void {
    if (tab === this.activeTab) return;
    this.activeTab = tab;

    requestAnimationFrame(() => {
      const stage = this.tabStage?.nativeElement;
      if (!stage) return;

      this.tabAnimation?.cancel();
      this.tabAnimation = stage.animate(
        [
          { transform: 'translateY(6px)' },
          { transform: 'translateY(0)' }
        ],
        { duration: 200, easing: 'ease-out' }
      );
    });
  }

  protected exportExcel(): void {
    const table = this.currentExportTable();
    if (table) void this.tableExport.toExcel(table);
  }

  protected exportPdf(): void {
    const table = this.currentExportTable();
    if (table) void this.tableExport.toPdf(table);
  }

  protected openHorasExtrasConfig(): void {
    this.isHorasExtrasConfigOpen = true;
  }

  protected closeHorasExtrasConfig(): void {
    this.isHorasExtrasConfigOpen = false;
  }

  protected updateSearch(value: string): void {
    this.filters = { ...this.filters, search: value };
  }

  protected setRange(range: AsistenciaFilters['range']): void {
    this.filters = { ...this.filters, range };
  }

  protected setMonth(month: string): void {
    this.filters = { ...this.filters, month, weekIndex: 0, dayIndex: 0, visibleWeekIndexes: [0, 1, 2, 3] };
  }
  protected setMonthFromPicker(value: string): void {
    const [year, month] = String(value || '').split('-');
    const monthIndex = Number(month) - 1;
    if (!year || Number.isNaN(monthIndex) || monthIndex < 0 || monthIndex > 11) return;
    this.setMonth(`${this.monthNames[monthIndex]} ${year}`);
  }

  protected toggleMonthWeek(index: number): void {
    const selected = this.filters.visibleWeekIndexes;
    if (selected.includes(index) && selected.length === 1) {
      return;
    }

    const visibleWeekIndexes = selected.includes(index)
      ? selected.filter((weekIndex) => weekIndex !== index)
      : [...selected, index].sort((first, second) => first - second);

    this.filters = { ...this.filters, visibleWeekIndexes };
  }

  protected showAllMonthWeeks(): void {
    this.filters = { ...this.filters, visibleWeekIndexes: this.weekLabels.map((_, index) => index) };
  }

  protected monthWeekClasses(index: number): string {
    return this.filters.visibleWeekIndexes.includes(index)
      ? 'border-green-200 bg-green-50 font-semibold text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300'
      : 'bg-white text-slate-500 dark:bg-slate-950 dark:text-slate-400';
  }
  protected previousWeek(): void {
    this.filters = { ...this.filters, weekIndex: Math.max(0, this.filters.weekIndex - 1) };
  }

  protected nextWeek(): void {
    this.filters = { ...this.filters, weekIndex: Math.min(this.weekLabels.length - 1, this.filters.weekIndex + 1) };
  }


  private get selectedMonthParts(): { year: number; monthIndex: number } {
    const [monthName, yearText] = this.filters.month.split(' ');
    const monthIndex = this.monthNames.findIndex((month) => month.toLowerCase() === monthName?.toLowerCase());
    const year = Number(yearText);

    return {
      year: Number.isFinite(year) ? year : 2025,
      monthIndex: monthIndex >= 0 ? monthIndex : 4
    };
  }

  private currentExportTable(): ExportTable | null {
    if (this.activeTab === 'horas-dia') return this.horasDiaPage?.getExportTable() ?? null;
    if (this.activeTab === 'entrada-salida') return this.entradaSalidaPage?.getExportTable() ?? null;
    return this.lugarTrabajoPage?.getExportTable() ?? null;
  }

  private formatDay(day: number): string {
    return String(day).padStart(2, '0');
  }
  protected rangeButtonClasses(range: AsistenciaFilters['range']): string {
    return this.filters.range === range
      ? 'border-green-200 bg-green-50 font-semibold text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300'
      : 'bg-white text-slate-600 dark:bg-slate-950 dark:text-slate-300';
  }

  protected tabClasses(tab: AsistenciaTab): string {
    return this.activeTab === tab ? 'border-[#22C55E] bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300' : 'border-transparent';
  }

  protected iconPath(icon: AsistenciaMetric['icon']): string {
    const paths = {
      users: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z',
      check: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm-1.2-6.2 6-6-1.4-1.4-4.6 4.6-2.2-2.2-1.4 1.4 3.6 3.6Z',
      clock: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm1-10.4V7h-2v6h5v-2h-3Z',
      user: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 9 0 0 1 18 0H3Z',
      calendar: 'M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 8H5v10h14V10Z'
    };
    return paths[icon];
  }

  protected toneClasses(tone: AsistenciaMetric['tone']): string {
    const tones = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
      emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
      amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300',
      rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
    };
    return tones[tone];
  }
}








