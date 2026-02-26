import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PatientService } from '../patient.service';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-patient-form',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Modifier le patient' : 'Nouveau patient' }}</h1>
        <button mat-stroked-button routerLink="/patients">
          <mat-icon>arrow_back</mat-icon>
          Retour
        </button>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <form [formGroup]="patientForm" (ngSubmit)="onSubmit()" novalidate>
            <h3>Informations Personnelles</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Prénom *</mat-label>
                <input matInput formControlName="prenom">
                <mat-error *ngIf="patientForm.get('prenom')?.hasError('required')">
                  Le prénom est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Nom *</mat-label>
                <input matInput formControlName="nom">
                <mat-error *ngIf="patientForm.get('nom')?.hasError('required')">
                  Le nom est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date de naissance *</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateNaissance">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-error *ngIf="patientForm.get('dateNaissance')?.hasError('required')">
                  La date de naissance est requise
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Sexe *</mat-label>
                <mat-select formControlName="sexe">
                  <mat-option value="M">Masculin</mat-option>
                  <mat-option value="F">Féminin</mat-option>
                  <mat-option value="AUTRE">Autre</mat-option>
                </mat-select>
                <mat-error *ngIf="patientForm.get('sexe')?.hasError('required')">
                  Le sexe est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Téléphone</mat-label>
                <input matInput formControlName="telephone">
                <mat-icon matSuffix>phone</mat-icon>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Email</mat-label>
                <input matInput type="email" formControlName="email">
                <mat-icon matSuffix>email</mat-icon>
                <mat-error *ngIf="patientForm.get('email')?.hasError('email')">
                  Format d'email invalide
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Adresse</mat-label>
                <textarea matInput formControlName="adresse" rows="2"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>N° Sécurité Sociale</mat-label>
                <input matInput formControlName="numeroSecuriteSociale">
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>
            <h3>Informations Médicales</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Groupe Sanguin</mat-label>
                <mat-select formControlName="groupeSanguin">
                  <mat-option value="">Non renseigné</mat-option>
                  <mat-option value="A+">A+</mat-option>
                  <mat-option value="A-">A-</mat-option>
                  <mat-option value="B+">B+</mat-option>
                  <mat-option value="B-">B-</mat-option>
                  <mat-option value="AB+">AB+</mat-option>
                  <mat-option value="AB-">AB-</mat-option>
                  <mat-option value="O+">O+</mat-option>
                  <mat-option value="O-">O-</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Allergies</mat-label>
                <textarea matInput formControlName="allergies" rows="3"
                          placeholder="Listez les allergies connues..."></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Antécédents Médicaux</mat-label>
                <textarea matInput formControlName="antecedentsMedicaux" rows="3"
                          placeholder="Listez les antécédents médicaux..."></textarea>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/patients">
                Annuler
              </button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="patientForm.invalid || isSaving">
                <mat-spinner diameter="20" *ngIf="isSaving"></mat-spinner>
                <span *ngIf="!isSaving">
                  {{ isEditMode ? 'Mettre à jour' : 'Créer le patient' }}
                </span>
              </button>
            </div>
          </form>
        </mat-card-content>
      </mat-card>

      <ng-template #loading>
        <div class="loading-state">
          <mat-spinner diameter="40"></mat-spinner>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      button { display: flex; align-items: center; gap: 8px; }
    }

    h3 {
      font-size: 1rem;
      font-weight: 600;
      margin-bottom: 16px;
      color: #1976d2;
    }

    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px 16px;
      margin-bottom: 8px;

      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .full-width { grid-column: 1 / -1; }

    .section-divider { margin: 24px 0 16px; }

    .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 24px;
      padding-top: 16px;
      border-top: 1px solid #e0e0e0;

      button {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 120px;
        justify-content: center;
      }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 64px;
    }
  `]
})
export class PatientFormComponent implements OnInit {
  patientForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  patientId?: number;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.patientId = +id;
      this.loadPatient(this.patientId);
    }
  }

  initForm(): void {
    this.patientForm = this.fb.group({
      prenom: ['', Validators.required],
      nom: ['', Validators.required],
      dateNaissance: ['', Validators.required],
      sexe: ['M', Validators.required],
      telephone: [''],
      email: ['', Validators.email],
      adresse: [''],
      numeroSecuriteSociale: [''],
      groupeSanguin: [''],
      allergies: [''],
      antecedentsMedicaux: [''],
      actif: [true]
    });
  }

  loadPatient(id: number): void {
    this.isLoading = true;
    this.patientService.getById(id).subscribe({
      next: (p) => {
        this.patientForm.patchValue(p);
        this.isLoading = false;
      },
      error: () => {
        this.notification.error('Patient non trouvé');
        this.router.navigate(['/patients']);
      }
    });
  }

  onSubmit(): void {
    if (this.patientForm.valid) {
      this.isSaving = true;
      const data = this.patientForm.value;

      const request = this.isEditMode
        ? this.patientService.update(this.patientId!, data)
        : this.patientService.create(data);

      request.subscribe({
        next: (p) => {
          this.notification.success(
            this.isEditMode ? 'Patient mis à jour' : 'Patient créé avec succès'
          );
          this.router.navigate(['/patients', p.id]);
        },
        error: (err) => {
          this.notification.error(err.message);
          this.isSaving = false;
        }
      });
    }
  }
}
