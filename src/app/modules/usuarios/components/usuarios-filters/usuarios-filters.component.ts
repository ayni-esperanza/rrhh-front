import { Component, EventEmitter, Input, Output } from '@angular/core';
import { SelectSearchableComponent } from '../../../../shared/components/select-searchable/select-searchable.component';
import { Usuario } from '../../models/usuario.model';

export interface UsuariosFilterState {
  search: string;
  rol: Usuario['rol'] | '';
  estado: Usuario['estado'] | '';
}

@Component({
  imports: [SelectSearchableComponent],
  selector: 'app-usuarios-filters',
  templateUrl: './usuarios-filters.component.html'
})
export class UsuariosFiltersComponent {
  @Input({ required: true }) filters: UsuariosFilterState = { search: '', rol: '', estado: '' };
  @Output() filtersChange = new EventEmitter<UsuariosFilterState>();
  @Output() newUsuario = new EventEmitter<void>();

  protected readonly rolOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'rrhh', label: 'RR.HH.' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'colaborador', label: 'Colaborador' }
  ];
  protected readonly estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' }
  ];

  protected updateFilter(key: keyof UsuariosFilterState, value: string): void {
    this.filters = { ...this.filters, [key]: value } as UsuariosFilterState;
    this.filtersChange.emit({ ...this.filters });
  }
}
