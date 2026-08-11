import { Component, ElementRef, EventEmitter, HostListener, Input, Output, ViewChild } from '@angular/core';
import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { SelectboxComponent } from '../../../../shared/components/selectbox/selectbox.component';
import { Colaborador, DocumentoColaborador } from '../../models/colaborador.model';

@Component({
  imports: [PaginacionComponent, SelectboxComponent],
  selector: 'app-colaboradores-table',
  templateUrl: './colaboradores-table.component.html'
})
export class ColaboradoresTableComponent {
  @Input({ required: true }) colaboradores: Colaborador[] = [];
  @Input() expandedId = '';
  @Output() expandedIdChange = new EventEmitter<string>();
  @Output() editColaborador = new EventEmitter<Colaborador>();
  @Output() selectedIdsChange = new EventEmitter<string[]>();

  protected selectedIds = new Set<string>();
  protected paginaActual = 0;
  protected porPagina = 10;
  private rowSelectionActive = false;
  private ignoreNextRowAction = false;
  private dragSelectionValue = false;
  private dragStartId: string | null = null;

  @ViewChild('selectionTable') private selectionTable?: ElementRef<HTMLTableElement>;

  protected toggle(colaboradorId: string): void {
    this.expandedIdChange.emit(this.expandedId === colaboradorId ? '' : colaboradorId);
  }

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

  protected get allPageRowsSelected(): boolean {
    return this.paginatedColaboradores.length > 0 && this.paginatedColaboradores.every(({ id }) => this.selectedIds.has(id));
  }

  protected get somePageRowsSelected(): boolean {
    return !this.allPageRowsSelected && this.paginatedColaboradores.some(({ id }) => this.selectedIds.has(id));
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }

  protected isSelected(colaboradorId: string): boolean {
    return this.selectedIds.has(colaboradorId);
  }

  protected toggleRowSelection(colaboradorId: string, isSelected: boolean): void {
    if (isSelected) this.selectedIds.add(colaboradorId);
    else this.selectedIds.delete(colaboradorId);

    this.emitSelectedIds();
  }

  protected togglePageSelection(isSelected: boolean): void {
    for (const { id } of this.paginatedColaboradores) {
      if (isSelected) this.selectedIds.add(id);
      else this.selectedIds.delete(id);
    }

    this.emitSelectedIds();
  }

  private emitSelectedIds(): void {
    this.selectedIdsChange.emit([...this.selectedIds]);
  }

  protected beginRowSelection(event: MouseEvent, colaboradorId: string): void {
    if (event.button !== 0 || this.isInteractiveTarget(event.target)) return;

    this.rowSelectionActive = true;
    this.dragStartId = colaboradorId;
    this.dragSelectionValue = !this.isSelected(colaboradorId);
  }

  protected extendRowSelection(colaboradorId: string): void {
    if (!this.rowSelectionActive || !this.dragStartId || colaboradorId === this.dragStartId) return;

    this.ignoreNextRowAction = true;
    this.setRowSelection(this.dragStartId, this.dragSelectionValue);
    this.setRowSelection(colaboradorId, this.dragSelectionValue);
  }

  protected onRowClick(colaborador: Colaborador): void {
    if (this.ignoreNextRowAction) return;
    this.editColaborador.emit(colaborador);
  }

  protected formatContactoEmergencia(nombre: string, parentesco?: string, telefono?: string): string {
    return [nombre, parentesco, telefono].filter(Boolean).join(' · ');
  }

  protected estadoDocumento(documento: DocumentoColaborador): DocumentoColaborador['estado'] {
    if (!documento.fechaVencimiento) return documento.estado;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(`${documento.fechaVencimiento}T00:00:00`);
    const daysRemaining = Math.ceil((expiration.getTime() - today.getTime()) / 86400000);

    if (daysRemaining < 0) return 'Vencido';
    if (daysRemaining <= 30) return 'Por vencer';
    return 'Vigente';
  }

  protected estadoDocumentoClase(documento: DocumentoColaborador): string {
    const status = this.estadoDocumento(documento);
    return status === 'Vencido' ? 'text-rose-600 dark:text-rose-300' : status === 'Por vencer' ? 'text-amber-600 dark:text-amber-300' : 'text-emerald-600 dark:text-emerald-300';
  }

  @HostListener('document:mouseup')
  protected finishRowSelection(): void {
    this.rowSelectionActive = false;
    this.dragStartId = null;
    window.setTimeout(() => this.ignoreNextRowAction = false, 0);
  }

  @HostListener('document:click', ['$event'])
  protected clearSelectionOutsideTable(event: MouseEvent): void {
    if (!this.selectionTable?.nativeElement.contains(event.target as Node) && this.selectedIds.size) {
      this.selectedIds.clear();
      this.emitSelectedIds();
    }
  }

  private setRowSelection(colaboradorId: string, isSelected: boolean): void {
    if (this.isSelected(colaboradorId) === isSelected) return;
    this.toggleRowSelection(colaboradorId, isSelected);
  }

  private isInteractiveTarget(target: EventTarget | null): boolean {
    return target instanceof Element && Boolean(target.closest('button, input, a, select, textarea, label, [data-no-row-selection]'));
  }
}
