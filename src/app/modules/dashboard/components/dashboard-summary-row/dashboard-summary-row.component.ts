import { Component } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard-summary-row',
  imports: [NgxChartsModule],
  templateUrl: './dashboard-summary-row.component.html'
})
export class DashboardSummaryRowComponent {
  protected readonly projects = [
    { label: 'Taller (Turno Dia)', value: 58, color: '#2563eb' },
    { label: 'UPAO (Turno Dia)', value: 42, color: '#22c55e' },
    { label: 'Sultana (Turno Noche)', value: 31, color: '#8b5cf6' },
    { label: 'Casagrande (Turno Dia)', value: 28, color: '#fb923c' },
    { label: 'Sultana (Turno Dia)', value: 15, color: '#14b8a6' },
    { label: 'Otros', value: 12, color: '#94a3b8' }
  ];

  protected readonly projectsChart = this.projects.map((project) => ({ name: project.label, value: project.value }));
  protected readonly attendanceTrend = [{ name: 'Asistencia', series: this.toSeries([88.1, 90.3, 91.7, 89.2, 92.4]) }];
  protected readonly absenteeismTrend = [{ name: 'Ausentismo', series: this.toSeries([8.6, 7.9, 8.4, 7.2, 7.6]) }];
  protected readonly projectScheme = this.colorScheme('proyectos', this.projects.map((project) => project.color));
  protected readonly attendanceScheme = this.colorScheme('asistencia', ['#10b981']);
  protected readonly absenteeismScheme = this.colorScheme('ausentismo', ['#f59e0b']);

  private colorScheme(name: string, domain: string[]): Color {
    return { name, selectable: true, group: ScaleType.Ordinal, domain };
  }

  private toSeries(values: number[]) {
    return ['Ene', 'Feb', 'Mar', 'Abr', 'May'].map((name, index) => ({ name, value: values[index] }));
  }
}
