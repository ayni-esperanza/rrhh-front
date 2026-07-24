import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
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
      apellido: ['', Validators.required],
      dni: ['', [Validators.required, Validators.minLength(8)]],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefonoEmergencia: ['', Validators.required],
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
      cuentaBancaria: ['', Validators.required],
      epsSeguro: ['', Validators.required],
      contactoEmergencia: ['', Validators.required]
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
    this.saveColaborador.emit({
      id: this.colaborador?.id ?? `nuevo-${Date.now()}`,
      imagen: this.colaborador?.imagen ?? 'https://i.pravatar.cc/96?img=5',
      nombre: value.personal.nombre || '',
      apellido: value.personal.apellido || '',
      dni: value.personal.dni || '',
      cargo: value.laboral.cargo || '',
      telefonoEmergencia: value.personal.telefonoEmergencia || '',
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
      cuentaBancaria: value.adicional.cuentaBancaria || '',
      epsSeguro: value.adicional.epsSeguro || '',
      contactoEmergencia: value.adicional.contactoEmergencia || '',
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
    this.form.patchValue({
      personal: {
        nombre: colaborador.nombre,
        apellido: colaborador.apellido,
        dni: colaborador.dni,
        fechaNacimiento: this.dateToInput(colaborador.fechaNacimiento),
        direccion: colaborador.direccion,
        correo: colaborador.correo,
        telefonoEmergencia: colaborador.telefonoEmergencia,
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
        cuentaBancaria: colaborador.cuentaBancaria,
        epsSeguro: colaborador.epsSeguro,
        contactoEmergencia: colaborador.contactoEmergencia
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
    this.form.reset({
      personal: {
        nombre: '', apellido: '', dni: '', fechaNacimiento: '', direccion: '', correo: '', telefonoEmergencia: '', estadoCivil: 'Soltero', camisa: 'M', pantalon: 'L', calzado: ''
      },
      laboral: { cargo: '', fechaIngreso: '', tipoContrato: 'Indeterminado', jornada: 'Tiempo completo', sueldoBasico: '', estado: 'Activo' },
      adicional: { gradoInstruccion: '', cuentaBancaria: '', epsSeguro: '', contactoEmergencia: '' },
      documentos: { dni: '', curriculum: '', antecedentes: '', certificados: '' }
    });
  }

  private formatDate(value: string): string {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }
}








