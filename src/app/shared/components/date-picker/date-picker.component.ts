import {
  Component, Input, Output, EventEmitter,
  AfterViewInit, OnChanges, OnDestroy, SimpleChanges,
  ViewChild, ElementRef, PLATFORM_ID, Inject, NgZone, HostListener
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [],
  styles: [':host { display: block; }'],
  template: `
    @if (monthOnly) {
      <div class="relative">
        <button
          type="button"
          [class]="inputClass + ' relative cursor-pointer pr-9 text-left' + (hasError ? ' !border-red-500' : '')"
          [attr.aria-label]="placeholder"
          [attr.aria-expanded]="monthPickerOpen"
          aria-haspopup="dialog"
          (click)="toggleMonthPicker($event)">
          <span class="block truncate">{{ selectedMonthLabel }}</span>
          <svg class="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 dark:text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z" />
          </svg>
        </button>

        @if (monthPickerOpen) {
          <div
            class="absolute right-0 top-full z-[10000] mt-2 w-[252px] overflow-hidden rounded-[9px] border border-slate-200 bg-white p-1.5 shadow-[0_12px_28px_rgba(15,23,42,0.16)] dark:border-slate-700 dark:bg-slate-900 dark:shadow-[0_18px_38px_rgba(0,0,0,0.5)]"
            role="dialog"
            aria-label="Seleccionar mes y año"
            (click)="$event.stopPropagation()">
            <div class="flex h-8 items-center justify-between px-1">
              <button type="button" class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-green-400" aria-label="Año anterior" (click)="changePickerYear(-1)">
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M12.79 15.77a.75.75 0 0 1-1.06.02l-5-4.75a.75.75 0 0 1 0-1.08l5-4.75a.75.75 0 1 1 1.04 1.08L8.34 10l4.43 3.71a.75.75 0 0 1 .02 1.06Z" clip-rule="evenodd" /></svg>
              </button>
              <strong class="text-xs font-bold text-slate-800 dark:text-slate-100">{{ pickerYear }}</strong>
              <button type="button" class="flex h-7 w-7 items-center justify-center rounded-md text-slate-500 transition hover:bg-slate-100 hover:text-green-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-green-400" aria-label="Año siguiente" (click)="changePickerYear(1)">
                <svg class="h-4 w-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true"><path fill-rule="evenodd" d="M7.21 4.23a.75.75 0 0 1 1.06-.02l5 4.75a.75.75 0 0 1 0 1.08l-5 4.75a.75.75 0 1 1-1.04-1.08L11.66 10 7.23 6.29a.75.75 0 0 1-.02-1.06Z" clip-rule="evenodd" /></svg>
              </button>
            </div>

            <div class="grid grid-cols-4 gap-1 p-1">
              @for (month of monthNames; track month; let index = $index) {
                <button
                  type="button"
                  [class]="monthButtonClasses(index)"
                  [disabled]="isMonthDisabled(index)"
                  [attr.aria-pressed]="isSelectedMonth(index)"
                  (click)="selectMonth(index)">
                  {{ month }}
                </button>
              }
            </div>
          </div>
        }
      </div>
    } @else {
      <input #inp type="text" autocomplete="off" class="hidden">
    }
  `
})
export class DatePickerComponent implements AfterViewInit, OnChanges, OnDestroy {
  @Input() value = '';
  @Input() placeholder = 'dd/mm/aaaa';
  @Input() minDate = '';
  @Input() maxDate = '';
  @Input() hasError = false;
  @Input() enableTime = false;
  @Input() timeOnly = false;
  @Input() monthOnly = false;
  @Input() inputClass = 'w-full px-2 py-1 text-xs border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-green-500 outline-none dark:bg-gray-700 dark:text-white cursor-pointer bg-white dark:bg-gray-700';

  @Output() valueChange = new EventEmitter<string>();

  @ViewChild('inp') inp?: ElementRef<HTMLInputElement>;

