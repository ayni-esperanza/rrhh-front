import { Component, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { DASHBOARD_REPORTS, DashboardReportMetric } from '../../models/dashboard-report.model';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-report-page',
  imports: [RouterLink, NgxChartsModule],
  templateUrl: './dashboard-report-page.component.html'
})
export class DashboardReportPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly dashboardService = inject(DashboardService);
  private readonly reportId = this.route.snapshot.paramMap.get('reportId') ?? '';
  protected report = DASHBOARD_REPORTS[this.reportId];
  protected readonly period = this.formatPeriod(this.route.snapshot.queryParamMap.get('periodo'));
  protected readonly chartScheme: Color = {
    name: `reporte-${this.route.snapshot.paramMap.get('reportId') ?? 'dashboard'}`,
    selectable: true,
    group: ScaleType.Ordinal,
    domain: this.report?.colors ?? ['#2563eb']
  };

  constructor() {
    const period = this.route.snapshot.queryParamMap.get('periodo') ?? new Date().toLocaleDateString('en-CA').slice(0, 7);
    if (this.report) this.dashboardService.getReport(this.reportId, period).subscribe((data) => this.applyData(data));
  }

  protected metricClasses(tone: DashboardReportMetric['tone']): string {
    const classes: Record<DashboardReportMetric['tone'], string> = {
      blue: 'border-blue-100 bg-blue-50/60 dark:border-blue-500/20 dark:bg-blue-500/10',
      emerald: 'border-emerald-100 bg-emerald-50/60 dark:border-emerald-500/20 dark:bg-emerald-500/10',
      amber: 'border-amber-100 bg-amber-50/60 dark:border-amber-500/20 dark:bg-amber-500/10',
      violet: 'border-violet-100 bg-violet-50/60 dark:border-violet-500/20 dark:bg-violet-500/10'
    };
    return classes[tone];
  }

  protected percentFormat(value: number): string {
    return `${value}%`;
  }

  private formatPeriod(period: string | null): string {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(period ?? '')) {
      period = new Date().toLocaleDateString('en-CA').slice(0, 7);
    }

    const [year, month] = period!.split('-').map(Number);
    const value = new Intl.DateTimeFormat('es-PE', { month: 'long', year: 'numeric', timeZone: 'UTC' })
      .format(new Date(Date.UTC(year, month - 1, 1)));
    return value.charAt(0).toUpperCase() + value.slice(1);
  }

  private applyData(response: Record<string, unknown>): void {
    const arrays = Object.entries(response).filter(([, value]) => Array.isArray(value)) as Array<[string, Array<Record<string, unknown>>]>;
    const preferred = arrays.find(([key]) => key !== 'data') ?? arrays[0];
    const rows = preferred?.[1] ?? [];
    const keys = rows.length ? Object.keys(rows[0]).filter((key) => key !== 'id') : [];
    this.report = { ...this.report, chartData: rows.map((row) => ({ name: String(row['colaborador'] ?? row['area'] ?? ''), value: Number(row['faltas'] ?? row['tardanzas'] ?? row['minutos_antes'] ?? row['monto_programado'] ?? row['registros'] ?? 0) })), columns: keys.map((key) => key.replaceAll('_', ' ')), rows: rows.map((row) => keys.map((key) => String(row[key] ?? ''))), metrics: [{ label: 'Registros', value: String(rows.length), detail: this.period, tone: 'blue' }] };
  }
}
