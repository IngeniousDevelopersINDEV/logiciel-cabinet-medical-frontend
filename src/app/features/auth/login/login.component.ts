import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  template: `
    <div class="login-container">
      <mat-card class="login-card">
        <mat-card-header>
          <div class="login-header">
            <mat-icon class="logo-icon">local_hospital</mat-icon>
            <h1>Cabinet Médical</h1>
            <p>Connectez-vous à votre compte</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="loginForm" (ngSubmit)="onSubmit()" novalidate>
            <mat-form-field class="full-width" appearance="outline">
              <mat-label>Email</mat-label>
              <input matInput type="email" formControlName="email" placeholder="votre@email.com">
              <mat-icon matSuffix>email</mat-icon>
              <mat-error *ngIf="loginForm.get('email')?.hasError('required')">
                L'email est requis
              </mat-error>
              <mat-error *ngIf="loginForm.get('email')?.hasError('email')">
                Format d'email invalide
              </mat-error>
            </mat-form-field>

            <mat-form-field class="full-width" appearance="outline">
              <mat-label>Mot de passe</mat-label>
              <input matInput
                     [type]="showPassword ? 'text' : 'password'"
                     formControlName="password">
              <button mat-icon-button matSuffix type="button"
                      (click)="showPassword = !showPassword">
                <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
              </button>
              <mat-error *ngIf="loginForm.get('password')?.hasError('required')">
                Le mot de passe est requis
              </mat-error>
            </mat-form-field>

            <div class="form-actions">
              <button mat-raised-button color="primary"
                      type="submit"
                      [disabled]="loginForm.invalid || isLoading"
                      class="full-width login-btn">
                <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
                <span *ngIf="!isLoading">Se connecter</span>
              </button>
            </div>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="register-link">
            Pas encore de compte ?
            <a routerLink="/auth/register">S'inscrire</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .login-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
      padding: 24px;
    }

    .login-card {
      width: 100%;
      max-width: 420px;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.3);
    }

    .login-header {
      text-align: center;
      width: 100%;
      padding: 16px 0;

      .logo-icon {
        font-size: 56px;
        height: 56px;
        width: 56px;
        color: #1976d2;
      }

      h1 {
        font-size: 1.5rem;
        font-weight: 700;
        color: #1a237e;
        margin: 8px 0 4px;
      }

      p {
        color: #757575;
        font-size: 0.875rem;
      }
    }

    mat-card-content {
      padding: 16px 24px;
    }

    .form-actions {
      margin-top: 8px;
    }

    .login-btn {
      height: 48px;
      font-size: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    mat-card-actions {
      padding: 8px 24px 16px;
      text-align: center;
    }

    .register-link {
      color: #757575;
      font-size: 0.875rem;
      a {
        color: #1976d2;
        font-weight: 500;
      }
    }
  `]
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  showPassword = false;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';

    if (this.authService.isAuthenticated) {
      this.router.navigate([this.returnUrl]);
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.isLoading = true;
      this.authService.login(this.loginForm.value).subscribe({
        next: () => {
          this.notification.success('Connexion réussie !');
          this.router.navigate([this.returnUrl]);
        },
        error: (err) => {
          this.notification.error(err.message || 'Erreur de connexion');
          this.isLoading = false;
        }
      });
    }
  }
}
