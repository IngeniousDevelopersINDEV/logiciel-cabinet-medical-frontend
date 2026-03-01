import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultationService } from '../consultation.service';
import { PatientService } from '../../patients/patient.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Patient } from '../../../models/patient.model';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-consultation-form',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Modifier la consultation' : 'Nouvelle consultation' }}</h1>
        <button mat-stroked-button routerLink="/consultations">
          <mat-icon>arrow_back</mat-icon>
          Retour
        </button>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <form [formGroup]="consultationForm" (ngSubmit)="onSubmit()" novalidate>
            <h3>Informations Générales</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Patient *</mat-label>
                <input matInput [formControl]="patientSearchControl"
                       [matAutocomplete]="patientAuto"
                       placeholder="Rechercher un patient...">
                <mat-autocomplete #patientAuto="matAutocomplete"
                                  [displayWith]="displayPatient"
                                  (optionSelected)="onPatientSelected($event)">
                  <mat-option *ngFor="let p of filteredPatients" [value]="p">
                    {{ p.prenom }} {{ p.nom }}
                  </mat-option>
                </mat-autocomplete>
                <mat-error *ngIf="consultationForm.get('patientId')?.hasError('required')">
                  Le patient est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date de consultation *</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="dateConsultation">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
                <mat-hint>JJ/MM/AAAA</mat-hint>
                <mat-error *ngIf="consultationForm.get('dateConsultation')?.hasError('required')">
                  La date est requise
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Statut</mat-label>
                <mat-select formControlName="statut">
                  <mat-option value="PLANIFIEE">Planifiée</mat-option>
                  <mat-option value="EN_COURS">En cours</mat-option>
                  <mat-option value="TERMINEE">Terminée</mat-option>
                  <mat-option value="ANNULEE">Annulée</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Motif *</mat-label>
                <input matInput formControlName="motif" placeholder="Motif de la consultation">
                <mat-error *ngIf="consultationForm.get('motif')?.hasError('required')">
                  Le motif est requis
                </mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Symptômes</mat-label>
                <textarea matInput formControlName="symptomes" rows="3"></textarea>
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>
            <h3>Bilan Clinique</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Tension artérielle</mat-label>
                <input matInput formControlName="tensionArterielle" placeholder="120/80">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Température (°C)</mat-label>
                <input matInput type="number" formControlName="temperature" step="0.1">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Pouls (bpm)</mat-label>
                <input matInput type="number" formControlName="pouls">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Poids (kg)</mat-label>
                <input matInput type="number" formControlName="poids" step="0.1">
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Taille (cm)</mat-label>
                <input matInput type="number" formControlName="taille">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Diagnostic</mat-label>
                <textarea matInput formControlName="diagnostic" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Traitement</mat-label>
                <textarea matInput formControlName="traitement" rows="3"></textarea>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/consultations">Annuler</button>
              <button mat-raised-button color="primary" type="submit"
                      [disabled]="consultationForm.invalid || isSaving">
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
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
      button { display: flex; align-items: center; gap: 8px; }
    }
    h3 { font-size: 1rem; font-weight: 600; margin-bottom: 16px; color: #1976d2; }
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
      button { display: flex; align-items: center; gap: 8px; min-width: 120px; justify-content: center; }
    }
    .loading-state { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class ConsultationFormComponent implements OnInit, OnDestroy {
  consultationForm!: FormGroup;
  patientSearchControl = new FormControl<Patient | string>('');
  filteredPatients: Patient[] = [];
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  consultationId?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private consultationService: ConsultationService,
    private patientService: PatientService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupPatientAutocomplete();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.consultationId = +id;
      this.loadConsultation(this.consultationId);
    }

    const patientId = this.route.snapshot.queryParams['patientId'];
    if (patientId) {
      this.consultationForm.patchValue({ patientId: +patientId });
    }
  }

  setupPatientAutocomplete(): void {
    this.patientSearchControl.valueChanges.pipe(
      startWith(''),
      debounceTime(300),
      distinctUntilChanged(),
      switchMap(value => {
        const query = typeof value === 'string' ? value : '';
        return this.patientService.search(query).pipe(
          catchError(() => of<Patient[]>([]))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe(patients => {
      this.filteredPatients = patients || [];
    });
  }

  displayPatient(patient: Patient | null): string {
    return patient ? `${patient.prenom} ${patient.nom}` : '';
  }

  onPatientSelected(event: MatAutocompleteSelectedEvent): void {
    const patient: Patient = event.option.value;
    this.consultationForm.patchValue({ patientId: patient.id });
  }

  initForm(): void {
    this.consultationForm = this.fb.group({
      patientId: ['', Validators.required],
      medecinId: [''],
      dateConsultation: [new Date(), Validators.required],
      motif: ['', Validators.required],
      symptomes: [''],
      diagnostic: [''],
      traitement: [''],
      notes: [''],
      statut: ['PLANIFIEE'],
      tensionArterielle: [''],
      temperature: [''],
      pouls: [''],
      poids: [''],
      taille: ['']
    });
  }

  loadConsultation(id: number): void {
    this.isLoading = true;
    this.consultationService.getById(id).subscribe({
      next: (c) => {
        this.consultationForm.patchValue(c);
        if (c.patientId) {
          this.patientService.getById(c.patientId).subscribe({
            next: (p) => this.patientSearchControl.setValue(p, { emitEvent: false }),
            error: () => this.notification.error('Impossible de charger le patient associé')
          });
        }
        this.isLoading = false;
      },
      error: () => {
        this.notification.error('Consultation non trouvée');
        this.router.navigate(['/consultations']);
      }
    });
  }

  onSubmit(): void {
    if (this.consultationForm.valid) {
      this.isSaving = true;
      const data = this.consultationForm.value;

      const request = this.isEditMode
        ? this.consultationService.update(this.consultationId!, data)
        : this.consultationService.create(data);

      request.subscribe({
        next: (c) => {
          this.notification.success(
            this.isEditMode ? 'Consultation mise à jour' : 'Consultation créée'
          );
          this.router.navigate(['/consultations', c.id]);
        },
        error: (err) => {
          this.notification.error(err.message);
          this.isSaving = false;
        }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
