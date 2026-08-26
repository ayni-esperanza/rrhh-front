import { DecimalPipe } from '@angular/common';
import { Component, Input } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { DashboardAttendance, DashboardSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-summary-row',
  imports: [NgxChartsModule, DecimalPipe],
  templateUrl: './dashboard-summary-row.component.html'
})
export class DashboardSummaryRowComponent {
  @Input() summary: DashboardSummary | null = null;
  @Input() attendance: DashboardAttendance | null = null;
  protected readonly colors = ['#2563eb', '#22c55e', '#8b5cf6', '#fb923c', '#14b8a6', '#94a3b8'];
  protected get projects() { return (this.attendance?.data ?? []).map((item, index) => ({ label: item.area, value: item.registros, color: this.colors[index % this.colors.length] })); }
  protected get projectsChart() { return this.projects.map((project) => ({ name: project.label, value: project.value })); }
  protected readonly attendanceTrend = [{ name: 'Asistencia', series: [] }];
  protected readonly absenteeismTrend = [{ name: 'Ausentismo', series: [] }];
  protected readonly projectScheme = this.colorScheme('proyectos', this.colors);
  protected readonly attendanceScheme = this.colorScheme('asistencia', ['#10b981']);
  protected readonly absenteeismScheme = this.colorScheme('ausentismo', ['#f59e0b']);

  private colorScheme(name: string, domain: string[]): Color {
    return { name, selectable: true, group: ScaleType.Ordinal, domain };
  }

  protected get attendancePercent(): number { const a = this.summary?.asistencia; return a?.registros ? ((a.registros - a.faltas) / a.registros) * 100 : 0; }
  protected get absenteeismPercent(): number { return 100 - this.attendancePercent; }
}
