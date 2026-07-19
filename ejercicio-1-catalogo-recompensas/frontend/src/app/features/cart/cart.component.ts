import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { CartItem, CheckoutResult } from '../../core/models/cart.model';
import { extractErrorMessage } from '../../core/api-error';
import { StateMessageComponent } from '../../shared/ui/state-message/state-message.component';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    StateMessageComponent,
  ],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss',
})
export class CartComponent implements OnInit {
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);

  readonly items = signal<CartItem[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);
  readonly removingIds = signal<Set<number>>(new Set());
  readonly checkingOut = signal(false);
  readonly checkoutResult = signal<CheckoutResult | null>(null);

  readonly total = computed(() => this.items().reduce((sum, item) => sum + item.product.price * item.quantity, 0));

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.items.set(cart.items);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.errorMessage.set(extractErrorMessage(err));
        this.loading.set(false);
      },
    });
  }

  removeItem(productId: number): void {
    const previous = this.items();
    // Actualizacion optimista: se quita de la UI de inmediato, sin esperar al servidor.
    this.items.set(previous.filter((item) => item.productId !== productId));
    this.removingIds.update((ids) => new Set(ids).add(productId));

    this.cartService.removeItem(productId).subscribe({
      next: (cart) => {
        this.items.set(cart.items);
        this.removingIds.update((ids) => {
          const next = new Set(ids);
          next.delete(productId);
          return next;
        });
      },
      error: (err: HttpErrorResponse) => {
        // Rollback: el servidor no pudo confirmar el borrado, se restaura la vista anterior.
        this.items.set(previous);
        this.removingIds.update((ids) => {
          const next = new Set(ids);
          next.delete(productId);
          return next;
        });
        this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 3500 });
      },
    });
  }

  checkout(): void {
    this.checkingOut.set(true);
    this.cartService.checkout().subscribe({
      next: (result) => {
        this.checkoutResult.set(result);
        this.items.set([]);
        this.authService.updatePointsBalance(result.pointsBalance);
        this.checkingOut.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.checkingOut.set(false);
        this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 4000 });
        this.load(); // el checkout pudo fallar por stock desactualizado; se refresca el carrito real
      },
    });
  }

  goToCatalog(): void {
    this.router.navigate(['/catalogo']);
  }

  formatPrice(price: number): string {
    return price.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  }
}
