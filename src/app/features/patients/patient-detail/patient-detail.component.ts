import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { PatientService } from '../patient.service';
import { Patient } from '../../../models/patient.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-patient-detail',
  template: `
    <div class="page-container" *ngIf="!isLoading; else loading">
      <div class="page-header" *ngIf="patient">
        <div>
          <h1 class="page-title">{{ patient.prenom }} {{ patient.nom }}</h1>
          <span class="badge" [class]="patient.actif ? 'badge-success' : 'badge-danger'">
            {{ patient.actif ? 'Actif' : 'Inactif' }}
          </span>
        </div>
        <div class="header-actions">
          <button mat-stroked-button routerLink="/patients">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
          <button mat-raised-button color="accent" [routerLink]="['/patients', patient.id, 'edit']">
            <mat-icon>edit</mat-icon>
            Modifier
          </button>
          <button mat-raised-button color="warn" (click)="deletePatient()">
            <mat-icon>delete</mat-icon>
            Supprimer
          </button>
        </div>
      </div>

      <div class="detail-grid" *ngIf="patient">
        <!-- Info Personnelles -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>person</mat-icon>
            <mat-card-title>Informations Personnelles</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>Prénom</label>
                <span>{{ patient.prenom }}</span>
              </div>
              <div class="info-item">
                <label>Nom</label>
                <span>{{ patient.nom }}</span>
              </div>
              <div class="info-item">
                <label>Date de naissance</label>
                <span>{{ patient.dateNaissance | date:'dd/MM/yyyy' }}</span>
              </div>
              <div class="info-item">
                <label>Sexe</label>
                <span>{{ patient.sexe === 'M' ? 'Masculin' : patient.sexe === 'F' ? 'Féminin' : 'Autre' }}</span>
              </div>
              <div class="info-item">
                <label>Téléphone</label>
                <span>{{ patient.telephone || '-' }}</span>
              </div>
              <div class="info-item">
                <label>Email</label>
                <span>{{ patient.email || '-' }}</span>
              </div>
              <div class="info-item full-width">
                <label>Adresse</label>
                <span>{{ patient.adresse || '-' }}</span>
              </div>
              <div class="info-item">
                <label>N° Sécurité Sociale</label>
                <span>{{ patient.numeroSecuriteSociale || '-' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Infos Médicales -->
        <mat-card>
          <mat-card-header>
            <mat-icon mat-card-avatar>medical_services</mat-icon>
            <mat-card-title>Informations Médicales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>Groupe Sanguin</label>
                <span>{{ patient.groupeSanguin || '-' }}</span>
              </div>
              <div class="info-item full-width">
                <label>Allergies</label>
                <span>{{ patient.allergies || 'Aucune allergie connue' }}</span>
              </div>
              <div class="info-item full-width">
                <label>Antécédents Médicaux</label>
                <span>{{ patient.antecedentsMedicaux || 'Aucun antécédent' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Quick Actions -->
        <mat-card class="actions-card">
          <mat-card-header>
            <mat-card-title>Actions</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="action-buttons">
              <button mat-stroked-button color="primary"
                      [routerLink]="['/consultations', 'new']"
                      [queryParams]="{ patientId: patient.id }">
                <mat-icon>add</mat-icon>
                Nouvelle Consultation
              </button>
              <button mat-stroked-button color="accent"
                      [routerLink]="['/appointments', 'new']"
                      [queryParams]="{ patientId: patient.id }">
                <mat-icon>event</mat-icon>
                Nouveau Rendez-vous
              </button>
              <button mat-stroked-button
                      [routerLink]="['/prescriptions', 'new']"
                      [queryParams]="{ patientId: patient.id }">
                <mat-icon>note_add</mat-icon>
                Nouvelle Prescription
              </button>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>
    </ng-template>
  `,
  styles: [`
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 24px;
      gap: 16px;
      flex-wrap: wrap;
    }

    .header-actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      button { display: flex; align-items: center; gap: 8px; }
    }

    .detail-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;

      @media (max-width: 960px) { grid-template-columns: 1fr; }
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 16px;
      padding: 8px 0;
    }

    .info-item {
      display: flex;
      flex-direction: column;
      gap: 4px;

      label {
        font-size: 0.75rem;
        font-weight: 600;
        color: #757575;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }

      span {
        font-size: 0.95rem;
        color: #212121;
      }

      &.full-width { grid-column: 1 / -1; }
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 12px;
      button { justify-content: flex-start; gap: 8px; }
    }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 64px;
    }
  `]
})
export class PatientDetailComponent implements OnInit {
  patient: Patient | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private patientService: PatientService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) {
      this.loadPatient(+id);
    }
  }

  loadPatient(id: number): void {
    this.isLoading = true;
    this.patientService.getById(id).subscribe({
      next: (p) => {
        this.patient = p;
        this.isLoading = false;
      },
      error: () => {
        this.notification.error('Patient non trouvé');
        this.router.navigate(['/patients']);
      }
    });
  }

  deletePatient(): void {
    if (!this.patient) return;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Confirmer la suppression',
        message: `Supprimer le patient ${this.patient.prenom} ${this.patient.nom} ?`,
        type: 'warning',
        confirmText: 'Supprimer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.patient) {
        this.patientService.delete(this.patient.id).subscribe({
          next: () => {
            this.notification.success('Patient supprimé');
            this.router.navigate(['/patients']);
          },
          error: (err) => this.notification.error(err.message)
        });
      }
    });
  }
}
