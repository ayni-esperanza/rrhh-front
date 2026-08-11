import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    @if (isOpen) {
      <div class="fixed inset-0 z-[80] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-[2px]" role="dialog" aria-modal="true" [attr.aria-labelledby]="titleId" (click)="cancel.emit()">
        <section class="w-full max-w-sm rounded-xl bg-white p-5 shadow-2xl dark:bg-slate-900" (click)="$event.stopPropagation()">
          <h2 [id]="titleId" class="text-base font-bold text-slate-950 dark:text-white">{{ title }}</h2>
          <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ message }}</p>
          <div class="mt-5 flex justify-end gap-2">
            <button type="button" class="h-9 rounded-lg border border-slate-200 px-4 text-xs font-bold text-slate-700 transition hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800" (click)="cancel.emit()">{{ cancelLabel }}</button>
            <button type="button" class="h-9 rounded-lg bg-rose-600 px-4 text-xs font-bold text-white transition hover:bg-rose-700" (click)="confirm.emit()">{{ confirmLabel }}</button>
          </div>
        </section>
      </div>
    }
  `
})
export class ConfirmDialogComponent {
  @Input() isOpen = false;
  @Input() title = 'Confirmar acción';
  @Input() message = '¿Deseas continuar?';
  @Input() cancelLabel = 'Cancelar';
  @Input() confirmLabel = 'Confirmar';
  @Input() titleId = 'confirm-dialog-title';
  @Output() cancel = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();
}
