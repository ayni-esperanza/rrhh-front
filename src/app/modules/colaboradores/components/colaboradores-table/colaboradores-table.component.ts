import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Colaborador } from '../../models/colaborador.model';

@Component({
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
}

