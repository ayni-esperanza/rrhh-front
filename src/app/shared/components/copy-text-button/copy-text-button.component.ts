import { ChangeDetectorRef, Component, Input, inject } from '@angular/core';

@Component({
  selector: 'app-copy-text-button',
  standalone: true,
  template: `
    <button
      type="button"
      class="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-400 transition hover:bg-blue-100 hover:text-blue-700 dark:text-slate-500 dark:hover:bg-blue-500/15 dark:hover:text-blue-300"
      [attr.aria-label]="copied ? label + ' copiado' : 'Copiar ' + label"
      [title]="copied ? 'Copiado' : 'Copiar ' + label"
      (click)="copy($event)">
      @if (copied) {
        <svg class="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="m5 12 4 4L19 6"/></svg>
      } @else {
        <svg class="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="8" y="8" width="11" height="11" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h3"/></svg>
      }
    </button>
  `
})
export class CopyTextButtonComponent {
  @Input({ required: true }) value = '';
  @Input() label = 'texto';

  protected copied = false;
  private readonly changeDetectorRef = inject(ChangeDetectorRef);

  protected async copy(event: MouseEvent): Promise<void> {
    event.stopPropagation();
    if (!this.value) return;

    try {
      await navigator.clipboard.writeText(this.value);
    } catch {
      const input = document.createElement('textarea');
      input.value = this.value;
      input.style.position = 'fixed';
      input.style.opacity = '0';
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      input.remove();
    }

    this.copied = true;
    this.changeDetectorRef.markForCheck();
    window.setTimeout(() => {
      this.copied = false;
      this.changeDetectorRef.markForCheck();
    }, 1800);
  }
}