  private fp: any;
  private destroyed = false;
  monthPickerOpen = false;
  pickerYear = new Date().getFullYear();
  readonly monthNames = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  private readonly isBrowser: boolean;
  private readonly calendarIconDataUri = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='1.8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M8 7V3m8 4V3M4 11h16M5 5h14a1 1 0 011 1v13a1 1 0 01-1 1H5a1 1 0 01-1-1V6a1 1 0 011-1z'/%3E%3C/svg%3E\")";
  private readonly clockIconDataUri = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280' stroke-width='1.8'%3E%3Ccircle cx='12' cy='12' r='9'/%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M12 7v5l3 2'/%3E%3C/svg%3E\")";

  constructor(
    @Inject(PLATFORM_ID) platformId: object,
    private zone: NgZone
  ) {
    this.isBrowser = isPlatformBrowser(platformId);
  }

  ngAfterViewInit(): void {
    if (!this.isBrowser) return;

    const input = this.inp?.nativeElement;
    if (!input) return;

    Promise.all([
      import('flatpickr'),
      import('flatpickr/dist/l10n/es')
    ]).then(([flatpickrModule, localeModule]) => {
      // Los imports son asíncronos: el componente puede haberse destruido
      // antes de que terminen (por ejemplo, al navegar rápidamente).
      if (this.destroyed || !input.isConnected) return;

      const flatpickr = (flatpickrModule as any).default ?? flatpickrModule;
      const Spanish = (localeModule as any).Spanish ?? (localeModule as any).default?.Spanish;

      if (typeof flatpickr !== 'function') return;

      const instance = flatpickr(input, {
        dateFormat: this.dateFormat,
        altInput: true,
        altFormat: this.altFormat,
        altInputClass: this.inputClass + ' pr-9' + (this.hasError ? ' !border-red-500' : ''),
        enableTime: this.enableTime || this.timeOnly,
        noCalendar: this.timeOnly,
        time_24hr: true,
        locale: Spanish,
        defaultDate: this.value || undefined,
        minDate: this.hasDateBounds ? this.minDate || undefined : undefined,
        maxDate: this.hasDateBounds ? this.maxDate || undefined : undefined,
        onChange: (_: Date[], dateStr: string) => {
          this.zone.run(() => this.valueChange.emit(dateStr));
        }
      });

      // Flatpickr retorna un arreglo vacío cuando no encuentra un elemento.
      // Solo conservamos una instancia válida y destruible.
      if (this.destroyed || !instance || typeof instance.destroy !== 'function') {
        if (instance && typeof instance.destroy === 'function') instance.destroy();
        return;
      }

      this.fp = instance;
      this.fp.calendarContainer?.classList.add('ayni-date-picker-compact');
      this.actualizarAparienciaInput();
    }).catch((error: unknown) => {
      if (!this.destroyed) console.error('No se pudo inicializar el selector de fecha.', error);
    });
  }

  get selectedMonthLabel(): string {
    const parsed = this.parseMonth(this.value);
    return parsed ? `${this.monthNames[parsed.month]} ${parsed.year}` : this.placeholder;
  }

  toggleMonthPicker(event: Event): void {
    event.stopPropagation();
    const selected = this.parseMonth(this.value);
    this.pickerYear = selected?.year ?? new Date().getFullYear();
    this.monthPickerOpen = !this.monthPickerOpen;
  }

  changePickerYear(delta: number): void {
    this.pickerYear += delta;
  }

  selectMonth(month: number): void {
    if (this.isMonthDisabled(month)) return;
    const nextValue = `${this.pickerYear}-${String(month + 1).padStart(2, '0')}`;
    this.monthPickerOpen = false;
    this.valueChange.emit(nextValue);
  }

  isSelectedMonth(month: number): boolean {
    const selected = this.parseMonth(this.value);
    return selected?.year === this.pickerYear && selected.month === month;
  }

  isMonthDisabled(month: number): boolean {
    const candidate = `${this.pickerYear}-${String(month + 1).padStart(2, '0')}`;
    const minimum = this.normalizedMonthBound(this.minDate);
    const maximum = this.normalizedMonthBound(this.maxDate);
    return (!!minimum && candidate < minimum) || (!!maximum && candidate > maximum);
  }

