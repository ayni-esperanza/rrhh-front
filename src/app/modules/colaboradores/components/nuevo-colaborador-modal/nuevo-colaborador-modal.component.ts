import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Colaborador, DatosBancarios, DocumentoColaborador } from '../../models/colaborador.model';
import { DatePickerComponent } from '../../../../shared/components/date-picker/date-picker.component';
import { PdfViewerModalComponent } from '../../../../shared/components/pdf-viewer-modal/pdf-viewer-modal.component';
import { SelectSearchableComponent } from '../../../../shared/components/select-searchable/select-searchable.component';
import { CatalogosService } from '../../services/catalogos.service';

type ModalStep = 0 | 1 | 2 | 3;
type DocumentKey = 'dni' | 'curriculum' | 'antecedentes' | 'certificados';
type DocumentStatus = DocumentoColaborador['estado'];

interface UploadedDocument {
  id?: string;
  fileName: string;
  type: string;
  size: number;
  url: string;
}

@Component({
  selector: 'app-nuevo-colaborador-modal',
  imports: [CommonModule, ReactiveFormsModule, DatePickerComponent, PdfViewerModalComponent, SelectSearchableComponent],
  templateUrl: './nuevo-colaborador-modal.component.html',
  styleUrl: './nuevo-colaborador-modal.component.css'
})
export class NuevoColaboradorModalComponent implements OnChanges {
  @ViewChild('stepStage') private stepStage?: ElementRef<HTMLElement>;
  private stepAnimation?: Animation;
  @Input() isOpen = false;
  @Input() colaborador: Colaborador | null = null;
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveColaborador = new EventEmitter<Colaborador>();
  @Output() deleteColaborador = new EventEmitter<string>();

  private readonly formBuilder = inject(FormBuilder);
  private readonly changeDetectorRef = inject(ChangeDetectorRef);
  private readonly catalogos = inject(CatalogosService);
  protected readonly maxRegistrosComplementarios = 3;

