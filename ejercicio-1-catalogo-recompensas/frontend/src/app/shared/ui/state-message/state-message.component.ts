import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

export type StateVariant = 'loading' | 'error' | 'empty';

// Loading/error/empty se repetian casi identicos en catalogo y carrito;
// se extrae aqui una vez que el patron se repitio (no antes).
@Component({
  selector: 'app-state-message',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule, MatProgressSpinnerModule],
  templateUrl: './state-message.component.html',
  styleUrl: './state-message.component.scss',
})
export class StateMessageComponent {
  @Input() variant: StateVariant = 'empty';
  @Input() icon = 'info';
  @Input() message = '';
  @Input() actionLabel?: string;

  @Output() action = new EventEmitter<void>();
}
