import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { DashboardAttendance, DashboardSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-analytics-row',
  imports: [NgxChartsModule, RouterLink],
  templateUrl: './dashboard-analytics-row.component.html'
})
export class DashboardAnalyticsRowComponent {
  @Input() attendance: DashboardAttendance | null = null;
  @Input() summary: DashboardSummary | null = null;
  protected get areaAbsenteeism() { return (this.attendance?.data ?? []).map((x) => ({ name: x.area, value: x.registros ? Number(((x.faltas / x.registros) * 100).toFixed(2)) : 0 })); }
  protected readonly monthlyAttendance = [{ name: 'Asistencia', series: [] }];
  protected readonly areaScheme: Color = { name: 'areas', selectable: true, group: ScaleType.Ordinal, domain: ['#22c55e', '#3b82f6', '#8b5cf6', '#fb923c', '#14b8a6', '#ef4444'] };
  protected readonly attendanceScheme: Color = { name: 'asistencia-mensual', selectable: true, group: ScaleType.Ordinal, domain: ['#2563eb'] };

  protected readonly percentFormat = (value: number): string => `${value}%`;

  protected get averageHours(): number { const s = this.summary; return s?.colaboradores?.activos ? s.asistencia.minutos_normales / 60 / s.colaboradores.activos : 0; }
  protected get averageExtraHours(): number { const s = this.summary; return s?.colaboradores?.activos ? s.asistencia.minutos_extras / 60 / s.colaboradores.activos : 0; }
}