  protected readonly steps = [
    { label: 'Información personal', icon: 'M20 21a8 8 0 0 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8' },
    { label: 'Información laboral', icon: 'M10 6h4m-7 4h10m-9 9h8a3 3 0 003-3v-5a3 3 0 00-3-3H8a3 3 0 00-3 3v5a3 3 0 003 3z' },
    { label: 'Información adicional', icon: 'M12 8h.01M11 12h1v4h1M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
    { label: 'Documentos', icon: 'M7 3h7l5 5v13H7a2 2 0 01-2-2V5a2 2 0 012-2zM14 3v6h5' }
  ] as const;
  protected currentStep: ModalStep = 0;
  protected showStepErrors = false;
  protected cargoOptions: string[] = [];
  protected areaOptions: string[] = [];
  protected jornadaOptions: string[] = [];
  public readonly tipoContratoOptions = ['Planilla - Indeterminado', 'Planilla - Plazo fijo', 'Planilla - Temporal', 'Servicio - Indeterminado', 'Servicio - Plazo fijo', 'Servicio - Temporal'];
  protected readonly gradoInstruccionOptions = ['Secundaria completa', 'Técnico', 'Universitario', 'Bachiller', 'Titulado', 'Maestría'];
  protected readonly seguroOptions = ['Rimac EPS', 'Pacífico EPS', 'SIS', 'EsSalud', 'Mapfre EPS', 'Sin seguro'];
  protected readonly entidadBancariaOptions = ['BCP', 'BBVA', 'Interbank', 'Scotiabank', 'Banco de la Nación', 'BanBif', 'Mibanco', 'Otro'];
  protected readonly parentescoOptions = ['Madre', 'Padre', 'Hermano/a', 'Cónyuge', 'Pareja', 'Hijo/a', 'Tío/a', 'Primo/a', 'Amigo/a'];
  public readonly documentDefinitions: ReadonlyArray<{ key: DocumentKey; label: string }> = [
    { key: 'dni', label: 'DNI' },
    { key: 'curriculum', label: 'Curriculum' },
    { key: 'antecedentes', label: 'Antecedentes' },
    { key: 'certificados', label: 'Certificados' }
  ];
  public readonly documentFiles: Partial<Record<string, UploadedDocument>> = {};
  protected pdfViewerDocument: UploadedDocument | null = null;
  public profileImagePreviewUrl = '';
  private profileImageChanged = false;
  private readonly defaultProfileImageUrl = '';
  private readonly dniPattern = /^\d{8}$/;
  private readonly phonePattern = /^9\d{2}\s?\d{3}\s?\d{3}$/;
  private readonly moneyPattern = /^\d+(\.\d{1,2})?$/;
  private readonly bankAccountPattern = /^\d{10,24}$/;
  private readonly cciPattern = /^\d{20}$/;
  private readonly patternMessages: Record<string, string> = {
    'DNI': 'Debe tener 8 dígitos.',
    'Teléfono': 'Debe tener 9 dígitos y empezar con 9.',
    'Sueldo básico': 'Ingresa solo números. Ej. 2800.00.',
    'N° de cuenta bancaria': 'Debe tener entre 10 y 24 dígitos.',
    'CCI': 'Debe tener 20 dígitos.',
    'Teléfono de emergencia': 'Debe tener 9 dígitos y empezar con 9.'
  };

  constructor() {
    this.catalogos.list<{ nombre: string }>('areas').subscribe((items) => this.areaOptions = items.map((x) => x.nombre));
    this.catalogos.list<{ nombre: string }>('cargos').subscribe((items) => this.cargoOptions = items.map((x) => x.nombre));
    this.catalogos.list<{ nombre: string }>('jornadas').subscribe((items) => this.jornadaOptions = items.map((x) => x.nombre));
  }

  protected readonly form = this.formBuilder.group({
    personal: this.formBuilder.group({
      nombre: ['', Validators.required],
      apellidoPaterno: ['', Validators.required],
      apellidoMaterno: ['', Validators.required],
      dni: ['', [Validators.required, Validators.pattern(this.dniPattern)]],
      sexo: ['Masculino', Validators.required],
      fechaNacimiento: ['', Validators.required],
      direccion: ['', Validators.required],
      correo: ['', [Validators.required, Validators.email]],
      telefono: ['', [Validators.required, Validators.pattern(this.phonePattern)]],
      estadoCivil: ['Soltero', Validators.required],
      camisa: ['M', Validators.required],
      pantalon: ['L', Validators.required],
      calzado: ['', Validators.required]
    }),
    laboral: this.formBuilder.group({
      cargo: ['', Validators.required],
      area: ['', Validators.required],
      gradoInstruccion: ['', Validators.required],
      fechaIngreso: ['', Validators.required],
      tipoContrato: ['Planilla - Indeterminado', Validators.required],
      jornada: ['Tiempo completo', Validators.required],
      sueldoBasico: ['', [Validators.required, Validators.pattern(this.moneyPattern)]],
      estado: ['Activo' as 'Activo' | 'Inactivo', Validators.required]
    }),
    adicional: this.formBuilder.group({
      hijos: ['0', Validators.required],
      lugarNacimiento: ['', Validators.required],
      tipoSangre: ['', Validators.required],
      epsSeguro: ['', Validators.required],
      datosBancarios: this.formBuilder.array<FormGroup>([]),
      contactosEmergencia: this.formBuilder.array<FormGroup>([])
    }),
    documentos: this.formBuilder.group({
      dni: ['', Validators.required],
      curriculum: ['', Validators.required],
      antecedentes: ['', Validators.required],
      certificados: ['', Validators.required],
      personalizados: this.formBuilder.array<FormGroup>([])
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
  public get datosBancarios() {
    return this.form.controls.adicional.controls.datosBancarios;
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


  protected setControlDate(control: AbstractControl | null, value: string): void {
    control?.setValue(value);
    control?.markAsDirty();
    control?.markAsTouched();
    control?.updateValueAndValidity();
  }
  public agregarContactoEmergencia(nombre = '', parentesco = '', telefono = ''): void {
    if (this.contactosEmergencia.length >= this.maxRegistrosComplementarios) return;
    this.contactosEmergencia.push(this.formBuilder.group({ nombre: [nombre], parentesco: [parentesco], telefono: [this.digitsOnly(telefono, 9), [Validators.required, Validators.pattern(this.phonePattern)]] }));
  }

  public eliminarContactoEmergencia(index: number): void {
    this.contactosEmergencia.removeAt(index);
  }

  public agregarDatosBancarios(cuentaBancaria = '', cci = '', entidadBancaria = '', esPrincipal = this.datosBancarios.length === 0): void {
    if (this.datosBancarios.length >= this.maxRegistrosComplementarios) return;
    this.datosBancarios.push(this.formBuilder.group({
      cuentaBancaria: [this.digitsOnly(cuentaBancaria, 24), [Validators.required, Validators.pattern(this.bankAccountPattern)]],
      cci: [this.digitsOnly(cci, 20), [Validators.required, Validators.pattern(this.cciPattern)]],
      entidadBancaria: [entidadBancaria, Validators.required],
      esPrincipal: [esPrincipal]
    }));
    if (esPrincipal) this.setCuentaPrincipal(this.datosBancarios.length - 1);
  }

  public eliminarDatosBancarios(index: number): void {
    const wasPrincipal = this.datosBancarios.at(index).controls['esPrincipal'].value === true;
    this.datosBancarios.removeAt(index);
    if (wasPrincipal && this.datosBancarios.length) this.setCuentaPrincipal(0);
  }

  public setCuentaPrincipal(index: number): void {
    this.datosBancarios.controls.forEach((control, currentIndex) => {
      control.controls['esPrincipal'].setValue(currentIndex === index);
    });
  }

  public onProfileImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.revokeProfileImagePreview();
    this.profileImagePreviewUrl = URL.createObjectURL(file);
    this.profileImageChanged = true;
    input.value = '';
  }

  public removeProfileImage(): void {
    this.revokeProfileImagePreview();
    this.profileImagePreviewUrl = '';
    this.profileImageChanged = true;
  }
  public get personal() { return this.form.controls.personal; }
  public get laboral() { return this.form.controls.laboral; }
  public get adicional() { return this.form.controls.adicional; }
  public get documentos() { return this.form.controls.documentos; }
  public get documentosPersonalizados() { return this.documentos.controls.personalizados; }

  public fieldInvalid(control: AbstractControl | null): boolean {
    return !!control && control.invalid && (control.dirty || control.touched);
  }

  public fieldError(control: AbstractControl | null, label: string): string {
    if (!control?.errors) return '';
    if (control.hasError('required')) return `${label} es obligatorio.`;
    if (control.hasError('email')) return 'Ingresa un correo válido.';
    if (control.hasError('pattern')) return this.patternMessages[label] ?? 'Formato inválido.';
    return 'Revisa este campo.';
  }

  public onlyDigits(event: Event, control: AbstractControl | null, maxLength?: number): void {
    const input = event.target as HTMLInputElement;
    const sanitized = input.value.replace(/\D/g, '').slice(0, maxLength);
    this.syncSanitizedValue(input, control, sanitized);
  }

  public onlyMoney(event: Event, control: AbstractControl | null): void {
    const input = event.target as HTMLInputElement;
    const [integerPart, decimalPart = ''] = input.value.replace(/[^\d.]/g, '').split('.');
    const sanitized = decimalPart ? `${integerPart}.${decimalPart.slice(0, 2)}` : integerPart;
    this.syncSanitizedValue(input, control, sanitized);
  }

  protected invalidFieldsCurrentStep(): string {
    const fieldsByStep: ReadonlyArray<ReadonlyArray<{ label: string; control: AbstractControl }>> = [
      [
        { label: 'Nombre', control: this.personal.controls.nombre }, { label: 'Apellido paterno', control: this.personal.controls.apellidoPaterno }, { label: 'Apellido materno', control: this.personal.controls.apellidoMaterno }, { label: 'DNI', control: this.personal.controls.dni }, { label: 'Sexo', control: this.personal.controls.sexo }, { label: 'Fecha de nacimiento', control: this.personal.controls.fechaNacimiento }, { label: 'Dirección', control: this.personal.controls.direccion }, { label: 'Correo', control: this.personal.controls.correo }, { label: 'Teléfono', control: this.personal.controls.telefono }, { label: 'Estado civil', control: this.personal.controls.estadoCivil }, { label: 'Camisa', control: this.personal.controls.camisa }, { label: 'Pantalón', control: this.personal.controls.pantalon }, { label: 'Calzado', control: this.personal.controls.calzado }
      ],
      [
        { label: 'Cargo', control: this.laboral.controls.cargo }, { label: 'Área', control: this.laboral.controls.area }, { label: 'Grado de instrucción', control: this.laboral.controls.gradoInstruccion }, { label: 'Fecha de ingreso', control: this.laboral.controls.fechaIngreso }, { label: 'Tipo de contrato', control: this.laboral.controls.tipoContrato }, { label: 'Jornada', control: this.laboral.controls.jornada }, { label: 'Sueldo básico', control: this.laboral.controls.sueldoBasico }, { label: 'Estado', control: this.laboral.controls.estado }
      ],
      [
        { label: 'Hijos', control: this.adicional.controls.hijos }, { label: 'Lugar de nacimiento', control: this.adicional.controls.lugarNacimiento }, { label: 'Tipo de sangre', control: this.adicional.controls.tipoSangre }, { label: 'EPS / Seguro', control: this.adicional.controls.epsSeguro }
      ],
      this.documentDefinitions.map((document) => ({ label: `Fecha de vencimiento de ${document.label}`, control: this.documentos.controls[document.key] }))
    ];
    const labels = fieldsByStep[this.currentStep].filter(({ control }) => control.invalid).map(({ label }) => label);

    if (this.currentStep === 2) {
      this.datosBancarios.controls.forEach((control, index) => {
        if (control.invalid) labels.push(`datos bancarios ${index + 1}`);
      });
      this.contactosEmergencia.controls.forEach((control, index) => {
        if (control.invalid) labels.push(`contacto de emergencia ${index + 1}`);
      });
    }
    if (this.currentStep === 3) {
      this.documentosPersonalizados.controls.forEach((control, index) => {
        if (control.invalid) labels.push(`documento personalizado ${index + 1}`);
      });
    }

    return labels.join(', ');
  }

  protected currentGroup() {
    return [this.personal, this.laboral, this.adicional, this.documentos][this.currentStep];
  }

  protected goToStep(step: number): void {
    this.changeStep(step as ModalStep);
  }

  public async onFileSelected(event: Event, key: string, control?: AbstractControl | null): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];

    if (!file) return;

    this.removeDocument(key);
    this.documentFiles[key] = {
      fileName: file.name,
      type: file.type || this.fileTypeFromName(file.name),
      size: file.size,
      url: await this.fileToDataUrl(file)
    };
    control?.setValue(file.name);
    control?.markAsTouched();
    input.value = '';
    this.changeDetectorRef.markForCheck();
  }

  public viewDocument(key: string): void {
    const document = this.documentFiles[key];
    if (!document) return;

    if (this.canPreview(document)) {
      this.pdfViewerDocument = document;
      return;
    }

    window.open(document.url, '_blank', 'noopener,noreferrer');
  }

  protected closePdfViewer(): void {
    this.pdfViewerDocument = null;
  }

  public downloadDocument(key: string): void {
    const document = this.documentFiles[key];
    if (!document) return;

    const anchor = window.document.createElement('a');
    anchor.href = document.url;
    anchor.download = document.fileName;
    anchor.click();
  }

  public removeDocument(key: string): void {
    const document = this.documentFiles[key];
    if (!document) return;

    if (this.pdfViewerDocument === document) this.closePdfViewer();
    if (document.url.startsWith('blob:')) URL.revokeObjectURL(document.url);
    delete this.documentFiles[key];
  }

  public agregarDocumentoPersonalizado(nombre = '', fechaVencimiento = '', archivo = '', archivoUrl = ''): void {
    this.documentosPersonalizados.push(this.formBuilder.group({
      id: [`personalizado-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`],
      nombre: [nombre, Validators.required],
      fechaVencimiento: [fechaVencimiento, Validators.required],
      archivo: [archivo],
      archivoUrl: [archivoUrl]
    }));
  }

  public eliminarDocumentoPersonalizado(index: number): void {
    const document = this.documentosPersonalizados.at(index);
    this.removeDocument(document.controls['id'].value ?? '');
    this.documentosPersonalizados.removeAt(index);
  }

  public documentStatus(key: DocumentKey): DocumentStatus | 'Sin fecha' {
    const expirationDate = this.documentos.controls[key].value;
    if (!expirationDate) {
      const label = this.documentDefinitions.find((item) => item.key === key)?.label;
      return this.colaborador?.documentos.find((item) => item.nombre === label)?.estado ?? 'Sin fecha';
    }

    return this.documentStatusByExpiration(expirationDate);
  }

  public documentStatusByExpiration(expirationDate: string): DocumentStatus | 'Sin fecha' {
    if (!expirationDate) return 'Sin fecha';
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
    this.showStepErrors = true;

    if (group.invalid) {
      return;
    }

    this.showStepErrors = false;
    if (this.currentStep < 3) {
      this.changeStep((this.currentStep + 1) as ModalStep);
    }
  }

  protected previousStep(): void {
    this.showStepErrors = false;
    if (this.currentStep > 0) {
      this.changeStep((this.currentStep - 1) as ModalStep);
    }
  }

  protected submit(): void {
    this.form.markAllAsTouched();

    if (this.form.invalid) {
      this.changeStep(this.firstInvalidStep());
      return;
    }

    const value = this.form.getRawValue();
    const contactosEmergencia = value.adicional.contactosEmergencia
      .map((contacto) => ({ nombre: contacto['nombre'] ?? '', parentesco: contacto['parentesco'] ?? '', telefono: contacto['telefono'] ?? '' }))
      .filter((contacto) => contacto.nombre || contacto.parentesco || contacto.telefono);
    const datosBancarios: DatosBancarios[] = value.adicional.datosBancarios
      .map((dato, index) => ({
        cuentaBancaria: dato['cuentaBancaria'] ?? '',
        cci: dato['cci'] ?? '',
        entidadBancaria: dato['entidadBancaria'] ?? '',
        esPrincipal: value.adicional.datosBancarios.some((bank) => bank['esPrincipal']) ? dato['esPrincipal'] === true : index === 0
      }));
    const cuentaPrincipal = datosBancarios.find((dato) => dato.esPrincipal) ?? datosBancarios[0];
    this.saveColaborador.emit({
      id: this.colaborador?.id ?? `nuevo-${Date.now()}`,
      imagen: this.profileImageChanged ? (this.profileImagePreviewUrl || this.defaultProfileImageUrl) : (this.colaborador?.imagen ?? this.defaultProfileImageUrl),
      nombre: value.personal.nombre || '',
      apellido: [value.personal.apellidoPaterno, value.personal.apellidoMaterno].filter(Boolean).join(' '),
      apellidoPaterno: value.personal.apellidoPaterno || '',
      apellidoMaterno: value.personal.apellidoMaterno || '',
      dni: value.personal.dni || '',
      sexo: (value.personal.sexo || 'Masculino') as Colaborador['sexo'],
      hijos: value.adicional.hijos || '0',
      cargo: value.laboral.cargo || '',
      area: value.laboral.area || '',
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
      gradoInstruccion: value.laboral.gradoInstruccion || '',
      lugarNacimiento: value.adicional.lugarNacimiento || '',
      tipoSangre: value.adicional.tipoSangre || '',
      cuentaBancaria: cuentaPrincipal?.cuentaBancaria ?? '',
      cci: cuentaPrincipal?.cci ?? '',
      entidadBancaria: cuentaPrincipal?.entidadBancaria ?? '',
      datosBancarios,
      epsSeguro: value.adicional.epsSeguro || '',
      contactoEmergencia: contactosEmergencia[0] ? [contactosEmergencia[0].nombre, contactosEmergencia[0].parentesco, contactosEmergencia[0].telefono].filter(Boolean).join(' - ') : '',
      documentos: [
        ...this.documentDefinitions.flatMap((document) => {
          const uploaded = this.documentFiles[document.key];
          return uploaded ? [{ nombre: document.label, estado: this.documentStatus(document.key) as DocumentStatus, fechaVencimiento: value.documentos[document.key] || undefined, ...this.documentAttachment(uploaded) }] : [];
        }),
        ...value.documentos.personalizados.flatMap((document) => {
          const uploaded = this.documentFiles[document['id'] ?? ''];
          const externalUrl = String(document['archivoUrl'] ?? '').trim();
          if (uploaded) return [{ nombre: document['nombre'] ?? '', estado: this.documentStatusByExpiration(document['fechaVencimiento'] ?? '') as DocumentStatus, fechaVencimiento: document['fechaVencimiento'] ?? undefined, ...this.documentAttachment(uploaded) }];
          return externalUrl ? [{ nombre: document['nombre'] ?? '', estado: this.documentStatusByExpiration(document['fechaVencimiento'] ?? '') as DocumentStatus, fechaVencimiento: document['fechaVencimiento'] ?? undefined, archivoNombre: this.fileNameFromUrl(externalUrl), archivoTipo: this.fileTypeFromName(externalUrl), archivoUrl: externalUrl, archivoTamano: 0 }] : [];
        })
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
    this.revokeProfileImagePreview();
    this.profileImagePreviewUrl = colaborador.imagen;
    this.profileImageChanged = false;
    this.contactosEmergencia.clear();
    this.datosBancarios.clear();
    Object.keys(this.documentFiles).forEach((key) => this.removeDocument(key));
    this.documentosPersonalizados.clear();
    const contactos = colaborador.contactosEmergencia ?? (colaborador.telefonoEmergencia ? [{ nombre: '', parentesco: '', telefono: colaborador.telefonoEmergencia }] : []);
    contactos.forEach((contacto) => this.agregarContactoEmergencia(contacto.nombre, contacto.parentesco ?? '', contacto.telefono));
    const datosBancarios = colaborador.datosBancarios ?? (colaborador.cuentaBancaria ? [{ cuentaBancaria: colaborador.cuentaBancaria, cci: colaborador.cci ?? '', entidadBancaria: colaborador.entidadBancaria ?? '', esPrincipal: true }] : []);
    datosBancarios.forEach((dato, index) => this.agregarDatosBancarios(dato.cuentaBancaria, dato.cci, dato.entidadBancaria, dato.esPrincipal ?? index === 0));
    const predefinedDocumentNames = new Set(this.documentDefinitions.map((document) => document.label));
    colaborador.documentos
      .filter((document) => !predefinedDocumentNames.has(document.nombre))
      .forEach((document) => {
        this.agregarDocumentoPersonalizado(document.nombre, this.dateToInput(document.fechaVencimiento ?? ''), document.archivoNombre ?? '', document.archivoUrl ?? '');
        const key = this.documentosPersonalizados.at(this.documentosPersonalizados.length - 1).controls['id'].value ?? '';
        const uploaded = this.uploadedDocumentFrom(document);
        if (uploaded) this.documentFiles[key] = uploaded;
      });
    const predefinedDates: Record<DocumentKey, string> = { dni: '', curriculum: '', antecedentes: '', certificados: '' };
    this.documentDefinitions.forEach(({ key, label }) => {
      const document = colaborador.documentos.find((item) => item.nombre === label);
      if (!document) return;
      predefinedDates[key] = this.dateToInput(document.fechaVencimiento ?? '');
      const uploaded = this.uploadedDocumentFrom(document);
      if (uploaded) this.documentFiles[key] = uploaded;
    });
    this.form.patchValue({
      personal: {
        nombre: colaborador.nombre,
        apellidoPaterno: colaborador.apellidoPaterno ?? colaborador.apellido.split(' ')[0] ?? '',
        apellidoMaterno: colaborador.apellidoMaterno ?? colaborador.apellido.split(' ').slice(1).join(' '),
        dni: this.digitsOnly(colaborador.dni, 8),
        sexo: colaborador.sexo ?? 'Masculino',
        fechaNacimiento: this.dateToInput(colaborador.fechaNacimiento),
        direccion: colaborador.direccion,
        correo: colaborador.correo,
        telefono: this.digitsOnly(colaborador.telefono ?? colaborador.telefonoEmergencia, 9),
        estadoCivil: colaborador.estadoCivil,
        camisa: colaborador.tallas.camisa,
        pantalon: colaborador.tallas.pantalon,
        calzado: colaborador.tallas.calzado
      },
      laboral: {
        cargo: colaborador.cargo,
        area: colaborador.area ?? '',
        gradoInstruccion: colaborador.gradoInstruccion,
        fechaIngreso: this.dateToInput(colaborador.fechaIngreso),
        tipoContrato: colaborador.tipoContrato,
        jornada: colaborador.jornada,
        sueldoBasico: colaborador.sueldoBasico.replace(/[^\d.]/g, ''),
        estado: colaborador.estado
      },
      adicional: {
        hijos: colaborador.hijos ?? '0',
        lugarNacimiento: colaborador.lugarNacimiento ?? '',
        tipoSangre: colaborador.tipoSangre ?? '',
        epsSeguro: colaborador.epsSeguro,
      },
      documentos: predefinedDates
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

  private changeStep(step: ModalStep): void {
    if (step === this.currentStep) return;

    const direction = step > this.currentStep ? 1 : -1;
    this.currentStep = step;

    requestAnimationFrame(() => {
      const stage = this.stepStage?.nativeElement;
      if (!stage) return;

      this.stepAnimation?.cancel();
      this.stepAnimation = stage.animate(
        [
          { transform: `translateX(${direction * 16}px)` },
          { transform: 'translateX(0)' }
        ],
        { duration: 260, easing: 'cubic-bezier(0.16, 1, 0.3, 1)' }
      );
    });
  }

  private reset(): void {
    this.currentStep = 0;
    this.showStepErrors = false;
    this.revokeProfileImagePreview();
    this.profileImagePreviewUrl = '';
    this.profileImageChanged = false;
    this.documentDefinitions.forEach(({ key }) => this.removeDocument(key));
    this.documentosPersonalizados.clear();
    this.contactosEmergencia.clear();
    this.datosBancarios.clear();
    this.form.reset({
      personal: {
        nombre: '', apellidoPaterno: '', apellidoMaterno: '', dni: '', sexo: 'Masculino', fechaNacimiento: '', direccion: '', correo: '', telefono: '', estadoCivil: 'Soltero', camisa: 'M', pantalon: 'L', calzado: ''
      },
      laboral: { cargo: '', area: '', gradoInstruccion: '', fechaIngreso: '', tipoContrato: 'Planilla - Indeterminado', jornada: 'Tiempo completo', sueldoBasico: '', estado: 'Activo' },
      adicional: { hijos: '0', lugarNacimiento: '', tipoSangre: '', epsSeguro: '', datosBancarios: [], contactosEmergencia: [] },
      documentos: { dni: '', curriculum: '', antecedentes: '', certificados: '', personalizados: [] }
    });
  }

  private digitsOnly(value: string, maxLength?: number): string {
    return value.replace(/\D/g, '').slice(0, maxLength);
  }

  private syncSanitizedValue(input: HTMLInputElement, control: AbstractControl | null, value: string): void {
    if (input.value === value) return;

    input.value = value;
    control?.setValue(value, { emitEvent: false });
  }

  private revokeProfileImagePreview(): void {
    if (this.profileImagePreviewUrl.startsWith('blob:')) {
      URL.revokeObjectURL(this.profileImagePreviewUrl);
    }
  }

  protected requestDelete(): void {
    if (!this.colaborador) return;
    this.deleteColaborador.emit(this.colaborador.id);
  }

  private formatDate(value: string): string {
    if (!value) return '';
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  private canPreview(document: UploadedDocument): boolean {
    return document.type === 'application/pdf' || document.type.startsWith('image/') || /\.(pdf|png|jpe?g|gif|webp|bmp)$/i.test(document.fileName);
  }

  private documentAttachment(document: UploadedDocument): Pick<DocumentoColaborador, 'id' | 'archivoNombre' | 'archivoTipo' | 'archivoUrl' | 'archivoTamano'> {
    return { id: document.id, archivoNombre: document.fileName, archivoTipo: document.type, archivoUrl: document.url, archivoTamano: document.size };
  }

  private uploadedDocumentFrom(document: DocumentoColaborador): UploadedDocument | null {
    if (!document.archivoUrl || !document.archivoNombre) return null;
    return { id: document.id, fileName: document.archivoNombre, type: document.archivoTipo || this.fileTypeFromName(document.archivoNombre), size: document.archivoTamano ?? 0, url: document.archivoUrl };
  }

  private fileTypeFromName(fileName: string): string {
    if (/\.pdf$/i.test(fileName)) return 'application/pdf';
    if (/\.png$/i.test(fileName)) return 'image/png';
    if (/\.jpe?g$/i.test(fileName)) return 'image/jpeg';
    if (/\.gif$/i.test(fileName)) return 'image/gif';
    if (/\.webp$/i.test(fileName)) return 'image/webp';
    return 'application/octet-stream';
  }
  private fileNameFromUrl(url: string): string { return decodeURIComponent(url.split('/').pop()?.split('?')[0] || 'documento-enlace'); }

  private fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result));
      reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer el archivo.'));
      reader.readAsDataURL(file);
    });
  }
}






















