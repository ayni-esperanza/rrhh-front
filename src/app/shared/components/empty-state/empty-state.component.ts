import { Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  template: `
    <section class="rounded-lg border border-dashed border-slate-300 bg-white p-6 text-center dark:border-slate-700 dark:bg-slate-900">
      <h2 class="text-base font-semibold text-slate-900 dark:text-white">{{ title() }}</h2>
      <p class="mt-2 text-sm text-slate-600 dark:text-slate-300">{{ message() }}</p>
    </section>
  `
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly message = input.required<string>();
}