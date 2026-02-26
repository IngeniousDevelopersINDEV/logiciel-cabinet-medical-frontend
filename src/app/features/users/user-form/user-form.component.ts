import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../user.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-user-form',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Modifier l\'utilisateur' : 'Nouvel utilisateur' }}</h1>
        <button mat-stroked-button routerLink="/users"><mat-icon>arrow_back</mat-icon> Retour</button>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <form [formGroup]="userForm" (ngSubmit)="onSubmit()">
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Prénom *</mat-label>
                <input matInput formControlName="prenom">
                <mat-error>Prénom requis</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Nom *</mat-label>
                <input matInput formControlName="nom">
                <mat-error>Nom requis</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Email *</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-error *ngIf="userForm.get('email')?.hasError('required')">Email requis</mat-error>
                <mat-error *ngIf="userForm.get('email')?.hasError('email')">Format invalide</mat-error>
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="telephone">
              </mat-form-field>
              <mat-form-field appearance="outline">
                <mat-label>Rôle *</mat-label>
                <mat-select formControlName="role">
                  <mat-option value="ADMIN">Administrateur</mat-option>
                  <mat-option value="MEDECIN">Médecin</mat-option>
                  <mat-option value="SECRETAIRE">Secrétaire</mat-option>
                  <mat-option value="PATIENT">Patient</mat-option>
                </mat-select>
                <mat-error>Rôle requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" *ngIf="!isEditMode">
                <mat-label>Mot de passe *</mat-label>
                <input matInput type="password" formControlName="password">
                <mat-error>Mot de passe requis (min 8 caractères)</mat-error>
              </mat-form-field>

              <div class="checkbox-field">
                <mat-checkbox formControlName="actif">Compte actif</mat-checkbox>
              </div>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/users">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="userForm.invalid || isSaving">
                <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
                <span *ngIf="!isSaving">{{ isEditMode ? 'Mettre à jour' : 'Créer' }}</span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <ng-template #loading>
        <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; button { display: flex; align-items: center; gap: 8px; } }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .checkbox-field { display: flex; align-items: center; padding: 8px 0; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; button { display: flex; align-items: center; gap: 8px; min-width: 120px; justify-content: center; } }
    .loading-state { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class UserFormComponent implements OnInit {
  userForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  userId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.userId = +id;
      this.loadUser(this.userId);
    }
  }

  initForm(): void {
    this.userForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      telephone: [''],
      role: ['MEDECIN', Validators.required],
      password: [''],
      actif: [true]
    });

    if (!this.isEditMode) {
      this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
    }
  }

  loadUser(id: number): void {
    this.isLoading = true;
    this.userService.getById(id).subscribe({
      next: (u) => { this.userForm.patchValue(u); this.isLoading = false; },
      error: () => { this.notification.error('Utilisateur non trouvé'); this.router.navigate(['/users']); }
    });
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      this.isSaving = true;
      const data = this.userForm.value;
      const request = this.isEditMode
        ? this.userService.update(this.userId!, data)
        : this.userService.create(data);

      request.subscribe({
        next: () => {
          this.notification.success(this.isEditMode ? 'Utilisateur mis à jour' : 'Utilisateur créé');
          this.router.navigate(['/users']);
        },
        error: (err) => { this.notification.error(err.message); this.isSaving = false; }
      });
    }
  }
}
