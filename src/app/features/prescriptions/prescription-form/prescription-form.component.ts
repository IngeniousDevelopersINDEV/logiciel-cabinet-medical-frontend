import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionService } from '../prescription.service';
import { PatientService } from '../../patients/patient.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Patient } from '../../../models/patient.model';

@Component({
  selector: 'app-prescription-form',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Modifier la prescription' : 'Nouvelle prescription' }}</h1>
        <button mat-stroked-button routerLink="/prescriptions"><mat-icon>arrow_back</mat-icon> Retour</button>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <form [formGroup]="prescriptionForm" (ngSubmit)="onSubmit()">
            <h3>Informations Générales</h3>
            <div class="form-grid">
              <mat-form-field appearance="outline">
                <mat-label>Patient *</mat-label>
                <mat-select formControlName="patientId">
                  <mat-option *ngFor="let p of patients" [value]="p.id">{{ p.prenom }} {{ p.nom }}</mat-option>
                </mat-select>
                <mat-error>Patient requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date prescription *</mat-label>
                <input matInput [matDatepicker]="picker" formControlName="datePrescription">
                <mat-datepicker-toggle matSuffix [for]="picker"></mat-datepicker-toggle>
                <mat-datepicker #picker></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date expiration</mat-label>
                <input matInput [matDatepicker]="picker2" formControlName="dateExpiration">
                <mat-datepicker-toggle matSuffix [for]="picker2"></mat-datepicker-toggle>
                <mat-datepicker #picker2></mat-datepicker>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Statut</mat-label>
                <mat-select formControlName="statut">
                  <mat-option value="ACTIVE">Active</mat-option>
                  <mat-option value="EN_ATTENTE">En attente</mat-option>
                  <mat-option value="TERMINEE">Terminée</mat-option>
                  <mat-option value="ANNULEE">Annulée</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="2"></textarea>
              </mat-form-field>
            </div>

            <mat-divider class="section-divider"></mat-divider>
            <div class="medications-header">
              <h3>Médicaments</h3>
              <button mat-stroked-button type="button" (click)="addMedicament()">
                <mat-icon>add</mat-icon> Ajouter un médicament
              </button>
            </div>

            <div formArrayName="medicaments">
              <mat-card class="med-card" *ngFor="let med of medicaments.controls; let i = index" [formGroupName]="i">
                <mat-card-header>
                  <mat-card-title>Médicament {{ i + 1 }}</mat-card-title>
                  <button mat-icon-button color="warn" type="button" (click)="removeMedicament(i)"
                          *ngIf="medicaments.length > 1">
                    <mat-icon>delete</mat-icon>
                  </button>
                </mat-card-header>
                <mat-card-content>
                  <div class="form-grid">
                    <mat-form-field appearance="outline">
                      <mat-label>Nom du médicament *</mat-label>
                      <input matInput formControlName="nom">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Dosage *</mat-label>
                      <input matInput formControlName="dosage" placeholder="ex: 500mg">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Fréquence *</mat-label>
                      <input matInput formControlName="frequence" placeholder="ex: 3 fois par jour">
                    </mat-form-field>
                    <mat-form-field appearance="outline">
                      <mat-label>Durée *</mat-label>
                      <input matInput formControlName="duree" placeholder="ex: 7 jours">
                    </mat-form-field>
                    <mat-form-field appearance="outline" class="full-width">
                      <mat-label>Instructions</mat-label>
                      <textarea matInput formControlName="instructions" rows="2"
                                placeholder="ex: À prendre avec les repas"></textarea>
                    </mat-form-field>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/prescriptions">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="prescriptionForm.invalid || isSaving">
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
    h3 { font-size: 1rem; font-weight: 600; margin-bottom: 16px; color: #1976d2; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px 16px; @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .full-width { grid-column: 1 / -1; }
    .section-divider { margin: 24px 0 16px; }
    .medications-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; button { display: flex; align-items: center; gap: 8px; } }
    .med-card { margin-bottom: 16px; }
    .med-card mat-card-header { display: flex; justify-content: space-between; align-items: center; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; button { display: flex; align-items: center; gap: 8px; min-width: 120px; justify-content: center; } }
    .loading-state { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class PrescriptionFormComponent implements OnInit {
  prescriptionForm!: FormGroup;
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  prescriptionId?: number;
  patients: Patient[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private patientService: PatientService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.loadPatients();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.prescriptionId = +id;
      this.loadPrescription(this.prescriptionId);
    }

    const patientId = this.route.snapshot.queryParams['patientId'];
    if (patientId) this.prescriptionForm.patchValue({ patientId: +patientId });
  }

  initForm(): void {
    this.prescriptionForm = this.fb.group({
      patientId: ['', Validators.required],
      datePrescription: [new Date(), Validators.required],
      dateExpiration: [''],
      statut: ['ACTIVE'],
      notes: [''],
      medicaments: this.fb.array([this.createMedicamentGroup()])
    });
  }

  createMedicamentGroup(): FormGroup {
    return this.fb.group({
      nom: ['', Validators.required],
      dosage: ['', Validators.required],
      frequence: ['', Validators.required],
      duree: ['', Validators.required],
      instructions: ['']
    });
  }

  get medicaments(): FormArray {
    return this.prescriptionForm.get('medicaments') as FormArray;
  }

  addMedicament(): void {
    this.medicaments.push(this.createMedicamentGroup());
  }

  removeMedicament(index: number): void {
    this.medicaments.removeAt(index);
  }

  loadPatients(): void {
    this.patientService.getAll({ size: 100 }).subscribe({
      next: (r) => this.patients = r.content || [],
      error: () => this.patients = []
    });
  }

  loadPrescription(id: number): void {
    this.isLoading = true;
    this.prescriptionService.getById(id).subscribe({
      next: (p) => {
        this.prescriptionForm.patchValue(p);
        if (p.medicaments && p.medicaments.length > 0) {
          while (this.medicaments.length > 0) this.medicaments.removeAt(0);
          p.medicaments.forEach(m => {
            const g = this.createMedicamentGroup();
            g.patchValue(m);
            this.medicaments.push(g);
          });
        }
        this.isLoading = false;
      },
      error: () => { this.notification.error('Prescription non trouvée'); this.router.navigate(['/prescriptions']); }
    });
  }

  onSubmit(): void {
    if (this.prescriptionForm.valid) {
      this.isSaving = true;
      const data = this.prescriptionForm.value;
      const request = this.isEditMode
        ? this.prescriptionService.update(this.prescriptionId!, data)
        : this.prescriptionService.create(data);

      request.subscribe({
        next: (p) => { this.notification.success(this.isEditMode ? 'Prescription mise à jour' : 'Prescription créée'); this.router.navigate(['/prescriptions', p.id]); },
        error: (err) => { this.notification.error(err.message); this.isSaving = false; }
      });
    }
  }
}
