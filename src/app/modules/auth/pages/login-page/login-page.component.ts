import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/services/auth.service';

@Component({
  selector: 'app-login-page',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login-page.component.html',
  styleUrl: './login-page.component.css'
})
export class LoginPageComponent implements OnInit {
  private readonly formBuilder = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly loginForm = this.formBuilder.group({
    username: ['admin@rrhh.com', [Validators.required, Validators.email]],
    password: ['admin123', [Validators.required, Validators.minLength(6)]]
  });

  protected loading = false;
  protected error = '';
  protected showPassword = false;

  ngOnInit(): void {
    if (this.authService.isAuthenticated()) {
      void this.router.navigate([this.authService.getLandingRoute()]);
    }
  }

  protected get f() {
    return this.loginForm.controls;
  }

  protected togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  protected onSubmit(): void {
    this.error = '';

    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    const { username, password } = this.loginForm.getRawValue();
    const loggedIn = this.authService.login({ email: username || '', password: password || '' });

    if (!loggedIn) {
      this.error = 'Usuario o contraseña incorrectos';
      this.loading = false;
      return;
    }

    void this.router.navigate([this.authService.getLandingRoute()]);
  }
}