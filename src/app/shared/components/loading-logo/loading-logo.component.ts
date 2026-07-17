import { NgClass, NgIf } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-loading-logo',
  imports: [NgClass, NgIf],
  templateUrl: './loading-logo.component.html',
  styleUrl: './loading-logo.component.css'
})
export class LoadingLogoComponent {
  @Input() size: 'sm' | 'md' | 'lg' = 'md';
  @Input() mode: 'stroke' | 'stroke-fill' = 'stroke-fill';
  @Input() text = 'Cargando...';
  @Input() showText = true;
}