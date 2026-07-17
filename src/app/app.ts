import { Component, OnInit, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { initFlowbite } from 'flowbite';
import { ThemeService } from './core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit {
  protected readonly title = signal('rrhh-front');
  protected readonly themeService = inject(ThemeService);

  ngOnInit(): void {
    initFlowbite();
  }

  protected toggleTheme(): void {
    this.themeService.toggleTheme();
  }
}

