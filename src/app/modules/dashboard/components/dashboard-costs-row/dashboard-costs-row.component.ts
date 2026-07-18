import { Component } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard-costs-row',
  imports: [NgxChartsModule],
  templateUrl: './dashboard-costs-row.component.html'
})
export class DashboardCostsRowComponent {
  protected readonly attendanceComparison = [
    { name: 'Ene', value: 88.1 },
    { name: 'Feb', value: 90.3 },
    { name: 'Mar', value: 91.7 },
    { name: 'Abr', value: 89.2 },
    { name: 'May', value: 92.4 }
  ];
  protected readonly comparisonScheme: Color = { name: 'comparacion-asistencia', selectable: true, group: ScaleType.Ordinal, domain: ['#fecdd3', '#fda4af', '#fb7185', '#fda4af', '#f43f5e'] };

  protected percentFormat(value: number): string {
    return `${value}%`;
  }
}
