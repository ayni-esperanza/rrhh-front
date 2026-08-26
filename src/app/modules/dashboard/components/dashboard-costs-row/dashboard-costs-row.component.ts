import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { DashboardCosts, DashboardSummary } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-costs-row',
  imports: [NgxChartsModule, RouterLink],
  templateUrl: './dashboard-costs-row.component.html'
})
export class DashboardCostsRowComponent {
  @Input() costs: DashboardCosts | null = null;
  @Input() summary: DashboardSummary | null = null;
  protected get attendanceComparison() { return (this.costs?.data ?? []).map((x) => ({ name: x.area, value: x.monto_programado })); }
  protected readonly comparisonScheme: Color = { name: 'comparacion-asistencia', selectable: true, group: ScaleType.Ordinal, domain: ['#fecdd3', '#fda4af', '#fb7185', '#fda4af', '#f43f5e'] };

  protected percentFormat(value: number): string {
    return this.money(value);
  }
  protected get averageCost(): number { const s = this.summary; return s?.colaboradores?.activos ? s.planilla.total / s.colaboradores.activos : 0; }
  protected money(value: number): string { return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(value ?? 0); }
}
