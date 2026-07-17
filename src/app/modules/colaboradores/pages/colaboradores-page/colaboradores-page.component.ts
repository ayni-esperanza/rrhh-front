import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { ColaboradoresService } from '../../services/colaboradores.service';

@Component({
  selector: 'app-colaboradores-page',
  imports: [PageHeaderComponent],
  templateUrl: './colaboradores-page.component.html'
})
export class ColaboradoresPageComponent {
  protected readonly colaboradores = inject(ColaboradoresService).getColaboradores();
}