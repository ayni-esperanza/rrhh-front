import { Component, inject } from '@angular/core';
import { ColaboradoresFiltersComponent, ColaboradoresFilterState } from '../../components/colaboradores-filters/colaboradores-filters.component';
import { ActivatedRoute, Router } from '@angular/router';
import { ColaboradoresMetricsComponent } from '../../components/colaboradores-metrics/colaboradores-metrics.component';
import { ColaboradoresTableComponent } from '../../components/colaboradores-table/colaboradores-table.component';
import { NuevoColaboradorModalComponent } from '../../components/nuevo-colaborador-modal/nuevo-colaborador-modal.component';
import { Colaborador } from '../../models/colaborador.model';
import { ColaboradoresFilterOptions, ColaboradoresService } from '../../services/colaboradores.service';
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ExportTable, TableExportService } from '../../../../shared/services/table-export.service';
import { SelectboxComponent } from '../../../../shared/components/selectbox/selectbox.component';
import { ConfiguracionLaboralModalComponent } from '../../components/configuracion-laboral-modal/configuracion-laboral-modal.component';
import { CambioPaginaEvent } from '../../../../shared/components/paginacion/paginacion.component';

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
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private filterTimer: ReturnType<typeof setTimeout> | null = null;

  protected metrics: import('../../models/colaborador.model').ColaboradorMetric[] = [];
  protected colaboradores: Colaborador[] = [];
  protected filters: ColaboradoresFilterState = this.filtersFromUrl();
  protected filterOptions: ColaboradoresFilterOptions = { areas: [], cargos: [], jornadas: [], documentos: [], estadosCiviles: [], gradosInstruccion: [], tiposSangre: [], camisas: [], pantalones: [], calzados: [] };
  protected page = this.positiveInteger(this.route.snapshot.queryParamMap.get('page'), 1);
  protected limit = this.allowedLimit(this.route.snapshot.queryParamMap.get('limit'));
  protected total = 0;
  protected totalPages = 1;
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

  constructor() {
    this.reload();
    this.colaboradoresService.getFilterOptions().subscribe((options) => this.filterOptions = options);
  }

  protected get filteredColaboradores(): Colaborador[] {
    return this.colaboradores;
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
    this.colaboradoresService.getColaborador(colaborador.id).subscribe((detail) => { this.selectedColaborador = detail; this.isNewColaboradorModalOpen = true; });
  }

  protected updateFilters(filters: ColaboradoresFilterState): void {
    this.filters = { ...filters };
    this.page = 1;
    this.expandedId = '';
    if (this.filterTimer) clearTimeout(this.filterTimer);
    this.filterTimer = setTimeout(() => {
      this.syncUrl();
      this.loadColaboradores();
    }, 300);
  }

  protected updatePage(event: CambioPaginaEvent): void {
    this.page = event.pagina + 1;
    this.limit = event.porPagina;
    this.expandedId = '';
    this.syncUrl();
    this.loadColaboradores();
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
    this.colaboradoresService.saveColaborador(colaborador).subscribe(() => { this.expandedId = ''; this.closeNewColaboradorModal(); this.reload(); });
  }

  protected updateSelectedColaboradores(ids: string[]): void {
    this.selectedColaboradorIds = ids;
  }

  protected updateSelectedStatus(estado: Colaborador['estado']): void {
    const selectedIds = new Set(this.selectedColaboradorIds);
    this.colaboradoresService.updateEstado(selectedIds, estado).subscribe(() => { this.selectedColaboradorIds = []; this.reload(); });
  }

  protected deleteSelectedColaboradores(): void {
    this.pendingDeletionIds = [...this.selectedColaboradorIds];
  }

  protected deleteColaborador(id: string): void {
    this.pendingDeletionIds = [id];
  }

  protected confirmDeletion(): void {
    const ids = new Set(this.pendingDeletionIds);
    const request = ids.size === 1
      ? this.colaboradoresService.deleteColaborador([...ids][0])
      : this.colaboradoresService.deleteColaboradores(ids);
    request.subscribe(() => { this.selectedColaboradorIds = this.selectedColaboradorIds.filter((id) => !ids.has(id)); this.pendingDeletionIds = []; this.expandedId = ''; this.closeNewColaboradorModal(); this.reload(); });
  }

  protected cancelDeletion(): void {
    this.pendingDeletionIds = [];
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
  private filtersFromUrl(): ColaboradoresFilterState {
    const params = this.route.snapshot.queryParamMap;
    const filters = this.emptyFilters();
    for (const key of Object.keys(filters) as Array<keyof ColaboradoresFilterState>) {
      const paramKey = key === 'area' || key === 'cargo' || key === 'jornada' ? `${key}Id` : key;
      filters[key] = params.get(paramKey) ?? '';
    }
    if (!['', 'Activo', 'Inactivo'].includes(filters.estado)) filters.estado = '';
    if (!['', 'Masculino', 'Femenino', 'No binario'].includes(filters.sexo)) filters.sexo = '';
    return filters;
  }

  private positiveInteger(value: string | null, fallback: number): number {
    const parsed = Number(value);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
  }

  private allowedLimit(value: string | null): number {
    const parsed = Number(value);
    return [10, 25, 50].includes(parsed) ? parsed : 10;
  }

  private syncUrl(): void {
    const queryParams: Record<string, string | number | null> = {};
    for (const [key, value] of Object.entries(this.filters)) {
      const paramKey = key === 'area' || key === 'cargo' || key === 'jornada' ? `${key}Id` : key;
      queryParams[paramKey] = value.trim() || null;
    }
    queryParams['page'] = this.page > 1 ? this.page : null;
    queryParams['limit'] = this.limit !== 10 ? this.limit : null;
    void this.router.navigate([], { relativeTo: this.route, queryParams, queryParamsHandling: 'merge', replaceUrl: true });
  }

  private loadColaboradores(): void {
    const sexo = ({ Masculino: 'MASCULINO', Femenino: 'FEMENINO', 'No binario': 'NO_BINARIO' } as const)[this.filters.sexo as 'Masculino' | 'Femenino' | 'No binario'];
    this.colaboradoresService.getColaboradores({
      search: this.filters.search,
      cargoId: this.filters.cargo || undefined,
      areaId: this.filters.area || undefined,
      jornadaId: this.filters.jornada || undefined,
      documento: this.filters.documento || undefined,
      estadoCivil: this.filters.estadoCivil || undefined,
      estado: this.filters.estado ? this.filters.estado.toUpperCase() as 'ACTIVO' | 'INACTIVO' : undefined,
      sexo,
      gradoInstruccion: this.filters.gradoInstruccion || undefined,
      tipoSangre: this.filters.tipoSangre || undefined,
      camisa: this.filters.camisa || undefined,
      pantalon: this.filters.pantalon || undefined,
      calzado: this.filters.calzado || undefined,
      page: this.page,
      limit: this.limit
    }).subscribe(({ data, meta }) => {
      this.colaboradores = data;
      this.total = meta.total;
      this.totalPages = Math.max(1, meta.totalPages);
      this.page = meta.page;
    });
  }

  private reload(): void {
    this.loadColaboradores();
    this.colaboradoresService.getMetrics().subscribe((metrics) => this.metrics = metrics);
  }
}
