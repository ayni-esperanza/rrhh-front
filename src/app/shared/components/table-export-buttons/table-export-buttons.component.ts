import { Component, ElementRef, EventEmitter, HostListener, Input, Output, inject } from '@angular/core';

@Component({
  selector: 'app-table-export-buttons',
  template: `
    <div class="relative">
      <button type="button" class="inline-flex h-9 w-9 items-center justify-center rounded-md border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white" aria-label="Descargar tabla" title="Descargar tabla" [attr.aria-expanded]="isOpen" aria-haspopup="menu" [disabled]="disabled || busy" (click)="isOpen = !isOpen">
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M12 3v12"/><path d="m7 10 5 5 5-5"/><path d="M5 21h14"/></svg>
      </button>
      @if (isOpen) {
        <div class="absolute right-0 z-40 mt-2 w-44 overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-xl dark:border-slate-700 dark:bg-slate-900" role="menu">
          <button type="button" class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[11px] font-semibold text-slate-700 transition hover:bg-emerald-50 hover:text-emerald-700 dark:text-slate-200 dark:hover:bg-emerald-500/10 dark:hover:text-emerald-300" role="menuitem" (click)="emitExport('excel')">
            <svg class="h-4 w-4 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 3h10l6 6v12H4z"/><path d="M14 3v6h6M8 13l4 5m0-5-4 5"/></svg>
            Exportar a Excel
          </button>
          <button type="button" class="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-[11px] font-semibold text-slate-700 transition hover:bg-rose-50 hover:text-rose-700 dark:text-slate-200 dark:hover:bg-rose-500/10 dark:hover:text-rose-300" role="menuitem" (click)="emitExport('pdf')">
            <svg class="h-4 w-4 text-rose-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M4 3h10l6 6v12H4z"/><path d="M14 3v6h6M8 15h2a2 2 0 0 0 0-4H8v7m6 0v-7h4"/></svg>
            Exportar a PDF
          </button>
        </div>
      }
    </div>
  `
})
export class TableExportButtonsComponent {
  private readonly elementRef = inject(ElementRef<HTMLElement>);
  @Input() disabled = false;
  @Output() exportExcel = new EventEmitter<void>();
  @Output() exportPdf = new EventEmitter<void>();
  protected busy = false;
  protected isOpen = false;

  @HostListener('document:click', ['$event'])
  protected closeOnOutsideClick(event: MouseEvent): void {
    if (!this.elementRef.nativeElement.contains(event.target as Node)) this.isOpen = false;
  }

  @HostListener('document:keydown.escape')
  protected closeOnEscape(): void {
    this.isOpen = false;
  }

  protected emitExport(format: 'excel' | 'pdf'): void {
    this.isOpen = false;
    this.busy = true;
    (format === 'excel' ? this.exportExcel : this.exportPdf).emit();
    window.setTimeout(() => this.busy = false, 600);
  }
}
