import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { ConsultationService } from '../consultation.service';
import { Consultation, StatutConsultation } from '../../../models/consultation.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { PageEvent } from '@angular/material/paginator';

@Component({
  selector: 'app-consultation-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Consultations</h1>
        <button mat-raised-button color="primary" routerLink="/consultations/new">
          <mat-icon>add</mat-icon>
          Nouvelle Consultation
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher</mat-label>
              <input matInput (input)="onSearch($event)" placeholder="Patient, médecin, motif...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>

            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatut" (ngModelChange)="onStatutChange()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="PLANIFIEE">Planifiée</mat-option>
                <mat-option value="EN_COURS">En cours</mat-option>
                <mat-option value="TERMINEE">Terminée</mat-option>
                <mat-option value="ANNULEE">Annulée</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-container" *ngIf="!isLoading; else loading">
            <table mat-table [dataSource]="consultations">

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

              <ng-container matColumnDef="diagnostic">
                <th mat-header-cell *matHeaderCellDef>Diagnostic</th>
                <td mat-cell *matCellDef="let c">{{ c.diagnostic || '-' }}</td>
              </ng-container>

              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let c">
                  <span class="badge" [class]="getStatutClass(c.statut)">
                    {{ getStatutLabel(c.statut) }}
                  </span>
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let c">
                  <button mat-icon-button color="primary"
                          [routerLink]="['/consultations', c.id]"
                          matTooltip="Voir détail">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent"
                          [routerLink]="['/consultations', c.id, 'edit']"
                          matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn"
                          (click)="deleteConsultation(c)"
                          matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"
                  class="table-row"
                  [routerLink]="['/consultations', row.id]"></tr>
            </table>

            <div class="empty-state" *ngIf="consultations.length === 0">
              <mat-icon>medical_services</mat-icon>
              <p>Aucune consultation trouvée</p>
            </div>
          </div>

          <ng-template #loading>
            <div class="loading-state">
              <mat-spinner diameter="40"></mat-spinner>
            </div>
          </ng-template>

          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
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
    .filters-row { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-field { min-width: 300px; }
    .table-row:hover { background: #f5f5f5; cursor: pointer; }
    .loading-state { display: flex; justify-content: center; padding: 32px; }
  `]
})
export class ConsultationListComponent implements OnInit {
  consultations: Consultation[] = [];
  isLoading = false;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  selectedStatut = '';

  displayedColumns = ['patient', 'medecin', 'date', 'motif', 'diagnostic', 'statut', 'actions'];

  private searchSubject = new Subject<string>();

  constructor(
    private consultationService: ConsultationService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 0;
      this.loadConsultations();
    });
  }

  loadConsultations(): void {
    this.isLoading = true;
    this.consultationService.getAll({
      statut: this.selectedStatut as StatutConsultation || undefined,
      page: this.currentPage,
      size: this.pageSize
    }).subscribe({
      next: (r) => {
        this.consultations = r.content || [];
        this.totalElements = r.totalElements || 0;
        this.isLoading = false;
      },
      error: () => {
        this.consultations = [];
        this.isLoading = false;
      }
    });
  }

  onSearch(event: Event): void {
    this.searchSubject.next((event.target as HTMLInputElement).value);
  }

  onStatutChange(): void {
    this.currentPage = 0;
    this.loadConsultations();
  }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadConsultations();
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

  deleteConsultation(c: Consultation): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: {
        title: 'Supprimer la consultation',
        message: 'Êtes-vous sûr de vouloir supprimer cette consultation ?',
        type: 'warning',
        confirmText: 'Supprimer'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.consultationService.delete(c.id).subscribe({
          next: () => {
            this.notification.success('Consultation supprimée');
            this.loadConsultations();
          },
          error: (err) => this.notification.error(err.message)
        });
      }
    });
  }
}
