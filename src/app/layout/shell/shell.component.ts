import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, CdkScrollable],
  templateUrl: './shell.component.html'
})
export class ShellComponent {}
