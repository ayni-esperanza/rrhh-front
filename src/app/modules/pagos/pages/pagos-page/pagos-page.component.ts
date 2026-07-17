import { CurrencyPipe } from '@angular/common';
import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { PagosService } from '../../services/pagos.service';

@Component({
  selector: 'app-pagos-page',
  imports: [CurrencyPipe, PageHeaderComponent],
  templateUrl: './pagos-page.component.html'
})
export class PagosPageComponent {
  protected readonly pagos = inject(PagosService).getPagos();
}