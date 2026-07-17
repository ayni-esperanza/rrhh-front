import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ReportesService } from '../../services/reportes.service';

@Component({
  selector: 'app-reportes-page',
  imports: [PageHeaderComponent],
  templateUrl: './reportes-page.component.html'
})
export class ReportesPageComponent {
  protected readonly reportes = inject(ReportesService).getReportes();
}