import { Component, inject } from '@angular/core';
import { ColaboradoresFiltersComponent, ColaboradoresFilterState } from '../../components/colaboradores-filters/colaboradores-filters.component';
import { ColaboradoresMetricsComponent } from '../../components/colaboradores-metrics/colaboradores-metrics.component';
import { ColaboradoresTableComponent } from '../../components/colaboradores-table/colaboradores-table.component';
import { NuevoColaboradorModalComponent } from '../../components/nuevo-colaborador-modal/nuevo-colaborador-modal.component';
import { Colaborador } from '../../models/colaborador.model';
import { ColaboradoresService } from '../../services/colaboradores.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExportTable, TableExportService } from '../../../../shared/services/table-export.service';
import { SelectboxComponent } from '../../../../shared/components/selectbox/selectbox.component';
import { ConfiguracionLaboralModalComponent } from '../../components/configuracion-laboral-modal/configuracion-laboral-modal.component';

type ExportFormat = 'excel' | 'pdf';

interface ColaboradorExportColumn {
  key: string;
  header: string;
  value: (colaborador: Colaborador) => string;
}

@Component({
  selector: 'app-colaboradores-page',
  imports: [ColaboradoresMetricsComponent, ColaboradoresFiltersComponent, ColaboradoresTableComponent, NuevoColaboradorModalComponent, ConfiguracionLaboralModalComponent, ConfirmDialogComponent, SelectboxComponent],
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
  protected isConfiguracionLaboralModalOpen = false;
  protected selectedColaborador: Colaborador | null = null;
  protected selectedColaboradorIds: string[] = [];
  protected pendingDeletionIds: string[] = [];
  protected exportFormat: ExportFormat | null = null;
  protected readonly exportColumns: ColaboradorExportColumn[] = [
    { key: 'nombre', header: 'Nombres', value: (item) => item.nombre },
    { key: 'apellido', header: 'Apellidos', value: (item) => item.apellido },
    { key: 'dni', header: 'DNI', value: (item) => item.dni },
    { key: 'sexo', header: 'Sexo', value: (item) => item.sexo || '-' },
    { key: 'cargo', header: 'Cargo', value: (item) => item.cargo },
    { key: 'area', header: 'Área', value: (item) => item.area || '-' },
    { key: 'telefono', header: 'Teléfono', value: (item) => item.telefono || '-' },
    { key: 'correo', header: 'Correo', value: (item) => item.correo },
    { key: 'fechaNacimiento', header: 'Fecha de nacimiento', value: (item) => item.fechaNacimiento },
    { key: 'direccion', header: 'Dirección', value: (item) => item.direccion },
    { key: 'fechaIngreso', header: 'Fecha de ingreso', value: (item) => item.fechaIngreso },
    { key: 'contrato', header: 'Tipo de contrato', value: (item) => item.tipoContrato },
    { key: 'jornada', header: 'Jornada', value: (item) => item.jornada },
    { key: 'sueldo', header: 'Sueldo básico', value: (item) => this.formatSueldo(item.sueldoBasico) },
    { key: 'grado', header: 'Grado de instrucción', value: (item) => item.gradoInstruccion },
    { key: 'estadoCivil', header: 'Estado civil', value: (item) => item.estadoCivil },
    { key: 'seguro', header: 'EPS / Seguro', value: (item) => item.epsSeguro },
    { key: 'entidadBancaria', header: 'Entidad bancaria', value: (item) => this.bankValues(item, 'entidadBancaria') },
    { key: 'cuentaBancaria', header: 'N° de cuenta bancaria', value: (item) => this.bankValues(item, 'cuentaBancaria') },
    { key: 'cci', header: 'CCI', value: (item) => this.bankValues(item, 'cci') },
    { key: 'estado', header: 'Estado', value: (item) => item.estado }
  ];
  protected selectedExportColumnKeys = new Set<string>(['nombre', 'apellido', 'dni', 'cargo', 'area', 'telefono', 'correo', 'fechaIngreso', 'contrato', 'estado']);

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
    this.exportFormat = 'excel';
  }

  protected exportPdf(): void {
    this.exportFormat = 'pdf';
  }

  protected get allExportColumnsSelected(): boolean {
    return this.selectedExportColumnKeys.size === this.exportColumns.length;
  }

  protected get someExportColumnsSelected(): boolean {
    return this.selectedExportColumnKeys.size > 0 && !this.allExportColumnsSelected;
  }

  protected toggleExportColumn(key: string, selected: boolean): void {
    if (selected) this.selectedExportColumnKeys.add(key);
    else this.selectedExportColumnKeys.delete(key);
  }

  protected toggleAllExportColumns(selected: boolean): void {
    this.selectedExportColumnKeys = selected
      ? new Set(this.exportColumns.map(({ key }) => key))
      : new Set<string>();
  }

  protected closeExportColumnsModal(): void {
    this.exportFormat = null;
  }

  protected confirmExport(): void {
    if (!this.exportFormat || !this.selectedExportColumnKeys.size) return;
    const table = this.exportTable();
    if (this.exportFormat === 'excel') void this.tableExport.toExcel(table);
    else void this.tableExport.toPdf(table);
    this.closeExportColumnsModal();
  }

  protected saveColaborador(colaborador: Colaborador): void {
    this.colaboradores = this.colaboradoresService.saveColaborador(colaborador);
    this.expandedId = '';
    this.closeNewColaboradorModal();
  }

  protected updateSelectedColaboradores(ids: string[]): void {
    this.selectedColaboradorIds = ids;
  }

  protected updateSelectedStatus(estado: Colaborador['estado']): void {
    const selectedIds = new Set(this.selectedColaboradorIds);
    this.colaboradores = this.colaboradoresService.updateEstado(selectedIds, estado);
  }

  protected deleteSelectedColaboradores(): void {
    this.pendingDeletionIds = [...this.selectedColaboradorIds];
  }

  protected deleteColaborador(id: string): void {
    this.pendingDeletionIds = [id];
  }

  protected confirmDeletion(): void {
    const ids = new Set(this.pendingDeletionIds);
    this.colaboradores = this.colaboradoresService.deleteColaboradores(ids);
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
    const selectedColumns = this.exportColumns.filter(({ key }) => this.selectedExportColumnKeys.has(key));
    return {
      title: 'Colaboradores',
      fileName: 'colaboradores',
      columns: selectedColumns.map(({ key, header }) => ({ key, header })),
      rows: this.filteredColaboradores.map((item) => Object.fromEntries(selectedColumns.map((column) => [column.key, column.value(item)])))
    };
  }

  private formatSueldo(value: string): string {
    const amount = Number(value.replace(/[^\d.]/g, ''));
    return Number.isFinite(amount) ? `S/ ${amount.toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : value;
  }

  private bankValues(item: Colaborador, field: 'entidadBancaria' | 'cuentaBancaria' | 'cci'): string {
    const values = item.datosBancarios?.map((bank) => bank[field]).filter(Boolean) ?? [];
    if (values.length) return values.join(' | ');
    return item[field] || '-';
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
