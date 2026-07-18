import { Component, Input } from '@angular/core';
import { ColaboradorMetric } from '../../models/colaborador.model';

@Component({
  selector: 'app-colaboradores-metrics',
  templateUrl: './colaboradores-metrics.component.html'
})
export class ColaboradoresMetricsComponent {
  @Input({ required: true }) metrics: ColaboradorMetric[] = [];

  protected iconPath(icon: ColaboradorMetric['icon']): string {
    const paths = {
      users: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z',
      calendar: 'M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 8H5v10h14V10Z',
      clock: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm1-10.4V7h-2v6h5v-2h-3Z',
      money: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm1-16h-2v1.16c-1.7.34-3 1.45-3 3.09 0 1.92 1.61 2.66 3.52 3.19 1.41.39 1.98.75 1.98 1.46 0 .75-.71 1.25-1.77 1.25-1.16 0-2.17-.4-3.04-1.04l-.96 1.67c.8.66 1.97 1.15 3.27 1.29V19h2v-1.08c1.78-.33 3.13-1.43 3.13-3.12 0-1.91-1.49-2.7-3.54-3.26-1.48-.41-1.96-.76-1.96-1.42 0-.66.61-1.13 1.58-1.13.91 0 1.68.28 2.43.76l.9-1.7A5.9 5.9 0 0 0 13 7.14V6Z'
    };
    return paths[icon];
  }

  protected toneClasses(tone: ColaboradorMetric['tone']): string {
    const tones = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300',
      amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
      emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300'
    };
    return tones[tone];
  }
}
