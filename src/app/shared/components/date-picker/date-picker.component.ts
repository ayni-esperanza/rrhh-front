import {
  Component, Input, Output, EventEmitter,
  AfterViewInit, OnChanges, OnDestroy, SimpleChanges,
  ViewChild, ElementRef, PLATFORM_ID, Inject, NgZone
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-date-picker',
  standalone: true,
  imports: [],
  styles: [':host { display: block; }'],
  template: `<input #inp type="text" autocomplete="off" class="hidden">`
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

  @ViewChild('inp') inp!: ElementRef<HTMLInputElement>;

  private fp: any;
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

    Promise.all([
      import('flatpickr'),
      import('flatpickr/dist/l10n/es'),
      this.monthOnly ? import('flatpickr/dist/plugins/monthSelect/index') : Promise.resolve(null)
    ]).then(([flatpickrModule, localeModule, monthPluginModule]) => {
      const flatpickr = (flatpickrModule as any).default ?? flatpickrModule;
      const monthSelectPlugin = monthPluginModule ? ((monthPluginModule as any).default ?? monthPluginModule) : null;
      const Spanish = (localeModule as any).Spanish ?? (localeModule as any).default?.Spanish;

      this.fp = flatpickr(this.inp.nativeElement, {
        dateFormat: this.dateFormat,
        altInput: true,
        altFormat: this.altFormat,
        altInputClass: this.inputClass + ' pr-9' + (this.hasError ? ' !border-red-500' : ''),
        enableTime: this.enableTime || this.timeOnly,
        noCalendar: this.timeOnly,
        time_24hr: true,
        locale: Spanish,
        plugins: monthSelectPlugin ? [monthSelectPlugin({ shorthand: false, dateFormat: 'Y-m', altFormat: 'F Y' })] : [],
        defaultDate: this.value || undefined,
        minDate: this.hasDateBounds ? this.minDate || undefined : undefined,
        maxDate: this.hasDateBounds ? this.maxDate || undefined : undefined,
        onChange: (_: Date[], dateStr: string) => {
          this.zone.run(() => this.valueChange.emit(dateStr));
        }
      });

      this.fp.calendarContainer?.classList.add('ayni-date-picker-compact');
      if (this.monthOnly) this.fp.calendarContainer?.classList.add('ayni-date-picker-month');
      this.actualizarAparienciaInput();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
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

  ngOnDestroy(): void {
    this.fp?.destroy();
  }
}

