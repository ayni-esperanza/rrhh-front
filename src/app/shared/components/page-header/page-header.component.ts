import { Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  template: `
    <header class="mb-6 flex flex-col gap-2 border-b border-slate-200 pb-5 dark:border-slate-800">
      <p class="text-sm font-medium text-emerald-600 dark:text-emerald-400">{{ eyebrow() }}</p>
      <h1 class="text-2xl font-semibold text-slate-950 dark:text-white">{{ title() }}</h1>
      <p class="max-w-3xl text-sm text-slate-600 dark:text-slate-300">{{ description() }}</p>
    </header>
  `
})
export class PageHeaderComponent {
  readonly eyebrow = input('Recursos Humanos');
  readonly title = input.required<string>();
  readonly description = input('');
}