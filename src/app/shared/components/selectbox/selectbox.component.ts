import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';

/** Checkbox reutilizable para selección individual o masiva en tablas. */
@Component({
  selector: 'app-selectbox',
  standalone: true,
  template: `
    <input
      #checkbox
      type="checkbox"
      [checked]="checked"
      [disabled]="disabled"
      [attr.aria-label]="ariaLabel"
      (change)="onChange($event)"
      class="h-4 w-4 cursor-pointer rounded border-slate-300 text-blue-600 accent-blue-600 focus:ring-2 focus:ring-blue-500/30 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-600 dark:bg-slate-800" />
  `
})
export class SelectboxComponent implements AfterViewInit, OnChanges {
  @Input() checked = false;
  @Input() indeterminate = false;
  @Input() disabled = false;
  @Input() ariaLabel = 'Seleccionar';

  @Output() checkedChange = new EventEmitter<boolean>();

  @ViewChild('checkbox') private checkbox?: ElementRef<HTMLInputElement>;

  ngAfterViewInit(): void {
    this.updateIndeterminateState();
  }

  ngOnChanges(_changes: SimpleChanges): void {
    this.updateIndeterminateState();
  }

  protected onChange(event: Event): void {
    this.checkedChange.emit((event.target as HTMLInputElement).checked);
  }

  private updateIndeterminateState(): void {
    if (this.checkbox) this.checkbox.nativeElement.indeterminate = this.indeterminate;
  }
}
