import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ReportService } from '../report.service';
import { PatientService } from '../../patients/patient.service';
import { Patient } from '../../../models/patient.model';
import { NotificationService } from '../../../core/services/notification.service';

@Component({
  selector: 'app-medical-report',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Rapport Médical</h1>
        <div class="header-actions">
          <mat-form-field appearance="outline">
            <mat-label>Sélectionner un patient</mat-label>
            <mat-select [(ngModel)]="selectedPatientId" (ngModelChange)="loadReport()">
              <mat-option *ngFor="let p of patients" [value]="p.id">{{ p.prenom }} {{ p.nom }}</mat-option>
            </mat-select>
          </mat-form-field>
          <button mat-raised-button color="primary" (click)="exportPDF()" [disabled]="!report">
            <mat-icon>picture_as_pdf</mat-icon>
            Exporter PDF
          </button>
        </div>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!isLoading && report" class="report-content" id="report-content">
        <mat-card class="report-header-card">
          <mat-card-content>
            <div class="report-title">
              <mat-icon>local_hospital</mat-icon>
              <div>
                <h2>Dossier Médical</h2>
                <p>Cabinet Médical - {{ today | date:'dd/MM/yyyy' }}</p>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="report.patient">
          <mat-card-header><mat-card-title>Patient</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="info-grid">
              <div class="info-item"><label>Nom</label><span>{{ report.patient.prenom }} {{ report.patient.nom }}</span></div>
              <div class="info-item"><label>Date de naissance</label><span>{{ report.patient.dateNaissance | date:'dd/MM/yyyy' }}</span></div>
              <div class="info-item"><label>N° Sécu.</label><span>{{ report.patient.numeroSecuriteSociale || '-' }}</span></div>
              <div class="info-item"><label>Groupe sanguin</label><span>{{ report.patient.groupeSanguin || '-' }}</span></div>
              <div class="info-item full-width"><label>Allergies</label><span>{{ report.patient.allergies || 'Aucune' }}</span></div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="report.consultations?.length">
          <mat-card-header><mat-card-title>Historique des consultations</mat-card-title></mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="report.consultations">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let c">{{ c.dateConsultation | date:'dd/MM/yyyy' }}</td>
              </ng-container>
              <ng-container matColumnDef="motif">
                <th mat-header-cell *matHeaderCellDef>Motif</th>
                <td mat-cell *matCellDef="let c">{{ c.motif }}</td>
              </ng-container>
              <ng-container matColumnDef="diagnostic">
                <th mat-header-cell *matHeaderCellDef>Diagnostic</th>
                <td mat-cell *matCellDef="let c">{{ c.diagnostic || '-' }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="consultationColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: consultationColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>

        <mat-card *ngIf="report.prescriptions?.length">
          <mat-card-header><mat-card-title>Prescriptions</mat-card-title></mat-card-header>
          <mat-card-content>
            <table mat-table [dataSource]="report.prescriptions">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let p">{{ p.datePrescription | date:'dd/MM/yyyy' }}</td>
              </ng-container>
              <ng-container matColumnDef="medicaments">
                <th mat-header-cell *matHeaderCellDef>Médicaments</th>
                <td mat-cell *matCellDef="let p">
                  <span *ngFor="let m of p.medicaments; let last = last">{{ m.nom }} ({{ m.dosage }}){{ !last ? ', ' : '' }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let p">{{ p.statut }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="prescriptionColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: prescriptionColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="!isLoading && !report && selectedPatientId" class="empty-state">
        <mat-icon>description</mat-icon>
        <p>Aucun rapport disponible pour ce patient</p>
      </div>

      <div *ngIf="!selectedPatientId" class="empty-state">
        <mat-icon>person_search</mat-icon>
        <p>Sélectionnez un patient pour voir son rapport médical</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; gap: 16px; flex-wrap: wrap; }
    .header-actions { display: flex; gap: 16px; align-items: center; flex-wrap: wrap; button { display: flex; align-items: center; gap: 8px; } }
    .loading-state { display: flex; justify-content: center; padding: 64px; }
    .report-content { display: flex; flex-direction: column; gap: 16px; }
    .report-header-card .report-title { display: flex; align-items: center; gap: 16px; mat-icon { font-size: 48px; height: 48px; width: 48px; color: #1976d2; } h2 { margin: 0; } p { color: #757575; margin: 4px 0 0; } }
    .info-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; padding: 8px 0; }
    .info-item { display: flex; flex-direction: column; gap: 4px; label { font-size: 0.75rem; font-weight: 600; color: #757575; text-transform: uppercase; } &.full-width { grid-column: 1 / -1; } }
    table.mat-mdc-table { width: 100%; }
  `]
})
export class MedicalReportComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatientId: number | null = null;
  report: any = null;
  isLoading = false;
  today = new Date();
  consultationColumns = ['date', 'motif', 'diagnostic'];
  prescriptionColumns = ['date', 'medicaments', 'statut'];

  constructor(
    private reportService: ReportService,
    private patientService: PatientService,
    private route: ActivatedRoute,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPatients();
    const id = this.route.snapshot.queryParams['patientId'];
    if (id) {
      this.selectedPatientId = +id;
      this.loadReport();
    }
  }

  loadPatients(): void {
    this.patientService.getAll({ size: 200 }).subscribe({
      next: (r) => this.patients = r.content || [],
      error: () => this.patients = []
    });
  }

  loadReport(): void {
    if (!this.selectedPatientId) return;
    this.isLoading = true;
    this.reportService.getMedicalReport(this.selectedPatientId).subscribe({
      next: (r) => { this.report = r; this.isLoading = false; },
      error: () => { this.report = null; this.isLoading = false; }
    });
  }

  exportPDF(): void {
    this.notification.info('Export PDF en cours de développement');
  }
}
