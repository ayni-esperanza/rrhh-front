export type DashboardReportChart = 'bar' | 'line' | 'pie';

export interface DashboardReportMetric {
  label: string;
  value: string;
  detail: string;
  tone: 'blue' | 'emerald' | 'amber' | 'violet';
}

export interface DashboardReportChartPoint {
  name: string;
  value?: number;
  series?: { name: string; value: number }[];
}

export interface DashboardReport {
  title: string;
  eyebrow: string;
  description: string;
  period: string;
  chart: DashboardReportChart;
  chartTitle: string;
  chartDescription: string;
  chartData: DashboardReportChartPoint[];
  colors: string[];
  metrics: DashboardReportMetric[];
  insights: { title: string; detail: string }[];
  tableTitle: string;
  tableDescription: string;
  columns: string[];
  rows: string[][];
}

const metric = (
  label: string,
  value: string,
  detail: string,
  tone: DashboardReportMetric['tone']
): DashboardReportMetric => ({ label, value, detail, tone });

const monthlySeries = (values: number[]): DashboardReportChartPoint[] => [{
  name: 'Asistencia',
  series: ['Ene', 'Feb', 'Mar', 'Abr', 'May'].map((name, index) => ({ name, value: values[index] ?? 0 }))
}];

export const DASHBOARD_REPORTS: Record<string, DashboardReport> = {
  'llegadas-tempranas': {
    title: 'Llegadas más tempranas', eyebrow: 'Puntualidad', period: 'Mayo 2025',
    description: 'Detalle de los colaboradores que registraron su ingreso antes del inicio de jornada.',
    chart: 'bar', chartTitle: 'Hora promedio de ingreso', chartDescription: 'Minutos antes de las 07:00 a. m.',
    chartData: [{ name: 'Luis Romero', value: 18 }, { name: 'Diego Sánchez', value: 15 }, { name: 'Juan Pérez', value: 12 }, { name: 'María Gonzales', value: 10 }, { name: 'Ana Rojas', value: 8 }, { name: 'José Castro', value: 7 }],
    colors: ['#10b981'],
    metrics: [metric('Mejor promedio', '06:42 AM', '18 min antes del turno', 'emerald'), metric('Ingresos anticipados', '84%', '+6.2% frente a abril', 'blue'), metric('Colaboradores', '36', 'Con asistencia perfecta', 'violet'), metric('Variación', '-3 min', 'Mejora mensual', 'amber')],
    insights: [{ title: 'Tendencia favorable', detail: 'El ingreso anticipado aumentó 6.2% respecto al mes anterior.' }, { title: 'Mayor consistencia', detail: 'Luis Romero llegó antes de las 06:50 en 20 jornadas.' }],
    tableTitle: 'Detalle por colaborador', tableDescription: 'Ranking ordenado por hora promedio de llegada.',
    columns: ['Colaborador', 'Área', 'Promedio', 'Días puntuales', 'Mejor registro'],
    rows: [['Luis Alberto Romero', 'Producción', '06:42 AM', '22', '06:31 AM'], ['Diego Sánchez', 'Mantenimiento', '06:45 AM', '21', '06:34 AM'], ['Juan Carlos Pérez', 'Logística', '06:48 AM', '21', '06:39 AM'], ['María F. Gonzales', 'Administración', '06:50 AM', '20', '06:42 AM'], ['Ana Lucía Rojas', 'Calidad', '06:52 AM', '20', '06:43 AM'], ['José Castro', 'Almacén', '06:53 AM', '19', '06:45 AM']]
  },
  'tardanzas-frecuentes': {
    title: 'Tardanzas frecuentes', eyebrow: 'Puntualidad', period: 'Mayo 2025',
    description: 'Seguimiento de reincidencia, minutos acumulados y evolución de tardanzas por colaborador.',
    chart: 'bar', chartTitle: 'Tardanzas registradas', chartDescription: 'Número de incidencias durante el mes.',
    chartData: [{ name: 'Pedro Villegas', value: 12 }, { name: 'José Torres', value: 9 }, { name: 'Kelvin Salazar', value: 8 }, { name: 'Óscar Huamán', value: 7 }, { name: 'David Rojas', value: 6 }, { name: 'Marco Díaz', value: 5 }],
    colors: ['#f59e0b'],
    metrics: [metric('Total de tardanzas', '47', 'Entre 18 colaboradores', 'amber'), metric('Minutos acumulados', '638 min', '13.6 min por evento', 'blue'), metric('Reincidencia', '38%', '-4% frente a abril', 'violet'), metric('Casos críticos', '3', 'Más de 8 tardanzas', 'emerald')],
    insights: [{ title: 'Concentración de casos', detail: 'Los tres primeros colaboradores reúnen el 61.7% de las incidencias.' }, { title: 'Horario más afectado', detail: 'El 54% de las tardanzas ocurrió en el primer turno.' }],
    tableTitle: 'Detalle de tardanzas', tableDescription: 'Incidencias y tiempo acumulado por colaborador.',
    columns: ['Colaborador', 'Área', 'Tardanzas', 'Minutos', 'Última incidencia'],
    rows: [['Pedro Villegas', 'Producción', '12', '164 min', '29 May'], ['José M. Torres', 'Almacén', '9', '121 min', '28 May'], ['Kelvin Salazar', 'Logística', '8', '106 min', '30 May'], ['Óscar Huamán', 'Mantenimiento', '7', '92 min', '27 May'], ['David Rojas', 'Calidad', '6', '84 min', '26 May'], ['Marco Díaz', 'Producción', '5', '71 min', '23 May']]
  },
  'empleados-con-faltas': {
    title: 'Empleados con más faltas', eyebrow: 'Ausencias', period: 'Mayo 2025',
    description: 'Análisis individual de faltas, justificaciones y recurrencia durante el periodo.',
    chart: 'bar', chartTitle: 'Faltas por colaborador', chartDescription: 'Total de días no laborados en mayo.',
    chartData: [{ name: 'Carlos Enríquez', value: 5 }, { name: 'Michael Quispe', value: 4 }, { name: 'Erick Mendoza', value: 3 }, { name: 'Renzo Tafur', value: 3 }, { name: 'Brayan López', value: 3 }, { name: 'Lucía Ramos', value: 2 }],
    colors: ['#ef4444'],
    metrics: [metric('Faltas registradas', '48', '20 justificadas', 'amber'), metric('Colaboradores', '29', 'Con al menos una falta', 'blue'), metric('Reincidentes', '8', 'Dos o más faltas', 'violet'), metric('Tasa mensual', '7.6%', '-2.1% frente a abril', 'emerald')],
    insights: [{ title: 'Seguimiento prioritario', detail: 'Ocho colaboradores concentran el 58% de las faltas del mes.' }, { title: 'Evolución positiva', detail: 'La tasa total disminuyó 2.1 puntos frente al periodo anterior.' }],
    tableTitle: 'Detalle de ausencias', tableDescription: 'Clasificación y estado de cada caso recurrente.',
    columns: ['Colaborador', 'Área', 'Faltas', 'Justificadas', 'Injustificadas'],
    rows: [['Carlos Enríquez', 'Almacén', '5', '2', '3'], ['Michael Quispe', 'Producción', '4', '1', '3'], ['Erick Mendoza', 'Logística', '3', '2', '1'], ['Renzo Tafur', 'Mantenimiento', '3', '1', '2'], ['Brayan López', 'Calidad', '3', '2', '1'], ['Lucía Ramos', 'Administración', '2', '2', '0']]
  },
  'faltas-justificadas': {
    title: 'Faltas justificadas e injustificadas', eyebrow: 'Ausencias', period: 'Mayo 2025',
    description: 'Distribución de ausencias según sustento y estado de validación.',
    chart: 'pie', chartTitle: 'Composición de faltas', chartDescription: 'Participación por tipo de justificación.',
    chartData: [{ name: 'Justificadas', value: 20 }, { name: 'Injustificadas', value: 28 }], colors: ['#facc15', '#ef4444'],
    metrics: [metric('Total de faltas', '48', '29 colaboradores', 'blue'), metric('Justificadas', '20', '41.7% del total', 'emerald'), metric('Injustificadas', '28', '58.3% del total', 'amber'), metric('Por validar', '4', 'Documentos pendientes', 'violet')],
    insights: [{ title: 'Principal motivo', detail: 'Los descansos médicos representan 45% de las faltas justificadas.' }, { title: 'Acción requerida', detail: 'Cuatro registros aún necesitan revisión documental.' }],
    tableTitle: 'Distribución por área', tableDescription: 'Faltas justificadas e injustificadas en cada equipo.',
    columns: ['Área', 'Total', 'Justificadas', 'Injustificadas', 'Tasa'],
    rows: [['Producción', '12', '5', '7', '6.8%'], ['Mantenimiento', '8', '3', '5', '7.4%'], ['Logística', '7', '3', '4', '7.9%'], ['Administración', '6', '4', '2', '5.1%'], ['Calidad', '7', '3', '4', '9.1%'], ['Almacén', '8', '2', '6', '11.4%']]
  },
  'ausentismo-por-area': {
    title: 'Ausentismo por área', eyebrow: 'Análisis organizacional', period: 'Mayo 2025',
    description: 'Comparación del porcentaje de ausencias entre equipos y proyectos.',
    chart: 'bar', chartTitle: 'Tasa de ausentismo', chartDescription: 'Porcentaje mensual por área.',
    chartData: [{ name: 'Producción', value: 4.2 }, { name: 'Mantenimiento', value: 6.7 }, { name: 'Logística', value: 7.9 }, { name: 'Administración', value: 8.3 }, { name: 'Calidad', value: 9.1 }, { name: 'Almacén', value: 11.4 }], colors: ['#22c55e', '#3b82f6', '#8b5cf6', '#fb923c', '#14b8a6', '#ef4444'],
    metrics: [metric('Promedio general', '7.6%', '-2.1% frente a abril', 'emerald'), metric('Mayor tasa', '11.4%', 'Área de Almacén', 'amber'), metric('Menor tasa', '4.2%', 'Área de Producción', 'blue'), metric('Brecha', '7.2 pp', 'Entre mayor y menor', 'violet')],
    insights: [{ title: 'Área prioritaria', detail: 'Almacén supera en 3.8 puntos el promedio de la organización.' }, { title: 'Mejor desempeño', detail: 'Producción mantiene la menor tasa por tercer mes consecutivo.' }],
    tableTitle: 'Detalle por área', tableDescription: 'Dotación, ausencias y variación mensual.',
    columns: ['Área', 'Dotación', 'Faltas', 'Tasa', 'Vs. abril'],
    rows: [['Producción', '46', '4', '4.2%', '-0.8 pp'], ['Mantenimiento', '28', '4', '6.7%', '-1.1 pp'], ['Logística', '31', '5', '7.9%', '+0.3 pp'], ['Administración', '24', '4', '8.3%', '-0.6 pp'], ['Calidad', '22', '4', '9.1%', '+0.8 pp'], ['Almacén', '35', '8', '11.4%', '-1.4 pp']]
  },
  'horas-trabajadas': {
    title: 'Horas trabajadas por empleado', eyebrow: 'Jornada laboral', period: 'Mayo 2025',
    description: 'Horas ordinarias y extraordinarias acumuladas por colaborador.',
    chart: 'bar', chartTitle: 'Promedio de horas por área', chartDescription: 'Horas ordinarias trabajadas durante el mes.',
    chartData: [{ name: 'Producción', value: 178.4 }, { name: 'Mantenimiento', value: 176.8 }, { name: 'Logística', value: 173.6 }, { name: 'Administración', value: 168.2 }, { name: 'Calidad', value: 171.5 }, { name: 'Almacén', value: 165.9 }], colors: ['#2563eb'],
    metrics: [metric('Promedio mensual', '172.4 h', '+4.1 h frente a abril', 'blue'), metric('Horas extras', '18.6 h', 'Promedio por empleado', 'violet'), metric('Cumplimiento', '94.8%', 'De la jornada planificada', 'emerald'), metric('Mayor registro', '196.5 h', 'Incluye horas extras', 'amber')],
    insights: [{ title: 'Carga más alta', detail: 'Producción registra 6 horas sobre el promedio general.' }, { title: 'Horas extraordinarias', detail: 'El 71% se concentra en Producción y Mantenimiento.' }],
    tableTitle: 'Detalle por colaborador', tableDescription: 'Horas ordinarias, extras y cumplimiento mensual.',
    columns: ['Colaborador', 'Área', 'Ordinarias', 'Extras', 'Cumplimiento'],
    rows: [['Luis Alberto Romero', 'Producción', '176.0 h', '20.5 h', '101.3%'], ['María F. Gonzales', 'Administración', '168.0 h', '8.2 h', '95.2%'], ['Diego Sánchez', 'Mantenimiento', '176.0 h', '18.7 h', '99.5%'], ['Juan Carlos Pérez', 'Logística', '172.0 h', '14.3 h', '97.1%'], ['Ana Lucía Rojas', 'Calidad', '171.5 h', '11.8 h', '96.4%'], ['José Castro', 'Almacén', '165.9 h', '9.6 h', '92.7%']]
  },
  'asistencia-mensual': {
    title: 'Asistencia mensual', eyebrow: 'Evolución', period: 'Enero — Mayo 2025',
    description: 'Evolución de la asistencia general y comparación con el objetivo organizacional.',
    chart: 'line', chartTitle: 'Evolución de asistencia', chartDescription: 'Porcentaje registrado durante los últimos cinco meses.',
    chartData: monthlySeries([88.1, 90.3, 91.7, 89.2, 92.4]), colors: ['#2563eb'],
    metrics: [metric('Asistencia actual', '92.4%', '+3.2 pp frente a abril', 'emerald'), metric('Promedio periodo', '90.3%', 'Enero a mayo', 'blue'), metric('Objetivo', '95.0%', 'Brecha de 2.6 pp', 'violet'), metric('Mejor mes', 'Mayo', 'Máximo del periodo', 'amber')],
    insights: [{ title: 'Recuperación mensual', detail: 'Mayo recuperó la caída registrada durante abril.' }, { title: 'Cerca del objetivo', detail: 'La brecha frente a la meta anual se redujo a 2.6 puntos.' }],
    tableTitle: 'Resumen mensual', tableDescription: 'Asistencias, ausencias y variación del indicador.',
    columns: ['Mes', 'Asistencia', 'Presentes', 'Ausencias', 'Variación'],
    rows: [['Enero', '88.1%', '164', '22', '—'], ['Febrero', '90.3%', '168', '18', '+2.2 pp'], ['Marzo', '91.7%', '171', '15', '+1.4 pp'], ['Abril', '89.2%', '166', '20', '-2.5 pp'], ['Mayo', '92.4%', '172', '14', '+3.2 pp']]
  },
  'costo-por-empleado': {
    title: 'Costo salarial por empleado', eyebrow: 'Costos laborales', period: 'Mayo 2025',
    description: 'Costo promedio y distribución de conceptos remunerativos por colaborador.',
    chart: 'pie', chartTitle: 'Composición del costo promedio', chartDescription: 'Distribución de la remuneración mensual.',
    chartData: [{ name: 'Sueldo base', value: 2140 }, { name: 'Beneficios', value: 421 }, { name: 'Aportes', value: 202 }, { name: 'Horas extras', value: 93.4 }], colors: ['#10b981', '#2563eb', '#8b5cf6', '#f59e0b'],
    metrics: [metric('Costo promedio', 'S/ 2,856.40', '+2.8% frente a abril', 'emerald'), metric('Mediana', 'S/ 2,710.00', 'Menor dispersión', 'blue'), metric('Costo máximo', 'S/ 6,840.20', 'Incluye beneficios', 'amber'), metric('Variación anual', '+6.4%', 'Frente a mayo 2024', 'violet')],
    insights: [{ title: 'Componente principal', detail: 'El sueldo base representa 74.9% del costo promedio.' }, { title: 'Cambio mensual', detail: 'Las horas extras explican 61% del incremento frente a abril.' }],
    tableTitle: 'Costo por área', tableDescription: 'Promedio, rango y variación del costo individual.',
    columns: ['Área', 'Colaboradores', 'Promedio', 'Máximo', 'Vs. abril'],
    rows: [['Producción', '46', 'S/ 2,942.10', 'S/ 5,620.00', '+3.4%'], ['Mantenimiento', '28', 'S/ 3,184.50', 'S/ 6,840.20', '+4.1%'], ['Logística', '31', 'S/ 2,710.20', 'S/ 4,980.00', '+1.8%'], ['Administración', '24', 'S/ 3,021.40', 'S/ 6,120.00', '+1.2%'], ['Calidad', '22', 'S/ 2,896.80', 'S/ 5,310.00', '+2.6%'], ['Almacén', '35', 'S/ 2,534.60', 'S/ 4,420.00', '+2.2%']]
  },
  'costo-por-area': {
    title: 'Costo salarial por área', eyebrow: 'Costos laborales', period: 'Mayo 2025',
    description: 'Distribución de la inversión salarial mensual entre áreas de la organización.',
    chart: 'bar', chartTitle: 'Costo total por área', chartDescription: 'Importes expresados en miles de soles.',
    chartData: [{ name: 'Producción', value: 135.3 }, { name: 'Mantenimiento', value: 89.2 }, { name: 'Logística', value: 84.0 }, { name: 'Administración', value: 72.5 }, { name: 'Calidad', value: 63.7 }, { name: 'Almacén', value: 88.0 }], colors: ['#3b82f6'],
    metrics: [metric('Costo total', 'S/ 532,680.50', '+2.5% frente a abril', 'blue'), metric('Mayor participación', '25.4%', 'Área de Producción', 'amber'), metric('Costo operativo', 'S/ 396,450', '74.4% del total', 'emerald'), metric('Presupuesto usado', '96.8%', 'Dentro de lo planificado', 'violet')],
    insights: [{ title: 'Mayor inversión', detail: 'Producción concentra S/ 135.3 mil por su nivel de dotación.' }, { title: 'Control presupuestal', detail: 'Todas las áreas permanecen dentro del presupuesto mensual.' }],
    tableTitle: 'Desglose de costos', tableDescription: 'Costo total, promedio y participación por área.',
    columns: ['Área', 'Dotación', 'Costo total', 'Promedio', 'Participación'],
    rows: [['Producción', '46', 'S/ 135,336.60', 'S/ 2,942.10', '25.4%'], ['Mantenimiento', '28', 'S/ 89,166.00', 'S/ 3,184.50', '16.7%'], ['Logística', '31', 'S/ 84,016.20', 'S/ 2,710.20', '15.8%'], ['Administración', '24', 'S/ 72,513.60', 'S/ 3,021.40', '13.6%'], ['Calidad', '22', 'S/ 63,729.60', 'S/ 2,896.80', '12.0%'], ['Almacén', '35', 'S/ 87,918.50', 'S/ 2,511.96', '16.5%']]
  },
  'horas-extras-pagadas': {
    title: 'Horas extras pagadas', eyebrow: 'Costos laborales', period: 'Mayo 2025',
    description: 'Horas extraordinarias aprobadas y costo asociado por área.',
    chart: 'bar', chartTitle: 'Horas extras por área', chartDescription: 'Horas aprobadas y pagadas durante mayo.',
    chartData: [{ name: 'Producción', value: 126.4 }, { name: 'Mantenimiento', value: 81.2 }, { name: 'Logística', value: 54.8 }, { name: 'Administración', value: 18.6 }, { name: 'Calidad', value: 29.3 }, { name: 'Almacén', value: 38.3 }], colors: ['#8b5cf6'],
    metrics: [metric('Horas pagadas', '348.6 h', '+9.4% frente a abril', 'violet'), metric('Costo total', 'S/ 12,458.60', '3.6% de la planilla', 'blue'), metric('Tarifa promedio', 'S/ 35.74', 'Por hora extraordinaria', 'emerald'), metric('Pendientes', '21.5 h', 'En proceso de aprobación', 'amber')],
    insights: [{ title: 'Mayor concentración', detail: 'Producción y Mantenimiento reúnen 59.6% de las horas extras.' }, { title: 'Pico operativo', detail: 'La tercera semana concentró el mayor volumen aprobado.' }],
    tableTitle: 'Detalle por área', tableDescription: 'Horas, costo y variación respecto al periodo anterior.',
    columns: ['Área', 'Horas', 'Colaboradores', 'Costo', 'Vs. abril'],
    rows: [['Producción', '126.4 h', '31', 'S/ 4,638.20', '+12.8%'], ['Mantenimiento', '81.2 h', '18', 'S/ 3,126.40', '+8.6%'], ['Logística', '54.8 h', '17', 'S/ 1,861.30', '+5.2%'], ['Administración', '18.6 h', '8', 'S/ 617.50', '-3.1%'], ['Calidad', '29.3 h', '11', 'S/ 1,037.80', '+7.4%'], ['Almacén', '38.3 h', '14', 'S/ 1,177.40', '+10.1%']]
  },
  'costo-planilla': {
    title: 'Costo de planilla', eyebrow: 'Costos laborales', period: 'Mayo 2025',
    description: 'Evolución del costo total de planilla y sus principales componentes.',
    chart: 'line', chartTitle: 'Evolución del costo de planilla', chartDescription: 'Importes mensuales expresados en miles de soles.',
    chartData: [{ name: 'Planilla', series: [{ name: 'Ene', value: 498.2 }, { name: 'Feb', value: 505.7 }, { name: 'Mar', value: 518.9 }, { name: 'Abr', value: 519.6 }, { name: 'May', value: 531.2 }] }], colors: ['#f59e0b'],
    metrics: [metric('Costo total', 'S/ 531,245.80', '+2.2% frente a abril', 'amber'), metric('Remuneraciones', 'S/ 398,460', '75.0% del total', 'blue'), metric('Aportes y beneficios', 'S/ 120,327', '22.7% del total', 'emerald'), metric('Horas extras', 'S/ 12,458.60', '2.3% del total', 'violet')],
    insights: [{ title: 'Dentro del presupuesto', detail: 'La ejecución alcanza 96.8% del monto previsto para mayo.' }, { title: 'Variación explicada', detail: 'Nuevas incorporaciones y horas extras impulsaron el aumento mensual.' }],
    tableTitle: 'Componentes de planilla', tableDescription: 'Importe, participación y variación por concepto.',
    columns: ['Concepto', 'Importe', 'Participación', 'Vs. abril', 'Presupuesto'],
    rows: [['Sueldos base', 'S/ 356,210.00', '67.1%', '+1.8%', '98.2%'], ['Asignaciones', 'S/ 42,250.00', '8.0%', '+2.4%', '95.1%'], ['Beneficios sociales', 'S/ 76,840.20', '14.5%', '+1.2%', '94.7%'], ['Aportes', 'S/ 43,486.90', '8.2%', '+0.9%', '96.4%'], ['Horas extras', 'S/ 12,458.60', '2.3%', '+9.4%', '93.8%']]
  },
  'comparacion-asistencia': {
    title: 'Comparación de asistencia entre meses', eyebrow: 'Evolución', period: 'Enero — Mayo 2025',
    description: 'Comparativa mensual del nivel de asistencia y sus variaciones.',
    chart: 'bar', chartTitle: 'Asistencia por mes', chartDescription: 'Porcentaje general registrado en cada periodo.',
    chartData: [{ name: 'Enero', value: 88.1 }, { name: 'Febrero', value: 90.3 }, { name: 'Marzo', value: 91.7 }, { name: 'Abril', value: 89.2 }, { name: 'Mayo', value: 92.4 }], colors: ['#fecdd3', '#fda4af', '#fb7185', '#f43f5e', '#e11d48'],
    metrics: [metric('Mejor resultado', '92.4%', 'Mayo 2025', 'emerald'), metric('Variación mensual', '+3.2 pp', 'Frente a abril', 'blue'), metric('Crecimiento periodo', '+4.3 pp', 'Desde enero', 'violet'), metric('Promedio', '90.3%', 'Últimos cinco meses', 'amber')],
    insights: [{ title: 'Máximo del periodo', detail: 'Mayo supera el registro de marzo por 0.7 puntos.' }, { title: 'Tendencia acumulada', detail: 'La asistencia mejoró 4.3 puntos desde el inicio del año.' }],
    tableTitle: 'Comparación mensual', tableDescription: 'Indicadores base y cambios entre periodos.',
    columns: ['Mes', 'Asistencia', 'Ausentismo', 'Variación', 'Meta'],
    rows: [['Enero', '88.1%', '11.9%', '—', '95.0%'], ['Febrero', '90.3%', '9.7%', '+2.2 pp', '95.0%'], ['Marzo', '91.7%', '8.3%', '+1.4 pp', '95.0%'], ['Abril', '89.2%', '10.8%', '-2.5 pp', '95.0%'], ['Mayo', '92.4%', '7.6%', '+3.2 pp', '95.0%']]
  }
};
