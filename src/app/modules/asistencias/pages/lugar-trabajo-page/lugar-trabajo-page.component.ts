import { Component, inject } from '@angular/core';
import { EditarRegistroHorarioModalComponent } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.component';
import { AsistenciaRegistroEdicion } from '../../components/editar-registro-horario-modal/editar-registro-horario-modal.model';
import { AsistenciasService } from '../../services/asistencias.service';

type LugarTipo = 'principal' | 'norte' | 'sur' | 'remoto' | 'vacio';

interface LugarDia {
  dia: string;
  fecha: string;
  valor: string;
  tipo: LugarTipo;
}

interface LugarSemana {
  id: number;
  colaborador: string;
  cargo: string;
  avatar: string;
  dias: LugarDia[];
  total: string;
}

@Component({
  selector: 'app-lugar-trabajo-page',
  imports: [EditarRegistroHorarioModalComponent],
  template: `
    <section class="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <header class="flex flex-col gap-3 border-b border-slate-200 px-4 py-4 dark:border-slate-800 lg:flex-row lg:items-center lg:justify-between">
        <div><h2 class="text-sm font-bold text-slate-950 dark:text-white">Lugar donde esta trabajando</h2></div>
        <div class="flex flex-wrap gap-3 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-blue-500"></span>Oficina Principal</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-emerald-500"></span>Sucursal Norte</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-orange-500"></span>Sucursal Sur</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-purple-500"></span>Remoto</span>
          <span class="inline-flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-slate-400"></span>Sin registro</span>
        </div>
      </header>

      <div class="overflow-x-auto">
        <table class="w-full min-w-[980px] text-left text-xs">
          <thead class="bg-slate-50 text-[11px] font-bold text-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <tr>
              
              <th class="px-3 py-3">Colaborador</th>
              @for (dia of dias; track dia.dia) { <th class="px-3 py-3 text-center">{{ dia.dia }} {{ dia.fecha }}</th> }
              <th class="px-3 py-3 text-center">Total dias<br />registrados<br /><span class="text-[10px] text-slate-500">Semana</span></th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-[11px] text-slate-800 dark:divide-slate-800 dark:text-slate-200">
            @for (item of registros; track item.id) {
              <tr class="cursor-pointer hover:bg-slate-50/70 dark:hover:bg-slate-800/50" (click)="openEditarRegistro(item, item.dias[0])">
                <td class="px-3 py-3"><div class="flex items-center gap-2"><img class="h-8 w-8 rounded-full object-cover ring-2 ring-white dark:ring-slate-800" [src]="item.avatar" [alt]="item.colaborador" /><div class="min-w-0"><p class="font-bold text-slate-900 dark:text-white">{{ item.colaborador }}</p><p class="text-[11px] text-slate-500">{{ item.cargo }}</p></div></div></td>
                @for (dia of item.dias; track dia.dia) { <td class="px-3 py-3 text-center" (click)="openEditarRegistro(item, dia); $event.stopPropagation()"><span class="inline-flex min-w-20 justify-center rounded-md px-2 py-1 font-semibold" [class]="badgeClasses(dia.tipo)">{{ dia.valor }}</span></td> }
                <td class="px-3 py-3 text-center font-bold text-slate-900 dark:text-white">{{ item.total }}</td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      <footer class="flex flex-col gap-2 border-t border-slate-200 px-4 py-3 text-[11px] text-slate-500 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
        <span>Mostrando 1 a 5 de 186 colaboradores</span>
        <nav class="flex items-center gap-1.5" aria-label="Paginacion"><button class="h-7 w-7 rounded-md border border-slate-200 text-slate-500 dark:border-slate-800" type="button" aria-label="Pagina anterior"><svg class="mx-auto h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m15 18-6-6 6-6"/></svg></button><button class="h-7 w-7 rounded-md border border-green-200 bg-green-50 font-semibold text-green-700 dark:border-green-500/30 dark:bg-green-500/10 dark:text-green-300" type="button">1</button><button class="h-7 w-7 rounded-md border border-slate-200 dark:border-slate-800" type="button">2</button><button class="h-7 w-7 rounded-md border border-slate-200 dark:border-slate-800" type="button">3</button><span class="px-1">...</span><button class="h-7 w-7 rounded-md border border-slate-200 dark:border-slate-800" type="button">38</button><button class="h-7 w-7 rounded-md border border-slate-200 text-slate-500 dark:border-slate-800" type="button" aria-label="Pagina siguiente"><svg class="mx-auto h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg></button></nav>
      </footer>
    </section>

    <app-editar-registro-horario-modal [isOpen]="isEditModalOpen" [registro]="selectedRegistro" (closeModal)="closeEditarRegistro()" (saveChanges)="closeEditarRegistro()" />
  `
})
export class LugarTrabajoPageComponent {
  private readonly colaboradores = inject(AsistenciasService).getSemana();

