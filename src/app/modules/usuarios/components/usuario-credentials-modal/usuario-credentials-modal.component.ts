import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-usuario-credentials-modal',
  templateUrl: './usuario-credentials-modal.component.html'
})
export class UsuarioCredentialsModalComponent {
  @Input() isOpen = false;
  @Input() correo = '';
  @Input() password = '';
  @Output() closeModal = new EventEmitter<void>();

  protected get whatsappUrl(): string {
    const message = [
      'Hola, estas son tus credenciales de acceso:',
      `Usuario: ${this.correo}`,
      `Contraseña: ${this.password}`,
      'Por seguridad, cambia tu contraseña después de iniciar sesión.'
    ].join('\n');
    return `https://wa.me/?text=${encodeURIComponent(message)}`;
  }
}
