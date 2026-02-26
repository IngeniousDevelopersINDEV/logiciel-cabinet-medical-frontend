import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PrescriptionService } from '../prescription.service';
import { Prescription } from '../../../models/prescription.model';
import { NotificationService } from '../../../core/services/notification.service';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';

@Component({
  selector: 'app-prescription-list',
  template: `
    <div class="page-container">
      <div class="page-header">
        <h1 class="page-title">Prescriptions</h1>
        <button mat-raised-button color="primary" routerLink="/prescriptions/new">
          <mat-icon>note_add</mat-icon>
          Nouvelle Prescription
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <div class="filters-row">
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Rechercher</mat-label>
              <input matInput (input)="onSearch($event)" placeholder="Patient, médecin...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
            <mat-form-field appearance="outline">
              <mat-label>Statut</mat-label>
              <mat-select [(ngModel)]="selectedStatut" (ngModelChange)="loadPrescriptions()">
                <mat-option value="">Tous</mat-option>
                <mat-option value="ACTIVE">Active</mat-option>
                <mat-option value="TERMINEE">Terminée</mat-option>
                <mat-option value="ANNULEE">Annulée</mat-option>
              </mat-select>
            </mat-form-field>
          </div>

          <div class="table-container" *ngIf="!isLoading; else loading">
            <table mat-table [dataSource]="prescriptions">
              <ng-container matColumnDef="patient">
                <th mat-header-cell *matHeaderCellDef>Patient</th>
                <td mat-cell *matCellDef="let p">{{ p.patientNom }}</td>
              </ng-container>
              <ng-container matColumnDef="medecin">
                <th mat-header-cell *matHeaderCellDef>Médecin</th>
                <td mat-cell *matCellDef="let p">{{ p.medecinNom }}</td>
              </ng-container>
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let p">{{ p.datePrescription | date:'dd/MM/yyyy' }}</td>
              </ng-container>
              <ng-container matColumnDef="medicaments">
                <th mat-header-cell *matHeaderCellDef>Médicaments</th>
                <td mat-cell *matCellDef="let p">{{ p.medicaments?.length || 0 }} médicament(s)</td>
              </ng-container>
              <ng-container matColumnDef="statut">
                <th mat-header-cell *matHeaderCellDef>Statut</th>
                <td mat-cell *matCellDef="let p">
                  <span class="badge" [class]="getStatutClass(p.statut)">{{ getStatutLabel(p.statut) }}</span>
                </td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef>Actions</th>
                <td mat-cell *matCellDef="let p">
                  <button mat-icon-button color="primary" [routerLink]="['/prescriptions', p.id]" matTooltip="Voir">
                    <mat-icon>visibility</mat-icon>
                  </button>
                  <button mat-icon-button color="accent" [routerLink]="['/prescriptions', p.id, 'edit']" matTooltip="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deletePrescription(p)" matTooltip="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;" class="table-row"
                  [routerLink]="['/prescriptions', row.id]"></tr>
            </table>
            <div class="empty-state" *ngIf="prescriptions.length === 0">
              <mat-icon>description</mat-icon>
              <p>Aucune prescription trouvée</p>
            </div>
          </div>
          <ng-template #loading>
            <div class="loading-state"><mat-spinner diameter="40"></mat-spinner></div>
          </ng-template>
          <mat-paginator [length]="totalElements" [pageSize]="pageSize"
                         [pageSizeOptions]="[10, 25, 50]" (page)="onPageChange($event)" showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .page-header button { display: flex; align-items: center; gap: 8px; }
    .filters-row { display: flex; gap: 16px; margin-bottom: 16px; flex-wrap: wrap; }
    .search-field { min-width: 300px; }
    .table-row:hover { background: #f5f5f5; cursor: pointer; }
    .loading-state { display: flex; justify-content: center; padding: 32px; }
  `]
})
export class PrescriptionListComponent implements OnInit {
  prescriptions: Prescription[] = [];
  isLoading = false;
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;
  selectedStatut = '';
  displayedColumns = ['patient', 'medecin', 'date', 'medicaments', 'statut', 'actions'];
  private searchSubject = new Subject<string>();

  constructor(
    private prescriptionService: PrescriptionService,
    private dialog: MatDialog,
    private notification: NotificationService
  ) {}

  ngOnInit(): void {
    this.loadPrescriptions();
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 0;
      this.loadPrescriptions();
    });
  }

  loadPrescriptions(): void {
    this.isLoading = true;
    this.prescriptionService.getAll({ page: this.currentPage, size: this.pageSize }).subscribe({
      next: (r) => { this.prescriptions = r.content || []; this.totalElements = r.totalElements || 0; this.isLoading = false; },
      error: () => { this.prescriptions = []; this.isLoading = false; }
    });
  }

  onSearch(event: Event): void { this.searchSubject.next((event.target as HTMLInputElement).value); }

  onPageChange(event: PageEvent): void {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadPrescriptions();
  }

  getStatutLabel(statut: string): string {
    return { ACTIVE: 'Active', TERMINEE: 'Terminée', ANNULEE: 'Annulée', EN_ATTENTE: 'En attente' }[statut] || statut;
  }

  getStatutClass(statut: string): string {
    return { ACTIVE: 'badge-success', TERMINEE: 'badge-secondary', ANNULEE: 'badge-danger', EN_ATTENTE: 'badge-warning' }[statut] || 'badge-secondary';
  }

  deletePrescription(p: Prescription): void {
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { title: 'Supprimer la prescription', message: 'Confirmer la suppression ?', type: 'warning', confirmText: 'Supprimer' }
    });
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.prescriptionService.delete(p.id).subscribe({
          next: () => { this.notification.success('Prescription supprimée'); this.loadPrescriptions(); },
          error: (err) => this.notification.error(err.message)
        });
      }
    });
  }
}
