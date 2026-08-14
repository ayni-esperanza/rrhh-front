import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { SelectSearchableComponent } from '../../../../shared/components/select-searchable/select-searchable.component';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { PagoColaborador, PagoMes } from '../../models/pago.model';

export interface PagosFilterState {
  search: string;
  dateFrom: string;
  dateTo: string;
  area: string;
  estado: PagoMes['estado'] | '';
  minAmount: number;
  maxAmount: number;
}

@Component({
  imports: [SelectSearchableComponent, DatePickerComponent],
  selector: 'app-pagos-filters',
  templateUrl: './pagos-filters.component.html',
  styleUrl: './pagos-filters.component.css'
})
export class PagosFiltersComponent implements OnChanges {
  @Input() pagos: PagoColaborador[] = [];
  @Output() filtersChange = new EventEmitter<PagosFilterState>();

  protected isFiltersOpen = false;
  protected minLimit = 0;
  protected maxLimit = 5000;
  protected filters: PagosFilterState = this.emptyFilters();
  protected readonly estadoOptions: PagoMes['estado'][] = ['Pagado', 'Abonado', 'Pendiente'];

  protected get areaOptions(): string[] {
    return Array.from(new Set(this.pagos.map((pago) => pago.area).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  }

  protected get selectedRangeStyle(): Record<string, string> {
    const span = Math.max(this.maxLimit - this.minLimit, 1);
    return {
      left: `${((this.filters.minAmount - this.minLimit) / span) * 100}%`,
      right: `${100 - ((this.filters.maxAmount - this.minLimit) / span) * 100}%`
    };
  }

  protected get hasAdvancedFilters(): boolean {
    return Boolean(this.filters.area || this.filters.estado || this.filters.minAmount !== this.minLimit || this.filters.maxAmount !== this.maxLimit);
  }

  protected get hasDateFilters(): boolean {
    return Boolean(this.filters.dateFrom || this.filters.dateTo);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!changes['pagos'] || !this.pagos.length) return;
    const amounts = this.pagos.map((pago) => this.moneyToNumber(pago.montoMensual));
    this.minLimit = Math.floor(Math.min(...amounts) / 100) * 100;
    this.maxLimit = Math.ceil(Math.max(...amounts) / 100) * 100;
    this.filters = { ...this.filters, minAmount: this.minLimit, maxAmount: this.maxLimit };
    this.emitFilters();
  }

  protected toggleFilters(): void {
    this.isFiltersOpen = !this.isFiltersOpen;
  }

  protected updateText(key: 'search' | 'area' | 'estado', value: string): void {
    this.filters = { ...this.filters, [key]: value } as PagosFilterState;
    this.emitFilters();
  }

  protected updateDate(key: 'dateFrom' | 'dateTo', value: string): void {
    const next = { ...this.filters, [key]: value };
    if (next.dateFrom && next.dateTo && next.dateFrom > next.dateTo) {
      if (key === 'dateFrom') next.dateTo = value;
      else next.dateFrom = value;
    }
    this.filters = next;
    this.emitFilters();
  }

  protected clearDates(): void {
    this.filters = { ...this.filters, dateFrom: '', dateTo: '' };
    this.emitFilters();
  }

  protected updateAmount(key: 'minAmount' | 'maxAmount', rawValue: string): void {
    const value = Number(rawValue);
    const next = { ...this.filters, [key]: value };
    if (next.minAmount > next.maxAmount) {
      if (key === 'minAmount') next.maxAmount = value;
      else next.minAmount = value;
    }
    this.filters = next;
    this.emitFilters();
  }

  protected clearAdvancedFilters(): void {
    this.filters = { ...this.filters, area: '', estado: '', minAmount: this.minLimit, maxAmount: this.maxLimit };
    this.emitFilters();
  }

  protected formatMoney(value: number): string {
    return `S/ ${value.toLocaleString('es-PE', { maximumFractionDigits: 0 })}`;
  }

  private emptyFilters(): PagosFilterState {
    return { search: '', dateFrom: '2025-05-01', dateTo: '2025-05-31', area: '', estado: '', minAmount: this.minLimit, maxAmount: this.maxLimit };
  }

  private emitFilters(): void {
    this.filtersChange.emit({ ...this.filters });
  }

  private moneyToNumber(value: string): number {
    return Number(value.replace(/[^0-9.]/g, '')) || 0;
  }
}
