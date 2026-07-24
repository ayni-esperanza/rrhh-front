import { CambioPaginaEvent, PaginacionComponent, PaginacionConfig } from '../../../../shared/components/paginacion/paginacion.component';
import { Component, inject } from '@angular/core';
import { EditarRegistroHorarioModalComponent } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.component';
import { AsistenciaRegistroEdicion } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.model';
import { AsistenciasService } from '../../services/asistencias.service';

type Turno = 'atiempo' | 'tarde' | 'falta' | 'vacio';

interface EntradaSalidaDia {
  dia: string;
  fecha: string;
  entrada: string;
  salida: string;
  turno: Turno;
}

interface EntradaSalidaSemana {
  id: number;
  colaborador: string;
  cargo: string;
  avatar: string;
  dias: EntradaSalidaDia[];
  total: string;
}

@Component({
  selector: 'app-entrada-salida-page',
  imports: [EditarRegistroHorarioModalComponent, PaginacionComponent],
  template: `
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 class="text-sm font-bold text-slate-950 dark:text-white">Hora de entrada y salida</h2></div>
        <div class="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>A tiempo</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-orange-500"></span>Tarde</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-red-500"></span>Falta</span>
        </div>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[1080px] text-left text-xs">
          <thead class="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              
              <th class="px-3 py-3">Colaborador</th>
              @for (dia of dias; track dia.dia) {
                <th class="px-3 py-3 text-center" colspan="2"><span class="block">{{ dia.dia }} {{ dia.fecha }}</span><span class="grid grid-cols-2 pt-2 text-[10px] font-semibold text-slate-500"><span>Entrada</span><span>Salida</span></span></th>
              }
              <th class="px-3 py-3 text-center">Total horas<br /><span class="text-[10px] text-slate-500">Semana</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-[11px] text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            @for (item of paginatedRegistros; track item.id) {
              <tr class="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/50" (click)="openEditarRegistro(item, item.dias[0])">
                <td class="px-3 py-3"><div class="flex items-center gap-2"><img class="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" [src]="item.avatar" [alt]="item.colaborador" /><div class="min-w-0"><p class="font-bold text-slate-900 dark:text-white">{{ item.colaborador }}</p><p class="text-[11px] text-slate-500">{{ item.cargo }}</p></div></div></td>
                @for (dia of item.dias; track dia.dia) {
                  @if (dia.turno === 'falta') {
                    <td class="px-2 py-3 text-center font-bold text-red-600" colspan="2" (click)="openEditarRegistro(item, dia); $event.stopPropagation()">- Falta</td>
                  } @else {
                    <td class="px-2 py-3 text-center" (click)="openEditarRegistro(item, dia); $event.stopPropagation()"><span class="inline-flex items-center gap-1.5" [class]="textClasses(dia.turno)"><span class="h-2 w-2 rounded-full" [class]="dotClasses(dia.turno)"></span>{{ dia.entrada }}</span></td>
                    <td class="px-2 py-3 text-center" (click)="openEditarRegistro(item, dia); $event.stopPropagation()"><span [class]="textClasses(dia.turno)">{{ dia.salida }}</span></td>
                  }
                }
                <td class="px-3 py-3 text-center font-bold text-slate-900 dark:text-white">{{ item.total }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
      <app-paginacion [config]="paginationConfig" [opcionesPorPagina]="[10, 25, 50]" (cambioPagina)="onPageChange($event)" />
    </section>

    <app-editar-registro-horario-modal [isOpen]="isEditModalOpen" [registro]="selectedRegistro" (closeModal)="closeEditarRegistro()" (saveChanges)="closeEditarRegistro()" />
  `
})
export class EntradaSalidaPageComponent {
  private readonly colaboradores = inject(AsistenciasService).getSemana();

  protected readonly dias = this.colaboradores[0]?.dias.map(({ dia, fecha }) => ({ dia, fecha })) ?? [];
  protected isEditModalOpen = false;
  protected selectedRegistro: AsistenciaRegistroEdicion | null = null;
  protected readonly registros: EntradaSalidaSemana[] = this.colaboradores.map((item, index) => ({
    id: item.id,
    colaborador: item.colaborador,
    cargo: item.cargo,
    avatar: item.avatar,
    total: ['43h 06m', '42h 47m', '34h 02m', '42h 19m', '42h 05m'][index] ?? item.total,
    dias: this.buildDias(index)
  }));

  protected paginaActual = 0;
  protected porPagina = 10;

  protected get paginationConfig(): PaginacionConfig {
    const totalElementos = this.registros.length;
    return { paginaActual: this.paginaActual, porPagina: this.porPagina, totalElementos, totalPaginas: Math.max(1, Math.ceil(totalElementos / this.porPagina)) };
  }

