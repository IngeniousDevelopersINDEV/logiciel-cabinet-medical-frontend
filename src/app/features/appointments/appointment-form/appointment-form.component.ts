import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AppointmentService } from '../appointment.service';
import { PatientService } from '../../patients/patient.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Patient } from '../../../models/patient.model';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { Subject, of } from 'rxjs';
import { catchError, debounceTime, distinctUntilChanged, startWith, switchMap, takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-appointment-form',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">{{ isEditMode ? 'Modifier le rendez-vous' : 'Nouveau rendez-vous' }}</h1>
        <button mat-stroked-button routerLink="/appointments"><mat-icon>arrow_back</mat-icon> Retour</button>
      </div>

      <mat-card *ngIf="!isLoading; else loading">
        <mat-card-content>
          <form [formGroup]="appointmentForm" (ngSubmit)="onSubmit()">
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
                <mat-error>Patient requis</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Date & Heure *</mat-label>
                <input matInput type="datetime-local" formControlName="dateHeure">
                <mat-error>Date requise</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Durée (minutes) *</mat-label>
                <input matInput type="number" formControlName="duree" min="15" step="15">
                <mat-error>Durée requise</mat-error>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Type *</mat-label>
                <mat-select formControlName="type">
                  <mat-option value="CONSULTATION">Consultation</mat-option>
                  <mat-option value="SUIVI">Suivi</mat-option>
                  <mat-option value="URGENCE">Urgence</mat-option>
                  <mat-option value="BILAN">Bilan</mat-option>
                  <mat-option value="AUTRE">Autre</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Statut</mat-label>
                <mat-select formControlName="statut">
                  <mat-option value="PLANIFIE">Planifié</mat-option>
                  <mat-option value="CONFIRME">Confirmé</mat-option>
                  <mat-option value="ANNULE">Annulé</mat-option>
                  <mat-option value="TERMINE">Terminé</mat-option>
                  <mat-option value="ABSENT">Absent</mat-option>
                </mat-select>
              </mat-form-field>

              <mat-form-field appearance="outline">
                <mat-label>Salle</mat-label>
                <input matInput formControlName="salle" placeholder="ex: Salle 1">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Motif</mat-label>
                <input matInput formControlName="motif" placeholder="Motif du rendez-vous">
              </mat-form-field>

              <mat-form-field appearance="outline" class="full-width">
                <mat-label>Notes</mat-label>
                <textarea matInput formControlName="notes" rows="3"></textarea>
              </mat-form-field>
            </div>

            <div class="form-actions">
              <button mat-stroked-button type="button" routerLink="/appointments">Annuler</button>
              <button mat-raised-button color="primary" type="submit" [disabled]="appointmentForm.invalid || isSaving">
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
    .full-width { grid-column: 1 / -1; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 24px; padding-top: 16px; border-top: 1px solid #e0e0e0; button { display: flex; align-items: center; gap: 8px; min-width: 120px; justify-content: center; } }
    .loading-state { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class AppointmentFormComponent implements OnInit, OnDestroy {
  appointmentForm!: FormGroup;
  patientSearchControl = new FormControl<Patient | string>('');
  filteredPatients: Patient[] = [];
  isEditMode = false;
  isLoading = false;
  isSaving = false;
  appointmentId?: number;
  private destroy$ = new Subject<void>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private appointmentService: AppointmentService,
    private patientService: PatientService,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupPatientAutocomplete();

    const id = this.route.snapshot.params['id'];
    if (id) {
      this.isEditMode = true;
      this.appointmentId = +id;
      this.loadAppointment(this.appointmentId);
    }

    const patientId = this.route.snapshot.queryParams['patientId'];
    if (patientId) this.appointmentForm.patchValue({ patientId: +patientId });
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
    this.appointmentForm.patchValue({ patientId: patient.id });
  }

  initForm(): void {
    this.appointmentForm = this.fb.group({
      patientId: ['', Validators.required],
      medecinId: [''],
      dateHeure: ['', Validators.required],
      duree: [30, Validators.required],
      type: ['CONSULTATION', Validators.required],
      statut: ['PLANIFIE'],
      motif: [''],
      notes: [''],
      salle: ['']
    });
  }

  loadAppointment(id: number): void {
    this.isLoading = true;
    this.appointmentService.getById(id).subscribe({
      next: (r) => {
        this.appointmentForm.patchValue(r);
        if (r.patientId) {
          this.patientService.getById(r.patientId).subscribe({
            next: (p) => this.patientSearchControl.setValue(p, { emitEvent: false }),
            error: () => this.notification.error('Impossible de charger le patient associé')
          });
        }
        this.isLoading = false;
      },
      error: () => { this.notification.error('Rendez-vous non trouvé'); this.router.navigate(['/appointments']); }
    });
  }

  onSubmit(): void {
    if (this.appointmentForm.valid) {
      this.isSaving = true;
      const data = this.appointmentForm.value;
      const request = this.isEditMode
        ? this.appointmentService.update(this.appointmentId!, data)
        : this.appointmentService.create(data);

      request.subscribe({
        next: (r) => {
          this.notification.success(this.isEditMode ? 'Rendez-vous mis à jour' : 'Rendez-vous créé');
          this.router.navigate(['/appointments', r.id]);
        },
        error: (err) => { this.notification.error(err.message); this.isSaving = false; }
      });
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
