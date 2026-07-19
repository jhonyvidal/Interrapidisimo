import { Injectable, computed, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { API_BASE_URL } from '../api.config';
import { AuthResponse, User } from '../models/user.model';

const TOKEN_KEY = 'ir_access_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly currentUserSignal = signal<User | null>(null);

  readonly currentUser = this.currentUserSignal.asReadonly();
  readonly isAuthenticated = computed(() => this.currentUserSignal() !== null);

  constructor(private readonly http: HttpClient) {}

  login(email: string, password: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/login`, { email, password })
      .pipe(tap((res) => this.setSession(res)));
  }

  register(email: string, password: string, name: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${API_BASE_URL}/auth/register`, { email, password, name })
      .pipe(tap((res) => this.setSession(res)));
  }

  // Rehidrata la sesion al recargar la pagina, validando el token contra el backend.
  restoreSession(): Observable<User> {
    return this.http
      .get<User>(`${API_BASE_URL}/users/me`)
      .pipe(tap((user) => this.currentUserSignal.set(user)));
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.currentUserSignal.set(null);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  updatePointsBalance(pointsBalance: number): void {
    const user = this.currentUserSignal();
    if (user) {
      this.currentUserSignal.set({ ...user, pointsBalance });
    }
  }

  private setSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.accessToken);
    this.currentUserSignal.set(res.user);
  }
}
