import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Colaborador } from '../../models/colaborador.model';

@Component({
  imports: [PaginacionComponent],
  selector: 'app-colaboradores-table',
  templateUrl: './colaboradores-table.component.html'
})
export class ColaboradoresTableComponent {
  @Input({ required: true }) colaboradores: Colaborador[] = [];
  @Input() expandedId = '';
  @Output() expandedIdChange = new EventEmitter<string>();
  @Output() editColaborador = new EventEmitter<Colaborador>();

  protected toggle(colaboradorId: string): void {
    this.expandedIdChange.emit(this.expandedId === colaboradorId ? '' : colaboradorId);
  }

  protected paginaActual = 0;
  protected porPagina = 10;

  protected get paginationConfig(): PaginacionConfig {
    const totalElementos = this.colaboradores.length;
    return {
      paginaActual: this.paginaActual,
      porPagina: this.porPagina,
      totalElementos,
      totalPaginas: Math.max(1, Math.ceil(totalElementos / this.porPagina))
    };
  }

  protected get paginatedColaboradores(): Colaborador[] {
    const inicio = this.paginaActual * this.porPagina;
    return this.colaboradores.slice(inicio, inicio + this.porPagina);
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }}


