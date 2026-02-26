import { Component, OnInit } from '@angular/core';
import { ReportService } from '../report.service';

@Component({
  selector: 'app-statistics',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Statistiques</h1>
        <mat-form-field appearance="outline">
          <mat-label>Période</mat-label>
          <mat-select [(ngModel)]="selectedPeriod" (ngModelChange)="loadStats()">
            <mat-option value="week">Cette semaine</mat-option>
            <mat-option value="month">Ce mois</mat-option>
            <mat-option value="quarter">Ce trimestre</mat-option>
            <mat-option value="year">Cette année</mat-option>
          </mat-select>
        </mat-form-field>
      </div>

      <div class="stats-grid" *ngIf="stats">
        <mat-card class="stat-card">
          <mat-card-header><mat-card-title>Consultations</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.totalConsultations || 0 }}</div>
            <div class="stat-sub">{{ stats.consultationsChangePct || 0 }}% vs période précédente</div>
            <mat-progress-bar mode="determinate" [value]="stats.consultationsCompletion || 0"></mat-progress-bar>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header><mat-card-title>Nouveaux Patients</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.nouveauxPatients || 0 }}</div>
            <div class="stat-sub">Patients enregistrés sur la période</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header><mat-card-title>Rendez-vous</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.totalRendezVous || 0 }}</div>
            <div class="stat-sub">{{ stats.rdvAnnulesPct || 0 }}% annulés</div>
          </mat-card-content>
        </mat-card>

        <mat-card class="stat-card">
          <mat-card-header><mat-card-title>Prescriptions</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="stat-number">{{ stats.totalPrescriptions || 0 }}</div>
            <div class="stat-sub">Prescriptions émises</div>
          </mat-card-content>
        </mat-card>
      </div>

      <div class="charts-grid" *ngIf="stats">
        <mat-card>
          <mat-card-header><mat-card-title>Consultations par Statut</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>bar_chart</mat-icon>
              <p>Graphique consultations par statut</p>
              <div class="chart-data" *ngIf="stats.consultationsByStatut">
                <div class="data-row" *ngFor="let item of stats.consultationsByStatut | keyvalue">
                  <span>{{ item.key }}</span>
                  <div class="progress-bar">
                    <div class="progress" [style.width.%]="getPercent(item.value, stats.totalConsultations)"></div>
                  </div>
                  <span>{{ item.value }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <mat-card>
          <mat-card-header><mat-card-title>Répartition par Médecin</mat-card-title></mat-card-header>
          <mat-card-content>
            <div class="chart-placeholder">
              <mat-icon>pie_chart</mat-icon>
              <p>Graphique répartition par médecin</p>
              <div class="chart-data" *ngIf="stats.consultationsByMedecin">
                <div class="data-row" *ngFor="let item of stats.consultationsByMedecin">
                  <span>{{ item.medecinNom }}</span>
                  <div class="progress-bar">
                    <div class="progress" [style.width.%]="getPercent(item.count, stats.totalConsultations)"></div>
                  </div>
                  <span>{{ item.count }}</span>
                </div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <div *ngIf="isLoading" class="loading-state">
        <mat-spinner diameter="40"></mat-spinner>
      </div>

      <div *ngIf="!isLoading && !stats" class="empty-state">
        <mat-icon>bar_chart</mat-icon>
        <p>Aucune donnée statistique disponible</p>
      </div>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; @media (max-width: 1200px) { grid-template-columns: repeat(2, 1fr); } @media (max-width: 600px) { grid-template-columns: 1fr; } }
    .stat-number { font-size: 2.5rem; font-weight: 700; color: #1976d2; line-height: 1; margin-bottom: 8px; }
    .stat-sub { font-size: 0.875rem; color: #757575; margin-bottom: 16px; }
    .charts-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; @media (max-width: 960px) { grid-template-columns: 1fr; } }
    .chart-placeholder { text-align: center; padding: 16px; mat-icon { font-size: 48px; height: 48px; width: 48px; color: #e0e0e0; } p { color: #757575; margin-bottom: 16px; } }
    .chart-data { text-align: left; }
    .data-row { display: flex; align-items: center; gap: 12px; margin-bottom: 8px; span { min-width: 100px; font-size: 0.875rem; } }
    .progress-bar { flex: 1; height: 8px; background: #e0e0e0; border-radius: 4px; overflow: hidden; }
    .progress { height: 100%; background: #1976d2; border-radius: 4px; transition: width 0.3s ease; }
    .loading-state { display: flex; justify-content: center; padding: 64px; }
  `]
})
export class StatisticsComponent implements OnInit {
  stats: any = null;
  isLoading = false;
  selectedPeriod = 'month';

  constructor(private reportService: ReportService) {}

  ngOnInit(): void { this.loadStats(); }

  loadStats(): void {
    this.isLoading = true;
    this.reportService.getStatistics({ period: this.selectedPeriod }).subscribe({
      next: (s) => { this.stats = s; this.isLoading = false; },
      error: () => { this.stats = null; this.isLoading = false; }
    });
  }

  getPercent(value: unknown, total: number): number {
    if (!total) return 0;
    return Math.round((Number(value) / total) * 100);
  }
}
