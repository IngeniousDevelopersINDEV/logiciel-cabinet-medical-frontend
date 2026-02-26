import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  template: `
    <div class="register-container">
      <mat-card class="register-card">
        <mat-card-header>
          <div class="register-header">
            <mat-icon class="logo-icon">local_hospital</mat-icon>
            <h1>Inscription</h1>
            <p>Créez votre compte</p>
          </div>
        </mat-card-header>

        <mat-card-content>
          <form [formGroup]="registerForm" (ngSubmit)="onSubmit()" novalidate>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Prénom</mat-label>
                <input matInput formControlName="prenom">
                <mat-error *ngIf="registerForm.get('prenom')?.hasError('required')">
                  Le prénom est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom</mat-label>
                <input matInput formControlName="nom">
                <mat-error *ngIf="registerForm.get('nom')?.hasError('required')">
                  Le nom est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-col">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="registerForm.get('email')?.hasError('required')">
                  L'email est requis
                </mat-error>
                <mat-error *ngIf="registerForm.get('email')?.hasError('email')">
                  Format d'email invalide
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="telephone" placeholder="+33 6 XX XX XX XX">
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Rôle</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="MEDECIN">Médecin</mat-option>
                  <mat-option value="SECRETAIRE">Secrétaire</mat-option>
                  <mat-option value="PATIENT">Patient</mat-option>
                  <mat-option value="ADMIN">Administrateur</mat-option>
                </mat-select>
                <mat-error *ngIf="registerForm.get('role')?.hasError('required')">
                  Le rôle est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Mot de passe</mat-label>
                <input matInput
                       [type]="showPassword ? 'text' : 'password'"
                       formControlName="password">
                <button mat-icon-button matSuffix type="button"
                        (click)="showPassword = !showPassword">
                  <mat-icon>{{ showPassword ? 'visibility_off' : 'visibility' }}</mat-icon>
                </button>
                <mat-error *ngIf="registerForm.get('password')?.hasError('required')">
                  Le mot de passe est requis
                </mat-error>
                <mat-error *ngIf="registerForm.get('password')?.hasError('minlength')">
                  Minimum 8 caractères
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Confirmer le mot de passe</mat-label>
                <input matInput
                       [type]="showPassword ? 'text' : 'password'"
                       formControlName="confirmPassword">
                <mat-error *ngIf="registerForm.get('confirmPassword')?.hasError('required')">
                  Confirmation requise
                </mat-error>
                <mat-error *ngIf="registerForm.hasError('passwordMismatch')">
                  Les mots de passe ne correspondent pas
                </mat-error>
              </mat-form-field>
            </div>

            <button mat-raised-button color="primary"
                    type="submit"
                    [disabled]="registerForm.invalid || isLoading"
                    class="submit-btn full-col">
              <mat-spinner diameter="20" *ngIf="isLoading"></mat-spinner>
              <span *ngIf="!isLoading">S'inscrire</span>
            </button>
          </form>
        </mat-card-content>

        <mat-card-actions>
          <p class="login-link">
            Déjà un compte ?
            <a routerLink="/auth/login">Se connecter</a>
          </p>
        </mat-card-actions>
      </mat-card>
    </div>
  `,
  styles: [`
    .register-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1a237e 0%, #0d47a1 100%);
      padding: 24px;
    }

    .register-card {
      width: 100%;
      max-width: 600px;
      border-radius: 12px;
    }

    .register-header {
      text-align: center;
      width: 100%;
      padding: 16px 0;

      .logo-icon {
        font-size: 48px;
        height: 48px;
        width: 48px;
        color: #1976d2;
      }

      h1 { font-size: 1.5rem; font-weight: 700; color: #1a237e; margin: 8px 0 4px; }
      p { color: #757575; font-size: 0.875rem; }
    }

    mat-card-content { padding: 16px 24px; }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .full-col { grid-column: 1 / -1; }

    .submit-btn {
      margin-top: 16px;
      height: 48px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    mat-card-actions {
      padding: 8px 24px 16px;
      text-align: center;
    }

    .login-link {
      color: #757575;
      font-size: 0.875rem;
      a { color: #1976d2; font-weight: 500; }
    }
  `]
})
export class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  isLoading = false;
  showPassword = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      role: ['MEDECIN', Validators.required],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(control: AbstractControl): { [key: string]: boolean } | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password !== confirmPassword ? { passwordMismatch: true } : null;
  }

  onSubmit(): void {
    if (this.registerForm.valid) {
      this.isLoading = true;
      const { confirmPassword, ...request } = this.registerForm.value;
      this.authService.register(request).subscribe({
        next: () => {
          this.notification.success('Compte créé avec succès !');
          this.router.navigate(['/dashboard']);
        },
        error: (err) => {
          this.notification.error(err.message || 'Erreur lors de la création du compte');
          this.isLoading = false;
        }
      });
    }
  }
}
