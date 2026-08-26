import { Component, HostListener, effect, inject, input, output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DatePickerComponent } from '../../../../../shared/components/date-picker/date-picker.component';
import {
  ConfiguracionFeriadoTrabajado,
  ConfiguracionHorasExtrasService,
  TipoPagoFeriado
} from '../../../services/configuracion-horas-extras.service';
import { FeriadosService } from '../../../services/feriados.service';

type PagosEspecialesTab = 'configuracion-pagos' | 'calendario-feriados';
type CalendarioFeriadosVista = 'mes' | 'anio';

interface DiaFeriadoLocal {
  id: string;
  nombre: string;
  fecha: string;
  activo: boolean;
  color: string;
}

interface CalendarioFeriadoCelda {
  fecha: string;
  dia: number | null;
  feriado?: DiaFeriadoLocal;
}

@Component({
  selector: 'app-pagos-especiales-modal',
  standalone: true,
  imports: [FormsModule, DatePickerComponent, ConfirmDialogComponent],
  templateUrl: './pagos-especiales-modal.component.html'
})
export class PagosEspecialesModalComponent {
  readonly isOpen = input(false);
  readonly closed = output<void>();
  readonly incrementoSaved = output<number>();

  protected readonly configuracionHorasExtrasService = inject(ConfiguracionHorasExtrasService);
  private readonly feriadosService = inject(FeriadosService);
  private readonly configuracionInicial = this.configuracionHorasExtrasService.getConfiguracion();

