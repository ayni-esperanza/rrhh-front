export type DashboardReportChart = 'bar' | 'line' | 'pie';
export interface DashboardReportMetric { label: string; value: string; detail: string; tone: 'blue' | 'emerald' | 'amber' | 'violet'; }
export interface DashboardReportChartPoint { name: string; value?: number; series?: { name: string; value: number }[]; }
export interface DashboardReport { title: string; eyebrow: string; description: string; period: string; chart: DashboardReportChart; chartTitle: string; chartDescription: string; chartData: DashboardReportChartPoint[]; colors: string[]; metrics: DashboardReportMetric[]; insights: { title: string; detail: string }[]; tableTitle: string; tableDescription: string; columns: string[]; rows: string[][]; }
const definition = (title: string, eyebrow: string): DashboardReport => ({ title, eyebrow, description: `Datos consolidados de ${title.toLowerCase()} para el periodo seleccionado.`, period: '', chart: 'bar', chartTitle: title, chartDescription: 'Información proporcionada por el backend.', chartData: [], colors: ['#2563eb'], metrics: [], insights: [], tableTitle: 'Detalle', tableDescription: 'Registros disponibles para el periodo.', columns: [], rows: [] });
export const DASHBOARD_REPORTS: Record<string, DashboardReport> = {
  'llegadas-tempranas': definition('Llegadas más tempranas', 'Puntualidad'),
  'tardanzas-frecuentes': definition('Tardanzas frecuentes', 'Tardanzas'),
  'empleados-con-faltas': definition('Empleados con más faltas', 'Ausencias'),
  'faltas-justificadas': definition('Faltas registradas', 'Ausencias'),
  'ausentismo-por-area': definition('Ausentismo por área', 'Asistencia'),
  'horas-trabajadas': definition('Horas trabajadas', 'Jornada'),
  'asistencia-mensual': definition('Asistencia mensual', 'Asistencia'),
  'costo-por-empleado': definition('Costo por empleado', 'Costos'),
  'costo-por-area': definition('Costo por área', 'Costos'),
  'horas-extras-pagadas': definition('Horas extras pagadas', 'Costos'),
  'costo-planilla': definition('Costo de planilla', 'Planilla'),
  'comparacion-asistencia': definition('Comparación de asistencia', 'Asistencia')
};
