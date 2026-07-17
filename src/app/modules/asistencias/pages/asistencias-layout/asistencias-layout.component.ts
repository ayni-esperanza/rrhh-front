import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { PageHeaderComponent } from '../../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-asistencias-layout',
  imports: [PageHeaderComponent, RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './asistencias-layout.component.html'
})
export class AsistenciasLayoutComponent {}