  protected pagosEspecialesTab: PagosEspecialesTab = 'configuracion-pagos';
  protected incrementoHorasExtras = this.configuracionInicial.incrementoPorcentual;
  protected incrementoHorasExtrasDraft = this.incrementoHorasExtras;
  protected configuracionFeriado = { ...this.configuracionInicial.feriado };
  protected feriadoTipoDraft: TipoPagoFeriado = this.configuracionFeriado.tipo;
  protected feriadoValorDraft = this.configuracionFeriado.valor;
  protected feriadoDiasBaseDraft = this.configuracionFeriado.diasBase;
  protected feriadoHorasJornadaDraft = this.configuracionFeriado.horasJornada;
  protected diaFeriadoNombreDraft = '';
  protected diaFeriadoFechaDraft = '';
  protected diaFeriadoColorDraft = '#22C55E';
  protected diaFeriadoError = '';
  protected diasFeriados: DiaFeriadoLocal[] = [];
  protected calendarioFeriadosYear = new Date().getFullYear();
  protected calendarioFeriadosMonth = new Date().getMonth();
  protected calendarioFeriadosVista: CalendarioFeriadosVista = 'mes';
  protected feriadoPendienteInactivar: DiaFeriadoLocal | null = null;
  protected feriadoSeleccionado: DiaFeriadoLocal | null = null;
  protected feriadoReglaMessage = '';
  protected remuneracionCalculo = 1500;
  protected horasCalculo = 8;
  protected montoCalculado: number | null = null;
  protected configurationMessage = '';
  protected readonly monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  protected readonly calendarWeekDays = ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'];
  protected readonly calendarWeekDaysCompact = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];
  protected readonly feriadoColorOptions = ['#22C55E', '#3B82F6', '#8B5CF6', '#F59E0B', '#EF4444', '#EC4899'];

  private wasOpen = false;

  constructor() {
    effect(() => {
      const open = this.isOpen();
      if (open && !this.wasOpen) this.prepareForOpen();
      this.wasOpen = open;
    });
  }

  protected close(): void {
    this.feriadoPendienteInactivar = null;
    this.closed.emit();
  }

  protected setPagosEspecialesTab(tab: PagosEspecialesTab): void {
    this.pagosEspecialesTab = tab;
    this.diaFeriadoError = '';
  }

  protected pagosEspecialesTabClasses(tab: PagosEspecialesTab): string {
    return this.pagosEspecialesTab === tab
      ? 'border-[#22C55E] bg-green-50 text-[#22C55E] dark:bg-[#22C55E]/10'
      : 'border-transparent text-slate-500 hover:bg-slate-50 hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white';
  }

  protected save(): void {
    if (!this.configuracionPagosValida) return;
    const saved = this.configuracionHorasExtrasService.saveConfiguracion(this.incrementoHorasExtrasDraft, this.feriadoDraft);
    this.incrementoHorasExtras = saved.incrementoPorcentual;
    this.configuracionFeriado = { ...saved.feriado };
    this.incrementoSaved.emit(this.incrementoHorasExtras);
    this.close();
  }

  protected deactivateOvertimeConfiguration(): void {
    if (!this.configuracionHorasExtrasService.hasOvertimeConfiguration()) return;
    this.configuracionHorasExtrasService.deactivateOvertime().subscribe({
      next: () => { this.incrementoHorasExtras = 0; this.incrementoHorasExtrasDraft = 0; this.configurationMessage = 'Configuración de horas extra inactivada.'; },
      error: () => this.configurationMessage = 'No se pudo inactivar la configuración de horas extra.'
    });
  }

  protected deactivateHolidayConfiguration(): void {
    if (!this.configuracionHorasExtrasService.hasHolidayConfiguration()) return;
    this.configuracionHorasExtrasService.deactivateHolidayConfiguration().subscribe({
      next: () => { this.feriadoTipoDraft = 'multiplicador'; this.feriadoValorDraft = 0; this.feriadoDiasBaseDraft = 30; this.feriadoHorasJornadaDraft = 8; this.configurationMessage = 'Configuración de pago de feriado inactivada.'; },
      error: () => this.configurationMessage = 'No se pudo inactivar la configuración de pago de feriado.'
    });
  }

  protected setFeriadoTipo(tipo: string): void {
    this.feriadoTipoDraft = tipo as TipoPagoFeriado;
    this.feriadoValorDraft = tipo === 'multiplicador' ? 2 : 100;
  }

  protected get feriadoDraft(): ConfiguracionFeriadoTrabajado {
    return {
      tipo: this.feriadoTipoDraft,
      valor: Number(this.feriadoValorDraft),
      diasBase: Number(this.feriadoDiasBaseDraft),
      horasJornada: Number(this.feriadoHorasJornadaDraft)
    };
  }

  protected get nuevoDiaFeriadoValido(): boolean {
    return this.diaFeriadoNombreDraft.trim().length >= 3 && /^\d{4}-\d{2}-\d{2}$/.test(this.diaFeriadoFechaDraft);
  }

  protected crearDiaFeriado(): void {
    if (!this.nuevoDiaFeriadoValido) return;
    const fecha = this.diaFeriadoFechaDraft;
    if (this.diasFeriados.some((feriado) => feriado.fecha === fecha)) {
      this.diaFeriadoError = 'Ya existe un día feriado registrado en esa fecha.';
      return;
    }

    this.feriadosService.create({ nombre: this.diaFeriadoNombreDraft.trim(), fecha }).subscribe((created) => {
      this.diasFeriados = [...this.diasFeriados, { ...created, color: this.diaFeriadoColorDraft }].sort((a, b) => a.fecha.localeCompare(b.fecha));
      this.diaFeriadoNombreDraft = ''; this.diaFeriadoFechaDraft = ''; this.diaFeriadoError = '';
    });
  }

  protected get calendarioFeriadosLabel(): string {
    if (this.calendarioFeriadosVista === 'anio') return `Año ${this.calendarioFeriadosYear}`;
    return `${this.monthNames[this.calendarioFeriadosMonth]} ${this.calendarioFeriadosYear}`;
  }

  protected get calendarioFeriadosCeldas(): CalendarioFeriadoCelda[] {
    return this.crearCeldasCalendario(this.calendarioFeriadosYear, this.calendarioFeriadosMonth);
  }

  protected calendarioMesCeldas(month: number): CalendarioFeriadoCelda[] {
    return this.crearCeldasCalendario(this.calendarioFeriadosYear, month);
  }

  protected get feriadosCalendarioMes(): DiaFeriadoLocal[] {
    const prefix = `${this.calendarioFeriadosYear}-${String(this.calendarioFeriadosMonth + 1).padStart(2, '0')}`;
    return this.diasFeriados.filter((feriado) => feriado.fecha.startsWith(prefix));
  }

  protected get feriadosCalendarioPeriodo(): DiaFeriadoLocal[] {
    if (this.calendarioFeriadosVista === 'anio') {
      return this.diasFeriados.filter((feriado) => feriado.fecha.startsWith(`${this.calendarioFeriadosYear}-`));
    }
    return this.feriadosCalendarioMes;
  }

  protected setCalendarioFeriadosVista(vista: CalendarioFeriadosVista): void {
    this.calendarioFeriadosVista = vista;
  }

  protected calendarioVistaClasses(vista: CalendarioFeriadosVista): string {
    return this.calendarioFeriadosVista === vista
      ? 'bg-[#22C55E] text-white shadow-sm'
      : 'text-slate-500 hover:bg-white hover:text-slate-800 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white';
  }

  protected cambiarMesFeriados(delta: number): void {
    if (this.calendarioFeriadosVista === 'anio') {
      this.calendarioFeriadosYear += delta;
      return;
    }
    const next = new Date(this.calendarioFeriadosYear, this.calendarioFeriadosMonth + delta, 1);
    this.calendarioFeriadosYear = next.getFullYear();
    this.calendarioFeriadosMonth = next.getMonth();
  }

  protected irHoyFeriados(): void {
    const today = new Date();
    this.calendarioFeriadosYear = today.getFullYear();
    this.calendarioFeriadosMonth = today.getMonth();
  }

  protected seleccionarDiaFeriado(celda: CalendarioFeriadoCelda): void {
    if (!celda.dia) return;
    if (celda.feriado) {
      this.gestionarDiaFeriado(celda.feriado);
      return;
    }
    this.diaFeriadoFechaDraft = celda.fecha;
    this.diaFeriadoNombreDraft = '';
    this.diaFeriadoError = '';
  }

  protected abrirMesFeriados(month: number): void {
    this.calendarioFeriadosMonth = month;
    this.calendarioFeriadosVista = 'mes';
  }

  protected confirmarInactivacionFeriado(): void {
    const pending = this.feriadoPendienteInactivar;
    if (!pending) return;
    this.feriadosService.delete(pending.id).subscribe(() => {
      this.diasFeriados = this.diasFeriados.map((feriado) => feriado.id === pending.id ? { ...feriado, activo: false } : feriado);
      this.feriadoSeleccionado = this.feriadoSeleccionado?.id === pending.id ? { ...this.feriadoSeleccionado, activo: false } : this.feriadoSeleccionado;
      this.feriadoPendienteInactivar = null;
    });
  }

  protected cancelarInactivacionFeriado(): void {
    this.feriadoPendienteInactivar = null;
  }

  protected alternarDiaFeriado(id: string): void {
    const current = this.diasFeriados.find((feriado) => feriado.id === id);
    if (!current) return;
    this.feriadosService.update(id, { activo: !current.activo }).subscribe((updated) => {
      this.diasFeriados = this.diasFeriados.map((feriado) => feriado.id === id ? { ...feriado, ...updated } : feriado);
      this.feriadoSeleccionado = this.feriadoSeleccionado?.id === id ? { ...this.feriadoSeleccionado, ...updated } : this.feriadoSeleccionado;
      if (updated.activo) this.loadHolidayRule(updated.fecha);
    });
  }

  protected gestionarDiaFeriado(feriado: DiaFeriadoLocal): void {
    this.montoCalculado = null;
    this.configurationMessage = '';
    this.feriadosService.get(feriado.id).subscribe((detail) => {
      this.feriadoSeleccionado = { ...feriado, ...detail };
      if (detail.activo) this.loadHolidayRule(detail.fecha);
      else this.feriadoReglaMessage = 'El feriado está inactivo. Puedes reactivarlo para aplicar una regla de pago.';
    });
  }

  protected calculateHolidayPayment(): void {
    const selected = this.feriadoSeleccionado;
    if (!selected || !selected.activo || this.remuneracionCalculo <= 0 || this.horasCalculo <= 0) return;
    this.feriadosService.calculatePayment(selected.id, Number(this.remuneracionCalculo), Number(this.horasCalculo)).subscribe({
      next: (result) => this.montoCalculado = Number(result.montoCalculado),
      error: () => this.feriadoReglaMessage = 'No se pudo calcular el pago para este feriado.'
    });
  }

  protected requestHolidayDeactivation(): void {
    if (this.feriadoSeleccionado?.activo) this.feriadoPendienteInactivar = this.feriadoSeleccionado;
  }

  protected reactivateSelectedHoliday(): void {
    if (this.feriadoSeleccionado && !this.feriadoSeleccionado.activo) this.alternarDiaFeriado(this.feriadoSeleccionado.id);
  }

  protected actualizarFechaDiaFeriado(fecha: string): void {
    this.diaFeriadoFechaDraft = fecha;
    this.diaFeriadoError = '';
    this.feriadoSeleccionado = null;
    this.feriadoReglaMessage = '';
    this.montoCalculado = null;
    const [year, month] = fecha.split('-').map(Number);
    if (year && month >= 1 && month <= 12) {
      this.calendarioFeriadosYear = year;
      this.calendarioFeriadosMonth = month - 1;
    }
  }

  protected formatearFechaFeriado(fecha: string): string {
    const [year, month, day] = fecha.split('-').map(Number);
    if (!year || !month || !day) return fecha;
    return new Intl.DateTimeFormat('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
      .format(new Date(year, month - 1, day));
  }

  protected get configuracionPagosValida(): boolean {
    const extra = Number(this.incrementoHorasExtrasDraft);
    const valorFeriado = Number(this.feriadoValorDraft);
    const diasBase = Number(this.feriadoDiasBaseDraft);
    const horasJornada = Number(this.feriadoHorasJornadaDraft);
    return Number.isFinite(extra) && extra >= 0 && extra <= 500
      && Number.isFinite(valorFeriado) && valorFeriado >= 0 && valorFeriado <= (this.feriadoTipoDraft === 'monto-fijo' ? 100000 : 500)
      && Number.isFinite(diasBase) && diasBase >= 1 && diasBase <= 31
      && Number.isFinite(horasJornada) && horasJornada >= 1 && horasJornada <= 24;
  }

  protected get pagoHoraExtraEjemplo(): string {
    return this.configuracionHorasExtrasService
      .calcularPagoHoraExtra(10, Number(this.incrementoHorasExtrasDraft) || 0)
      .toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
  }

  protected get pagoFeriadoEjemplo(): string {
    return this.configuracionHorasExtrasService
      .calcularPagoFeriadoPorHoras(1500, this.feriadoHorasJornadaDraft, this.feriadoDraft)
      .toLocaleString('es-PE', { style: 'currency', currency: 'PEN', minimumFractionDigits: 2 });
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    if (!this.isOpen()) return;
    if (this.feriadoPendienteInactivar) {
      this.cancelarInactivacionFeriado();
      return;
    }
    this.close();
  }

  private prepareForOpen(): void {
    this.feriadosService.list().subscribe((items) => this.diasFeriados = items.map((item) => ({ ...item, color: item.color || '#22C55E' })));
    const current = this.configuracionHorasExtrasService.getConfiguracion();
    this.incrementoHorasExtras = current.incrementoPorcentual;
    this.incrementoHorasExtrasDraft = current.incrementoPorcentual;
    this.configuracionFeriado = { ...current.feriado };
    this.feriadoTipoDraft = current.feriado.tipo;
    this.feriadoValorDraft = current.feriado.valor;
    this.feriadoDiasBaseDraft = current.feriado.diasBase;
    this.feriadoHorasJornadaDraft = current.feriado.horasJornada;
    this.diaFeriadoNombreDraft = '';
    this.diaFeriadoFechaDraft = '';
    this.diaFeriadoColorDraft = '#22C55E';
    this.diaFeriadoError = '';
    this.pagosEspecialesTab = 'configuracion-pagos';
  }

  private crearCeldasCalendario(year: number, month: number): CalendarioFeriadoCelda[] {
    const firstWeekDay = (new Date(year, month, 1).getDay() + 6) % 7;
    const totalDays = new Date(year, month + 1, 0).getDate();
    return Array.from({ length: 42 }, (_, index) => {
      const day = index - firstWeekDay + 1;
      if (day < 1 || day > totalDays) return { fecha: `vacio-${year}-${month}-${index}`, dia: null };
      const fecha = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      return { fecha, dia: day, feriado: this.diasFeriados.find((item) => item.fecha === fecha) };
    });
  }

  private loadHolidayRule(fecha: string): void {
    this.feriadoReglaMessage = 'Consultando regla de pago…';
    this.feriadosService.getRule(fecha).subscribe({
      next: (rule) => {
        const type = rule.configuracion.tipoCalculo.toLowerCase().replaceAll('_', ' ');
        this.feriadoReglaMessage = `Regla ${rule.origen.toLowerCase()}: ${type}, valor ${Number(rule.configuracion.valor)}`;
      },
      error: () => this.feriadoReglaMessage = 'No existe una regla de pago aplicable para esta fecha.'
    });
  }
}
