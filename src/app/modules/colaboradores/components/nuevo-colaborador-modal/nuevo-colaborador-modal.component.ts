import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Colaborador, DocumentoColaborador } from '../../models/colaborador.model';

type ModalStep = 0 | 1 | 2 | 3;
type DocumentKey = 'dni' | 'curriculum' | 'antecedentes' | 'certificados';
type DocumentStatus = DocumentoColaborador['estado'];

interface UploadedDocument {
  file: File;
  url: string;
}

@Component({
  selector: 'app-nuevo-colaborador-modal',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './nuevo-colaborador-modal.component.html',
  styleUrl: './nuevo-colaborador-modal.component.css'
})
export class NuevoColaboradorModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() colaborador: Colaborador | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveColaborador = new EventEmitter<Colaborador>();

  private readonly formBuilder = inject(FormBuilder);

  protected readonly steps = [
    { label: 'Información personal', icon: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
    { label: 'Información laboral', icon: 'M10 6h4m-7 4h10m-9 9h8a3 3 0 003-3v-5a3 3 0 00-3-3H8a3 3 0 00-3 3v5a3 3 0 003 3z' },
    { label: 'Información adicional', icon: 'M12 8h.01M11 12h1v4h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Documentos', icon: 'M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2zM14 3v6h5' }
  ] as const;
  protected currentStep: ModalStep = 0;
  protected readonly cargoOptions = ['Técnico mecánico', 'Supervisora', 'Soldador', 'Operaria', 'Electricista', 'Administradora', 'Técnico de Mantenimiento', 'Analista de Recursos Humanos', 'Asistente administrativo'] as const;
  protected readonly gradoInstruccionOptions = ['Secundaria completa', 'Técnico', 'Universitario', 'Bachiller', 'Titulado', 'Maestría'] as const;
  protected readonly seguroOptions = ['Rimac EPS', 'Pacífico EPS', 'SIS', 'EsSalud', 'Mapfre EPS', 'Sin seguro'] as const;
  protected readonly parentescoOptions = ['Madre', 'Padre', 'Hermano/a', 'Cónyuge', 'Pareja', 'Hijo/a', 'Tío/a', 'Primo/a', 'Amigo/a'] as const;
  public readonly documentDefinitions: ReadonlyArray<{ key: DocumentKey; label: string }> = [
    { key: 'dni', label: 'DNI' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'antecedentes', label: 'Antecedentes' },
    { key: 'certificados', label: 'Certificados' }
  ];
  public readonly documentFiles: Partial<Record<DocumentKey, UploadedDocument>> = {};

  protected readonly form = this.formBuilder.group({
    personal: this.formBuilder.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      dni: ['', [Validators.required, Validators.minLength(8)]],
      sexo: ['Masculino', Validators.required],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', Validators.required],
      estadoCivil: ['Soltero', Validators.required],
      camisa: ['M', Validators.required],
      pantalon: ['L', Validators.required],
      calzado: ['', Validators.required]
    }),
    laboral: this.formBuilder.group({
      cargo: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      tipoContrato: ['Indeterminado', Validators.required],
      jornada: ['Tiempo completo', Validators.required],
      sueldoBasico: ['', Validators.required],
      estado: ['Activo' as 'Activo' | 'Inactivo', Validators.required]
    }),
    adicional: this.formBuilder.group({
      gradoInstruccion: ['', Validators.required],
      hijos: ['0', Validators.required],
      lugarNacimiento: ['', Validators.required],
      tipoSangre: ['', Validators.required],
      cuentaBancaria: ['', Validators.required],
      epsSeguro: ['', Validators.required],
      contactosEmergencia: this.formBuilder.array<FormGroup>([])
    }),
    documentos: this.formBuilder.group({
      dni: ['', Validators.required],
      curriculum: ['', Validators.required],
      antecedentes: ['', Validators.required],
      certificados: ['', Validators.required]
    })
  });
  public ngOnChanges(changes: SimpleChanges): void {
    if (!changes['colaborador']) return;

    this.configureDocumentValidation();
    if (this.colaborador) {
      this.loadColaborador(this.colaborador);
    } else {
      this.reset();
    }
  }

  public get isEditing(): boolean {
    return this.colaborador !== null;
  }
  public get contactosEmergencia() {
    return this.form.controls.adicional.controls.contactosEmergencia;
  }

  protected get edadActual(): string {
    const fechaNacimiento = this.personal.controls.fechaNacimiento.value;
    if (!fechaNacimiento) return 'Sin fecha';

    const nacimiento = new Date(`${fechaNacimiento}T00:00:00`);
    if (Number.isNaN(nacimiento.getTime())) return 'Sin fecha';

    const hoy = new Date();
    let edad = hoy.getFullYear() - nacimiento.getFullYear();
    const mesPendiente = hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate());
    if (mesPendiente) edad -= 1;

    return edad >= 0 ? `${edad} años` : 'Fecha futura';
  }

  public agregarContactoEmergencia(nombre = '', parentesco = '', telefono = ''): void {
    this.contactosEmergencia.push(this.formBuilder.group({ nombre: [nombre], parentesco: [parentesco], telefono: [telefono] }));
  }

  public eliminarContactoEmergencia(index: number): void {
    this.contactosEmergencia.removeAt(index);
  }
  protected get personal() { return this.form.controls.personal; }
  protected get laboral() { return this.form.controls.laboral; }
  protected get adicional() { return this.form.controls.adicional; }
  protected get documentos() { return this.form.controls.documentos; }

  protected currentGroup() {
    return [this.personal, this.laboral, this.adicional, this.documentos][this.currentStep];
  }

  protected goToStep(step: number): void {
    this.currentStep = step as ModalStep;
  }

  public onFileSelected(event: Event, key: DocumentKey): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.removeDocument(key);
    this.documentFiles[key] = { file, url: URL.createObjectURL(file) };
    input.value = '';
  }

  public viewDocument(key: DocumentKey): void {
    const document = this.documentFiles[key];
    if (document) window.open(document.url, '_blank', 'noopener,noreferrer');
  }

  public downloadDocument(key: DocumentKey): void {
    const document = this.documentFiles[key];
    if (!document) return;

    const anchor = window.document.createElement('a');
    anchor.href = document.url;
    anchor.download = document.file.name;
    anchor.click();
  }

  public removeDocument(key: DocumentKey): void {
    const document = this.documentFiles[key];
    if (!document) return;

    URL.revokeObjectURL(document.url);
    delete this.documentFiles[key];
  }

  public documentStatus(key: DocumentKey): DocumentStatus | 'Sin fecha' {
    const expirationDate = this.documentos.controls[key].value;
    if (!expirationDate) {
      const label = this.documentDefinitions.find((item) => item.key === key)?.label;
      return this.colaborador?.documentos.find((item) => item.nombre === label)?.estado ?? 'Sin fecha';
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiration = new Date(`${expirationDate}T00:00:00`);
    const daysRemaining = Math.ceil((expiration.getTime() - today.getTime()) / 86400000);

    if (daysRemaining < 0) return 'Vencido';
    if (daysRemaining <= 30) return 'Por vencer';
    return 'Vigente';
  }

  public documentStatusClasses(status: DocumentStatus | 'Sin fecha'): string {
    const classes: Record<DocumentStatus | 'Sin fecha', string> = {
      'Vigente': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300',
      'Por vencer': 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-500/10 dark:text-amber-300',
      'Vencido': 'bg-rose-50 text-rose-700 ring-rose-600/20 dark:bg-rose-500/10 dark:text-rose-300',
      'Sin fecha': 'bg-slate-100 text-slate-500 ring-slate-500/20 dark:bg-slate-800 dark:text-slate-400'
    };
    return classes[status];
  }

  public formatFileSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  protected nextStep(): void {
    const group = this.currentGroup();
    group.markAllAsTouched();

    if (group.invalid) {
      return;
    }

    if (this.currentStep < 3) {
      this.currentStep = (this.currentStep + 1) as ModalStep;
    }
  }

  protected previousStep(): void {
    if (this.currentStep > 0) {
      this.currentStep = (this.currentStep - 1) as ModalStep;
    }
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.currentStep = this.firstInvalidStep();
      return;
    }

    const value = this.form.getRawValue();
    const contactosEmergencia = value.adicional.contactosEmergencia
      .map((contacto) => ({ nombre: contacto['nombre'] ?? '', parentesco: contacto['parentesco'] ?? '', telefono: contacto['telefono'] ?? '' }))
      .filter((contacto) => contacto.nombre || contacto.parentesco || contacto.telefono);
    this.saveColaborador.emit({
      id: this.colaborador?.id ?? `nuevo-${Date.now()}`,
      imagen: this.colaborador?.imagen ?? 'https://i.pravatar.cc/96?img=5',
      nombre: value.personal.nombre || '',
      apellido: [value.personal.apellidoPaterno, value.personal.apellidoMaterno].filter(Boolean).join(' '),
      apellidoPaterno: value.personal.apellidoPaterno || '',
      apellidoMaterno: value.personal.apellidoMaterno || '',
      dni: value.personal.dni || '',
      sexo: (value.personal.sexo || 'Masculino') as Colaborador['sexo'],
      hijos: value.adicional.hijos || '0',
      cargo: value.laboral.cargo || '',
      telefono: value.personal.telefono || '',
      telefonoEmergencia: contactosEmergencia[0]?.telefono ?? '',
      contactosEmergencia,
      estadoCivil: value.personal.estadoCivil || '',
      tallas: {
        camisa: value.personal.camisa || '',
        pantalon: value.personal.pantalon || '',
        calzado: value.personal.calzado || ''
      },
      estado: value.laboral.estado || 'Activo',
      fechaNacimiento: this.formatDate(value.personal.fechaNacimiento || ''),
      direccion: value.personal.direccion || '',
      correo: value.personal.correo || '',
      fechaIngreso: this.formatDate(value.laboral.fechaIngreso || ''),
      tipoContrato: value.laboral.tipoContrato || '',
      jornada: value.laboral.jornada || '',
      sueldoBasico: value.laboral.sueldoBasico || '',
      gradoInstruccion: value.adicional.gradoInstruccion || '',
      lugarNacimiento: value.adicional.lugarNacimiento || '',
      tipoSangre: value.adicional.tipoSangre || '',
      cuentaBancaria: value.adicional.cuentaBancaria || '',
      epsSeguro: value.adicional.epsSeguro || '',
      contactoEmergencia: contactosEmergencia[0] ? [contactosEmergencia[0].nombre, contactosEmergencia[0].parentesco, contactosEmergencia[0].telefono].filter(Boolean).join(' - ') : '',
      documentos: [
        { nombre: 'DNI', estado: this.documentStatus('dni') as DocumentStatus },
        { nombre: 'Curriculum', estado: this.documentStatus('curriculum') as DocumentStatus },
        { nombre: 'Antecedentes', estado: this.documentStatus('antecedentes') as DocumentStatus },
        { nombre: 'Certificados', estado: this.documentStatus('certificados') as DocumentStatus }
      ]
    });

    this.reset();
  }

  protected close(): void {
    this.reset();
    this.closeModal.emit();
  }


  private loadColaborador(colaborador: Colaborador): void {
    this.currentStep = 0;
    this.contactosEmergencia.clear();
    const contactos = colaborador.contactosEmergencia ?? (colaborador.telefonoEmergencia ? [{ nombre: '', parentesco: '', telefono: colaborador.telefonoEmergencia }] : []);
    contactos.forEach((contacto) => this.agregarContactoEmergencia(contacto.nombre, contacto.parentesco ?? '', contacto.telefono));
    this.form.patchValue({
      personal: {
        nombre: colaborador.nombre,
        apellidoPaterno: colaborador.apellidoPaterno ?? colaborador.apellido.split(' ')[0] ?? '',
        apellidoMaterno: colaborador.apellidoMaterno ?? colaborador.apellido.split(' ').slice(1).join(' '),
        dni: colaborador.dni,
        sexo: colaborador.sexo ?? 'Masculino',
        fechaNacimiento: this.dateToInput(colaborador.fechaNacimiento),
        direccion: colaborador.direccion,
        correo: colaborador.correo,
        telefono: colaborador.telefono ?? '',
        estadoCivil: colaborador.estadoCivil,
        camisa: colaborador.tallas.camisa,
        pantalon: colaborador.tallas.pantalon,
        calzado: colaborador.tallas.calzado
      },
      laboral: {
        cargo: colaborador.cargo,
        fechaIngreso: this.dateToInput(colaborador.fechaIngreso),
        tipoContrato: colaborador.tipoContrato,
        jornada: colaborador.jornada,
        sueldoBasico: colaborador.sueldoBasico,
        estado: colaborador.estado
      },
      adicional: {
        gradoInstruccion: colaborador.gradoInstruccion,
        hijos: colaborador.hijos ?? '0',
        lugarNacimiento: colaborador.lugarNacimiento ?? '',
        tipoSangre: colaborador.tipoSangre ?? '',
        cuentaBancaria: colaborador.cuentaBancaria,
        epsSeguro: colaborador.epsSeguro,
      },
      documentos: { dni: '', curriculum: '', antecedentes: '', certificados: '' }
    });
  }

  private configureDocumentValidation(): void {
    this.documentDefinitions.forEach(({ key }) => {
      const control = this.documentos.controls[key];
      if (this.colaborador) {
        control.clearValidators();
      } else {
        control.setValidators(Validators.required);
      }
      control.updateValueAndValidity({ emitEvent: false });
    });
  }

  private dateToInput(value: string): string {
    const parts = value.split('/');
    return parts.length === 3 ? `${parts[2]}-${parts[1]}-${parts[0]}` : value;
  }
  private firstInvalidStep(): ModalStep {
    const groups = [this.personal, this.laboral, this.adicional, this.documentos];
    const index = groups.findIndex((group) => group.invalid);
    return (index === -1 ? 0 : index) as ModalStep;
  }

  private reset(): void {
    this.currentStep = 0;
    this.documentDefinitions.forEach(({ key }) => this.removeDocument(key));
    this.contactosEmergencia.clear();
    this.form.reset({
      personal: {
        nombre: '', apellidoPaterno: '', apellidoMaterno: '', dni: '', sexo: 'Masculino', fechaNacimiento: '', direccion: '', correo: '', telefono: '', estadoCivil: 'Soltero', camisa: 'M', pantalon: 'L', calzado: ''
      },
      laboral: { cargo: '', fechaIngreso: '', tipoContrato: 'Indeterminado', jornada: 'Tiempo completo', sueldoBasico: '', estado: 'Activo' },
      adicional: { gradoInstruccion: '', hijos: '0', lugarNacimiento: '', tipoSangre: '', cuentaBancaria: '', epsSeguro: '', contactosEmergencia: [] },
      documentos: { dni: '', curriculum: '', antecedentes: '', certificados: '' }
    });
  }

  private formatDate(value: string): string {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
}



















