import { Component, ElementRef, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../../shared/components/sidebar/sidebar.component';
import { CdkScrollable } from '@angular/cdk/scrolling';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, SidebarComponent, CdkScrollable],
  templateUrl: './shell.component.html'
})
export class ShellComponent {
  @ViewChild('routeStage') private routeStage?: ElementRef<HTMLElement>;
  private routeAnimation?: Animation;

  protected animateRouteChange(): void {
    requestAnimationFrame(() => {
      const stage = this.routeStage?.nativeElement;
      if (!stage) return;

      this.routeAnimation?.cancel();
      this.routeAnimation = stage.animate(
        [
          { opacity: 0, transform: 'translateY(4px)' },
          { opacity: 1, transform: 'translateY(0)' }
        ],
        { duration: 200, easing: 'ease-out' }
      );
    });
  }
}