  protected readonly dias = this.colaboradores[0]?.dias.map(({ dia, fecha }) => ({ dia, fecha })) ?? [];
  protected isEditModalOpen = false;
  protected selectedRegistro: AsistenciaRegistroEdicion | null = null;
  protected readonly registros: LugarSemana[] = this.colaboradores.map((item, index) => ({ id: item.id, colaborador: item.colaborador, cargo: item.cargo, avatar: item.avatar, total: '5/5', dias: this.buildDias(index) }));

  protected openEditarRegistro(item: LugarSemana, dia: LugarDia): void {
    const empty = dia.tipo === 'vacio';
    this.selectedRegistro = {
      colaborador: item.colaborador,
      cargo: item.cargo,
      avatar: item.avatar,
      fecha: `${dia.dia}, ${dia.fecha} de 2025`,
      entrada: empty ? '-' : '08:00 AM',
      salida: empty ? '-' : '05:15 PM',
      entradaAlmuerzo: empty ? '-' : '01:00 PM',
      salidaAlmuerzo: empty ? '-' : '02:00 PM',
      horasNormales: empty ? '-' : '8h 15m',
      horasExtras: '-',
      tipoRegistro: empty ? 'Sin registro' : 'Horas normales',
      estado: empty ? 'Incompleto' : 'Completo',
      lugar: dia.valor
    };
    this.isEditModalOpen = true;
  }

  protected closeEditarRegistro(): void {
    this.isEditModalOpen = false;
  }

  protected badgeClasses(tipo: LugarTipo): string {
    const classes = {
      principal: 'bg-blue-50 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
      norte: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
      sur: 'bg-orange-50 text-orange-600 dark:bg-orange-500/10 dark:text-orange-300',
      remoto: 'bg-purple-50 text-purple-700 dark:bg-purple-500/10 dark:text-purple-300',
      vacio: 'bg-transparent text-slate-500'
    };
    return classes[tipo];
  }

  private buildDias(index: number): LugarDia[] {
    const rows: LugarDia[][] = [
      [this.place('Lun', '05/05', 'Oficina Principal', 'principal'), this.place('Mar', '06/05', 'Oficina Principal', 'principal'), this.place('Mie', '07/05', 'Sucursal Norte', 'norte'), this.place('Jue', '08/05', 'Oficina Principal', 'principal'), this.place('Vie', '09/05', 'Remoto', 'remoto'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')],
      [this.place('Lun', '05/05', 'Sucursal Sur', 'sur'), this.place('Mar', '06/05', 'Sucursal Sur', 'sur'), this.place('Mie', '07/05', 'Oficina Principal', 'principal'), this.place('Jue', '08/05', 'Sucursal Sur', 'sur'), this.place('Vie', '09/05', 'Sucursal Sur', 'sur'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')],
      [this.place('Lun', '05/05', 'Oficina Principal', 'principal'), this.place('Mar', '06/05', 'Oficina Principal', 'principal'), this.place('Mie', '07/05', 'Oficina Principal', 'principal'), this.place('Jue', '08/05', 'Oficina Principal', 'principal'), this.place('Vie', '09/05', 'Sucursal Norte', 'norte'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')],
      [this.place('Lun', '05/05', 'Sucursal Norte', 'norte'), this.place('Mar', '06/05', 'Sucursal Norte', 'norte'), this.place('Mie', '07/05', 'Remoto', 'remoto'), this.place('Jue', '08/05', 'Sucursal Norte', 'norte'), this.place('Vie', '09/05', 'Oficina Principal', 'principal'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')],
      [this.place('Lun', '05/05', 'Oficina Principal', 'principal'), this.place('Mar', '06/05', 'Remoto', 'remoto'), this.place('Mie', '07/05', 'Oficina Principal', 'principal'), this.place('Jue', '08/05', 'Oficina Principal', 'principal'), this.place('Vie', '09/05', 'Sucursal Norte', 'norte'), this.empty('Sab', '10/05'), this.empty('Dom', '11/05')]
    ];
    return rows[index] ?? rows[0];
  }

  private place(dia: string, fecha: string, valor: string, tipo: LugarTipo): LugarDia { return { dia, fecha, valor, tipo }; }
  private empty(dia: string, fecha: string): LugarDia { return { dia, fecha, valor: '-', tipo: 'vacio' }; }
}

