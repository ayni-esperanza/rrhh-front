import { Component } from '@angular/core';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';

@Component({
  selector: 'app-dashboard-ranking-row',
  imports: [NgxChartsModule],
  templateUrl: './dashboard-ranking-row.component.html'
})
export class DashboardRankingRowComponent {
  protected readonly temprano = [['Luis Alberto Romero', '06:42 AM'], ['Diego Sanchez', '06:45 AM'], ['Juan Carlos Perez', '06:48 AM'], ['Maria F. Gonzales', '06:50 AM'], ['Ana Lucia Rojas', '06:52 AM']];
  protected readonly tarde = [['Pedro Villegas', '12'], ['Jose M. Torres', '9'], ['Kelvin Salazar', '8'], ['Oscar Huaman', '7'], ['David Rojas', '6']];
  protected readonly faltas = [['Carlos Enriquez', '5'], ['Michael Quispe', '4'], ['Erick Mendoza', '3'], ['Renzo Tafur', '3'], ['Brayan Lopez', '3']];
  protected readonly absencesChart = [{ name: 'Justificadas', value: 20 }, { name: 'Injustificadas', value: 28 }];
  protected readonly absencesScheme: Color = { name: 'faltas', selectable: true, group: ScaleType.Ordinal, domain: ['#facc15', '#ef4444'] };
}
