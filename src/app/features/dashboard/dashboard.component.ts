import { Component, OnInit } from '@angular/core';
import { DashboardService, DashboardStats } from './dashboard.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-dashboard',
  template: `
    <div class="dashboard">
      <div class="page-header">
        <h1 class="page-title">Tableau de bord</h1>
        <p class="welcome-text">Bienvenue, {{ currentUser?.prenom }} {{ currentUser?.nom }}</p>
      </div>

      <!-- Stats Cards -->
      <div class="stats-grid">
        <mat-card class="stat-card patients">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>people</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.totalPatients || 0 }}</span>
              <span class="stat-label">Total Patients</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card consultations">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>medical_services</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.consultationsAujourdhui || 0 }}</span>
              <span class="stat-label">Consultations Aujourd'hui</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card appointments">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>calendar_today</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.rendezVousAujourdhui || 0 }}</span>
              <span class="stat-label">Rendez-vous Aujourd'hui</span>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card prescriptions">
          <mat-card-content>
            <div class="stat-icon">
              <mat-icon>description</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats?.prescriptionsActives || 0 }}</span>
              <span class="stat-label">Prescriptions Actives</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- Quick Actions -->
      <div class="quick-actions">
        <h2>Actions Rapides</h2>
        <div class="actions-grid">
          <button mat-raised-button color="primary" routerLink="/patients/new">
            <mat-icon>person_add</mat-icon>
            Nouveau Patient
          </button>
          <button mat-raised-button color="accent" routerLink="/consultations/new">
            <mat-icon>add_circle</mat-icon>
            Nouvelle Consultation
          </button>
          <button mat-raised-button routerLink="/appointments/new">
            <mat-icon>event</mat-icon>
            Nouveau Rendez-vous
          </button>
          <button mat-raised-button routerLink="/prescriptions/new">
            <mat-icon>note_add</mat-icon>
            Nouvelle Prescription
          </button>
        </div>
      </div>

      <!-- Recent Consultations -->
      <mat-card class="recent-card">
        <mat-card-header>
          <mat-card-title>Consultations Récentes</mat-card-title>
          <div class="card-actions">
            <a mat-button routerLink="/consultations">Voir tout</a>
          </div>
        </mat-card-header>
        <mat-card-content>
          <div class="table-container" *ngIf="!isLoading; else loading">
            <table mat-table [dataSource]="recentConsultations" *ngIf="recentConsultations.length > 0">
              <ng-container matColumnDef="patient">
                <th mat-header-cell *matHeaderCellDef>Patient</th>
                <td mat-cell *matCellDef="let c">{{ c.patientNom }}</td>
              </ng-container>
              <ng-container matColumnDef="medecin">
                <th mat-header-cell *matHeaderCellDef>Médecin</th>
                <td mat-cell *matCellDef="let c">{{ c.medecinNom }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let c">{{ c.dateConsultation | date:'dd/MM/yyyy HH:mm' }}</td>
              </ng-container>
              <ng-container matColumnDef="motif">
                <th mat-header-cell *matHeaderCellDef>Motif</th>
                <td mat-cell *matCellDef="let c">{{ c.motif }}</td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let c">
                  <span class="badge" [class]="getStatutClass(c.statut)">{{ c.statut }}</span>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  class="table-row"
                  [routerLink]="['/consultations', row.id]"></tr>
            </table>

            <div class="empty-state" *ngIf="recentConsultations.length === 0">
              <mat-icon>medical_services</mat-icon>
              <p>Aucune consultation récente</p>
            </div>
          </div>
          <ng-template #loading>
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          </ng-template>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .dashboard { padding: 0; }

    .page-header {
      margin-bottom: 24px;
      .page-title { margin-bottom: 4px; }
      .welcome-text { color: #757575; }
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;

      @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); }
      @media (max-width: 600px) { grid-template-columns: 1fr; }
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 16px;
      padding: 20px;
    }

    .stat-icon {
      width: 56px;
      height: 56px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    }

    .stat-info {
      display: flex;
      flex-direction: column;
      .stat-value { font-size: 2rem; font-weight: 700; line-height: 1; }
      .stat-label { font-size: 0.8rem; color: #757575; margin-top: 4px; }
    }

    .stat-card.patients .stat-icon { background: #1976d2; }
    .stat-card.consultations .stat-icon { background: #43a047; }
    .stat-card.appointments .stat-icon { background: #f57c00; }
    .stat-card.prescriptions .stat-icon { background: #7b1fa2; }

    .quick-actions {
      margin-bottom: 24px;
      h2 { font-size: 1.25rem; margin-bottom: 12px; }
    }

    .actions-grid {
      display: flex;
      gap: 12px;
      flex-wrap: wrap;
      button {
        display: flex;
        align-items: center;
        gap: 8px;
      }
    }

    .recent-card mat-card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .card-actions { margin-left: auto; }

    .table-row { cursor: pointer; }
    .table-row:hover { background: #f5f5f5; }

    .loading-state {
      display: flex;
      justify-content: center;
      padding: 32px;
    }

    .badge {
      padding: 2px 8px;
      border-radius: 100px;
      font-size: 0.75rem;
      font-weight: 500;
    }

    .badge-TERMINEE { background: rgba(76, 175, 80, 0.15); color: #2e7d32; }
    .badge-EN_COURS { background: rgba(33, 150, 243, 0.15); color: #1565c0; }
    .badge-PLANIFIEE { background: rgba(255, 152, 0, 0.15); color: #e65100; }
    .badge-ANNULEE { background: rgba(244, 67, 54, 0.15); color: #c62828; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  recentConsultations: any[] = [];
  isLoading = false;
  currentUser: User | null = null;
  displayedColumns = ['patient', 'medecin', 'date', 'motif', 'statut'];

  constructor(
    private dashboardService: DashboardService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.currentUser;
    this.loadData();
  }

  loadData(): void {
    this.isLoading = true;
    this.dashboardService.getStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: () => {
        this.stats = {
          totalPatients: 0,
          consultationsAujourdhui: 0,
          rendezVousAujourdhui: 0,
          prescriptionsActives: 0,
          consultationsSemaine: 0,
          nouveauxPatientsMois: 0
        };
        this.isLoading = false;
      }
    });

    this.dashboardService.getConsultationsRecentes().subscribe({
      next: (data) => this.recentConsultations = data,
      error: () => this.recentConsultations = []
    });
  }

  getStatutClass(statut: string): string {
    return `badge-${statut}`;
  }
}
