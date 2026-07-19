import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from './core/services/auth.service';
import { PointsBadgeComponent } from './shared/ui/points-badge/points-badge.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet, MatToolbarModule, MatButtonModule, MatIconModule, PointsBadgeComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  constructor(readonly authService: AuthService) {}

  ngOnInit(): void {
    if (this.authService.getToken()) {
      this.authService.restoreSession().subscribe({
        error: () => this.authService.logout(),
      });
    }
  }

  logout(): void {
    this.authService.logout();
  }
}
