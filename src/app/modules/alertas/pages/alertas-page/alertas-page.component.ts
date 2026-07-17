import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { AlertasService } from '../../services/alertas.service';

@Component({
  selector: 'app-alertas-page',
  imports: [PageHeaderComponent],
  templateUrl: './alertas-page.component.html'
})
export class AlertasPageComponent {
  protected readonly alertas = inject(AlertasService).getAlertas();
}