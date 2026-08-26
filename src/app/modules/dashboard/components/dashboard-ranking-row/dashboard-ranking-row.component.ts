import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Color, NgxChartsModule, ScaleType } from '@swimlane/ngx-charts';
import { DashboardRankings } from '../../services/dashboard.service';

@Component({
  selector: 'app-dashboard-ranking-row',
  imports: [NgxChartsModule, RouterLink],
  templateUrl: './dashboard-ranking-row.component.html'
})
export class DashboardRankingRowComponent {
  @Input() rankings: DashboardRankings | null = null;
  @Input() totalAbsences = 0;
  protected get temprano(): string[][] { return (this.rankings?.llegadasTempranas ?? []).slice(0, 5).map((x) => [x.colaborador, `${Math.round(Number(x.minutos_antes))} min antes`]); }
  protected get tarde(): string[][] { return (this.rankings?.tardanzas ?? []).slice(0, 5).map((x) => [x.colaborador, String(x.tardanzas)]); }
  protected get faltas(): string[][] { return (this.rankings?.faltas ?? []).slice(0, 5).map((x) => [x.colaborador, String(x.faltas)]); }
  protected get absencesChart() { return [{ name: 'Faltas registradas', value: this.totalAbsences }]; }
  protected readonly absencesScheme: Color = { name: 'faltas', selectable: true, group: ScaleType.Ordinal, domain: ['#facc15', '#ef4444'] };
}
