import { Injectable } from '@angular/core';
import { Colaborador, ColaboradorMetric, DatosBancarios } from '../models/colaborador.model';

const DOCUMENTOS = [
  { nombre: 'DNI', estado: 'Vigente' as const },
  { nombre: 'Curriculum', estado: 'Vigente' as const },
  { nombre: 'Antecedentes', estado: 'Vigente' as const },
  { nombre: 'Certificados', estado: 'Vigente' as const }
];

@Injectable({ providedIn: 'root' })
export class ColaboradoresService {
  private colaboradores: Colaborador[] | null = null;

  getMetrics(): ColaboradorMetric[] {
    return [
      { label: 'Total colaboradores', value: '186', detail: 'Activos: 162 | Inactivos: 24', icon: 'users', tone: 'blue' },
      { label: 'Asistencia promedio (mes)', value: '92.4%', detail: '3.6% vs mes anterior', icon: 'calendar', tone: 'purple' },
      { label: 'Horas extras (mes)', value: '236 h', detail: '18 h vs mes anterior', icon: 'clock', tone: 'amber' },
      { label: 'Costo de planilla (mes)', value: 'S/ 185,420.00', detail: '7.8% vs mes anterior', icon: 'money', tone: 'emerald' }
    ];
  }

  getColaboradores(): Colaborador[] {
    if (this.colaboradores) return [...this.colaboradores];

    const colaboradores: Colaborador[] = [
      {
        id: '1',
        imagen: 'https://i.pravatar.cc/96?img=12',
        nombre: 'Luis Alberto',
        apellido: 'Romero',
        dni: '72945678',
        cargo: 'Tecnico Mecanico',
        telefonoEmergencia: '987 654 321',
        estadoCivil: 'Soltero',
        tallas: { camisa: 'M', pantalon: 'L', calzado: '42' },
        estado: 'Activo',
        fechaNacimiento: '15/06/1992',
        direccion: 'Av. Los Constructores 123, Trujillo',
        correo: 'luis.romero@empresa.com',
        fechaIngreso: '01/03/2022',
        tipoContrato: 'Indeterminado',
        jornada: 'Tiempo completo',
        sueldoBasico: '2800.00',
        gradoInstruccion: 'Tecnico',
        cuentaBancaria: '002-1234-567890123456',
        epsSeguro: 'Pacifico EPS',
        contactoEmergencia: 'Maria Romero - 987 123 456',
        documentos: DOCUMENTOS
      },
      {
        id: '2', imagen: 'https://i.pravatar.cc/96?img=47', nombre: 'Maria Fernanda', apellido: 'Lopez', dni: '74651234', cargo: 'Supervisora', telefonoEmergencia: '987 654 322', estadoCivil: 'Casada', tallas: { camisa: 'M', pantalon: 'L', calzado: '38' }, estado: 'Activo', fechaNacimiento: '24/11/1989', direccion: 'Jr. Primavera 450, Lima', correo: 'maria.lopez@empresa.com', fechaIngreso: '15/08/2021', tipoContrato: 'Indeterminado', jornada: 'Tiempo completo', sueldoBasico: '4200.00', gradoInstruccion: 'Universitario', cuentaBancaria: '002-2234-567890123456', epsSeguro: 'Rimac EPS', contactoEmergencia: 'Carlos Lopez - 987 223 456', documentos: DOCUMENTOS
      },
      {
        id: '3', imagen: 'https://i.pravatar.cc/96?img=13', nombre: 'Diego', apellido: 'Sanchez Perez', dni: '70894561', cargo: 'Soldador', telefonoEmergencia: '987 654 323', estadoCivil: 'Soltero', tallas: { camisa: 'M', pantalon: 'L', calzado: '41' }, estado: 'Activo', fechaNacimiento: '03/02/1994', direccion: 'Calle Norte 221, Arequipa', correo: 'diego.sanchez@empresa.com', fechaIngreso: '10/01/2023', tipoContrato: 'Plazo fijo', jornada: 'Tiempo completo', sueldoBasico: '2650.00', gradoInstruccion: 'Tecnico', cuentaBancaria: '002-3234-567890123456', epsSeguro: 'Pacifico EPS', contactoEmergencia: 'Rosa Perez - 987 323 456', documentos: DOCUMENTOS
      },
      {
        id: '4', imagen: 'https://i.pravatar.cc/96?img=32', nombre: 'Ana Lucia', apellido: 'Rojas', dni: '77345129', cargo: 'Operaria', telefonoEmergencia: '987 654 324', estadoCivil: 'Soltera', tallas: { camisa: 'M', pantalon: 'L', calzado: '37' }, estado: 'Activo', fechaNacimiento: '19/09/1997', direccion: 'Av. Industrial 980, Chiclayo', correo: 'ana.rojas@empresa.com', fechaIngreso: '20/05/2022', tipoContrato: 'Plazo fijo', jornada: 'Tiempo completo', sueldoBasico: '2100.00', gradoInstruccion: 'Secundaria completa', cuentaBancaria: '002-4234-567890123456', epsSeguro: 'SIS', contactoEmergencia: 'Lucia Rojas - 987 423 456', documentos: DOCUMENTOS
      },
      {
        id: '5', imagen: 'https://i.pravatar.cc/96?img=11', nombre: 'Jose Manuel', apellido: 'Torres', dni: '70122345', cargo: 'Electricista', telefonoEmergencia: '987 654 325', estadoCivil: 'Casado', tallas: { camisa: 'M', pantalon: 'L', calzado: '42' }, estado: 'Activo', fechaNacimiento: '28/04/1987', direccion: 'Pasaje Central 117, Piura', correo: 'jose.torres@empresa.com', fechaIngreso: '12/07/2020', tipoContrato: 'Indeterminado', jornada: 'Tiempo completo', sueldoBasico: '3050.00', gradoInstruccion: 'Tecnico', cuentaBancaria: '002-5234-567890123456', epsSeguro: 'Rimac EPS', contactoEmergencia: 'Elena Torres - 987 523 456', documentos: DOCUMENTOS
      },
      {
        id: '6', imagen: 'https://i.pravatar.cc/96?img=45', nombre: 'Carla', apellido: 'Mendoza Diaz', dni: '76543210', cargo: 'Administradora', telefonoEmergencia: '987 654 326', estadoCivil: 'Casada', tallas: { camisa: 'M', pantalon: 'L', calzado: '38' }, estado: 'Activo', fechaNacimiento: '07/12/1990', direccion: 'Av. El Sol 334, Cusco', correo: 'carla.mendoza@empresa.com', fechaIngreso: '05/02/2021', tipoContrato: 'Indeterminado', jornada: 'Tiempo completo', sueldoBasico: '3700.00', gradoInstruccion: 'Universitario', cuentaBancaria: '002-6234-567890123456', epsSeguro: 'Pacifico EPS', contactoEmergencia: 'Miguel Diaz - 987 623 456', documentos: DOCUMENTOS
      },
      {
        id: '7', imagen: 'https://i.pravatar.cc/96?img=15', nombre: 'Oscar', apellido: 'Huaman', dni: '71654433', cargo: 'Tecnico de Mantenimiento', telefonoEmergencia: '987 654 327', estadoCivil: 'Soltero', tallas: { camisa: 'M', pantalon: 'L', calzado: '40' }, estado: 'Inactivo', fechaNacimiento: '31/01/1995', direccion: 'Jr. Las Flores 765, Huancayo', correo: 'oscar.huaman@empresa.com', fechaIngreso: '18/06/2022', tipoContrato: 'Plazo fijo', jornada: 'Tiempo completo', sueldoBasico: '2450.00', gradoInstruccion: 'Tecnico', cuentaBancaria: '002-7234-567890123456', epsSeguro: 'SIS', contactoEmergencia: 'Nelly Huaman - 987 723 456', documentos: DOCUMENTOS
      }
    ];
    const cuentasPorId: Record<string, DatosBancarios[]> = {
      '1': [
        { entidadBancaria: 'BCP', cuentaBancaria: '001102450200456789', cci: '01124500020045678987', esPrincipal: true },
        { entidadBancaria: 'Interbank', cuentaBancaria: '200300456789012345', cci: '00320030045678901234', esPrincipal: false },
        { entidadBancaria: 'BBVA', cuentaBancaria: '001104560200123456', cci: '01145600020012345678', esPrincipal: false }
      ],
      '2': [
        { entidadBancaria: 'BCP', cuentaBancaria: '001102450200456790', cci: '01124500020045679088', esPrincipal: true },
        { entidadBancaria: 'Scotiabank', cuentaBancaria: '009300456789012345', cci: '00930030045678901235', esPrincipal: false }
      ],
      '3': [{ entidadBancaria: 'Interbank', cuentaBancaria: '200300456789012346', cci: '00320030045678901235', esPrincipal: true }],
      '4': [{ entidadBancaria: 'BBVA', cuentaBancaria: '001104560200123457', cci: '01145600020012345679', esPrincipal: true }],
      '5': [{ entidadBancaria: 'Scotiabank', cuentaBancaria: '009300456789012346', cci: '00930030045678901236', esPrincipal: true }]
    };

    this.colaboradores = colaboradores.map((colaborador) => {
      const datosBancarios = cuentasPorId[colaborador.id] ?? [];
      const principal = datosBancarios.find((cuenta) => cuenta.esPrincipal) ?? datosBancarios[0];
      return {
        ...colaborador,
        datosBancarios,
        cuentaBancaria: principal?.cuentaBancaria ?? colaborador.cuentaBancaria,
        cci: principal?.cci ?? colaborador.cci,
        entidadBancaria: principal?.entidadBancaria ?? colaborador.entidadBancaria
      };
    });
    return [...this.colaboradores];
  }

  saveColaborador(colaborador: Colaborador): Colaborador[] {
    const actuales = this.getColaboradores();
    const index = actuales.findIndex((item) => item.id === colaborador.id);
    this.colaboradores = index === -1
      ? [colaborador, ...actuales]
      : actuales.map((item) => item.id === colaborador.id ? colaborador : item);
    return [...this.colaboradores];
  }

  updateEstado(ids: ReadonlySet<string>, estado: Colaborador['estado']): Colaborador[] {
    this.colaboradores = this.getColaboradores().map((item) => ids.has(item.id) ? { ...item, estado } : item);
    return [...this.colaboradores];
  }

  deleteColaboradores(ids: ReadonlySet<string>): Colaborador[] {
    this.colaboradores = this.getColaboradores().filter((item) => !ids.has(item.id));
    return [...this.colaboradores];
  }
}
