import { Component, computed, effect, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../../../core/services/auth.service';

// Extraido de AppComponent: el mismo indicador de puntos se necesitaba
// tal cual en mas de un lugar del shell, asi que se separo en un
// componente propio con su pequena animacion al subir el saldo.
@Component({
  selector: 'app-points-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './points-badge.component.html',
  styleUrl: './points-badge.component.scss',
})
export class PointsBadgeComponent {
  private readonly authService = inject(AuthService);
  private previousValue: number | null = null;

  readonly points = computed(() => this.authService.currentUser()?.pointsBalance ?? 0);
  readonly bump = signal(false);

  constructor() {
    effect(() => {
      const current = this.points();
      if (this.previousValue !== null && current > this.previousValue) {
        this.bump.set(true);
        setTimeout(() => this.bump.set(false), 600);
      }
      this.previousValue = current;
    });
  }
}
