import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [FormsModule, RouterLink],
  templateUrl: './login-page.component.html'
})
export class LoginPageComponent {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly email = signal('admin@rrhh.com');
  protected readonly password = signal('admin123');
  protected readonly error = signal('');

  protected login(): void {
    const loggedIn = this.authService.login({ email: this.email(), password: this.password() });

    if (!loggedIn) {
      this.error.set('Credenciales incorrectas.');
      return;
    }

    void this.router.navigate(['/dashboard']);
  }
}