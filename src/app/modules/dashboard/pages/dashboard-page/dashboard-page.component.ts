import { Component } from '@angular/core';
import { DashboardAnalyticsRowComponent } from '../../components/dashboard-analytics-row/dashboard-analytics-row.component';
import { DashboardCostsRowComponent } from '../../components/dashboard-costs-row/dashboard-costs-row.component';
import { DashboardRankingRowComponent } from '../../components/dashboard-ranking-row/dashboard-ranking-row.component';
import { DashboardSummaryRowComponent } from '../../components/dashboard-summary-row/dashboard-summary-row.component';

@Component({
  selector: 'app-dashboard-page',
  imports: [DashboardSummaryRowComponent, DashboardRankingRowComponent, DashboardAnalyticsRowComponent, DashboardCostsRowComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {}
