import { Component, inject } from '@angular/core';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';
import { UsuariosService } from '../../services/usuarios.service';

@Component({
  selector: 'app-usuarios-page',
  imports: [PageHeaderComponent],
  templateUrl: './usuarios-page.component.html'
})
export class UsuariosPageComponent {
  protected readonly usuarios = inject(UsuariosService).getUsuarios();
}