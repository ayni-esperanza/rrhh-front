import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { DashboardAnalyticsRowComponent } from '../../components/dashboard-analytics-row/dashboard-analytics-row.component';
import { DashboardCostsRowComponent } from '../../components/dashboard-costs-row/dashboard-costs-row.component';
import { DashboardRankingRowComponent } from '../../components/dashboard-ranking-row/dashboard-ranking-row.component';
import { DashboardSummaryRowComponent } from '../../components/dashboard-summary-row/dashboard-summary-row.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [DatePickerComponent, DashboardSummaryRowComponent, DashboardRankingRowComponent, DashboardAnalyticsRowComponent, DashboardCostsRowComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  protected readonly selectedPeriod = signal(this.normalizePeriod(this.route.snapshot.queryParamMap.get('periodo')));
  protected readonly maxPeriod = this.toPeriodValue(new Date());

  protected changePeriod(period: string): void {
    const normalizedPeriod = this.normalizePeriod(period);
    this.selectedPeriod.set(normalizedPeriod);
    void this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { periodo: normalizedPeriod },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }

  private normalizePeriod(period: string | null): string {
    return /^\d{4}-(0[1-9]|1[0-2])$/.test(period ?? '') ? period! : '2025-05';
  }

  private toPeriodValue(date: Date): string {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
  }
}