  protected get paginatedRegistros(): EntradaSalidaSemana[] {
    const inicio = this.paginaActual * this.porPagina;
    return this.registros.slice(inicio, inicio + this.porPagina);
  }

  protected onPageChange(event: CambioPaginaEvent): void {
    this.paginaActual = event.pagina;
    this.porPagina = event.porPagina;
  }

  protected openEditarRegistro(item: EntradaSalidaSemana, dia: EntradaSalidaDia): void {
    const empty = dia.turno === 'falta' || dia.turno === 'vacio';
    this.selectedRegistro = {
      colaborador: item.colaborador,
      cargo: item.cargo,
      avatar: item.avatar,
      fecha: `${dia.dia}, ${dia.fecha} de 2025`,
      entrada: dia.entrada === '-' ? '-' : `${dia.entrada} AM`,
      salida: dia.salida === '-' ? '-' : `${dia.salida} PM`,
      entradaAlmuerzo: empty ? '-' : '01:00 PM',
      salidaAlmuerzo: empty ? '-' : '02:00 PM',
      horasNormales: empty ? '-' : item.total,
      horasExtras: dia.turno === 'tarde' ? 'Tarde' : '-',
      tipoRegistro: dia.turno === 'tarde' ? 'Tarde' : dia.turno === 'falta' ? 'Falta' : 'Horas normales',
      estado: dia.turno === 'falta' ? 'Incompleto' : 'Completo',
      lugar: item.id % 2 === 0 ? 'Sucursal Sur' : 'Planta Principal - Linea de Produccion'
    };
    this.isEditModalOpen = true;
  }

  protected closeEditarRegistro(): void {
    this.isEditModalOpen = false;
  }

  protected dotClasses(turno: Turno): string {
    const classes = { atiempo: 'bg-emerald-500', tarde: 'bg-orange-500', falta: 'bg-red-500', vacio: 'bg-slate-300' };
    return classes[turno];
  }

  protected textClasses(turno: Turno): string {
    const classes = { atiempo: 'text-slate-800 dark:text-slate-200', tarde: 'font-semibold text-orange-600 dark:text-orange-300', falta: 'font-semibold text-red-600 dark:text-red-300', vacio: 'text-slate-500' };
    return classes[turno];
  }

  private buildDias(index: number): EntradaSalidaDia[] {
    const rows: EntradaSalidaDia[][] = [
      [this.day('Lun', '05/05', '07:45', '17:32'), this.day('Mar', '06/05', '07:55', '17:40'), this.day('Mie', '07/05', '07:50', '17:31'), this.day('Jue', '08/05', '07:35', '18:50'), this.day('Vie', '09/05', '07:45', '17:30'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')],
      [this.day('Lun', '05/05', '08:12', '17:45', 'tarde'), this.day('Mar', '06/05', '08:05', '17:42'), this.day('Mie', '07/05', '08:10', '17:50', 'tarde'), this.day('Jue', '08/05', '08:02', '17:41'), this.day('Vie', '09/05', '08:08', '17:46', 'tarde'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')],
      [this.day('Lun', '05/05', '07:40', '17:20'), this.day('Mar', '06/05', '07:42', '17:25'), this.missing('Mie', '07/05'), this.day('Jue', '08/05', '07:55', '17:30'), this.day('Vie', '09/05', '07:48', '17:22'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')],
      [this.day('Lun', '05/05', '08:00', '17:30'), this.day('Mar', '06/05', '08:03', '17:31'), this.day('Mie', '07/05', '08:02', '17:28'), this.day('Jue', '08/05', '08:10', '17:42', 'tarde'), this.day('Vie', '09/05', '08:01', '17:29'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')],
      [this.day('Lun', '05/05', '07:30', '17:20'), this.day('Mar', '06/05', '07:30', '17:25'), this.day('Mie', '07/05', '07:35', '17:20'), this.day('Jue', '08/05', '07:28', '17:18'), this.day('Vie', '09/05', '07:40', '17:30'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')]
    ];
    return rows[index] ?? rows[0];
  }

  private day(dia: string, fecha: string, entrada: string, salida: string, turno: Turno = 'atiempo'): EntradaSalidaDia { return { dia, fecha, entrada, salida, turno }; }
  private empty(dia: string, fecha: string): EntradaSalidaDia { return { dia, fecha, entrada: '-', salida: '-', turno: 'vacio' }; }
  private missing(dia: string, fecha: string): EntradaSalidaDia { return { dia, fecha, entrada: '-', salida: '-', turno: 'falta' }; }
}


