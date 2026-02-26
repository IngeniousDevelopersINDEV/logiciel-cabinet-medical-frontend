import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PrescriptionService } from '../prescription.service';
import { Prescription } from '../../../models/prescription.model';
import { NotificationService } from '../../../core/services/notification.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-prescription-detail',
  template: `
    <div class="page-container" *ngIf="!isLoading; else loading">
      <div class="page-header" *ngIf="prescription">
        <div>
          <h1 class="page-title">Prescription du {{ prescription.datePrescription | date:'dd/MM/yyyy' }}</h1>
          <span class="badge" [class]="getStatutClass(prescription.statut)">{{ getStatutLabel(prescription.statut) }}</span>
        </div>
        <div class="header-actions">
          <button mat-stroked-button routerLink="/prescriptions"><mat-icon>arrow_back</mat-icon> Retour</button>
          <button mat-raised-button color="accent" [routerLink]="['/prescriptions', prescription.id, 'edit']">
            <mat-icon>edit</mat-icon> Modifier
          </button>
          <button mat-raised-button color="warn" (click)="deletePrescription()">
            <mat-icon>delete</mat-icon> Supprimer
          </button>
        </div>
      </div>

      <div class="detail-grid" *ngIf="prescription">
        <mat-card>
          <mat-card-header><mat-card-title>Informations</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item"><label>Patient</label><span>{{ prescription.patientNom }}</span></div>
              <div class="info-item"><label>Médecin</label><span>{{ prescription.medecinNom }}</span></div>
              <div class="info-item"><label>Date prescription</label><span>{{ prescription.datePrescription | date:'dd/MM/yyyy' }}</span></div>
              <div class="info-item"><label>Date expiration</label><span>{{ prescription.dateExpiration | date:'dd/MM/yyyy' }}</span></div>
              <div class="info-item full-width" *ngIf="prescription.notes">
                <label>Notes</label><span>{{ prescription.notes }}</span>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Médicaments</mat-card-title></mat-card-header>
          <mat-card-content>
            <div *ngFor="let med of prescription.medicaments; let i = index" class="medication-item">
              <div class="med-header">
                <strong>{{ i + 1 }}. {{ med.nom }}</strong>
              </div>
              <div class="med-details">
                <span><strong>Dosage:</strong> {{ med.dosage }}</span>
                <span><strong>Fréquence:</strong> {{ med.frequence }}</span>
                <span><strong>Durée:</strong> {{ med.duree }}</span>
              </div>
              <p *ngIf="med.instructions" class="med-instructions">{{ med.instructions }}</p>
              <mat-divider *ngIf="i < prescription.medicaments.length - 1"></mat-divider>
            </div>
          </mat-card-content>
        </mat-card>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
    </ng-template>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
    .header-actions { display: flex; gap: 8px; flex-wrap: wrap; }
    .header-actions button { display: flex; align-items: center; gap: 8px; }
    .detail-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; @media (max-width: 960px) { grid-template-columns: 1fr; } }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 8px 0; }
    .info-item { display: flex; flex-direction: column; gap: 4px; label { font-size: 0.75rem; font-weight: 600; color: #757575; text-transform: uppercase; } &.full-width { grid-column: 1 / -1; } }
    .medication-item { padding: 12px 0; }
    .med-header { margin-bottom: 8px; }
    .med-details { display: flex; gap: 16px; flex-wrap: wrap; font-size: 0.875rem; }
    .med-instructions { font-style: italic; color: #757575; margin-top: 4px; font-size: 0.875rem; }
    .loading-state { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class PrescriptionDetailComponent implements OnInit {
  prescription: Prescription | null = null;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private prescriptionService: PrescriptionService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.params['id'];
    if (id) this.loadPrescription(+id);
  }

  loadPrescription(id: number): void {
    this.isLoading = true;
    this.prescriptionService.getById(id).subscribe({
      next: (p) => { this.prescription = p; this.isLoading = false; },
      error: () => { this.notification.error('Prescription non trouvée'); this.router.navigate(['/prescriptions']); }
    });
  }

  getStatutLabel(statut: string): string {
    return { ACTIVE: 'Active', TERMINEE: 'Terminée', ANNULEE: 'Annulée', EN_ATTENTE: 'En attente' }[statut] || statut;
  }

  getStatutClass(statut: string): string {
    return { ACTIVE: 'badge-success', TERMINEE: 'badge-secondary', ANNULEE: 'badge-danger', EN_ATTENTE: 'badge-warning' }[statut] || 'badge-secondary';
  }

  deletePrescription(): void {
    if (!this.prescription) return;
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title: 'Supprimer', message: 'Supprimer cette prescription ?', type: 'warning', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result && this.prescription) {
        this.prescriptionService.delete(this.prescription.id).subscribe({
          next: () => { this.notification.success('Prescription supprimée'); this.router.navigate(['/prescriptions']); },
          error: (err) => this.notification.error(err.message)
        });
      }
    });
  }
}
