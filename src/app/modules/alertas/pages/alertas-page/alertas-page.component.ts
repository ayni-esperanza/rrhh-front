import { Component, inject } from '@angular/core';
import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Alerta } from '../../models/alerta.model';
import { AlertasService } from '../../services/alertas.service';
import { SelectSearchableComponent, SelectSearchableRichOption } from '../../../../shared/components/select-searchable/select-searchable.component';

type AlertaTipo = Alerta['tipo'] | 'todas';

@Component({
  selector: 'app-alertas-page',
  imports: [PaginacionComponent, SelectSearchableComponent],
  templateUrl: './alertas-page.component.html'
})
export class AlertasPageComponent {
  protected readonly alertas = inject(AlertasService).getAlertas();
  protected search = '';
  protected selectedType: AlertaTipo = 'todas';
  protected selectedPriority: Alerta['prioridad'] | 'todas' = 'todas';
  protected minimumYears = 0;
  protected paginaActual = 0;
  protected porPagina = 10;
  protected readonly typeFilters: Array<{ value: AlertaTipo; label: string }> = [
    { value: 'todas', label: 'Todas' },
    { value: 'inasistencia', label: 'Inasistencias' },
    { value: 'pago', label: 'Pagos' },
    { value: 'cumpleanos', label: 'Cumpleaños' },
    { value: 'antiguedad', label: 'Tiempo de trabajo' }
  ];
  protected readonly priorityOptions: SelectSearchableRichOption[] = [
    { value: 'alta', label: 'Alta', color: '#f43f5e' },
    { value: 'media', label: 'Media', color: '#f59e0b' },
    { value: 'baja', label: 'Baja', color: '#94a3b8' }
  ];
  protected readonly yearsOptions: SelectSearchableRichOption[] = [
    { value: 1, label: '1 año o más' }, { value: 3, label: '3 años o más' },
    { value: 5, label: '5 años o más' }, { value: 10, label: '10 años o más' }
  ];

  protected get filteredAlertas(): Alerta[] {
    const search = this.normalize(this.search);
    return this.alertas.filter((alerta) => {
      const matchesText = !search || this.normalize(`${alerta.titulo} ${alerta.colaborador} ${alerta.detalle}`).includes(search);
      const matchesType = this.selectedType === 'todas' || alerta.tipo === this.selectedType;
      const matchesPriority = this.selectedPriority === 'todas' || alerta.prioridad === this.selectedPriority;
      const matchesYears = this.minimumYears === 0 || (alerta.tipo === 'antiguedad' && (alerta.aniosTrabajo ?? 0) >= this.minimumYears);
      return matchesText && matchesType && matchesPriority && matchesYears;
    });
  }

  protected get paginatedAlertas(): Alerta[] {
    const start = this.paginaActual * this.porPagina;
    return this.filteredAlertas.slice(start, start + this.porPagina);
  }

  protected get paginationConfig(): PaginacionConfig {
    const totalElementos = this.filteredAlertas.length;
    return { paginaActual: this.paginaActual, porPagina: this.porPagina, totalElementos, totalPaginas: Math.max(1, Math.ceil(totalElementos / this.porPagina)) };
  }

  protected get hasFilters(): boolean {
    return Boolean(this.search || this.selectedType !== 'todas' || this.selectedPriority !== 'todas' || this.minimumYears);
  }

  protected get unseenFilteredCount(): number {
    return this.filteredAlertas.filter((alerta) => !alerta.visto).length;
  }

  protected setSearch(value: string): void { this.search = value; this.resetPage(); }
  protected setType(type: AlertaTipo): void { this.selectedType = type; if (type !== 'antiguedad') this.minimumYears = 0; this.resetPage(); }
  protected setPriority(value: string): void { this.selectedPriority = value as Alerta['prioridad'] | 'todas'; this.resetPage(); }
  protected setMinimumYears(value: string): void { this.minimumYears = Number(value); if (this.minimumYears) this.selectedType = 'antiguedad'; this.resetPage(); }
  protected onPageChange(event: CambioPaginaEvent): void { this.paginaActual = event.pagina; this.porPagina = event.porPagina; }
  protected clearFilters(): void { this.search = ''; this.selectedType = 'todas'; this.selectedPriority = 'todas'; this.minimumYears = 0; this.resetPage(); }
  protected markAsSeen(alerta: Alerta): void { alerta.visto = true; }
  protected markFilteredAsSeen(): void { this.filteredAlertas.forEach((alerta) => alerta.visto = true); }

  protected typeLabel(type: Alerta['tipo']): string {
    return { inasistencia: 'Inasistencia', pago: 'Pago', cumpleanos: 'Cumpleaños', antiguedad: 'Tiempo de trabajo' }[type];
  }

  protected typeClasses(type: Alerta['tipo']): string {
    return {
      inasistencia: 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300',
      pago: 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
      cumpleanos: 'bg-violet-50 text-violet-700 ring-violet-600/20 dark:bg-violet-500/10 dark:text-violet-300',
      antiguedad: 'bg-blue-50 text-blue-700 ring-blue-600/20 dark:bg-blue-500/10 dark:text-blue-300'
    }[type];
  }

  protected priorityClasses(priority: Alerta['prioridad']): string {
    return priority === 'alta' ? 'text-rose-600 dark:text-rose-300' : priority === 'media' ? 'text-amber-600 dark:text-amber-300' : 'text-slate-500 dark:text-slate-400';
  }

  private resetPage(): void { this.paginaActual = 0; }
  private normalize(value: string): string { return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
}
