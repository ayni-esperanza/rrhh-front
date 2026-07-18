import { Component } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard-analytics-row',
  imports: [NgxChartsModule],
  templateUrl: './dashboard-analytics-row.component.html'
})
export class DashboardAnalyticsRowComponent {
  protected readonly areaAbsenteeism = [
    { name: 'Produccion', value: 4.2 },
    { name: 'Mantenimiento', value: 6.7 },
    { name: 'Logistica', value: 7.9 },
    { name: 'Administracion', value: 8.3 },
    { name: 'Calidad', value: 9.1 },
    { name: 'Almacen', value: 11.4 }
  ];
  protected readonly monthlyAttendance = [{ name: 'Asistencia', series: this.toSeries([88.1, 90.3, 91.7, 89.2, 92.4]) }];
  protected readonly areaScheme: Color = { name: 'areas', selectable: true, group: ScaleType.Ordinal, domain: ['#22c55e', '#3b82f6', '#8b5cf6', '#fb923c', '#14b8a6', '#ef4444'] };
  protected readonly attendanceScheme: Color = { name: 'asistencia-mensual', selectable: true, group: ScaleType.Ordinal, domain: ['#2563eb'] };

  protected percentFormat(value: number): string {
    return `${value}%`;
  }

  private toSeries(values: number[]) {
    return ['Ene', 'Feb', 'Mar', 'Abr', 'May'].map((name, index) => ({ name, value: values[index] }));
  }
}
