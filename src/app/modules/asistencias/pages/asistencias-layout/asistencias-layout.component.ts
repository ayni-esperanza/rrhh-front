import { Component, inject } from '@angular/core';
import { AsistenciaMetric } from '../../models/asistencia.model';
import { AsistenciasService } from '../../services/asistencias.service';
import { EntradaSalidaPageComponent } from '../entrada-salida-page/entrada-salida-page.component';
import { HorasDiaPageComponent } from '../horas-dia-page/horas-dia-page.component';
import { LugarTrabajoPageComponent } from '../lugar-trabajo-page/lugar-trabajo-page.component';

type AsistenciaTab = 'horas-dia' | 'entrada-salida' | 'lugar-trabajo';

@Component({
  selector: 'app-asistencias-layout',
  imports: [HorasDiaPageComponent, EntradaSalidaPageComponent, LugarTrabajoPageComponent],
  templateUrl: './asistencias-layout.component.html'
})
export class AsistenciasLayoutComponent {
  protected readonly metrics = inject(AsistenciasService).getMetrics();
  protected activeTab: AsistenciaTab = 'horas-dia';

  protected setActiveTab(tab: AsistenciaTab): void {
    this.activeTab = tab;
  }

  protected tabClasses(tab: AsistenciaTab): string {
    return this.activeTab === tab ? 'border-[#22C55E] bg-green-50 text-green-700 dark:bg-green-500/10 dark:text-green-300' : 'border-transparent';
  }

  protected iconPath(icon: AsistenciaMetric['icon']): string {
    const paths = {
      users: 'M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5s-3 1.34-3 3 1.34 3 3 3Zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5 5 6.34 5 8s1.34 3 3 3Zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5C15 14.17 10.33 13 8 13Zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5Z',
      check: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm-1.2-6.2 6-6-1.4-1.4-4.6 4.6-2.2-2.2-1.4 1.4 3.6 3.6Z',
      clock: 'M12 22a10 10 0 1 1 0-20 10 10 0 0 1 0 20Zm1-10.4V7h-2v6h5v-2h-3Z',
      user: 'M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm-9 9a9 9 0 0 1 18 0H3Z',
      calendar: 'M7 2v2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2V2h-2v2H9V2H7Zm12 8H5v10h14V10Z'
    };
    return paths[icon];
  }

  protected toneClasses(tone: AsistenciaMetric['tone']): string {
    const tones = {
      blue: 'bg-blue-100 text-blue-600 dark:bg-blue-500/15 dark:text-blue-300',
      emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-300',
      amber: 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300',
      purple: 'bg-purple-100 text-purple-600 dark:bg-purple-500/15 dark:text-purple-300',
      rose: 'bg-rose-100 text-rose-600 dark:bg-rose-500/15 dark:text-rose-300'
    };
    return tones[tone];
  }
}

