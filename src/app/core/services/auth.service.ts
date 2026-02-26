import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, throwError, timer } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../../models/user.model';

/**
 * Service d'authentification - gère JWT, connexion/déconnexion, et état utilisateur
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiUrl = `${environment.apiUrl}/auth`;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();
  private sessionTimeoutTimer: any;

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  get currentUser(): User | null {
    return this.currentUserSubject.value;
  }

  get isAuthenticated(): boolean {
    return !!this.getToken() && !!this.currentUser;
  }

  /**
   * Connexion utilisateur
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Inscription utilisateur
   */
  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/register`, request).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(this.handleError)
    );
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem(environment.jwtTokenKey);
    localStorage.removeItem(environment.jwtRefreshTokenKey);
    localStorage.removeItem('current_user');
    this.currentUserSubject.next(null);
    this.clearSessionTimeout();
    this.router.navigate(['/auth/login']);
  }

  /**
   * Rafraîchissement du token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    return this.http.post<AuthResponse>(`${this.apiUrl}/refresh`, { refreshToken }).pipe(
      tap(response => this.handleAuthSuccess(response)),
      catchError(err => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  getToken(): string | null {
    return localStorage.getItem(environment.jwtTokenKey);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem(environment.jwtRefreshTokenKey);
  }

  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  hasAnyRole(roles: string[]): boolean {
    return roles.includes(this.currentUser?.role || '');
  }

  private handleAuthSuccess(response: AuthResponse): void {
    localStorage.setItem(environment.jwtTokenKey, response.token);
    localStorage.setItem(environment.jwtRefreshTokenKey, response.refreshToken);
    localStorage.setItem('current_user', JSON.stringify(response.user));
    this.currentUserSubject.next(response.user);
    this.startSessionTimeout();
  }

  private loadUserFromStorage(): void {
    const userStr = localStorage.getItem('current_user');
    const token = this.getToken();
    if (userStr && token) {
      try {
        const user = JSON.parse(userStr) as User;
        this.currentUserSubject.next(user);
        this.startSessionTimeout();
      } catch {
        this.logout();
      }
    }
  }

  private startSessionTimeout(): void {
    this.clearSessionTimeout();
    this.sessionTimeoutTimer = setTimeout(() => {
      this.logout();
    }, environment.sessionTimeout);
  }

  private clearSessionTimeout(): void {
    if (this.sessionTimeoutTimer) {
      clearTimeout(this.sessionTimeoutTimer);
      this.sessionTimeoutTimer = null;
    }
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Une erreur est survenue';
    if (error.status === 401) {
      message = 'Identifiants incorrects';
    } else if (error.status === 403) {
      message = 'Accès refusé';
    } else if (error.error?.message) {
      message = error.error.message;
    }
    return throwError(() => new Error(message));
  }
}
