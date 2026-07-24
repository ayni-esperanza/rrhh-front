import { Component, EventEmitter, Output } from '@angular/core';

@Component({
  selector: 'app-colaboradores-filters',
  templateUrl: './colaboradores-filters.component.html'
})
export class ColaboradoresFiltersComponent {
  @Output() newColaborador = new EventEmitter<void>();
}