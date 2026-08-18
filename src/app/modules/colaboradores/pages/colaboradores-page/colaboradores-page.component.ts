import { Component, inject } from '@angular/core';
import { ColaboradoresFiltersComponent, ColaboradoresFilterState } from '../../components/colaboradores-filters/colaboradores-filters.component';
import { ColaboradoresMetricsComponent } from '../../components/colaboradores-metrics/colaboradores-metrics.component';
import { ColaboradoresTableComponent } from '../../components/colaboradores-table/colaboradores-table.component';
import { NuevoColaboradorModalComponent } from '../../components/nuevo-colaborador-modal/nuevo-colaborador-modal.component';
import { Colaborador } from '../../models/colaborador.model';
import { ColaboradoresService } from '../../services/colaboradores.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExportTable, TableExportService } from '../../../../shared/services/table-export.service';

@Component({
  selector: 'app-colaboradores-page',
  imports: [ColaboradoresMetricsComponent, ColaboradoresFiltersComponent, ColaboradoresTableComponent, NuevoColaboradorModalComponent, ConfirmDialogComponent],
  templateUrl: './colaboradores-page.component.html'
})
export class ColaboradoresPageComponent {
  private readonly colaboradoresService = inject(ColaboradoresService);
  private readonly tableExport = inject(TableExportService);

  protected readonly metrics = this.colaboradoresService.getMetrics();
  protected colaboradores = this.colaboradoresService.getColaboradores();
  protected filters: ColaboradoresFilterState = this.emptyFilters();
  protected expandedId = '';
  protected isNewColaboradorModalOpen = false;
  protected selectedColaborador: Colaborador | null = null;
  protected selectedColaboradorIds: string[] = [];
  protected pendingDeletionIds: string[] = [];

  protected get filteredColaboradores(): Colaborador[] {
    const search = this.normalize(this.filters.search);
    return this.colaboradores.filter((colaborador) => {
      const matchesSearch = !search || this.normalize([
        colaborador.nombre,
        colaborador.apellido,
        colaborador.dni,
        colaborador.cargo,
        colaborador.correo
      ].join(' ')).includes(search);

      return matchesSearch
        && this.matchesFilter(colaborador.cargo, this.filters.cargo)
        && this.matchesFilter(colaborador.area ?? '', this.filters.area)
        && (!this.filters.documento || colaborador.documentos.some((documento) => documento.nombre === this.filters.documento))
        && this.matchesFilter(colaborador.estadoCivil, this.filters.estadoCivil)
        && this.matchesFilter(colaborador.estado, this.filters.estado)
        && this.matchesFilter(colaborador.sexo ?? '', this.filters.sexo)
        && this.matchesFilter(colaborador.jornada, this.filters.jornada)
        && this.matchesFilter(colaborador.gradoInstruccion, this.filters.gradoInstruccion)
        && this.matchesFilter(colaborador.tipoSangre ?? '', this.filters.tipoSangre)
        && this.matchesFilter(colaborador.tallas.camisa, this.filters.camisa)
        && this.matchesFilter(colaborador.tallas.pantalon, this.filters.pantalon)
        && this.matchesFilter(colaborador.tallas.calzado, this.filters.calzado);
    });
  }

  protected openNewColaboradorModal(): void {
    this.selectedColaborador = null;
    this.isNewColaboradorModalOpen = true;
  }

  protected closeNewColaboradorModal(): void {
    this.isNewColaboradorModalOpen = false;
    this.selectedColaborador = null;
  }

  protected editColaborador(colaborador: Colaborador): void {
    this.selectedColaborador = colaborador;
    this.isNewColaboradorModalOpen = true;
  }

  protected updateFilters(filters: ColaboradoresFilterState): void {
    this.filters = filters;
    this.expandedId = '';
  }

  protected exportExcel(): void {
    void this.tableExport.toExcel(this.exportTable());
  }

  protected exportPdf(): void {
    void this.tableExport.toPdf(this.exportTable());
  }

  protected saveColaborador(colaborador: Colaborador): void {
    const existingIndex = this.colaboradores.findIndex((item) => item.id === colaborador.id);
    this.colaboradores = existingIndex === -1
      ? [colaborador, ...this.colaboradores]
      : this.colaboradores.map((item) => item.id === colaborador.id ? colaborador : item);
    this.expandedId = '';
    this.closeNewColaboradorModal();
  }

  protected updateSelectedColaboradores(ids: string[]): void {
    this.selectedColaboradorIds = ids;
  }

  protected updateSelectedStatus(estado: Colaborador['estado']): void {
    const selectedIds = new Set(this.selectedColaboradorIds);
    this.colaboradores = this.colaboradores.map((colaborador) => selectedIds.has(colaborador.id) ? { ...colaborador, estado } : colaborador);
  }

  protected deleteSelectedColaboradores(): void {
    this.pendingDeletionIds = [...this.selectedColaboradorIds];
  }

  protected deleteColaborador(id: string): void {
    this.pendingDeletionIds = [id];
  }

  protected confirmDeletion(): void {
    const ids = new Set(this.pendingDeletionIds);
    this.colaboradores = this.colaboradores.filter((colaborador) => !ids.has(colaborador.id));
    this.selectedColaboradorIds = this.selectedColaboradorIds.filter((id) => !ids.has(id));
    this.pendingDeletionIds = [];
    this.expandedId = '';
    this.closeNewColaboradorModal();
  }

  protected cancelDeletion(): void {
    this.pendingDeletionIds = [];
  }

  private matchesFilter(value: string, filter: string): boolean {
    return !filter || value === filter;
  }

  private normalize(value: string): string {
    return value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }

  private exportTable(): ExportTable {
    return {
      title: 'Colaboradores',
      fileName: 'colaboradores',
      columns: [
        { key: 'nombre', header: 'Nombre completo' }, { key: 'dni', header: 'DNI' },
        { key: 'cargo', header: 'Cargo' }, { key: 'area', header: 'Área' },
        { key: 'telefono', header: 'Teléfono' }, { key: 'correo', header: 'Correo' },
        { key: 'ingreso', header: 'Fecha de ingreso' }, { key: 'contrato', header: 'Contrato' },
        { key: 'estado', header: 'Estado' }
      ],
      rows: this.filteredColaboradores.map((item) => ({
        nombre: `${item.nombre} ${item.apellido}`, dni: item.dni, cargo: item.cargo, area: item.area || '-',
        telefono: item.telefono || '-', correo: item.correo, ingreso: item.fechaIngreso,
        contrato: item.tipoContrato, estado: item.estado
      }))
    };
  }

  private emptyFilters(): ColaboradoresFilterState {
    return {
      search: '',
      cargo: '',
      area: '',
      documento: '',
      estadoCivil: '',
      estado: '',
      sexo: '',
      jornada: '',
      gradoInstruccion: '',
      tipoSangre: '',
      camisa: '',
      pantalon: '',
      calzado: ''
    };
  }
}
