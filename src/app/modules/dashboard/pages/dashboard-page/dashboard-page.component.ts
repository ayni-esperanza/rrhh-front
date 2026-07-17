import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { DashboardService } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-page',
  imports: [PageHeaderComponent],
  templateUrl: './dashboard-page.component.html'
})
export class DashboardPageComponent {
  protected readonly indicators = inject(DashboardService).getIndicators();
}