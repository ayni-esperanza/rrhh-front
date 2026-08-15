import { Component, EventEmitter, HostListener, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SelectSearchableComponent } from '../../../../shared/components/select-searchable/select-searchable.component';
import { Usuario } from '../../models/usuario.model';

@Component({
  selector: 'app-usuario-modal',
  imports: [FormsModule, SelectSearchableComponent],
  templateUrl: './usuario-modal.component.html'
})
export class UsuarioModalComponent implements OnChanges {
  @Input() isOpen = false;
  @Input() usuario: Usuario | null = null;
  @Input() existingEmails: string[] = [];
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveUsuario = new EventEmitter<Usuario>();
  @Output() deleteUsuario = new EventEmitter<Usuario>();

  protected draft: Usuario = this.emptyUsuario();
  protected submitted = false;
  protected readonly rolOptions = [
    { value: 'admin', label: 'Administrador' },
    { value: 'rrhh', label: 'RR.HH.' },
    { value: 'supervisor', label: 'Supervisor' },
    { value: 'colaborador', label: 'Colaborador' }
  ];
  protected readonly estadoOptions = [
    { value: 'activo', label: 'Activo' },
    { value: 'inactivo', label: 'Inactivo' }
  ];

  protected get isEditing(): boolean {
    return this.usuario !== null;
  }

  protected get invalidName(): boolean {
    return this.submitted && this.draft.nombre.trim().length < 3;
  }

  protected get invalidEmail(): boolean {
    return this.submitted && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.draft.correo.trim());
  }

  protected get emailExists(): boolean {
    const email = this.draft.correo.trim().toLowerCase();
    return Boolean(email) && this.existingEmails.some((item) => item.toLowerCase() === email);
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isOpen'] || changes['usuario']) {
      this.draft = this.usuario ? { ...this.usuario } : this.emptyUsuario();
      this.submitted = false;
    }
  }

  protected close(): void {
    this.closeModal.emit();
  }

  protected save(): void {
    this.submitted = true;
    if (this.invalidName || this.invalidEmail || this.emailExists) return;
    this.saveUsuario.emit({
      ...this.draft,
      nombre: this.draft.nombre.trim(),
      correo: this.draft.correo.trim().toLowerCase()
    });
  }

  protected requestDelete(): void {
    if (this.usuario) this.deleteUsuario.emit(this.usuario);
  }

  @HostListener('document:keydown.escape')
  protected onEscape(): void {
    if (this.isOpen) this.close();
  }

  private emptyUsuario(): Usuario {
    return { id: 0, nombre: '', correo: '', password: '', rol: 'colaborador', estado: 'activo', ultimoAcceso: 'Sin accesos' };
  }

}
