import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

export interface PaginacionConfig {
  paginaActual: number;
  porPagina: number;
  totalElementos: number;
  totalPaginas: number;
}

export interface CambioPaginaEvent {
  pagina: number;
  porPagina: number;
}

@Component({
  selector: 'app-paginacion',
  imports: [CommonModule],
  templateUrl: './paginacion.component.html'
})
export class PaginacionComponent {
  @Input({ required: true }) config: PaginacionConfig = {
    paginaActual: 0,
    porPagina: 10,
    totalElementos: 0,
    totalPaginas: 0
  };
  @Input() opcionesPorPagina: number[] = [10, 25, 50];
  @Input() mostrarInfo = true;
  @Input() mostrarSelector = true;
  @Input() mostrarNavegacion = true;
  @Input() integradoEnTabla = true;

  @Output() cambioPagina = new EventEmitter<CambioPaginaEvent>();
  @Output() cambioTamano = new EventEmitter<number>();

  protected dropdownAbierto = false;

  protected get inicioRegistros(): number {
    return this.config.totalElementos === 0 ? 0 : this.config.paginaActual * this.config.porPagina + 1;
  }

  protected get finRegistros(): number {
    return Math.min((this.config.paginaActual + 1) * this.config.porPagina, this.config.totalElementos);
  }

  protected get puedeRetroceder(): boolean {
    return this.config.paginaActual > 0;
  }

  protected get puedeAvanzar(): boolean {
    return this.config.paginaActual < this.config.totalPaginas - 1;
  }

  protected toggleDropdown(): void {
    this.dropdownAbierto = !this.dropdownAbierto;
  }

  protected cerrarDropdown(): void {
    window.setTimeout(() => this.dropdownAbierto = false, 120);
  }

  protected seleccionarOpcion(opcion: number): void {
    this.dropdownAbierto = false;
    this.cambioTamano.emit(opcion);
    this.cambioPagina.emit({ pagina: 0, porPagina: opcion });
  }

  protected paginaAnterior(): void {
    if (this.puedeRetroceder) this.emitirPagina(this.config.paginaActual - 1);
  }

  protected paginaSiguiente(): void {
    if (this.puedeAvanzar) this.emitirPagina(this.config.paginaActual + 1);
  }

  private emitirPagina(pagina: number): void {
    this.cambioPagina.emit({ pagina, porPagina: this.config.porPagina });
  }
}