  monthButtonClasses(month: number): string {
    const base = 'flex h-7 min-w-0 items-center justify-center rounded-md border px-0.5 text-[8.5px] font-bold leading-none transition';
    if (this.isMonthDisabled(month)) return `${base} cursor-not-allowed border-transparent text-slate-300 dark:text-slate-600`;
    if (this.isSelectedMonth(month)) return `${base} border-green-500/35 bg-green-500/15 text-green-700 dark:border-green-400/40 dark:bg-green-400/20 dark:text-green-300`;
    return `${base} border-transparent text-slate-600 hover:border-slate-200 hover:bg-slate-100 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800`;
  }

  @HostListener('document:click')
  closeMonthPicker(): void {
    this.monthPickerOpen = false;
  }

  @HostListener('document:keydown.escape')
  closeMonthPickerWithEscape(): void {
    this.monthPickerOpen = false;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (this.monthOnly && changes['value']) {
      const selected = this.parseMonth(changes['value'].currentValue || '');
      if (selected) this.pickerYear = selected.year;
    }
    if (!this.fp) return;
    if (changes['value'] && !changes['value'].firstChange) {
      this.fp.setDate(changes['value'].currentValue || '', false);
    }
    if (changes['minDate'] && !changes['minDate'].firstChange) {
      this.fp.set('minDate', this.hasDateBounds ? this.minDate || undefined : undefined);
    }
    if (changes['maxDate'] && !changes['maxDate'].firstChange) {
      this.fp.set('maxDate', this.hasDateBounds ? this.maxDate || undefined : undefined);
    }
    if ((changes['enableTime'] || changes['timeOnly']) && (!changes['enableTime'] || !changes['enableTime'].firstChange) && (!changes['timeOnly'] || !changes['timeOnly'].firstChange)) {
      this.fp.set('enableTime', this.enableTime || this.timeOnly);
      this.fp.set('noCalendar', this.timeOnly);
      this.fp.set('dateFormat', this.dateFormat);
      this.fp.set('altFormat', this.altFormat);
      this.actualizarAparienciaInput();
    }
    if (changes['hasError'] && this.fp?.altInput) {
      const alt = this.fp.altInput as HTMLInputElement;
      if (this.hasError) {
        alt.classList.add('!border-red-500');
      } else {
        alt.classList.remove('!border-red-500');
      }
    }
    if (changes['placeholder'] && this.fp?.altInput) {
      this.actualizarAparienciaInput();
    }
  }

  private actualizarAparienciaInput(): void {
    if (!this.fp?.altInput) return;

    const alt = this.fp.altInput as HTMLInputElement;
    alt.placeholder = this.placeholder;
    alt.style.backgroundImage = this.timeOnly ? this.clockIconDataUri : this.calendarIconDataUri;
    alt.style.backgroundRepeat = 'no-repeat';
    alt.style.backgroundPosition = 'right 0.75rem center';
    alt.style.backgroundSize = '1rem 1rem';
  }

  private get hasDateBounds(): boolean {
    return !this.timeOnly;
  }

  private get dateFormat(): string {
    if (this.timeOnly) return 'H:i';
    if (this.monthOnly) return 'Y-m';
    return this.enableTime ? 'Y-m-d H:i' : 'Y-m-d';
  }

  private get altFormat(): string {
    if (this.timeOnly) return 'H:i';
    if (this.monthOnly) return 'F Y';
    return this.enableTime ? 'd/m/Y H:i' : 'd/m/Y';
  }

  private parseMonth(value: string): { year: number; month: number } | null {
    const match = /^(\d{4})-(\d{2})$/.exec(value);
    if (!match) return null;
    const month = Number(match[2]) - 1;
    if (month < 0 || month > 11) return null;
    return { year: Number(match[1]), month };
  }

  private normalizedMonthBound(value: string): string {
    return /^\d{4}-\d{2}/.test(value) ? value.slice(0, 7) : '';
  }

  ngOnDestroy(): void {
    this.destroyed = true;

    const instance = this.fp;
    this.fp = undefined;
    if (instance && typeof instance.destroy === 'function') instance.destroy();
  }
}

