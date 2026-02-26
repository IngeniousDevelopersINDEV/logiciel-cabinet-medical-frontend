import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConsultationService } from '../consultation.service';
import { Consultation } from '../../../models/consultation.model';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-consultation-detail',
  template: `
    <div class="page-container" *ngIf="!isLoading; else loading">
      <div class="page-header" *ngIf="consultation">
        <div>
          <h1 class="page-title">Consultation du {{ consultation.dateConsultation | date:'dd/MM/yyyy' }}</h1>
          <span class="badge" [class]="getStatutClass(consultation.statut)">
            {{ getStatutLabel(consultation.statut) }}
          </span>
        </div>
        <div class="header-actions">
          <button mat-stroked-button routerLink="/consultations">
            <mat-icon>arrow_back</mat-icon>
            Retour
          </button>
          <button mat-raised-button color="accent" [routerLink]="['/consultations', consultation.id, 'edit']">
            <mat-icon>edit</mat-icon>
            Modifier
          </button>
          <button mat-raised-button color="warn" (click)="deleteConsultation()">
            <mat-icon>delete</mat-icon>
            Supprimer
          </button>
        </div>
      </div>

      <div class="detail-grid" *ngIf="consultation">
        <mat-card>
          <mat-card-header>
            <mat-card-title>Informations Générales</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item">
                <label>Patient</label>
                <span>{{ consultation.patientNom }}</span>
              </div>
              <div class="info-item">
                <label>Médecin</label>
                <span>{{ consultation.medecinNom }}</span>
              </div>
              <div class="info-item">
                <label>Date</label>
                <span>{{ consultation.dateConsultation | date:'dd/MM/yyyy HH:mm' }}</span>
              </div>
              <div class="info-item">
                <label>Statut</label>
                <span>{{ getStatutLabel(consultation.statut) }}</span>
              </div>
              <div class="info-item full-width">
                <label>Motif</label>
                <span>{{ consultation.motif }}</span>
              </div>
              <div class="info-item full-width">
                <label>Symptômes</label>
                <span>{{ consultation.symptomes || '-' }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header>
            <mat-card-title>Bilan Clinique</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item" *ngIf="consultation.tensionArterielle">
                <label>Tension artérielle</label>
                <span>{{ consultation.tensionArterielle }}</span>
              </div>
              <div class="info-item" *ngIf="consultation.temperature">
                <label>Température</label>
                <span>{{ consultation.temperature }}°C</span>
              </div>
              <div class="info-item" *ngIf="consultation.pouls">
                <label>Pouls</label>
                <span>{{ consultation.pouls }} bpm</span>
              </div>
              <div class="info-item" *ngIf="consultation.poids">
                <label>Poids</label>
                <span>{{ consultation.poids }} kg</span>
              </div>
              <div class="info-item" *ngIf="consultation.taille">
                <label>Taille</label>
                <span>{{ consultation.taille }} cm</span>
              </div>
              <div class="info-item full-width">
                <label>Diagnostic</label>
                <span>{{ consultation.diagnostic || '-' }}</span>
              </div>
              <div class="info-item full-width">
                <label>Traitement</label>
                <span>{{ consultation.traitement || '-' }}</span>
              </div>
              <div class="info-item full-width" *ngIf="consultation.notes">
                <label>Notes</label>
                <span>{{ consultation.notes }}</span>
              </div>
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
    .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .header-actions button { display: flex; align-items: center; gap: 8px; }

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
      }
      span { font-size: 0.95rem; }
      &.full-width { grid-column: 1 / -1; }
    }

    .loading-state { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class ConsultationDetailComponent implements OnInit {
  consultation: Consultation | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private consultationService: ConsultationService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) this.loadConsultation(+id);
  }

  loadConsultation(id: number): void {
    this.isLoading = true;
    this.consultationService.getById(id).subscribe({
      next: (c) => { this.consultation = c; this.isLoading = false; },
      error: () => {
        this.notification.error('Consultation non trouvée');
        this.router.navigate(['/consultations']);
      }
    });
  }

  getStatutLabel(statut: string): string {
    const labels: Record<string, string> = {
      PLANIFIEE: 'Planifiée', EN_COURS: 'En cours',
      TERMINEE: 'Terminée', ANNULEE: 'Annulée'
    };
    return labels[statut] || statut;
  }

  getStatutClass(statut: string): string {
    const classes: Record<string, string> = {
      TERMINEE: 'badge-success', EN_COURS: 'badge-info',
      PLANIFIEE: 'badge-warning', ANNULEE: 'badge-danger'
    };
    return classes[statut] || 'badge-secondary';
  }

  deleteConsultation(): void {
    if (!this.consultation) return;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Supprimer la consultation',
        message: 'Êtes-vous sûr de vouloir supprimer cette consultation ?',
        type: 'warning',
        confirmText: 'Supprimer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && this.consultation) {
        this.consultationService.delete(this.consultation.id).subscribe({
          next: () => {
            this.notification.success('Consultation supprimée');
            this.router.navigate(['/consultations']);
          },
          error: (err) => this.notification.error(err.message)
        });
      }
    });
  }
}
