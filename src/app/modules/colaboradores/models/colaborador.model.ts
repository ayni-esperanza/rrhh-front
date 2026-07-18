export interface Colaborador {
  id: string;
  imagen: string;
  nombre: string;
  apellido: string;
  dni: string;
  cargo: string;
  telefonoEmergencia: string;
  estadoCivil: string;
  tallas: {
    camisa: string;
    pantalon: string;
    calzado: string;
  };
  estado: 'Activo' | 'Inactivo';
  fechaNacimiento: string;
  direccion: string;
  correo: string;
  fechaIngreso: string;
  tipoContrato: string;
  jornada: string;
  sueldoBasico: string;
  gradoInstruccion: string;
  cuentaBancaria: string;
  epsSeguro: string;
  contactoEmergencia: string;
  documentos: DocumentoColaborador[];
}

export interface DocumentoColaborador {
  nombre: string;
  estado: 'Vigente' | 'Por vencer' | 'Vencido';
}

export interface ColaboradorMetric {
  label: string;
  value: string;
  detail: string;
  icon: 'users' | 'calendar' | 'clock' | 'money';
  tone: 'blue' | 'purple' | 'amber' | 'emerald';
}
