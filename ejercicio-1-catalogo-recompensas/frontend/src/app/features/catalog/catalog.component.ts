import { Component, OnDestroy, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { ProductsService } from '../../core/services/products.service';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';
import { Product, PaginationMeta } from '../../core/models/product.model';
import { extractErrorMessage } from '../../core/api-error';
import { ProductCardComponent } from './product-card/product-card.component';

const PAGE_SIZE = 8;

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    ProductCardComponent,
  ],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss',
})
export class CatalogComponent implements OnInit, OnDestroy {
  private readonly productsService = inject(ProductsService);
  private readonly cartService = inject(CartService);
  private readonly authService = inject(AuthService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly searchSubject = new Subject<string>();

  readonly products = signal<Product[]>([]);
  readonly meta = signal<PaginationMeta | null>(null);
  readonly categories = signal<string[]>([]);
  readonly loading = signal(true);
  readonly errorMessage = signal<string | null>(null);

  readonly searchTerm = signal('');
  readonly selectedCategory = signal('');
  readonly page = signal(1);

  readonly favoritedIds = signal<Set<number>>(new Set());
  readonly addingIds = signal<Set<number>>(new Set());
  readonly togglingIds = signal<Set<number>>(new Set());

  readonly isAuthenticated = this.authService.isAuthenticated;

  ngOnInit(): void {
    this.productsService.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });

    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.searchTerm.set(term);
      this.page.set(1);
      this.load();
    });

    this.load();
  }

  ngOnDestroy(): void {
    this.searchSubject.complete();
  }

  onSearchInput(value: string): void {
    this.searchSubject.next(value.trim());
  }

  onCategoryChange(category: string): void {
    this.selectedCategory.set(category);
    this.page.set(1);
    this.load();
  }

  onPageChange(event: PageEvent): void {
    this.page.set(event.pageIndex + 1);
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.productsService
      .list({
        page: this.page(),
        limit: PAGE_SIZE,
        category: this.selectedCategory() || undefined,
        search: this.searchTerm() || undefined,
      })
      .subscribe({
        next: (res) => {
          this.products.set(res.data);
          this.meta.set(res.meta);
          this.loading.set(false);
        },
        error: (err: HttpErrorResponse) => {
          this.errorMessage.set(extractErrorMessage(err));
          this.loading.set(false);
        },
      });
  }

  addToCart(product: Product): void {
    if (!this.isAuthenticated()) {
      this.snackBar.open('Inicia sesión para agregar productos al carrito', 'Cerrar', { duration: 3000 });
      return;
    }
    this.setInSet(this.addingIds, product.id, true);
    this.cartService.addItem(product.id).subscribe({
      next: (res) => {
        this.authService.updatePointsBalance(res.pointsBalance);
        this.setInSet(this.addingIds, product.id, false);
        this.snackBar.open(`${product.name} agregado al carrito (+5 pts)`, 'Cerrar', { duration: 2500 });
      },
      error: (err: HttpErrorResponse) => {
        this.setInSet(this.addingIds, product.id, false);
        this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 3500 });
      },
    });
  }

  toggleFavorite(product: Product): void {
    if (!this.isAuthenticated()) {
      this.snackBar.open('Inicia sesión para marcar favoritos', 'Cerrar', { duration: 3000 });
      return;
    }
    this.setInSet(this.togglingIds, product.id, true);
    this.productsService.toggleFavorite(product.id).subscribe({
      next: (res) => {
        this.authService.updatePointsBalance(res.pointsBalance);
        this.favoritedIds.update((current) => {
          const next = new Set(current);
          if (res.favorited) {
            next.add(product.id);
          } else {
            next.delete(product.id);
          }
          return next;
        });
        this.setInSet(this.togglingIds, product.id, false);
      },
      error: (err: HttpErrorResponse) => {
        this.setInSet(this.togglingIds, product.id, false);
        this.snackBar.open(extractErrorMessage(err), 'Cerrar', { duration: 3500 });
      },
    });
  }

  private setInSet(sig: typeof this.addingIds, id: number, value: boolean): void {
    sig.update((current) => {
      const next = new Set(current);
      if (value) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  }
}
